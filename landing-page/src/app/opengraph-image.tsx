import { ImageResponse } from "next/og";

export const alt = "Remind: an AI that calls you at the time you set";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(160deg, #a9c8ea 0%, #f3dcc6 55%, #f7c9a0 100%)",
          color: "#151515",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 22,
              background: "linear-gradient(135deg, #1b2140, #3a2d4a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 999,
                background: "#f4e7d4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 25,
                  borderRadius: 13,
                  background: "#121212",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <div style={{ width: 10, height: 12, borderRadius: 999, background: "#ffbe6e", boxShadow: "0 0 10px #ff9a3c" }} />
                <div style={{ width: 10, height: 12, borderRadius: 999, background: "#ffbe6e", boxShadow: "0 0 10px #ff9a3c" }} />
              </div>
            </div>
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>remind</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 960 }}>
            A reminder you can&apos;t simply swipe away.
          </div>
          <div style={{ fontSize: 32, color: "#3f3f46", maxWidth: 920 }}>
            Your AI agent phones you at the time you set, listens, and marks it done or calls back later.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, fontSize: 24, color: "#27272a" }}>
          {["Real phone calls", "Talk back by voice", "English + Hinglish", "remind.bpss.in"].map((t) => (
            <div key={t} style={{ display: "flex", padding: "10px 20px", borderRadius: 999, background: "rgba(255,255,255,0.65)" }}>
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
