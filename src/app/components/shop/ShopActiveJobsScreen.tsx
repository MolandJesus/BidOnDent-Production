import { useState } from "react";
import { Search, MapPin, Calendar, Phone, Mail, MessageSquare, CheckCircle, Clock, Wrench, Package, ChevronRight, Star, AlertCircle, User } from "lucide-react";

type ShopActiveJobsScreenProps = {
  primaryColor?: string;
  secondaryColor?: string;
  onUpdateJobStatus?: (jobId: number, status: string) => void;
};

export default function ShopActiveJobsScreen({
  primaryColor = "#003d82",
  secondaryColor = "#00a0e9",
  onUpdateJobStatus
}: ShopActiveJobsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "in-progress" | "awaiting-parts" | "completed">("all");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  // Sample active jobs data - in production, this would come from Supabase
  const sampleJobs = [
    {
      id: 101,
      customerName: "Sarah Johnson",
      customerEmail: "sarah.j@email.com",
      customerPhone: "(555) 123-4567",
      vehicle: "2022 Honda Accord",
      damageType: "Front Bumper Repair",
      bidAmount: 1250,
      startDate: "Dec 18, 2026",
      estimatedCompletion: "Dec 22, 2026",
      status: "in-progress",
      progress: 60,
      tasks: [
        { id: 1, name: "Initial Assessment", completed: true },
        { id: 2, name: "Parts Ordered", completed: true },
        { id: 3, name: "Bumper Removal", completed: true },
        { id: 4, name: "Repair & Paint", completed: false },
        { id: 5, name: "Reassembly", completed: false },
        { id: 6, name: "Final Inspection", completed: false }
      ],
      insuranceClaim: true,
      insuranceCompany: "State Farm",
      claimNumber: "SF-2026-12345",
      notes: "Customer requested metallic silver paint match. Parts arrived on schedule."
    },
    {
      id: 102,
      customerName: "Michael Chen",
      customerEmail: "m.chen@email.com",
      customerPhone: "(555) 234-5678",
      vehicle: "2020 Toyota Camry",
      damageType: "Side Panel & Door Replacement",
      bidAmount: 2100,
      startDate: "Dec 15, 2026",
      estimatedCompletion: "Dec 25, 2026",
      status: "awaiting-parts",
      progress: 30,
      tasks: [
        { id: 1, name: "Initial Assessment", completed: true },
        { id: 2, name: "Parts Ordered", completed: true },
        { id: 3, name: "Waiting for Door Panel", completed: false },
        { id: 4, name: "Paint & Repair", completed: false },
        { id: 5, name: "Final Assembly", completed: false }
      ],
      insuranceClaim: false,
      notes: "OEM door panel on backorder. Expected delivery Dec 23."
    },
    {
      id: 103,
      customerName: "Emily Rodriguez",
      customerEmail: "emily.r@email.com",
      customerPhone: "(555) 345-6789",
      vehicle: "2019 Ford F-150",
      damageType: "Rear Hatch & Frame Repair",
      bidAmount: 3500,
      startDate: "Dec 20, 2026",
      estimatedCompletion: "Dec 28, 2026",
      status: "pending",
      progress: 10,
      tasks: [
        { id: 1, name: "Initial Assessment", completed: true },
        { id: 2, name: "Customer Approval", completed: false },
        { id: 3, name: "Parts Ordering", completed: false },
        { id: 4, name: "Frame Straightening", completed: false },
        { id: 5, name: "Hatch Replacement", completed: false }
      ],
      insuranceClaim: true,
      insuranceCompany: "Geico",
      claimNumber: "GC-2026-67890",
      notes: "Waiting for insurance adjuster approval for frame work."
    },
    {
      id: 104,
      customerName: "David Kim",
      customerEmail: "d.kim@email.com",
      customerPhone: "(555) 456-7890",
      vehicle: "2021 BMW 330i",
      damageType: "Front End Collision Repair",
      bidAmount: 5200,
      startDate: "Dec 10, 2026",
      estimatedCompletion: "Dec 21, 2026",
      status: "in-progress",
      progress: 85,
      tasks: [
        { id: 1, name: "Damage Assessment", completed: true },
        { id: 2, name: "Parts Acquisition", completed: true },
        { id: 3, name: "Hood Replacement", completed: true },
        { id: 4, name: "Headlight Assembly", completed: true },
        { id: 5, name: "Paint & Finish", completed: true },
        { id: 6, name: "Quality Check", completed: false }
      ],
      insuranceClaim: true,
      insuranceCompany: "Allstate",
      claimNumber: "AL-2026-11223",
      notes: "Premium paint required. Customer will pick up Dec 21."
    }
  ];

  const filteredJobs = sampleJobs.filter(job => {
    const matchesSearch = job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.damageType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "in-progress": return "bg-blue-100 text-blue-700 border-blue-200";
      case "awaiting-parts": return "bg-orange-100 text-orange-700 border-orange-200";
      case "completed": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "in-progress": return <Wrench className="w-4 h-4" />;
      case "awaiting-parts": return <Package className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>Active Jobs</h1>
          
          {/* Search */}
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by customer, vehicle, or job type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: "all", label: "All Jobs" },
              { id: "pending", label: "Pending" },
              { id: "in-progress", label: "In Progress" },
              { id: "awaiting-parts", label: "Awaiting Parts" },
              { id: "completed", label: "Completed" }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id as any)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterStatus === filter.id
                    ? "text-white"
                    : "bg-white border border-gray-300 text-gray-700"
                }`}
                style={filterStatus === filter.id ? { backgroundColor: primaryColor } : {}}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="px-4 py-4 space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No active jobs found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Job Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-500">Job #{job.id}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(job.status)} flex items-center gap-1`}>
                        {getStatusIcon(job.status)}
                        {formatStatus(job.status)}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">{job.customerName}</h3>
                    <p className="text-sm text-gray-600">{job.vehicle}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{ color: primaryColor }}>${job.bidAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Started {job.startDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Due {job.estimatedCompletion}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-4 py-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold" style={{ color: primaryColor }}>{job.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300 rounded-full"
                    style={{ width: `${job.progress}%`, backgroundColor: primaryColor }}
                  />
                </div>
              </div>

              {/* Tasks Checklist */}
              <div className="px-4 py-3 border-t border-gray-100">
                <h4 className="font-semibold text-sm mb-2 text-gray-700">Tasks</h4>
                <div className="space-y-2">
                  {job.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2">
                      <div 
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          task.completed 
                            ? "border-green-500 bg-green-500" 
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <span className={`text-sm ${task.completed ? "text-gray-500 line-through" : "text-gray-700"}`}>
                        {task.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insurance & Notes */}
              <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
                {job.insuranceClaim && (
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-900">Insurance Claim</span>
                    </div>
                    <p className="text-sm text-blue-700 ml-6">
                      {job.insuranceCompany} - Claim #{job.claimNumber}
                    </p>
                  </div>
                )}
                {job.notes && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Notes:</p>
                    <p className="text-sm text-gray-700">{job.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <a
                    href={`tel:${job.customerPhone}`}
                    className="flex flex-col items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-xs">Call</span>
                  </a>
                  <a
                    href={`mailto:${job.customerEmail}`}
                    className="flex flex-col items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-xs">Email</span>
                  </a>
                  <button
                    className="flex flex-col items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">Message</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedJob(job)}
                  className="w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                >
                  <User className="w-5 h-5" />
                  View Full Details
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Job Detail Modal (placeholder for future expansion) */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Job #{selectedJob.id}</h2>
                  <p className="text-gray-600">{selectedJob.damageType}</p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <p className="text-sm"><strong>Name:</strong> {selectedJob.customerName}</p>
                  <p className="text-sm"><strong>Email:</strong> {selectedJob.customerEmail}</p>
                  <p className="text-sm"><strong>Phone:</strong> {selectedJob.customerPhone}</p>
                  <p className="text-sm"><strong>Vehicle:</strong> {selectedJob.vehicle}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Job Details</h3>
                  <p className="text-sm"><strong>Bid Amount:</strong> ${selectedJob.bidAmount.toLocaleString()}</p>
                  <p className="text-sm"><strong>Start Date:</strong> {selectedJob.startDate}</p>
                  <p className="text-sm"><strong>Estimated Completion:</strong> {selectedJob.estimatedCompletion}</p>
                  <p className="text-sm"><strong>Status:</strong> {formatStatus(selectedJob.status)}</p>
                </div>

                {selectedJob.insuranceClaim && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold mb-2 text-blue-900">Insurance Information</h3>
                    <p className="text-sm text-blue-800"><strong>Company:</strong> {selectedJob.insuranceCompany}</p>
                    <p className="text-sm text-blue-800"><strong>Claim #:</strong> {selectedJob.claimNumber}</p>
                  </div>
                )}

                <button
                  onClick={() => setSelectedJob(null)}
                  className="w-full py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add X icon import
function X({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
