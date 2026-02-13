import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Shield,
  Sparkles,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";

interface DemoAccountSwitcherProps {
  currentAccountType: "customer" | "shop" | "insurer";
  onSelectAccountType: (type: "customer" | "shop" | "insurer") => void;
  onExitDemo: () => void;
  primaryColor: string;
}

type DemoAccountCard = {
  id: "customer" | "shop" | "insurer";
  title: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;
  features: string[];
};

const cardContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function DemoAccountSwitcher({
  currentAccountType,
  onSelectAccountType,
  onExitDemo,
  primaryColor,
}: DemoAccountSwitcherProps) {
  const accountTypes: DemoAccountCard[] = [
    {
      id: "customer",
      title: "Customer Dashboard",
      subtitle: "Submit reports, compare bids, and track your repairs.",
      icon: User,
      gradient: "linear-gradient(135deg, #0b4ea2 0%, #1c7bd9 100%)",
      features: [
        "Submit damage reports with photos",
        "Compare bids from trusted shops",
        "Track repair status in one place",
        "Manage your vehicles",
      ],
    },
    {
      id: "shop",
      title: "Shop Dashboard",
      subtitle: "Review requests, submit bids, and manage jobs.",
      icon: Wrench,
      gradient: "linear-gradient(135deg, #1499d6 0%, #00b6e8 100%)",
      features: [
        "View incoming repair requests",
        "Submit competitive bids quickly",
        "Manage active repair jobs",
        "Track performance metrics",
      ],
    },
    {
      id: "insurer",
      title: "Insurer Dashboard",
      subtitle: "Handle claims and monitor partner network activity.",
      icon: Shield,
      gradient: "linear-gradient(135deg, #4aa6d8 0%, #79c7ef 100%)",
      features: [
        "Review submitted claims",
        "Manage partner shop network",
        "Track claim turnaround",
        "Oversee approvals and updates",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm"
      >
        <button
          onClick={onExitDemo}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <div className="mt-4 flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-xl text-white flex items-center justify-center shadow-sm"
            style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #00a0e9 100%)` }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
              Demo Mode
            </h1>
            <p className="text-slate-600 mt-1">
              Explore each dashboard perspective with animated preview cards.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <span className="font-semibold">Demo Mode Active:</span> You are viewing sample data. Your
          real account data stays unchanged.
        </div>
      </motion.section>

      <motion.section
        variants={cardContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {accountTypes.map((account) => {
          const Icon = account.icon;
          const isActive = currentAccountType === account.id;

          return (
            <motion.article
              key={account.id}
              variants={cardItem}
              whileHover={{ y: -4 }}
              className={`rounded-2xl border overflow-hidden bg-white shadow-sm transition-all ${
                isActive ? "border-blue-500 shadow-md" : "border-slate-200"
              }`}
            >
              <div className="p-5 text-white relative" style={{ background: account.gradient }}>
                <Icon className="w-8 h-8 mb-3" />
                <h2 className="text-2xl font-semibold leading-tight">{account.title}</h2>
                <p className="mt-2 text-white/90 text-sm">{account.subtitle}</p>
                <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-white/15 rounded-full" />

                {isActive && (
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20">
                    <Eye className="w-3.5 h-3.5" />
                    Currently Viewing
                  </div>
                )}
              </div>

              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Key Features
                </p>
                <ul className="mt-3 space-y-2">
                  {account.features.map((feature) => (
                    <li key={feature} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onSelectAccountType(account.id)}
                  disabled={isActive}
                  className={`mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition-all ${
                    isActive
                      ? "bg-blue-100 text-blue-700 cursor-default"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
                >
                  {isActive ? "Currently Viewing" : "Switch to This View"}
                  {!isActive && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </motion.article>
          );
        })}
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="flex justify-center"
      >
        <button
          onClick={onExitDemo}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit Demo Mode
        </button>
      </motion.div>
    </div>
  );
}
