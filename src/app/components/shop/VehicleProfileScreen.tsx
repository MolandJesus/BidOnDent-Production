import { useState } from "react";
import { ArrowLeft, Car, Plus, Edit2, Trash2 } from "lucide-react";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { Vehicle } from "../../types";
import { useNotifications } from "../../features/notifications/NotificationContext";

type VehicleProfileScreenProps = {
  onBack: () => void;
  vehicles: Vehicle[];
  onSaveVehicles: (vehicles: Vehicle[]) => void | Promise<void>;
  primaryColor?: string;
  appearanceMode?: DashboardAppearanceMode;
};

export default function VehicleProfileScreen({
  onBack,
  vehicles: initialVehicles,
  onSaveVehicles,
  primaryColor = "#003d82",
  appearanceMode = "map-dark",
}: VehicleProfileScreenProps) {
  const isLight = appearanceMode === "light";
  const notifications = useNotifications();
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<{
    id: string | undefined;
    index: number;
  } | null>(null);
  const [formData, setFormData] = useState<{
    year: string;
    make: string;
    model: string;
    vin: string;
    color: string;
    licensePlate: string;
  }>({
    year: "",
    make: "",
    model: "",
    vin: "",
    color: "",
    licensePlate: "",
  });

  const handleEdit = (vehicle: Vehicle, index: number) => {
    setFormData({
      year: vehicle.year || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      vin: vehicle.vin || "",
      color: vehicle.color || "",
      licensePlate: vehicle.licensePlate || "",
    });
    setEditingId(vehicle.id);
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const handleDeleteRequest = (id: string | undefined, index: number) => {
    setDeletingVehicle({ id, index });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingVehicle) return;
    const { id, index } = deletingVehicle;
    const previousVehicles = [...vehicles];
    const updatedVehicles = id
      ? vehicles.filter((v) => v.id !== id)
      : vehicles.filter((_, i) => i !== index);
    setVehicles(updatedVehicles);
    setDeletingVehicle(null);
    try {
      await onSaveVehicles(updatedVehicles);
    } catch {
      setVehicles(previousVehicles);
      notifications.addNotification({
        type: "error",
        title: "Delete failed",
        message: "Could not delete vehicle. Please try again.",
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeletingVehicle(null);
  };

  const handleSave = async () => {
    if (!formData.year || !formData.make || !formData.model) {
      setFormError("Please fill in required fields: Year, Make, and Model");
      return;
    }
    setFormError(null);

    let updatedVehicles;
    if (editingId || editingIndex !== null) {
      // Update existing vehicle
      if (editingId) {
        // Update by ID (vehicle has UUID)
        updatedVehicles = vehicles.map((v) =>
          v.id === editingId ? ({ ...formData, id: editingId } as Vehicle) : v
        );
      } else {
        // Update by index (vehicle doesn't have UUID yet)
        updatedVehicles = vehicles.map((v, i) => (i === editingIndex ? (formData as Vehicle) : v));
      }
    } else {
      // Create new vehicle without ID - let database generate UUID
      const newVehicle: Partial<Vehicle> = { ...formData };
      // Remove id field if it exists
      delete newVehicle.id;
      updatedVehicles = [...vehicles, newVehicle as Vehicle];
    }

    const previousVehicles = [...vehicles];
    setVehicles(updatedVehicles);
    setShowAddForm(false);
    setEditingId(null);
    setEditingIndex(null);
    setFormData({
      year: "",
      make: "",
      model: "",
      vin: "",
      color: "",
      licensePlate: "",
    });
    try {
      await onSaveVehicles(updatedVehicles);
    } catch {
      setVehicles(previousVehicles);
      notifications.addNotification({
        type: "error",
        title: "Save failed",
        message: "Could not save vehicle. Please try again.",
      });
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setEditingIndex(null);
    setFormData({
      year: "",
      make: "",
      model: "",
      vin: "",
      color: "",
      licensePlate: "",
    });
  };

  const labelClass = `block text-sm font-medium mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`;
  const inputClass = `w-full px-3 py-3 border rounded-md ${isLight ? "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400" : "border-white/[0.12] bg-white/[0.06] text-slate-100 placeholder:text-slate-400/60"}`;
  const inputClassSm = `w-full px-3 py-2 border rounded-md uppercase ${isLight ? "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400" : "border-white/[0.12] bg-white/[0.06] text-slate-100 placeholder:text-slate-400/60"}`;

  return (
    <div className={`min-h-screen bd-glass-panel pb-20${isLight ? " bd-light-surface" : ""}`}>
      {/* Header */}
      <div
        className={`bd-glass-panel${isLight ? " bd-light-surface" : ""} border-b ${isLight ? "border-slate-200/60" : "border-blue-200/30"}`}
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                aria-label="Back"
                className="mr-3 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">My Vehicles</h1>
                <p className={`text-sm ${isLight ? "text-slate-600" : "text-slate-300/80"}`}>
                  {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-white font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                <Plus className="w-4 h-4" />
                Add Vehicle
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-2xl mx-auto">
        {/* Add/Edit Form */}
        {showAddForm && (
          <div className={`bd-glass-card p-4 sm:p-6 mb-4${isLight ? " bd-light-surface" : ""}`}>
            <h3 className="text-lg font-bold mb-4">
              {editingId ? "Edit Vehicle" : "Add New Vehicle"}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Year *</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className={inputClass}
                    placeholder="2021"
                  />
                </div>
                <div>
                  <label className={labelClass}>Make *</label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className={inputClass}
                    placeholder="Toyota"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Model *</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className={inputClass}
                  placeholder="Camry"
                />
              </div>

              <div>
                <label className={labelClass}>VIN (Optional)</label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vin: e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, ""),
                    })
                  }
                  maxLength={17}
                  className={inputClass}
                  placeholder="1HGBH41JXMN109186"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Color (Optional)</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className={inputClass}
                    placeholder="Silver"
                  />
                </div>
                <div>
                  <label className={labelClass}>License Plate (Optional)</label>
                  <input
                    type="text"
                    value={formData.licensePlate}
                    onChange={(e) =>
                      setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })
                    }
                    className={inputClassSm}
                    placeholder="ABC1234"
                    maxLength={10}
                  />
                </div>
              </div>

              {formError && <p className="text-sm text-rose-500 text-center">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  className={`flex-1 px-4 py-2 border rounded-md font-medium ${isLight ? "border-slate-200 text-slate-600 hover:bg-slate-100" : "border-white/12 text-slate-200 hover:bg-white/10"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 text-white rounded-md font-medium"
                  style={{ backgroundColor: primaryColor }}
                >
                  Save Vehicle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vehicles List */}
        <div className="space-y-3">
          {vehicles.length === 0 ? (
            <div
              className={`bd-glass-card rounded-lg p-5 sm:p-8 text-center${isLight ? " bd-light-surface" : ""}`}
            >
              <Car
                className={`w-16 h-16 mx-auto mb-4 ${isLight ? "text-slate-400" : "text-gray-300"}`}
              />
              <h3 className="text-lg font-bold mb-2">No vehicles added yet</h3>
              <p className={`mb-4 ${isLight ? "text-slate-600" : "text-slate-300/80"}`}>
                Add your vehicles to make reporting damage faster.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-md text-white font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Add Your First Vehicle
              </button>
            </div>
          ) : (
            vehicles
              .filter((vehicle, index) => {
                // Hide vehicle from list if it's being edited
                if (editingId && vehicle.id === editingId) return false;
                if (editingIndex !== null && index === editingIndex) return false;
                return true;
              })
              .map((vehicle, index) => (
                <div
                  key={
                    vehicle.id ||
                    `vehicle-${index}-${vehicle.make}-${vehicle.model}-${vehicle.year}`
                  }
                  className={`bd-glass-card p-4${isLight ? " bd-light-surface" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Car className="w-5 h-5 mr-2" style={{ color: primaryColor }} />
                        <h3 className="font-bold text-lg">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                      </div>

                      <div
                        className={`space-y-1 text-sm ${isLight ? "text-slate-500" : "text-slate-400/70"}`}
                      >
                        {vehicle.color && (
                          <p>
                            Color:{" "}
                            <span className={isLight ? "text-slate-800" : "text-slate-100"}>
                              {vehicle.color}
                            </span>
                          </p>
                        )}
                        {vehicle.licensePlate && (
                          <p>
                            Plate:{" "}
                            <span className={isLight ? "text-slate-800" : "text-slate-100"}>
                              {vehicle.licensePlate}
                            </span>
                          </p>
                        )}
                        {vehicle.vin && (
                          <p className="text-xs">
                            VIN:{" "}
                            <span className={isLight ? "text-slate-800" : "text-slate-100"}>
                              {vehicle.vin}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(vehicle, index)}
                        aria-label={`Edit ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-slate-400/70" />
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(vehicle.id, index)}
                        aria-label={`Delete ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        className="p-2 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Inline delete confirmation */}
                  {deletingVehicle &&
                    ((deletingVehicle.id && deletingVehicle.id === vehicle.id) ||
                      (!deletingVehicle.id && deletingVehicle.index === index)) && (
                      <div
                        className={`mt-3 pt-3 border-t flex items-center justify-between gap-3 ${isLight ? "border-slate-200/60" : "border-white/10"}`}
                      >
                        <p className="text-sm text-rose-500 font-medium">
                          Delete this vehicle? This can&apos;t be undone.
                        </p>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={handleDeleteCancel}
                            className={`px-3 py-1.5 text-sm rounded-md font-medium ${isLight ? "border border-slate-200 text-slate-600 hover:bg-slate-100" : "border border-white/12 text-slate-200 hover:bg-white/10"}`}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteConfirm}
                            className="px-3 py-1.5 text-sm rounded-md font-medium bg-rose-600 text-white hover:bg-rose-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
