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
                    "flex flex-col h-full flex-1",
                    // Ensure container takes remaining height and scrolls
                    "[&_.ql-container]:flex-1 [&_.ql-container]:overflow-y-auto [&_.ql-container]:text-base",
                    "[&_.ql-editor]:min-h-[150px]", // Min height for the text area itself
                    // Border styling
                    "[&_.ql-toolbar]:border-input [&_.ql-container]:border-input [&_.ql-toolbar]:bg-muted/40",
                    // Radius
                    "[&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:rounded-b-lg",
                    // Read only specific styles
                    readOnly && "[&_.ql-container]:border-none [&_.ql-toolbar]:hidden [&_.ql-editor]:px-0"
                )}
            />
        </div>
    );
}
