import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }
      const childJson = await AsyncStorage.getItem("selected_child");
      if (childJson) {
        router.replace("/home");
      } else {
        router.replace("/select-child");
      }
    };
    check();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a14", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color="#A78BFA" size="large" />
    </View>
  );
}