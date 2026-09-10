"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const easeOut = [0.16, 1, 0.3, 1] as const;

const stagger = {
  container: { initial: {}, animate: { transition: { staggerChildren: 0.1 } } },
  item: {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
  },
};

function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="lp-nav"
    >
      <div className="lp-nav-inner">
        <div className="lp-logo">
          <div className="lp-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
              <path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 5-2.5 5-2.5" />
              <path d="M12 15v5s3.03-.55 4.5-2c1.63-1.62 2.5-5 2.5-5" />
            </svg>
          </div>
          <span className="lp-logo-text">JobPilot AI</span>
          <span className="lp-logo-tag">Quantum Suite</span>
        </div>

        <div className="lp-nav-links">
          <a href="#pipeline" className="lp-nav-link">Pipeline</a>
          <a href="#sandbox" className="lp-nav-link">AI Screening</a>
          <a href="#metrics" className="lp-nav-link">Performance</a>
          <Link href="/auth/signin" className="lp-nav-cta">Command Center</Link>
        </div>
      </div>
    </motion.nav>
  );
}

function InteractiveCockpit() {
  const [activeTab, setActiveTab] = useState<"overview" | "telemetry" | "dispatch">("overview");

  return (
    <div className="lp-cockpit-wrapper">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 0.2 }}
        className="lp-cockpit-frame"
      >
        <div className="lp-cockpit-toolbar">
          <div className="lp-cockpit-dots">
            <span className="lp-cockpit-dot" style={{ background: "#ef4444" }} />
            <span className="lp-cockpit-dot" style={{ background: "#f59e0b" }} />
            <span className="lp-cockpit-dot" style={{ background: "#10b981" }} />
          </div>

          <div className="lp-cockpit-tabs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`lp-cockpit-tab ${activeTab === "overview" ? "active" : ""}`}
            >
              Command Center
            </button>
            <button
              onClick={() => setActiveTab("telemetry")}
              className={`lp-cockpit-tab ${activeTab === "telemetry" ? "active" : ""}`}
            >
              Live Telemetry
            </button>
            <button
              onClick={() => setActiveTab("dispatch")}
              className={`lp-cockpit-tab ${activeTab === "dispatch" ? "active" : ""}`}
            >
              Dispatch Stream
            </button>
          </div>

          <div className="lp-cockpit-status">
            <span className="lp-hero-badge-dot" />
            <span>8 Boards Active</span>
          </div>
        </div>

        <div className="lp-cockpit-body">
          <Image
            src="/images/dashboard-cockpit.jpg"
            alt="JobPilot AI Command Center Interface"
            width={1920}
            height={1080}
            priority
            className="lp-cockpit-img"
          />

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="lp-floating-badge lp-badge-1"
          >
            <span className="lp-hero-badge-dot" />
            <span>98% Fit • Senior Full-Stack Engineer</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="lp-floating-badge lp-badge-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>1,429 Jobs Indexed in 4.2s</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <motion.section ref={ref} style={{ scale, opacity }} className="lp-hero">
      <div className="lp-hero-glow-top" />

      <motion.div variants={stagger.container} initial="initial" animate="animate" className="lp-hero-content">
        <motion.div variants={stagger.item} className="lp-hero-badge">
          <span className="lp-hero-badge-dot" />
          Autonomous Career Intelligence • v1.6.0
        </motion.div>

        <motion.h1 variants={stagger.item} className="lp-hero-title">
          Your Job Search,<br />
          <span className="lp-hero-accent">Fully Autonomous.</span>
        </motion.h1>

        <motion.p variants={stagger.item} className="lp-hero-subtitle">
          JobPilot AI monitors 8+ job boards 24/7, evaluates listings with Gemini 2.5 against your exact experience, and auto-applies to your highest-affinity roles.
        </motion.p>

        <motion.div variants={stagger.item} className="lp-hero-actions">
          <Link href="/auth/signin" className="lp-btn lp-btn-primary">
            Launch Command Center
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <a href="#pipeline" className="lp-btn lp-btn-secondary">
            Explore Architecture
          </a>
        </motion.div>
      </motion.div>

      <InteractiveCockpit />
    </motion.section>
  );
}

function TelemetryRibbon() {
  const stats = [
    { value: "8+", label: "Integrated Job Boards", sub: "LinkedIn, Indeed, Glassdoor & more" },
    { value: "< 4.2s", label: "Multi-threaded Query Time", sub: "Python JobSpy engine execution" },
    { value: "98.4%", label: "AI Screening Precision", sub: "Gemini 2.5 scoring threshold" },
    { value: "38 hrs", label: "Monthly Time Saved", sub: "Average candidate automation" },
  ];

  return (
    <div className="lp-ribbon">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: easeOut }}
          className="lp-ribbon-item"
        >
          <div className="lp-ribbon-val">{s.value}</div>
          <div className="lp-ribbon-label">{s.label}</div>
          <div style={{ fontSize: "11px", color: "rgba(148, 163, 184, 0.6)", marginTop: "4px" }}>
            {s.sub}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function BentoPipelineSection() {
  return (
    <section id="pipeline" className="lp-section">
      <div className="lp-section-header">
        <h2 className="lp-section-title">Autonomous Pipeline Architecture</h2>
        <p className="lp-section-desc">
          Engineered for high-volume discovery without spam. Intelligent multi-threaded collection, semantic reasoning, and headless browser submission.
        </p>
      </div>

      <div className="lp-bento-grid">
        {/* Large 2-column feature card with generated pipeline flow visual */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="lp-bento-card lp-bento-col-2"
        >
          <div>
            <h3 className="lp-bento-title">3-Stage Neural Pipeline: Scrape → Filter → Apply</h3>
            <p className="lp-bento-text">
              Parallel workers query all primary job aggregators simultaneously. Raw markdown descriptions pass through Gemini AI for candidate resume fit analysis before triggering automated browser applications.
            </p>
          </div>

          <div className="lp-bento-media">
            <Image
              src="/images/pipeline-flow.jpg"
              alt="Autonomous AI Job Intelligence Pipeline Flow"
              width={1280}
              height={720}
              className="lp-cockpit-img"
            />
          </div>

          <div className="lp-bento-tags">
            <span className="lp-bento-tag">LinkedIn API</span>
            <span className="lp-bento-tag">Indeed Engine</span>
            <span className="lp-bento-tag">Gemini 2.5 Flash</span>
            <span className="lp-bento-tag">Puppeteer Headless</span>
          </div>
        </motion.div>

        {/* Medium card 1: AI Reasoning */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: easeOut }}
          className="lp-bento-card"
        >
          <div>
            <h3 className="lp-bento-title">Semantic Evaluation</h3>
            <p className="lp-bento-text">
              No generic keyword matching. Our AI reads job descriptions like a senior hiring manager, identifying exact stack synergy, level alignment, and compensation fitness.
            </p>
          </div>

          <div className="lp-match-progress-box">
            <div className="lp-match-progress-header">
              <span style={{ color: "var(--text-secondary)" }}>Match Threshold</span>
              <span style={{ color: "var(--success)", fontWeight: 700 }}>9.6 / 10</span>
            </div>
            <div className="lp-match-progress-bar">
              <div className="lp-match-progress-fill" />
            </div>
          </div>

          <div className="lp-bento-tags">
            <span className="lp-bento-tag">Zero Keyword Fluff</span>
            <span className="lp-bento-tag">Skills Diff Matrix</span>
          </div>
        </motion.div>

        {/* Medium card 2: Cloud Autopilot & Cron */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15, ease: easeOut }}
          className="lp-bento-card"
        >
          <div>
            <h3 className="lp-bento-title">24/7 Cloud Autopilot</h3>
            <p className="lp-bento-text">
              Configured with Upstash QStash and Vercel Cron. Set schedules to scrape daily at 8:00 AM, apply before hiring managers open their inboxes, and receive curated CSV reports.
            </p>
          </div>

          <div className="lp-schedule-list">
            <div className="lp-schedule-item">
              <span className="lp-hero-badge-dot" />
              <span>Next trigger: Tomorrow at 08:00 UTC</span>
            </div>
            <div className="lp-schedule-item">
              <span className="lp-hero-badge-dot" style={{ background: "var(--accent-primary)" }} />
              <span>Serverless execution on Vercel Edge</span>
            </div>
          </div>

          <div className="lp-bento-tags">
            <span className="lp-bento-tag">QStash Queues</span>
            <span className="lp-bento-tag">Zero Infrastructure</span>
          </div>
        </motion.div>

        {/* Large 2-column feature card: Multi-board Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: easeOut }}
          className="lp-bento-card lp-bento-col-2"
        >
          <div>
            <h3 className="lp-bento-title">Unified Multi-Board Search Engine</h3>
            <p className="lp-bento-text">
              Direct integration with Indeed, LinkedIn, Glassdoor, ZipRecruiter, Google Jobs, and Bayt. Deduplicates repeat postings across boards automatically to ensure you never apply to the same role twice.
            </p>
          </div>

          <div className="lp-board-grid">
            {["LinkedIn", "Indeed", "Glassdoor", "ZipRecruiter", "Google Jobs", "Bayt", "RemoteOK", "WeWorkRemotely"].map((b) => (
              <div key={b} className="lp-board-item">
                <span className="lp-hero-badge-dot" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          <div className="lp-bento-tags">
            <span className="lp-bento-tag">Cross-Board Deduplication</span>
            <span className="lp-bento-tag">Freshness Filtering</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function InteractiveRoleSandbox() {
  const roles = [
    {
      id: "fullstack",
      title: "Senior Full-Stack Engineer",
      company: "Stripe • Remote US",
      score: 9.8,
      percent: "98%",
      skills: ["Next.js 15", "TypeScript", "Distributed Systems", "PostgreSQL", "TailwindCSS"],
      reasoning:
        "Candidate has 7+ years in production distributed web applications. Strong synergy with React Server Components, high-concurrency payment APIs, and real-time event streaming architectures.",
      status: "Auto-Apply Queued",
    },
    {
      id: "ai-systems",
      title: "Staff AI Systems Engineer",
      company: "Anthropic • San Francisco, CA",
      score: 9.6,
      percent: "96%",
      skills: ["Python", "vLLM", "Vector Databases", "Model Evaluation", "Kubernetes"],
      reasoning:
        "Demonstrated mastery of agentic loops, prompt optimization, and low-latency inference pipelines. Direct match for multi-agent autonomous execution requirements.",
      status: "Application Dispatched",
    },
    {
      id: "product-design",
      title: "Lead Product Designer",
      company: "Linear • Remote Global",
      score: 9.4,
      percent: "94%",
      skills: ["Figma", "Design Systems", "Micro-Interactions", "Liquid Easing", "CSS"],
      reasoning:
        "Exceptional portfolio demonstrating high-craft developer tool UIs, keyboard-first desktop interactions, and dark mode glass aesthetics. Aligns with Apple-Pro product standards.",
      status: "Auto-Apply Queued",
    },
  ];

  const [selectedRole, setSelectedRole] = useState(roles[0]);

  return (
    <section id="sandbox" className="lp-section">
      <div className="lp-section-header">
        <h2 className="lp-section-title">Interactive AI Screening Lab</h2>
        <p className="lp-section-desc">
          See how the neural evaluation model scores real job requirements against candidate profiles in sub-second inference.
        </p>
      </div>

      <div className="lp-sandbox-card">
        <div className="lp-sandbox-nav">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRole(r)}
              className={`lp-sandbox-btn ${selectedRole.id === r.id ? "active" : ""}`}
            >
              <div className="lp-sandbox-role-title">{r.title}</div>
              <div className="lp-sandbox-role-sub">{r.company}</div>
            </button>
          ))}
        </div>

        <motion.div
          key={selectedRole.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easeOut }}
          className="lp-sandbox-view"
        >
          <div>
            <div className="lp-match-gauge">
              <div className="lp-gauge-score">{selectedRole.percent}</div>
              <div className="lp-gauge-info">
                <h4>{selectedRole.title}</h4>
                <p>{selectedRole.company} • Score: {selectedRole.score} / 10</p>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
              {selectedRole.skills.map((s) => (
                <span key={s} className="lp-bento-tag" style={{ background: "rgba(34, 197, 94, 0.12)", borderColor: "rgba(34, 197, 94, 0.25)", color: "#86efac" }}>
                  ✓ {s}
                </span>
              ))}
            </div>

            <div className="lp-reasoning-box">
              <strong style={{ color: "#ffffff", display: "block", marginBottom: "4px" }}>AI Reasoning:</strong>
              {selectedRole.reasoning}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Pipeline State</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#4ade80", display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="lp-hero-badge-dot" />
              {selectedRole.status}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function AnimatedPerformanceChart() {
  const [metric, setMetric] = useState<"volume" | "conversion">("volume");

  return (
    <section id="metrics" className="lp-section">
      <div className="lp-section-header">
        <h2 className="lp-section-title">Telemetry & Application Velocity</h2>
        <p className="lp-section-desc">
          Measurable leverage. Monitor your pipeline throughput, AI scoring yields, and interview conversion progression.
        </p>
      </div>

      <div className="lp-chart-card">
        <div className="lp-chart-header">
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", marginBottom: "4px" }}>
              {metric === "volume" ? "Weekly Automated Applications" : "Interview Conversion Acceleration"}
            </h3>
            <p style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.65)" }}>
              {metric === "volume" ? "Continuous background submissions across all configured schedules" : "Higher match relevance drives a 3.4x interview invite multiplier"}
            </p>
          </div>

          <div className="lp-cockpit-tabs">
            <button
              onClick={() => setMetric("volume")}
              className={`lp-cockpit-tab ${metric === "volume" ? "active" : ""}`}
            >
              Applications Volume
            </button>
            <button
              onClick={() => setMetric("conversion")}
              className={`lp-cockpit-tab ${metric === "conversion" ? "active" : ""}`}
            >
              Interview Rate
            </button>
          </div>
        </div>

        <div className="lp-chart-svg-wrap">
          <svg viewBox="0 0 800 240" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="60" x2="800" y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <line x1="0" y1="120" x2="800" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <line x1="0" y1="180" x2="800" y2="180" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

            {/* Dynamic Curve */}
            {metric === "volume" ? (
              <>
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: easeOut }}
                  d="M 0 190 Q 150 160, 250 110 T 500 70 T 800 35 L 800 240 L 0 240 Z"
                  fill="url(#chartGradient)"
                />
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: easeOut }}
                  d="M 0 190 Q 150 160, 250 110 T 500 70 T 800 35"
                  fill="none"
                  stroke="url(#strokeGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="800" cy="35" r="6" fill="#c084fc" />
                <circle cx="800" cy="35" r="12" fill="rgba(192, 132, 252, 0.3)" />
              </>
            ) : (
              <>
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: easeOut }}
                  d="M 0 210 Q 200 190, 350 130 T 600 60 T 800 25 L 800 240 L 0 240 Z"
                  fill="url(#chartGradient)"
                />
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: easeOut }}
                  d="M 0 210 Q 200 190, 350 130 T 600 60 T 800 25"
                  fill="none"
                  stroke="url(#strokeGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="800" cy="25" r="6" fill="#22c55e" />
                <circle cx="800" cy="25" r="12" fill="rgba(34, 197, 94, 0.3)" />
              </>
            )}
          </svg>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", fontSize: "12px", color: "#64748b" }}>
          <span>Week 1 (Setup)</span>
          <span>Week 2 (Neural Calibration)</span>
          <span>Week 3 (Multi-Board Scaling)</span>
          <span style={{ color: "#a5b4fc", fontWeight: 600 }}>Week 4 (Peak Interview Velocity)</span>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="lp-section">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: easeOut }}
        className="lp-cta-card"
      >
        <div className="lp-cta-glow" />
        <h2 className="lp-cta-title">Ready to Automate Your Job Search?</h2>
        <p className="lp-cta-desc">
          Stop spending dozens of hours manually scanning job listings. Configure your autonomous pipeline once and let intelligent agents work around the clock.
        </p>

        <Link href="/auth/signin" className="lp-btn lp-btn-primary lp-btn-large" style={{ padding: "15px 32px", fontSize: "15px" }}>
          Get Started Free
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="lp-logo-icon" style={{ width: "26px", height: "26px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            </svg>
          </div>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>JobPilot AI</span>
          <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "8px" }}>© 2026 • All rights reserved</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "13.5px" }}>
          <Link href="/auth/signin" className="lp-nav-link" style={{ padding: "4px 8px" }}>Sign In</Link>
          <a href="#pipeline" className="lp-nav-link" style={{ padding: "4px 8px" }}>Architecture</a>
          <a href="#sandbox" className="lp-nav-link" style={{ padding: "4px 8px" }}>AI Screening</a>
          <a href="#metrics" className="lp-nav-link" style={{ padding: "4px 8px" }}>Velocity</a>
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
      <TelemetryRibbon />
      <BentoPipelineSection />
      <InteractiveRoleSandbox />
      <AnimatedPerformanceChart />
      <FinalCTA />
      <Footer />
    </div>
  );
}
