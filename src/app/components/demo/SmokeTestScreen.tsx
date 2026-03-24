import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const CHECKLISTS = [
  {
    title: "Landing / Public",
    items: [
      "Landing page renders (hero, CTA, footer)",
      "Get Started opens Clerk sign-up modal",
      "Learn More scrolls to How It Works",
      "Header nav scrolls to sections",
    ],
  },
  {
    title: "Customer",
    items: [
      "Complete account setup",
      "Dashboard home loads",
      "Start report flow opens",
      "Reports list and detail open",
      "Account page opens and menus work",
    ],
  },
  {
    title: "Shop",
    items: [
      "Dashboard home loads",
      "Requests screen opens",
      "Submit bid UI works",
      "Account page opens and menus work",
    ],
  },
  {
    title: "Insurer",
    items: [
      "Dashboard home loads",
      "Claims list opens",
      "New claim screen opens",
      "Account page opens and menus work",
    ],
  },
];

type SmokeTestScreenProps = {
  primaryColor: string;
};

export default function SmokeTestScreen({ primaryColor }: SmokeTestScreenProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="bd-glass-card p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle2 className="w-6 h-6" style={{ color: primaryColor }} />
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Smoke Test Checklist</h2>
          <p className="text-sm text-gray-500">Use this for quick verification before handoffs.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {CHECKLISTS.map((section) => (
          <div key={section.title} className="border border-gray-100 rounded-xl p-4 md:p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
            <div className="grid gap-2">
              {section.items.map((item) => {
                const key = `${section.title}-${item}`;
                const checked = Boolean(checkedItems[key]);
                return (
                  <label key={key} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={checked}
                      onChange={() => toggleItem(key)}
                    />
                    <span className={checked ? "text-gray-500 line-through" : "text-gray-700"}>
                      {item}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
