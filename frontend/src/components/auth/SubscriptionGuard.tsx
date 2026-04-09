import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAPIClient } from "@/api/useAPIClient";
import { Loader } from "@/components/ui/loader";

export function SubscriptionGuard() {
    const apiClient = useAPIClient();
    const location = useLocation();
    const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const checkSubscription = async () => {
            try {
                const response = await apiClient.get("/auth/me");
                if (mounted) {
                    setIsSubscribed(!!response.data?.user?.isSubscribed);
                }
            } catch (error) {
                console.error("Failed to fetch user data for SubscriptionGuard", error);
                if (mounted) {
                    setIsSubscribed(false); // Default to unpaid if error
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        checkSubscription();

        return () => {
            mounted = false;
        };
    }, [apiClient]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader size="lg" className="animate-spin text-[#D97736]" />
            </div>
        );
    }

    // Explicit whitelisted paths for unpaid users:
    const isRevampRoute = location.pathname.startsWith("/revamp");
    const isBillingRoute = location.pathname.startsWith("/billing");

    if (!isSubscribed) {
        // Redirect to /revamp for any path other than /billing and /revamp itself
        if (!isRevampRoute && !isBillingRoute) {
            return <Navigate to="/revamp" replace />;
        }
    } else {
        // If they are subscribed and on the revamp sample page, optionally let them stay 
        // or redirect to library. We'll let them stay but usually they go to library.
    }

    return <Outlet />;
}
