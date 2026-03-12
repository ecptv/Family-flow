"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const moodConfig = {
  happy:   { emoji: "😊", label: "Happy",   color: "#4ADE80", bg: "rgba(74,222,128,0.12)" },
  neutral: { emoji: "😐", label: "Neutral",  color: "#FBBF24", bg: "rgba(251,191,36,0.12)" },
  sad:     { emoji: "😢", label: "Sad",      color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
  angry:   { emoji: "😠", label: "Angry",    color: "#F87171", bg: "rgba(248,113,113,0.12)" },
  anxious: { emoji: "😰", label: "Anxious",  color: "#C084FC", bg: "rgba(192,132,252,0.12)" },
};

type MoodKey = keyof typeof moodConfig;
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function StatCard({ emoji, label, value, color, sub }: { emoji: string; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "18px 20px" }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: "-0.02em", marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, opacity: 0.7 }}>{sub}</div>}
    </div>
  );
}

export default function MoodPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const [view, setView] = useState<"calendar" | "chart">("calendar");
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
    loadMoodLogs(selectedChild);
  }, [selectedChild]);

  const loadMoodLogs = async (childId: string) => {
    const thirtyFiveDaysAgo = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("mood_logs")
      .select("*")
      .eq("child_id", childId)
      .gte("logged_at", thirtyFiveDaysAgo)
      .order("logged_at", { ascending: true });
    if (data) setMoodLogs(data);
  };

  // Build 35-day calendar
  const today = new Date();
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (34 - i));
    const dateStr = d.toISOString().split("T")[0];
    const log = moodLogs.find(m => m.logged_at.split("T")[0] === dateStr);
    return { date: d, dateStr, mood: log?.mood || null, note: log?.note || "", logId: log?.id };
  });

  // Stats
  const logsWithMood = calendarDays.filter(d => d.mood);
  const moodCounts = Object.keys(moodConfig).reduce((acc, k) => {
    acc[k] = logsWithMood.filter(d => d.mood === k).length;
    return acc;
  }, {} as Record<string, number>);
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const streak = (() => {
    let s = 0;
    for (let i = calendarDays.length - 1; i >= 0; i--) {
      if (calendarDays[i].mood) s++; else break;
    }
    return s;
  })();

  // Weekly chart
  const weeks = Array.from({ length: 5 }, (_, wi) => {
    const w = calendarDays.slice(wi * 7, wi * 7 + 7);
    return {
      label: `W${wi + 1}`,
      happy: w.filter(d => d.mood === "happy").length,
      neutral: w.filter(d => d.mood === "neutral").length,
      sad: w.filter(d => d.mood === "sad" || d.mood === "anxious" || d.mood === "angry").length,
    };
  });

  // Comparison
  const compData = children.map(c => {
    const cLogs = c.id === selectedChild ? moodLogs : [];
    const counts = Object.keys(moodConfig).reduce((acc, k) => {
      acc[k] = cLogs.filter((m: any) => m.mood === k).length;
      return acc;
    }, {} as Record<string, number>);
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return { ...c, counts, top };
  });

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading...</div>
    </div>
  );

  if (children.length === 0) return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>Mood Tracker</div>
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 20, padding: "48px 32px", textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😊</div>
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)" }}>Mood Tracker</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>35-day emotional history</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {children.map(c => (
            <button key={c.id} onClick={() => setSelectedChild(c.id)} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 12, border: "none",
              background: selectedChild === c.id ? "rgba(167,139,250,0.15)" : "var(--bg-card)",
              outline: selectedChild === c.id ? "1px solid rgba(167,139,250,0.35)" : "1px solid var(--border)",
              color: selectedChild === c.id ? "#A78BFA" : "var(--text-sub)",
              fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>{c.avatar} {c.name}</button>
          ))}
          <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)" }}>
            {(["calendar", "chart"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "7px 14px", border: "none",
                background: view === v ? "rgba(167,139,250,0.15)" : "var(--bg-card)",
                color: view === v ? "#A78BFA" : "var(--text-muted)",
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}>{v === "calendar" ? "📅 Calendar" : "📈 Chart"}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard
          emoji={topMood ? moodConfig[topMood[0] as MoodKey].emoji : "❓"}
          label="Most common mood"
          value={topMood ? moodConfig[topMood[0] as MoodKey].label : "—"}
          color={topMood ? moodConfig[topMood[0] as MoodKey].color : "var(--text)"}
          sub={`${topMood?.[1] || 0} times`}
        />
        <StatCard emoji="🔥" label="Logging streak" value={`${streak}d`} color="#FBBF24" sub="days in a row" />
        <StatCard emoji="📝" label="Total logs" value={logsWithMood.length} color="#60A5FA" sub="out of 35 days" />
        <StatCard
          emoji="📊" label="Positive days"
          value={`${Math.round((moodCounts["happy"] / (logsWithMood.length || 1)) * 100)}%`}
          color="#4ADE80" sub={`${moodCounts["happy"]} happy days`}
        />
      </div>

      {/* Calendar view */}
      {view === "calendar" && (
        <div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "24px 28px", marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 8 }}>
              {weekDays.map(d => (
                <div key={d} style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", fontWeight: 600 }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
              {calendarDays.map((entry, i) => {
                const isToday = entry.date.toDateString() === today.toDateString();
                const isFuture = entry.date > today;
                const mood = entry.mood ? moodConfig[entry.mood as MoodKey] : null;
                return (
                  <div key={i}
                    onClick={() => !isFuture && entry.mood && setSelectedDay(entry)}
                    style={{
                      aspectRatio: "1", borderRadius: 10,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                      background: mood ? mood.bg : "var(--bg-card)",
                      border: isToday ? "2px solid rgba(167,139,250,0.6)" : mood ? `1px solid ${mood.color}33` : "1px solid var(--border)",
                      cursor: mood ? "pointer" : "default",
                      opacity: isFuture ? 0.2 : 1,
                      transition: "all 0.15s", position: "relative",
                    }}
                    onMouseEnter={e => mood && ((e.currentTarget as HTMLDivElement).style.transform = "scale(1.08)")}
                    onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.transform = "scale(1)")}
                  >
                    <span style={{ fontSize: 16 }}>{mood ? mood.emoji : ""}</span>
                    <span style={{ fontSize: 9, color: "var(--text-muted)" }}>{entry.date.getDate()}</span>
                    {entry.note && (
                      <div style={{ position: "absolute", top: 3, right: 3, width: 5, height: 5, borderRadius: "50%", background: mood?.color || "#fff", opacity: 0.8 }} />
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
              {Object.entries(moodConfig).map(([k, v]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                  <span>{v.emoji}</span><span>{v.label}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedDay && (
            <div style={{
              background: selectedDay.mood ? moodConfig[selectedDay.mood as MoodKey].bg : "var(--bg-card)",
              border: `1px solid ${selectedDay.mood ? moodConfig[selectedDay.mood as MoodKey].color + "44" : "var(--border)"}`,
              borderRadius: 16, padding: "20px 24px",
              display: "flex", alignItems: "center", gap: 20,
            }}>
              <div style={{ fontSize: 48 }}>{selectedDay.mood ? moodConfig[selectedDay.mood as MoodKey].emoji : "❓"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 3 }}>
                  {selectedDay.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: selectedDay.mood ? moodConfig[selectedDay.mood as MoodKey].color : "var(--text)", marginBottom: 6 }}>
                  {selectedDay.mood ? moodConfig[selectedDay.mood as MoodKey].label : "No log"}
                </div>
                {selectedDay.note
                  ? <div style={{ fontSize: 14, color: "var(--text-sub)", fontStyle: "italic" }}>"{selectedDay.note}"</div>
                  : <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No note for this day.</div>
                }
              </div>
              <button onClick={() => setSelectedDay(null)} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "6px 12px",
                color: "var(--text-muted)", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
              }}>✕ Close</button>
            </div>
          )}
        </div>
      )}

      {/* Chart view */}
      {view === "chart" && (
        <div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "24px 28px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 20 }}>MOOD DISTRIBUTION PER WEEK</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 160 }}>
              {weeks.map((w, wi) => {
                const happyH = (w.happy / 7) * 100;
                const neutralH = (w.neutral / 7) * 100;
                const sadH = (w.sad / 7) * 100;
                return (
                  <div key={wi} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                    <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 2 }}>
                      <div style={{ width: "100%", height: `${sadH}%`, borderRadius: "3px 3px 0 0", background: "#60A5FA", minHeight: sadH > 0 ? 4 : 0 }} />
                      <div style={{ width: "100%", height: `${neutralH}%`, background: "#FBBF24", minHeight: neutralH > 0 ? 4 : 0 }} />
                      <div style={{ width: "100%", height: `${happyH}%`, background: "#4ADE80", minHeight: happyH > 0 ? 4 : 0 }} />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{w.label}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
              {[["#4ADE80","Happy"],["#FBBF24","Neutral"],["#60A5FA","Sad/Anxious"]].map(([color, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "24px 28px" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 20 }}>OVERALL BREAKDOWN — 35 DAYS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Object.entries(moodConfig).map(([k, v]) => {
                const count = moodCounts[k] || 0;
                const pct = logsWithMood.length > 0 ? Math.round((count / logsWithMood.length) * 100) : 0;
                return (
                  <div key={k}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: "var(--text-sub)" }}>{v.emoji} {v.label}</span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{count} days · {pct}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: "var(--border)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: v.color, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Comparison */}
      {children.length > 1 && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "24px 28px", marginTop: 20 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 20 }}>COMPARISON BETWEEN CHILDREN</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {compData.map(child => (
              <div key={child.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 24 }}>{child.avatar}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{child.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {child.top ? `Mostly ${moodConfig[child.top[0] as MoodKey].label} ${moodConfig[child.top[0] as MoodKey].emoji}` : "No data yet"}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, height: 8, borderRadius: 4, overflow: "hidden", background: "var(--border)" }}>
                  {Object.entries(moodConfig).map(([k, v]) => {
                    const pct = moodLogs.length > 0 ? (child.counts[k] / 35) * 100 : 0;
                    return pct > 0 ? (
                      <div key={k} style={{ width: `${pct}%`, background: v.color, minWidth: 2 }} title={`${v.label}: ${child.counts[k]}d`} />
                    ) : null;
                  })}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                  {Object.entries(moodConfig).map(([k, v]) => (
                    child.counts[k] > 0 ? (
                      <span key={k} style={{ fontSize: 11, color: "var(--text-muted)" }}>{v.emoji} {child.counts[k]}d</span>
                    ) : null
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}