import { Link, Outlet } from "react-router-dom";
import type { ReactNode } from "react";
import authIllustration from "@/assets/auth_illustration.png";
import rbPressLogo from "@/assets/remember-press.png";
import { motion } from "framer-motion";

export function AuthContent({ children, title, subtitle, footer }: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-sm space-y-8 relative z-10">
      <div className="flex flex-col space-y-2 text-center lg:text-left">
        {/* Mobile Logo (Visible only on small screens) */}
        <div className="flex lg:hidden justify-center mb-6">
          <Link to="/" className="relative w-40 h-14">
            <img src={rbPressLogo} alt="RB Press" className="object-contain w-full h-full" />
          </Link>
        </div>

        <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>

      <div className="grid gap-6">
        {children}
      </div>

      {footer && (
        <div className="text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  );
}

// Main Layout: Persistent Left Panel + Outlet
export function AuthLayout() {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      {/* LEFT COLUMN: Branding & Atmosphere */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex flex-col justify-between bg-zinc-900 p-10 text-primary-foreground relative overflow-hidden"
      >
        {/* Abstract Background Decoration */}
        <div className="absolute inset-0 bg-zinc-900" />

        {/* Premium Illustration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "linear" }}
            src={authIllustration}
            alt="Publisher's Study"
            className="w-full h-full object-cover opacity-80 grayscale-[20%] brightness-90 saturate-50"
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-zinc-900/30" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img src={rbPressLogo} alt="Remember Press" className="w-12 h-12 object-contain drop-shadow-md" />
          <div className="flex flex-col justify-center pt-1">
            <span className="font-serif text-2xl font-bold leading-none tracking-tight text-white">Remember</span>
            <span className="font-sans text-[11px] font-bold tracking-[0.35em] uppercase text-white/60 ml-0.5">Press</span>
          </div>
        </div>

        {/* Quote / Content */}
        <div className="relative z-10 max-w-lg mb-8">
          <blockquote className="space-y-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-0.5 bg-luxury-gold/80 rounded-full shadow-[0_0_10px_rgba(var(--luxury-gold),0.5)]"
            />
            <p className="font-serif text-3xl font-medium leading-tight text-white/95 drop-shadow-sm">
              &ldquo;The written word is the only way we can verify the truth of our memories.&rdquo;
            </p>
            <footer className="text-sm text-white/70 font-medium tracking-wider uppercase">
              ― The Publisher's Creed
            </footer>
          </blockquote>
        </div>

        {/* Footer/Copyright */}
        <div className="relative z-10 text-xs text-white/40 font-mono tracking-widest uppercase">
          © 2021 Remember Press. All rights reserved.
        </div>
      </motion.div>

      {/* RIGHT COLUMN: The Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        className="flex items-center justify-center p-8 bg-background"
      >
        <Outlet />
      </motion.div>
    </div>
  );
}

