import React from "react";
import { Link, useLocation } from "react-router-dom";

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(10,10,15,0.85)",
    backdropFilter: "blur(16px)",
    borderBottom: "1px solid var(--border)",
    padding: "0 32px",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontFamily: "Syne, sans-serif",
    fontWeight: 800,
    fontSize: "18px",
    color: "var(--text)",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  link: {
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    fontFamily: "Syne, sans-serif",
    textDecoration: "none",
    transition: "all 0.2s",
  },
};

function LogoIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="17" fill="none" stroke="#7C6AF7" strokeWidth="2"/>
      <circle cx="18" cy="18" r="13" fill="none" stroke="#7C6AF7" strokeWidth="0.7" strokeDasharray="3 2.5"/>
      <circle cx="18" cy="18" r="10" fill="#7C6AF7"/>
      <text
        x="18"
        y="22"
        textAnchor="middle"
        fontFamily="Syne, sans-serif"
        fontWeight="700"
        fontSize="10"
        fill="white"
      >IA</text>
    </svg>
  );
}

export default function Navbar() {
  const location = useLocation();

  const linkStyle = (path) => ({
    ...styles.link,
    color: location.pathname === path ? "var(--accent2)" : "var(--text2)",
    background: location.pathname === path ? "var(--accent-glow)" : "transparent",
  });

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        <LogoIcon />
        <span>
          Interview<span style={{ color: "#7C6AF7" }}>AI</span>
        </span>
      </Link>
      <div style={styles.links}>
        <Link to="/" style={linkStyle("/")}>Home</Link>
        <Link to="/dashboard" style={linkStyle("/dashboard")}>Dashboard</Link>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer style={{
      textAlign: "center",
      padding: "24px",
      marginTop: "60px",
      borderTop: "1px solid var(--border)",
      color: "var(--text3)",
      fontSize: "14px",
      fontFamily: "DM Sans, sans-serif",
    }}>
      Made with <span style={{ color: "#e25555", fontSize: "16px" }}>♥</span> by{" "}
      <span style={{ color: "var(--accent2)", fontFamily: "Syne, sans-serif", fontWeight: 700 }}>Fazal Ali</span>
    </footer>
  );
}