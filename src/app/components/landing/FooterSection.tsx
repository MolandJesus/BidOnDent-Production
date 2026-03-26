import { Car, Mail, MapPin } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

interface FooterSectionProps {
  primaryColor: string;
  secondaryColor: string;
}

export default function FooterSection({ primaryColor, secondaryColor }: FooterSectionProps) {
  const { ref: footerRef, isVisible } = useScrollAnimation(0.1);

  return (
    <footer
      className="text-gray-300 pt-16 pb-12 relative"
      style={{ background: "linear-gradient(180deg, #0a1628 0%, #071120 100%)" }}
      ref={footerRef}
    >
      {/* Top edge fade for smooth CTA transition */}
      <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
      <div className="container mx-auto px-4 max-w-7xl">
        <div
          className={`grid md:grid-cols-4 gap-8 mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-full bg-white/[0.07] border border-white/[0.1] backdrop-blur-sm mb-4 inline-flex">
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
                <span className="text-gray-300">Dent</span>
              </h3>
            </div>
            <p className="text-gray-400 mb-4">
              The smart way to handle auto repairs. Connect with trusted shops, compare bids, and
              get your car fixed with confidence.
            </p>

            {/* Contact info */}
            <div className="space-y-2 text-sm text-gray-400">
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
            <h4 className="font-bold mb-4 text-white">For Customers</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#business-inquiry"
                  className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                >
                  Submit Report
                </a>
              </li>
              <li>
                <a
                  href="#coverage"
                  className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                >
                  Coverage
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">For Businesses</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href="#business-inquiry"
                  className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                >
                  Shop Signup
                </a>
              </li>
              <li>
                <a
                  href="#/insurer-partnership"
                  className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                >
                  Insurer Partnership
                </a>
              </li>
              <li>
                <a
                  href="#who-we-serve"
                  className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                >
                  Free for Customers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a
                  href="#/about"
                  className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="mailto:bidondent@gmail.com"
                  className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#/privacy-policy"
                  className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#/terms-of-service"
                  className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div
          className={`border-t border-[#1c2e47] pt-8 flex flex-col md:flex-row items-center justify-between transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "0.3s" }}
        >
          <p className="text-gray-500">&copy; 2026 BidOnDent. All rights reserved.</p>

          {/* Social icons */}
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {["facebook", "twitter", "instagram", "linkedin"].map((social) => (
              <a
                key={social}
                href="#"
                className="w-10 h-10 rounded-full bg-[#132237] flex items-center justify-center text-gray-400 hover:bg-[#1c2e47] hover:text-white transition-all duration-300 hover:scale-110"
                aria-label={social}
              >
                {social === "facebook" && <span className="text-sm font-bold">f</span>}
                {social === "twitter" && <span className="text-sm font-bold">𝕏</span>}
                {social === "instagram" && <span className="text-sm font-bold">ig</span>}
                {social === "linkedin" && <span className="text-sm font-bold">in</span>}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
