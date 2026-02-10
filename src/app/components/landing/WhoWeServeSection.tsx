import { Car, Wrench, Shield, CheckCircle2 } from "lucide-react";

interface WhoWeServeSectionProps {
  primaryColor: string;
}

export default function WhoWeServeSection({ primaryColor }: WhoWeServeSectionProps) {
  const secondaryColor = '#00a0e9'; // Secondary color for shops
  
  return (
    <section id="who-we-serve" className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4">Who We Serve</h3>
          <p className="text-xl text-gray-600">Solutions for everyone in the auto repair ecosystem</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Customers Card */}
          <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 hover:border-blue-300 transition-all hover:shadow-xl"
               style={{ borderColor: `${primaryColor}30` }}>
            <div className="mb-6">
              <div className="inline-block p-4 rounded-xl" style={{ backgroundColor: primaryColor }}>
                <Car className="w-10 h-10 text-white" />
              </div>
            </div>
            <h4 className="font-bold text-2xl mb-4">For Customers</h4>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-2 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                <span className="text-gray-700">Submit damage reports with photos</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-2 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                <span className="text-gray-700">Compare multiple repair quotes</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-2 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                <span className="text-gray-700">Choose the best shop for you</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-2 mt-1 flex-shrink-0" style={{ color: primaryColor }} />
                <span className="text-gray-700">Track repair progress</span>
              </li>
            </ul>
          </div>
          
          {/* Shops Card */}
          <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl border-2 hover:border-orange-300 transition-all hover:shadow-xl"
               style={{ borderColor: `${secondaryColor}30` }}>
            <div className="mb-6">
              <div className="inline-block p-4 rounded-xl" style={{ backgroundColor: secondaryColor }}>
                <Wrench className="w-10 h-10 text-white" />
              </div>
            </div>
            <h4 className="font-bold text-2xl mb-4">For Auto Body Repair Shops</h4>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-2 mt-1 flex-shrink-0" style={{ color: secondaryColor }} />
                <span className="text-gray-700">Access new customer leads</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-2 mt-1 flex-shrink-0" style={{ color: secondaryColor }} />
                <span className="text-gray-700">Submit competitive bids</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-2 mt-1 flex-shrink-0" style={{ color: secondaryColor }} />
                <span className="text-gray-700">Manage jobs efficiently</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-2 mt-1 flex-shrink-0" style={{ color: secondaryColor }} />
                <span className="text-gray-700">Grow your business</span>
              </li>
            </ul>
          </div>
          
          {/* Insurers Card */}
          <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border-2 hover:border-green-300 transition-all hover:shadow-xl border-green-200">
            <div className="mb-6">
              <div className="inline-block p-4 rounded-xl bg-green-600">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <h4 className="font-bold text-2xl mb-4">For Insurers</h4>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-2 mt-1 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">Streamline claims processing</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-2 mt-1 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">Access network of shops</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-2 mt-1 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">Receive multiple claim estimates</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-2 mt-1 flex-shrink-0 text-green-600" />
                <span className="text-gray-700">Pay less for collision repair</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}