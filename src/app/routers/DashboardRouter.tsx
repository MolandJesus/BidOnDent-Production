import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

// Import all screens
import HomeScreen from "../../../codelayer/HomeScreen";
import ReportScreen from "../../../codelayer/ReportScreen";
import BidsScreen from "../../../codelayer/BidsScreen";
import AccountScreen from "../../../codelayer/AccountScreen";
import ShopRequestsScreen from "../components/ShopRequestsScreen";
import ShopActiveJobsScreen from "../components/ShopActiveJobsScreen";
import InsurerClaimsScreen from "../components/InsurerClaimsScreen";
import InsurerPartnerShopsScreen from "../components/InsurerPartnerShopsScreen";
import ReportsListScreen from "../components/ReportsListScreen";
import ReportDetailScreen from "../components/ReportDetailScreen";
import InsurerConnectionScreen from "../components/InsurerConnectionScreen";
import LikedShopsScreen from "../components/LikedShopsScreen";
import VehicleProfileScreen from "../components/VehicleProfileScreen";
import ShopDirectoryScreen from "../components/ShopDirectoryScreen";
import InsurerNewClaimScreen from "../components/InsurerNewClaimScreen";
import InsuranceCompaniesScreen from "../components/InsuranceCompaniesScreen";
import CompetitorAnalysisScreen from "../components/CompetitorAnalysisScreen";
import AdminDashboard from "../components/AdminDashboard";
import DemoAccountSwitcher from "../components/DemoAccountSwitcher";
import { SEED_DAMAGE_REPORTS } from "../constants";
import { isAdmin } from "../utils/adminCheck";

interface DashboardRouterProps {
  // Navigation state
  viewMode: string;
  currentTab: string;
  
  // User data
  userType: "customer" | "shop" | "insurer";
  userInfo: {
    name: string;
    email: string;
    profileImage?: string;
  };
  userPhone: string;
  reports: any[];
  vehicles: any[];
  bids: any[];
  shops: any[];
  activities?: any[];
  photoStorage: { [key: string]: string[] };
  selectedReportId: string | null;
  demoMode?: boolean;
  originalAccountType?: "customer" | "shop" | "insurer" | null;
  
  // Styling
  primaryColor: string;
  secondaryColor: string;
  
  // Handlers
  onStartReport: () => void;
  onSubmitBid: (reportId: string, bidAmount: number, estimatedDays: number, description: string) => void;
  onViewAllReports: () => void;
  onConnectInsurance: () => void;
  onViewLikedShops: () => void;
  onViewBids: () => void;
  onViewRequests: () => void;
  onViewJobs: () => void;
  onViewClaims: () => void;
  onViewShops: () => void;
  onCreateNewClaim: () => void;
  onViewCompetitors?: () => void;
  onViewInsurers?: () => void;
  onSelectReport: (reportId: string) => void;
  onBack: () => void;
  onViewModeChange: (mode: string) => void;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onEnterDemoMode?: () => void;
  onEnableDemoMode?: (accountType: "customer" | "shop" | "insurer") => void;
  onExitDemoMode?: () => void;
  
  // Account-specific handlers
  onProfileUpdate: (info: { name: string; email: string; phone?: string; profileImage?: string }) => void;
  onPasswordChange: (passwords: { current: string; new: string }) => void;
  onDeleteAccount: () => void;
  onSaveVehicles: (vehicles: any[]) => void;
  onSaveVehicle: (vehicle: any) => void;
  hasSeenPhotoGuide: boolean;
  onPhotoGuideComplete: () => void;
  onReportSubmit: (report: any) => void;
}

export default function DashboardRouter({
  viewMode,
  currentTab,
  userType,
  userInfo,
  userPhone,
  reports,
  vehicles,
  bids,
  shops,
  activities,
  photoStorage,
  selectedReportId,
  primaryColor,
  secondaryColor,
  onStartReport,
  onSubmitBid,
  onViewAllReports,
  onConnectInsurance,
  onViewLikedShops,
  onViewBids,
  onViewRequests,
  onViewJobs,
  onViewClaims,
  onViewShops,
  onCreateNewClaim,
  onViewCompetitors,
  onViewInsurers,
  onSelectReport,
  onBack,
  onViewModeChange,
  onTabChange,
  onLogout,
  onEnterDemoMode,
  onEnableDemoMode,
  onExitDemoMode,
  onProfileUpdate,
  onPasswordChange,
  onDeleteAccount,
  onSaveVehicles,
  onSaveVehicle,
  hasSeenPhotoGuide,
  onPhotoGuideComplete,
  onReportSubmit,
  demoMode,
  originalAccountType
}: DashboardRouterProps) {
  
  // Scroll to top whenever view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [viewMode, currentTab]);
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <AnimatePresence mode="wait">
        {/* Dashboard Home Screen */}
        {viewMode === "dashboard" && currentTab === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <HomeScreen 
              userType={userType} 
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              onStartReport={onStartReport}
              onViewAllReports={onViewAllReports}
              onConnectInsurance={onConnectInsurance}
              onViewLikedShops={onViewLikedShops}
              onViewBids={onViewBids}
              onViewRequests={onViewRequests}
              onViewJobs={onViewJobs}
              onViewClaims={onViewClaims}
              onViewShops={onViewShops}
              onCreateNewClaim={onCreateNewClaim}
              onViewCompetitors={onViewCompetitors}
              onViewInsurers={onViewInsurers}
              onEnterDemoMode={onEnterDemoMode}
              demoMode={demoMode}
              originalAccountType={originalAccountType || undefined}
              onExitDemoMode={onExitDemoMode}
              activities={activities || []}
              reports={
                // For shops and insurers, show seed reports (available requests/claims)
                // For customers, show only their own reports
                userType === 'shop' || userType === 'insurer'
                  ? SEED_DAMAGE_REPORTS
                  : reports.map(report => ({
                      ...report,
                      photos: photoStorage[report.id] || []
                    }))
              }
            />
          </motion.div>
        )}
        
        {/* Customer: Report Screen */}
        {viewMode === "dashboard" && currentTab === "report" && userType === "customer" && (
          <motion.div
            key="report"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ReportScreen
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              userType={userType}
              vehicles={vehicles}
              onSaveVehicle={onSaveVehicle}
              hasSeenPhotoGuide={hasSeenPhotoGuide}
              onPhotoGuideComplete={onPhotoGuideComplete}
              onReportSubmit={onReportSubmit}
              onViewReports={() => {
                // Navigate to "reports-list" viewMode which shows the reports list
                onViewModeChange("reports-list");
              }}
              onBackToDashboard={() => {
                // Navigate back to home tab on dashboard
                onTabChange("home");
                onViewModeChange("dashboard");
              }}
            />
          </motion.div>
        )}
        
        {/* Customer: Bids Screen */}
        {viewMode === "dashboard" && currentTab === "bids" && userType === "customer" && (
          <motion.div
            key="bids"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <BidsScreen
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              userType={userType}
              onBack={() => {
                onTabChange("home");
                onViewModeChange("dashboard");
              }}
            />
          </motion.div>
        )}
        
        {/* Shop: Requests Screen */}
        {viewMode === "dashboard" && currentTab === "requests" && userType === "shop" && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ShopRequestsScreen
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              onSubmitBid={(requestId, bidAmount) => {
                // Find the report to get more details
                const report = reports.find(r => r.id === requestId.toString());
                if (report) {
                  // Call the bid submission handler with all required parameters
                  // For now, using default values for estimated days and description
                  onSubmitBid(
                    requestId.toString(),
                    bidAmount,
                    3, // Default 3 days
                    "Professional repair service with quality guarantee" // Default description
                  );
                }
              }}
            />
          </motion.div>
        )}
        
        {/* Shop: Active Jobs Screen */}
        {viewMode === "dashboard" && currentTab === "jobs" && userType === "shop" && (
          <motion.div
            key="jobs"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ShopActiveJobsScreen
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </motion.div>
        )}
        
        {/* Insurer: Claims Screen */}
        {viewMode === "dashboard" && currentTab === "claims" && userType === "insurer" && (
          <motion.div
            key="claims"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <InsurerClaimsScreen
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              onBack={onBack}
              onViewModeChange={onViewModeChange}
              onTabChange={onTabChange}
            />
          </motion.div>
        )}
        
        {/* Insurer: Partner Shops Screen */}
        {viewMode === "dashboard" && currentTab === "shops" && userType === "insurer" && (
          <motion.div
            key="shops"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <InsurerPartnerShopsScreen
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </motion.div>
        )}
        
        {/* Account Screen (All Users) */}
        {viewMode === "dashboard" && currentTab === "account" && (
          <motion.div
            key="account"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <AccountScreen
              userType={userType}
              primaryColor={primaryColor}
              userName={userInfo.name}
              userEmail={userInfo.email}
              userPhone={userPhone}
              profileImage={userInfo.profileImage}
              vehicles={vehicles}
              reports={reports}
              onLogout={onLogout}
              onSaveProfile={async (data) => {
                // Update user info with new data
                onProfileUpdate({
                  name: data.name,
                  email: data.email,
                  phone: data.phone,
                  profileImage: data.profileImage  // Use new profile image directly
                });
              }}
              onViewVehicles={() => {
                // Navigate to vehicle profile screen
                onViewModeChange("vehicles");
              }}
              onViewReport={(reportId) => {
                onSelectReport(reportId);
                onViewModeChange("report-detail");
              }}
            />
          </motion.div>
        )}
        
        {/* Admin Dashboard Screen (Only for Admin) */}
        {viewMode === "dashboard" && currentTab === "admin" && isAdmin(userInfo.email) && (
          <motion.div
            key="admin"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <AdminDashboard
              primaryColor={primaryColor}
              adminEmail={userInfo.email}
            />
          </motion.div>
        )}
        
        {/* Reports List Screen */}
        {viewMode === "reports-list" && (
          <motion.div
            key="reports-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ReportsListScreen
              reports={reports.map(report => ({
                ...report,
                photos: photoStorage[report.id] || []
              }))}
              onBack={() => onViewModeChange("dashboard")}
              onSelectReport={(reportId) => {
                onSelectReport(reportId);
                onViewModeChange("report-detail");
              }}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </motion.div>
        )}
        
        {/* Report Detail Screen */}
        {viewMode === "report-detail" && selectedReportId && (
          <motion.div
            key="report-detail"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ReportDetailScreen
              report={{
                ...reports.find(r => r.id === selectedReportId)!,
                photos: photoStorage[selectedReportId] || []
              }}
              onBack={() => onViewModeChange("reports-list")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </motion.div>
        )}
        
        {/* Insurer Connect Screen */}
        {viewMode === "insurer-connect" && (
          <motion.div
            key="insurer-connect"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <InsurerConnectionScreen
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </motion.div>
        )}
        
        {/* Liked Shops Screen */}
        {viewMode === "liked-shops" && (
          <motion.div
            key="liked-shops"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <LikedShopsScreen
              shops={shops}
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </motion.div>
        )}
        
        {/* Vehicles Screen */}
        {viewMode === "vehicles" && (
          <motion.div
            key="vehicles"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <VehicleProfileScreen
              vehicles={vehicles}
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              onSaveVehicles={onSaveVehicles}
            />
          </motion.div>
        )}
        
        {/* Shop Directory Screen */}
        {viewMode === "shop-directory" && (
          <motion.div
            key="shop-directory"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ShopDirectoryScreen
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </motion.div>
        )}
        
        {/* Insurer New Claim Screen */}
        {viewMode === "new-claim" && userType === "insurer" && (
          <motion.div
            key="new-claim"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <InsurerNewClaimScreen
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              onBack={() => onViewModeChange("dashboard")}
              onComplete={() => {
                onViewModeChange("dashboard");
                onTabChange("claims");
              }}
            />
          </motion.div>
        )}
        
        {/* Insurance Companies Screen */}
        {viewMode === "insurance-companies" && (
          <motion.div
            key="insurance-companies"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <InsuranceCompaniesScreen
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              userType={userType}
            />
          </motion.div>
        )}
        
        {/* Competitor Analysis Screen */}
        {viewMode === "competitor-analysis" && (
          <motion.div
            key="competitor-analysis"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <CompetitorAnalysisScreen
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </motion.div>
        )}
        
        {/* Demo Account Switcher */}
        {viewMode === "demo-switcher" && (
          <motion.div
            key="demo-switcher"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <DemoAccountSwitcher
              currentAccountType={userType}
              onSelectAccountType={(type) => {
                if (onEnableDemoMode) {
                  onEnableDemoMode(type);
                }
              }}
              onExitDemo={() => {
                if (onExitDemoMode) {
                  onExitDemoMode();
                } else {
                  onViewModeChange("dashboard");
                }
              }}
              primaryColor={primaryColor}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}