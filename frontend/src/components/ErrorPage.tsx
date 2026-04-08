import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import { AlertCircle, Home, RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";

export function ErrorPage() {
    const error = useRouteError();
    const navigate = useNavigate();

    let title = "Oops! Something went wrong";
    let message = "We're sorry, but an unexpected error occurred.";

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            title = "Page Not Found";
            message = "The page you're looking for doesn't exist or has been moved.";
        } else {
            message = error.statusText || error.data?.message || message;
        }
    } else if (error instanceof Error) {
        message = error.message;
    }

    return (
        <div className="min-h-screen bg-[#faf9f8] flex flex-col items-center justify-center p-4 md:p-8 text-center text-[#1e2326]">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-200">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-serif mb-4 tracking-tight">
                {title}
            </h1>
            
            <p className="text-[#686868] text-base mb-8 max-w-md mx-auto leading-relaxed">
                {message}
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button 
                    onClick={() => navigate("/")}
                    variant="outline"
                    className="border-stone-200 hover:bg-stone-50 text-stone-700 h-11 px-6 gap-2 rounded-full font-medium"
                >
                    <Home className="w-4 h-4" />
                    Go Home
                </Button>
                <Button 
                    onClick={() => window.location.reload()}
                    className="bg-[#1e2326] hover:bg-black text-white h-11 px-6 gap-2 rounded-full font-medium shadow-md transition-all"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Try Again
                </Button>
            </div>
        </div>
    );
}
