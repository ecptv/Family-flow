import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { useTheme } from "../lib/ThemeContext";

export default function SelectChild() {
  const router = useRouter();
  const { c, theme, toggleTheme } = useTheme();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.replace("/login"); return; }

    const { data } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", session.user.id)
      .order("created_at");

    if (data) setChildren(data);
    setLoading(false);
  };

  const selectChild = async (child: any) => {
    await AsyncStorage.setItem("selected_child", JSON.stringify(child));
    router.replace("/home");
  };

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={c.accent} size="large" />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 32, paddingTop: 48 }}>

        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <View>
            <Text style={{ fontSize: 28, fontWeight: "800", color: c.text }}>
              Who's using{"\n"}this device?
            </Text>
            <Text style={{ fontSize: 15, color: c.textMuted, marginTop: 8 }}>
              Select the child's profile
            </Text>
          </View>
          <TouchableOpacity onPress={toggleTheme} style={{
            padding: 10, borderRadius: 12,
            backgroundColor: c.card,
            borderWidth: 1, borderColor: c.border,
          }}>
            <Text style={{ fontSize: 20 }}>{theme === "dark" ? "☀️" : "🌙"}</Text>
          </TouchableOpacity>
        </View>

        {children.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>👨‍👩‍👧‍👦</Text>
            <Text style={{ fontSize: 16, color: c.textSub, textAlign: "center" }}>
              No children added yet.{"\n"}Add them in the web app first.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {children.map(child => (
              <TouchableOpacity key={child.id} onPress={() => selectChild(child)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: c.card,
                  borderRadius: 20, padding: 20,
                  borderWidth: 1, borderColor: c.border,
                  flexDirection: "row", alignItems: "center", gap: 16,
                }}
              >
                <View style={{
                  width: 56, height: 56, borderRadius: 16,
                  backgroundColor: "rgba(124,58,237,0.15)",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Text style={{ fontSize: 28 }}>{child.avatar || "👤"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: c.text }}>{child.name}</Text>
                  <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }}>
                    Age {child.age} · {child.screen_time_limit}h daily limit
                  </Text>
                </View>
                <Text style={{ fontSize: 24, color: c.textMuted }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}