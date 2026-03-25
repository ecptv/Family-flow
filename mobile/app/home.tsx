import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { useTheme } from "../lib/ThemeContext";

const moodOptions = [
  { key: "happy",   emoji: "😊", label: "Happy",   color: "#4ADE80" },
  { key: "neutral", emoji: "😐", label: "Neutral",  color: "#FBBF24" },
  { key: "sad",     emoji: "😢", label: "Sad",      color: "#60A5FA" },
  { key: "angry",   emoji: "😠", label: "Angry",    color: "#F87171" },
  { key: "anxious", emoji: "😰", label: "Anxious",  color: "#C084FC" },
];

export default function Home() {
  const router = useRouter();
  const { c, theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [child, setChild] = useState<any>(null);
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [screenControl, setScreenControl] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingMood, setSavingMood] = useState(false);
  const realtimeCleanupRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => checkScreenControl(), 30000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setTimeout(() => router.replace("/login"), 100);
      }
    });

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
      if (realtimeCleanupRef.current) realtimeCleanupRef.current();
    };
  }, []);

  const setupRealtime = (childId: string) => {
    const messagesSub = supabase
      .channel("messages:" + childId)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "parent_messages",
        filter: "child_id=eq." + childId,
      }, (payload) => {
        setMessages(prev => [payload.new as any, ...prev]);
      })
      .subscribe();

    const screenSub = supabase
      .channel("screen:" + childId)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "screen_controls",
        filter: "child_id=eq." + childId,
      }, (payload) => {
        setScreenControl(payload.new);
      })
      .subscribe();

    realtimeCleanupRef.current = () => {
      supabase.removeChannel(messagesSub);
      supabase.removeChannel(screenSub);
    };
  };

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }
      setUser(session.user);

      const childJson = await AsyncStorage.getItem("selected_child");
      if (!childJson) { router.replace("/select-child"); return; }
      const childData = JSON.parse(childJson);
      setChild(childData);
      setupRealtime(childData.id);

      const today = new Date().toISOString().split("T")[0];

      const { data: moodData } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("child_id", childData.id)
        .gte("logged_at", today)
        .maybeSingle();
      if (moodData) setTodayMood(moodData.mood);

      const { data: msgs } = await supabase
        .from("parent_messages")
        .select("*")
        .eq("child_id", childData.id)
        .eq("read", false)
        .order("created_at", { ascending: false });
      if (msgs) setMessages(msgs);

      await checkScreenControl(childData.id);
      setLoading(false);
    } catch (err) {
      console.error("LOAD ERROR:", err);
      setLoading(false);
    }
  };

  const checkScreenControl = async (childId?: string) => {
    const id = childId || child?.id;
    if (!id) return;
    const { data } = await supabase
      .from("screen_controls")
      .select("*")
      .eq("child_id", id)
      .maybeSingle();
    if (data) setScreenControl(data);
  };

  const logMood = async (mood: string) => {
    setSavingMood(true);
    if (!child) return;
    await supabase.from("mood_logs").insert({
      child_id: child.id,
      mood,
      logged_at: new Date().toISOString(),
    });
    setTodayMood(mood);
    setSavingMood(false);
  };

  const markMessageRead = async (id: string) => {
    await supabase.from("parent_messages").update({ read: true }).eq("id", id);
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleSignOut = async () => {
    await AsyncStorage.removeItem("selected_child");
    await supabase.auth.signOut();
  };

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={c.accent} size="large" />
      <Text style={{ color: c.textMuted, marginTop: 16, fontSize: 13 }}>Loading...</Text>
    </View>
  );

  if (screenControl?.paused) return (
    <View style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center", padding: 32 }}>
      <Text style={{ fontSize: 64, marginBottom: 24 }}>📵</Text>
      <Text style={{ fontSize: 24, fontWeight: "800", color: c.text, textAlign: "center", marginBottom: 12 }}>
        Screen Paused
      </Text>
      {screenControl.pause_reason ? (
        <Text style={{ fontSize: 16, color: c.textSub, textAlign: "center" }}>
          {screenControl.pause_reason}
        </Text>
      ) : null}
      <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 24, textAlign: "center" }}>
        Your parent will resume access soon.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>

        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <View>
            <Text style={{ fontSize: 26, fontWeight: "800", color: c.accent }}>FamilyFlow</Text>
            <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity onPress={toggleTheme} style={{
              padding: 8, borderRadius: 10,
              backgroundColor: c.card,
              borderWidth: 1, borderColor: c.border,
            }}>
              <Text style={{ fontSize: 16 }}>{theme === "dark" ? "☀️" : "🌙"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignOut} style={{
              padding: 8, borderRadius: 10,
              backgroundColor: c.card,
              borderWidth: 1, borderColor: c.border,
            }}>
              <Text style={{ fontSize: 12, color: c.textMuted }}>Sign out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mesaje */}
        {messages.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 11, color: c.textMuted, letterSpacing: 1, marginBottom: 10 }}>
              MESSAGES FROM PARENT
            </Text>
            {messages.map(msg => (
              <TouchableOpacity key={msg.id} onPress={() => markMessageRead(msg.id)} style={{
                backgroundColor: "rgba(167,139,250,0.12)",
                borderRadius: 16, padding: 16, marginBottom: 8,
                borderWidth: 1, borderColor: "rgba(167,139,250,0.25)",
                flexDirection: "row", alignItems: "center", gap: 12,
              }}>
                <Text style={{ fontSize: 24 }}>✉️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 15, fontWeight: "600" }}>{msg.message}</Text>
                  <Text style={{ color: c.textMuted, fontSize: 11, marginTop: 4 }}>Tap to dismiss</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Mood tracker */}
        <View style={{
          backgroundColor: c.card, borderRadius: 20, padding: 20, marginBottom: 16,
          borderWidth: 1, borderColor: c.border,
        }}>
          <Text style={{ fontSize: 11, color: c.textMuted, letterSpacing: 1, marginBottom: 4 }}>
            HOW ARE YOU FEELING TODAY?
          </Text>
          {todayMood ? (
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <Text style={{ fontSize: 56 }}>{moodOptions.find(m => m.key === todayMood)?.emoji}</Text>
              <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 8,
                color: moodOptions.find(m => m.key === todayMood)?.color }}>
                {moodOptions.find(m => m.key === todayMood)?.label}
              </Text>
              <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 4 }}>Logged today ✓</Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
              {moodOptions.map(m => (
                <TouchableOpacity key={m.key} onPress={() => logMood(m.key)} disabled={savingMood}
                  style={{ alignItems: "center", gap: 6 }}>
                  <Text style={{ fontSize: 36 }}>{m.emoji}</Text>
                  <Text style={{ fontSize: 10, color: c.textMuted }}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Profile card */}
        <View style={{
          backgroundColor: c.card, borderRadius: 20, padding: 20,
          borderWidth: 1, borderColor: c.border,
        }}>
          <Text style={{ fontSize: 11, color: c.textMuted, letterSpacing: 1, marginBottom: 12 }}>
            YOUR PROFILE
          </Text>
          <Text style={{ fontSize: 15, color: c.text }}>{child?.name || user?.email}</Text>
          {child?.screen_time_limit && (
            <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 4 }}>
              Daily screen limit: {child.screen_time_limit}h
            </Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}