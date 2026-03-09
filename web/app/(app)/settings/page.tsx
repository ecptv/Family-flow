"use client";

import { useState } from "react";

const initialChildren = [
  { id: 1, name: "Emma", age: 11, avatar: "🧒", screenTimeLimit: 5 },
  { id: 2, name: "Liam", age: 8, avatar: "👦", screenTimeLimit: 4 },
];

const avatarOptions = ["🧒", "👦", "👧", "🧑", "👩", "👨", "🐱", "🐶", "🦊", "🐼"];

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 20, padding: "24px 28px", marginBottom: 16,
    }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{title}</div>
        {description && <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{description}</div>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
      <label style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.05em" }}>{label.toUpperCase()}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      style={{
        background: "var(--input-bg)",
        border: "1px solid var(--input-border)",
        borderRadius: 10, padding: "10px 14px",
        color: "var(--text)", fontSize: 14,
        outline: "none", fontFamily: "inherit", width: "100%",
        transition: "border-color 0.2s",
      }}
    />
  );
}

function Toggle({ value, onChange, label, sub }: { value: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 14, color: "var(--text-sub)" }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>}
      </div>
      <div onClick={() => onChange(!value)} style={{
        width: 44, height: 24, borderRadius: 12, cursor: "pointer",
        background: value ? "linear-gradient(135deg, #7C3AED, #A78BFA)" : "rgba(255,255,255,0.1)",
        position: "relative", transition: "background 0.25s", flexShrink: 0, marginLeft: 16,
      }}>
        <div style={{
          position: "absolute", top: 3,
          left: value ? 23 : 3,
          width: 18, height: 18, borderRadius: "50%",
          background: "#fff", transition: "left 0.25s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }} />
      </div>
    </div>
  );
}

function ChildEditor({ child, onSave, onDelete, onClose }: { child: any; onSave: (c: any) => void; onDelete: (id: number) => void; onClose: () => void }) {
  const [name, setName] = useState(child.name);
  const [age, setAge] = useState(String(child.age));
  const [avatar, setAvatar] = useState(child.avatar);
  const [limit, setLimit] = useState(child.screenTimeLimit);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#13132a", border: "1px solid rgba(167,139,250,0.25)",
        borderRadius: 24, padding: 32, width: 380,
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
      }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 24 }}>
          {child.id === -1 ? "Add Child" : "Edit Child"}
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: 8 }}>AVATAR</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {avatarOptions.map(a => (
              <div key={a} onClick={() => setAvatar(a)} style={{
                width: 40, height: 40, borderRadius: 10, fontSize: 20,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: avatar === a ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.05)",
                border: avatar === a ? "1px solid rgba(167,139,250,0.5)" : "1px solid transparent",
                cursor: "pointer", transition: "all 0.15s",
              }}>{a}</div>
            ))}
          </div>
        </div>
        <Field label="Name"><Input value={name} onChange={setName} placeholder="Child's name" /></Field>
        <Field label="Age"><Input value={age} onChange={setAge} type="number" placeholder="Age" /></Field>
        <Field label={`Screen time limit: ${limit}h / day`}>
          <input type="range" min={0.5} max={10} step={0.5} value={limit}
            onChange={e => setLimit(parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "#A78BFA" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            <span>0.5h</span><span>10h</span>
          </div>
        </Field>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {child.id !== -1 && (
            <button onClick={() => { onDelete(child.id); onClose(); }} style={{
              padding: "11px 16px", borderRadius: 12, border: "none",
              background: "rgba(248,113,113,0.1)", outline: "1px solid rgba(248,113,113,0.25)",
              color: "#F87171", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            }}>Delete</button>
          )}
          <button onClick={onClose} style={{
            flex: 1, padding: "11px 0", borderRadius: 12, border: "none",
            background: "var(--bg-card)",
            color: "var(--text-sub)", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          }}>Cancel</button>
          <button onClick={() => { onSave({ ...child, name, age: parseInt(age), avatar, screenTimeLimit: limit }); onClose(); }} style={{
            flex: 1, padding: "11px 0", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
            color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>Save</button>
        </div>
      </div>
    </div>
  );
}

function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const [confirm, setConfirm] = useState("");
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#13132a", border: "1px solid rgba(248,113,113,0.3)",
        borderRadius: 24, padding: 32, width: 380,
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
      }}>
        <div style={{ fontSize: 32, textAlign: "center", marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", textAlign: "center", marginBottom: 8 }}>
          Delete Account
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6, marginBottom: 24 }}>
          This will permanently delete your account and all family data. This action cannot be undone.
        </div>
        <Field label='Type "DELETE" to confirm'>
          <Input value={confirm} onChange={setConfirm} placeholder="DELETE" />
        </Field>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
            background: "var(--bg-card)",
            color: "var(--text-sub)", fontSize: 14, cursor: "pointer", fontFamily: "inherit",
          }}>Cancel</button>
          <button
            disabled={confirm !== "DELETE"}
            onClick={() => alert("Delete account — will be implemented with backend")}
            style={{
              flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
              background: confirm === "DELETE" ? "linear-gradient(135deg, #DC2626, #F87171)" : "rgba(255,255,255,0.05)",
              color: confirm === "DELETE" ? "#fff" : "rgba(255,255,255,0.2)",
              fontSize: 14, fontWeight: 600,
              cursor: confirm === "DELETE" ? "pointer" : "not-allowed",
              fontFamily: "inherit", transition: "all 0.2s",
            }}>Delete Forever</button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [name, setName] = useState("Sarah Johnson");
  const [email, setEmail] = useState("sarah@example.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [children, setChildren] = useState(initialChildren);
  const [editingChild, setEditingChild] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [passwordError, setPasswordError] = useState("");

  const [notifs, setNotifs] = useState({
    screenTimeExceeded: true,
    moodAlert: true,
    dailySummary: false,
    weeklyReport: true,
    appInstalled: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveChild = (updated: any) => {
    if (updated.id === -1) {
      setChildren(prev => [...prev, { ...updated, id: Date.now() }]);
    } else {
      setChildren(prev => prev.map(c => c.id === updated.id ? updated : c));
    }
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    setPasswordError("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    alert("Password changed! (Will connect to backend later)");
  };

  return (
    <div >

      <div style={{ padding: "28px 32px", maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em" }}>Settings</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              Manage your account and family preferences
            </div>
          </div>
          <button onClick={handleSave} style={{
            padding: "10px 22px", borderRadius: 12, border: "none",
            background: saved ? "rgba(74,222,128,0.15)" : "linear-gradient(135deg, #7C3AED, #A78BFA)",
            outline: saved ? "1px solid rgba(74,222,128,0.3)" : "none",
            color: saved ? "#4ADE80" : "#fff",
            fontSize: 14, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.3s",
          }}>
            {saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>

        {/* Profile */}
        <Section title="Parent Profile" description="Your name and email address">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
            }}>👩</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{name}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Parent Account</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Full Name"><Input value={name} onChange={setName} placeholder="Your name" /></Field>
            <Field label="Email"><Input value={email} onChange={setEmail} type="email" placeholder="your@email.com" /></Field>
          </div>
        </Section>

        {/* Children */}
        <Section title="Manage Children" description="Add, edit or remove children from your family">
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {children.map(child => (
              <div key={child.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 14, padding: "14px 16px",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "var(--bg-card)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>{child.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{child.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Age {child.age} · {child.screenTimeLimit}h daily limit
                  </div>
                </div>
                <button onClick={() => setEditingChild(child)} style={{
                  padding: "6px 14px", borderRadius: 8, border: "none",
                  background: "rgba(167,139,250,0.1)",
                  outline: "1px solid rgba(167,139,250,0.2)",
                  color: "#A78BFA", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                }}>Edit</button>
              </div>
            ))}
          </div>
          <button onClick={() => setEditingChild({ id: -1, name: "", age: 8, avatar: "🧒", screenTimeLimit: 4 })} style={{
            width: "100%", padding: "12px 0", borderRadius: 12, border: "none",
            background: "var(--bg-card)",
            outline: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.45)", fontSize: 14,
            cursor: "pointer", fontFamily: "inherit",
          }}>+ Add Child</button>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" description="Choose when to receive alerts">
          <Toggle value={notifs.screenTimeExceeded} onChange={v => setNotifs(n => ({ ...n, screenTimeExceeded: v }))} label="Screen time limit exceeded" />
          <Toggle value={notifs.moodAlert} onChange={v => setNotifs(n => ({ ...n, moodAlert: v }))} label="Child logs sad or anxious mood" />
          <Toggle value={notifs.dailySummary} onChange={v => setNotifs(n => ({ ...n, dailySummary: v }))} label="Daily activity summary" />
          <Toggle value={notifs.weeklyReport} onChange={v => setNotifs(n => ({ ...n, weeklyReport: v }))} label="Weekly family report" />
          <Toggle value={notifs.appInstalled} onChange={v => setNotifs(n => ({ ...n, appInstalled: v }))} label="New app installed on child's device" />
        </Section>

        {/* Account & Security */}
        <Section title="Account & Security" description="Password and account management">

          {/* Change password */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-sub)", marginBottom: 14 }}>
              Change Password
            </div>
            <Field label="Current Password">
              <Input value={currentPassword} onChange={setCurrentPassword} type="password" placeholder="••••••••" />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="New Password">
                <Input value={newPassword} onChange={setNewPassword} type="password" placeholder="••••••••" />
              </Field>
              <Field label="Confirm New Password">
                <Input value={confirmPassword} onChange={setConfirmPassword} type="password" placeholder="••••••••" />
              </Field>
            </div>
            {passwordError && (
              <div style={{
                background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)",
                borderRadius: 10, padding: "10px 14px",
                fontSize: 13, color: "#F87171", marginBottom: 12,
              }}>{passwordError}</div>
            )}
            <button onClick={handleChangePassword} style={{
              padding: "10px 20px", borderRadius: 10, border: "none",
              background: "rgba(167,139,250,0.1)",
              outline: "1px solid rgba(167,139,250,0.25)",
              color: "#A78BFA", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>Update Password</button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--bg-card)", marginBottom: 24 }} />

          {/* Sign out + delete */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => window.location.href = "/home"}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                background: "var(--bg-card)",
                outline: "1px solid rgba(255,255,255,0.08)",
                color: "var(--text-sub)", fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
              🚪 Sign Out
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                background: "rgba(248,113,113,0.07)",
                outline: "1px solid rgba(248,113,113,0.2)",
                color: "#F87171", fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
              🗑 Delete Account
            </button>
          </div>
        </Section>

      </div>

      {editingChild && (
        <ChildEditor
          child={editingChild}
          onSave={handleSaveChild}
          onDelete={(id) => setChildren(prev => prev.filter(c => c.id !== id))}
          onClose={() => setEditingChild(null)}
        />
      )}

      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}
    </div>
  );
}