import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { cn } from "@/lib/utils";

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    className?: string;
}

const modules = {
    toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
    ],
};

const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
];

export function Editor({ value, onChange, placeholder, readOnly, className }: EditorProps) {
    return (
        <div className={cn("flex flex-col", className)}>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={readOnly ? { toolbar: false } : modules}
                formats={formats}
                placeholder={placeholder}
                readOnly={readOnly}
                className={cn(
                    "flex flex-col h-full",

                    // Toolbar
                    "[&_.ql-toolbar]:shrink-0 [&_.ql-toolbar]:border-none [&_.ql-toolbar]:bg-muted/40 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-border/40 [&_.ql-toolbar]:rounded-t-lg",

                    // Container: Force it to take exactly the remaining space and act as the scroll boundary if needed, 
                    // though usually the editor handles scroll.
                    // IMPORTANT: overflow-hidden on container prevents it from growing beyond flex bounds.
                    "[&_.ql-container]:flex-1 [&_.ql-container]:overflow-hidden [&_.ql-container]:relative [&_.ql-container]:border-none [&_.ql-container]:rounded-b-lg",

                    // Editor: Absolute fill or 100% height to ensure it fills container.
                    // overflow-y-auto enables the scrollbar.
                    "[&_.ql-editor]:h-full [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:px-4 [&_.ql-editor]:py-3",
                    // Scrollbar styling
                    "[&_.ql-editor::-webkit-scrollbar]:w-1.5",
                    "[&_.ql-editor::-webkit-scrollbar-track]:bg-transparent",
                    "[&_.ql-editor::-webkit-scrollbar-thumb]:bg-muted-foreground/20",
                    "[&_.ql-editor::-webkit-scrollbar-thumb]:rounded-full",
                    "[&_.ql-editor::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40",

                    readOnly && "[&_.ql-container]:border-none [&_.ql-toolbar]:hidden [&_.ql-editor]:px-0"
                )}
            />
        </div>
    );
}
