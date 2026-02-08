import { useState, useRef, useEffect } from "react";
import { Camera, ArrowLeft, ArrowRight, X, Image, Check, Info, Upload, Car, Cloud, CheckCircle2, Trash2 } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import PhotoGuide from "../PhotoGuide";
import { uploadImageToSupabase } from "../../services/supabaseService";

type ReportScreenProps = {
  primaryColor?: string;
  secondaryColor?: string;
  userType?: string;
  onReportSubmit?: (report: any) => void;
  onViewReports?: () => void;
  onBackToDashboard?: () => void;
  hasSeenPhotoGuide?: boolean;
  onPhotoGuideComplete?: () => void;
  vehicles?: any[];
  onSaveVehicle?: (vehicle: any) => void;
};

export default function ReportScreen({
  primaryColor = "#0056b3",
  secondaryColor = "#00a0e9",
  userType = "customer",
  onReportSubmit,
  onViewReports,
  onBackToDashboard,
  hasSeenPhotoGuide = false,
  onPhotoGuideComplete,
  vehicles = [],
  onSaveVehicle
}: ReportScreenProps) {
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [vehicle, setVehicle] = useState({
    make: "",
    model: "",
    year: "",
    vin: ""
  });
  const [damageArea, setDamageArea] = useState("front");
  const [description, setDescription] = useState("");
  const [incident, setIncident] = useState("");
  const [showPhotoGuide, setShowPhotoGuide] = useState(false);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [hasSeenGuideThisSession, setHasSeenGuideThisSession] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Local storage key for draft report
  const DRAFT_STORAGE_KEY = 'bidondent_damage_report_draft';

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        console.log('📋 Loaded draft report from local storage');
        setStep(draft.step || 1);
        // Don't restore photos - they're too large for localStorage
        setVehicle(draft.vehicle || { make: "", model: "", year: "", vin: "" });
        setDamageArea(draft.damageArea || "front");
        setDescription(draft.description || "");
        setIncident(draft.incident || "");
      }
    } catch (error) {
      console.error('Error loading draft from localStorage:', error);
    }
  }, []);

  // Save draft to localStorage whenever any field changes (except on completion)
  useEffect(() => {
    // Don't save if we're on the completion step
    if (step === 5) {
      return;
    }

    // Don't include photos in draft - they're too large for localStorage
    const draft = {
      step,
      // photos excluded to prevent quota errors
      vehicle,
      damageArea,
      description,
      incident,
      savedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      console.log('💾 Draft auto-saved to local storage (text data only)');
      
      // Show save indicator
      setShowSaveIndicator(true);
      
      // Hide after 2 seconds
      const timer = setTimeout(() => {
        setShowSaveIndicator(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error saving draft to localStorage:', error);
      // If still failing, clear the draft to prevent repeated errors
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {
        console.error('Failed to clear draft:', e);
      }
    }
  }, [step, vehicle, damageArea, description, incident]); // Removed photos from dependencies

  // Clear draft from localStorage
  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      console.log('🗑️ Cleared draft from local storage');
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  };

  // Sample damage areas with coordinates for interactive selector
  const damageAreas = [
    { id: "front", label: "Front" },
    { id: "rear", label: "Rear" },
    { id: "driver", label: "Driver Side" },
    { id: "passenger", label: "Passenger Side" },
    { id: "roof", label: "Roof" },
    { id: "other", label: "Other" }
  ];

  // Handle photo upload with FileList
  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    setUploadProgress(`Uploading ${files.length} photo(s)...`);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Processing photo ${i + 1} of ${files.length}...`);

        // Compress image before upload
        const compressedBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = document.createElement('img');
            img.onload = () => {
              // Create canvas for compression
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // Calculate new dimensions (max 800px for MUCH smaller files)
              let width = img.width;
              let height = img.height;
              const maxSize = 800; // Reduced from 1200 for smaller files
              
              if (width > maxSize || height > maxSize) {
                if (width > height) {
                  height = (height / width) * maxSize;
                  width = maxSize;
                } else {
                  width = (width / height) * maxSize;
                  height = maxSize;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              
              // Draw and compress
              ctx?.drawImage(img, 0, 0, width, height);
              
              // Start with 0.5 quality for aggressive compression
              let quality = 0.5;
              let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
              
              // Target: 500KB max (accounting for base64 overhead and storage limits)
              const maxBase64Size = 500 * 1024; // 500KB in bytes
              while (compressedDataUrl.length > maxBase64Size && quality > 0.2) {
                quality -= 0.05;
                compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
              }
              
              console.log('🗜️ Compressed:', {
                originalSize: `${(file.size / 1024).toFixed(0)}KB`,
                compressedSize: `${(compressedDataUrl.length / 1024).toFixed(0)}KB`,
                quality: Math.round(quality * 100) + '%',
                dimensions: `${Math.round(width)}x${Math.round(height)}`,
                reduction: `${Math.round((1 - compressedDataUrl.length / file.size) * 100)}%`
              });
              
              resolve(compressedDataUrl);
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        console.log('📸 Photo compressed, size:', compressedBase64.length, 'bytes');

        // Try to upload to Supabase Storage
        setUploadProgress(`Uploading photo ${i + 1} of ${files.length}...`);
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const imagePath = `damage-reports/${timestamp}-${random}.jpg`;
        
        console.log('☁️ Attempting Supabase upload...');
        const url = await uploadImageToSupabase(compressedBase64, imagePath);
        
        if (url) {
          // Store Supabase URL instead of base64
          console.log('✅ Photo uploaded to Supabase:', url);
          setPhotos(prev => [...prev, url]);
        } else {
          // Fallback to base64 if upload fails
          console.warn('⚠️ Supabase upload failed, using base64 fallback');
          setPhotos(prev => [...prev, compressedBase64]);
        }
      }

      setUploadProgress('Upload complete!');
      setTimeout(() => {
        setUploadingPhoto(false);
        setUploadProgress('');
      }, 1500);

    } catch (error) {
      console.error('Error uploading photos:', error);
      setUploadProgress('Upload failed');
      setTimeout(() => {
        setUploadingPhoto(false);
        setUploadProgress('');
      }, 2000);
    }
  };

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Open camera
  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const resetForm = () => {
    setStep(1);
    setPhotos([]);
    setVehicle({ make: "", model: "", year: "", vin: "" });
    setDamageArea("front");
    setDescription("");
    setIncident("");
    setHasSeenGuideThisSession(false); // Reset guide state for new report
    clearDraft();
  };

  const renderStep = () => {
    console.log("Rendering step:", step, "Photos:", photos.length);
    
    try {
      switch (step) {
        case 1:
          return (
            <div className="px-4 py-5">
              <h2 className="text-xl font-bold mb-6">Report Vehicle Damage</h2>
              <p className="text-gray-600 mb-6">First, let's get information about your vehicle.</p>

              {/* Saved Vehicles */}
              {vehicles && vehicles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Select a saved vehicle</h3>
                  <div className="space-y-2">
                    {vehicles.map((v: any) => (
                      <button
                        key={v.id}
                        onClick={() => setVehicle({
                          make: v.make,
                          model: v.model,
                          year: v.year,
                          vin: v.vin || ""
                        })}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                          vehicle.make === v.make && vehicle.model === v.model && vehicle.year === v.year
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium">{v.year} {v.make} {v.model}</div>
                        {v.licensePlate && (
                          <div className="text-sm text-gray-500">Plate: {v.licensePlate}</div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-50 text-gray-500">Or enter vehicle manually</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">
                    Make
                  </label>
                  <input
                    id="make"
                    name="make"
                    type="text"
                    value={vehicle.make}
                    onChange={(e) => setVehicle({...vehicle, make: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Toyota"
                  />
                </div>

                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    id="model"
                    name="model"
                    type="text"
                    value={vehicle.model}
                    onChange={(e) => setVehicle({...vehicle, model: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Camry"
                  />
                </div>

                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    id="year"
                    name="year"
                    type="text"
                    value={vehicle.year}
                    onChange={(e) => setVehicle({...vehicle, year: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="2021"
                  />
                </div>

                <div className="mb-8">
                  <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">
                    VIN (Optional)
                  </label>
                  <input
                    id="vin"
                    name="vin"
                    type="text"
                    value={vehicle.vin}
                    onChange={(e) => setVehicle({...vehicle, vin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="1HGBH41JXMN109186"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  // Save vehicle if it's new and callback is provided
                  if (onSaveVehicle && vehicle.make && vehicle.model && vehicle.year) {
                    const isNewVehicle = !vehicles.some((v: any) => 
                      v.make === vehicle.make && v.model === vehicle.model && v.year === vehicle.year
                    );
                    if (isNewVehicle) {
                      onSaveVehicle({
                        id: Date.now(),
                        make: vehicle.make,
                        model: vehicle.model,
                        year: vehicle.year,
                        vin: vehicle.vin || ""
                      });
                    }
                  }
                  nextStep();
                }}
                className="w-full py-3 px-4 rounded-md text-white font-medium"
                style={{ backgroundColor: primaryColor }}
                disabled={!vehicle.make || !vehicle.model || !vehicle.year}
              >
                Continue
              </button>
            </div>
          );

        case 2:
          return (
            <div className="px-4 py-5">
              <h2 className="text-xl font-bold mb-6">Select Damaged Areas</h2>
              <p className="text-gray-600 mb-6">Tap the areas of your vehicle that are damaged.</p>

              <div className="relative mb-8 bg-gray-100 rounded-lg overflow-hidden max-w-md mx-auto md:max-w-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Car diagram"
                  className="w-full aspect-[4/3] object-cover"
                />
                
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {damageAreas.map((area) => (
                    <button
                      key={area.id}
                      className={`py-2 px-3 text-sm border rounded-md ${
                        damageArea === area.id
                          ? "bg-blue-100 border-blue-500 text-blue-700"
                          : "bg-white border-gray-300 text-gray-700"
                      }`}
                      onClick={() => setDamageArea(area.id)}
                    >
                      {area.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={prevStep}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md font-medium"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    // Only show photo guide if user hasn't seen it yet
                    if (!hasSeenPhotoGuide && !hasSeenGuideThisSession) {
                      setShowPhotoGuide(true);
                    } else {
                      // Skip directly to step 3 if they've seen the guide
                      nextStep();
                    }
                  }}
                  className="flex-1 py-2 px-4 rounded-md text-white font-medium"
                  style={{ backgroundColor: primaryColor }}
                >
                  Continue
                </button>
              </div>
            </div>
          );

        case 3:
          return (
            <div className="px-4 py-5">
              <h2 className="text-xl font-bold mb-6">Take Photos</h2>
              <p className="text-gray-600 mb-6">
                Please take clear photos of the damaged areas. Add at least 3 photos from different angles.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start">
                <div className="mr-3 mt-1">
                  <Info className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-sm text-blue-800">
                  For the best results, take photos in good lighting and make sure the damaged areas are clearly visible.
                </div>
              </div>

              {/* Upload Progress Indicator */}
              {uploadingPhoto && (
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6 flex items-center gap-3">
                  <div className="animate-spin">
                    <Cloud className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">{uploadProgress}</p>
                    <p className="text-xs text-blue-600">Photos are being saved to cloud storage...</p>
                  </div>
                </div>
              )}

              {/* Photo Grid - New Design with visible delete buttons */}
              <div className="space-y-3 mb-6">
                {photos.map((photo, index) => {
                  console.log(`🖼️ Rendering photo ${index + 1}:`, photo.substring(0, 100) + '...');
                  const isBase64 = photo.startsWith('data:');
                  console.log(`   Type: ${isBase64 ? 'Base64' : 'URL'}`);
                  return (
                    <div key={`photo-${index}`} className="relative flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-2">
                      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                        <img 
                          src={photo} 
                          alt={`Damage photo ${index + 1}`} 
                          className="w-full h-full object-cover"
                          onLoad={() => console.log(`✅ Photo ${index + 1} loaded successfully`)}
                          onError={() => {
                            console.error(`❌ Photo ${index + 1} failed to load`);
                            console.error(`   URL: ${photo.substring(0, 200)}`);
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">Photo {index + 1}</p>
                        <p className="text-xs text-gray-500">{isBase64 ? 'Local photo' : 'Cloud photo'}</p>
                      </div>
                      <button
                        onClick={() => removePhoto(index)}
                        aria-label="Remove photo"
                        type="button"
                        className="flex-shrink-0 p-2 rounded-md hover:bg-red-50 transition-colors"
                        style={{ color: "#EF4444" }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add Photo Buttons */}
              {photos.length < 6 && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={openCamera}
                    className="py-4 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Camera className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500 font-medium">Take Photo</span>
                  </button>
                  <button
                    onClick={openFilePicker}
                    className="py-4 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500 font-medium">Upload Photo</span>
                  </button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handlePhotoUpload(e.target.files)}
                multiple
                accept="image/*"
                className="hidden"
              />

              <input
                type="file"
                ref={cameraInputRef}
                onChange={(e) => handlePhotoUpload(e.target.files)}
                accept="image/*"
                className="hidden"
              />

              <div className="flex space-x-3">
                <button
                  onClick={prevStep}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md font-medium"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  className="flex-1 py-2 px-4 rounded-md text-white font-medium"
                  style={{ backgroundColor: primaryColor }}
                  disabled={photos.length < 1} // Normally you'd require 3+ photos
                >
                  Continue
                </button>
              </div>
            </div>
          );

        case 4:
          return (
            <div className="px-4 py-5">
              <h2 className="text-xl font-bold mb-6">Damage Description</h2>
              <p className="text-gray-600 mb-6">
                Please describe the damage to your vehicle. Provide as much detail as possible.
              </p>

              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Front bumper has a dent on the passenger side and the paint is scratched..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="mb-8">
                <label htmlFor="incident" className="block text-sm font-medium text-gray-700 mb-1">
                  What happened? (Optional)
                </label>
                <textarea
                  id="incident"
                  name="incident"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="I was in a parking lot and..."
                  value={incident}
                  onChange={(e) => setIncident(e.target.value)}
                ></textarea>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={prevStep}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md font-medium"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    // Submit the report
                    if (onReportSubmit) {
                      const report = {
                        id: Date.now().toString(),
                        vehicle,
                        damageArea,
                        photos,
                        description,
                        incident,
                        status: "pending" as const,
                        submittedAt: new Date().toISOString(),
                        bidsCount: 0
                      };
                      onReportSubmit(report);
                    }
                    // Clear the draft since report is submitted
                    clearDraft();
                    nextStep();
                  }}
                  className="flex-1 py-2 px-4 rounded-md text-white font-medium"
                  style={{ backgroundColor: primaryColor }}
                >
                  Continue
                </button>
              </div>
            </div>
          );

        case 5:
          return (
            <div className="px-4 py-5">
              <div className="text-center mb-8">
                <div 
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4"
                  style={{ backgroundColor: "#34D399" }}
                >
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">Report Submitted!</h2>
                <p className="text-gray-600">
                  Your damage report has been submitted. Body shops in your area will review your information and submit bids.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <h3 className="font-medium text-blue-800 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start">
                    <span className="font-bold mr-2">1.</span> 
                    <span>Local body shops will review your damage report</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">2.</span> 
                    <span>You'll receive notifications as bids come in</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">3.</span> 
                    <span>Compare bids and select the best option for you</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold mr-2">4.</span> 
                    <span>Schedule your repair with your chosen shop</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  if (onViewReports) {
                    onViewReports();
                  } else {
                    setStep(1);
                  }
                }}
                className="w-full py-2 px-4 rounded-md text-white font-medium mb-3"
                style={{ backgroundColor: primaryColor }}
              >
                View My Reports
              </button>
              
              <button
                onClick={() => {
                  // Reset form and go back to dashboard
                  resetForm();
                  if (onBackToDashboard) {
                    onBackToDashboard();
                  }
                }}
                className="w-full py-2 px-4 rounded-md border border-gray-300 font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          );

        default:
          return null;
      }
    } catch (error) {
      console.error("Error rendering step:", error);
      return (
        <div className="px-4 py-5">
          <div className="text-center">
            <p className="text-gray-600">Error: Invalid step {step}</p>
            <button
              onClick={() => setStep(1)}
              className="mt-4 py-2 px-4 rounded-md text-white font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              Start Over
            </button>
          </div>
        </div>
      );
    }
  };

  // Progress bar
  const progress = Math.min(Math.round((step / 5) * 100), 100);

  return (
    <div>
      <div className="bg-white border-b border-gray-200 py-3 px-4 flex items-center">
        <h1 className="font-bold">Report Damage</h1>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-sm text-gray-500">Step {step} of 5</div>
          {step < 5 && (
            <button
              onClick={resetForm}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-200">
        <div
          className="h-1 transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: primaryColor }}
        ></div>
      </div>
      
      <div className="pb-20">
        {renderStep() || (
          <div className="px-4 py-5">
            <div className="text-center">
              <p className="text-gray-600">Error: Invalid step {step}</p>
              <button
                onClick={() => setStep(1)}
                className="mt-4 py-2 px-4 rounded-md text-white font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Photo Guide Modal */}
      {showPhotoGuide && (
        <PhotoGuide
          onClose={() => setShowPhotoGuide(false)}
          onComplete={() => {
            setShowPhotoGuide(false);
            setHasSeenGuideThisSession(true);
            if (onPhotoGuideComplete) {
              onPhotoGuideComplete(); // Mark that user has seen the guide
            }
            nextStep();
          }}
          primaryColor={primaryColor}
        />
      )}

      {/* Save Indicator */}
      {showSaveIndicator && (
        <div className="fixed bottom-24 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in z-50">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">Report Auto-Saved ✓</span>
        </div>
      )}
    </div>
  );
}