import React, { useState } from "react";
import { loginUser } from "../api";

export default function Login({ onSwitchToSignup, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      onLoginSuccess?.(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-panel">
      <h1>Hello Again!</h1>

      <p className="form-subtitle">
        Do you have an account? Login here..
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="input-wrap">
          <input
            type="email"
            placeholder="E Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="input-wrap has-icon">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="eye-toggle"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>

        {error && <div className="form-message error">{error}</div>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <p className="switch-line">
        Don't you have an account?
        <button type="button" onClick={onSwitchToSignup}>
          Create an account
        </button>
      </p>
    </div>
  );
}
