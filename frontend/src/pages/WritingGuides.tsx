import { useState } from "react";
import { BookOpen, Download, FileText, Clock, ArrowDownToLine } from "lucide-react";

interface Guide {
  id: string;
  title: string;
  description: string;
  market: string;
  pages: string;
  lastUpdated: string;
  url: string;
  badge?: string;
}

const GUIDES: Guide[] = [
  {
    id: "writing-guide-3-markets",
    title: "Remember Press Writing Guides for Our 3 Markets",
    description:
      "A comprehensive writing guide covering best practices, style standards, and market-specific advice across all three Remember Press publishing markets. Essential reading before you start your first book.",
    market: "All Markets",
    pages: "PDF",
    lastUpdated: "April 2026",
    url: "https://fsppruololkkduvvuikl.supabase.co/storage/v1/object/public/PageImage/WritingGuides/Remember%20Press%20Writing%20Guides%20for%20our%203%20markets.pdf",
    badge: "Essential",
  },
];

export function WritingGuides() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (guide: Guide) => {
    setDownloading(guide.id);

    // Open in new tab — browser handles PDF download/view
    const link = document.createElement("a");
    link.href = guide.url;
    link.download = `${guide.title}.pdf`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloading(null), 1500);
  };

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, hsl(45 40% 50% / 0.2), hsl(45 40% 50% / 0.05))",
              border: "1px solid hsl(45 40% 50% / 0.3)",
            }}
          >
            <BookOpen className="w-5 h-5" style={{ color: "hsl(45 40% 50%)" }} />
          </div>
          <h1 className="text-3xl font-serif font-semibold tracking-tight text-foreground">
            Writing Guides
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Exclusive resources to help you write with confidence. Download these guides
          to understand our editorial standards and market-specific expectations.
        </p>
      </div>

      {/* Divider */}
      <div
        className="h-px w-full"
        style={{ background: "linear-gradient(to right, hsl(45 40% 50% / 0.4), transparent)" }}
      />

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GUIDES.map((guide) => (
          <GuideCard
            key={guide.id}
            guide={guide}
            isDownloading={downloading === guide.id}
            onDownload={() => handleDownload(guide)}
          />
        ))}
      </div>

      {/* Coming Soon Placeholder */}
      <div
        className="rounded-2xl border border-dashed p-8 flex flex-col items-center justify-center text-center gap-3"
        style={{ borderColor: "hsl(220 5% 90%)" }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: "hsl(40 10% 94%)" }}
        >
          <FileText className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">More guides coming soon</p>
          <p className="text-sm text-muted-foreground">
            We're working on market-specific style sheets and chapter planning templates.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Guide Card ─────────────────────────────────────────────────────── */

interface GuideCardProps {
  guide: Guide;
  isDownloading: boolean;
  onDownload: () => void;
}

function GuideCard({ guide, isDownloading, onDownload }: GuideCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative rounded-2xl border bg-card flex flex-col overflow-hidden transition-all duration-300"
      style={{
        borderColor: hovered ? "hsl(45 40% 50% / 0.5)" : "hsl(220 5% 90%)",
        boxShadow: hovered
          ? "0 8px 30px -8px hsl(45 40% 50% / 0.2)"
          : "0 1px 4px 0 hsl(220 10% 15% / 0.04)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Gold accent top bar */}
      <div
        className="h-1 w-full"
        style={{
          background:
            "linear-gradient(90deg, hsl(45 40% 50%), hsl(45 40% 65%), hsl(45 40% 50% / 0.3))",
        }}
      />

      <div className="p-6 flex flex-col gap-5 flex-1">
        {/* Top row: icon + badge */}
        <div className="flex items-start justify-between gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, hsl(45 40% 50% / 0.15), hsl(45 40% 50% / 0.05))",
              border: "1px solid hsl(45 40% 50% / 0.25)",
            }}
          >
            <FileText className="w-5 h-5" style={{ color: "hsl(45 40% 50%)" }} />
          </div>

          {guide.badge && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: "hsl(45 40% 50% / 0.12)",
                color: "hsl(45 40% 42%)",
                border: "1px solid hsl(45 40% 50% / 0.2)",
              }}
            >
              {guide.badge}
            </span>
          )}
        </div>

        {/* Guide info */}
        <div className="space-y-2 flex-1">
          <h2 className="font-serif font-semibold text-lg text-foreground leading-snug">
            {guide.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {guide.description}
          </p>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2">
          <MetaChip icon={<BookOpen className="w-3 h-3" />} label={guide.market} />
          <MetaChip icon={<FileText className="w-3 h-3" />} label={guide.pages} />
          <MetaChip icon={<Clock className="w-3 h-3" />} label={`Updated ${guide.lastUpdated}`} />
        </div>

        {/* Download button */}
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="w-full rounded-xl flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all duration-200"
          style={{
            background: isDownloading
              ? "hsl(45 40% 50% / 0.6)"
              : hovered
              ? "hsl(45 40% 50%)"
              : "hsl(220 10% 15%)",
            color: isDownloading || hovered ? "hsl(220 10% 12%)" : "hsl(40 20% 97%)",
            cursor: isDownloading ? "not-allowed" : "pointer",
          }}
        >
          {isDownloading ? (
            <>
              <ArrowDownToLine className="w-4 h-4 animate-bounce" />
              Opening…
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Guide
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function MetaChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full text-muted-foreground"
      style={{ background: "hsl(40 10% 94%)" }}
    >
      {icon}
      {label}
    </span>
  );
}
