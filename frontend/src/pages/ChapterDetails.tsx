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

export function ChapterDetails() {
    const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
    const navigate = useNavigate();

    const { data: chapter, isLoading: isChapterLoading } = useChapter(bookId || "", chapterId || "");
    const { data: pages, isLoading: isPagesLoading } = usePages(chapterId || "");
    const { createPage, deletePage, updatePage, reorderPages } = usePageActions();

    const [orderedPages, setOrderedPages] = useState<Page[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'focus'>('grid');
    const [isReadingMode, setIsReadingMode] = useState(false);
    const [activePageIndex, setActivePageIndex] = useState<number>(0);

    // dnd-kit state
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
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
            if (viewMode === 'focus') {
                setActivePageIndex(orderedPages.length); // Switch to new page
            }
        } catch (error) {
            toast.error("Failed to add page");
        }
    };

    const handleDeletePage = async (pageId: string) => {
        try {
            await deletePage.mutateAsync(pageId);
            toast.success("Page deleted");
            if (viewMode === 'focus') {
                setViewMode('grid');
            }
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

    const openPageInFocus = (index: number) => {
        setActivePageIndex(index);
        setViewMode('focus');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const navigatePage = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && activePageIndex > 0) {
            setActivePageIndex(activePageIndex - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (direction === 'next' && activePageIndex < orderedPages.length - 1) {
            setActivePageIndex(activePageIndex + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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

    const activePage = orderedPages[activePageIndex];

    return (
        <div className={cn(
            "min-h-screen animate-in fade-in duration-500 font-serif transition-colors duration-500",
            viewMode === 'focus' && isReadingMode ? "bg-[#fdfbf7]" : "bg-[#f8f5f2]"
        )}>
            {/* Header */}
            <header className={cn(
                "sticky top-0 z-20 transition-all duration-300",
                viewMode === 'focus' && isReadingMode
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
                                if (viewMode === 'focus') {
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
                                onClick={() => {
                                    setViewMode('focus');
                                    if (viewMode === 'grid') setActivePageIndex(0);
                                }}
                                className={cn(
                                    "h-7 px-3 text-xs font-sans uppercase tracking-wide rounded-md transition-all",
                                    viewMode === 'focus' ? "bg-white shadow-sm text-stone-900" : "text-stone-500 hover:text-stone-900"
                                )}
                            >
                                <FileText className="mr-2 h-3 w-3" /> Focus
                            </Button>
                        </div>

                        {viewMode === 'focus' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsReadingMode(!isReadingMode)}
                                className={cn(
                                    "h-9 px-3 text-xs font-sans uppercase tracking-wide rounded-md transition-all",
                                    isReadingMode ? "text-stone-900 bg-stone-200/50" : "text-stone-500 hover:text-stone-900"
                                )}
                                title="Toggle Read-Only Mode"
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
                                            onClick={() => openPageInFocus(index)}
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


                {/* FOCUS VIEW (Single Page) */}
                {viewMode === 'focus' && activePage && (
                    <div className="flex flex-col items-center space-y-8 max-w-4xl mx-auto min-h-[calc(100vh-200px)]">

                        <div className="w-full flex items-center justify-between text-sm text-stone-400 font-sans px-4">
                            <span>Page {activePageIndex + 1} of {orderedPages.length}</span>
                            {!isReadingMode && (
                                <button
                                    onClick={() => handleDeletePage(activePage.id)}
                                    className="text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" /> Delete Page
                                </button>
                            )}
                        </div>

                        <motion.div
                            key={activePage.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                                "w-full transition-all duration-500 bg-white relative overflow-hidden",
                                isReadingMode
                                    ? "shadow-none bg-transparent"
                                    : "shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] ring-1 ring-stone-900/5 rounded-sm"
                            )}
                        >
                            <div className="absolute top-0 bottom-0 left-0 w-1 bg-stone-100/50" />

                            <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none sticky-bottom-num">
                                <span className="text-xs font-serif text-stone-300 font-medium tracking-widest">{activePageIndex + 1}</span>
                            </div>

                            <div
                                className={cn(
                                    "p-12 md:p-16 h-full",
                                    !isReadingMode && "cursor-text"
                                )}
                                onClick={() => {
                                    if (!isReadingMode) {
                                        (document.querySelector(`#page-${activePage.id} .ProseMirror`) as HTMLElement)?.focus();
                                    }
                                }}
                            >
                                <div id={`page-${activePage.id}`}>
                                    <PageEditor
                                        page={activePage}
                                        onUpdate={(content) => handleUpdatePageContent(activePage.id, content)}
                                        readOnly={isReadingMode}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Navigation Footer */}
                        <div className="flex items-center justify-between w-full max-w-[800px] px-4 pt-4 pb-20">
                            <Button
                                variant="ghost"
                                onClick={() => navigatePage('prev')}
                                disabled={activePageIndex === 0}
                                className={cn("text-stone-500 hover:text-stone-900", activePageIndex === 0 && "opacity-0 pointer-events-none")}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" /> Previous Page
                            </Button>

                            {!isReadingMode && (
                                <Button
                                    variant="outline"
                                    onClick={handleAddPage}
                                    className="border-stone-200 hover:bg-stone-50 text-stone-600"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> New Page
                                </Button>
                            )}

                            <Button
                                variant="ghost"
                                onClick={() => navigatePage('next')}
                                disabled={activePageIndex === orderedPages.length - 1}
                                className={cn("text-stone-500 hover:text-stone-900", activePageIndex === orderedPages.length - 1 && "opacity-0 pointer-events-none")}
                            >
                                Next Page <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                            </Button>
                        </div>
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
