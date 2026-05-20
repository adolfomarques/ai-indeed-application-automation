"use client";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useMemo } from "react";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const callbackError = searchParams.get("error");
  const urlError = useMemo(() => {
    if (!callbackError) return null;
    if (callbackError === "AccessDenied") {
      return "Access denied. Maximum concurrent users reached. Please try again later.";
    }
    if (callbackError === "Callback") {
      return "Session expired. Please sign in again.";
    }
    return "Authentication failed. Please try again.";
  }, [callbackError]);

  const displayError = error || urlError;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      setError("Unable to connect to the authentication service. Please check your network and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bg-gradient" />
      <div className="auth-bg-grid" />

      <div className="auth-panel">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="auth-card"
        >
          <div className="auth-brand">
            <div className="auth-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 5-2.5 5-2.5" />
                <path d="M12 15v5s3.03-.55 4.5-2c1.63-1.62 2.5-5 2.5-5" />
              </svg>
            </div>
            <div className="auth-brand-text">
              <h1 className="auth-brand-name">JobPilot AI</h1>
              <span className="auth-brand-tagline">Quantum Suite</span>
            </div>
          </div>

          <div className="auth-divider" />

          <h2 className="auth-heading">Access your command center</h2>
          <p className="auth-subtitle">
            Sign in to manage your automated job pipeline, review AI-matched opportunities, and track application progress across all your configured schedules.
          </p>

          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="auth-error"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{displayError}</span>
            </motion.div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="auth-google-btn"
          >
            {isLoading ? (
              <>
                <span className="auth-spinner" />
                <span>Redirecting to Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <p className="auth-footer">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>

      <div className="auth-decorative">
        <div className="auth-deco-ring" />
        <div className="auth-deco-ring auth-deco-ring-outer" />
        <div className="auth-deco-dots" />
        <div className="auth-deco-lines" />
        <div className="auth-deco-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Automated pipeline</span>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="auth-container">
        <div className="auth-bg-gradient" />
        <div className="auth-panel">
          <div className="auth-card" style={{ opacity: 0.5 }}>
            <div className="auth-brand">
              <div className="auth-logo" />
              <div className="auth-brand-text">
                <h1 className="auth-brand-name">JobPilot AI</h1>
                <span className="auth-brand-tagline">Quantum Suite</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
