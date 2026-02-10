import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Car, Wrench, Shield } from 'lucide-react';
import { updateUserMetadata } from "../../services/clerkService";
import type { UserType } from "../../services/clerkService";

export default function ClerkAccountTypeSelector() {
  const { user } = useUser();
  const [selectedType, setSelectedType] = useState<UserType>('customer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleComplete = async () => {
    if (!user || !name.trim()) return;
    
    setIsLoading(true);
    try {
      await updateUserMetadata(user, {
        user_type: selectedType,
        name: name.trim(),
        phone: phone.trim(),
        account_setup_completed: true,
      });
      
      // Reload to refresh the app with new user data
      window.location.reload();
    } catch (error) {
      console.error('Error saving user profile:', error);
      alert('Error saving profile. Please try again.');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Bidondent!
        </h2>
        <p className="text-gray-600 mb-8">
          Let's set up your account. What type of account do you need?
        </p>
        
        {/* Account Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setSelectedType('customer')}
            className={`p-6 border-2 rounded-lg transition-all ${
              selectedType === 'customer'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Car className="w-12 h-12 mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold text-gray-900 mb-1">Customer</h3>
            <p className="text-sm text-gray-600">
              Get repair quotes for your vehicle
            </p>
          </button>
          
          <button
            onClick={() => setSelectedType('shop')}
            className={`p-6 border-2 rounded-lg transition-all ${
              selectedType === 'shop'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Wrench className="w-12 h-12 mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold text-gray-900 mb-1">Auto Shop</h3>
            <p className="text-sm text-gray-600">
              Bid on repair jobs
            </p>
          </button>
          
          <button
            onClick={() => setSelectedType('insurer')}
            className={`p-6 border-2 rounded-lg transition-all ${
              selectedType === 'insurer'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Shield className="w-12 h-12 mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold text-gray-900 mb-1">Insurer</h3>
            <p className="text-sm text-gray-600">
              Manage claims and shops
            </p>
          </button>
        </div>
        
        {/* Name and Phone */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(555) 123-4567"
              disabled={isLoading}
            />
          </div>
        </div>
        
        {/* Complete Button */}
        <button
          onClick={handleComplete}
          disabled={!name.trim() || isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : 'Complete Setup'}
        </button>
      </div>
    </div>
  );
}
