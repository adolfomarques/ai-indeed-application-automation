"use client";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useMemo, useEffect } from "react";

const easeOut = [0.16, 1, 0.3, 1] as const;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const callbackError = searchParams.get("error");
  const urlError = useMemo(() => {
    if (!callbackError) return null;
    if (callbackError === "AccessDenied") {
      return "Acesso negado. Limite de usuários simultâneos atingido.";
    }
    if (callbackError === "OAuthCallback" || callbackError === "Callback") {
      return "Erro no retorno da autenticação Google. Verifique se a URI autorizada está cadastrada no Google Cloud Console.";
    }
    if (callbackError === "Configuration") {
      return "Erro de configuração de autenticação. Verifique se GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET estão definidos na Vercel.";
    }
    if (callbackError === "OAuthSignin") {
      return "Não foi possível iniciar o login com Google. Verifique suas credenciais OAuth.";
    }
    return `Falha na autenticação (${callbackError}). Por favor, tente novamente.`;
  }, [callbackError]);

  const displayError = error || urlError;

  // Pré-aquece o endpoint de autenticação no mount para eliminar cold start
  useEffect(() => {
    fetch("/api/auth/csrf").catch(() => {});
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      setError("Não foi possível conectar ao serviço de autenticação. Verifique sua conexão e tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-ambient-glow-top" />
      <div className="auth-ambient-glow-bottom" />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: easeOut }}
        className="auth-card"
      >
        {/* Top bar with brand & status badge */}
        <div className="auth-header">
          <div className="auth-brand">
            <div className="auth-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 5-2.5 5-2.5" />
                <path d="M12 15v5s3.03-.55 4.5-2c1.63-1.62 2.5-5 2.5-5" />
              </svg>
            </div>
            <div className="auth-brand-text">
              <span className="auth-brand-name">JobPilot AI</span>
              <span className="auth-brand-tagline">Quantum Suite</span>
            </div>
          </div>

          <div className="auth-status-badge">
            <span className="auth-status-dot" />
            <span>Sistema Ativo</span>
          </div>
        </div>

        {/* Central heading & subtitle */}
        <div className="auth-content">
          <h1 className="auth-heading">Centro de Comando</h1>
          <p className="auth-subtitle">
            Acesse o pipeline automatizado para monitorar vagas, filtrar oportunidades com IA e gerenciar candidaturas.
          </p>
        </div>

        {/* Error message if present */}
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
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

        {/* Google Sign-in button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="auth-google-btn"
        >
          {isLoading ? (
            <>
              <span className="auth-spinner" />
              <span>Conectando com o Google...</span>
            </>
          ) : (
            <>
              <GoogleIcon />
              <span>Continuar com Google</span>
            </>
          )}
        </button>

        {/* Security and feature trust badges */}
        <div className="auth-features">
          <div className="auth-feature-item">
            <div className="auth-feature-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span>Autenticação direta e segura via Google OAuth</span>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span>Execução autônoma de agendamentos e alertas</span>
          </div>
          <div className="auth-feature-item">
            <div className="auth-feature-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <span>Triagem precisa de vagas com filtros de IA</span>
          </div>
        </div>

        <p className="auth-footer">
          Ambiente seguro. Nenhum dado ou senha pessoal é armazenado externamente.
        </p>
      </motion.div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <div className="auth-container">
          <div className="auth-ambient-glow-top" />
          <div className="auth-card" style={{ opacity: 0.6 }}>
            <div className="auth-header">
              <div className="auth-brand">
                <div className="auth-logo" />
                <div className="auth-brand-text">
                  <span className="auth-brand-name">JobPilot AI</span>
                  <span className="auth-brand-tagline">Quantum Suite</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}

