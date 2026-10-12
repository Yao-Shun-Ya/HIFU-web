import { ImageResponse } from "next/og";

export const alt = "AM-HIFU nomogram — 486-case single-centre cohort";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STATS = [
  { v: "0.903", k: "AUC · training" },
  { v: "0.923", k: "AUC · internal validation" },
  { v: "486", k: "single-centre cases" },
  { v: "6", k: "pre-treatment predictors" },
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #06080f 0%, #0b1220 55%, #101a2e 100%)",
          color: "#eaf0fb",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg, #2f6df6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 99, background: "#ff8a5c" }} />
          </div>
          <div style={{ fontSize: 22, letterSpacing: 2, opacity: 0.72, textTransform: "uppercase" }}>
            AM · US-guided HIFU · nomogram
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 68, lineHeight: 1.12, fontWeight: 700, letterSpacing: -1 }}>
            Predicting HIFU ablation
          </div>
          <div
            style={{
              fontSize: 68,
              lineHeight: 1.12,
              fontWeight: 700,
              letterSpacing: -1,
              backgroundImage: "linear-gradient(90deg, #4c8dff, #a978ff)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            difficulty from MRI + clinical features
          </div>
          <div style={{ fontSize: 26, opacity: 0.66 }}>
            6 pre-treatment variables → total points → probability of high difficulty
          </div>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          {STATS.map((s) => (
            <div
              key={s.k}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "20px 22px",
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <div style={{ fontSize: 42, fontWeight: 700 }}>{s.v}</div>
              <div style={{ fontSize: 19, opacity: 0.6 }}>{s.k}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, headers: { "Cache-Control": "public, max-age=3600, immutable" } },
  );
}
