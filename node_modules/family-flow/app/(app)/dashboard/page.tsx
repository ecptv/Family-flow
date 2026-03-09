"use client";

import { useState } from "react";

const mockChildren = [
  {
    id: 1, name: "Emma", age: 11, avatar: "🧒",
    mood: "happy", moodTime: "2h ago",
    screenTimeUsed: 3.2, screenTimeLimit: 5,
    topApps: [
      { name: "YouTube", minutes: 82, color: "#FF4444" },
      { name: "Minecraft", minutes: 54, color: "#44AA44" },
      { name: "Duolingo", minutes: 28, color: "#FFAA00" },
    ],
    moodHistory: ["happy","neutral","happy","sad","happy","neutral","happy"],
    weeklyScreen: [2.1, 3.8, 4.2, 2.9, 3.2, 1.8, 3.2],
    status: "online",
  },
  {
    id: 2, name: "Liam", age: 8, avatar: "👦",
    mood: "neutral", moodTime: "4h ago",
    screenTimeUsed: 4.7, screenTimeLimit: 4,
    topApps: [
      { name: "Roblox", minutes: 120, color: "#FF4444" },
      { name: "Netflix", minutes: 60, color: "#E50914" },
      { name: "Google", minutes: 22, color: "#4285F4" },
    ],
    moodHistory: ["sad","neutral","neutral","happy","neutral","sad","neutral"],
    weeklyScreen: [3.1, 4.5, 5.2, 4.8, 4.7, 3.3, 4.7],
    status: "offline",
  },
];

const moodConfig = {
  happy:   { emoji: "😊", label: "Happy",   color: "#4ADE80", bg: "rgba(74,222,128,0.12)" },
  neutral: { emoji: "😐", label: "Neutral",  color: "#FBBF24", bg: "rgba(251,191,36,0.12)" },
  sad:     { emoji: "😢", label: "Sad",      color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
  angry:   { emoji: "😠", label: "Angry",    color: "#F87171", bg: "rgba(248,113,113,0.12)" },
  anxious: { emoji: "😰", label: "Anxious",  color: "#C084FC", bg: "rgba(192,132,252,0.12)" },
};

const days = ["M","T","W","T","F","S","S"];

function ScreenTimeRing({ used, limit }) {
  const pct = Math.min(used / limit, 1);
  const over = used > limit;
  const r = 30, circ = 2 * Math.PI * r;
  const color = over ? "#F87171" : used / limit > 0.8 ? "#FBBF24" : "#A78BFA";
  return (
    <div style={{ position: "relative", width: 76, height: 76, flexShrink: 0 }}>
      <svg width="76" height="76" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="38" cy="38" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color, lineHeight: 1 }}>{used.toFixed(1)}</span>
        <span style={{ fontSize: 9, color: "var(--text-muted)" }}>/ {limit}h</span>
      </div>
    </div>
  );
}

function LimitEditor({ child, onClose }) {
  const [val, setVal] = useState(child.screenTimeLimit);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg)", border: "1px solid rgba(167,139,250,0.3)",
        borderRadius: 24, padding: 32, width: 340,
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)"
      }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: "var(--text)", marginBottom: 6 }}>Screen Time Limit</div>
        <div style={{ fontSize: 13, color: "var(--text-sub)", marginBottom: 28 }}>Set daily limit for {child.name}</div>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 52, fontWeight: 800, color: "#A78BFA", letterSpacing: "-0.04em" }}>{val}</span>
          <span style={{ fontSize: 18, color: "var(--text-muted)" }}> hrs</span>
        </div>
        <input type="range" min={0.5} max={10} step={0.5} value={val}
          onChange={e => setVal(parseFloat(e.target.value))}
          style={{ width: "100%", accentColor: "#A78BFA", marginBottom: 28 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
            background: "var(--bg-card)", color: "var(--text-sub)", fontSize: 14, cursor: "pointer", fontFamily: "inherit"
          }}>Cancel</button>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
            color: "var(--text)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
          }}>Save Limit</button>
        </div>
      </div>
    </div>
  );
}

export default function FamilyFlowDashboard() {
  const [selected, setSelected] = useState(0);
  const [editingLimit, setEditingLimit] = useState(false);
  const child = mockChildren[selected];
  const alerts = mockChildren.filter(c => c.screenTimeUsed > c.screenTimeLimit);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)" }}>Family Overview</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {alerts.length > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: 12, padding: "8px 14px", fontSize: 13, color: "#F87171"
            }}>⚠ {alerts.map(c => c.name).join(", ")} over limit</div>
          )}
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--bg-card)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer"
          }}>👤</div>
        </div>
      </div>

      {/* Child tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {mockChildren.map((c, i) => (
          <button key={c.id} onClick={() => setSelected(i)} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 16px", borderRadius: 12, border: "none",
            background: selected === i ? "rgba(167,139,250,0.15)" : "var(--bg-card)",
            outline: selected === i ? "1px solid rgba(167,139,250,0.35)" : "1px solid var(--border)",
            color: selected === i ? "#A78BFA" : "var(--text-sub)",
            fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
          }}>
            <span>{c.avatar}</span><span>{c.name}</span>
            {c.screenTimeUsed > c.screenTimeLimit && (
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F87171", display: "inline-block" }} />
            )}
          </button>
        ))} </div>
        

      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Screen Time */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 4 }}>SCREEN TIME</div>
              <div style={{ fontSize: 13, color: "var(--text-sub)" }}>Today · {child.name}</div>
            </div>
            <button onClick={() => setEditingLimit(true)} style={{
              padding: "6px 12px", borderRadius: 8, border: "none",
              background: "rgba(167,139,250,0.1)", outline: "1px solid rgba(167,139,250,0.25)",
              color: "#A78BFA", fontSize: 11, cursor: "pointer", fontFamily: "inherit"
            }}>Edit Limit</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <ScreenTimeRing used={child.screenTimeUsed} limit={child.screenTimeLimit} />
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Used</span>
                  <span style={{ fontSize: 12, color: "var(--text-sub)" }}>{child.screenTimeUsed}h of {child.screenTimeLimit}h</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.min((child.screenTimeUsed / child.screenTimeLimit) * 100, 100)}%`,
                    borderRadius: 3,
                    background: child.screenTimeUsed > child.screenTimeLimit
                      ? "linear-gradient(90deg, #F87171, #FCA5A5)"
                      : "linear-gradient(90deg, #7C3AED, #A78BFA)",
                  }} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {child.screenTimeUsed > child.screenTimeLimit
                  ? `⚠ ${(child.screenTimeUsed - child.screenTimeLimit).toFixed(1)}h over limit`
                  : `${(child.screenTimeLimit - child.screenTimeUsed).toFixed(1)}h remaining`}
              </div>
            </div>
          </div>
        </div>

        {/* Mood */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "22px 24px" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 16 }}>MOOD TRACKER</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: moodConfig[child.mood].bg,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28
            }}>{moodConfig[child.mood].emoji}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: moodConfig[child.mood].color }}>{moodConfig[child.mood].label}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Logged {child.moodTime}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>7-DAY HISTORY</div>
          <div style={{ display: "flex", gap: 6 }}>
            {child.moodHistory.map((m, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 16, opacity: i === child.moodHistory.length - 1 ? 1 : 0.4 + (i / child.moodHistory.length) * 0.5 }}>
                  {moodConfig[m]?.emoji}
                </span>
                <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{days[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly + Apps */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Weekly Chart */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "22px 24px" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 4 }}>WEEKLY SCREEN TIME</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 20, opacity: 0.6 }}>Daily limit: {child.screenTimeLimit}h</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
            {child.weeklyScreen.map((val, i) => {
              const isToday = i === child.weeklyScreen.length - 1;
              const over = val > child.screenTimeLimit;
              const max = Math.max(...child.weeklyScreen, child.screenTimeLimit);
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
                  <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", position: "relative" }}>
                    {i === 0 && (
                      <div style={{
                        position: "absolute", bottom: `${(child.screenTimeLimit / max) * 100}%`,
                        left: "-200%", right: "-700%", height: 1,
                        background: "var(--divider)", zIndex: 1, pointerEvents: "none"
                      }}>
                        <span style={{ position: "absolute", right: 0, top: -10, fontSize: 9, color: "var(--text-muted)" }}>limit</span>
                      </div>
                    )}
                    <div style={{
                      width: "100%", height: `${(val / max) * 100}%`,
                      borderRadius: "4px 4px 0 0",
                      background: over
                        ? "linear-gradient(180deg, #F87171, rgba(248,113,113,0.6))"
                        : isToday
                        ? "linear-gradient(180deg, #A78BFA, rgba(167,139,250,0.6))"
                        : "rgba(167,139,250,0.25)",
                      transition: "height 0.5s ease",
                    }} />
                  </div>
                  <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{days[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Apps */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "22px 24px" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 20 }}>TOP APPS TODAY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {child.topApps.map(app => (
              <div key={app.name} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{app.name}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {Math.floor(app.minutes / 60) > 0 ? `${Math.floor(app.minutes / 60)}h ` : ""}{app.minutes % 60}m
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${(app.minutes / child.topApps[0].minutes) * 100}%`,
                    borderRadius: 3, background: app.color, opacity: 0.75,
                  }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--divider)",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Total app usage</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-sub)" }}>
              {Math.floor(child.topApps.reduce((a, b) => a + b.minutes, 0) / 60)}h {child.topApps.reduce((a, b) => a + b.minutes, 0) % 60}m
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        {[
          { icon: "⏰", label: "Set Bedtime" },
          { icon: "📵", label: "Pause Screen" },
          { icon: "✉️", label: "Send Message" },
          { icon: "📍", label: "Check Location" },
        ].map(action => (
          <button key={action.label} style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
            background: "var(--bg-card)", outline: "1px solid var(--border)",
            color: "var(--text-sub)", fontSize: 12, fontWeight: 500, cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
            transition: "all 0.2s", fontFamily: "inherit"
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(167,139,250,0.1)";
              e.currentTarget.style.color = "#A78BFA";
              e.currentTarget.style.outline = "1px solid rgba(167,139,250,0.25)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "var(--bg-card)";
              e.currentTarget.style.color = "var(--text-sub)";
              e.currentTarget.style.outline = "1px solid var(--border)";
            }}
          >
            <span style={{ fontSize: 18 }}>{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      {editingLimit && <LimitEditor child={child} onClose={() => setEditingLimit(false)} />}
    </div>
  );
}