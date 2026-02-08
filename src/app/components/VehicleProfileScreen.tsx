import { useState } from "react";
import { ArrowLeft, Car, Plus, Edit2, Trash2, Check } from "lucide-react";
import type { Vehicle } from "../types";

type VehicleProfileScreenProps = {
  onBack: () => void;
  vehicles: Vehicle[];
  onSaveVehicles: (vehicles: Vehicle[]) => void;
  primaryColor?: string;
};

export default function VehicleProfileScreen({
  onBack,
  vehicles: initialVehicles,
  onSaveVehicles,
  primaryColor = "#003d82"
}: VehicleProfileScreenProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
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
    licensePlate: ""
  });

  const handleEdit = (vehicle: Vehicle, index: number) => {
    setFormData({
      year: vehicle.year || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      vin: vehicle.vin || "",
      color: vehicle.color || "",
      licensePlate: vehicle.licensePlate || ""
    });
    setEditingId(vehicle.id);
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const handleDelete = (id: string | undefined, index: number) => {
    const updatedVehicles = id 
      ? vehicles.filter(v => v.id !== id)
      : vehicles.filter((_, i) => i !== index);
    setVehicles(updatedVehicles);
    onSaveVehicles(updatedVehicles);
  };

  const handleSave = () => {
    if (!formData.year || !formData.make || !formData.model) {
      alert("Please fill in required fields: Year, Make, and Model");
      return;
    }

    let updatedVehicles;
    if (editingId || editingIndex !== null) {
      // Update existing vehicle
      if (editingId) {
        // Update by ID (vehicle has UUID)
        updatedVehicles = vehicles.map(v => 
          v.id === editingId ? { ...formData, id: editingId } as Vehicle : v
        );
      } else {
        // Update by index (vehicle doesn't have UUID yet)
        updatedVehicles = vehicles.map((v, i) => 
          i === editingIndex ? formData as Vehicle : v
        );
      }
    } else {
      // Create new vehicle without ID - let database generate UUID
      const newVehicle: Partial<Vehicle> = { ...formData };
      // Remove id field if it exists
      delete newVehicle.id;
      updatedVehicles = [...vehicles, newVehicle as Vehicle];
    }

    setVehicles(updatedVehicles);
    onSaveVehicles(updatedVehicles);
    setShowAddForm(false);
    setEditingId(null);
    setEditingIndex(null);
    setFormData({
      year: "",
      make: "",
      model: "",
      vin: "",
      color: "",
      licensePlate: ""
    });
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
      licensePlate: ""
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">My Vehicles</h1>
                <p className="text-sm text-gray-600">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''}</p>
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
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4 border border-gray-200">
            <h3 className="text-lg font-bold mb-4">
              {editingId ? "Edit Vehicle" : "Add New Vehicle"}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year *
                  </label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="2021"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Make *
                  </label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({...formData, make: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Toyota"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model *
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Camry"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VIN (Optional)
                </label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) => setFormData({...formData, vin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="1HGBH41JXMN109186"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Silver"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Plate (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({...formData, licensePlate: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md uppercase"
                    placeholder="ABC1234"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md font-medium hover:bg-gray-50"
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
            <div className="bg-white rounded-lg p-8 text-center">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">No vehicles added yet</h3>
              <p className="text-gray-600 mb-4">
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
                key={vehicle.id || `vehicle-${index}-${vehicle.make}-${vehicle.model}-${vehicle.year}`}
                className="bg-white rounded-lg shadow-sm p-4 border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Car className="w-5 h-5 mr-2" style={{ color: primaryColor }} />
                      <h3 className="font-bold text-lg">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      {vehicle.color && (
                        <p>Color: <span className="text-gray-900">{vehicle.color}</span></p>
                      )}
                      {vehicle.licensePlate && (
                        <p>Plate: <span className="text-gray-900">{vehicle.licensePlate}</span></p>
                      )}
                      {vehicle.vin && (
                        <p className="text-xs">VIN: <span className="text-gray-900">{vehicle.vin}</span></p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(vehicle, index)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id, index)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}