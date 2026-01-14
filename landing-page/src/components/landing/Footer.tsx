
import { content } from "@/data/content";
import Link from "next/link";

export function Footer() {
    const { footer } = content;

    return (
        <footer className="bg-background border-t border-border pt-24 pb-12">
            <div className="container px-6 md:px-8 mx-auto max-w-7xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="font-semibold text-xl tracking-tight block mb-6">
                            {footer.brand}
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            Turning your life's moments into tangible legacies. Crafted with care and precision.
                        </p>
                    </div>

                    {/* Navigation Column */}
                    <div className="col-span-1">
                        <h4 className="font-medium text-foreground mb-6">Explore</h4>
                        <ul className="space-y-4">
                            {footer.links.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Column */}
                    <div className="col-span-1">
                        <h4 className="font-medium text-foreground mb-6">Connect</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Twitter / X</a></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Instagram</a></li>
                            <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">LinkedIn</a></li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div className="col-span-2 md:col-span-1">
                        <h4 className="font-medium text-foreground mb-6">Legal</h4>
                        <ul className="space-y-4">
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
                    <p>{footer.copyright}</p>
                    <p className="mt-2 md:mt-0">Designed with simplicity.</p>
                </div>
            </div>
        </footer>
    );
}
