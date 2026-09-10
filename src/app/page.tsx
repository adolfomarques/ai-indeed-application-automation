"use client";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
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

// ── Fixed Top Scroll Progress Neon Beam ──
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{
        scaleX,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)",
        transformOrigin: "0%",
        zIndex: 100,
        boxShadow: "0 0 14px rgba(129, 140, 248, 0.9)",
      }}
    />
  );
}

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div ref={wrapperRef} className="lp-cockpit-wrapper" style={{ perspective: 1200 }}>
      <motion.div
        style={{ rotateX, scale }}
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
            <motion.span
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="lp-hero-badge-dot"
            />
            <span>8 Boards Active</span>
          </div>
        </div>

        <div className="lp-cockpit-body">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ position: "relative", width: "100%", height: "100%" }}
              >
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
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: [-4, 6, -4],
                  }}
                  transition={{
                    opacity: { delay: 0.4, duration: 0.5 },
                    y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                  }}
                  className="lp-floating-badge lp-badge-1"
                >
                  <span className="lp-hero-badge-dot" />
                  <span>98% Fit • Senior Full-Stack Engineer</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: [4, -6, 4],
                  }}
                  transition={{
                    opacity: { delay: 0.6, duration: 0.5 },
                    y: { repeat: Infinity, duration: 4.5, ease: "easeInOut" },
                  }}
                  className="lp-floating-badge lp-badge-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <span>1,429 Jobs Indexed in 4.2s</span>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "telemetry" && (
              <motion.div
                key="telemetry"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="lp-interactive-screen"
              >
                <div className="lp-telemetry-grid">
                  <div className="lp-telemetry-scanner">
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8" }}>
                      <span>RADAR: 8 ACTIVE CHANNELS</span>
                      <span style={{ color: "#4ade80", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="lp-hero-badge-dot" /> LIVE SWEEP
                      </span>
                    </div>

                    <div className="lp-radar-circle">
                      <div className="lp-radar-sweep" />
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#818cf8", zIndex: 2 }}>
                        8 BOARDS
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#cbd5e1" }}>
                      <span>Throughput: <strong style={{ color: "#38bdf8" }}>48 req/sec</strong></span>
                      <span>AI Inference: <strong style={{ color: "#4ade80" }}>380ms</strong></span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", justifyContent: "center" }}>
                    {[
                      { site: "LinkedIn API", count: "412 jobs indexed", lat: "142ms", color: "#38bdf8" },
                      { site: "Indeed Aggregator", count: "645 jobs indexed", lat: "210ms", color: "#60a5fa" },
                      { site: "Glassdoor Engine", count: "284 jobs indexed", lat: "185ms", color: "#4ade80" },
                      { site: "ZipRecruiter Stream", count: "88 jobs indexed", lat: "98ms", color: "#a855f7" },
                    ].map((row, idx) => (
                      <motion.div
                        key={row.site}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          background: "rgba(255, 255, 255, 0.03)",
                          borderRadius: "10px",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: row.color }} />
                          <span style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>{row.site}</span>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          <span style={{ color: "#e2e8f0", marginRight: 8 }}>{row.count}</span>
                          <span style={{ color: "#4ade80" }}>{row.lat}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "dispatch" && (
              <motion.div
                key="dispatch"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="lp-interactive-screen"
                style={{ padding: "20px 24px", justifyContent: "center" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div className="lp-terminal-line info">[08:14:02.102] INITIALIZING HEADLESS RUNNER v2.4 (Chromium/Puppeteer)</div>
                  <div className="lp-terminal-line">[08:14:02.410] CONNECT: Active session attached to Google Chrome profile</div>
                  <div className="lp-terminal-line success">[08:14:03.018] TARGET: Vortex Dynamics — Senior Full-Stack Engineer</div>
                  <div className="lp-terminal-line">[08:14:03.520] AI MATCH: Gemini Flash 2.5 scored 9.8 / 10 (Direct stack match)</div>
                  <div className="lp-terminal-line">[08:14:04.110] DISPATCH: Autofilling application form fields & resume PDF</div>
                  <div className="lp-terminal-line success">[08:14:05.340] SUBMITTED: Confirmation code #VD-889392 received successfully!</div>
                  <div className="lp-terminal-line info">
                    [08:14:05.900] NEXT: Awaiting trigger schedule for next run...
                    <span className="lp-terminal-cursor" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.15]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 35]);

  return (
    <motion.section ref={ref} style={{ scale, opacity, y }} className="lp-hero">
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
  const ribbonRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: ribbonRef, offset: ["start end", "end start"] });
  const yOffset = useTransform(scrollYProgress, [0, 1], [20, -10]);

  const stats = [
    { value: "8+", label: "Integrated Job Boards", sub: "LinkedIn, Indeed, Glassdoor & more" },
    { value: "< 4.2s", label: "Multi-threaded Query Time", sub: "Python JobSpy engine execution" },
    { value: "98.4%", label: "AI Screening Precision", sub: "Gemini 2.5 scoring threshold" },
    { value: "38 hrs", label: "Monthly Time Saved", sub: "Average candidate automation" },
  ];

  return (
    <motion.div ref={ribbonRef} style={{ y: yOffset }} className="lp-ribbon">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 24 }}
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
    </motion.div>
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
        {/* Large 2-column feature card with animated pipeline track */}
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

          <div style={{ position: "relative" }}>
            <div className="lp-bento-media">
              <Image
                src="/images/pipeline-flow.jpg"
                alt="Autonomous AI Job Intelligence Pipeline Flow"
                width={1280}
                height={720}
                className="lp-cockpit-img"
              />
            </div>

            {/* Live Pipeline Flow Tracker */}
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                left: "14px",
                right: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 14px",
                borderRadius: "10px",
                background: "rgba(10, 15, 26, 0.88)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <motion.span
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="lp-hero-badge-dot"
                />
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>Live Execution Loop</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", color: "rgba(226, 232, 240, 0.8)" }}>
                <span style={{ color: "#38bdf8" }}>Scrape ➜</span>
                <span style={{ color: "#818cf8" }}>Gemini Filter ➜</span>
                <span style={{ color: "#4ade80" }}>Auto-Apply ✓</span>
              </div>
            </div>
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
              <motion.div
                initial={{ width: "0%" }}
                whileInView={{ width: "96%" }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 1.2, ease: easeOut }}
                className="lp-match-progress-fill"
              />
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
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="lp-hero-badge-dot"
              />
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
            {["LinkedIn", "Indeed", "Glassdoor", "ZipRecruiter", "Google Jobs", "Bayt", "RemoteOK", "WeWorkRemotely"].map((b, idx) => (
              <motion.div
                key={b}
                whileHover={{ scale: 1.04, borderColor: "rgba(99,102,241,0.4)" }}
                className="lp-board-item"
              >
                <motion.span
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2.2, delay: idx * 0.25 }}
                  className="lp-hero-badge-dot"
                />
                <span>{b}</span>
              </motion.div>
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
              {/* Animated Radial Meter */}
              <div style={{ position: "relative", width: 72, height: 72 }}>
                <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                  <motion.circle
                    cx="36"
                    cy="36"
                    r="28"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="4.5"
                    strokeDasharray={2 * Math.PI * 28}
                    initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                    animate={{ strokeDashoffset: (1 - selectedRole.score / 10) * 2 * Math.PI * 28 }}
                    transition={{ duration: 0.8, ease: easeOut }}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: "#fff" }}>
                  {selectedRole.percent}
                </div>
              </div>

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

// ── Scroll-Driven Performance Velocity Chart ──
function AnimatedPerformanceChart() {
  const [metric, setMetric] = useState<"volume" | "conversion">("volume");
  const sectionRef = useRef<HTMLElement>(null);

  // Hook directly into scroll position of this exact section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "center 40%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 24,
    restDelta: 0.001,
  });

  // Curve path length binds directly to page scroll!
  const pathLength = useTransform(smoothProgress, [0, 0.85], [0.05, 1]);
  const fillOpacity = useTransform(smoothProgress, [0.05, 0.75], [0.02, 0.35]);

  // Lead point coordinates (cx, cy) tracking the wave as you scroll
  const dotX = useTransform(smoothProgress, [0, 0.85], [15, 800]);
  const dotY = useTransform(
    smoothProgress,
    [0, 0.25, 0.55, 0.85],
    metric === "volume" ? [190, 155, 95, 35] : [210, 175, 90, 25]
  );
  const dotOpacity = useTransform(smoothProgress, [0, 0.08], [0, 1]);

  // Secondary manual application baseline curve
  const manualPathLength = useTransform(smoothProgress, [0, 0.7], [0.1, 1]);

  return (
    <section ref={sectionRef} id="metrics" className="lp-section">
      <div className="lp-section-header">
        <h2 className="lp-section-title">Telemetry & Application Velocity</h2>
        <p className="lp-section-desc">
          Scroll down to watch your pipeline throughput, AI scoring yields, and interview conversion progression accelerate.
        </p>
      </div>

      <div className="lp-chart-card">
        <div className="lp-chart-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>
                {metric === "volume" ? "Weekly Automated Applications" : "Interview Conversion Acceleration"}
              </h3>
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
                Scroll-Driven Live Scrub
              </span>
            </div>
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

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px", fontSize: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: 14, height: 3, background: "linear-gradient(90deg, #38bdf8, #c084fc)", borderRadius: 2 }} />
            <span style={{ color: "#ffffff", fontWeight: 600 }}>JobPilot AI Velocity (248 apps/wk)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: 14, height: 2, borderTop: "2px dashed rgba(239, 68, 68, 0.6)" }} />
            <span style={{ color: "rgba(226, 232, 240, 0.55)" }}>Manual Search Limit (~18 apps/wk)</span>
          </div>
        </div>

        {/* Main Wave SVG Chart (Draws with Scroll) */}
        <div className="lp-chart-svg-wrap">
          <svg viewBox="0 0 800 240" style={{ width: "100%", height: "100%", overflow: "visible" }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="60" x2="800" y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <line x1="0" y1="120" x2="800" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <line x1="0" y1="180" x2="800" y2="180" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

            {/* Baseline Manual Search (Flatline) */}
            <motion.path
              style={{ pathLength: manualPathLength }}
              d="M 0 215 Q 200 210, 400 208 T 800 205"
              fill="none"
              stroke="rgba(239, 68, 68, 0.4)"
              strokeWidth="2"
              strokeDasharray="5 5"
            />

            {/* JobPilot AI Autopilot Wave Curve (Driven by User Scroll) */}
            <motion.path
              style={{ pathLength, fillOpacity }}
              d={metric === "volume"
                ? "M 0 190 Q 150 160, 250 110 T 500 70 T 800 35 L 800 240 L 0 240 Z"
                : "M 0 210 Q 200 190, 350 130 T 600 60 T 800 25 L 800 240 L 0 240 Z"
              }
              fill="url(#chartGradient)"
            />

            <motion.path
              style={{ pathLength }}
              d={metric === "volume"
                ? "M 0 190 Q 150 160, 250 110 T 500 70 T 800 35"
                : "M 0 210 Q 200 190, 350 130 T 600 60 T 800 25"
              }
              fill="none"
              stroke="url(#strokeGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Scroll-tracked Glowing Focal Point */}
            <motion.circle
              style={{ cx: dotX, cy: dotY, opacity: dotOpacity }}
              r="6"
              fill="#38bdf8"
            />
            <motion.circle
              style={{ cx: dotX, cy: dotY, opacity: dotOpacity }}
              r="14"
              fill="rgba(56, 189, 248, 0.35)"
            />
          </svg>
        </div>

        {/* Scroll-Reactive Weekly Throughput Histogram */}
        <div className="lp-histogram-wrap">
          {[
            { week: "W1 Setup", pct: 18 },
            { week: "W2 Calibrate", pct: 36 },
            { week: "W3 Multi-Board", pct: 58 },
            { week: "W4 Full Scale", pct: 78 },
            { week: "W5 Optimized", pct: 90 },
            { week: "W6 Peak Velocity", pct: 100 },
          ].map((b, i) => (
            <div key={b.week} className="lp-histogram-col">
              <div style={{ height: "60px", display: "flex", alignItems: "flex-end", width: "100%", justifyContent: "center" }}>
                <motion.div
                  className="lp-histogram-bar"
                  style={{
                    height: useTransform(
                      smoothProgress,
                      [i * 0.08, 0.25 + i * 0.1],
                      ["8px", `${b.pct * 0.58}px`]
                    ),
                  }}
                />
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                {b.week}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", fontSize: "12px", color: "#64748b" }}>
          <span>Week 1 (Setup)</span>
          <span>Week 2 (Neural Calibration)</span>
          <span>Week 3 (Multi-Board Scaling)</span>
          <span style={{ color: "#a5b4fc", fontWeight: 600 }}>Week 4-6 (Peak Interview Velocity)</span>
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
    <div className="lp-root" style={{ position: "relative", overflow: "hidden" }}>
      {/* Scroll-Driven Top Neon Beam */}
      <ScrollProgressBar />

      {/* Floating Background Ambient Glow Orbs */}
      <div
        style={{
          position: "fixed",
          top: "15%",
          left: "-15%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "floatSmooth 12s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "55%",
          right: "-15%",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
          animation: "floatSmooth 16s ease-in-out infinite reverse",
        }}
      />

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
