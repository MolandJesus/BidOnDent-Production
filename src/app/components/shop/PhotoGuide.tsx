import { useState } from "react";
import { Check, X, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { buildPhotoGuideSteps } from "./photo-guide-steps";

type PhotoGuideProps = {
  onClose: () => void;
  onComplete: () => void;
  primaryColor?: string;
};

export default function PhotoGuide({
  onClose,
  onComplete,
  primaryColor = "#0056b3",
}: PhotoGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const steps = buildPhotoGuideSteps({ isDesktop, onComplete, primaryColor });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end md:items-center justify-center z-50 p-0 sm:p-2 md:p-4">
      <motion.div
        className="bd-glass-floating rounded-t-2xl sm:rounded-2xl md:rounded-3xl max-w-2xl w-full h-[88dvh] sm:h-auto sm:max-h-[92vh] md:max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        {/* Header */}
        <div
          className="p-4 sm:p-5 md:p-6 text-white relative shrink-0"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, #00a0e9 100%)`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
            <motion.div
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
              key={currentStep}
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {steps[currentStep].icon}
            </motion.div>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-0.5 sm:mb-1 pr-6">
                {steps[currentStep].title}
              </h2>
              <p className="text-white/90 text-sm md:text-base">{steps[currentStep].subtitle}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs sm:text-sm text-white/90 font-medium">
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 overflow-y-auto flex-1 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-gray-200 px-3 py-2.5 sm:p-4 bg-gray-50 shrink-0 pb-[max(env(safe-area-inset-bottom),0.625rem)]">
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                currentStep === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-200 active:scale-95"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentStep ? "w-8" : "w-2.5 hover:bg-gray-400"
                  }`}
                  style={{
                    backgroundColor:
                      index === currentStep
                        ? primaryColor
                        : index < currentStep
                          ? primaryColor + "80"
                          : "#d1d5db",
                  }}
                />
              ))}
            </div>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-lg text-white font-medium transition-all hover:shadow-md active:scale-95"
                style={{ backgroundColor: primaryColor }}
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-lg text-white font-medium transition-all hover:shadow-md bg-green-500 hover:bg-green-600 active:scale-95"
              >
                <Check className="w-5 h-5" />
                <span className="hidden sm:inline">Let's Go!</span>
                <span className="sm:hidden">Start</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
