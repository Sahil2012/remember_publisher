import { useParams, useNavigate } from "react-router-dom";
import { useChapter } from "@/api/chapters/hooks/useChapterData";
import { useBook } from "@/api/books/hooks/useBookData";
import { usePages } from "@/api/pages/hooks/usePageData";
import { ArrowLeft, Plus, Eye, EyeOff, LayoutGrid, FileText, GripVertical, Trash2, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { usePageActions } from "@/api/pages/hooks/usePageActions";
import { toast } from "sonner";
import type { Page } from "@/api/books/types";
import { TiptapEditor } from "@/components/TiptapEditor";
import { useRevampText } from "@/api/revamp/hooks";
import { MovePageModal } from "@/components/MovePageModal";

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
function SortablePageCard({ page, index, onDelete, onMove, onClick }: { page: Page, index: number, onDelete: (id: string) => void, onMove: (page: Page) => void, onClick: () => void }) {
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
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMove(page);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <ArrowRightLeft className="h-3 w-3" />
                    </Button>
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

const mapCategory = (cat: string | undefined): "Life Story" | "Yearbook" | "Business" => {
    if (!cat) return "Life Story";
    
    const normalized = cat.toUpperCase();
    switch (normalized) {
        case "MEMOIR":
        case "LIFE STORY":
        case "LIFESTORY":
        case "LIFE-STORY":
            return "Life Story";
        case "BUSINESS":
            return "Business";
        case "YEARBOOK":
            return "Yearbook";
        default:
            // Handle cases where it might already be the mapped string
            if (cat === "Life Story") return "Life Story";
            if (cat === "Business") return "Business";
            if (cat === "Yearbook") return "Yearbook";
            return "Life Story";
    }
};

export function ChapterDetails() {
    const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
    const navigate = useNavigate();

    const { data: chapter, isLoading: isChapterLoading } = useChapter(bookId || "", chapterId || "");
    const { data: pages, isLoading: isPagesLoading } = usePages(chapterId || "");
    const { createPage, deletePage, updatePage, reorderPages } = usePageActions();

    const { data: book } = useBook(bookId || "");

    const [orderedPages, setOrderedPages] = useState<Page[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'focus'>('grid');
    const [isReadingMode, setIsReadingMode] = useState(false);
    const [activePageIndex, setActivePageIndex] = useState<number>(0);

    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [pageToMove, setPageToMove] = useState<Page | null>(null);

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

    const handleMovePage = (page: Page) => {
        setPageToMove(page);
        setIsMoveModalOpen(true);
    };

    const handleConfirmMove = async (destChapterId: string) => {
        if (!pageToMove) return;
        try {
            await updatePage.mutateAsync({
                id: pageToMove.id,
                payload: { chapterId: destChapterId }
            });
            toast.success("Page moved successfully");
            setIsMoveModalOpen(false);
            if (viewMode === 'focus') {
                setViewMode('grid');
            }
        } catch (error) {
            toast.error("Failed to move page");
        }
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

    console.log(`[ChapterDetails] Book Category: ${book?.category} -> Mapped: ${mapCategory(book?.category)}`);

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
                    ? "bg-[#fdfbf7]/90 border-transparent h-12 md:h-14"
                    : "border-b border-stone-200/50 bg-[#f8f5f2]/80 h-14 md:h-16"
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
                            <h1 className="font-serif text-base md:text-lg font-medium text-stone-800 truncate max-w-[150px] md:max-w-md animate-in fade-in slide-in-from-left-2">
                                {chapter.order === -1 ? 'ScratchPad' : chapter.title}
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
                            <h2 className="text-3xl font-serif font-medium text-stone-900">
                                {chapter.order === -1 ? 'ScratchPad Pages' : 'Storyboard'}
                            </h2>
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
                                            onMove={handleMovePage}
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
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleMovePage(activePage)}
                                        className="text-stone-400 hover:text-stone-600 flex items-center gap-1 transition-colors"
                                    >
                                        <ArrowRightLeft className="w-3 h-3" /> Move
                                    </button>
                                    <button
                                        onClick={() => handleDeletePage(activePage.id)}
                                        className="text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" /> Delete
                                    </button>
                                </div>
                            )}
                        </div>

                        {!isReadingMode && (
                            <div className="w-full px-4 mb-2 mt-4">
                                <div className="bg-[#fcfaf8] border border-luxury-gold/30 p-4 sm:p-5 rounded-lg shadow-sm flex flex-col items-start gap-3 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-luxury-gold" />
                                    
                                    <p className="text-base sm:text-lg text-stone-800 font-medium leading-snug flex items-center gap-2">
                                        <span className="text-xl leading-none">✨</span> Editor Instructions
                                    </p>
                                    
                                    <ul className="space-y-3 text-sm sm:text-base text-stone-600 ml-1">
                                        <li className="flex items-start gap-2">
                                            <span className="mt-0.5 text-luxury-gold font-bold">•</span>
                                            <span><strong>Add a photo:</strong> Click on an empty line in your story below, then click the <Plus className="inline w-5 h-5 p-0.5 bg-white border border-stone-300 rounded-md text-stone-600 align-text-bottom shadow-sm mx-0.5" /> icon that appears on the left.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-0.5 text-luxury-gold font-bold">•</span>
                                            <span><strong>RP Rewrite & Font Styles:</strong> First, highlight (select) the text you want to change. This will reveal the formatting menu and the <strong>RP Rewrite</strong> tool!</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div id="ai-toolbar-portal" className="w-full sticky top-16 z-[60] mb-2 pointer-events-none *:pointer-events-auto" />

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
                                    "p-6 md:p-16 h-full",
                                    !isReadingMode && "cursor-text"
                                )}
                                onClick={() => {
                                    if (!isReadingMode) {
                                        (document.querySelector(`#page-${activePage.id} .ProseMirror`) as HTMLElement)?.focus();
                                    }
                                }}
                            >
                                 <div id={`page-${activePage.id}`}>
                                    {/* Force re-mount of editor if category changes to ensure toolbar sync */}
                                    <PageEditor
                                        key={`${activePage.id}-${mapCategory(book?.category)}`}
                                        page={activePage}
                                        onUpdate={(content) => handleUpdatePageContent(activePage.id, content)}
                                        readOnly={isReadingMode}
                                        category={mapCategory(book?.category)}
                                        bookId={bookId || ""}
                                        onOverflow={() => {
                                            toast.info("Adding new page due to extra text");
                                            if (activePageIndex === orderedPages.length - 1) {
                                                handleAddPage();
                                            } else {
                                                navigatePage('next');
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Navigation Footer */}
                        <div className="flex items-center justify-between w-full max-w-[800px] px-4 pt-4 pb-20">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigatePage('prev')}
                                disabled={activePageIndex === 0}
                                className={cn("text-stone-500 hover:text-stone-900 px-2 md:px-4", activePageIndex === 0 && "opacity-0 pointer-events-none")}
                            >
                                <ArrowLeft className="mr-1 md:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Previous Page</span><span className="sm:hidden">Prev</span>
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
                                size="sm"
                                onClick={() => navigatePage('next')}
                                disabled={activePageIndex === orderedPages.length - 1}
                                className={cn("text-stone-500 hover:text-stone-900 px-2 md:px-4", activePageIndex === orderedPages.length - 1 && "opacity-0 pointer-events-none")}
                            >
                                <span className="hidden sm:inline">Next Page</span><span className="sm:hidden">Next</span> <ArrowLeft className="ml-1 md:ml-2 h-4 w-4 rotate-180" />
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            <MovePageModal
                isOpen={isMoveModalOpen}
                onClose={() => setIsMoveModalOpen(false)}
                onSubmit={handleConfirmMove}
                chapters={book?.chapters || []}
                currentChapterId={chapterId || ""}
                isLoading={updatePage.isPending}
            />
        </div>
    );
}

function PageEditor({ page, onUpdate, readOnly, category, bookId, onOverflow }: { page: Page, onUpdate: (content: string) => void, readOnly?: boolean, category?: "Life Story" | "Yearbook" | "Business", bookId: string, onOverflow?: () => void }) {
    const [content, setContent] = useState(page.textContent || "");
    const [isRevamping, setIsRevamping] = useState(false);
    const revampMutation = useRevampText();

    useEffect(() => {
        setContent(page.textContent || "");
    }, [page.textContent]);

    const handleRevamp = async () => {
        setIsRevamping(true);
        toast.info("Polishing your text with AI...", { duration: 2000 });
        try {
            // Basic revamp call
            const result = await revampMutation.mutateAsync({
                bookId,
                payload: { text: content, tone: "Standard", category: category || "Life Story" }
            });
            // Update local state first to feel instantaneous
            setContent(result);
            // Fire the update to the backend, which will invalidate the query
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
            category={category}
            bookId={bookId}
            onOverflow={onOverflow}
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
