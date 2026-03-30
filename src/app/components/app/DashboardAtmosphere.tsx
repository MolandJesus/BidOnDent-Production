/**
 * DashboardAtmosphere — royal blue deep ocean background layers.
 * Pure visual component. No state.
 */
export default function DashboardAtmosphere({ isLightAppearance }: { isLightAppearance: boolean }) {
  return (
    <>
      {/* ── Base layer: royal blue deep ocean atmosphere ── */}
      <div
        className="fixed inset-0 z-0"
        id="dashboard-map-bg"
        style={{
          background: isLightAppearance
            ? "linear-gradient(180deg, rgba(244, 247, 253, 0.98) 0%, rgba(233, 240, 250, 0.96) 48%, rgba(225, 235, 247, 0.98) 100%)"
            : "radial-gradient(130% 90% at 28% 8%, rgba(10, 22, 58, 0.99) 0%, rgba(6, 14, 36, 0.99) 58%, #040a18 100%)",
        }}
      />
      {/* ── Atmospheric orb layer 1: primary top-left royal blue bloom ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 55% 45% at 15% 8%, rgba(59, 130, 246, 0.18) 0%, transparent 68%)"
            : "radial-gradient(ellipse 55% 45% at 15% 8%, rgba(37, 99, 235, 0.28) 0%, transparent 65%)",
        }}
      />
      {/* ── Atmospheric orb layer 2: right-side cyan/indigo bloom ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 45% 38% at 88% 18%, rgba(99, 102, 241, 0.12) 0%, transparent 62%)"
            : "radial-gradient(ellipse 45% 38% at 88% 18%, rgba(99, 102, 241, 0.20) 0%, transparent 60%)",
        }}
      />
      {/* ── Atmospheric orb layer 3: bottom-left deep teal glow ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 40% 32% at 8% 82%, rgba(14, 165, 233, 0.10) 0%, transparent 62%)"
            : "radial-gradient(ellipse 40% 32% at 8% 82%, rgba(14, 165, 233, 0.14) 0%, transparent 60%)",
        }}
      />
      {/* ── Atmospheric orb layer 4: center-right subtle violet bloom ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 38% 30% at 82% 72%, rgba(139, 92, 246, 0.06) 0%, transparent 60%)"
            : "radial-gradient(ellipse 38% 30% at 82% 72%, rgba(139, 92, 246, 0.10) 0%, transparent 58%)",
        }}
      />
      {/* ── Atmospheric orb layer 5: mid-screen floating blue halo ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 28% 20% at 52% 42%, rgba(59, 130, 246, 0.06) 0%, transparent 58%)"
            : "radial-gradient(ellipse 28% 20% at 52% 42%, rgba(59, 130, 246, 0.10) 0%, transparent 55%)",
        }}
      />
      {/* ── Fine dot-grid texture for topographic depth ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(147, 197, 253, 0.055) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: isLightAppearance ? 0.35 : 1,
        }}
      />
    </>
  );
}
