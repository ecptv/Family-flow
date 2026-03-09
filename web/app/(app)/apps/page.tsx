"use client";

import { useState } from "react";

const categories = ["All", "Gaming", "Social", "Educational", "Entertainment", "Utilities"];

const mockChildren = [
  { id: 1, name: "Emma", avatar: "🧒" },
  { id: 2, name: "Liam", avatar: "👦" },
];

const appsData = {
  1: [
    { name: "YouTube", category: "Entertainment", icon: "▶️", color: "#FF4444", blocked: false, daily: [82, 65, 90, 45, 70, 30, 82], weeklyTotal: 464 },
    { name: "Minecraft", category: "Gaming", icon: "⛏️", color: "#44AA44", blocked: false, daily: [54, 80, 60, 90, 45, 120, 54], weeklyTotal: 503 },
    { name: "Duolingo", category: "Educational", icon: "🦜", color: "#FFAA00", blocked: false, daily: [28, 30, 25, 28, 30, 20, 28], weeklyTotal: 189 },
    { name: "Instagram", category: "Social", icon: "📸", color: "#E1306C", blocked: true, daily: [0, 0, 0, 0, 0, 0, 0], weeklyTotal: 0 },
    { name: "TikTok", category: "Social", icon: "🎵", color: "#010101", blocked: false, daily: [20, 35, 15, 40, 10, 55, 20], weeklyTotal: 195 },
    { name: "Khan Academy", category: "Educational", icon: "📚", color: "#14BF96", blocked: false, daily: [15, 20, 10, 25, 15, 0, 15], weeklyTotal: 100 },
    { name: "Roblox", category: "Gaming", icon: "🎮", color: "#FF6B6B", blocked: false, daily: [0, 45, 30, 0, 60, 90, 0], weeklyTotal: 225 },
    { name: "Chrome", category: "Utilities", icon: "🌐", color: "#4285F4", blocked: false, daily: [22, 18, 30, 15, 25, 10, 22], weeklyTotal: 142 },
  ],
  2: [
    { name: "Roblox", category: "Gaming", icon: "🎮", color: "#FF6B6B", blocked: false, daily: [120, 90, 150, 80, 120, 180, 120], weeklyTotal: 860 },
    { name: "Netflix", category: "Entertainment", icon: "🎬", color: "#E50914", blocked: false, daily: [60, 45, 90, 30, 60, 120, 60], weeklyTotal: 465 },
    { name: "YouTube", category: "Entertainment", icon: "▶️", color: "#FF4444", blocked: false, daily: [40, 55, 30, 60, 45, 70, 40], weeklyTotal: 340 },
    { name: "Google", category: "Utilities", icon: "🔍", color: "#4285F4", blocked: false, daily: [22, 18, 25, 15, 22, 10, 22], weeklyTotal: 134 },
    { name: "Minecraft", category: "Gaming", icon: "⛏️", color: "#44AA44", blocked: true, daily: [0, 0, 0, 0, 0, 0, 0], weeklyTotal: 0 },
    { name: "WhatsApp", category: "Social", icon: "💬", color: "#25D366", blocked: false, daily: [15, 20, 10, 25, 15, 30, 15], weeklyTotal: 130 },
  ],
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatTime(minutes: number) {
  if (minutes === 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m > 0 ? m + "m" : ""}` : `${m}m`;
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 28, width: 56 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: "2px 2px 0 0",
          height: `${(v / max) * 100}%`,
          background: i === data.length - 1 ? color : `${color}55`,
          minHeight: v > 0 ? 2 : 0,
        }} />
      ))}
    </div>
  );
}

function AppDetailModal({ app, onClose, onToggleBlock }: { app: any; onClose: () => void; onToggleBlock: () => void }) {
  const max = Math.max(...app.daily, 1);
  const total = app.daily.reduce((a: number, b: number) => a + b, 0);
  const avg = Math.round(total / 7);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: 24, padding: 32, width: "100%", maxWidth: 460,
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: `${app.color}22`,
            border: `1px solid ${app.color}44`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24,
          }}>{app.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{app.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{app.category}</div>
          </div>
          <div style={{
            padding: "4px 10px", borderRadius: 8,
            background: app.blocked ? "rgba(248,113,113,0.1)" : "rgba(74,222,128,0.1)",
            border: `1px solid ${app.blocked ? "rgba(248,113,113,0.25)" : "rgba(74,222,128,0.25)"}`,
            fontSize: 11, fontWeight: 600,
            color: app.blocked ? "#F87171" : "#4ADE80",
          }}>{app.blocked ? "Blocked" : "Active"}</div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
          {[
            { label: "Today", value: formatTime(app.daily[6]) },
            { label: "Weekly", value: formatTime(total) },
            { label: "Daily avg", value: formatTime(avg) },
          ].map(s => (
            <div key={s.label} style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 12, padding: "12px 14px", textAlign: "center",
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, letterSpacing: "0.06em" }}>
            USAGE THIS WEEK
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
            {app.daily.map((v: number, i: number) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                  <div style={{
                    width: "100%",
                    height: `${(v / max) * 100}%`,
                    borderRadius: "4px 4px 0 0",
                    background: i === 6 ? app.color : `${app.color}55`,
                    minHeight: v > 0 ? 3 : 0,
                    transition: "height 0.4s ease",
                  }} />
                </div>
                <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{days[i].slice(0, 1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
            background: "var(--bg-card)", outline: "1px solid var(--border)",
            color: "var(--text-sub)", fontSize: 14,
            cursor: "pointer", fontFamily: "inherit",
          }}>Close</button>
          <button onClick={() => { onToggleBlock(); onClose(); }} style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
            background: app.blocked
              ? "linear-gradient(135deg, #059669, #34D399)"
              : "linear-gradient(135deg, #DC2626, #F87171)",
            color: "#fff", fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}>{app.blocked ? "Unblock App" : "Block App"}</button>
        </div>
      </div>
    </div>
  );
}

export default function AppsPage() {
  const [selectedChild, setSelectedChild] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [apps, setApps] = useState<any>(appsData);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [view, setView] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState<"time" | "name" | "category">("time");

  const childApps = apps[selectedChild] || [];

  const filtered = childApps
    .filter((a: any) => selectedCategory === "All" || a.category === selectedCategory)
    .sort((a: any, b: any) => {
      if (sortBy === "time") return b.weeklyTotal - a.weeklyTotal;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return a.category.localeCompare(b.category);
    });

  const totalMinutes = childApps.reduce((s: number, a: any) => s + a.daily[6], 0);
  const blockedCount = childApps.filter((a: any) => a.blocked).length;

  const toggleBlock = (appName: string) => {
    setApps((prev: any) => ({
      ...prev,
      [selectedChild]: prev[selectedChild].map((a: any) =>
        a.name === appName ? { ...a, blocked: !a.blocked, daily: !a.blocked ? [0,0,0,0,0,0,0] : a.daily } : a
      ),
    }));
  };

  const categoryTotals = categories.slice(1).map(cat => ({
    cat,
    minutes: childApps.filter((a: any) => a.category === cat).reduce((s: number, a: any) => s + a.daily[6], 0),
  })).filter(c => c.minutes > 0).sort((a, b) => b.minutes - a.minutes);

  return (
    <div>

     {/* Sidebar */}
<div style={{
  position: "fixed", left: 0, top: 0, bottom: 0, width: 64,
  }}>
</div>

      {/* Main */}
      <div style={{ marginLeft: 64, padding: "28px 32px", maxWidth: 1100 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em" }}>App Usage</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              Today's activity · all apps
            </div>
          </div>

          {/* Child selector */}
          <div style={{ display: "flex", gap: 8 }}>
            {mockChildren.map(c => (
              <button key={c.id} onClick={() => setSelectedChild(c.id)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 16px", borderRadius: 12, border: "none",
                background: selectedChild === c.id ? "rgba(167,139,250,0.15)" : "var(--bg-card)",
                outline: selectedChild === c.id ? "1px solid rgba(167,139,250,0.35)" : "1px solid transparent",
                color: selectedChild === c.id ? "#A78BFA" : "var(--text-sub)",
                fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.2s",
              }}>
                {c.avatar} {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Today", value: formatTime(totalMinutes), icon: "⏱", color: "#A78BFA" },
            { label: "Apps Used", value: childApps.filter((a: any) => a.daily[6] > 0).length, icon: "📱", color: "#60A5FA" },
            { label: "Blocked", value: blockedCount, icon: "🚫", color: "#F87171" },
            { label: "Categories", value: categoryTotals.length, icon: "📂", color: "#4ADE80" },
          ].map(s => (
            <div key={s.label} style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 16, padding: "16px 18px",
            }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        {categoryTotals.length > 0 && (
          <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 16, padding: "18px 22px", marginBottom: 24,
          }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 14 }}>
              TODAY BY CATEGORY
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {categoryTotals.map(c => {
                const pct = Math.round((c.minutes / totalMinutes) * 100);
                const catColor: Record<string, string> = {
                  Gaming: "#F87171", Entertainment: "#FBBF24",
                  Social: "#60A5FA", Educational: "#4ADE80", Utilities: "#A78BFA",
                };
                return (
                  <div key={c.cat}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: "var(--text-sub)" }}>{c.cat}</span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatTime(c.minutes)} · {pct}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "var(--bg-card)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${pct}%`,
                        borderRadius: 3,
                        background: catColor[c.cat] || "#A78BFA",
                        transition: "width 0.6s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters + sort */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                padding: "6px 14px", borderRadius: 20, border: "none",
                background: selectedCategory === cat ? "rgba(167,139,250,0.15)" : "var(--bg-card)",
                outline: selectedCategory === cat ? "1px solid rgba(167,139,250,0.35)" : "1px solid rgba(255,255,255,0.07)",
                color: selectedCategory === cat ? "#A78BFA" : "var(--text-sub)",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.15s",
              }}>{cat}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Sort:</span>
            {(["time", "name", "category"] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)} style={{
                padding: "5px 12px", borderRadius: 8, border: "none",
                background: sortBy === s ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)",
                color: sortBy === s ? "#A78BFA" : "var(--text-muted)",
                fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                outline: sortBy === s ? "1px solid rgba(167,139,250,0.3)" : "none",
              }}>{s === "time" ? "Time" : s === "name" ? "Name" : "Category"}</button>
            ))}
          </div>
        </div>

        {/* Apps list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((app: any) => (
            <div key={app.name}
              onClick={() => setSelectedApp(app)}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                background: app.blocked ? "rgba(248,113,113,0.04)" : "rgba(255,255,255,0.03)",
                border: app.blocked ? "1px solid rgba(248,113,113,0.15)" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: "14px 18px",
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = app.blocked ? "rgba(248,113,113,0.08)" : "rgba(255,255,255,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.background = app.blocked ? "rgba(248,113,113,0.04)" : "rgba(255,255,255,0.03)")}
            >
              {/* Icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                background: `${app.color}22`,
                border: `1px solid ${app.color}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, opacity: app.blocked ? 0.4 : 1,
              }}>{app.icon}</div>

              {/* Name + category */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: app.blocked ? "var(--text-muted)" : "var(--text)" }}>
                    {app.name}
                  </span>
                  {app.blocked && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: "#F87171",
                      background: "rgba(248,113,113,0.1)",
                      border: "1px solid rgba(248,113,113,0.2)",
                      borderRadius: 6, padding: "1px 6px",
                    }}>BLOCKED</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{app.category}</div>
              </div>

              {/* Sparkline */}
              <div style={{ opacity: app.blocked ? 0.3 : 1 }}>
                <MiniSparkline data={app.daily} color={app.color} />
              </div>

              {/* Time */}
              <div style={{ textAlign: "right", minWidth: 60 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: app.blocked ? "var(--text-muted)" : "var(--text)" }}>
                  {formatTime(app.daily[6])}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>today</div>
              </div>

              {/* Block button */}
              <button
                onClick={e => { e.stopPropagation(); toggleBlock(app.name); }}
                style={{
                  padding: "6px 12px", borderRadius: 8, border: "none",
                  background: app.blocked ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                  outline: app.blocked ? "1px solid rgba(74,222,128,0.2)" : "1px solid rgba(248,113,113,0.2)",
                  color: app.blocked ? "#4ADE80" : "#F87171",
                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", whiteSpace: "nowrap",
                }}
              >{app.blocked ? "Unblock" : "Block"}</button>
            </div>
          ))}
        </div>
      </div>

      {/* App detail modal */}
      {selectedApp && (
        <AppDetailModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onToggleBlock={() => toggleBlock(selectedApp.name)}
        />
      )}
    </div>
  );
}