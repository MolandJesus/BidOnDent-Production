import { Car } from "lucide-react";

interface FooterSectionProps {
  primaryColor: string;
  secondaryColor: string;
}

export default function FooterSection({ primaryColor, secondaryColor }: FooterSectionProps) {
  return (
    <footer className="bg-gray-100 text-gray-800 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Car className="w-6 h-6" style={{ color: primaryColor }} />
              <h3 className="text-xl font-bold">
                <span style={{ 
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Bid</span>
                <span style={{ color: '#70c0ee' }}>On</span>
                <span className="text-gray-800">Dent</span>
              </h3>
            </div>
            <p className="text-gray-600">The smart way to handle auto repairs.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-800">For Customers</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-gray-800 transition-colors">How It Works</a></li>
              <li><a href="#" className="hover:text-gray-800 transition-colors">Submit Report</a></li>
              <li><a href="#" className="hover:text-gray-800 transition-colors">Find Shops</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-800">For Businesses</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-gray-800 transition-colors">Shop Signup</a></li>
              <li><a href="#" className="hover:text-gray-800 transition-colors">Insurer Partnership</a></li>
              <li><a href="#" className="hover:text-gray-800 transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-800">Company</h4>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-gray-800 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-gray-800 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-gray-800 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-300 pt-8 text-center text-gray-600">
          <p>&copy; 2024 Bidondent. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}