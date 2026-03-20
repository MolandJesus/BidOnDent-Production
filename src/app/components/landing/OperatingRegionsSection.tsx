import { MapPin } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

const regions = [
  "New York County",
  "Queens County",
  "Bronx County",
  "Kings County",
  "Nassau County",
  "Westchester County",
];

export default function OperatingRegionsSection() {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);

  return (
    <section id="coverage" className="py-14 bg-slate-900 text-white" ref={sectionRef}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div
          className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="uppercase tracking-[0.12em] text-sm text-slate-300 mb-2">Current Coverage</p>
              <h3 className="text-3xl font-bold">Actively operating in New York service regions</h3>
              <p className="text-slate-300 mt-2 max-w-2xl">
                We are currently live in the counties below. Coverage map and radius search are
                planned for a future release.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
            {regions.map((region) => (
              <div
                key={region}
                className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-cyan-300" />
                <span>{region}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
