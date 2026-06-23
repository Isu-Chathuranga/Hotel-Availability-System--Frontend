import React, { useState } from "react";
import "./components/AuthCard.css";
import Login from "./components/Login";
import Signup from "./components/Signup";
import HeroIllustration from "./components/HeroIllustration";

export default function App() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [user, setUser] = useState(null);

  if (user) {
    return (
      <div className="page">
        <div className="auth-card" style={{ alignItems: "center", justifyContent: "center" }}>
          <div className="form-panel" style={{ textAlign: "center" }}>
            <h1>Welcome, {user.fullName || user.email}!</h1>
            <p className="form-subtitle">You're signed in.</p>
            <button
              className="submit-btn"
              style={{ marginTop: 24 }}
              onClick={() => setUser(null)}
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="auth-card">
        {mode === "login" ? (
          <Login
            onSwitchToSignup={() => setMode("signup")}
            onLoginSuccess={(data) => setUser(data)}
          />
        ) : (
          <Signup
            onSwitchToLogin={() => setMode("login")}
            onSignupSuccess={() => setMode("login")}
          />
        )}

        <div className="image-panel">
          {/* Swap HeroIllustration for <img src="/your-photo.jpg" alt="" /> any time */}
          <HeroIllustration />
        </div>
      </div>
    </div>
  );
}
