import { useState, useRef } from "react";
import { useAuth } from "../hooks/useAuth";

export default function LoginScreen() {
  const { signIn, signUp, recoveryMode, updatePassword } = useAuth();
  
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]       = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading]   = useState(false);
  
  const emailRef    = useRef();
  const passwordRef = useRef();
  const confirmRef  = useRef();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const emailVal    = emailRef.current?.value    || email;
    const passwordVal = passwordRef.current?.value || password;

    if (isSignUpMode) {
      const confVal = confirmRef.current?.value || confirmPassword;
      if (passwordVal !== confVal) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (passwordVal.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }

      const { data, error: signUpError } = await signUp(emailVal, passwordVal);
      
      if (signUpError) {
        setError(signUpError.message);
      } else if (data?.user && data.user.identities && data.user.identities.length === 0) {
        setError("This email is already registered. Please sign in.");
      } else {
        // Success state for email confirmation
        setSuccessMsg("Registration successful! Please check your email inbox to verify your account before logging in.");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setIsSignUpMode(false); // Flip them back to login mode so they are ready
      }
    } else {
      const { error: signInError } = await signIn(emailVal, passwordVal);
      if (signInError) {
        setError(signInError.message === "Invalid login credentials" 
          ? "Incorrect email or password. Please try again." 
          : signInError.message);
      }
    }
    setLoading(false);
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    const passVal = passwordRef.current?.value || password;
    const confVal = confirmRef.current?.value  || confirmPassword;

    if (passVal.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (passVal !== confVal) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await updatePassword(passVal);

    if (updateError) {
      setError(updateError.message);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ls-login-root {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f0e17;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .ls-login-card {
          background: #1a1825;
          border: 1px solid rgba(108, 99, 255, 0.25);
          border-radius: 20px;
          padding: 48px 44px 44px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
        }

        .ls-login-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
        }

        .ls-login-logo-icon {
          width: 38px;
          height: 38px;
          background: #6c63ff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ls-login-logo-text {
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
        }

        .ls-login-logo-text span { color: #6c63ff; }

        .ls-login-heading {
          font-size: 26px;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 6px;
        }

        .ls-login-sub {
          font-size: 14px;
          color: #7a7a9a;
          margin-bottom: 32px;
        }

        .ls-login-field { margin-bottom: 16px; }

        .ls-login-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #9898b8;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ls-login-input {
          width: 100%;
          background: #12111e;
          border: 1px solid rgba(108, 99, 255, 0.2);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 15px;
          color: #fff;
          outline: none;
          transition: border-color 0.18s;
        }

        .ls-login-input:focus { border-color: #6c63ff; }

        .ls-login-error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 13.5px;
          color: #f87171;
          margin-bottom: 16px;
        }

        .ls-login-success {
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 10px;
          padding: 14px;
          font-size: 13.5px;
          color: #4ade80;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .ls-login-btn {
          width: 100%;
          background: #6c63ff;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 13px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 6px;
          transition: background 0.15s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .ls-login-btn:hover:not(:disabled) { background: #5a52e0; }
        .ls-login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .ls-login-footer {
          margin-top: 28px;
          text-align: center;
          font-size: 13px;
          color: #9898b8;
        }
        
        .ls-login-link {
          color: #6c63ff;
          background: none;
          border: none;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          margin-left: 6px;
        }
        .ls-login-link:hover { text-decoration: underline; }
      `}</style>

      <div className="ls-login-root">
        <div className="ls-login-card">

          <div className="ls-login-logo">
            <div className="ls-login-logo-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white" />
                <rect x="11" y="2" width="7" height="7" rx="1.5" fill="rgba(255,255,255,0.6)" />
                <rect x="2" y="11" width="7" height="7" rx="1.5" fill="rgba(255,255,255,0.6)" />
                <rect x="11" y="11" width="7" height="7" rx="1.5" fill="rgba(255,255,255,0.3)" />
              </svg>
            </div>
            <span className="ls-login-logo-text">Light<span>Square</span></span>
          </div>

          {recoveryMode ? (
            <>
              <p className="ls-login-heading">Secure Your Account</p>
              <p className="ls-login-sub">Please set a new password to continue.</p>

              <form onSubmit={handleSetPassword} noValidate>
                <div className="ls-login-field">
                  <label className="ls-login-label">New Password</label>
                  <input ref={passwordRef} className="ls-login-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />
                </div>
                <div className="ls-login-field">
                  <label className="ls-login-label">Confirm Password</label>
                  <input ref={confirmRef} className="ls-login-input" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required disabled={loading} />
                </div>
                {error && <div className="ls-login-error">{error}</div>}
                <button className="ls-login-btn" type="submit" disabled={loading}>{loading ? "Updating..." : "Save Password & Enter"}</button>
              </form>
            </>
          ) : (
            <>
              <p className="ls-login-heading">{isSignUpMode ? "Create an Account" : "Welcome back"}</p>
              <p className="ls-login-sub">{isSignUpMode ? "Start your 14-day free trial today" : "Sign in to access your store dashboard"}</p>

              {successMsg && <div className="ls-login-success">{successMsg}</div>}

              <form onSubmit={handleAuth} noValidate>
                <div className="ls-login-field">
                  <label className="ls-login-label">Email</label>
                  <input ref={emailRef} className="ls-login-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required disabled={loading} />
                </div>

                <div className="ls-login-field">
                  <label className="ls-login-label">Password</label>
                  <input ref={passwordRef} className="ls-login-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete={isSignUpMode ? "new-password" : "current-password"} required disabled={loading} />
                </div>

                {isSignUpMode && (
                  <div className="ls-login-field">
                    <label className="ls-login-label">Confirm Password</label>
                    <input ref={confirmRef} className="ls-login-input" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" required disabled={loading} />
                  </div>
                )}

                {error && <div className="ls-login-error">{error}</div>}

                <button className="ls-login-btn" type="submit" disabled={loading}>
                  {loading ? "Processing…" : (isSignUpMode ? "Start Free Trial" : "Sign In")}
                </button>
              </form>

              <div className="ls-login-footer">
                {isSignUpMode ? "Already have an account?" : "Don't have an account?"}
                <button 
                  className="ls-login-link" 
                  onClick={() => {
                    setIsSignUpMode(!isSignUpMode);
                    setError(null);
                    setSuccessMsg(null);
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  disabled={loading}
                >
                  {isSignUpMode ? "Log In" : "Sign Up"}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
