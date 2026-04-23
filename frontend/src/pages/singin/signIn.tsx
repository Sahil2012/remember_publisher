import { useSignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { AuthContent } from "@/components/auth/AuthLayout";
import { useState } from "react";
import { Loader } from "@/components/ui/loader";
import { motion } from "framer-motion";

export function SignInPage() {
    const { isLoaded, signIn } = useSignIn();
    const [isLoading, setIsLoading] = useState(false);

    if (!isLoaded) return null;

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/",
            });
        } catch (err) {
            console.error("OAuth error:", err);
            setIsLoading(false);
        }
    };

    return (
        <AuthContent
            title=""
            footer={
                <p className="text-sm text-muted-foreground">
                    New to Remember Press?{" "}
                    <Link 
                        to="/signup" 
                        className="font-semibold underline underline-offset-4 hover:text-foreground transition-colors"
                        style={{ color: "hsl(45 40% 45%)" }}
                    >
                        Create an account
                    </Link>
                </p>
            }
        >
            {/* Heading */}
            <div className="space-y-1.5">
                <motion.h1
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl font-serif font-bold tracking-tight text-foreground"
                >
                    Welcome back
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-base text-muted-foreground"
                >
                    Sign in to continue immortalising your memories.
                </motion.p>
            </div>

            {/* Google Sign In Button */}
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
            >
                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl flex items-center justify-center gap-3 text-sm font-semibold border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                    style={{
                        background: "hsl(var(--card))",
                        border: "2px solid hsl(45 40% 50% / 0.3)",
                        color: "hsl(var(--foreground))",
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(45 40% 50% / 0.6)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 12px hsl(45 40% 50% / 0.15)";
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(45 40% 50% / 0.3)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                    }}
                >
                    {isLoading ? (
                        <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </>
                    )}
                </button>
            </motion.div>
        </AuthContent>
    );
}
