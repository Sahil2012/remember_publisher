import { WebSocketServer, WebSocket } from 'ws';
import { DeepgramClient } from '@deepgram/sdk';
import http from 'http';
import { configDotenv } from 'dotenv';
import { verifyToken } from '@clerk/backend';
import { UsageService, UsageFeature } from "./services/UsageService.js";
import prisma from "./api/prismaClient.js";

configDotenv();

export function setupWebSocket(server: http.Server) {
    console.log('[Backend WS] Initializing WebSocket server on /api/dictate');
    const wss = new WebSocketServer({ server, path: '/api/dictate' });
    
    let deepgram: DeepgramClient;
    
    wss.on('connection', async (ws: WebSocket, req: http.IncomingMessage) => {
        console.log('[Backend WS] 🟢 New client connected to WebSocket Proxy.');

        // WebSocket upgrades bypass Express middleware, so clerkMiddleware never runs.
        // We extract the session token from the query string and verify it directly.
        let appUserId: string | null = null;
        let dictationStartTime: number | null = null;
        try {
            const url = new URL(req.url || '', `http://${req.headers.host}`);
            const token = url.searchParams.get('token');

            if (!token) {
                throw new Error('No session token provided.');
            }

            const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
            const clerkUserId = payload.sub; // Clerk user ID (authUserId in our DB)

            const user = await prisma.appUser.findUnique({ where: { authUserId: clerkUserId } });
            if (!user) throw new Error('User not found in database.');

            appUserId = user.id;
        } catch (authErr: any) {
            console.error('[Backend WS] ❌ Auth failed:', authErr.message);
            ws.send(JSON.stringify({ error: 'Unauthorized: ' + authErr.message }));
            ws.close();
            return;
        }

        try {
            // Check usage limit for Dictation
            await UsageService.checkAndIncrement(appUserId, UsageFeature.DICTATION);
            
            // Mark start time if user is allowed
            dictationStartTime = Date.now();
        } catch (error: any) {
            console.error('[Backend WS] ❌ Usage limit or subscription error:', error.message);
            ws.send(JSON.stringify({ error: error.message }));
            ws.close();
            return;
        }
        
        if (!process.env.DEEPGRAM_API_KEY) {
            console.error('[Backend WS] ❌ ERROR: DEEPGRAM_API_KEY is not set in .env!');
            ws.send(JSON.stringify({ error: 'Deepgram API key not configured on server. Please add it to backend/.env' }));
            ws.close();
            return;
        }

        if (!deepgram) {
            console.log('[Backend WS] Instantiating Deepgram Client...');
            deepgram = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY });
        }

        try {
            console.log('[Backend WS] 🔄 Opening Live stream to Deepgram (nova-2)...');
            const connection = await deepgram.listen.v1.connect({
                // @ts-ignore
                Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
                model: 'nova-2',
                language: 'en',
                smart_format: "true",
                interim_results: "true",
                dictation: "true",
                punctuate: "true",
            });

            const preBuffer: Buffer[] = [];
            let isReady = false;

            ws.on('message', (audioChunk) => {
                const chunk = audioChunk as Buffer;
                if (!isReady || !connection.socket || connection.socket.readyState !== 1) {
                    console.log(`[Backend WS] ⏳ Buffering chunk of size ${chunk.length} (Deepgram not ready yet)...`);
                    preBuffer.push(chunk);
                } else {
                    connection.socket.send(chunk);
                }
            });

            connection.on("open", () => {
                console.log('[Backend WS] 🟢 Deepgram connection successfully established.');
            });

            connection.on("message", (data: any) => {
                // Log the raw type
                if (data.type !== "Results") {
                    console.log(`[Backend WS] ℹ️ Non-result message from Deepgram: ${data.type}`);
                }
                const results = data?.channel?.alternatives?.[0];
                if (results?.transcript) {
                    console.log(`[Backend WS] 📨 Received transcript (is_final: ${data.is_final}): "${results.transcript}"`);
                }
                ws.send(JSON.stringify(data));
            });

            connection.on("error", (error: any) => {
                console.error('[Backend WS] ❌ Deepgram API error:', error);
                ws.send(JSON.stringify({ error: 'Deepgram API error: ' + error.message }));
            });

            connection.on("close", () => {
                console.log('[Backend WS] 🔴 Deepgram upstream connection closed.');
            });

            // Connect to Deepgram
            connection.connect();
            await connection.waitForOpen();
            
            // Mark ready and flush the buffer!
            isReady = true;
            console.log(`[Backend WS] 🚀 Flushing ${preBuffer.length} buffered chunks to Deepgram...`);
            for (const chunk of preBuffer) {
                connection.socket?.send(chunk);
            }
            
            ws.on('close', async () => {
                console.log('[Backend WS] 🔴 React Client disconnected from proxy. Tearing down Deepgram connection...');
                try {
                    if (connection.socket) { connection.socket.close(); }
                } catch(e) {}
                
                // Track usage
                if (dictationStartTime && appUserId) {
                    const durationSeconds = (Date.now() - dictationStartTime) / 1000;
                    console.log(`[Backend WS] ⏱️ Dictation session ended. Duration: ${durationSeconds.toFixed(2)}s`);
                    try {
                        await UsageService.addDictationTime(appUserId, durationSeconds);
                    } catch (e) {
                        console.error('[Backend WS] ❌ Error saving dictation time:', e);
                    }
                }
            });

        } catch (error) {
            console.error("[Backend WS] ❌ Failed to connect to Deepgram", error);
            ws.send(JSON.stringify({ error: 'Failed to negotiate with speech-to-text service' }));
            ws.close();
        }
    });
}
