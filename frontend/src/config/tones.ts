import {
    Briefcase,
    Coffee,
    Sparkles,
    Zap,
    Lightbulb,
    BookOpen,
    Heart,
    Flame,
    MessageCircle,
    Target,
    GraduationCap,
    Users,
    Trophy
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ToneOption {
    id: string;
    label: string;
    icon: LucideIcon;
    description: string;
}

export const LIFE_STORY_TONES: ToneOption[] = [
    { id: "Reflective", label: "Reflective", icon: BookOpen, description: "Thoughtful and introspective." },
    { id: "Nostalgic", label: "Nostalgic", icon: Coffee, description: "Warm and sentimental." },
    { id: "Vivid", label: "Vivid", icon: Sparkles, description: "Richly descriptive and sensory." },
    { id: "Candid", label: "Candid", icon: MessageCircle, description: "Honest and raw." },
    { id: "Dramatic", label: "Dramatic", icon: Flame, description: "Intense and story-driven." },
];

export const YEARBOOK_TONES: ToneOption[] = [
    { id: "Celebrating", label: "Celebrating", icon: Trophy, description: "Joyful and commemorative." },
    { id: "Nostalgic", label: "Nostalgic", icon: Coffee, description: "Warm memories and milestones." },
    { id: "Playful", label: "Playful", icon: Sparkles, description: "Lighthearted and fun." },
    { id: "Inspiring", label: "Inspiring", icon: Lightbulb, description: "Encouraging and forward-looking." },
    { id: "Community", label: "Community", icon: Users, description: "Collective and shared experience." },
];

export const BUSINESS_TONES: ToneOption[] = [
    { id: "Authoritative", label: "Authoritative", icon: Briefcase, description: "Commanding and expert." },
    { id: "Persuasive", label: "Persuasive", icon: Lightbulb, description: "Compelling and sales-driven." },
    { id: "Actionable", label: "Actionable", icon: Target, description: "Practical and directive." },
    { id: "Strategic", label: "Strategic", icon: Zap, description: "Big-picture and visionary." },
    { id: "Educational", label: "Educational", icon: BookOpen, description: "Instructive and clear." },
];
