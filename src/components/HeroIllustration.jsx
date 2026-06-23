import React from "react";

// A simple resort-themed illustration used as a placeholder for the photo
// panel. Swap this component out for a real <img src="..." /> of your own
// photo whenever you're ready - see the README for instructions.
export default function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 400 520"
      preserveAspectRatio="xMidYMid slice"
      className="hero-illustration"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#274472" />
          <stop offset="55%" stopColor="#6c91bf" />
          <stop offset="100%" stopColor="#e8c39e" />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f6f8b" />
          <stop offset="100%" stopColor="#0e3c4f" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="400" height="520" fill="url(#sky)" />
      <circle cx="320" cy="90" r="34" fill="#fce8c9" opacity="0.9" />

      {/* buildings */}
      <rect x="0" y="300" width="400" height="60" fill="#caa06b" opacity="0.85" />
      <rect x="20" y="280" width="50" height="40" fill="#b98a55" />
      <rect x="90" y="270" width="50" height="50" fill="#c79768" />
      <rect x="250" y="275" width="55" height="45" fill="#c79768" />
      <rect x="320" y="285" width="60" height="35" fill="#b98a55" />

      {/* pool */}
      <rect x="0" y="360" width="400" height="160" fill="url(#water)" />
      <rect x="0" y="360" width="400" height="10" fill="#bfe3ee" opacity="0.6" />

      {/* loungers */}
      <rect x="40" y="430" width="70" height="10" rx="4" fill="#3a2a1a" opacity="0.6" />
      <rect x="140" y="445" width="70" height="10" rx="4" fill="#3a2a1a" opacity="0.6" />
      <rect x="240" y="430" width="70" height="10" rx="4" fill="#3a2a1a" opacity="0.6" />

      {/* palm trees */}
      {[60, 150, 230, 320].map((x, i) => (
        <g key={i} transform={`translate(${x},${60 + (i % 2) * 20})`}>
          <rect x="-4" y="0" width="8" height="240" fill="#2c1f14" />
          <g fill="#1f3d1f">
            <ellipse cx="-30" cy="-10" rx="40" ry="14" transform="rotate(-25 -30 -10)" />
            <ellipse cx="30" cy="-10" rx="40" ry="14" transform="rotate(25 30 -10)" />
            <ellipse cx="-20" cy="10" rx="38" ry="13" transform="rotate(-50 -20 10)" />
            <ellipse cx="20" cy="10" rx="38" ry="13" transform="rotate(50 20 10)" />
            <ellipse cx="0" cy="-25" rx="14" ry="32" />
          </g>
        </g>
      ))}
    </svg>
  );
}
