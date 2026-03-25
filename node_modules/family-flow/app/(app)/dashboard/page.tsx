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

const days = ["M","T","W","T","F","S","S"];

function ScreenTimeRing({ used, limit }: { used: number; limit: number }) {
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

function LimitEditor({ child, onClose, onSave }: { child: any; onClose: () => void; onSave: (limit: number) => void }) {
  const [val, setVal] = useState(child.screen_time_limit || 4);
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
          <button onClick={() => { onSave(val); onClose(); }} style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
            color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
          }}>Save Limit</button>
        </div>
      </div>
    </div>
  );
}

export default function FamilyFlowDashboard() {
  const [children, setChildren] = useState<any[]>([]);
  const [selected, setSelected] = useState(0);
  const [editingLimit, setEditingLimit] = useState(false);
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [screenTimeLogs, setScreenTimeLogs] = useState<any[]>([]);
  const [appUsage, setAppUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<"bedtime" | "pause" | "message" | "location" | null>(null);
  const [bedtime, setBedtime] = useState({ bedtime: "21:00", wake_time: "07:00", enabled: true });
  const [screenControl, setScreenControl] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [pauseReason, setPauseReason] = useState("");
  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);

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

    if (kids) setChildren(kids);
    setLoading(false);
  };
  load();
}, []);


useEffect(() => {
  if (children.length === 0) return;
  const child = children[selected];
  if (!child) return;

  const channel = supabase
    .channel("dashboard:" + child.id)
    .on("postgres_changes", {
      event: "*", schema: "public", table: "screen_time_logs",
      filter: "child_id=eq." + child.id,
    }, () => loadChildData(child.id))
    .on("postgres_changes", {
      event: "*", schema: "public", table: "mood_logs",
      filter: "child_id=eq." + child.id,
    }, () => loadChildData(child.id))
    .on("postgres_changes", {
      event: "*", schema: "public", table: "screen_controls",
      filter: "child_id=eq." + child.id,
    }, () => loadChildData(child.id))
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [children, selected]);


  useEffect(() => {
    if (children.length === 0) return;
    const child = children[selected];
    if (!child) return;
    loadChildData(child.id);
  }, [children, selected]);

  const loadChildData = async (childId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const [moodRes, screenRes, appRes] = await Promise.all([
      supabase.from("mood_logs").select("*").eq("child_id", childId).order("logged_at", { ascending: false }).limit(7),
      supabase.from("screen_time_logs").select("*").eq("child_id", childId).gte("date", sevenDaysAgo).order("date"),
      supabase.from("app_usage").select("*").eq("child_id", childId).eq("date", today).order("minutes", { ascending: false }),
    ]);

    if (moodRes.data) setMoodLogs(moodRes.data);
    if (screenRes.data) setScreenTimeLogs(screenRes.data);
    if (appRes.data) setAppUsage(appRes.data);
  

  const [bedtimeRes, screenControlRes, locationRes] = await Promise.all([
      supabase.from("bedtime_schedules").select("*").eq("child_id", childId).single(),
      supabase.from("screen_controls").select("*").eq("child_id", childId).single(),
      supabase.from("location_logs").select("*").eq("child_id", childId).order("logged_at", { ascending: false }).limit(1).single(),
    ]);
    if (bedtimeRes.data) setBedtime(bedtimeRes.data);
    if (screenControlRes.data) setScreenControl(screenControlRes.data);
    if (locationRes.data) setLocation(locationRes.data);
    };

  const handleSaveLimit = async (limit: number) => {
    const child = children[selected];
    if (!child) return;
    await supabase.from("children").update({ screen_time_limit: limit }).eq("id", child.id);
    setChildren(prev => prev.map((c, i) => i === selected ? { ...c, screen_time_limit: limit } : c));
  };

  const handleSaveBedtime = async () => {
    const child = children[selected];
    if (!child) return;
    const { data: existing } = await supabase.from("bedtime_schedules").select("id").eq("child_id", child.id).single();
    if (existing) {
      await supabase.from("bedtime_schedules").update({ bedtime: bedtime.bedtime, wake_time: bedtime.wake_time, enabled: bedtime.enabled }).eq("child_id", child.id);
    } else {
      await supabase.from("bedtime_schedules").insert({ child_id: child.id, bedtime: bedtime.bedtime, wake_time: bedtime.wake_time, enabled: bedtime.enabled });
    }
    setActiveModal(null);
  };

  const handleTogglePause = async () => {
    const child = children[selected];
    if (!child) return;
    const newPaused = !screenControl?.paused;
    const { data: existing } = await supabase.from("screen_controls").select("id").eq("child_id", child.id).single();
    if (existing) {
      await supabase.from("screen_controls").update({ paused: newPaused, pause_reason: newPaused ? pauseReason : null, updated_at: new Date().toISOString() }).eq("child_id", child.id);
    } else {
      await supabase.from("screen_controls").insert({ child_id: child.id, paused: newPaused, pause_reason: newPaused ? pauseReason : null });
    }
    setScreenControl((prev: any) => ({ ...prev, paused: newPaused, pause_reason: newPaused ? pauseReason : null }));
    setPauseReason("");
    setActiveModal(null);
  };

  const handleSendMessage = async () => {
    const child = children[selected];
    if (!child || !message.trim()) return;
    await supabase.from("parent_messages").insert({ child_id: child.id, message: message.trim() });
    setMessage("");
    setActiveModal(null);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Loading...</div>
    </div>
  );

  if (children.length === 0) return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 12 }}>Family Overview</div>
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 20, padding: "48px 32px", textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍👩‍👧‍👦</div>
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

  const child = children[selected];
  const latestMood = moodLogs[0];
  const moodHistory = moodLogs.slice(0, 7).reverse();
  const todayScreen = screenTimeLogs.find(s => s.date === new Date().toISOString().split("T")[0]);
  const screenUsed = (todayScreen?.minutes_used || 0) / 60; // conversie minute → ore
  const screenLimit = child.screen_time_limit || 4;
  const over = screenUsed > screenLimit;
  const alerts = children.filter(c => {
    const todayLog = screenTimeLogs.find(s => s.date === new Date().toISOString().split("T")[0] && s.child_id === c.id);
    return todayLog && todayLog.minutes_used > c.screen_time_limit;
  });

  const weeklyScreen = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const log = screenTimeLogs.find(s => s.date === d);
  return (log?.minutes_used || 0) / 60; // minute → ore
});

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
        {children.map((c, i) => (
          <button key={c.id} onClick={() => setSelected(i)} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 16px", borderRadius: 12, border: "none",
            background: selected === i ? "rgba(167,139,250,0.15)" : "var(--bg-card)",
            outline: selected === i ? "1px solid rgba(167,139,250,0.35)" : "1px solid var(--border)",
            color: selected === i ? "#A78BFA" : "var(--text-sub)",
            fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
          }}>
            <span>{c.avatar}</span><span>{c.name}</span>
          </button>
        ))}
      </div>

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
            <ScreenTimeRing used={screenUsed} limit={screenLimit} />
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Used</span>
                  <span style={{ fontSize: 12, color: "var(--text-sub)" }}>{screenUsed.toFixed(1)}h of {screenLimit}h</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.min((screenUsed / screenLimit) * 100, 100)}%`,
                    borderRadius: 3,
                    background: over ? "linear-gradient(90deg, #F87171, #FCA5A5)" : "linear-gradient(90deg, #7C3AED, #A78BFA)",
                  }} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {over ? `⚠ ${(screenUsed - screenLimit).toFixed(1)}h over limit` : `${(screenLimit - screenUsed).toFixed(1)}h remaining`}
              </div>
            </div>
          </div>
        </div>

        {/* Mood */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "22px 24px" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 16 }}>MOOD TRACKER</div>
          {latestMood ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: moodConfig[latestMood.mood]?.bg,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28
                }}>{moodConfig[latestMood.mood]?.emoji}</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: moodConfig[latestMood.mood]?.color }}>
                    {moodConfig[latestMood.mood]?.label}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {new Date(latestMood.logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>7-DAY HISTORY</div>
              <div style={{ display: "flex", gap: 6 }}>
                {moodHistory.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 16, opacity: i === moodHistory.length - 1 ? 1 : 0.4 + (i / moodHistory.length) * 0.5 }}>
                      {moodConfig[m.mood]?.emoji}
                    </span>
                    <span style={{ fontSize: 9, color: "var(--text-muted)" }}>
                      {new Date(m.logged_at).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>
              No mood logs yet
            </div>
          )}
        </div>
      </div>

      {/* Weekly + Apps */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Weekly Chart */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "22px 24px" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: 4 }}>WEEKLY SCREEN TIME</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 20, opacity: 0.6 }}>Daily limit: {screenLimit}h</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
            {weeklyScreen.map((val, i) => {
              const isToday = i === weeklyScreen.length - 1;
              const over = val > screenLimit;
              const max = Math.max(...weeklyScreen, screenLimit, 1);
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
                  <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", position: "relative" }}>
                    {i === 0 && (
                      <div style={{
                        position: "absolute", bottom: `${(screenLimit / max) * 100}%`,
                        left: "-200%", right: "-700%", height: 1,
                        background: "var(--divider)", zIndex: 1, pointerEvents: "none"
                      }}>
                        <span style={{ position: "absolute", right: 0, top: -10, fontSize: 9, color: "var(--text-muted)" }}>limit</span>
                      </div>
                    )}
                    <div style={{
                      width: "100%", height: `${(val / max) * 100}%`,
                      minHeight: val > 0 ? 4 : 0,
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
          {appUsage.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-muted)", fontSize: 13 }}>
              No app usage data yet
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {appUsage.slice(0, 3).map(app => (
                  <div key={app.id} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{app.app_name}</span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {Math.floor(app.minutes / 60) > 0 ? `${Math.floor(app.minutes / 60)}h ` : ""}{app.minutes % 60}m
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${(app.minutes / appUsage[0].minutes) * 100}%`,
                        borderRadius: 3, background: app.color || "#A78BFA", opacity: 0.75,
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
                  {Math.floor(appUsage.reduce((a, b) => a + b.minutes, 0) / 60)}h {appUsage.reduce((a, b) => a + b.minutes, 0) % 60}m
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        <button onClick={() => setActiveModal("bedtime")} style={{
          padding: "16px 0", borderRadius: 12, border: "none",
          background: "var(--bg-card)", outline: "1px solid var(--border)",
          color: "var(--text-sub)", fontSize: 12, fontWeight: 500, cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
          transition: "all 0.2s", fontFamily: "inherit"
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(167,139,250,0.1)"; e.currentTarget.style.color = "#A78BFA"; e.currentTarget.style.outline = "1px solid rgba(167,139,250,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.color = "var(--text-sub)"; e.currentTarget.style.outline = "1px solid var(--border)"; }}
        ><span style={{ fontSize: 24 }}>⏰</span><span>Set Bedtime</span></button>

        <button onClick={() => setActiveModal("pause")} style={{
          padding: "16px 0", borderRadius: 12, border: "none",
          background: screenControl?.paused ? "rgba(248,113,113,0.1)" : "var(--bg-card)",
          outline: screenControl?.paused ? "1px solid rgba(248,113,113,0.3)" : "1px solid var(--border)",
          color: screenControl?.paused ? "#F87171" : "var(--text-sub)", fontSize: 12, fontWeight: 500, cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
          transition: "all 0.2s", fontFamily: "inherit"
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.1)"; e.currentTarget.style.color = "#F87171"; e.currentTarget.style.outline = "1px solid rgba(248,113,113,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = screenControl?.paused ? "rgba(248,113,113,0.1)" : "var(--bg-card)"; e.currentTarget.style.color = screenControl?.paused ? "#F87171" : "var(--text-sub)"; e.currentTarget.style.outline = screenControl?.paused ? "1px solid rgba(248,113,113,0.3)" : "1px solid var(--border)"; }}
        ><span style={{ fontSize: 24 }}>{screenControl?.paused ? "▶️" : "📵"}</span><span>{screenControl?.paused ? "Resume Screen" : "Pause Screen"}</span></button>

        <button onClick={() => setActiveModal("message")} style={{
          padding: "16px 0", borderRadius: 12, border: "none",
          background: "var(--bg-card)", outline: "1px solid var(--border)",
          color: "var(--text-sub)", fontSize: 12, fontWeight: 500, cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
          transition: "all 0.2s", fontFamily: "inherit"
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(96,165,250,0.1)"; e.currentTarget.style.color = "#60A5FA"; e.currentTarget.style.outline = "1px solid rgba(96,165,250,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.color = "var(--text-sub)"; e.currentTarget.style.outline = "1px solid var(--border)"; }}
        ><span style={{ fontSize: 24 }}>✉️</span><span>Send Message</span></button>

        <button onClick={() => setActiveModal("location")} style={{
          padding: "16px 0", borderRadius: 12, border: "none",
          background: "var(--bg-card)", outline: "1px solid var(--border)",
          color: "var(--text-sub)", fontSize: 12, fontWeight: 500, cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
          transition: "all 0.2s", fontFamily: "inherit"
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(74,222,128,0.1)"; e.currentTarget.style.color = "#4ADE80"; e.currentTarget.style.outline = "1px solid rgba(74,222,128,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.color = "var(--text-sub)"; e.currentTarget.style.outline = "1px solid var(--border)"; }}
        ><span style={{ fontSize: 24 }}>📍</span><span>Check Location</span></button>
      </div>

      {/* Modals */}
      {activeModal === "bedtime" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setActiveModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 24, padding: 32, width: 360, boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
            <div style={{ fontSize: 32, textAlign: "center", marginBottom: 8 }}>⏰</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", textAlign: "center", marginBottom: 4 }}>Set Bedtime</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginBottom: 24 }}>for {child.name}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>BEDTIME</label>
                <input type="time" value={bedtime.bedtime} onChange={e => setBedtime(b => ({ ...b, bedtime: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: 10, color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>WAKE TIME</label>
                <input type="time" value={bedtime.wake_time} onChange={e => setBedtime(b => ({ ...b, wake_time: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: 10, color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <span style={{ fontSize: 14, color: "var(--text-sub)" }}>Enable bedtime schedule</span>
              <div onClick={() => setBedtime(b => ({ ...b, enabled: !b.enabled }))} style={{
                width: 44, height: 24, borderRadius: 12, cursor: "pointer",
                background: bedtime.enabled ? "linear-gradient(135deg, #7C3AED, #A78BFA)" : "rgba(255,255,255,0.1)",
                position: "relative", transition: "background 0.25s",
              }}>
                <div style={{ position: "absolute", top: 3, left: bedtime.enabled ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.25s" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "none", background: "var(--bg-card)", outline: "1px solid var(--border)", color: "var(--text-sub)", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={handleSaveBedtime} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #7C3AED, #A78BFA)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "pause" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setActiveModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 24, padding: 32, width: 360, boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
            <div style={{ fontSize: 32, textAlign: "center", marginBottom: 8 }}>{screenControl?.paused ? "▶️" : "📵"}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", textAlign: "center", marginBottom: 4 }}>{screenControl?.paused ? "Resume Screen" : "Pause Screen"}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginBottom: 24 }}>for {child.name}</div>
            {!screenControl?.paused && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>REASON (optional)</label>
                <input type="text" value={pauseReason} onChange={e => setPauseReason(e.target.value)}
                  placeholder="e.g. Dinner time, Homework..."
                  style={{ width: "100%", padding: "10px 14px", background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: 10, color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {["Dinner time", "Homework", "Bedtime", "Family time"].map(r => (
                    <button key={r} onClick={() => setPauseReason(r)} style={{
                      padding: "5px 12px", borderRadius: 20, border: "none",
                      background: pauseReason === r ? "rgba(167,139,250,0.15)" : "var(--bg-card)",
                      outline: pauseReason === r ? "1px solid rgba(167,139,250,0.35)" : "1px solid var(--border)",
                      color: pauseReason === r ? "#A78BFA" : "var(--text-muted)",
                      fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                    }}>{r}</button>
                  ))}
                </div>
              </div>
            )}
            {screenControl?.paused && screenControl.pause_reason && (
              <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#F87171" }}>
                Currently paused: {screenControl.pause_reason}
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "none", background: "var(--bg-card)", outline: "1px solid var(--border)", color: "var(--text-sub)", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={handleTogglePause} style={{
                flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
                background: screenControl?.paused ? "linear-gradient(135deg, #059669, #34D399)" : "linear-gradient(135deg, #DC2626, #F87171)",
                color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
              }}>{screenControl?.paused ? "Resume" : "Pause Now"}</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "message" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setActiveModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 24, padding: 32, width: 400, boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
            <div style={{ fontSize: 32, textAlign: "center", marginBottom: 8 }}>✉️</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", textAlign: "center", marginBottom: 4 }}>Send Message</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginBottom: 24 }}>to {child.name}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {["Time for dinner! 🍽️", "Homework time 📚", "Come downstairs 👋", "5 more minutes ⏱️"].map(q => (
                <button key={q} onClick={() => setMessage(q)} style={{
                  padding: "6px 12px", borderRadius: 20, border: "none",
                  background: message === q ? "rgba(167,139,250,0.15)" : "var(--bg-card)",
                  outline: message === q ? "1px solid rgba(167,139,250,0.35)" : "1px solid var(--border)",
                  color: message === q ? "#A78BFA" : "var(--text-muted)",
                  fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                }}>{q}</button>
              ))}
            </div>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Type your message..."
              rows={3}
              style={{
                width: "100%", padding: "10px 14px", background: "var(--input-bg)",
                border: "1px solid var(--input-border)", borderRadius: 10,
                color: "var(--text)", fontSize: 14, fontFamily: "inherit",
                outline: "none", resize: "none", marginBottom: 20,
              }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: "12px 0", borderRadius: 12, border: "none", background: "var(--bg-card)", outline: "1px solid var(--border)", color: "var(--text-sub)", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={handleSendMessage} disabled={!message.trim()} style={{
                flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
                background: message.trim() ? "linear-gradient(135deg, #7C3AED, #A78BFA)" : "var(--bg-card)",
                outline: message.trim() ? "none" : "1px solid var(--border)",
                color: message.trim() ? "#fff" : "var(--text-muted)",
                fontSize: 14, fontWeight: 600, cursor: message.trim() ? "pointer" : "not-allowed", fontFamily: "inherit"
              }}>Send</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === "location" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setActiveModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 24, padding: 32, width: 400, boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
            <div style={{ fontSize: 32, textAlign: "center", marginBottom: 8 }}>📍</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", textAlign: "center", marginBottom: 4 }}>Last Known Location</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginBottom: 24 }}>{child.name}</div>
            {location ? (
              <div>
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px", marginBottom: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "var(--text-sub)", marginBottom: 8 }}>📍 {location.address || "Unknown address"}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {new Date(location.logged_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <a href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`} target="_blank" rel="noreferrer" style={{
                  display: "block", textAlign: "center", padding: "12px 0", borderRadius: 12,
                  background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
                  color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", marginBottom: 10,
                }}>Open in Google Maps</a>
              </div>
            ) : (
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "32px", textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No location data yet. Will be available once the mobile app is installed on {child.name}'s device.</div>
              </div>
            )}
            <button onClick={() => setActiveModal(null)} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: "var(--bg-card)", outline: "1px solid var(--border)", color: "var(--text-sub)", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Close</button>
          </div>
        </div>
      )}

      {editingLimit && <LimitEditor child={child} onClose={() => setEditingLimit(false)} onSave={handleSaveLimit} />}
    </div>
  );
}