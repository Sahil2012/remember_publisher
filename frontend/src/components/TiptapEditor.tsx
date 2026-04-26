import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { ResizableImage } from './tiptap/extensions/ResizableImage';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import FontFamily from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import { LineHeight } from './tiptap/extensions/LineHeight';
import CharacterCount from '@tiptap/extension-character-count';
import { cn } from "@/lib/utils";
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough, Quote,
    List, ListOrdered, Link as LinkIcon, Image as ImageIcon,
    Heading1, Heading2, Wand2, Plus, X,
    AlignLeft, AlignCenter, AlignRight, AlignJustify
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState, useRef } from 'react';
import { createPortal } from "react-dom";
import { useUploadFile } from "@/api/upload/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRevampText } from "@/api/revamp/hooks";
import { Loader2 } from "lucide-react";
import { useDictation } from "../hooks/useDictation";
import { GlobalAIToolbar } from "./GlobalAIToolbar";
import { useSubscription } from "@/hooks/useSubscription";
import { subscriptionModal } from "@/store/subscriptionModalStore";

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
    readOnly?: boolean;
    className?: string;
    placeholder?: string;
    onRevamp?: () => void;
    onBlur?: () => void;
    category?: "Life Story" | "Yearbook" | "Business";
    bookId: string;
}

const MAX_PAGE_HEIGHT = 900; // Simulated A4 printable height constraint inside the editor modal

export function TiptapEditor({ content, onChange, readOnly = false, className, placeholder = "Start writing...", onRevamp, onBlur, category = "Life Story", bookId }: TiptapEditorProps) {
    const { mutateAsync: uploadFile } = useUploadFile();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Layout-Aware Constraints
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const [isRewriting, setIsRewriting] = useState(false);
    const [showToneSelector, setShowToneSelector] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const revampMutation = useRevampText();
    const { data: isSubscribed } = useSubscription();

    const [interimText, setInterimText] = useState("");
    const { 
        isRecording, isPaused, errorState, 
        startRecording, pauseRecording, resumeRecording, stopRecording 
    } = useDictation(
        (transientText) => { setInterimText(transientText); },
        (finalText) => {
            if (editor) {
                setInterimText("");
                
                let textToInsert = finalText;
                let htmlToInsert = textToInsert;
                let triggerBreak = false;

                // Deepgram dictation literals fallback (sometimes outputted with dictation:true)
                htmlToInsert = htmlToInsert.replace(/<\\n\\n>/g, '<p></p>');
                htmlToInsert = htmlToInsert.replace(/<\n\n>/g, '<p></p>');
                htmlToInsert = htmlToInsert.replace(/<\\n>/g, '<br>');
                htmlToInsert = htmlToInsert.replace(/<\n>/g, '<br>');
                htmlToInsert = htmlToInsert.replace(/<period>/g, '.');
                htmlToInsert = htmlToInsert.replace(/<comma>/g, ',');
                htmlToInsert = htmlToInsert.replace(/<question_mark>/g, '?');

                // Conversational paragraph commands at the end of the phrase
                const paragraphRegex = /(?:\s+)?(?:let'?s\s+(?:do|start|create|make)\s+a\s+new\s+paragraph|let'?s\s+(?:break|break\s+down)\s+this\s+paragraph|enter\s+(?:into\s+)?(?:the\s+)?next\s+line|new\s+paragraph|next\s+paragraph|next\s+line)\s*\.?$/i;

                if (paragraphRegex.test(htmlToInsert)) {
                    htmlToInsert = htmlToInsert.replace(paragraphRegex, '') + '<p></p>';
                }
                
                // Conversational punctuation fallback
                const fullStopRegex = /\s*(?:full\s+stop|period)\s*$/i;
                if (fullStopRegex.test(htmlToInsert)) {
                    htmlToInsert = htmlToInsert.replace(fullStopRegex, '.');
                }

                if (htmlToInsert.includes('\n\n')) {
                    htmlToInsert = htmlToInsert.replace(/\n\n/g, '<p></p>');
                }

                if (htmlToInsert.trim().length > 0) {
                    editor.chain().focus().insertContent(`${htmlToInsert} `).run();
                }

                onChange(editor.getHTML());
            }
        }
    );

    const LOADING_MESSAGES = [
        "Crafting your words...",
        "Consulting the muse...",
        "Polishing the prose...",
        "Sprinkling some magic...",
    ];

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isRewriting) {
            interval = setInterval(() => {
                setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isRewriting]);

    const handleInlineRewrite = async (toneId: string) => {
        if (!editor) return;
        const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
            " "
        );
        if (!selectedText) {
            toast.error("Please select some text first.");
            return;
        }

        setIsRewriting(true);
        try {
            const revampedText = await revampMutation.mutateAsync({
                bookId,
                payload: { text: selectedText, tone: toneId, category: category || "Life Story" }
            });
            // Replace the selected content
            editor.chain().focus().insertContent(revampedText).run();
            // Trigger onChange so the parent explicitly receives the new HTML
            onChange(editor.getHTML());
            toast.success("Text rewritten successfully");
        } catch (error: any) {
            console.error("Rewrite failed:", error);
            if (error?.response?.status === 402) {
                toast.error("You have already used your complimentary session. Subscribe to continue.");
                subscriptionModal.open();
            } else {
                const errorMessage = error?.response?.data?.message || "Failed to rewrite text";
                toast.error(errorMessage);
            }
        } finally {
            setIsRewriting(false);
        }
    };

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            ResizableImage,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-luxury-gold underline cursor-pointer hover:text-luxury-gold/80 transition-colors',
                },
            }),
            Underline,
            TextStyle,
            Color,
            Highlight,
            FontFamily,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            LineHeight.configure({
                types: ['heading', 'paragraph'],
                defaultLineHeight: '1.5',
            }),
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === 'heading') {
                        return 'Title';
                    }
                    return placeholder;
                },
                includeChildren: true,
            }),
            CharacterCount.configure({
                limit: undefined, // Used for metadata if needed, no longer for blocking
            }),
        ],
        content,
        editable: !readOnly,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onBlur: () => {
            onBlur?.();
        },
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-base md:prose-lg prose-stone max-w-none focus:outline-none min-h-[150px]",
                    // We are now using global CSS (.ProseMirror h1, etc) for precise control
                    readOnly && "pointer-events-none"
                ),
            },
            handleDrop: (view, event, _slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.startsWith('image/')) {
                        event.preventDefault(); // Prevent default behavior immediately

                        // We need to calculate the position *before* the async operation
                        // or just use the current selection if we can't reliably get the drop pos?
                        // Actually, view.posAtCoords works.
                        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });

                        uploadFile(file).then(url => {
                            if (url) {
                                const { schema } = view.state;
                                const node = schema.nodes.image.create({ src: url });
                                const tr = view.state.tr.insert(coordinates?.pos ?? view.state.selection.from, node);
                                view.dispatch(tr);
                                toast.success("Image uploaded successfully");
                            }
                        }).catch(err => {
                            console.error("Failed to upload image via drop:", err);
                            toast.error("Failed to upload image via drop: " + (err instanceof Error ? err.message : "Unknown error"));
                        });

                        return true;
                    }
                }
                return false;
            },
            handlePaste: (view, event) => {
                const items = Array.from(event.clipboardData?.items || []);
                const item = items.find(item => item.type.startsWith('image'));

                if (item) {
                    const file = item.getAsFile();
                    if (file) {
                        event.preventDefault();
                        uploadFile(file).then(url => {
                            if (url) {
                                const { schema } = view.state;
                                const node = schema.nodes.image.create({ src: url });
                                const tr = view.state.tr.replaceSelectionWith(node);
                                view.dispatch(tr);
                                toast.success("Image uploaded successfully");
                            }
                        }).catch(err => {
                            console.error("Failed to upload image via paste:", err);
                            toast.error("Failed to upload image via paste: " + (err instanceof Error ? err.message : "Unknown error"));
                        });
                        return true;
                    }
                }
                return false;
            }
        },
    });

    // Layout-Aware DOM Height Observer
    useEffect(() => {
        if (!editorContainerRef.current || !editor) return;

        const checkOverflow = () => {
            // The ProseMirror instance itself is what expands. We measure the editor wrapper's scroll height.
            const proseMirrorDiv = editorContainerRef.current?.querySelector('.ProseMirror');
            if (proseMirrorDiv) {
                if (proseMirrorDiv.scrollHeight > MAX_PAGE_HEIGHT) {
                    setIsOverflowing(true);
                } else {
                    setIsOverflowing(false);
                }
            }
        };

        const resizeObserver = new ResizeObserver(() => checkOverflow());
        
        const proseMirrorDiv = editorContainerRef.current?.querySelector('.ProseMirror');
        if (proseMirrorDiv) {
            resizeObserver.observe(proseMirrorDiv);
        }

        // Tiptap explicitly updating could also change scroll content without dimension shifts
        editor.on('update', checkOverflow);

        // Initial check
        setTimeout(checkOverflow, 100);

        return () => {
            resizeObserver.disconnect();
            editor.off('update', checkOverflow);
        };
    }, [editor, content]);

    // Update content if changed externally (e.g. initial load)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Avoid loop if content is similar, simplistic check
            if (editor.getText() === "" && content === "") return;

            if (Math.abs(editor.getHTML().length - content.length) > 10) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    // Close menu when typing
    useEffect(() => {
        if (editor) {
            const handleUpdate = () => setIsMenuOpen(false);
            editor.on('selectionUpdate', handleUpdate);
            return () => {
                editor.off('selectionUpdate', handleUpdate);
            };
        }
    }, [editor]);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log("Uploading image...", file.name);
            try {
                const url = await uploadFile(file);
                console.log("Image uploaded, URL:", url);
                if (url) {
                    editor?.chain().focus().setImage({ src: url }).run();
                    toast.success("Image uploaded successfully");
                }
            } catch (error) {
                console.error("Image upload failed:", error);
                toast.error("Image upload failed: " + (error instanceof Error ? error.message : "Unknown error"));
            }
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    // Font Family Helper
    const setFont = (font: string) => {
        editor?.chain().focus().setFontFamily(font).run();
    };

    const [portalDest, setPortalDest] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // Find the portal destination on mount (after DOM is ready)
        const dest = document.getElementById("ai-toolbar-portal");
        if (dest) setPortalDest(dest);
    }, []);

    if (!editor) {
        return null;
    }

    const toolbarEl = !readOnly && (
        <GlobalAIToolbar 
            editor={editor}
            isRecording={isRecording}
            isPaused={isPaused}
            errorState={errorState}
            interimText={interimText}
            showToneSelector={showToneSelector}
            setShowToneSelector={setShowToneSelector}
            onStartDictation={startRecording}
            onPauseDictation={pauseRecording}
            onResumeDictation={resumeRecording}
            onStopDictation={stopRecording}
            onRewriteSelect={handleInlineRewrite}
            category={category}
        />
    );

    return (
        <div className="flex flex-col w-full h-full relative" ref={editorContainerRef}>
            {portalDest && createPortal(toolbarEl, portalDest)}
            
            <div className={cn(
                "relative w-full group flex-col flex transition-colors duration-300 rounded-lg",
                isOverflowing && !readOnly ? "bg-red-50/20 ring-1 ring-red-200" : "",
                className
            )}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                />

            {/* Bubble Menu for Text */}
            {editor && !readOnly && !isRewriting && (
                <BubbleMenu
                    editor={editor}
                    // @ts-ignore
                    tippyOptions={{ duration: 100, maxWidth: 600, appendTo: document.body, zIndex: 40, moveTransition: 'transform 0.2s ease-out' }}
                    className="flex items-center gap-1 p-1 rounded-md bg-stone-900 text-stone-100 shadow-xl border border-stone-800"
                    shouldShow={({ state }) => {
                        const isImageSelected = (state.selection as any).node?.type.name === 'image';
                        return !state.selection.empty && !isImageSelected;
                    }}
                >
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={cn("h-7 px-2 hover:bg-stone-700 hover:text-white transition-colors", editor.isActive('bold') ? 'bg-stone-700 text-white' : 'text-stone-300')}>
                        <Bold className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={cn("h-7 px-2 hover:bg-stone-700 hover:text-white transition-colors", editor.isActive('italic') ? 'bg-stone-700 text-white' : 'text-stone-300')}>
                        <Italic className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} className={cn("h-7 px-2 hover:bg-stone-700 hover:text-white transition-colors", editor.isActive('underline') ? 'bg-stone-700 text-white' : 'text-stone-300')}>
                        <UnderlineIcon className="w-4 h-4" />
                    </Button>

                    <div className="w-px h-4 bg-stone-700 mx-1" />

                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={cn("h-7 px-2 hover:bg-stone-700 hover:text-white transition-colors", editor.isActive('heading', { level: 1 }) ? 'bg-stone-700 text-white' : 'text-stone-300')}>
                        <Heading1 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cn("h-7 px-2 hover:bg-stone-700 hover:text-white transition-colors", editor.isActive('heading', { level: 2 }) ? 'bg-stone-700 text-white' : 'text-stone-300')}>
                        <Heading2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={cn("h-7 px-2 hover:bg-stone-700 hover:text-white transition-colors", editor.isActive('blockquote') ? 'bg-stone-700 text-white' : 'text-stone-300')}>
                        <Quote className="w-4 h-4" />
                    </Button>

                    <div className="w-px h-4 bg-stone-700 mx-1" />

                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={cn("h-7 px-2 hover:bg-stone-700 hover:text-white transition-colors", editor.isActive('bulletList') ? 'bg-stone-700 text-white' : 'text-stone-300')}>
                        <List className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={cn("h-7 px-2 hover:bg-stone-700 hover:text-white transition-colors", editor.isActive('orderedList') ? 'bg-stone-700 text-white' : 'text-stone-300')}>
                        <ListOrdered className="w-4 h-4" />
                    </Button>

                    <div className="w-px h-4 bg-stone-700 mx-1" />

                    {/* Font Selection */}
                    <div className="flex gap-0.5">
                        <Button variant="ghost" size="sm" onClick={() => setFont('serif')} className={cn("h-7 w-7 p-0 font-serif hover:bg-stone-700 hover:text-white transition-colors", editor.isActive('textStyle', { fontFamily: 'serif' }) ? 'bg-stone-700 text-white' : 'text-stone-300')}>
                            Ag
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setFont('sans-serif')} className={cn("h-7 w-7 p-0 font-sans hover:bg-stone-700 hover:text-white transition-colors", editor.isActive('textStyle', { fontFamily: 'sans-serif' }) ? 'bg-stone-700 text-white' : 'text-stone-300')}>
                            Ag
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setFont('monospace')} className={cn("h-7 w-7 p-0 font-mono hover:bg-stone-700 hover:text-white transition-colors", editor.isActive('textStyle', { fontFamily: 'monospace' }) ? 'bg-stone-700 text-white' : 'text-stone-300')}>
                            Ag
                        </Button>
                    </div>

                    <div className="w-px h-4 bg-stone-700 mx-1" />

                    {/* Text Alignment */}
                    <div className="flex gap-0.5">
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={cn("h-7 px-2 hover:bg-stone-700 hover:text-white transition-colors", editor.isActive({ textAlign: 'left' }) ? 'bg-stone-700 text-white' : 'text-stone-300')}>
                            <AlignLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={cn("h-7 px-2 hover:bg-stone-700 hover:text-white transition-colors", editor.isActive({ textAlign: 'center' }) ? 'bg-stone-700 text-white' : 'text-stone-300')}>
                            <AlignCenter className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={cn("h-7 px-2 hover:bg-stone-700 hover:text-white transition-colors", editor.isActive({ textAlign: 'right' }) ? 'bg-stone-700 text-white' : 'text-stone-300')}>
                            <AlignRight className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={cn("h-7 px-2 hover:bg-stone-700 hover:text-white transition-colors", editor.isActive({ textAlign: 'justify' }) ? 'bg-stone-700 text-white' : 'text-stone-300')}>
                            <AlignJustify className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="w-px h-4 bg-stone-700 mx-1" />

                    {/* Line Height */}
                    <div className="flex gap-0.5">
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setLineHeight('1.0').run()} className={cn("h-7 w-8 p-0 text-[10px] font-mono hover:bg-stone-700 hover:text-white transition-colors", editor.getAttributes('paragraph').lineHeight === '1.0' ? 'bg-stone-700 text-white' : 'text-stone-300')}>
                            1.0
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setLineHeight('1.5').run()} className={cn("h-7 w-8 p-0 text-[10px] font-mono hover:bg-stone-700 hover:text-white transition-colors", editor.getAttributes('paragraph').lineHeight === '1.5' ? 'bg-stone-700 text-white' : 'text-stone-300')}>
                            1.5
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setLineHeight('2.0').run()} className={cn("h-7 w-8 p-0 text-[10px] font-mono hover:bg-stone-700 hover:text-white transition-colors", editor.getAttributes('paragraph').lineHeight === '2.0' ? 'bg-stone-700 text-white' : 'text-stone-300')}>
                            2.0
                        </Button>
                    </div>
                </BubbleMenu>
            )}

            {/* Floating Menu: Expandable (+ Button) */}
            {editor && !readOnly && !isRewriting && (
                <FloatingMenu
                    editor={editor}
                    // @ts-ignore
                    tippyOptions={{ duration: 100, appendTo: document.body, zIndex: 999 }}
                    className="relative flex items-center -ml-12"
                >
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={cn(
                                "h-8 w-8 rounded-full border border-stone-300 bg-white shadow-sm text-stone-400 hover:text-stone-900 hover:border-stone-400 transition-all z-20",
                                isMenuOpen && "transform rotate-45 border-stone-800 text-stone-800"
                            )}
                        >
                            <Plus className="w-5 h-5" />
                        </Button>

                        <AnimatePresence>
                            {isMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 8, scale: 1 }}
                                    exit={{ opacity: 0, x: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="flex items-center gap-2 bg-white p-1 rounded-full border border-stone-200 shadow-lg absolute left-8 z-10 pl-3"
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => { triggerImageUpload(); setIsMenuOpen(false); }}
                                        className="h-8 w-8 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
                                        title="Add Image"
                                    >
                                        <ImageIcon className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setIsMenuOpen(false); }}
                                        className="h-8 w-8 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
                                        title="Add Title"
                                    >
                                        <Heading1 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => { editor.chain().focus().toggleBlockquote().run(); setIsMenuOpen(false); }}
                                        className="h-8 w-8 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
                                        title="Add Quote"
                                    >
                                        <Quote className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => { editor.chain().focus().toggleBulletList().run(); setIsMenuOpen(false); }}
                                        className="h-8 w-8 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors"
                                        title="Add List"
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                    <div className="w-px h-4 bg-stone-200 mx-1" />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => { onRevamp?.(); setIsMenuOpen(false); }}
                                        className="h-8 w-8 rounded-full border border-luxury-gold/30 bg-luxury-gold/10 hover:bg-luxury-gold/20 text-luxury-gold hover:text-luxury-gold transition-colors"
                                        title="Magic Revamp"
                                    >
                                        <Wand2 className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </FloatingMenu>
            )}

            {isRewriting && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px] rounded-md pointer-events-auto">
                    <Loader2 className="h-8 w-8 text-luxury-gold animate-spin mb-4" />
                    <motion.p
                        key={loadingMessageIndex}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-sm font-medium text-stone-600 font-serif italic"
                    >
                        {LOADING_MESSAGES[loadingMessageIndex]}
                    </motion.p>
                </div>
            )}

            {isOverflowing && !readOnly && (
                <div className="absolute top-2 right-2 bg-red-100 text-red-600 border border-red-200 shadow-sm text-xs font-medium px-3 py-1.5 rounded-full z-50 animate-in fade-in slide-in-from-top-2">
                    Page Overflow! (Will bleed on export)
                </div>
            )}

            <EditorContent editor={editor} className={cn("min-h-[300px] pb-8", isOverflowing && "text-red-900/40")} />
        </div>
        </div>
    );
}
