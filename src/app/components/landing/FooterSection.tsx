import { Mail, MapPin } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import BrandLogo from "../app/BrandLogo";

interface FooterSectionProps {
  primaryColor: string;
  secondaryColor: string;
  isLightAppearance?: boolean;
}

export default function FooterSection({
  primaryColor,
  secondaryColor,
  isLightAppearance,
}: FooterSectionProps) {
  const { ref: footerRef, isVisible } = useScrollAnimation(0.1);

  return (
    <footer
      className={`pt-12 sm:pt-16 pb-10 sm:pb-12 relative overflow-hidden ${isLightAppearance ? "text-slate-500" : "text-blue-100/70"}`}
      style={{
        background: isLightAppearance
          ? "linear-gradient(180deg, #eef1f7 0%, #e8ecf3 50%, #e4e8f0 100%)"
          : "linear-gradient(180deg, #061428 0%, #040e1e 100%)",
      }}
      ref={footerRef}
    >
      {/* Top edge fade — light keeps amber thread; dark gets tri-stop with
          gold whisper at center so the footer has a continuous gold thread
          tying to the rest of the page. */}
      <div
        className="absolute -top-px left-0 right-0 h-px"
        style={{
          background: isLightAppearance
            ? "linear-gradient(to right, transparent, rgba(252, 211, 77, 0.25) 50%, transparent)"
            : "linear-gradient(to right, transparent, rgba(96,165,250,0.25) 22%, rgba(220,150,60,0.22) 50%, rgba(96,165,250,0.25) 78%, transparent)",
        }}
      />
      {/* Atmospheric depth — wrapped in bloom (gentler bumps; footer is the page's farewell, not a feature moment) */}
      <div className={`bd-bloom-atmosphere ${isVisible ? "is-visible" : "is-hidden"}`}>
        {isLightAppearance ? (
          <>
            {/* Fine dot texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(200,170,110,0.04)_1px,transparent_1px)] [background-size:18px_18px] opacity-70" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_30%_80%,rgba(200,165,100,0.12),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_45%_at_70%_20%,rgba(210,180,130,0.10),transparent_55%)]" />
            <div className="absolute bottom-0 left-[15%] w-56 h-56 bg-amber-100/[0.18] rounded-full blur-[110px]" />
            <div className="absolute top-0 right-[20%] w-80 h-80 bg-sky-300/[0.16] rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-[10%] w-64 h-64 bg-blue-300/[0.13] rounded-full blur-[100px]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:18px_18px] opacity-70" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_30%_80%,rgba(59,130,246,0.14),transparent_55%)]" />
            <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-blue-500/[0.12] rounded-full blur-[100px]" />
            <div className="absolute top-10 left-1/4 w-56 h-56 bg-indigo-400/[0.10] rounded-full blur-[90px]" />
            {/* Subtle gold lamp accent — gentle warm light source so the
                page's farewell still carries the gold thread without
                competing with the CTA card glow above. */}
            <div className="absolute top-0 right-[12%] w-64 h-64 rounded-full blur-[120px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(220,150,60,0.12), transparent 65%)" }} />
          </>
        )}
      </div>
      <div className="container mx-auto px-4 max-w-7xl relative">
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="col-span-2 md:col-span-1">
            <div className="mb-5 inline-flex">
              <BrandLogo
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                tone={isLightAppearance ? "light" : "dark"}
                size="footer"
              />
            </div>
            <p
              className={`text-sm leading-relaxed mb-4 ${isLightAppearance ? "text-slate-500" : "text-blue-100/55"}`}
            >
              The smart way to handle auto repairs. Connect with trusted shops, compare bids, and
              get your car fixed with confidence.
            </p>

            {/* Contact info */}
            <div
              className={`space-y-2 text-sm ${isLightAppearance ? "text-slate-500" : "text-blue-200/60"}`}
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" style={{ color: primaryColor }} />
                <span>bidondent@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
                <span>New York Service Region</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className={`font-bold mb-4 ${isLightAppearance ? "text-slate-800" : "text-white"}`}>
              For Customers
            </h4>
            <ul
              className={`space-y-2 ${isLightAppearance ? "text-slate-500" : "text-blue-200/60"}`}
            >
              <li>
                <a
                  href="#how-it-works"
                  className={`transition-colors hover:translate-x-1 inline-block duration-200 ${isLightAppearance ? "hover:text-blue-600" : "hover:text-blue-100"}`}
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className={`transition-colors hover:translate-x-1 inline-block duration-200 ${isLightAppearance ? "hover:text-blue-600" : "hover:text-blue-100"}`}
                >
                  Submit Report
                </a>
              </li>
              <li>
                <a
                  href="#coverage"
                  className={`transition-colors hover:translate-x-1 inline-block duration-200 ${isLightAppearance ? "hover:text-blue-600" : "hover:text-blue-100"}`}
                >
                  Coverage
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4
              className={`font-bold mb-4 ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
            >
              For Businesses
            </h4>
            <ul
              className={`space-y-2 ${isLightAppearance ? "text-slate-500" : "text-blue-200/60"}`}
            >
              <li>
                <a
                  href="#business-inquiry"
                  className={`transition-colors hover:translate-x-1 inline-block duration-200 ${isLightAppearance ? "hover:text-blue-600" : "hover:text-blue-100"}`}
                >
                  Shop Signup
                </a>
              </li>
              <li>
                <a
                  href="#/insurer-partnership"
                  className={`transition-colors hover:translate-x-1 inline-block duration-200 ${isLightAppearance ? "hover:text-blue-600" : "hover:text-blue-100"}`}
                >
                  Insurer Partnership
                </a>
              </li>
              <li>
                <a
                  href="#who-we-serve"
                  className={`transition-colors hover:translate-x-1 inline-block duration-200 ${isLightAppearance ? "hover:text-blue-600" : "hover:text-blue-100"}`}
                >
                  Free for Customers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4
              className={`font-bold mb-4 ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
            >
              Company
            </h4>
            <ul
              className={`space-y-2 ${isLightAppearance ? "text-slate-500" : "text-blue-200/60"}`}
            >
              <li>
                <a
                  href="#/about"
                  className={`transition-colors hover:translate-x-1 inline-block duration-200 ${isLightAppearance ? "hover:text-blue-600" : "hover:text-blue-100"}`}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="mailto:bidondent@gmail.com"
                  className={`transition-colors hover:translate-x-1 inline-block duration-200 ${isLightAppearance ? "hover:text-blue-600" : "hover:text-blue-100"}`}
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#/privacy-policy"
                  className={`transition-colors hover:translate-x-1 inline-block duration-200 ${isLightAppearance ? "hover:text-blue-600" : "hover:text-blue-100"}`}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#/terms-of-service"
                  className={`transition-colors hover:translate-x-1 inline-block duration-200 ${isLightAppearance ? "hover:text-blue-600" : "hover:text-blue-100"}`}
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div
          className={`border-t pt-8 flex flex-col md:flex-row items-center justify-between transition-all duration-700 ${isLightAppearance ? "border-[rgba(200,180,150,0.25)]" : "border-[#1c2e47]"} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "0.3s" }}
        >
          <p className={isLightAppearance ? "text-slate-400" : "text-blue-200/40"}>
            &copy; 2026 BidOnDent. All rights reserved.
          </p>

          {/* Availability badge */}
          <div
            className={`flex items-center gap-1.5 mt-4 md:mt-0 text-xs font-medium px-3 py-1.5 rounded-full border ${
              isLightAppearance
                ? "border-[rgba(200,180,150,0.22)] bg-[rgba(255,251,245,0.3)] text-slate-400"
                : "border-blue-400/15 bg-blue-500/[0.08] text-blue-300/50"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Now serving New York
          </div>
        </div>
      </div>
    </footer>
  );
}
