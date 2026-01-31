import { useClerk } from "@clerk/clerk-react";
import { useLayoutEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AuthContent } from "@/components/auth/AuthLayout";
import { Loader } from "@/components/ui/loader";

const SSOCallbackPage = () => {
    const { handleRedirectCallback } = useClerk();
    useLayoutEffect(() => {
        handleRedirectCallback({});
    }, []);
    return (
        <AuthContent
            title="Verifying..."
            subtitle="Please wait while we complete your sign in"
        >
            <div className="flex flex-col items-center justify-center py-6">
                {/* Reusing the loader but maybe slightly larger or text-less */}
                <Loader size="lg" />
                <p className="mt-8 text-sm text-muted-foreground font-medium animate-pulse">
                    Redirecting you to the study...
                </p>
            </div>
        </AuthContent>
    );
};
export default SSOCallbackPage;