import { useClerk } from "@clerk/clerk-react";
import { useLayoutEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Loader } from "@/components/ui/loader";

const SSOCallbackPage = () => {
    const { handleRedirectCallback } = useClerk();
    useLayoutEffect(() => {
        handleRedirectCallback({});
    }, []);
    return (
        <AuthLayout
            title="Verifying..."
            subtitle="Please wait while we complete your sign in"
        >
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Loader size="lg" />
                    <p className="mt-4 text-sm text-muted-foreground">
                        Redirecting you to the dashboard...
                    </p>
                </CardContent>
            </Card>
        </AuthLayout>
    );
};
export default SSOCallbackPage;