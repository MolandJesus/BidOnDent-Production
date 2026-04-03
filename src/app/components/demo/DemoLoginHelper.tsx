/**
 * Demo Login Helper Component
 * Quick login buttons for demo accounts
 * Add this to LoginModal to make testing easier
 */

import { User, Wrench, Shield } from "lucide-react";
import { DEMO_CONFIG } from "../../config/demoMode";

interface DemoLoginHelperProps {
  onQuickLogin: (email: string, password: string, accountType: 'customer' | 'shop' | 'insurer') => void;
}

export default function DemoLoginHelper({ onQuickLogin }: DemoLoginHelperProps) {
  const demoAccounts = [
    {
      type: 'customer' as const,
      email: DEMO_CONFIG.demoAccounts.customer.email,
      password: DEMO_CONFIG.demoAccounts.customer.password,
      name: 'Demo Customer',
      icon: User,
      color: '#003d82',
      bgColor: '#e3f2fd'
    },
    {
      type: 'shop' as const,
      email: DEMO_CONFIG.demoAccounts.shop.email,
      password: DEMO_CONFIG.demoAccounts.shop.password,
      name: 'Demo Auto Shop',
      icon: Wrench,
      color: '#f57c00',
      bgColor: '#fff3e0'
    },
    {
      type: 'insurer' as const,
      email: DEMO_CONFIG.demoAccounts.insurer.email,
      password: DEMO_CONFIG.demoAccounts.insurer.password,
      name: 'Demo Insurance',
      icon: Shield,
      color: '#388e3c',
      bgColor: '#e8f5e9'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
      <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span className="text-lg">🎭</span>
        Quick Demo Login:
      </p>
      
      <div className="space-y-2">
        {demoAccounts.map((account) => {
          const Icon = account.icon;
          
          return (
            <button
              key={account.type}
              onClick={() => onQuickLogin(account.email, account.password, account.type)}
              className="w-full py-2.5 px-4 rounded-md font-medium transition-all hover:shadow-md flex items-center gap-3 text-left"
              style={{
                backgroundColor: account.bgColor,
                border: `1.5px solid ${account.color}20`
              }}
            >
              <Icon 
                className="w-5 h-5 flex-shrink-0" 
                style={{ color: account.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: account.color }}>
                  {account.name}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {account.email}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-500 mt-3 text-center">
        Or create your own account below ↓
      </p>
    </div>
  );
}
