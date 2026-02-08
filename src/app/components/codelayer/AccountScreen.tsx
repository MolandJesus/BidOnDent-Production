import { useState, useRef, useEffect } from "react";
import { Edit, Phone, CreditCard, Lock, Bell, Shield, ChevronRight, Camera, X, Check, AlertCircle, Trash2, Car as CarIcon, MapPin, Building, User as UserIcon, Mail, Calendar, Settings, LogOut, HelpCircle, Save, Cloud } from "lucide-react";
import { formatPhoneNumber, unformatPhoneNumber } from "../../utils/formatters";
import { compressImage, blobToBase64, getBase64Size, formatBytes } from "../../utils/imageCompression";
import { uploadPhoto } from "../../services/supabaseService";
import { LANDING_PAGE_IMAGES } from "../../constants";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { supabase } from "../../services/supabaseService";
import GoToAdminButton from "../GoToAdminButton";
import { projectId } from "../../../../utils/supabase/info";

type AccountScreenProps = {
  userType: string;
  primaryColor?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  profileImage?: string;
  vehicles?: any[];
  reports?: any[];
  onLogout?: () => void;
  onSaveProfile?: (data: { name: string; email: string; phone: string; profileImage?: string }) => void;
  onViewVehicles?: () => void;
  onViewReport?: (reportId: string) => void;
};

export default function AccountScreen({
  userType = "customer",
  primaryColor = "#0056b3",
  userName = "User",
  userEmail = "user@example.com",
  userPhone = "(555) 123-4567",
  profileImage: initialProfileImage = "",
  vehicles = [],
  reports = [],
  onLogout,
  onSaveProfile,
  onViewVehicles,
  onViewReport
}: AccountScreenProps) {
  // Use default profile image if none provided
  const [profileImage, setProfileImage] = useState<string | null>(initialProfileImage || LANDING_PAGE_IMAGES.defaultProfile);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showShopProfile, setShowShopProfile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // REMOVED: Supabase session checking - we now use Clerk for authentication
  // The session check was causing automatic logout when switching to account tab
  
  // Check if user is using a test account
  const isTestAccount = [
    'customer.test@bidondent.com',
    'shop.test@bidondent.com',
    'insurer.test@bidondent.com'
  ].includes(userEmail);

  // Editable user info
  const [editableName, setEditableName] = useState(userName);
  const [editableEmail, setEditableEmail] = useState(userEmail);
  const [editablePhone, setEditablePhone] = useState(formatPhoneNumber(userPhone));
  const [shopName, setShopName] = useState("Express Auto Body");
  const [companyName, setCompanyName] = useState("SafeDrive Insurance");

  // User info
  const userInfo = {
    name: editableName,
    email: editableEmail,
    phone: editablePhone,
    vehicles: vehicles || [],
    shopName: userType === "shop" ? shopName : "",
    companyName: userType === "insurer" ? companyName : ""
  };

  const handleProfileImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        try {
          // Show loading state
          setIsSaving(true);
          
          console.log('🔐 Checking authentication status...');
          
          // Add timeout wrapper for session check (5 seconds max)
          const sessionCheckPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session check timeout')), 5000)
          );
          
          const { data: { session: currentSession }, error: getSessionError } = await Promise.race([
            sessionCheckPromise,
            timeoutPromise
          ]) as any;
          
          if (getSessionError) {
            console.error('❌ Error getting session:', getSessionError.message);
            setIsSaving(false);
            alert('Authentication error. Please refresh the page and try again.');
            return;
          }
          
          if (!currentSession) {
            console.error('❌ No active session found');
            setIsSaving(false);
            alert('Session expired. Please refresh the page and sign in again.');
            return;
          }
          
          console.log('✅ Active session found for:', currentSession.user?.email);
          
          // Skip session refresh - just use current session to avoid hanging
          console.log('⏭️ Skipping session refresh, using current session');
          
          // Compress the image more aggressively (400x400 max, 60% quality, JPEG)
          console.log(`📸 Original image: ${formatBytes(file.size)}`);
          const compressedBlob = await compressImage(file, {
            maxWidth: 400,
            maxHeight: 400,
            quality: 0.6,
            outputFormat: 'image/jpeg'
          });
          console.log(`✅ Compressed to: ${formatBytes(compressedBlob.size)}`);
          
          // Upload to Supabase Storage with timeout (30 seconds max)
          console.log('☁️ Uploading to cloud storage...');
          const uploadPromise = uploadPhoto(compressedBlob, 'bidondent-profiles');
          const uploadTimeoutPromise = new Promise<null>((resolve) => 
            setTimeout(() => {
              console.warn('⏱️ Upload timeout - falling back to base64');
              resolve(null);
            }, 30000)
          );
          
          const publicUrl = await Promise.race([uploadPromise, uploadTimeoutPromise]);
          
          let finalImageUrl: string;
          if (publicUrl) {
            finalImageUrl = publicUrl;
            console.log('✅ Profile image uploaded to Supabase:', publicUrl);
          } else {
            // Fallback: convert to base64 if upload fails
            console.warn('⚠️ Cloud upload failed, using base64 fallback');
            const base64 = await blobToBase64(compressedBlob);
            finalImageUrl = base64;
            console.log('✅ Using base64 fallback for profile image');
          }
          
          console.log('💾 Updating profile with new image...');
          setProfileImage(finalImageUrl);
          
          // Auto-save the profile immediately
          if (onSaveProfile) {
            try {
              await onSaveProfile({ 
                name: editableName, 
                email: editableEmail, 
                phone: unformatPhoneNumber(editablePhone),
                profileImage: finalImageUrl
              });
              console.log('✅ Profile saved successfully');
            } catch (saveError) {
              console.error('❌ Error saving profile:', saveError);
              // Don't throw - image is already set locally
              console.log('⚠️ Image set locally but server save failed');
            }
          }
          
          // Show success notification
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);
          
          setIsSaving(false);
          console.log('🎉 Profile photo upload complete!');
        } catch (error) {
          console.error('❌ Error processing image:', error);
          setIsSaving(false);
          // Show user-friendly error without forcing reload
          alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
        }
      }
    };
    input.click();
  };
  
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Show loading state
        setIsSaving(true);
        
        console.log('🔐 Checking authentication status...');
        
        // Add timeout wrapper for session check (5 seconds max)
        const sessionCheckPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );
        
        const { data: { session: currentSession }, error: getSessionError } = await Promise.race([
          sessionCheckPromise,
          timeoutPromise
        ]) as any;
        
        if (getSessionError) {
          console.error('❌ Error getting session:', getSessionError.message);
          setIsSaving(false);
          alert('Authentication error. Please refresh the page and try again.');
          return;
        }
        
        if (!currentSession) {
          console.error('❌ No active session found');
          setIsSaving(false);
          alert('Session expired. Please refresh the page and sign in again.');
          return;
        }
        
        console.log('✅ Active session found for:', currentSession.user?.email);
        
        // Skip session refresh - just use current session to avoid hanging
        console.log('⏭️ Skipping session refresh, using current session');
        
        // Compress the image more aggressively (400x400 max, 60% quality, JPEG)
        console.log(`📸 Original image: ${formatBytes(file.size)}`);
        const compressedBlob = await compressImage(file, {
          maxWidth: 400,
          maxHeight: 400,
          quality: 0.6,
          outputFormat: 'image/jpeg'
        });
        console.log(`✅ Compressed to: ${formatBytes(compressedBlob.size)}`);
        
        // Upload to Supabase Storage with timeout (30 seconds max)
        console.log('☁️ Uploading to cloud storage...');
        const uploadPromise = uploadPhoto(compressedBlob, 'bidondent-profiles');
        const uploadTimeoutPromise = new Promise<null>((resolve) => 
          setTimeout(() => {
            console.warn('⏱️ Upload timeout - falling back to base64');
            resolve(null);
          }, 30000)
        );
        
        const publicUrl = await Promise.race([uploadPromise, uploadTimeoutPromise]);
        
        let finalImageUrl: string;
        if (publicUrl) {
          finalImageUrl = publicUrl;
          console.log('✅ Profile image uploaded to Supabase:', publicUrl);
        } else {
          // Fallback: convert to base64 if upload fails
          console.warn('⚠️ Cloud upload failed, using base64 fallback');
          const base64 = await blobToBase64(compressedBlob);
          finalImageUrl = base64;
          console.log('✅ Using base64 fallback for profile image');
        }
        
        console.log('💾 Updating profile with new image...');
        setProfileImage(finalImageUrl);
        
        // Auto-save the profile immediately
        if (onSaveProfile) {
          try {
            await onSaveProfile({ 
              name: editableName, 
              email: editableEmail, 
              phone: unformatPhoneNumber(editablePhone),
              profileImage: finalImageUrl
            });
            console.log('✅ Profile saved successfully');
          } catch (saveError) {
            console.error('❌ Error saving profile:', saveError);
            // Don't throw - image is already set locally
            console.log('⚠️ Image set locally but server save failed');
          }
        }
        
        // Show success notification
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        
        setIsSaving(false);
        console.log('🎉 Profile photo upload complete!');
      } catch (error) {
        console.error('❌ Error processing image:', error);
        setIsSaving(false);
        // Show user-friendly error without forcing reload
        alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      }
    }
  };
  
  const saveProfileChanges = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    if (onSaveProfile) {
      await onSaveProfile({ 
        name: editableName, 
        email: editableEmail, 
        phone: unformatPhoneNumber(editablePhone),
        profileImage: profileImage || undefined
      });
    }
    
    setIsSaving(false);
    setSaveSuccess(true);
    setShowEditProfile(false);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };
  
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleDeleteAccount = async () => {
    // Safety check: Verify confirmation text matches
    if (deleteConfirmText.toLowerCase() !== 'delete') {
      alert('Please type "DELETE" to confirm account deletion');
      return;
    }

    // Check if test account
    if (isTestAccount) {
      alert('This account type cannot be deleted through this method');
      setDeleteConfirmText(''); // Reset confirmation text
      return;
    }

    // Note: Admin check happens on the server side - server will reject admin deletion attempts

    setIsDeleting(true);

    try {
      console.log('🔄 Step 1: Getting current session for account deletion...');
      
      // Step 1: Get current session
      let { data: { session }, error: sessionError } = await supabase.auth.getSession();

      console.log('Session check:', {
        hasSession: !!session,
        sessionError: sessionError?.message,
        hasAccessToken: !!session?.access_token,
        userEmail: session?.user?.email
      });

      // Step 2: If no session or error, try to refresh
      if (sessionError || !session || !session.access_token) {
        console.log('⚠️ No valid session, attempting refresh...');
        
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session || !refreshData.session.access_token) {
          console.error('❌ Session refresh failed:', refreshError?.message);
          alert('Session expired. Please sign in again.');
          setIsDeleting(false);
          setDeleteConfirmText('');
          setShowDeleteAccount(false);
          if (onLogout) {
            onLogout();
          }
          return;
        }
        
        session = refreshData.session;
        console.log('✅ Session refreshed successfully');
      }
      
      // Step 3: Validate the session one more time
      if (!session || !session.access_token) {
        console.error('❌ Still no valid session after refresh');
        alert('Authentication error. Please sign in again.');
        setIsDeleting(false);
        setDeleteConfirmText('');
        setShowDeleteAccount(false);
        if (onLogout) {
          onLogout();
        }
        return;
      }
      
      // Step 4: Verify the token is valid by testing it CLIENT-SIDE
      console.log('🔍 Verifying token validity with client-side check...');
      const { data: { user }, error: userError } = await supabase.auth.getUser(session.access_token);
      
      if (userError || !user) {
        console.error('❌ Token validation failed:', userError?.message);
        console.error('❌ The JWT token is invalid or expired');
        
        // Try one more refresh
        console.log('🔄 Final attempt: refreshing session...');
        const { data: finalRefresh, error: finalError } = await supabase.auth.refreshSession();
        
        if (finalError || !finalRefresh.session?.access_token) {
          console.error('❌ Final refresh failed:', finalError?.message);
          alert('Session expired. Please sign in again.');
          setIsDeleting(false);
          setDeleteConfirmText('');
          setShowDeleteAccount(false);
          if (onLogout) {
            onLogout();
          }
          return;
        }
        
        session = finalRefresh.session;
        console.log('✅ Final refresh successful');
        
        // Validate the refreshed token
        const { data: { user: validatedUser }, error: validationError } = await supabase.auth.getUser(session.access_token);
        
        if (validationError || !validatedUser) {
          console.error('❌ Even after refresh, token is still invalid');
          alert('Authentication error. Please sign in again.');
          setIsDeleting(false);
          setDeleteConfirmText('');
          setShowDeleteAccount(false);
          if (onLogout) {
            onLogout();
          }
          return;
        }
        
        console.log('✅ Refreshed token validated successfully');
      } else {
        console.log('✅ Token is valid for user:', user.email);
      }

      console.log('✅ All validation checks passed, proceeding with deletion');
      console.log('📅 Token expires at:', new Date((session.expires_at || 0) * 1000).toLocaleString());
      
      // Step 5: Now delete with the validated token
      await performDeletion(session.access_token);

    } catch (error) {
      console.error('❌ Error deleting account:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to delete account'}`);
      setIsDeleting(false);
      setDeleteConfirmText(''); // Reset confirmation text so user can try again
    }
  };

  const performDeletion = async (accessToken: string) => {
    try {
      // Validate prerequisites
      if (!projectId) {
        throw new Error('ProjectId is not defined - cannot construct API URL');
      }
      
      if (!accessToken || accessToken.length < 20) {
        throw new Error('Invalid access token - too short or empty');
      }
      
      const deleteUrl = `https://${projectId}.supabase.co/functions/v1/make-server-9f243523/delete-account`;
      console.log('🗑️ Requesting account deletion...');
      console.log('🌐 Full URL:', deleteUrl);
      console.log('🌐 URL length:', deleteUrl.length);
      console.log('🔑 Access token length:', accessToken.length);
      console.log('🔑 Access token preview:', accessToken.substring(0, 20) + '...');
      console.log('🔍 ProjectId value:', projectId);
      console.log('📋 Request method: POST');
      console.log('📋 Headers:', {
        'Authorization': `Bearer ${accessToken.substring(0, 20)}...`,
        'Content-Type': 'application/json'
      });

      // Call server endpoint to delete account
      console.log('🚀 Initiating fetch request...');
      const response = await fetch(
        deleteUrl,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({}) // Empty body to ensure proper POST request
        }
      );
      console.log('✅ Fetch completed, got response');

      const responseText = await response.text();
      console.log('📥 Server response status:', response.status);
      console.log('📥 Server response:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText };
        }
        console.error('❌ Account deletion failed:', errorData);
        alert(`Failed to delete account: ${errorData.error || errorData.message || errorData.details || 'Unknown error'}`);
        setIsDeleting(false);
        setDeleteConfirmText(''); // Reset confirmation text so user can try again
        return;
      }

      console.log('✅ Account deleted successfully');

      // Show success message and logout
      alert('Your account has been permanently deleted. All your data has been removed from our systems.');
      
      // Clear session and logout
      await supabase.auth.signOut();
      
      setIsDeleting(false);
      setDeleteConfirmText('');
      setShowDeleteAccount(false);
      
      // Trigger logout to return to login screen
      if (onLogout) {
        onLogout();
      }

    } catch (error) {
      console.error('❌ Error in deletion request:', error);
      console.error('❌ Error type:', error?.constructor?.name);
      console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
      console.error('❌ Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to delete account'}. Check console for details.`);
      setIsDeleting(false);
      setDeleteConfirmText('');
    }
  };

  return (
    <div className="pb-20">
      {/* Loading Overlay for Image Upload */}
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <svg className="animate-spin h-12 w-12 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ color: primaryColor }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="font-medium text-gray-700">Uploading image...</p>
            <p className="text-sm text-gray-500">Compressing and saving to cloud</p>
          </div>
        </div>
      )}
      
      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed top-20 right-4 bg-white border-l-4 px-4 py-3 rounded shadow-lg z-50 flex items-center gap-3 animate-slide-in-right" style={{ borderColor: primaryColor }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
            <svg className="w-5 h-5" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Profile Saved</p>
            <p className="text-sm text-gray-500">Changes synced to cloud</p>
          </div>
        </div>
      )}
      
      {/* Profile header */}
      <div 
        className="px-4 pt-6 pb-8 text-white"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #00a0e9 100%)` }}
      >
        <div className="flex items-center">
          <div className="relative">
            {profileImage ? (
              <div className="w-20 h-20 rounded-full overflow-hidden bg-white">
                <ImageWithFallback
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <UserIcon className="w-10 h-10" />
              </div>
            )}
            <button 
              className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md"
              onClick={handleProfileImageClick}
            >
              <Camera className="w-4 h-4 text-blue-600" />
            </button>
          </div>
          
          <div className="ml-4 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{userInfo.name}</h1>
              <div className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 text-xs">
                <Cloud className="w-3 h-3" />
                <span>Synced</span>
              </div>
            </div>
            <p className="text-white/80">
              {userType === "customer" && "Car Owner"}
              {userType === "shop" && userInfo.shopName}
              {userType === "insurer" && userInfo.companyName}
            </p>
          </div>
        </div>
      </div>
      
      {/* Account information */}
      <div className="px-4 py-5">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">Account Information</h2>
            <button className="text-blue-600" onClick={() => setShowEditProfile(true)}>
              <Edit className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p>{userInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{userInfo.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p>{userInfo.phone}</p>
            </div>
            {userType === "customer" && userInfo.vehicles.length > 0 && (
              <div>
                <p className="text-sm text-gray-500">Vehicle</p>
                {userInfo.vehicles.map((vehicle, index) => (
                  <p key={index}>{vehicle.year} {vehicle.make} {vehicle.model}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Go to Admin Account Button - Only visible to test accounts */}
        <GoToAdminButton 
          userEmail={userEmail} 
          primaryColor={primaryColor} 
        />
        
        {/* Settings menu */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 hover:bg-gray-50">
            <button className="w-full py-4 px-4 flex items-center justify-between" onClick={() => setShowSettings(true)}>
              <div className="flex items-center">
                <Settings className="w-5 h-5 mr-3 text-gray-500" />
                <span>Settings</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="border-b border-gray-100 hover:bg-gray-50">
            <button className="w-full py-4 px-4 flex items-center justify-between" onClick={() => setShowPayment(true)}>
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 mr-3 text-gray-500" />
                <span>Payment Methods</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {userType === "customer" && (
            <div className="border-b border-gray-100 hover:bg-gray-50">
              <button className="w-full py-4 px-4 flex items-center justify-between" onClick={onViewVehicles}>
                <div className="flex items-center">
                  <CarIcon className="w-5 h-5 mr-3 text-gray-500" />
                  <span>My Vehicles</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          )}

          {userType === "shop" && (
            <div className="border-b border-gray-100 hover:bg-gray-50">
              <button className="w-full py-4 px-4 flex items-center justify-between" onClick={() => setShowShopProfile(true)}>
                <div className="flex items-center">
                  <Settings className="w-5 h-5 mr-3 text-gray-500" />
                  <span>Shop Profile</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          )}

          <div className="border-b border-gray-100 hover:bg-gray-50">
            <button className="w-full py-4 px-4 flex items-center justify-between" onClick={() => setShowHelp(true)}>
              <div className="flex items-center">
                <HelpCircle className="w-5 h-5 mr-3 text-gray-500" />
                <span>Help & Support</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="border-b border-gray-100 hover:bg-red-50">
            <button className="w-full py-4 px-4 flex items-center text-red-600" onClick={() => setShowDeleteAccount(true)}>
              <Trash2 className="w-5 h-5 mr-3" />
              <span>Delete Account</span>
            </button>
          </div>

          <div className="hover:bg-gray-50">
            <button className="w-full py-4 px-4 flex items-center text-red-600" onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-gray-900">Edit Profile</h2>
                <button 
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100" 
                  onClick={() => {
                    setShowEditProfile(false);
                    setEditableName(userName);
                    setEditableEmail(userEmail);
                    setEditablePhone(formatPhoneNumber(userPhone));
                  }}
                  disabled={isSaving}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <img src={LANDING_PAGE_IMAGES.defaultProfile} alt="Default Profile" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all"
                    style={{ backgroundColor: primaryColor }}
                    onClick={handleImageClick}
                  >
                    <Camera className="w-3 h-3 text-white" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Click camera to change photo</p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Name Field */}
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id="edit-name"
                      type="text"
                      value={editableName}
                      onChange={(e) => setEditableName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id="edit-email"
                      type="email"
                      value={editableEmail}
                      onChange={(e) => setEditableEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id="edit-phone"
                      type="tel"
                      value={editablePhone}
                      onChange={(e) => setEditablePhone(formatPhoneNumber(e.target.value))}
                      placeholder="(555) 123-4567"
                      maxLength={14}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl flex gap-3 z-10">
              <button 
                type="button"
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm" 
                onClick={() => {
                  setShowEditProfile(false);
                  setEditableName(userName);
                  setEditableEmail(userEmail);
                  setEditablePhone(formatPhoneNumber(userPhone));
                }}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white flex items-center justify-center disabled:opacity-50 transition-all shadow-md hover:shadow-lg text-sm"
                style={{ backgroundColor: primaryColor }}
                onClick={saveProfileChanges}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Settings</h2>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowSettings(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">Notifications</h3>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Email notifications</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5" style={{ accentColor: primaryColor }} />
                </label>
                <label className="flex items-center justify-between mt-2">
                  <span className="text-sm">SMS notifications</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5" style={{ accentColor: primaryColor }} />
                </label>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">Privacy</h3>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Share data with shops</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5" style={{ accentColor: primaryColor }} />
                </label>
                <label className="flex items-center justify-between mt-2">
                  <span className="text-sm">Show profile to insurers</span>
                  <input type="checkbox" className="w-5 h-5" style={{ accentColor: primaryColor }} />
                </label>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Language</h3>
                <select className="w-full p-2 border border-gray-300 rounded">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button 
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-white rounded flex items-center gap-2"
                style={{ backgroundColor: primaryColor }}
                onClick={() => {
                  setShowSettings(false);
                  alert("Settings saved!");
                }}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Payment Methods</h2>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowPayment(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-500">Expires 12/25</p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:underline">Remove</button>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-gray-600" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 1234</p>
                      <p className="text-sm text-gray-500">Expires 08/26</p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:underline">Remove</button>
                </div>
              </div>
              
              <button 
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 font-medium"
                onClick={() => alert("Add new payment method clicked!")}
              >
                + Add New Payment Method
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                onClick={() => setShowPayment(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shop Profile Modal */}
      {showShopProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Shop Profile</h2>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowShopProfile(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                <input
                  type="text"
                  defaultValue="123 Main St, City, State 12345"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editablePhone}
                  onChange={(e) => setEditablePhone(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
                <input
                  type="text"
                  defaultValue="Mon-Fri: 8AM-6PM, Sat: 9AM-3PM"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
                <textarea
                  defaultValue="ASE Certified, I-CAR Gold Class"
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button 
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                onClick={() => setShowShopProfile(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-white rounded flex items-center gap-2"
                style={{ backgroundColor: primaryColor }}
                onClick={() => {
                  setShowShopProfile(false);
                  alert("Shop profile updated!");
                }}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Help & Support</h2>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowHelp(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">Contact Support</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>(555) 123-4567</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>support@bidondent.com</span>
                  </p>
                </div>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">Frequently Asked Questions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left text-sm text-blue-600 hover:underline">
                    How do I submit a damage report?
                  </button>
                  <button className="w-full text-left text-sm text-blue-600 hover:underline">
                    How long does it take to receive bids?
                  </button>
                  <button className="w-full text-left text-sm text-blue-600 hover:underline">
                    Can I cancel my account?
                  </button>
                  <button className="w-full text-left text-sm text-blue-600 hover:underline">
                    How do I update my payment method?
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Send us a message</h3>
                <textarea
                  placeholder="Describe your issue..."
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={4}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button 
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                onClick={() => setShowHelp(false)}
              >
                Close
              </button>
              <button 
                className="px-4 py-2 text-white rounded"
                style={{ backgroundColor: primaryColor }}
                onClick={() => {
                  setShowHelp(false);
                  alert("Message sent! We'll get back to you soon.");
                }}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Delete Account?</h2>
              </div>
              <button 
                className="text-gray-500 hover:text-gray-700" 
                onClick={() => {
                  setShowDeleteAccount(false);
                  setDeleteConfirmText('');
                }}
                disabled={isDeleting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium mb-2">⚠️ This action cannot be undone!</p>
                <p className="text-sm text-red-700">Deleting your account will permanently remove:</p>
                <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                  <li>Your profile and account information</li>
                  <li>All your vehicles and damage reports</li>
                  <li>All bids and repair history</li>
                  <li>Access to the Bidondent platform</li>
                </ul>
              </div>

              <div>
                <label htmlFor="delete-confirm" className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                </label>
                <input
                  id="delete-confirm"
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={isDeleting}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                onClick={() => {
                  setShowDeleteAccount(false);
                  setDeleteConfirmText('');
                }}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText.toLowerCase() !== 'delete'}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Forever
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}