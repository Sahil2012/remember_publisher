import { useParams, useNavigate } from "react-router-dom";
import { useChapter } from "@/api/chapters/hooks/useChapterData";
import { usePages } from "@/api/pages/hooks/usePageData";
import { ArrowLeft, Plus, Eye, EyeOff, LayoutGrid, FileText, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { usePageActions } from "@/api/pages/hooks/usePageActions";
import { toast } from "sonner";
import type { Page } from "@/api/books/types";
import { TiptapEditor } from "@/components/TiptapEditor";
import { RevampService } from "@/services/revamp";

// dnd-kit imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// AutoResizeTextarea removed


// Sortable Page Card Component for Grid View
function SortablePageCard({ page, index, onDelete, onClick }: { page: Page, index: number, onDelete: (id: string) => void, onClick: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: page.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative aspect-[3/4] bg-white rounded-lg shadow-sm border border-stone-200 hover:shadow-md transition-shadow group cursor-grab active:cursor-grabbing overflow-hidden flex flex-col"
        >
            {/* Page Content Preview */}
            <div
                className="flex-1 p-6 overflow-hidden cursor-pointer"
                onClick={onClick}
            >
                <div className="absolute top-4 right-4 text-xs font-mono text-stone-300">#{index + 1}</div>
                <div
                    className="text-[10px] text-stone-500 font-serif leading-relaxed pointer-events-none select-none prose prose-stone prose-p:my-1 prose-headings:my-2 prose-p:text-[10px] prose-headings:text-xs max-w-none"
                    dangerouslySetInnerHTML={{ __html: page.textContent || "<p>Empty page...</p>" }}
                />
            </div>

            {/* Actions Footer */}
            <div className="h-10 border-t border-stone-100 flex items-center justify-between px-3 bg-stone-50/50">
                <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Page {index + 1}</div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(page.id);
                    }}
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking delete
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}

// Overlay Card for Drag Preview
function PageCardOverlay({ page, index }: { page: Page, index: number }) {
    return (
        <div className="relative aspect-[3/4] bg-white rounded-lg shadow-xl border border-stone-200 cursor-grabbing overflow-hidden flex flex-col rotate-3 scale-105">
            <div className="flex-1 p-6 overflow-hidden">
                <div className="absolute top-4 right-4 text-xs font-mono text-stone-300">#{index + 1}</div>
                <div
                    className="text-[10px] text-stone-500 font-serif leading-relaxed pointer-events-none select-none prose prose-stone prose-p:my-1 prose-headings:my-2 prose-p:text-[10px] prose-headings:text-xs max-w-none"
                    dangerouslySetInnerHTML={{ __html: page.textContent || "<p>Empty page...</p>" }}
                />
            </div>
            <div className="h-10 border-t border-stone-100 flex items-center justify-between px-3 bg-stone-50/50">
                <div className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Page {index + 1}</div>
                <div className="h-6 w-6" />
            </div>
        </div>
    );
}

import { useDragControls } from "framer-motion";

function SortableReaderPage({ page, index, isReadingMode, handleUpdatePageContent, handleDeletePage }: { page: Page, index: number, isReadingMode: boolean, handleUpdatePageContent: (id: string, content: string) => void, handleDeletePage: (id: string) => void }) {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={page}
            id={`page-${page.id}`}
            drag={!isReadingMode ? "y" : false}
            dragListener={false} // Disable default listener
            dragControls={dragControls} // Use manual controls
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            style={{ touchAction: "pan-y" }} // Allow vertical scrolling on the card
            className="relative w-full max-w-[800px] flex justify-center group"
        >
            <div className={cn(
                "w-full transition-all duration-500 bg-white relative overflow-hidden",
                isReadingMode
                    ? "shadow-none bg-transparent"
                    : "shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] ring-1 ring-stone-900/5 rounded-sm hover:shadow-lg"
            )}>

                {!isReadingMode && (
                    <div
                        className="absolute top-0 bottom-0 -left-12 w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-stone-300 hover:text-stone-500"
                        onPointerDown={(e) => dragControls.start(e)}
                    >
                        <GripVertical className="h-5 w-5" />
                    </div>
                )}

                <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none sticky-bottom-num">
                    <span className="text-xs font-serif text-stone-300 font-medium tracking-widest">{index + 1}</span>
                </div>

                <div
                    className={cn(
                        "p-12 md:p-16 h-full min-h-[600px]",
                        !isReadingMode && "cursor-text"
                    )}
                    onClick={() => {
                        if (!isReadingMode) {
                            (document.querySelector(`#page-${page.id} .ProseMirror`) as HTMLElement)?.focus();
                        }
                    }}
                >
                    <PageEditor
                        page={page}
                        onUpdate={(content) => handleUpdatePageContent(page.id, content)}
                        readOnly={isReadingMode}
                    />
                </div>
            </div>

            {!isReadingMode && (
                <div className="absolute -right-16 top-0 bottom-0 w-12 flex flex-col pt-8 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded-full transition-colors"
                        onClick={() => handleDeletePage(page.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </Reorder.Item>
    );
}

export function ChapterDetails() {
    // ... (rest of the component, just updating the map loop)
    const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
    const navigate = useNavigate();

    const { data: chapter, isLoading: isChapterLoading } = useChapter(bookId || "", chapterId || "");
    const { data: pages, isLoading: isPagesLoading } = usePages(chapterId || "");
    const { createPage, deletePage, updatePage, reorderPages } = usePageActions();

    const [orderedPages, setOrderedPages] = useState<Page[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'reader'>('grid');
    const [isReadingMode, setIsReadingMode] = useState(false);

    // dnd-kit state
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // slight movement required to start drag, prevents accidental drags on click
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (pages) {
            setOrderedPages(pages);
        }
    }, [pages]);

    const handleAddPage = async () => {
        if (!chapterId) return;
        try {
            await createPage.mutateAsync({
                chapterId,
                payload: {
                    content: {},
                    textContent: "",
                    order: (orderedPages.length) + 1
                }
            });
            toast.success("New page added");
        } catch (error) {
            toast.error("Failed to add page");
        }
    };

    const handleDeletePage = async (pageId: string) => {
        try {
            await deletePage.mutateAsync(pageId);
            toast.success("Page deleted");
        } catch (error) {
            toast.error("Failed to delete page");
        }
    };

    const handleUpdatePageContent = (pageId: string, newContent: string) => {
        updatePage.mutate({
            id: pageId,
            payload: { textContent: newContent }
        });
    };

    // Framer Motion Reorder (Reader View)
    const handleReorderList = (newOrder: Page[]) => {
        setOrderedPages(newOrder);
    };

    const handleDragEndList = () => {
        // for framer motion list
        if (!bookId || !chapterId) return;
        const updates = orderedPages.map((page, index) => ({
            id: page.id,
            order: index + 1
        }));
        reorderPages.mutate({ bookId, chapterId, pages: updates });
    };

    // dnd-kit Reorder (Grid View)
    const handleDragStartGrid = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEndGrid = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            setOrderedPages((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Trigger API update
                if (bookId && chapterId) {
                    const updates = newItems.map((p, i) => ({
                        id: p.id,
                        order: i + 1
                    }));
                    reorderPages.mutate({ bookId, chapterId, pages: updates });
                }

                return newItems;
            });
        }
    };

    const openPageInReader = (pageId: string) => {
        setViewMode('reader');
        // Wait for render then scroll
        setTimeout(() => {
            const element = document.getElementById(`page-${pageId}`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    if (isChapterLoading || isPagesLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#fdfbf7]">
                <Loader size="lg" className="animate-spin text-stone-600" />
            </div>
        );
    }

    if (!chapter) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#fdfbf7]">
                <div className="text-xl font-serif text-destructive">Chapter not found</div>
                <Button onClick={() => navigate(`/book/${bookId}`)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Book
                </Button>
            </div>
        );
    }

    return (
        <div className={cn(
            "min-h-screen animate-in fade-in duration-500 font-serif transition-colors duration-500",
            viewMode === 'reader' && isReadingMode ? "bg-[#fdfbf7]" : "bg-[#f8f5f2]"
        )}>
            {/* Header */}
            <header className={cn(
                "sticky top-0 z-20 transition-all duration-300",
                viewMode === 'reader' && isReadingMode
                    ? "bg-[#fdfbf7]/90 border-transparent h-14"
                    : "border-b border-stone-200/50 bg-[#f8f5f2]/80 h-16"
                , "backdrop-blur-md"
            )}>
                <div className="container mx-auto max-w-6xl px-8 h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (viewMode === 'reader') {
                                    setViewMode('grid');
                                } else {
                                    navigate(`/book/${bookId}`);
                                }
                            }}
                            className="text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>

                        {(!isReadingMode || viewMode === 'grid') && (
                            <h1 className="font-serif text-lg font-medium text-stone-800 truncate max-w-md animate-in fade-in slide-in-from-left-2">
                                {chapter.title}
                            </h1>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* View Toggle */}
                        <div className="flex bg-stone-200/50 p-1 rounded-lg">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "h-7 px-3 text-xs font-sans uppercase tracking-wide rounded-md transition-all",
                                    viewMode === 'grid' ? "bg-white shadow-sm text-stone-900" : "text-stone-500 hover:text-stone-900"
                                )}
                            >
                                <LayoutGrid className="mr-2 h-3 w-3" /> Grid
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('reader')}
                                className={cn(
                                    "h-7 px-3 text-xs font-sans uppercase tracking-wide rounded-md transition-all",
                                    viewMode === 'reader' ? "bg-white shadow-sm text-stone-900" : "text-stone-500 hover:text-stone-900"
                                )}
                            >
                                <FileText className="mr-2 h-3 w-3" /> Reader
                            </Button>
                        </div>

                        {viewMode === 'reader' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsReadingMode(!isReadingMode)}
                                className={cn(
                                    "h-9 px-3 text-xs font-sans uppercase tracking-wide rounded-md transition-all",
                                    isReadingMode ? "text-stone-900 bg-stone-200/50" : "text-stone-500 hover:text-stone-900"
                                )}
                            >
                                {isReadingMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-6xl px-4 py-12">

                {/* GRID VIEW (dnd-kit) */}
                {viewMode === 'grid' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full"
                    >
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-serif font-medium text-stone-900">Storyboard</h2>
                            <p className="text-stone-500 mt-2">Drag to reorder pages</p>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStartGrid}
                            onDragEnd={handleDragEndGrid}
                        >
                            <SortableContext
                                items={orderedPages.map(p => p.id)}
                                strategy={rectSortingStrategy}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {orderedPages.map((page, index) => (
                                        <SortablePageCard
                                            key={page.id}
                                            page={page}
                                            index={index}
                                            onDelete={handleDeletePage}
                                            onClick={() => openPageInReader(page.id)}
                                        />
                                    ))}

                                    {/* Placeholder Card (Static) */}
                                    <div
                                        className="aspect-[3/4] border-2 border-dashed border-stone-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-colors group"
                                        onClick={handleAddPage}
                                    >
                                        <div className="h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-stone-200 group-hover:text-stone-600 transition-colors mb-3">
                                            <Plus className="h-6 w-6" />
                                        </div>
                                        <span className="text-sm font-medium text-stone-400 group-hover:text-stone-600">Add Page</span>
                                    </div>
                                </div>
                            </SortableContext>

                            <DragOverlay>
                                {activeId ? (
                                    <PageCardOverlay
                                        page={orderedPages.find(p => p.id === activeId)!}
                                        index={orderedPages.findIndex(p => p.id === activeId)}
                                    />
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </motion.div>
                )}


                {/* READER VIEW (Framer Motion List) */}
                {viewMode === 'reader' && (
                    <div className="flex flex-col items-center space-y-12 max-w-4xl mx-auto">
                        <div className="w-full max-w-[65ch] text-center mb-8">
                            <h2 className="text-4xl md:text-5xl font-serif font-medium text-stone-900 mb-4 leading-tight">
                                {chapter.title}
                            </h2>
                            {chapter.description && (
                                <p className="text-lg text-stone-500 italic max-w-lg mx-auto leading-relaxed">
                                    {chapter.description}
                                </p>
                            )}
                            <div className="mt-8 w-12 h-1 bg-stone-200 mx-auto rounded-full" />
                        </div>

                        <Reorder.Group
                            axis="y"
                            values={orderedPages}
                            onReorder={handleReorderList}
                            className="w-full flex flex-col items-center gap-16"
                        >
                            <AnimatePresence mode="popLayout">
                                {orderedPages.map((page, index) => (
                                    <SortableReaderPage
                                        key={page.id}
                                        page={page}
                                        index={index}
                                        isReadingMode={isReadingMode}
                                        handleUpdatePageContent={handleUpdatePageContent}
                                        handleDeletePage={handleDeletePage}
                                    />
                                ))}
                            </AnimatePresence>
                        </Reorder.Group>

                        {/* Ghost Page for Reader View additions */}
                        {!isReadingMode && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="w-full max-w-[800px] group cursor-pointer pb-20"
                                onClick={handleAddPage}
                            >
                                <div className="h-24 border-2 border-dashed border-stone-200 rounded-lg flex items-center justify-center text-stone-400 group-hover:border-stone-400 group-hover:text-stone-600 transition-all bg-white/50 hover:bg-white/80">
                                    <span className="flex items-center font-serif text-lg italic">
                                        <Plus className="mr-2 h-5 w-5" />
                                        Add another page...
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

function PageEditor({ page, onUpdate, readOnly }: { page: Page, onUpdate: (content: string) => void, readOnly?: boolean }) {
    const [content, setContent] = useState(page.textContent || "");
    const [isRevamping, setIsRevamping] = useState(false);

    useEffect(() => {
        setContent(page.textContent || "");
    }, [page.textContent]);

    const handleRevamp = async () => {
        setIsRevamping(true);
        toast.info("Polishing your text with AI...", { duration: 2000 });
        try {
            // Basic revamp call - defaulting to standard/memoir for now
            const result = await RevampService.revampText(content, "Standard", "Memoir");
            setContent(result);
            onUpdate(result);
            toast.success("Text revamped successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to revamp text.");
        } finally {
            setIsRevamping(false);
        }
    };

    return (
        <TiptapEditor
            content={content}
            onChange={setContent}
            onBlur={() => {
                if (content !== page.textContent && !readOnly) {
                    onUpdate(content);
                }
            }}
            readOnly={readOnly || isRevamping}
            onRevamp={handleRevamp}
            className={cn(
                "min-h-[800px]", // Increased height (closer to A4)
                readOnly && "pointer-events-none"
            )}
            placeholder={readOnly ? "" : "The story begins..."}
        />
    );
}
