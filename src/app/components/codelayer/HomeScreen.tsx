import { useState } from "react";
import { ChevronRight, Camera, FileCheck, Wrench, Clock, DollarSign, Shield, ArrowRight, FileText, Star, Store, TrendingUp, Building2, Sparkles, Eye } from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";

type HomeScreenProps = {
  userType: string;
  primaryColor?: string;
  secondaryColor?: string;
  onStartReport: () => void;
  onViewAllReports: () => void;
  onConnectInsurance?: () => void;
  onViewLikedShops?: () => void;
  onViewBids?: () => void;
  onViewRequests?: () => void;
  onViewJobs?: () => void;
  onViewClaims?: () => void;
  onViewShops?: () => void;
  onCreateNewClaim?: () => void;
  onViewCompetitors?: () => void;
  onViewInsurers?: () => void;
  onEnterDemoMode?: () => void;
  demoMode?: boolean;
  originalAccountType?: string;
  onExitDemoMode?: () => void;
  reports?: any[];
  activities?: any[];
};

export default function HomeScreen({
  userType = "customer",
  primaryColor = "#0056b3",
  secondaryColor = "#00a0e9",
  onStartReport,
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
  onEnterDemoMode,
  demoMode,
  originalAccountType,
  onExitDemoMode,
  reports = [],
  activities = []
}: HomeScreenProps) {
  return (
    <div className="pb-20">
      {/* Hero Banner */}
      <div 
        className="px-4 py-6 text-white relative" 
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
      >
        <h1 className="text-2xl font-bold mb-2">Welcome to BidOnDent</h1>
        <p className="text-white text-opacity-90 mb-4">
          {userType === "customer" && "Get repair estimates without the hassle"}
          {userType === "shop" && "Access qualified repair opportunities"}
          {userType === "insurer" && "Streamline your claims process"}
        </p>
        
        {/* Action Buttons Container */}
        <div className="flex items-center gap-2">
          <button 
            className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium flex items-center"
            onClick={onStartReport}
          >
            {userType === "customer" && (
              <>Report Damage <ChevronRight className="w-5 h-5 ml-1" /></>
            )}
            {userType === "shop" && (
              <>View Requests <ChevronRight className="w-5 h-5 ml-1" /></>
            )}
            {userType === "insurer" && (
              <>Start New Claim <ChevronRight className="w-5 h-5 ml-1" /></>
            )}
          </button>
          
          {/* Exit Demo Mode Button (next to action button on mobile) */}
          {demoMode && onExitDemoMode && userType !== originalAccountType && (
            <button
              onClick={onExitDemoMode}
              className="px-2 py-2 sm:px-3 sm:py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 transition-all duration-200 hover:scale-105 active:scale-95 border border-white/30 flex-shrink-0"
            >
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 rotate-180 flex-shrink-0" />
              <span className="hidden sm:inline">Exit Demo View</span>
              <span className="sm:hidden">Exit Demo</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="px-4 py-5">
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {userType === "customer" && (
            <>
              <button
                className="bg-white rounded-lg p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 active:scale-95 active:shadow-sm group"
                onClick={onStartReport}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm transition-all duration-300 ease-out group-hover:shadow-lg group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    transition: 'background 0.3s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #002a5c 0%, #007ab3 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
                  }}
                >
                  <Camera className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <span className="text-sm font-medium">Report Damage</span>
              </button>
              <button
                className="bg-white rounded-lg p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 active:scale-95 active:shadow-sm group"
                onClick={onViewBids}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm transition-all duration-300 ease-out group-hover:shadow-lg group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    transition: 'background 0.3s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #002a5c 0%, #007ab3 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
                  }}
                >
                  <FileCheck className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <span className="text-sm font-medium">View Bids</span>
              </button>
              <button
                className="bg-white rounded-lg p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 active:scale-95 active:shadow-sm group"
                onClick={onConnectInsurance}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm transition-all duration-300 ease-out group-hover:shadow-lg group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    transition: 'background 0.3s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #002a5c 0%, #007ab3 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
                  }}
                >
                  <Shield className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <span className="text-sm font-medium">Connect Insurance</span>
              </button>
              <button
                className="bg-white rounded-lg p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 active:scale-95 active:shadow-sm group"
                onClick={onViewLikedShops}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm transition-all duration-300 ease-out group-hover:shadow-lg group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    transition: 'background 0.3s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #002a5c 0%, #007ab3 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
                  }}
                >
                  <Wrench className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <span className="text-sm font-medium">Liked Shops</span>
              </button>
            </>
          )}
          
          {userType === "shop" && (
            <>
              <button
                className="bg-white rounded-lg p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 active:scale-95 active:shadow-sm group"
                onClick={onViewRequests}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm transition-all duration-300 ease-out group-hover:shadow-lg group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    transition: 'background 0.3s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #002a5c 0%, #007ab3 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
                  }}
                >
                  <FileCheck className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <span className="text-sm font-medium">Open Requests</span>
              </button>
              <button
                className="bg-white rounded-lg p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 active:scale-95 active:shadow-sm group"
                onClick={onViewJobs}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm transition-all duration-300 ease-out group-hover:shadow-lg group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    transition: 'background 0.3s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #002a5c 0%, #007ab3 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
                  }}
                >
                  <Wrench className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <span className="text-sm font-medium">Active Repairs</span>
              </button>
              <button
                className="bg-white rounded-lg p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 active:scale-95 active:shadow-sm group"
                onClick={onViewCompetitors}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm transition-all duration-300 ease-out group-hover:shadow-lg group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    transition: 'background 0.3s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #002a5c 0%, #007ab3 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
                  }}
                >
                  <TrendingUp className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <span className="text-sm font-medium">Competitor Analysis</span>
              </button>
              <button
                className="bg-white rounded-lg p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 active:scale-95 active:shadow-sm group"
                onClick={onViewInsurers}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm transition-all duration-300 ease-out group-hover:shadow-lg group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    transition: 'background 0.3s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #002a5c 0%, #007ab3 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
                  }}
                >
                  <Building2 className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <span className="text-sm font-medium">Browse Insurers</span>
              </button>
            </>
          )}
          
          {userType === "insurer" && (
            <>
              <button
                className="bg-white rounded-lg p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 active:scale-95 active:shadow-sm group"
                onClick={onViewClaims}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm transition-all duration-300 ease-out group-hover:shadow-lg group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    transition: 'background 0.3s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #002a5c 0%, #007ab3 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
                  }}
                >
                  <FileCheck className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <span className="text-sm font-medium">View All Claims</span>
              </button>
              <button
                className="bg-white rounded-lg p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 active:scale-95 active:shadow-sm group"
                onClick={onCreateNewClaim}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm transition-all duration-300 ease-out group-hover:shadow-lg group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    transition: 'background 0.3s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #002a5c 0%, #007ab3 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
                  }}
                >
                  <FileText className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <span className="text-sm font-medium">Create New Claim</span>
              </button>
              <button
                className="bg-white rounded-lg p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 active:scale-95 active:shadow-sm group"
                onClick={onViewShops}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm transition-all duration-300 ease-out group-hover:shadow-lg group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    transition: 'background 0.3s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #002a5c 0%, #007ab3 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
                  }}
                >
                  <Store className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <span className="text-sm font-medium">Partnered Shops</span>
              </button>
              <button
                className="bg-white rounded-lg p-4 flex flex-col items-center justify-center shadow-sm border border-gray-100 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 active:scale-95 active:shadow-sm group"
                onClick={onViewShops}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm transition-all duration-300 ease-out group-hover:shadow-lg group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    transition: 'background 0.3s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #002a5c 0%, #007ab3 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
                  }}
                >
                  <Clock className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <span className="text-sm font-medium">Pending Reviews</span>
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="px-4 py-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Recent Activity</h2>
          {((userType === "customer" || userType === "shop") && reports.length > 0) && (
            <button 
              className="text-blue-600 text-sm font-medium flex items-center"
              onClick={onViewAllReports}
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          )}
          {userType === "insurer" && reports.length > 0 && (
            <button 
              className="text-blue-600 text-sm font-medium flex items-center"
              onClick={onViewClaims}
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
        
        {reports.length === 0 ? (
          <div className="bg-white rounded-lg p-5 shadow-sm mb-4 border border-gray-100">
            <div className="flex items-start">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              >
                {userType === "customer" && <Camera className="w-5 h-5 text-white" />}
                {userType === "shop" && <FileCheck className="w-5 h-5 text-white" />}
                {userType === "insurer" && <Shield className="w-5 h-5 text-white" />}
              </div>
              <div className="flex-1">
                <div className="font-medium mb-1">
                  {userType === "customer" && "No recent activity"}
                  {userType === "shop" && "No recent requests"}
                  {userType === "insurer" && "No recent claims"}
                </div>
                <p className="text-sm text-gray-500">
                  {userType === "customer" && "When you report damage or receive bids, they will appear here"}
                  {userType === "shop" && "New repair requests will appear here"}
                  {userType === "insurer" && "New claims submissions will appear here"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.slice(0, 3).map((report) => (
              <div 
                key={report.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-start gap-3"
              >
                {/* Report Thumbnail */}
                {report.photos && report.photos.length > 0 && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <ImageWithFallback
                      src={report.photos[0]}
                      alt={userType === "insurer" ? "Claim photo" : "Damage photo"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Report/Claim Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium">
                      {userType === "insurer" && report.claimNumber && (
                        <>Claim #{report.claimNumber}</>
                      )}
                      {userType !== "insurer" && (
                        <>{report.vehicle.year} {report.vehicle.make} {report.vehicle.model}</>
                      )}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.status === "pending" 
                        ? "bg-yellow-100 text-yellow-700"
                        : report.status === "active" || report.status === "in-review"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  {userType === "insurer" && report.policyholder && (
                    <p className="text-sm text-gray-600 mb-1">
                      Policyholder: {report.policyholder}
                    </p>
                  )}
                  {userType === "insurer" && report.vehicle && (
                    <p className="text-sm text-gray-500 mb-2">
                      {report.vehicle.year} {report.vehicle.make} {report.vehicle.model}
                    </p>
                  )}
                  {userType !== "insurer" && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {report.description || `Damage to ${report.damageArea}`}
                    </p>
                  )}
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{new Date(report.submittedAt).toLocaleDateString()}</span>
                    {userType !== "insurer" && report.bidsCount > 0 && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="font-medium text-blue-600">{report.bidsCount} bids</span>
                      </>
                    )}
                    {userType === "insurer" && report.estimatedCost && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="font-medium text-blue-600">${report.estimatedCost.toLocaleString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Quick Stats Section */}
      <div className="px-4 py-5">
        <h2 className="text-lg font-bold mb-4">Your Activity</h2>
        
        {userType === "customer" && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              >
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">{reports.length}</div>
              <p className="text-gray-600 text-xs">Reports</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              >
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">$0</div>
              <p className="text-gray-600 text-xs">Saved</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              >
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">0</div>
              <p className="text-gray-600 text-xs">Pending</p>
            </div>
          </div>
        )}
        
        {userType === "shop" && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              >
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">12</div>
              <p className="text-gray-600 text-xs">New Requests</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              >
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">5</div>
              <p className="text-gray-600 text-xs">Active Jobs</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              >
                <Star className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-gray-600 text-xs">Rating</p>
            </div>
          </div>
        )}
        
        {userType === "insurer" && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              >
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">48</div>
              <p className="text-gray-600 text-xs">Active Claims</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              >
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">15</div>
              <p className="text-gray-600 text-xs">Partner Shops</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              >
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold">2.5</div>
              <p className="text-gray-600 text-xs">Avg Days</p>
            </div>
          </div>
        )}
      </div>

      {/* Demo Mode Section */}
      {onEnterDemoMode && (
        <div className="px-4 py-5">
          <h2 className="text-lg font-bold mb-3">Demo Mode</h2>
          <button
            onClick={onEnterDemoMode}
            className="w-full bg-white hover:bg-gray-50 rounded-xl p-6 shadow-sm border-2 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 active:scale-98 relative overflow-hidden group"
            style={{ borderColor: `${primaryColor}20` }}
          >
            {/* Subtle gradient overlay on hover */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            ></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="p-3 rounded-lg shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
                >
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900 mb-1">Experience All Account Types</div>
                  <p className="text-sm text-gray-600">
                    Switch between Customer, Shop, and Insurer views
                  </p>
                </div>
              </div>
              <ChevronRight 
                className="w-5 h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" 
                style={{ color: primaryColor }}
              />
            </div>
          </button>
          <p className="text-xs text-gray-500 mt-3 text-center flex items-center justify-center gap-1">
            <Eye className="w-3 h-3" />
            Preview how each user type experiences the platform
          </p>
        </div>
      )}
    </div>
  );
}