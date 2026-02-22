import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useRef, useState } from 'react';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// The React Component for the Node View
const ResizableImageComponent = (props: any) => {
    const { node, updateAttributes, selected } = props;
    const { src, alt, width, alignment } = node.attrs;
    const imageRef = useRef<HTMLImageElement>(null);
    const [isResizing, setIsResizing] = useState(false);

    // Alignment styles logic
    const isFloatLeft = alignment === 'left';
    const isFloatRight = alignment === 'right';
    const isCenter = alignment === 'center';

    const wrapperStyles: React.CSSProperties = {
        position: 'relative',
        display: isCenter ? 'flex' : 'block',
        justifyContent: isCenter ? 'center' : 'flex-start',
        float: isFloatLeft ? 'left' : isFloatRight ? 'right' : 'none',
        margin: isFloatLeft ? '0 1.5rem 1rem 0' : isFloatRight ? '0 0 1.5rem 1.5rem' : isCenter ? '1.5rem 0' : '0 1rem 1rem 0',
        clear: 'none',
        maxWidth: '100%',
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);

        const startX = e.pageX;
        const startWidth = imageRef.current?.offsetWidth || 0;

        const onMouseMove = (moveEvent: MouseEvent) => {
            requestAnimationFrame(() => {
                const currentX = moveEvent.pageX;
                const diff = currentX - startX;
                const newWidth = Math.max(100, startWidth + diff);
                updateAttributes({ width: newWidth });
            });
        };

        const onMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    return (
        <NodeViewWrapper style={wrapperStyles} className="group tiptap-image-wrapper">
            <div
                className={cn("relative rounded-xl overflow-hidden transition-all duration-200", selected ? 'ring-2 ring-luxury-gold ring-offset-2' : '')}
            >
                {/* Embedded Toolbar - Only visible when selected */}
                {selected && props.editor?.isEditable && (
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 p-1 rounded-md bg-stone-900 text-stone-100 shadow-xl border border-stone-800 z-50 transition-all opacity-90 hover:opacity-100">
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateAttributes({ alignment: 'left' }); }}
                            className={cn("h-7 px-2 rounded flex items-center justify-center hover:bg-stone-700 hover:text-white transition-colors cursor-pointer", alignment === 'left' ? 'bg-stone-700 text-white' : 'text-stone-300')}
                            title="Float Left"
                        >
                            <AlignLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateAttributes({ alignment: 'center' }); }}
                            className={cn("h-7 px-2 rounded flex items-center justify-center hover:bg-stone-700 hover:text-white transition-colors cursor-pointer", alignment === 'center' ? 'bg-stone-700 text-white' : 'text-stone-300')}
                            title="Center"
                        >
                            <AlignCenter className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateAttributes({ alignment: 'right' }); }}
                            className={cn("h-7 px-2 rounded flex items-center justify-center hover:bg-stone-700 hover:text-white transition-colors cursor-pointer", alignment === 'right' ? 'bg-stone-700 text-white' : 'text-stone-300')}
                            title="Float Right"
                        >
                            <AlignRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    ref={imageRef}
                    src={src}
                    alt={alt}
                    style={{
                        width: width ? `${width}px` : 'auto',
                        maxWidth: '100%',
                        display: 'block',
                        objectFit: 'contain'
                    }}
                    className="max-h-[600px] select-none"
                    // Important: disable native drag to prevent ghosts
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                />

                {/* Clean, neat drag handle - only visible when selected */}
                {selected && (
                    <div
                        className="absolute bottom-2 right-2 w-6 h-6 bg-white border border-stone-200 shadow-md rounded-full flex items-center justify-center cursor-nwse-resize hover:scale-110 hover:shadow-lg transition-transform active:scale-95 z-50"
                        onMouseDown={handleMouseDown}
                        // Stop propagation so ProseMirror doesn't try to select/drag the node when resizing
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                    >
                        <div className="w-2 h-2 rounded-full bg-luxury-gold" />
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
};

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        resizableImage: {
            setImage: (options: { src: string; alt?: string; title?: string }) => ReturnType;
            setImageAlignment: (alignment: 'left' | 'center' | 'right') => ReturnType;
        };
    }
}

// Ensure it extends the core Image extension for maximum compatibility
export const ResizableImage = Image.extend({
    name: 'image', // Keep the 'image' name so standard setContent/HTML parses map correctly

    // Force strictly block-level to prevent text cursor overlaps and ghosting
    group: 'block',
    inline: false,
    draggable: true,

    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                parseHTML: element => element.getAttribute('data-width') || element.style.width?.replace('px', '') || null,
            },
            alignment: {
                default: 'center', // 'left' (float), 'center' (block), 'right' (float)
                parseHTML: element => element.getAttribute('data-alignment') || 'center',
            },
        };
    },

    addCommands() {
        return {
            ...this.parent?.(),
            setImageAlignment:
                (alignment: 'left' | 'center' | 'right') =>
                    ({ commands }: { commands: any }) => {
                        return commands.updateAttributes(this.name, { alignment });
                    },
        };
    },

    renderHTML({ HTMLAttributes }) {
        const { alignment, width, ...rest } = HTMLAttributes;

        let style = '';
        if (alignment === 'center' || !alignment) {
            style += 'display: block; margin: 1.5rem auto; max-width: 100%;';
        } else if (alignment === 'left') {
            style += 'float: left; margin: 0 1.5rem 1rem 0; clear: none; max-width: 100%;';
        } else if (alignment === 'right') {
            style += 'float: right; margin: 0 0 1.5rem 1.5rem; clear: none; max-width: 100%;';
        }

        if (width) {
            style += ` width: ${width}px;`;
        }

        return ['img', mergeAttributes(this.options.HTMLAttributes, rest, {
            style,
            'data-alignment': alignment,
            'data-width': width
        })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageComponent);
    },
});
