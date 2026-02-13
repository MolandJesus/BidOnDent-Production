import { Users, Store, Wrench, Star } from "lucide-react";
import { useCountUp } from "../../hooks/useScrollAnimation";

export default function TrustStatsSection() {
  const customers = useCountUp(10, 2000);
  const shops = useCountUp(500, 2200);
  const repairs = useCountUp(50, 2400);
  const rating = useCountUp(49, 2000); // 4.9 represented as 49

  const stats = [
    { ref: customers.ref, value: `${customers.count}K+`, label: "Happy Customers", icon: Users },
    { ref: shops.ref, value: `${shops.count}+`, label: "Partner Shops", icon: Store },
    { ref: repairs.ref, value: `${repairs.count}K+`, label: "Repairs Completed", icon: Wrench },
    {
      ref: rating.ref,
      value: `${(rating.count / 10).toFixed(1)}`,
      label: "Average Rating",
      icon: Star,
      showStarIcon: true,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:26px_26px] opacity-25" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-blue-500 rounded-full opacity-15 blur-3xl" />

      <div className="container mx-auto px-4 max-w-7xl relative">
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              ref={stat.ref}
              className="group"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                <stat.icon className="w-8 h-8 text-gray-300" />
              </div>
              <div className="text-5xl font-bold mb-2 tabular-nums flex items-center justify-center gap-2">
                {stat.value}
                {(stat as any).showStarIcon && <Star className="w-10 h-10 text-gray-300" />}
              </div>
              <div className="text-blue-200 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
