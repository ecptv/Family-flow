"use client";

import { useState, useEffect, useRef } from "react";

const features = [
  {
    icon: "😊",
    title: "Mood Tracking",
    desc: "Children log how they feel daily with simple emoji check-ins. Parents see patterns and trends over time.",
    color: "#4ADE80",
    bg: "rgba(74,222,128,0.08)",
    border: "rgba(74,222,128,0.15)",
  },
  {
    icon: "📱",
    title: "App Usage",
    desc: "See exactly which apps your child uses and for how long — broken down by day, week, and category.",
    color: "#60A5FA",
    bg: "rgba(96,165,250,0.08)",
    border: "rgba(96,165,250,0.15)",
  },
  {
    icon: "⏱",
    title: "Screen Time Limits",
    desc: "Set daily limits per child. Get notified when they're close or over — and pause screens remotely.",
    color: "#A78BFA",
    bg: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.15)",
  },
  {
    icon: "📊",
    title: "Parent Dashboard",
    desc: "A beautiful overview of your whole family's digital wellbeing, updated in real time.",
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.15)",
  },
  {
    icon: "📍",
    title: "Location Tracking",
    desc: "Know where your children are at all times with live location sharing and safe zone alerts.",
    color: "#F87171",
    bg: "rgba(248,113,113,0.08)",
    border: "rgba(248,113,113,0.15)",
  },
  {
    icon: "🔔",
    title: "Smart Alerts",
    desc: "Get notified for mood changes, limit breaches, new app installs, and weekly family summaries.",
    color: "#34D399",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.15)",
  },
];

const plans = [
  {
    name: "Free",
    price: "0",
    desc: "Perfect for getting started",
    color: "rgba(255,255,255,0.7)",
    features: ["1 child profile", "Mood tracking", "Basic screen time", "7-day history"],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Family",
    price: "9",
    desc: "For growing families",
    color: "#A78BFA",
    features: ["Up to 5 children", "All features", "Location tracking", "30-day history", "Smart alerts", "Priority support"],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Premium",
    price: "19",
    desc: "Maximum control & insights",
    color: "#FBBF24",
    features: ["Unlimited children", "Everything in Family", "1-year history", "Advanced reports", "API access", "Dedicated support"],
    cta: "Contact Us",
    highlight: false,
  },
];

function NavBar({ scrolled }: { scrolled: boolean }) {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 40px",
      height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? "rgba(10,10,20,0.9)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "none",
      transition: "all 0.3s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>🏠</div>
        <span style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>FamilyFlow</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <a href="/login" style={{
          padding: "8px 20px", borderRadius: 10,
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.8)", fontSize: 14,
          fontWeight: 600, textDecoration: "none",
          transition: "all 0.2s", fontFamily: "inherit",
        }}>Sign In</a>
        <a href="/login" style={{
          padding: "8px 20px", borderRadius: 10,
          background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
          color: "#fff", fontSize: 14,
          fontWeight: 600, textDecoration: "none",
          boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
          transition: "all 0.2s",
        }}>Get Started</a>
      </div>
    </nav>
  );
}

function DashboardPreview() {
  return (
    <div style={{
      background: "#0f0f1e",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20,
      padding: 20,
      width: "100%",
      boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
    }}>
      {/* Fake browser chrome */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
        {["#F87171", "#FBBF24", "#4ADE80"].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
        ))}
        <div style={{
          flex: 1, height: 22, borderRadius: 6,
          background: "rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, color: "rgba(255,255,255,0.2)", marginLeft: 8,
        }}>familyflow.app/dashboard</div>
      </div>

      {/* Mini dashboard */}
      <div style={{ display: "flex", gap: 10 }}>
        {/* Sidebar */}
        <div style={{
          width: 36, background: "rgba(255,255,255,0.02)",
          borderRadius: 10, padding: "10px 0",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}>
          {["🏠","📊","📱","😊","⚙️"].map((icon, i) => (
            <div key={i} style={{
              width: 24, height: 24, borderRadius: 6, fontSize: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: i === 1 ? "rgba(167,139,250,0.2)" : "transparent",
            }}>{icon}</div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {/* Header */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 2 }}>Family Overview</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>Saturday, March 7</div>
          </div>

          {/* Child tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {[["🧒","Emma"], ["👦","Liam"]].map(([avatar, name], i) => (
              <div key={name} style={{
                padding: "3px 8px", borderRadius: 6, fontSize: 9,
                background: i === 0 ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)",
                color: i === 0 ? "#A78BFA" : "rgba(255,255,255,0.4)",
                display: "flex", alignItems: "center", gap: 3,
              }}>{avatar} {name}</div>
            ))}
          </div>

          {/* Cards row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            {/* Screen time mini */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10, padding: 10,
            }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>SCREEN TIME</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="32" height="32" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
                  <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3"/>
                  <circle cx="16" cy="16" r="12" fill="none" stroke="#A78BFA" strokeWidth="3"
                    strokeDasharray={`${(3.2/5) * 75} 75`} strokeLinecap="round"/>
                </svg>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#A78BFA" }}>3.2h</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>of 5h</div>
                </div>
              </div>
            </div>

            {/* Mood mini */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10, padding: 10,
            }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>MOOD TODAY</div>
              <div style={{ fontSize: 22, marginBottom: 3 }}>😊</div>
              <div style={{ fontSize: 10, color: "#4ADE80", fontWeight: 600 }}>Happy</div>
            </div>
          </div>

          {/* Mini bar chart */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10, padding: 10,
          }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>WEEKLY SCREEN TIME</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 30 }}>
              {[2.1, 3.8, 4.2, 2.9, 3.2, 1.8, 3.2].map((v, i) => (
                <div key={i} style={{
                  flex: 1, borderRadius: "2px 2px 0 0",
                  height: `${(v / 5) * 100}%`,
                  background: i === 6 ? "#A78BFA" : "rgba(167,139,250,0.3)",
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatY {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .hero-text { animation: fadeUp 0.7s ease 0.1s both; }
        .hero-sub { animation: fadeUp 0.7s ease 0.25s both; }
        .hero-cta { animation: fadeUp 0.7s ease 0.4s both; }
        .hero-preview { animation: fadeUp 0.9s ease 0.5s both; }
        .float-slow { animation: floatY 5s ease-in-out infinite; }
      `}</style>

      <NavBar scrolled={scrolled} />

      {/* ── HERO ── dark */}
      <section style={{
        minHeight: "100vh",
        background: "#0a0a14",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "120px 24px 80px",
        position: "relative", overflow: "hidden",
        textAlign: "center",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "20%", left: "50%",
          transform: "translateX(-50%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="hero-text" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(167,139,250,0.1)",
          border: "1px solid rgba(167,139,250,0.2)",
          borderRadius: 20, padding: "6px 14px",
          fontSize: 13, color: "#A78BFA",
          marginBottom: 24, fontWeight: 600,
        }}>
          ✨ Digital wellbeing for the whole family
        </div>

        <h1 className="hero-text" style={{
          fontSize: "clamp(42px, 7vw, 76px)",
          fontWeight: 800, color: "#fff",
          letterSpacing: "-0.04em", lineHeight: 1.05,
          maxWidth: 800, marginBottom: 24,
        }}>
          Raise kids who thrive{" "}
          <span style={{
            background: "linear-gradient(135deg, #A78BFA, #7C3AED)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>online</span>
        </h1>

        <p className="hero-sub" style={{
          fontSize: 18, color: "rgba(255,255,255,0.5)",
          maxWidth: 520, lineHeight: 1.7, marginBottom: 40,
        }}>
          FamilyFlow gives parents full visibility into screen time, app usage, and emotional wellbeing — all in one beautiful dashboard.
        </p>

        <div className="hero-cta" style={{ display: "flex", gap: 12, marginBottom: 80, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="/login" style={{
            padding: "14px 32px", borderRadius: 14,
            background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
            color: "#fff", fontSize: 16, fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 8px 30px rgba(124,58,237,0.45)",
          }}>Get Started Free →</a>
          <a href="/login" style={{
            padding: "14px 32px", borderRadius: 14,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.8)", fontSize: 16, fontWeight: 600,
            textDecoration: "none",
          }}>Sign In</a>
        </div>

        {/* Dashboard preview */}
        <div className="hero-preview float-slow" style={{ width: "100%", maxWidth: 680 }}>
          <DashboardPreview />
        </div>
      </section>

      {/* ── FEATURES ── light */}
      <section style={{
        background: "#f8f7ff",
        padding: "100px 24px",
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{
              display: "inline-block",
              fontSize: 13, fontWeight: 600,
              color: "#7C3AED", letterSpacing: "0.08em",
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.15)",
              borderRadius: 20, padding: "5px 14px", marginBottom: 16,
            }}>FEATURES</div>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 800, color: "#0a0a14",
              letterSpacing: "-0.03em", marginBottom: 12,
            }}>Everything you need</h2>
            <p style={{ fontSize: 17, color: "rgba(10,10,20,0.5)", maxWidth: 480, margin: "0 auto" }}>
              One platform to monitor, protect, and understand your child's digital life.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {features.map(f => (
              <div key={f.title} style={{
                background: "#fff",
                border: `1px solid ${f.border}`,
                borderRadius: 20, padding: "28px 24px",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: f.bg, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 22, marginBottom: 16,
                }}>{f.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0a0a14", marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: "rgba(10,10,20,0.5)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── dark */}
      <section style={{
        background: "#0a0a14",
        padding: "100px 24px",
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{
              display: "inline-block",
              fontSize: 13, fontWeight: 600, color: "#A78BFA",
              letterSpacing: "0.08em",
              background: "rgba(167,139,250,0.1)",
              border: "1px solid rgba(167,139,250,0.2)",
              borderRadius: 20, padding: "5px 14px", marginBottom: 16,
            }}>PRICING</div>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 800, color: "#fff",
              letterSpacing: "-0.03em", marginBottom: 12,
            }}>Simple, honest pricing</h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 400, margin: "0 auto" }}>
              Start free. Upgrade when your family grows.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {plans.map(plan => (
              <div key={plan.name} style={{
                background: plan.highlight ? "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(167,139,250,0.1))" : "rgba(255,255,255,0.03)",
                border: plan.highlight ? "1px solid rgba(167,139,250,0.4)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 24, padding: "32px 28px",
                position: "relative",
              }}>
                {plan.highlight && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
                    color: "#fff", fontSize: 11, fontWeight: 700,
                    padding: "4px 14px", borderRadius: 20, letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                  }}>MOST POPULAR</div>
                )}
                <div style={{ fontSize: 16, fontWeight: 700, color: plan.color, marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>{plan.desc}</div>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 48, fontWeight: 800, color: "#fff", letterSpacing: "-0.04em" }}>${plan.price}</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>/month</span>
                </div>
                <div style={{ marginBottom: 28 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ color: plan.color, fontSize: 14 }}>✓</span>
                      <span style={{ fontSize: 14, color: "var(--text-sub)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="/login" style={{
                  display: "block", textAlign: "center",
                  padding: "12px 0", borderRadius: 12,
                  background: plan.highlight ? "linear-gradient(135deg, #7C3AED, #A78BFA)" : "rgba(255,255,255,0.07)",
                  border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", fontSize: 14, fontWeight: 600,
                  textDecoration: "none",
                  boxShadow: plan.highlight ? "0 4px 20px rgba(124,58,237,0.4)" : "none",
                }}>{plan.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        background: "#f8f7ff",
        padding: "100px 24px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🏠</div>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 800, color: "#0a0a14",
            letterSpacing: "-0.03em", marginBottom: 16,
          }}>Your family deserves better</h2>
          <p style={{ fontSize: 17, color: "rgba(10,10,20,0.5)", lineHeight: 1.7, marginBottom: 36 }}>
            Join thousands of parents who use FamilyFlow to stay connected, set healthy boundaries, and raise digitally responsible kids.
          </p>
          <a href="/login" style={{
            display: "inline-block",
            padding: "16px 40px", borderRadius: 14,
            background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
            color: "#fff", fontSize: 16, fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 8px 30px rgba(124,58,237,0.35)",
          }}>Get Started Free →</a>
        </div>
      </section>

      {/* ── FOOTER ── dark */}
      <footer style={{
        background: "#0a0a14",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "40px 24px",
      }}>
        <div style={{
          maxWidth: 1000, margin: "0 auto",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
            }}>🏠</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>FamilyFlow</span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
            © 2026 FamilyFlow. Built with ❤️ for families.
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy", "Terms", "Contact"].map(link => (
              <a key={link} href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}