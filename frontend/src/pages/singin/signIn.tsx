import { useSignIn } from "@clerk/clerk-react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthContent } from "@/components/auth/AuthLayout";
import { useState, useEffect } from "react";
import { Loader } from "@/components/ui/loader";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SignInPage() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const message = searchParams.get("message");
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

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

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");

        try {
            const attempt = await signIn.create({ identifier: email });
            const oauthFactor = attempt.supportedFirstFactors?.find(f => f.strategy.startsWith("oauth_"));
            const hasPassword = attempt.supportedFirstFactors?.some(f => f.strategy === "password");

            if (!hasPassword && oauthFactor) {
                const provider = oauthFactor.strategy.replace("oauth_", "");
                const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
                toast.error(`You have an account using ${providerName}. Please sign in with ${providerName}.`);
                setErrorMsg(`Please continue with ${providerName}`);
                setIsLoading(false);
                return;
            }

            const finalResult = await signIn.attemptFirstFactor({ strategy: "password", password });
            
            if (finalResult.status === "complete") {
                await setActive({ session: finalResult.createdSessionId });
                window.location.href = "/";
            } else {
                setErrorMsg("Sign in failed. Please try again.");
            }
        } catch (err: any) {
            console.error("Sign in error:", err);
            setErrorMsg(err.errors?.[0]?.message || "Invalid email or password.");
        } finally {
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
            {/* Message Banner */}
            {message === "account_exists" && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl flex items-start gap-3 mb-6"
                    style={{ 
                        background: "hsl(45 40% 50% / 0.1)",
                        border: "1px solid hsl(45 40% 50% / 0.3)"
                    }}
                >
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "hsl(45 40% 45%)" }} />
                    <div className="space-y-1">
                        <p className="text-sm font-semibold" style={{ color: "hsl(45 40% 45%)" }}>
                            Account already exists
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            An account with this email already exists. Please sign in to your account.
                        </p>
                    </div>
                </motion.div>
            )}

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

            {/* Error Banner for Email Login */}
            {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {errorMsg}
                </div>
            )}

            <motion.form 
                onSubmit={handleEmailSignIn}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
            >
                <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Enter your email" 
                        required 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Enter your password" 
                        required 
                    />
                </div>
                <Button disabled={isLoading} type="submit" className="w-full bg-stone-900 text-white hover:bg-stone-800 h-11 rounded-xl">
                    {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
            </motion.form>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
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
