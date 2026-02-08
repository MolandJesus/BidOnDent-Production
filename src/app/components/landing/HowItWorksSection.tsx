import { Camera, FileCheck, Wrench } from "lucide-react";
import { RefObject } from "react";

interface HowItWorksSectionProps {
  vehicleInspectionImage: string;
  primaryColor: string;
}

export default function HowItWorksSection({ vehicleInspectionImage, primaryColor }: HowItWorksSectionProps) {
  return (
    <section id="how-it-works" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4">How It Works</h3>
          <p className="text-xl text-gray-600">Get your car repaired in three simple steps</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center group">
            <div className="inline-block p-6 rounded-2xl mb-6 transition-all group-hover:scale-110" style={{ backgroundColor: `${primaryColor}15` }}>
              <Camera className="w-12 h-12" style={{ color: primaryColor }} />
            </div>
            <h4 className="font-bold text-2xl mb-3">1. Report Damage</h4>
            <p className="text-gray-600 text-lg leading-relaxed">Take photos of your vehicle's damage and submit a repair request in minutes with our easy-to-use guided process.</p>
          </div>
          
          <div className="text-center group">
            <div className="inline-block p-6 rounded-2xl mb-6 transition-all group-hover:scale-110" style={{ backgroundColor: `${primaryColor}15` }}>
              <FileCheck className="w-12 h-12" style={{ color: primaryColor }} />
            </div>
            <h4 className="font-bold text-2xl mb-3">2. Receive Bids</h4>
            <p className="text-gray-600 text-lg leading-relaxed">Local certified shops review your request and submit competitive repair quotes.</p>
          </div>
          
          <div className="text-center group">
            <div className="inline-block p-6 rounded-2xl mb-6 transition-all group-hover:scale-110" style={{ backgroundColor: `${primaryColor}15` }}>
              <Wrench className="w-12 h-12" style={{ color: primaryColor }} />
            </div>
            <h4 className="font-bold text-2xl mb-3">3. Choose and Repair</h4>
            <p className="text-gray-600 text-lg leading-relaxed">Compare bids side by side, select the best option for you, and schedule your repair with confidence.</p>
          </div>
        </div>
      </div>
    </section>
  );
}