"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

const easeOut = [0.16, 1, 0.3, 1] as const;

const stagger = {
  container: { initial: {}, animate: { transition: { staggerChildren: 0.12 } } },
  item: {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
  },
};

function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easeOut }}
      className="lp-nav"
    >
      <div className="lp-nav-inner">
        <div className="lp-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 5-2.5 5-2.5" />
            <path d="M12 15v5s3.03-.55 4.5-2c1.63-1.62 2.5-5 2.5-5" />
          </svg>
          <span className="lp-logo-text">JobPilot AI</span>
          <span className="lp-logo-tag">Quantum Suite</span>
        </div>
        <div className="lp-nav-links">
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#how-it-works" className="lp-nav-link">How It Works</a>
          <Link href="/auth/signin" className="lp-nav-cta">Sign In</Link>
        </div>
      </div>
    </motion.nav>
  );
}

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <motion.section ref={ref} style={{ scale, opacity }} className="lp-hero">
      <div className="lp-hero-glow" />
      <div className="lp-hero-grid" />
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="lp-hero-content">
        <motion.div variants={stagger.item} className="lp-hero-badge">
          <span className="lp-hero-badge-dot" />
          AI-Powered Job Automation
        </motion.div>
        <motion.h1 variants={stagger.item} className="lp-hero-title">
          Your Job Search,<br />
          <span className="lp-hero-accent">Fully Automated</span>
        </motion.h1>
        <motion.p variants={stagger.item} className="lp-hero-subtitle">
          JobPilot AI scrapes thousands of listings across multiple platforms, filters them with AI to find your perfect match, and auto-applies to the best opportunities. Stop scrolling and start landing.
        </motion.p>
        <motion.div variants={stagger.item} className="lp-hero-actions">
          <Link href="/auth/signin" className="lp-btn lp-btn-primary">
            Get Started Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <a href="#features" className="lp-btn lp-btn-secondary">
            Explore Features
          </a>
        </motion.div>
      </motion.div>
      <div className="lp-hero-scroll">
        <div className="lp-hero-scroll-line" />
        <span>Scroll</span>
      </div>
    </motion.section>
  );
}

function SectionHeading({ label, title }: { label: string; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="lp-section-heading"
    >
      <span className="lp-section-label">{label}</span>
      <h2 className="lp-section-title">{title}</h2>
    </motion.div>
  );
}

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    label: "Multi-Platform",
    title: "Scrape Across All Major Job Boards",
    description: "Search Indeed, LinkedIn, Glassdoor, Google Jobs, ZipRecruiter, and more simultaneously. Configure keywords, locations, and freshness filters to cast the perfect net.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
    label: "AI Filtering",
    title: "Smart Matching With Your Preferences",
    description: "Our AI analyzes every job against your resume, skills, and preferences. It scores each match from 0-10 with detailed reasoning so you know exactly why a job fits.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /><line x1="4" y1="4" x2="9" y2="9" />
      </svg>
    ),
    label: "Auto-Apply",
    title: "Automated Application Submission",
    description: "Browser automation handles the tedious work of filling out and submitting applications for your best matches. Set it up once and let it run on autopilot.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    label: "Scheduling",
    title: "Daily Runs on Your Schedule",
    description: "Configure the pipeline to run daily, weekly, or on custom schedules. Each run scrapes fresh listings, re-filters, and exports matched opportunities to CSV.",
  },
];

function Features() {
  return (
    <section id="features" className="lp-section lp-features">
      <SectionHeading label="Capabilities" title="Everything You Need to Land the Role" />
      <div className="lp-features-grid">
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: easeOut, delay: i * 0.1 }}
            className="lp-feature-card"
          >
            <div className="lp-feature-icon">{f.icon}</div>
            <span className="lp-feature-label">{f.label}</span>
            <h3 className="lp-feature-title">{f.title}</h3>
            <p className="lp-feature-desc">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: "01", label: "Scrape", desc: "JobPilot searches multiple platforms simultaneously with your criteria. Results are deduplicated and formatted for AI analysis." },
    { num: "02", label: "Filter", desc: "Gemini AI evaluates every listing against your resume and preferences. Only high-quality matches with strong scores move forward." },
    { num: "03", label: "Apply", desc: "Browser automation submits applications to your best matches. Monitor progress, review results, and export data anytime." },
  ];

  return (
    <section id="how-it-works" className="lp-section lp-pipeline">
      <SectionHeading label="Pipeline" title="Three Steps From Search to Submission" />
      <div className="lp-pipeline-flow">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: easeOut, delay: i * 0.15 }}
            className="lp-pipeline-step"
          >
            <div className="lp-pipeline-step-num">{step.num}</div>
            <h3 className="lp-pipeline-step-label">{step.label}</h3>
            <p className="lp-pipeline-step-desc">{step.desc}</p>
            {i < steps.length - 1 && <div className="lp-pipeline-connector" />}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { value: "8+", label: "Job boards supported" },
    { value: "Any", label: "AI provider (Gemini, Groq, OpenAI, etc.)" },
    { value: "24/7", label: "Automated pipeline" },
    { value: "100%", label: "Free to self-host on Vercel" },
  ];

  return (
    <section className="lp-section lp-stats">
      <div className="lp-stats-grid">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: easeOut, delay: i * 0.08 }}
            className="lp-stat"
          >
            <span className="lp-stat-value">{item.value}</span>
            <span className="lp-stat-label">{item.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="lp-section lp-cta">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="lp-cta-content"
      >
        <div className="lp-cta-glow" />
        <h2 className="lp-cta-title">Ready to Automate Your Job Search?</h2>
        <p className="lp-cta-desc">
          Join professionals who save hours every week with AI-powered job automation. Set up your pipeline in minutes.
        </p>
        <Link href="/auth/signin" className="lp-btn lp-btn-primary lp-btn-large">
          Get Started Free
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <div className="lp-footer-brand">
          <div className="lp-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
              <path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 5-2.5 5-2.5" />
              <path d="M12 15v5s3.03-.55 4.5-2c1.63-1.62 2.5-5 2.5-5" />
            </svg>
            <span className="lp-logo-text" style={{ fontSize: 15 }}>JobPilot AI</span>
          </div>
          <p className="lp-footer-copy">AI-powered job application automation.</p>
        </div>
        <div className="lp-footer-links">
          <Link href="/auth/signin" className="lp-footer-link">Sign In</Link>
          <a href="#features" className="lp-footer-link">Features</a>
          <a href="#how-it-works" className="lp-footer-link">How It Works</a>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="lp-root">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <FinalCTA />
      <Footer />
    </div>
  );
}
