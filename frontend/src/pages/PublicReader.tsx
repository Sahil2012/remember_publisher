import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAPIClient } from "@/api/useAPIClient";
import { Loader } from "@/components/ui/loader";
import { BookOpen, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ExportBookModal } from "@/components/ExportBookModal";
import type { Book } from "@/api/books/types";

export function PublicReader() {
    const { shareId } = useParams<{ shareId: string }>();
    const apiClient = useAPIClient();
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const { data: book, isLoading, error } = useQuery<Book>({
        queryKey: ["publicBook", shareId],
        queryFn: async () => {
            const res = await apiClient.get(`/public/books/${shareId}`);
            return res.data;
        },
        retry: false
    });

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-stone-50">
                <Loader size="lg" className="animate-spin text-luxury-gold" />
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50">
                <div className="h-20 w-20 rounded-full bg-stone-200 flex items-center justify-center mb-4">
                    <BookOpen className="h-10 w-10 text-stone-400" />
                </div>
                <h1 className="text-2xl font-serif text-stone-900">Book Not Found</h1>
                <p className="text-stone-500 text-center max-w-sm">This book may have been unpublished by the author or the link is invalid.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfcfc] text-stone-900 font-sans selection:bg-luxury-gold/30">
            {/* Minimalist Top Bar */}
            <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-stone-100 flex items-center justify-between px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-stone-900 rounded flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h1 className="font-serif font-medium text-sm md:text-base leading-tight pr-4 truncate max-w-[200px] sm:max-w-md">{book.title}</h1>
                        {book.authorName && <p className="text-xs text-stone-500">By {book.authorName}</p>}
                    </div>
                </div>
                <Button 
                    onClick={() => setIsExportModalOpen(true)}
                    size="sm"
                    className="bg-stone-900 text-white hover:bg-stone-800 shadow-md font-medium px-4 h-9 rounded-full hidden sm:flex"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                </Button>
                <Button 
                    onClick={() => setIsExportModalOpen(true)}
                    size="icon"
                    className="bg-stone-900 text-white hover:bg-stone-800 shadow-md h-9 w-9 rounded-full sm:hidden"
                >
                    <Download className="w-4 h-4" />
                </Button>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Book Cover / Title Area structured as an A4 Page */}
                <div 
                    className="mx-auto w-full max-w-[210mm] min-h-[297mm] shadow-lg border border-stone-200 relative overflow-hidden flex flex-col items-center justify-center text-center mb-16"
                    style={
                        book.coverImage 
                           ? { backgroundImage: `url(${book.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
                           : { backgroundColor: book.coverColor || '#1a1818' }
                    }
                >
                    {!book.coverImage && (
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                    )}
                    <div className="bg-white/95 p-8 sm:p-16 rounded-3xl max-w-[85%] shadow-2xl backdrop-blur-xl border border-white/20">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-stone-900 mb-6 leading-tight">
                            {book.title}
                        </h1>
                        {book.description && (
                            <p className="text-lg md:text-2xl text-stone-600 font-serif italic mx-auto leading-relaxed">
                                {book.description}
                            </p>
                        )}
                        <div className="w-16 h-1 bg-luxury-gold mx-auto mt-8 rounded-full opacity-50"></div>
                    </div>
                </div>

                {/* Chapters rendering */}
                <div className="space-y-32">
                    {book.chapters?.map((chapter: any, chapIdx: number) => (
                        <article key={chapter.id} className="chapter-container">
                            {/* Chapter Cover structured as an A4 Page */}
                            <div className="bg-white mx-auto w-full max-w-[210mm] min-h-[297mm] shadow-lg border border-stone-200 px-10 py-16 sm:px-16 sm:py-24 relative overflow-hidden flex flex-col justify-center items-center text-center">
                                <div className="w-16 h-1 bg-luxury-gold mx-auto rounded-full mb-8 opacity-70"></div>
                                <h1 className="text-5xl font-serif font-bold text-stone-900 uppercase tracking-widest text-luxury-gold mb-6">Chapter {chapIdx + 1}</h1>
                                <h2 className="text-3xl sm:text-4xl font-serif text-stone-600 italic leading-tight">{chapter.title}</h2>
                            </div>
                            
                            <div className="space-y-12 mt-12 bg-stone-100/50 p-4 sm:p-8 rounded-2xl border border-stone-200/50 inset-shadow-sm">
                                {chapter.pages?.map((page: any, pageIdx: number) => (
                                    <div 
                                        key={page.id} 
                                        className="bg-white mx-auto w-full max-w-[210mm] min-h-[297mm] shadow-lg border border-stone-200 px-10 py-16 sm:px-16 sm:py-24 relative overflow-hidden flex flex-col"
                                    >
                                        <div 
                                            className="ProseMirror prose prose-lg md:prose-xl prose-stone max-w-none tiptap outline-none flex-grow"
                                            dangerouslySetInnerHTML={{ __html: page.textContent || "" }}
                                        />
                                        <div className="absolute bottom-6 left-0 right-0 flex justify-center w-full">
                                            <span className="text-stone-300 font-sans text-xs tracking-widest">{chapIdx + 1}.{pageIdx + 1}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            </main>
            
            <footer className="py-12 text-center border-t border-stone-100 bg-white mt-12">
                <p className="text-stone-400 text-sm">Published via Remember Publisher</p>
            </footer>

            <ExportBookModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                book={book}
                isSnapshot={true}
            />
        </div>
    );
}
