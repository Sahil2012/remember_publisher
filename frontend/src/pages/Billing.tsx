import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Calendar, CreditCard, History, ExternalLink, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAPIClient } from "@/api/useAPIClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Transaction {
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    type: string;
}

interface SubscriptionDetails {
    isSubscribed: boolean;
    status?: string;
    currentPeriodEnd?: string;
    startDate?: string;
    cancelAtPeriodEnd?: boolean;
    isOneTimePayment?: boolean;
    transactions: Transaction[];
}

export function Billing() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const success = searchParams.get("success");
    const apiClient = useAPIClient();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(success === "true");
    const [details, setDetails] = useState<SubscriptionDetails | null>(null);
    const [isCanceling, setIsCanceling] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const hasEffectRun = useRef(false);

    const fetchDetails = async () => {
        try {
            const response = await apiClient.get<SubscriptionDetails>('/stripe/details');
            setDetails(response.data);
        } catch (error) {
            console.error("Failed to fetch billing details:", error);
            toast.error("Could not load billing information.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (hasEffectRun.current) return;
        
        const init = async () => {
            if (success === "true") {
                try {
                    await apiClient.get('/stripe/sync-subscription');
                    toast.success("Payment successful! Your subscription is now active.");
                    // After sync, wait a bit then fetch details instead of navigating away immediately
                    setTimeout(() => {
                        setIsSyncing(false);
                        fetchDetails();
                        // Clear URL params
                        navigate("/billing", { replace: true });
                    }, 1500);
                } catch (error) {
                    console.error("Failed to sync subscription status:", error);
                    toast.error("Payment successful, but we had trouble updating your account.");
                    setIsSyncing(false);
                    fetchDetails();
                }
            } else if (searchParams.get("canceled") === "true") {
                toast.error("Payment was cancelled.");
                navigate("/billing", { replace: true });
                fetchDetails();
            } else {
                fetchDetails();
            }
        };

        init();
        hasEffectRun.current = true;
    }, [success, navigate, apiClient, searchParams]);

    const handleCancelSubscription = async () => {
        setIsCanceling(true);
        try {
            await apiClient.post('/stripe/cancel');
            toast.success("Your subscription will be canceled at the end of the current period.");
            setShowCancelConfirm(false);
            fetchDetails(); // Refresh details
        } catch (error) {
            console.error("Failed to cancel subscription:", error);
            toast.error("An error occurred while trying to cancel your subscription.");
        } finally {
            setIsCanceling(false);
        }
    };

    const handlePortalRedirect = async () => {
        try {
            const response = await apiClient.post<{ url: string }>('/stripe/create-portal-session');
            window.location.href = response.data.url;
        } catch (error) {
            console.error("Failed to create portal session:", error);
            toast.error("Could not open billing portal.");
        }
    };

    if (isSyncing) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 border border-green-100 shadow-sm"
                >
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                </motion.div>
                <motion.h1 
                    className="text-3xl md:text-4xl font-serif font-medium text-[#1e2326] mb-4"
                >
                    Payment Successful
                </motion.h1>
                <p className="text-[#686868] mb-10">Updating your account details...</p>
                <Loader2 className="w-6 h-6 animate-spin text-stone-300" />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-stone-300" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 py-4">
            {/* Header */}
            <header className="space-y-2">
                <h1 className="text-3xl font-serif font-semibold tracking-tight">Billing & Subscription</h1>
                <p className="text-muted-foreground">Manage your membership, view history, and update payment methods.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Subscription Status */}
                <Card className="md:col-span-2 border-none shadow-sm bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-serif">Current Plan</CardTitle>
                            {details?.isSubscribed ? (
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider",
                                    details.cancelAtPeriodEnd 
                                        ? "bg-amber-50 text-amber-600 border border-amber-100" 
                                        : "bg-green-50 text-green-600 border border-green-100"
                                )}>
                                    {details.cancelAtPeriodEnd ? "Ending Soon" : "Active"}
                                </span>
                            ) : (
                                <span className="bg-stone-100 text-stone-500 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                                    No Active Plan
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {details?.isSubscribed ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Member Since
                                        </p>
                                        <p className="font-medium">
                                            {details.startDate ? new Date(details.startDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <CreditCard className="w-3.5 h-3.5" />
                                            {details.isOneTimePayment
                                                ? "Access Expires On"
                                                : details.cancelAtPeriodEnd
                                                ? "Access Ends On"
                                                : "Next Billing Date"}
                                        </p>
                                        <p className="font-medium">
                                            {details.currentPeriodEnd ? new Date(details.currentPeriodEnd).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <Separator className="bg-foreground/5" />

                                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Standard Premium Plan</p>
                                        <p className="text-xs text-muted-foreground">Unlimited books, AI revamp access, and priority support.</p>
                                    </div>
                                    
                                    {!details.cancelAtPeriodEnd && !details.isOneTimePayment && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => setShowCancelConfirm(true)}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/5 text-xs h-8 px-3"
                                        >
                                            Unsubscribe
                                        </Button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="py-8 text-center space-y-4">
                                <p className="text-muted-foreground">You are not currently subscribed to any plan.</p>
                                <Button 
                                    onClick={() => navigate('/library')} 
                                    className="bg-foreground text-background"
                                >
                                    View Pricing Plans
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions / Info */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-stone-50/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Billing Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button 
                                variant="outline" 
                                className="w-full justify-start text-xs font-normal border-stone-200"
                                onClick={handlePortalRedirect}
                            >
                                <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                Update Payment Method
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start text-xs font-normal border-stone-200"
                                onClick={handlePortalRedirect}
                            >
                                <History className="w-3.5 h-3.5 mr-2" />
                                Download Invoices
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="p-4 rounded-xl border border-luxury-gold/20 bg-luxury-gold/5 flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-luxury-gold/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-luxury-gold" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-luxury-gold-dark">Premium Benefits Active</p>
                            <p className="text-[10px] text-[#8c7a5b] leading-relaxed">
                                You have full access to our AI-powered storytelling tools.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <section className="space-y-6 pt-4">
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-muted-foreground" />
                    <h2 className="text-xl font-serif font-semibold">Billing History</h2>
                </div>

                <div className="bg-card rounded-xl border border-foreground/5 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-stone-50/50 border-b border-foreground/5">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Description</th>
                                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                                    <th className="px-6 py-4 font-medium text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-foreground/5">
                                {details?.transactions && details.transactions.length > 0 ? (
                                    details.transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-stone-50/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(t.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                {t.type === 'checkout.session.completed.payment'
                                                    ? 'Yearly Special — One-time Purchase'
                                                    : t.type === 'checkout.session.completed' || t.type === 'checkout.session.completed.subscription'
                                                    ? 'Initial Subscription'
                                                    : 'Renewal Payment'}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">
                                                {(t.amount).toLocaleString(undefined, { style: 'currency', currency: t.currency })}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
                                                    t.status === 'succeeded' || t.status === 'paid' 
                                                        ? "bg-green-50 text-green-600" 
                                                        : "bg-red-50 text-red-600"
                                                )}>
                                                    {t.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                            No transaction history found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Cancel Confirmation Modal */}
            <AnimatePresence>
                {showCancelConfirm && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-card w-full max-w-md rounded-2xl border border-foreground/10 shadow-2xl p-6 space-y-6"
                        >
                            <div className="flex items-center gap-3 text-destructive">
                                <AlertTriangle className="w-6 h-6" />
                                <h3 className="text-xl font-serif font-semibold">Confirm Cancellation</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-muted-foreground leading-relaxed">
                                    Are you sure you want to cancel your subscription? You will still have access to all Premium features until 
                                    <span className="font-semibold text-foreground mx-1">
                                        {details?.currentPeriodEnd ? new Date(details.currentPeriodEnd).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'the end of your period'}
                                    </span>.
                                </p>
                                <p className="text-xs p-3 bg-stone-50 rounded-lg text-muted-foreground italic">
                                    Note: You can always resubscribe later to regain full access.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button 
                                    variant="outline" 
                                    className="flex-1"
                                    onClick={() => setShowCancelConfirm(false)}
                                    disabled={isCanceling}
                                >
                                    Keep Subscription
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    className="flex-1"
                                    onClick={handleCancelSubscription}
                                    disabled={isCanceling}
                                >
                                    {isCanceling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Cancel"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
