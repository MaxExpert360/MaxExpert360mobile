import React from "react";
import { DYNASTIE_INFO } from "../data/dynastieData";

export default function FacebookBanner() {
  const facebookUrl =
    DYNASTIE_INFO.facebookUrl || "https://www.facebook.com/profile.php?id=61591249901797";

  return (
    <section
      aria-label="Suivez-nous sur Facebook"
      style={{
        width: "100%",
        background: "linear-gradient(110deg, #103e31, #17634a)",
        color: "#ffffff",
        padding: "18px 16px",
        textAlign: "center",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2
          style={{
            fontSize: "clamp(20px, 3.2vw, 30px)",
            fontWeight: 800,
            lineHeight: 1.2,
            margin: "0 0 6px",
            letterSpacing: "-0.01em",
          }}
        >
          📸 SUIVEZ-NOUS SUR FACEBOOK !
        </h2>

        <p
          style={{
            fontSize: "clamp(14px, 2vw, 17px)",
            lineHeight: 1.35,
            margin: "0 0 6px",
            color: "#E2F4EB",
            fontWeight: 500,
          }}
        >
          Découvrez nos vraies photos, vidéos et réalisations AVANT / APRÈS !
        </p>

        <p
          style={{
            fontSize: "clamp(13px, 1.7vw, 15px)",
            lineHeight: 1.35,
            margin: "0 0 14px",
            color: "#C5E8D6",
          }}
        >
          Abonnez-vous à notre page pour ne rien manquer et rester toujours en contact avec nous !
        </p>

        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            backgroundColor: "#1877F2",
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 800,
            padding: "12px 22px",
            borderRadius: "10px",
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(24, 119, 242, 0.35)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#166fe5";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(24, 119, 242, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#1877F2";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(24, 119, 242, 0.35)";
          }}
        >
          {/* White Facebook Icon */}
          <svg
            style={{ width: "19px", height: "19px", fill: "#ffffff", flexShrink: 0 }}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>S’ABONNER SUR FACEBOOK ↗</span>
        </a>
      </div>
    </section>
  );
}
