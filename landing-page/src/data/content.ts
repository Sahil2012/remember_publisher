
export const pricingTiers = [
    {
        name: "The Digital Edition",
        price: "$129",
        description: "Perfect for creating a timeless digital archive to share your story with friends, family, and future generations.",
        features: [
            "Bi-weekly newsletters with tips, tricks and great wisdom on how to shape your story",
            "Access to our incredible system of story recording, building, and shaping into a beautiful document",
            "Digital E-Book (PDF)",
            "Shareable Online Link",
            "3-Month Backup Retention",
        ],
        mostPopular: false,
        cta: "Start Your Story",
    },
    {
        name: "The Legacy Collection",
        price: "$599",
        description: "The ultimate package for preserving your family history or launching your professional authority as a published author.",
        features: [
            "Everything in the Digital Edition",
            "An in-depth interview session with an editor to get you started, or help with your progress",
            "Professional Photo Restoration",
            "An add-on choice of hard cover or soft cover book, and a small print run at a very reasonable price",
            "Lifetime Digital Archive",
            "And if you need it, access to a personal editor or ghostwriter, at an additional cost.",
        ],
        mostPopular: true,
        cta: "Preserve Your Legacy",
    },
];


export const content = {
    hero: {
        heading: "Your Story,\nBeautifully Bound.",
        subheadline: "Don't let your life's most precious moments be forgotten. We turn your journey into a timeless family heirloom.",
        primaryCta: "Start Writing",
        secondaryCta: "How it works?",
        socialProof: "THE GIFT OF A LIFETIME"
    },
    offerings: [
        {
            label: "Personal Legacy",
            title: "LIFE STORY/MEMOIR",
            description: "Use our system to curate your, your family’s or your business’s best moments for the year. The wins, the challenges, the staff who deserve to be celebrated. What a gift to your customers, your family, your community! Digital photos get lost, but set in a beautiful book? There forever. LEGACY.",
            icon: "BookHeart"
        },
        {
            label: "Professional Authority",
            title: "BUSINESS BOOK",
            description: "Launch your authority with your book. Share your wisdom, your achievements, and create the best calling card that lasts. The ripple effect is incredible: Key note speaking engagements, consulting, endless possibilities once you are an… AUTHOR!",
            icon: "Briefcase"
        },
        {
            label: "Annual Milestone",
            title: "A YEARBOOK",
            description: "Use our system to curate your, your family’s or your business’s best moments for the year. The wins, the challenges, the staff who deserve to be celebrated. What a gift to your customers, your family, your community! Digital photos get lost, but set in a beautiful book? There forever. LEGACY.",
            icon: "Calendar"
        }
    ],
    howItWorks: {
        heading: "From Chaos to Clarity.",
        steps: [
            {
                step: "01",
                title: "Share Your Story",
                description: "Upload voice notes, photos, or journals. Our RP Editor will fill in the gaps."
            },
            {
                step: "02",
                title: "We Craft the Narrative",
                description: "Your inputs are woven into a compelling narrative by our professional RP Editors. Then, choose from our curated selection of cover designs to give your book the look it deserves."
            },
            {
                step: "03",
                title: "Review & Refine",
                description: "You receive a beautiful digital draft. Make edits, add photos, and approve the layout."
            },
            {
                step: "04",
                title: "A Masterpiece Delivered",
                description: "Choose your format: a digital Ebook or a beautiful hardbound copy (additional cost). Then, sit back as your masterpiece is prepared and shipped directly to you."
            }
        ]
    },
    testimonials: [
        {
            quote: "I never thought my scribbles could look like this. It's not just a book; it's my legacy.",
            author: "Eleanor P.",
            role: "Retired Architect"
        },
        {
            quote: "The process was so therapeutic. Seeing my father's life story in print brought me to tears.",
            author: "Marcus J.",
            role: "Gift Giver"
        }
    ],
    stories: {
        heading: "Words from the Heart",
        subheading: "Real stories, real legacies preserved forever.",
        videos: [
            {
                title: "The Vision",
                subtitle: "Chrissie's Story",
                description: "Our founder, Chrissie, shares her personal drive to ensure every life story is celebrated and remembered.",
                // Using direct Google Drive stream link (uc?export=download&id=...)
                src: "https://www.youtube.com/watch?v=X_QUafL0XHs"
            },
            {
                title: "Our Promise",
                subtitle: "Remember Publisher",
                description: "We are dedicated to turning your life's journey into a timeless heirloom. Your story matters.",
                // Using direct Google Drive stream link (uc?export=download&id=...)
                src: "https://www.youtube.com/watch?v=6fIyAKYINWY"
            }
        ]
    },
    footer: {
        brand: "Remember Press",
        description: "Preserving stories, one page at a time.",
        links: [
            { label: "Offerings", href: "#offerings" },
            { label: "Process", href: "#process" },
            { label: "Stories", href: "#stories" },
            { label: "Pricing", href: "#pricing" }
        ],
        copyright: "© 2021 Remember Press. All rights reserved."
    }
};