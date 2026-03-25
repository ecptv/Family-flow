import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { useTheme } from "../lib/ThemeContext";

export default function Login() {
  const router = useRouter();
  const { c, theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setTimeout(() => router.replace("/select-child"), 100);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: c.bg }}
    >
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>

        {/* Theme toggle */}
        
        <Pressable onPress={() => { console.log("PRESSED"); toggleTheme(); }} style={{
  position: "absolute", top: 56, right: 24,
  padding: 12, borderRadius: 10,
  backgroundColor: c.card,
  borderWidth: 1, borderColor: c.border,
  zIndex: 999,
}}>
  <Text style={{ fontSize: 18 }}>{theme === "dark" ? "☀️" : "🌙"}</Text>
</Pressable>

        <Text style={{ fontSize: 42, fontWeight: "800", color: c.accent, marginBottom: 8, letterSpacing: -1 }}>
          FamilyFlow
        </Text>
        <Text style={{ fontSize: 15, color: c.textMuted, marginBottom: 48 }}>
          Child's device
        </Text>

        <View style={{ width: "100%", gap: 12 }}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={c.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              backgroundColor: c.inputBg,
              borderRadius: 14, padding: 16,
              color: c.text, fontSize: 16,
              borderWidth: 1, borderColor: c.inputBorder,
            }}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={c.textMuted}
            secureTextEntry
            style={{
              backgroundColor: c.inputBg,
              borderRadius: 14, padding: 16,
              color: c.text, fontSize: 16,
              borderWidth: 1, borderColor: c.inputBorder,
            }}
          />

          {error ? (
            <Text style={{ color: "#F87171", fontSize: 13, textAlign: "center" }}>{error}</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: c.accent,
              borderRadius: 14, padding: 16,
              alignItems: "center", marginTop: 8,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Sign In</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}