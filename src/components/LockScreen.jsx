import { useState } from "react";
import { Zap } from "lucide-react";
import { ROLE_LABELS } from "../data/initialData.js";
import { supabase } from "../lib/supabase.js";

export default function LockScreen({ storeName, staff, setCurrentUser, setLockScreen, setView }) {
  const [pinTarget, setPinTarget] = useState(null);
  const [pinEntry, setPinEntry] = useState("");
  const [pinError, setPinError] = useState(false);
  
  // Setup flow states
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [saving, setSaving] = useState(false);

  // Failsafe recovery states
  const [resetMode, setResetMode] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);

  const handleSelectStaff = (s) => {
    setPinTarget(s);
    setPinEntry("");
    setPinError(false);
    setResetMode(false);
    setMasterPassword("");
    setResetError(null);
    
    // Trigger setup mode if PIN is empty
    if (!s.pin || s.pin.trim() === "") {
      setIsSettingPin(true);
    } else {
      setIsSettingPin(false);
    }
  };

  const handlePinDigit = async (digit) => {
    if (saving || resetMode) return; 
    
    const next = pinEntry + digit;
    setPinEntry(next);
    
    if (next.length === 4) {
      if (isSettingPin) {
        setSaving(true);
        const { error } = await supabase
          .from("staff")
          .update({ pin: next })
          .eq("id", pinTarget.id);
          
        if (!error) {
          const updatedTarget = { ...pinTarget, pin: next };
          setCurrentUser(updatedTarget);
          setLockScreen(false);
          setView("pos");
        } else {
          alert("Failed to save PIN. Please check your connection.");
        }
        
        setSaving(false);
        setPinEntry("");
        setPinTarget(null);
        setIsSettingPin(false);
        
      } else {
        if (pinTarget && next === pinTarget.pin) {
          setCurrentUser(pinTarget);
          setLockScreen(false);
          setPinEntry("");
          setPinTarget(null);
          setPinError(false);
          setView("pos");
        } else {
          setPinError(true);
          setTimeout(() => {
            setPinEntry("");
            setPinError(false);
          }, 700);
        }
      }
    }
  };

  // --- THE SECURITY OVERRIDE ---
  const confirmPinReset = async (e) => {
    e.preventDefault();
    if (!masterPassword) return;

    setResetLoading(true);
    setResetError(null);

    // 1. Fetch the email of the currently authenticated store owner
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    
    if (userErr || !user) {
      setResetError("Authentication error. Please refresh the app.");
      setResetLoading(false);
      return;
    }

    // 2. Verify their identity by testing the master password against Supabase Auth
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: masterPassword
    });

    if (signInErr) {
      setResetError("Incorrect master account password.");
      setResetLoading(false);
      return;
    }

    // 3. Authorisation granted. Wipe the forgotten PIN from the database.
    const { error: updateErr } = await supabase
      .from("staff")
      .update({ pin: "" })
      .eq("id", pinTarget.id);

    if (updateErr) {
      setResetError("Database error. Could not clear PIN.");
      setResetLoading(false);
      return;
    }

    // 4. Drop them cleanly into the setup flow
    setMasterPassword("");
    setResetMode(false);
    setIsSettingPin(true);
    setPinEntry("");
    setResetLoading(false);
  };

  return (
    <div className="lock-screen">
      <div className="lock-logo">
        <div className="lock-logo-icon"><Zap size={26} color="white" strokeWidth={2.5} /></div>
        <span className="lock-logo-text">{storeName}</span>
      </div>
      <p className="lock-tagline">{pinTarget ? `Profile: ${pinTarget.name}` : "Select your profile to sign in"}</p>

      {!pinTarget ? (
        <div className="lock-staff-grid">
          {staff.filter(s => s.active).map(s => (
            <div key={s.id} className="lock-staff-btn" onClick={() => handleSelectStaff(s)}>
              <div className={`lock-av ${s.role}`}>{s.avatar}</div>
              <div className="lock-staff-name">{s.name}</div>
              <div className="lock-staff-role">{ROLE_LABELS[s.role]}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="pin-panel">
          <div className={`lock-av ${pinTarget.role}`} style={{ margin: "0 auto 14px" }}>
            {pinTarget.avatar}
          </div>
          <div className="pin-title">{pinTarget.name}</div>
          
          {resetMode ? (
            /* --- RESET PASSWORD OVERRIDE UI --- */
            <div style={{ marginTop: '20px', width: '100%', maxWidth: '240px', margin: '20px auto 0' }}>
              <div style={{ fontSize: '13px', color: '#f87171', marginBottom: '16px', lineHeight: '1.4' }}>
                Authorisation Required. Enter your Master Account Password to reset this PIN.
              </div>
              <form onSubmit={confirmPinReset}>
                <input 
                  type="password" 
                  placeholder="Master Password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  disabled={resetLoading}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(108, 99, 255, 0.3)', background: '#12111e', color: 'white', marginBottom: '12px', outline: 'none' }}
                  autoFocus
                />
                {resetError && <div style={{ color: '#f87171', fontSize: '12px', marginBottom: '12px' }}>{resetError}</div>}
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    onClick={() => { setResetMode(false); setMasterPassword(""); setResetError(null); }}
                    disabled={resetLoading}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#2a283e', color: 'white', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={resetLoading || !masterPassword}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', opacity: (!masterPassword || resetLoading) ? 0.5 : 1 }}
                  >
                    {resetLoading ? "Verifying..." : "Reset"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* --- STANDARD PIN PAD UI --- */
            <>
              <div className="pin-subtitle" style={{ color: isSettingPin ? "var(--text)" : "inherit", fontWeight: isSettingPin ? 600 : 400 }}>
                {isSettingPin ? "New Profile: Create your 4-digit PIN" : `${ROLE_LABELS[pinTarget.role]} — Enter your 4-digit PIN`}
              </div>
              
              <div className={`pin-dots${pinError ? " shake" : ""}`}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`pin-dot${pinEntry.length > i ? pinError ? " error" : " filled" : ""}`} />
                ))}
              </div>
              
              <div className="pin-pad">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                  <button key={n} className="pin-key" onClick={() => handlePinDigit(String(n))} disabled={saving}>{n}</button>
                ))}
                <button className="pin-key del" onClick={() => setPinEntry(e => e.slice(0, -1))} disabled={saving}>⌫</button>
                <button className="pin-key zero" onClick={() => handlePinDigit("0")} disabled={saving}>0</button>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '240px', margin: '0 auto', marginTop: '16px' }}>
                <button className="pin-back-btn" style={{ margin: 0 }} onClick={() => { setPinTarget(null); setPinEntry(""); setIsSettingPin(false); }} disabled={saving}>
                  ← Back
                </button>
                
                {!isSettingPin && (
                  <button 
                    onClick={() => setResetMode(true)}
                    style={{ background: 'none', border: 'none', color: '#7a7a9a', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Forgot PIN?
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
