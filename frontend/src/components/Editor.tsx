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
                    "flex flex-col h-full overflow-y-auto scroll-m-0", // Root takes full height
                    // Ensure container takes remaining height relative to toolbar
                    "[&_.ql-container]:flex-1 [&_.ql-container]:overflow-hidden [&_.ql-container]:relative",
                    // Editor takes full height of container and handles scrolling
                    "[&_.ql-editor]:h-full [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:text-base",

                    // Old styles adapted
                    // Border styling
                    "[&_.ql-toolbar]:border-none [&_.ql-container]:border-none",
                    "[&_.ql-toolbar]:bg-muted/40 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-border/40",

                    // Radius - handled by parent but good to ensure
                    "[&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:rounded-b-lg",

                    // Read only specific styles
                    readOnly && "[&_.ql-container]:border-none [&_.ql-toolbar]:hidden [&_.ql-editor]:px-0"

                )}
            />
        </div>
    );
}
