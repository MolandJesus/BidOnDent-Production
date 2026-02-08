import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ImageErrorBoundary } from "../ImageErrorBoundary";

interface BenefitsSectionProps {
  primaryColor: string;
  secondaryColor: string;
  mechanicImage: string;
  repairToolImage: string;
  dentRepairImage: string;
  precisionRepairImage: string;
}

export default function BenefitsSection({
  primaryColor,
  secondaryColor,
  mechanicImage,
  repairToolImage,
  dentRepairImage,
  precisionRepairImage
}: BenefitsSectionProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4">
            Why Choose{" "}
            <span style={{ 
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Bid</span>
            <span style={{ color: '#70c0ee' }}>On</span>
            <span className="text-gray-800">Dent</span>?
          </h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-4 overflow-hidden rounded-lg">
              <ImageErrorBoundary>
                <ImageWithFallback 
                  src={mechanicImage} 
                  alt="Close-up of car damage showing dents and scratches needing professional repair" 
                  className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                />
              </ImageErrorBoundary>
            </div>
            <h4 className="font-bold text-xl mb-3">Get Your Car Fixed Right</h4>
            <p className="text-gray-600">From minor dents to major collision damage, connect with shops that specialize in your repair needs.</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-4 overflow-hidden rounded-lg">
              <ImageErrorBoundary>
                <ImageWithFallback 
                  src={repairToolImage} 
                  alt="Professional auto body painter in spray booth ensuring quality repairs" 
                  className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                />
              </ImageErrorBoundary>
            </div>
            <h4 className="font-bold text-xl mb-3">Certified Professionals</h4>
            <p className="text-gray-600">Work with vetted, experienced auto repair specialists who deliver quality results.</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="mb-4 overflow-hidden rounded-lg">
              <ImageErrorBoundary>
                <ImageWithFallback 
                  src={dentRepairImage} 
                  alt="Professional dent repair and paintless dent removal service" 
                  className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                />
              </ImageErrorBoundary>
            </div>
            <h4 className="font-bold text-xl mb-3">Competitive Pricing</h4>
            <p className="text-gray-600">Compare multiple quotes to ensure you get the best value for your money.</p>
          </div>
        </div>
      </div>
    </section>
  );
}