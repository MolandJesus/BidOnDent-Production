import { Car, Mail, MapPin } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

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
      className="pt-12 sm:pt-16 pb-10 sm:pb-12 relative overflow-hidden text-blue-100/70"
      style={{
        background: isLightAppearance
          ? "linear-gradient(180deg, #0a1832 0%, #081430 50%, #060e24 100%)"
          : "linear-gradient(180deg, #061428 0%, #040e1e 100%)",
      }}
      ref={footerRef}
    >
      {/* Top edge fade */}
      <div
        className={`absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLightAppearance ? "via-blue-400/12" : "via-blue-400/10"} to-transparent`}
      />
      {/* Atmospheric depth */}
      {isLightAppearance ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_30%_80%,rgba(99,102,241,0.06),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_45%_at_70%_20%,rgba(59,130,246,0.04),transparent_55%)]" />
          <div className="absolute bottom-0 left-[15%] w-48 h-48 bg-blue-400/[0.04] rounded-full blur-[100px]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:18px_18px] opacity-25" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_30%_80%,rgba(59,130,246,0.06),transparent_55%)]" />
          <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-blue-500/[0.05] rounded-full blur-[100px]" />
          <div className="absolute top-10 left-1/4 w-56 h-56 bg-indigo-400/[0.04] rounded-full blur-[90px]" />
        </>
      )}
      <div className="container mx-auto px-4 max-w-7xl relative">
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-full backdrop-blur-sm mb-4 inline-flex bg-white/[0.07] border border-white/[0.1]">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                <Car className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold">
                <span
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Bid
                </span>
                <span style={{ color: "#70c0ee" }}>On</span>
                <span className="text-blue-100/80">Dent</span>
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-blue-100/55 mb-4">
              The smart way to handle auto repairs. Connect with trusted shops, compare bids, and
              get your car fixed with confidence.
            </p>

            {/* Contact info */}
            <div className="space-y-2 text-sm text-blue-200/60">
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
            <h4 className={`font-bold mb-4 ${isLightAppearance ? "text-slate-100" : "text-white"}`}>
              For Customers
            </h4>
            <ul className="space-y-2 text-blue-200/60">
              <li>
                <a
                  href="#how-it-works"
                  className="transition-colors hover:translate-x-1 inline-block duration-200 hover:text-blue-100"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#business-inquiry"
                  className="transition-colors hover:translate-x-1 inline-block duration-200 hover:text-blue-100"
                >
                  Submit Report
                </a>
              </li>
              <li>
                <a
                  href="#coverage"
                  className="transition-colors hover:translate-x-1 inline-block duration-200 hover:text-blue-100"
                >
                  Coverage
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-slate-100">For Businesses</h4>
            <ul className="space-y-2 text-blue-200/60">
              <li>
                <a
                  href="#business-inquiry"
                  className="transition-colors hover:translate-x-1 inline-block duration-200 hover:text-blue-100"
                >
                  Shop Signup
                </a>
              </li>
              <li>
                <a
                  href="#/insurer-partnership"
                  className="transition-colors hover:translate-x-1 inline-block duration-200 hover:text-blue-100"
                >
                  Insurer Partnership
                </a>
              </li>
              <li>
                <a
                  href="#who-we-serve"
                  className="transition-colors hover:translate-x-1 inline-block duration-200 hover:text-blue-100"
                >
                  Free for Customers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-slate-100">Company</h4>
            <ul className="space-y-2 text-blue-200/60">
              <li>
                <a
                  href="#/about"
                  className="transition-colors hover:translate-x-1 inline-block duration-200 hover:text-blue-100"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="mailto:bidondent@gmail.com"
                  className="transition-colors hover:translate-x-1 inline-block duration-200 hover:text-blue-100"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#/privacy-policy"
                  className="transition-colors hover:translate-x-1 inline-block duration-200 hover:text-blue-100"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#/terms-of-service"
                  className="transition-colors hover:translate-x-1 inline-block duration-200 hover:text-blue-100"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div
          className={`border-t pt-8 flex flex-col md:flex-row items-center justify-between transition-all duration-700 border-[#1c2e47] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "0.3s" }}
        >
          <p className="text-blue-200/40">&copy; 2026 BidOnDent. All rights reserved.</p>

          {/* Social icons */}
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {["facebook", "twitter", "instagram", "linkedin"].map((social) => (
              <a
                key={social}
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 bg-blue-900/30 border border-blue-400/15 text-blue-200/60 hover:bg-blue-800/40 hover:text-blue-100"
                aria-label={social}
              >
                {social === "facebook" && (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                )}
                {social === "twitter" && (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                )}
                {social === "instagram" && (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                )}
                {social === "linkedin" && (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
