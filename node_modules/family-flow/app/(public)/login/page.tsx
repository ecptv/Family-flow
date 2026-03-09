"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    // Simulate login — replace with real auth later
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a14",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus { outline: none; border-color: rgba(167,139,250,0.5) !important; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        .fade1 { animation: fadeUp 0.5s ease 0.1s both; }
        .fade2 { animation: fadeUp 0.5s ease 0.2s both; }
        .fade3 { animation: fadeUp 0.5s ease 0.3s both; }
        .fade4 { animation: fadeUp 0.5s ease 0.4s both; }
        .fade5 { animation: fadeUp 0.5s ease 0.5s both; }
        .float { animation: float 4s ease-in-out infinite; }
        .blob { animation: pulse 6s ease-in-out infinite; }
      `}</style>

      {/* Background blobs */}
      <div className="blob" style={{
        position: "absolute", top: "-20%", left: "-10%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)",
        pointerEvents: "none",
      }} />
      <div className="blob" style={{
        position: "absolute", bottom: "-20%", right: "-10%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(167,139,250,0.1), transparent 70%)",
        pointerEvents: "none",
        animationDelay: "3s",
      }} />

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 400,
        padding: "0 24px",
        position: "relative", zIndex: 1,
      }}>

        {/* Logo */}
        <div className="fade1" style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="float" style={{
            width: 64, height: 64, borderRadius: 20,
            background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, margin: "0 auto 16px",
            boxShadow: "0 8px 32px rgba(124,58,237,0.4)",
          }}>🏠</div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>
            FamilyFlow
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
            Sign in to your account
          </div>
        </div>

        {/* Form card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24, padding: "32px 28px",
          backdropFilter: "blur(20px)",
        }}>

          {/* Email */}
          <div className="fade2" style={{ marginBottom: 16 }}>
            <label style={{
              display: "block", fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.06em", marginBottom: 6,
            }}>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%", padding: "12px 14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, color: "#fff",
                fontSize: 14, fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
            />
          </div>

          {/* Password */}
          <div className="fade3" style={{ marginBottom: 8 }}>
            <label style={{
              display: "block", fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.06em", marginBottom: 6,
            }}>PASSWORD</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{
                  width: "100%", padding: "12px 44px 12px 14px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, color: "#fff",
                  fontSize: 14, fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: 12, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none",
                  color: "rgba(255,255,255,0.3)",
                  cursor: "pointer", fontSize: 16, padding: 0,
                }}
              >{showPassword ? "🙈" : "👁"}</button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="fade3" style={{ textAlign: "right", marginBottom: 24 }}>
            <a href="#" style={{
              fontSize: 12, color: "rgba(167,139,250,0.7)",
              textDecoration: "none",
            }}>Forgot password?</a>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: 10, padding: "10px 14px",
              fontSize: 13, color: "#F87171", marginBottom: 16,
            }}>{error}</div>
          )}

          {/* Login button */}
          <div className="fade4">
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: "100%", padding: "13px 0",
                borderRadius: 12, border: "none",
                background: loading
                  ? "rgba(167,139,250,0.3)"
                  : "linear-gradient(135deg, #7C3AED, #A78BFA)",
                color: "#fff", fontSize: 15,
                fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                boxShadow: loading ? "none" : "0 4px 20px rgba(124,58,237,0.4)",
                transition: "all 0.2s",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Signing in...
                </>
              ) : "Sign In"}
            </button>
          </div>
        </div>

        {/* Register link */}
        <div className="fade5" style={{
          textAlign: "center", marginTop: 24,
          fontSize: 13, color: "rgba(255,255,255,0.3)",
        }}>
          Don't have an account?{" "}
          <a href="#" style={{ color: "#A78BFA", textDecoration: "none", fontWeight: 600 }}>
            Contact your administrator
          </a>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}