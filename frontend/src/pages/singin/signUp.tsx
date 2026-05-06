import { useSignUp, useSignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { AuthContent } from "@/components/auth/AuthLayout";
import { useState } from "react";
import { Loader } from "@/components/ui/loader";
import { motion } from "framer-motion";
import { Gift, Sparkles, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PERKS = [
    "Complimentary RP Editor session (Try it free!)",
];

export function SignUpPage() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const { signIn } = useSignIn();
    const [isLoading, setIsLoading] = useState(false);
    
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    if (!isLoaded) return null;

    const handleGoogleSignUp = async () => {
        setIsLoading(true);
        try {
            await signUp.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/",
            });
        } catch (err: any) {
            console.error("OAuth error:", err);
            // If Clerk identifies the user already exists during the attempt (though usually happens at callback)
            if (err.errors?.[0]?.code === "form_identifier_exists") {
                window.location.href = "/login?message=account_exists";
                return;
            }
            setIsLoading(false);
        }
    };

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match");
            return;
        }

        setIsLoading(true);

        const names = fullName.trim().split(" ");
        const firstName = names[0] || "";
        const lastName = names.slice(1).join(" ");

        try {
            await signUp.create({
                firstName,
                lastName,
                emailAddress: email,
                password,
            });

            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setPendingVerification(true);
        } catch (err: any) {
            console.error("Sign up error:", err);
            
            if (err.errors?.[0]?.code === "form_identifier_exists") {
                try {
                    const attempt = await signIn?.create({ identifier: email });
                    const oauthFactor = attempt?.supportedFirstFactors?.find(f => f.strategy.startsWith("oauth_"));
                    if (oauthFactor) {
                        const provider = oauthFactor.strategy.replace('oauth_', '');
                        const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
                        toast.error(`You already have an account using ${providerName}. Please sign in with ${providerName}.`);
                        setErrorMsg(`Account exists. Please log in with ${providerName}.`);
                    } else {
                        setErrorMsg("An account with this email already exists. Please log in.");
                    }
                } catch (e) {
                    setErrorMsg("An account with this email already exists. Please log in.");
                }
            } else {
                setErrorMsg(err.errors?.[0]?.message || "Sign up failed.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (completeSignUp.status === "complete") {
                await setActive({ session: completeSignUp.createdSessionId });
                window.location.href = "/";
            } else {
                setErrorMsg("Verification failed. Please try again.");
            }
        } catch (err: any) {
            console.error("Verification error:", err);
            setErrorMsg(err.errors?.[0]?.message || "Invalid verification code.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContent
            title=""
            footer={
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-semibold underline underline-offset-4 hover:text-foreground transition-colors"
                        style={{ color: "hsl(45 40% 45%)" }}
                    >
                        Sign in instead
                    </Link>
                </p>
            }
        >
            {/* Gift Banner Card */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden rounded-2xl"
                style={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(45 40% 50% / 0.35)",
                    boxShadow: "0 4px 24px hsl(45 40% 50% / 0.1)",
                }}
            >
                {/* Gold shimmer top bar */}
                <div
                    className="h-1 w-full"
                    style={{
                        background: "linear-gradient(90deg, hsl(45 40% 50% / 0.3), hsl(45 40% 60%), hsl(45 40% 70%), hsl(45 40% 60%), hsl(45 40% 50% / 0.3))",
                    }}
                />
                {/* Gold radial glow */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse at top, hsl(45 40% 50% / 0.07) 0%, transparent 65%)",
                    }}
                />

                <div className="relative px-5 py-4 flex items-start gap-4">
                    {/* Animated icon */}
                    <motion.div
                        initial={{ rotate: -12, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", damping: 14, stiffness: 200, delay: 0.15 }}
                        className="relative shrink-0"
                    >
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center"
                            style={{
                                background: "linear-gradient(135deg, hsl(45 40% 50% / 0.2), hsl(45 40% 50% / 0.06))",
                                border: "1px solid hsl(45 40% 50% / 0.3)",
                                boxShadow: "0 4px 16px hsl(45 40% 50% / 0.15)",
                            }}
                        >
                            <Gift className="h-5 w-5" style={{ color: "hsl(45 40% 45%)" }} />
                        </div>
                        <span
                            className="absolute -top-1 -right-1"
                            style={{ animation: "spin 8s linear infinite" }}
                        >
                            <Sparkles className="w-3 h-3" style={{ color: "hsl(45 40% 50%)" }} />
                        </span>
                    </motion.div>

                    <div className="space-y-1 min-w-0">
                        <motion.p
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-[10px] font-bold uppercase tracking-widest"
                            style={{ color: "hsl(45 40% 45%)" }}
                        >
                            Free Trial Included
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="text-sm font-semibold text-foreground leading-snug"
                        >
                            Try the RP Editor free of cost. Get 3 complimentary sessions (up to 300 words per test) just by signing up — no upfront payment required.
                        </motion.p>
                    </div>
                </div>
            </motion.div>

            {/* Heading */}
            <div className="space-y-1.5">
                <motion.h1
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl font-serif font-bold tracking-tight text-foreground"
                >
                    Claim your free trial
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-base text-muted-foreground"
                >
                    Sign up to unlock immediate access to our premium writing tools and guides.
                </motion.p>
            </div>

            {/* Perks list */}
            <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
            >
                {PERKS.map((perk, i) => (
                    <motion.li
                        key={perk}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.07 }}
                        className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                        <span
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                            style={{
                                background: "hsl(45 40% 50% / 0.15)",
                                border: "1px solid hsl(45 40% 50% / 0.3)",
                            }}
                        >
                            <Check className="w-2.5 h-2.5" style={{ color: "hsl(45 40% 45%)" }} />
                        </span>
                        {perk}
                    </motion.li>
                ))}
            </motion.ul>

            {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {errorMsg}
                </div>
            )}

            {pendingVerification ? (
                <motion.form 
                    onSubmit={handleVerify}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4 mt-6"
                >
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Verification Code</label>
                        <Input 
                            value={code} 
                            onChange={(e) => setCode(e.target.value)} 
                            placeholder="Enter the code sent to your email" 
                            required 
                        />
                    </div>
                    <Button disabled={isLoading} type="submit" className="w-full bg-stone-900 text-white hover:bg-stone-800 h-11 rounded-xl">
                        {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : "Verify Email"}
                    </Button>
                </motion.form>
            ) : (
                <>
                    <motion.form 
                        onSubmit={handleEmailSignUp}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4 mt-6"
                    >
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input 
                                value={fullName} 
                                onChange={(e) => setFullName(e.target.value)} 
                                placeholder="Enter your full name" 
                                required 
                            />
                        </div>
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
                                placeholder="Create a password" 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Confirm Password</label>
                            <Input 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                placeholder="Confirm your password" 
                                required 
                            />
                        </div>
                        <Button disabled={isLoading} type="submit" className="w-full bg-stone-900 text-white hover:bg-stone-800 h-11 rounded-xl">
                            {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : "Create account"}
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

                    {/* Google Sign Up Button */}
                    <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
            >
                <button
                    onClick={handleGoogleSignUp}
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

                </>
            )}

            <p className="text-center text-xs text-muted-foreground/60 mt-4">
                By signing up, you agree to our terms of service and privacy policy.
            </p>
        </AuthContent>
    );
}
