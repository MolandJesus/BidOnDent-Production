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
      iconBg: "#16a34a",
      title: "For Insurers",
      borderHover: "hover:border-green-300",
      gradientFrom: "from-green-50",
      hoverBg: "#16a34a",
      borderColor: "#bbf7d0",
      checkColor: "#16a34a",
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
      className="py-20 bg-gradient-to-b from-blue-50/30 to-white"
      ref={sectionRef}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section badge */}
        <div
          className={`text-center mb-6 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bd-glass-badge text-sm font-medium">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            Our Solutions
          </span>
        </div>

        <div
          className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.15s" }}
        >
          <h3 className="text-3xl sm:text-4xl font-bold mb-4">Who We Serve</h3>
          <p className="text-xl text-gray-600">
            Solutions for everyone in the auto repair ecosystem
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div
              key={card.title}
              className={`relative overflow-hidden bg-gradient-to-br ${card.gradientFrom} to-white p-5 sm:p-8 rounded-2xl border-2 ${card.borderHover} transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.03] group ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{
                borderColor: card.borderColor,
                transitionDelay: `${0.3 + index * 0.15}s`,
                ["--hover-bg" as never]: card.hoverBg,
                ["--check-color" as never]: card.checkColor,
              }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[var(--hover-bg)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-6">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:bg-white/15"
                    style={{ backgroundColor: card.iconBg }}
                  >
                    <card.icon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h4 className="font-bold text-2xl mb-4 text-gray-900 group-hover:text-white">
                  {card.title}
                </h4>
                <ul className="space-y-3 mb-8">
                  {card.items.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 mr-2 mt-1 flex-shrink-0 text-[color:var(--check-color)] group-hover:text-white" />
                      <span className="text-gray-700 group-hover:text-white/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Product truth badges */}
        <div
          className={`flex flex-wrap justify-center gap-6 mt-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "0.8s" }}
        >
          {[
            { icon: "✓", text: "$0 for Customers" },
            { icon: "✓", text: "NY Service Area" },
            { icon: "✓", text: "Transparent Bidding" },
          ].map((badge) => (
            <div
              key={badge.text}
              className="flex items-center gap-2 bd-glass-card px-4 py-2 rounded-full"
            >
              <span className="text-green-600 text-sm font-bold">{badge.icon}</span>
              <span className="text-sm font-semibold text-gray-700">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
