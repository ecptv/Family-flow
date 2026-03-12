"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const categories = ["All", "Gaming", "Social", "Educational", "Entertainment", "Utilities"];
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
  const daily = app.daily || [0,0,0,0,0,0,app.minutes];
  const max = Math.max(...daily, 1);
  const total = daily.reduce((a: number, b: number) => a + b, 0);
  const avg = Math.round(total / 7);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: 24, padding: 32, width: "100%", maxWidth: 460,
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: `${app.color || "#A78BFA"}22`,
            border: `1px solid ${app.color || "#A78BFA"}44`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
          }}>{app.icon || "📱"}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{app.app_name}</div>
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
          {[
            { label: "Today", value: formatTime(app.minutes) },
            { label: "Weekly", value: formatTime(total) },
            { label: "Daily avg", value: formatTime(avg) },
          ].map(s => (
            <div key={s.label} style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "12px 14px", textAlign: "center",
            }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, letterSpacing: "0.06em" }}>USAGE THIS WEEK</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
            {daily.map((v: number, i: number) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                  <div style={{
                    width: "100%", height: `${(v / max) * 100}%`,
                    borderRadius: "4px 4px 0 0",
                    background: i === 6 ? app.color || "#A78BFA" : `${app.color || "#A78BFA"}55`,
                    minHeight: v > 0 ? 3 : 0, transition: "height 0.4s ease",
                  }} />
                </div>
                <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{days[i].slice(0, 1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
            background: "var(--bg-card)", outline: "1px solid var(--border)",
            color: "var(--text-sub)", fontSize: 14, cursor: "pointer", fontFamily: "inherit",
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
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [sortBy, setSortBy] = useState<"time" | "name" | "category">("time");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) { setLoading(false); return; }

      const { data: kids } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at");

      if (kids && kids.length > 0) {
        setChildren(kids);
        setSelectedChild(kids[0].id);
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    loadApps(selectedChild);
  }, [selectedChild]);

  const loadApps = async (childId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("app_usage")
      .select("*")
      .eq("child_id", childId)
      .eq("date", today)
      .order("minutes", { ascending: false });
    if (data) setApps(data);
  };

  const toggleBlock = async (appId: string, currentBlocked: boolean) => {
    await supabase.from("app_usage").update({ blocked: !currentBlocked }).eq("id", appId);
    setApps(prev => prev.map(a => a.id === appId ? { ...a, blocked: !currentBlocked } : a));
  };

  const filtered = apps
    .filter(a => selectedCategory === "All" || a.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "time") return b.minutes - a.minutes;
      if (sortBy === "name") return a.app_name.localeCompare(b.app_name);
      return (a.category || "").localeCompare(b.category || "");
    });

  const totalMinutes = apps.reduce((s, a) => s + a.minutes, 0);
  const blockedCount = apps.filter(a => a.blocked).length;

  const categoryTotals = categories.slice(1).map(cat => ({
    cat,
    minutes: apps.filter(a => a.category === cat).reduce((s, a) => s + a.minutes, 0),
  })).filter(c => c.minutes > 0).sort((a, b) => b.minutes - a.minutes);

  const catColor: Record<string, string> = {
    Gaming: "#F87171", Entertainment: "#FBBF24",
    Social: "#60A5FA", Educational: "#4ADE80", Utilities: "#A78BFA",
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading...</div>
    </div>
  );

  if (children.length === 0) return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>App Usage</div>
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 20, padding: "48px 32px", textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📱</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>No children added yet</div>
        <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>Go to Settings to add your first child</div>
        <a href="/settings" style={{
          display: "inline-block", padding: "12px 24px", borderRadius: 12,
          background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
          color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none",
        }}>Go to Settings →</a>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)" }}>App Usage</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Today's activity · all apps</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {children.map(c => (
            <button key={c.id} onClick={() => setSelectedChild(c.id)} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 12, border: "none",
              background: selectedChild === c.id ? "rgba(167,139,250,0.15)" : "var(--bg-card)",
              outline: selectedChild === c.id ? "1px solid rgba(167,139,250,0.35)" : "1px solid var(--border)",
              color: selectedChild === c.id ? "#A78BFA" : "var(--text-sub)",
              fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
            }}>{c.avatar} {c.name}</button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Today", value: formatTime(totalMinutes), icon: "⏱", color: "#A78BFA" },
          { label: "Apps Used", value: apps.filter(a => a.minutes > 0).length, icon: "📱", color: "#60A5FA" },
          { label: "Blocked", value: blockedCount, icon: "🚫", color: "#F87171" },
          { label: "Categories", value: categoryTotals.length, icon: "📂", color: "#4ADE80" },
        ].map(s => (
          <div key={s.label} style={{
            background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 18px",
          }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      {categoryTotals.length > 0 && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "18px 22px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 14 }}>TODAY BY CATEGORY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {categoryTotals.map(c => {
              const pct = Math.round((c.minutes / totalMinutes) * 100);
              return (
                <div key={c.cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "var(--text-sub)" }}>{c.cat}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatTime(c.minutes)} · {pct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: catColor[c.cat] || "#A78BFA", transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
              padding: "6px 14px", borderRadius: 20, border: "none",
              background: selectedCategory === cat ? "rgba(167,139,250,0.15)" : "var(--bg-card)",
              outline: selectedCategory === cat ? "1px solid rgba(167,139,250,0.35)" : "1px solid var(--border)",
              color: selectedCategory === cat ? "#A78BFA" : "var(--text-sub)",
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}>{cat}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Sort:</span>
          {(["time", "name", "category"] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)} style={{
              padding: "5px 12px", borderRadius: 8, border: "none",
              background: sortBy === s ? "rgba(167,139,250,0.15)" : "var(--bg-card)",
              outline: sortBy === s ? "1px solid rgba(167,139,250,0.3)" : "1px solid var(--border)",
              color: sortBy === s ? "#A78BFA" : "var(--text-muted)",
              fontSize: 12, cursor: "pointer", fontFamily: "inherit",
            }}>{s === "time" ? "Time" : s === "name" ? "Name" : "Category"}</button>
          ))}
        </div>
      </div>

      {/* Apps list */}
      {filtered.length === 0 ? (
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 20, padding: "48px 32px", textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📱</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>No app data yet</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>App usage will appear here once the mobile app is connected</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(app => (
            <div key={app.id}
              onClick={() => setSelectedApp(app)}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                background: app.blocked ? "rgba(248,113,113,0.04)" : "var(--bg-card)",
                border: app.blocked ? "1px solid rgba(248,113,113,0.15)" : "1px solid var(--border)",
                borderRadius: 16, padding: "14px 18px",
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = app.blocked ? "rgba(248,113,113,0.08)" : "var(--bg-card-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = app.blocked ? "rgba(248,113,113,0.04)" : "var(--bg-card)")}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                background: `${app.color || "#A78BFA"}22`,
                border: `1px solid ${app.color || "#A78BFA"}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, opacity: app.blocked ? 0.4 : 1,
              }}>{app.icon || "📱"}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: app.blocked ? "var(--text-muted)" : "var(--text)" }}>
                    {app.app_name}
                  </span>
                  {app.blocked && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: "#F87171",
                      background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)",
                      borderRadius: 6, padding: "1px 6px",
                    }}>BLOCKED</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{app.category}</div>
              </div>

              <div style={{ opacity: app.blocked ? 0.3 : 1 }}>
                <MiniSparkline data={app.daily || [0,0,0,0,0,0,app.minutes]} color={app.color || "#A78BFA"} />
              </div>

              <div style={{ textAlign: "right", minWidth: 60 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: app.blocked ? "var(--text-muted)" : "var(--text)" }}>
                  {formatTime(app.minutes)}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>today</div>
              </div>

              <button
                onClick={e => { e.stopPropagation(); toggleBlock(app.id, app.blocked); }}
                style={{
                  padding: "6px 12px", borderRadius: 8, border: "none",
                  background: app.blocked ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                  outline: app.blocked ? "1px solid rgba(74,222,128,0.2)" : "1px solid rgba(248,113,113,0.2)",
                  color: app.blocked ? "#4ADE80" : "#F87171",
                  fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                }}
              >{app.blocked ? "Unblock" : "Block"}</button>
            </div>
          ))}
        </div>
      )}

      {selectedApp && (
        <AppDetailModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onToggleBlock={() => toggleBlock(selectedApp.id, selectedApp.blocked)}
        />
      )}
    </div>
  );
}