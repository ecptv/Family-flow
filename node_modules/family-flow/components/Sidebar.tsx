"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { icon: "📊", label: "Overview", href: "/dashboard" },
  { icon: "📱", label: "Apps",     href: "/apps" },
  { icon: "😊", label: "Mood",     href: "/mood" },
  { icon: "⚙️", label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved !== "light";
    setDark(isDark);
    document.documentElement.classList.toggle("light", !isDark);
  }, []);

  const toggleTheme = () => {
    const newDark = !dark;
    setDark(newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
    document.documentElement.classList.toggle("light", !newDark);
  };

  return (
    <div style={{
      position: "fixed", left: 0, top: 0, bottom: 0, width: 64,
      background: "#1A2332",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex", flexDirection: "column",
      alignItems: "center", paddingTop: 20, paddingBottom: 20,
      gap: 8, zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{
  width: 36, height: 36, borderRadius: 10,
  background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
  display: "flex", alignItems: "center", justifyContent: "center",
  flexShrink: 0, marginBottom: 32,
  boxShadow: "0 4px 12px rgba(124,58,237,0.4)",
}}>
  <span style={{
    fontSize: 15, fontWeight: 800, color: "#fff",
    letterSpacing: "-0.03em", fontFamily: "inherit",
  }}> 🏠 </span>
</div>

      {/* Nav items */}
      {navItems.map(item => {
        const active = pathname === item.href;
        return (
          <a key={item.href} href={item.href} title={item.label} style={{
            width: 40, height: 40, borderRadius: 10,
            background: active ? "rgba(167,139,250,0.2)" : "transparent",
            outline: active ? "1px solid rgba(167,139,250,0.35)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, cursor: "pointer", textDecoration: "none",
            transition: "all 0.2s",
          }}>{item.icon}</a>
        );
      })}

      {/* Theme toggle — pushed to bottom */}
      <div style={{ marginTop: "auto" }}>
        <button
          onClick={toggleTheme}
          title={dark ? "Switch to Light" : "Switch to Dark"}
          style={{
            width: 40, height: 40, borderRadius: 10, border: "none",
            background: "rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, cursor: "pointer",
            transition: "background 0.2s",
          }}
        >{dark ? "☀️" : "🌙"}</button>
      </div>
    </div>
  );
}