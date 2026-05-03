/**
 * DashboardAtmosphere — royal blue deep ocean background layers.
 * Pure visual component. No state.
 */
export default function DashboardAtmosphere({ isLightAppearance }: { isLightAppearance: boolean }) {
  return (
    <>
      {/* ── Base layer: soft blue atmosphere (light) / royal blue deep ocean (dark) ── */}
      <div
        className="fixed inset-0 z-0"
        id="dashboard-map-bg"
        style={{
          background: isLightAppearance
            ? "linear-gradient(160deg, #c2d4ea 0%, #b8cce6 40%, #aec4e0 72%, #a6bdd9 100%)"
            : "radial-gradient(130% 90% at 28% 8%, rgba(10, 22, 58, 0.99) 0%, rgba(6, 14, 36, 0.99) 58%, #040a18 100%)",
        }}
      />
      {/* ── Light mode: warm luminous bloom at top — gives header something to blur through ── */}
      {isLightAppearance && (
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 90% 38% at 50% 0%, rgba(255, 224, 160, 0.28) 0%, rgba(255, 235, 190, 0.14) 40%, transparent 70%)",
          }}
        />
      )}
      {/* ── Light mode: top ribbon texture so header blur has refractive depth ── */}
      {isLightAppearance && (
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.20) 0%, rgba(226, 236, 252, 0.14) 8%, rgba(196, 214, 242, 0.08) 15%, transparent 30%), radial-gradient(ellipse 74% 18% at 50% 6%, rgba(248, 252, 255, 0.34) 0%, rgba(221, 235, 255, 0.18) 46%, transparent 78%)",
          }}
        />
      )}
      {/* ── Atmospheric orb layer 1: soft blue bloom (light) / royal blue bloom (dark) ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 55% 45% at 15% 8%, rgba(59, 130, 246, 0.12) 0%, transparent 68%)"
            : "radial-gradient(ellipse 55% 45% at 15% 8%, rgba(37, 99, 235, 0.28) 0%, transparent 65%)",
        }}
      />
      {/* ── Atmospheric orb layer 2: light indigo bloom (light) / cyan/indigo bloom (dark) ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 45% 38% at 88% 18%, rgba(99, 102, 241, 0.06) 0%, transparent 62%)"
            : "radial-gradient(ellipse 45% 38% at 88% 18%, rgba(99, 102, 241, 0.20) 0%, transparent 60%)",
        }}
      />
      {/* ── Atmospheric orb layer 3: cool blue glow (light) / deep teal glow (dark) ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 40% 32% at 8% 82%, rgba(37, 99, 235, 0.06) 0%, transparent 62%)"
            : "radial-gradient(ellipse 40% 32% at 8% 82%, rgba(14, 165, 233, 0.14) 0%, transparent 60%)",
        }}
      />
      {/* ── Atmospheric orb layer 4: pale sky bloom (light) / violet bloom (dark) ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 38% 30% at 82% 72%, rgba(147, 197, 253, 0.08) 0%, transparent 60%)"
            : "radial-gradient(ellipse 38% 30% at 82% 72%, rgba(139, 92, 246, 0.10) 0%, transparent 58%)",
        }}
      />
      {/* ── Atmospheric orb layer 5: subtle halo (light) / floating blue halo (dark) ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 28% 20% at 52% 42%, rgba(96, 165, 250, 0.05) 0%, transparent 58%)"
            : "radial-gradient(ellipse 28% 20% at 52% 42%, rgba(59, 130, 246, 0.10) 0%, transparent 55%)",
        }}
      />
      {/* ── Fine dot-grid texture for topographic depth ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: isLightAppearance
            ? "radial-gradient(circle, rgba(59, 130, 246, 0.04) 1px, transparent 1px)"
            : "radial-gradient(circle, rgba(147, 197, 253, 0.055) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: isLightAppearance ? 0.3 : 1,
        }}
      />
      {/* ── D6: warm gold gutter wash, left edge — balances cool atmosphere
            so far-left rail of the page reads as lit, not empty. Subtle. ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? // Diffuse far-halo gutter wash — locked palette (KI-066).
              "radial-gradient(ellipse 32% 70% at 0% 38%, rgba(196, 130, 45, 0.10) 0%, transparent 62%)"
            : "radial-gradient(ellipse 32% 70% at 0% 38%, rgba(220, 150, 60, 0.16) 0%, transparent 60%)",
        }}
      />
      {/* ── D6: warm gold gutter wash, right edge — same as left but opposite
            corner, so the two rails balance and the page feels lamp-lit. ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? // Diffuse far-halo gutter wash — locked palette (KI-066).
              "radial-gradient(ellipse 30% 65% at 100% 62%, rgba(196, 130, 45, 0.09) 0%, transparent 62%)"
            : "radial-gradient(ellipse 30% 65% at 100% 62%, rgba(220, 150, 60, 0.14) 0%, transparent 60%)",
        }}
      />
      {/* ── D7: subtle warm bottom-center halo — completes the 4-corner
            ambient lamp lighting (top from atmosphere ribbon, sides from D6
            gutters, now bottom). Very low alpha — premium not loud. ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? // Diffuse far-halo bottom wash — locked palette (KI-066).
              "radial-gradient(ellipse 56% 22% at 50% 100%, rgba(196, 130, 45, 0.08) 0%, transparent 70%)"
            : "radial-gradient(ellipse 56% 22% at 50% 100%, rgba(220, 150, 60, 0.12) 0%, transparent 68%)",
        }}
      />
    </>
  );
}
