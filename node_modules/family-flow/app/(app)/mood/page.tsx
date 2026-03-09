"use client";

import { useState } from "react";

const moodConfig = {
  happy:   { emoji: "😊", label: "Happy",   color: "#4ADE80", bg: "rgba(74,222,128,0.12)" },
  neutral: { emoji: "😐", label: "Neutral",  color: "#FBBF24", bg: "rgba(251,191,36,0.12)" },
  sad:     { emoji: "😢", label: "Sad",      color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
  angry:   { emoji: "😠", label: "Angry",    color: "#F87171", bg: "rgba(248,113,113,0.12)" },
  anxious: { emoji: "😰", label: "Anxious",  color: "#C084FC", bg: "rgba(192,132,252,0.12)" },
};

type MoodKey = keyof typeof moodConfig;

const mockChildren = [
  { id: 1, name: "Emma", avatar: "🧒" },
  { id: 2, name: "Liam", avatar: "👦" },
];

// 5 weeks of mood data per child
const generateCalendar = (moods: MoodKey[], notes: string[]) => {
  const today = new Date();
  return Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (34 - i));
    return {
      date: d,
      mood: moods[i] || null,
      note: notes[i] || "",
    };
  });
};

const emmaData = generateCalendar(
  ["happy","happy","neutral","happy","sad","happy","happy","neutral","happy","happy","happy","neutral","sad","happy","neutral","happy","happy","anxious","neutral","happy","happy","sad","neutral","happy","happy","neutral","happy","happy","neutral","happy","happy","happy","neutral","happy","happy"],
  ["Great day at school!","","Tired today","","Fight with friend","Better now","","","","Loved art class","","","Miss grandma","","","Fun sleepover","","Worried about test","Passed the test!","","","Rainy day blues","","","","","","","","","","","","","Good week overall"]
);

const liamData = generateCalendar(
  ["neutral","happy","neutral","sad","neutral","happy","neutral","neutral","sad","neutral","neutral","happy","neutral","neutral","angry","neutral","happy","neutral","neutral","neutral","sad","neutral","neutral","happy","neutral","neutral","angry","neutral","neutral","happy","neutral","neutral","neutral","happy","neutral"],
  ["","Played with Tom","","Lost my toy","","","","","Tummy ache","","","","","","","Didn't want to go to school","Pizza day!","","","","","","","Won a game","","","Argument with sister","","","","","","","",""]
);

const childMoodData: Record<number, typeof emmaData> = { 1: emmaData, 2: liamData };

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function StatCard({ emoji, label, value, color, sub }: { emoji: string; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 16, padding: "18px 20px",
    }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: "-0.02em", marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function MoodPage() {
  const [selectedChild, setSelectedChild] = useState(1);
  const [selectedDay, setSelectedDay] = useState<typeof emmaData[0] | null>(null);
  const [view, setView] = useState<"calendar" | "chart">("calendar");

  const data = childMoodData[selectedChild];
  const today = new Date();

  // Stats
  const logsWithMood = data.filter(d => d.mood);
  const moodCounts = Object.keys(moodConfig).reduce((acc, k) => {
    acc[k] = logsWithMood.filter(d => d.mood === k).length;
    return acc;
  }, {} as Record<string, number>);
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const streak = (() => {
    let s = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].mood) s++; else break;
    }
    return s;
  })();

  // Weekly chart data — last 5 weeks grouped
  const weeks = Array.from({ length: 5 }, (_, wi) => {
    const weekDays7 = data.slice(wi * 7, wi * 7 + 7);
    return {
      label: `W${wi + 1}`,
      days: weekDays7,
      happy: weekDays7.filter(d => d.mood === "happy").length,
      neutral: weekDays7.filter(d => d.mood === "neutral").length,
      sad: weekDays7.filter(d => d.mood === "sad" || d.mood === "anxious" || d.mood === "angry").length,
    };
  });

  // Comparison data
  const compData = mockChildren.map(c => {
    const cData = childMoodData[c.id];
    const counts = Object.keys(moodConfig).reduce((acc, k) => {
      acc[k] = cData.filter(d => d.mood === k).length;
      return acc;
    }, {} as Record<string, number>);
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return { ...c, counts, top };
  });

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em" }}>Mood Tracker</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>35-day emotional history</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {/* Child selector */}
            {mockChildren.map(c => (
              <button key={c.id} onClick={() => setSelectedChild(c.id)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 16px", borderRadius: 12, border: "none",
                background: selectedChild === c.id ? "rgba(167,139,250,0.15)" : "var(--bg-card)",
                outline: selectedChild === c.id ? "1px solid rgba(167,139,250,0.35)" : "1px solid transparent",
                color: selectedChild === c.id ? "#A78BFA" : "var(--text-sub)",
                fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}>{c.avatar} {c.name}</button>
            ))}
            {/* View toggle */}
            <div style={{
              display: "flex", borderRadius: 10, overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              {(["calendar", "chart"] as const).map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: "7px 14px", border: "none",
                  background: view === v ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.03)",
                  color: view === v ? "#A78BFA" : "var(--text-muted)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}>{v === "calendar" ? "📅 Calendar" : "📈 Chart"}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          <StatCard
            emoji={topMood ? moodConfig[topMood[0] as MoodKey].emoji : "❓"}
            label="Most common mood"
            value={topMood ? moodConfig[topMood[0] as MoodKey].label : "—"}
            color={topMood ? moodConfig[topMood[0] as MoodKey].color : "#fff"}
            sub={`${topMood?.[1] || 0} times`}
          />
          <StatCard emoji="🔥" label="Logging streak" value={`${streak}d`} color="#FBBF24" sub="days in a row" />
          <StatCard emoji="📝" label="Total logs" value={logsWithMood.length} color="#60A5FA" sub="out of 35 days" />
          <StatCard
            emoji="📊"
            label="Positive days"
            value={`${Math.round((moodCounts["happy"] / logsWithMood.length) * 100) || 0}%`}
            color="#4ADE80"
            sub={`${moodCounts["happy"]} happy days`}
          />
        </div>

        {/* Calendar view */}
        {view === "calendar" && (
          <div className="fade">
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 20, padding: "24px 28px", marginBottom: 20,
            }}>
              {/* Day labels */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 8 }}>
                {weekDays.map(d => (
                  <div key={d} style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", fontWeight: 600 }}>{d}</div>
                ))}
              </div>
              {/* Calendar grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
                {data.map((entry, i) => {
                  const isToday = entry.date.toDateString() === today.toDateString();
                  const isFuture = entry.date > today;
                  const mood = entry.mood ? moodConfig[entry.mood as MoodKey] : null;
                  return (
                    <div
                      key={i}
                      onClick={() => !isFuture && entry.mood && setSelectedDay(entry)}
                      title={mood ? `${mood.label}${entry.note ? " — " + entry.note : ""}` : ""}
                      style={{
                        aspectRatio: "1",
                        borderRadius: 10,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        gap: 2,
                        background: mood ? mood.bg : "rgba(255,255,255,0.03)",
                        border: isToday
                          ? "2px solid rgba(167,139,250,0.6)"
                          : mood
                          ? `1px solid ${mood.color}33`
                          : "1px solid rgba(255,255,255,0.05)",
                        cursor: mood ? "pointer" : "default",
                        opacity: isFuture ? 0.2 : 1,
                        transition: "all 0.15s",
                        position: "relative",
                      }}
                      onMouseEnter={e => mood && ((e.currentTarget as HTMLDivElement).style.transform = "scale(1.08)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.transform = "scale(1)")}
                    >
                      <span style={{ fontSize: 16 }}>{mood ? mood.emoji : ""}</span>
                      <span style={{ fontSize: 9, color: "var(--text-muted)" }}>
                        {entry.date.getDate()}
                      </span>
                      {entry.note && (
                        <div style={{
                          position: "absolute", top: 3, right: 3,
                          width: 5, height: 5, borderRadius: "50%",
                          background: mood?.color || "#fff", opacity: 0.8,
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
                {Object.entries(moodConfig).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                    <span>{v.emoji}</span><span>{v.label}</span>
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
                  <span>Has note</span>
                </div>
              </div>
            </div>

            {/* Selected day detail */}
            {selectedDay && (
              <div className="fade" style={{
                background: selectedDay.mood ? moodConfig[selectedDay.mood as MoodKey].bg : "rgba(255,255,255,0.03)",
                border: `1px solid ${selectedDay.mood ? moodConfig[selectedDay.mood as MoodKey].color + "44" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 16, padding: "20px 24px",
                display: "flex", alignItems: "center", gap: 20,
              }}>
                <div style={{ fontSize: 48 }}>{selectedDay.mood ? moodConfig[selectedDay.mood as MoodKey].emoji : "❓"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 3 }}>
                    {selectedDay.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: selectedDay.mood ? moodConfig[selectedDay.mood as MoodKey].color : "#fff", marginBottom: 6 }}>
                    {selectedDay.mood ? moodConfig[selectedDay.mood as MoodKey].label : "No log"}
                  </div>
                  {selectedDay.note
                    ? <div style={{ fontSize: 14, color: "var(--text-sub)", fontStyle: "italic" }}>"{selectedDay.note}"</div>
                    : <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No note left for this day.</div>
                  }
                </div>
                <button onClick={() => setSelectedDay(null)} style={{
                  background: "var(--bg-card)", border: "none",
                  borderRadius: 8, padding: "6px 12px",
                  color: "var(--text-muted)", fontSize: 12,
                  cursor: "pointer", fontFamily: "inherit",
                }}>✕ Close</button>
              </div>
            )}
          </div>
        )}

        {/* Chart view */}
        {view === "chart" && (
          <div className="fade">
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 20, padding: "24px 28px", marginBottom: 20,
            }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 20 }}>
                MOOD DISTRIBUTION PER WEEK
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 160 }}>
                {weeks.map((w, wi) => {
                  const total = w.happy + w.neutral + w.sad;
                  const happyH = total > 0 ? (w.happy / 7) * 100 : 0;
                  const neutralH = total > 0 ? (w.neutral / 7) * 100 : 0;
                  const sadH = total > 0 ? (w.sad / 7) * 100 : 0;
                  return (
                    <div key={wi} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                      <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 2 }}>
                        <div style={{ width: "100%", height: `${sadH}%`, borderRadius: "3px 3px 0 0", background: "#60A5FA", minHeight: sadH > 0 ? 4 : 0 }} title={`Sad/Anxious: ${w.sad}d`} />
                        <div style={{ width: "100%", height: `${neutralH}%`, background: "#FBBF24", minHeight: neutralH > 0 ? 4 : 0 }} title={`Neutral: ${w.neutral}d`} />
                        <div style={{ width: "100%", height: `${happyH}%`, borderRadius: wi === weeks.length - 1 ? "0 0 3px 3px" : 0, background: "#4ADE80", minHeight: happyH > 0 ? 4 : 0 }} title={`Happy: ${w.happy}d`} />
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{w.label}</span>
                    </div>
                  );
                })}
              </div>
              {/* Chart legend */}
              <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
                {[["#4ADE80","Happy"],["#FBBF24","Neutral"],["#60A5FA","Sad/Anxious"]].map(([color, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood breakdown bars */}
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 20, padding: "24px 28px",
            }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 20 }}>
                OVERALL BREAKDOWN — 35 DAYS
              </div>
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
                      <div style={{ height: 8, borderRadius: 4, background: "var(--bg-card)", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`,
                          borderRadius: 4, background: v.color,
                          transition: "width 0.6s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Comparison section */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 20, padding: "24px 28px", marginTop: 20,
        }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 20 }}>
            COMPARISON BETWEEN CHILDREN
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {compData.map(child => (
              <div key={child.id} style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 16, padding: "18px 20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 24 }}>{child.avatar}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{child.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Mostly {child.top ? moodConfig[child.top[0] as MoodKey].label : "—"} {child.top ? moodConfig[child.top[0] as MoodKey].emoji : ""}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, height: 8, borderRadius: 4, overflow: "hidden" }}>
                  {Object.entries(moodConfig).map(([k, v]) => {
                    const pct = logsWithMood.length > 0 ? (child.counts[k] / 35) * 100 : 0;
                    return pct > 0 ? (
                      <div key={k} style={{ width: `${pct}%`, background: v.color, minWidth: 2 }} title={`${v.label}: ${child.counts[k]}d`} />
                    ) : null;
                  })}
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                  {Object.entries(moodConfig).map(([k, v]) => (
                    child.counts[k] > 0 ? (
                      <span key={k} style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {v.emoji} {child.counts[k]}d
                      </span>
                    ) : null
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}