import { Car, Wrench, Shield, CheckCircle2 } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

interface WhoWeServeSectionProps {
  primaryColor: string;
}

export default function WhoWeServeSection({ primaryColor }: WhoWeServeSectionProps) {
  const secondaryColor = "#00a0e9";
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);

  const cards = [
    {
      icon: Car,
      iconBg: primaryColor,
      title: "For Customers",
      borderHover: "hover:border-blue-300",
      gradientFrom: "from-blue-50",
      hoverBg: primaryColor,
      borderColor: `${primaryColor}30`,
      checkColor: primaryColor,
      items: [
        "Submit damage reports with photos",
        "Compare multiple repair quotes",
        "Choose the best shop for you",
        "Track repair progress",
      ],
    },
    {
      icon: Wrench,
      iconBg: secondaryColor,
      title: "For Repair Shops",
      borderHover: "hover:border-sky-300",
      gradientFrom: "from-sky-50",
      hoverBg: secondaryColor,
      borderColor: `${secondaryColor}30`,
      checkColor: secondaryColor,
      items: [
        "Access new customer leads",
        "Submit competitive bids",
        "Manage jobs efficiently",
        "Grow your business",
      ],
    },
    {
      icon: Shield,
      iconBg: "#1e3a5f",
      title: "For Insurers",
      borderHover: "hover:border-blue-300",
      gradientFrom: "from-blue-50",
      hoverBg: "#1e3a5f",
      borderColor: "#bfdbfe",
      checkColor: "#1e3a5f",
      items: [
        "Streamline claims processing",
        "Access network of shops",
        "Receive multiple claim estimates",
        "Pay less for collision repair",
      ],
    },
  ];

  return (
    <section
      id="who-we-serve"
      className="py-10 md:py-16"
      style={{ background: "linear-gradient(180deg, #edf3fa 0%, #f5f8fc 40%, #ffffff 100%)" }}
      ref={sectionRef}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section badge */}
        <div
          className={`text-center mb-6 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bd-glass-badge text-sm font-medium">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            Everyone Wins
          </span>
        </div>

        <div
          className={`text-center mb-6 md:mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.15s" }}
        >
          <h3 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">Who We Serve</h3>
          <p className="text-base sm:text-xl leading-relaxed text-slate-700">
            Solutions for everyone in the auto repair ecosystem
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {cards.map((card, index) => (
            <div
              key={card.title}
              className={`bg-gradient-to-br ${card.gradientFrom} to-white p-5 sm:p-6 rounded-2xl border-2 ${card.borderHover} transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                borderColor: card.borderColor,
                transitionDelay: `${0.3 + index * 0.15}s`,
                boxShadow: "0 6px 18px rgba(37, 99, 235, 0.06)",
                ["--check-color" as never]: card.checkColor,
              }}
            >
              <div className="mb-4">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl"
                  style={{ backgroundColor: card.iconBg, boxShadow: `0 3px 12px ${card.iconBg}30` }}
                >
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h4 className="font-bold text-xl mb-3 text-gray-900">{card.title}</h4>
              <ul className="space-y-2.5">
                {card.items.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="w-4.5 h-4.5 mr-2 mt-0.5 flex-shrink-0 text-[color:var(--check-color)]" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Product truth badges */}
        <div
          className={`flex flex-wrap justify-center gap-3 mt-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "0.8s" }}
        >
          {[
            { text: "$0 for Customers" },
            { text: "NY Service Area" },
            { text: "Transparent Bidding" },
          ].map((badge) => (
            <div
              key={badge.text}
              className="flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50/60 px-3.5 py-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-semibold text-slate-600">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
