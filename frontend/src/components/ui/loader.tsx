import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    className?: string;
}

export const Loader = ({ size = 'md', text, className }: LoaderProps) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8'
    };

    return (
        <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
            <LoaderCircle className={cn('animate-spin text-blue-500', sizeClasses[size])} />
            {text && (
                <p className="text-sm text-gray-600 animate-pulse">{text}</p>
            )}
        </div>
    );
};

// Full page loader component
export const PageLoader = ({ text = 'Loading...' }: { text?: string }) => {
    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center space-y-4">
                <LoaderCircle className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-gray-700 font-medium">{text}</p>
            </div>
        </div>
    );
};