import { useState, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

export function useDictation(
  onTransientText: (text: string) => void,
  onFinalText: (text: string) => void
) {
  const { getToken } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffRef = useRef(1000);
  const isFatalErrorRef = useRef(false);

  const connectWebSocket = useCallback(async (stream: MediaStream) => {
    try {
      if (socketRef.current?.readyState === WebSocket.OPEN) return;

      const apiUrl = import.meta.env.VITE_BACKEND_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8082/api';
      const defaultWs = apiUrl.replace(/^http/, 'ws').replace(/\/api$/, '') + '/api/dictate';
      const baseWsUrl = import.meta.env.VITE_WS_URL || defaultWs;

      // Fetch a fresh Clerk session token. WebSocket upgrades bypass Express
      // middleware, so the backend cannot use clerkMiddleware — it verifies
      // the token passed as a query param instead.
      const token = await getToken();
      if (!token) {
        setErrorState('Authentication error: could not get session token.');
        return;
      }
      const wsUrl = `${baseWsUrl}?token=${encodeURIComponent(token)}`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("[Frontend Dictation] 🟢 WebSocket connection opened perfectly.");
        setIsRecording(true);
        setIsPaused(false);
        setErrorState(null);
        isFatalErrorRef.current = false;
        backoffRef.current = 1000;

        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
          console.log("[Frontend Dictation] 🎤 Initializing MediaRecorder...");
          mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
          
          mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
            if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
              console.log(`[Frontend Dictation] 📤 Sending audio packet to Backend (${event.data.size} bytes)...`);
              socketRef.current.send(event.data);
            }
          });
          
          mediaRecorderRef.current.start(250);
          console.log("[Frontend Dictation] 🎯 MediaRecorder started generating 250ms chunks.");
        }
      };

      socket.onmessage = (message) => {
        try {
          const payload = JSON.parse(message.data);
          
          if (payload.error) {
            console.error("[Frontend Dictation] ❌ Backend returned error:", payload.error);
            isFatalErrorRef.current = true;
            setErrorState(payload.error);
            // We can actively close or let the backend close it, but ensure we return.
            socketRef.current?.close();
            return;
          }

          if (payload.channel) {
            const transcript = payload.channel.alternatives?.[0]?.transcript;
            if (transcript) {
              console.log(`[Frontend Dictation] 📥 Received transcript (is_final: ${payload.is_final}): "${transcript}"`);
              if (payload.is_final) {
                onFinalText(transcript);
              } else {
                onTransientText(transcript);
              }
            }
          }
        } catch (err) {
          console.error("[Frontend Dictation] ❌ Failed to parse Deepgram message", err);
        }
      };

      socket.onclose = () => {
        console.warn("[Frontend Dictation] 🔴 WebSocket connection closed.");
        setIsRecording(false);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop();
        }

        // Auto reconnect logic if not explicitly stopped
        if (!mediaRecorderRef.current) return;
        
        // Don't auto-reconnect or overwrite the error state if it was a fatal limit/auth error
        if (isFatalErrorRef.current) {
            console.warn("[Frontend Dictation] 🛑 Fatal error occurred. Skipping auto-reconnect.");
            return;
        }

        setErrorState("Connection lost. Reconnecting...");
        reconnectTimeoutRef.current = setTimeout(() => {
           backoffRef.current = Math.min(backoffRef.current * 2, 10000);
           console.log(`[Frontend Dictation] 🔄 Reconnecting... (backoff: ${backoffRef.current}ms)`);
           connectWebSocket(stream);
        }, backoffRef.current);
      };

      socket.onerror = (err) => {
        console.error("[Frontend Dictation] ❌ WebSocket transport error:", err);
      };

    } catch (err) {
      console.error("[Frontend Dictation] ❌ WebSocket setup error:", err);
    }
  }, [onTransientText, onFinalText]);

  const startRecording = useCallback(async () => {
    try {
      console.log("[Frontend Dictation] Requesting microphone access from Browser...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("[Frontend Dictation] 🎙️ Microphone access granted!");
      await connectWebSocket(stream);
    } catch (err) {
      console.error("[Frontend Dictation] ❌ Microphone access denied:", err);
      setErrorState("Microphone access denied or error: " + err);
    }
  }, [connectWebSocket]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        console.log("[Frontend Dictation] ⏸️ Pausing MediaRecorder.");
        mediaRecorderRef.current.pause();
        setIsPaused(true);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
        console.log("[Frontend Dictation] ▶️ Resuming MediaRecorder.");
        mediaRecorderRef.current.resume();
        setIsPaused(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    console.log("[Frontend Dictation] ⏹️ Stopping dictation completely.");
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current.stream.getTracks().forEach(track => {
          track.stop();
          console.log(`[Frontend Dictation] Stopped audio track: ${track.label}`);
      });
      mediaRecorderRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsRecording(false);
    setIsPaused(false);
    setErrorState(null);
  }, []);

  return { 
      isRecording, 
      isPaused, 
      errorState, 
      startRecording, 
      pauseRecording, 
      resumeRecording, 
      stopRecording 
  };
}
