import React, { useState } from "react";
import { registerUser } from "../api";

export default function Signup({ onSwitchToLogin, onSignupSuccess }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({ fullName, email, password });
      setSuccess("Account created! You can now sign in.");
      onSignupSuccess?.(res.data);
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
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
          />
        </div>

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
            autoComplete="new-password"
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
        {success && <div className="form-message success">{success}</div>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Creating..." : "Create an Account"}
        </button>
      </form>

      <p className="switch-line">
        Do you have an account?
        <button type="button" onClick={onSwitchToLogin}>
          Login
        </button>
      </p>
    </div>
  );
}
