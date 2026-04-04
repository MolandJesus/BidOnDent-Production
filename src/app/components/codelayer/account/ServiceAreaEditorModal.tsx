/**
 * ServiceAreaEditorModal — Manage shop service areas.
 * Allows shops to add, edit, and delete radius-based and ZIP-code-based service areas.
 * Pass 823 — Service area editor UI.
 */

import { AlertCircle, Loader2, MapPin, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";
import { useShopServiceAreas } from "../../../hooks/useShopServiceAreas";
import {
  saveShopServiceArea,
  deleteShopServiceArea,
  type SaveServiceAreaInput,
  type ShopServiceArea,
} from "../../../services/supabase/serviceAreas";

type ServiceAreaEditorModalProps = {
  isOpen: boolean;
  primaryColor: string;
  onClose: () => void;
  appearanceMode?: DashboardAppearanceMode;
};

type EditingArea = SaveServiceAreaInput & { _isNew?: boolean };

export default function ServiceAreaEditorModal({
  isOpen,
  primaryColor,
  onClose,
  appearanceMode = "map-dark",
}: ServiceAreaEditorModalProps) {
  const isLight = appearanceMode === "light";
  const { serviceAreas, isLoading, error: loadError, retry } = useShopServiceAreas();
  const [editing, setEditing] = useState<EditingArea | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setEditing(null);
      setActionError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose, saving]);

  const startNew = useCallback(() => {
    setEditing({
      _isNew: true,
      label: "Service Area",
      area_type: "radius",
      center_latitude: undefined,
      center_longitude: undefined,
      radius_miles: 15,
      zip_codes: [],
    });
    setActionError(null);
  }, []);

  const startEdit = useCallback((area: ShopServiceArea) => {
    setEditing({
      id: area.id,
      label: area.label,
      area_type: area.area_type,
      center_latitude: area.center_latitude ?? undefined,
      center_longitude: area.center_longitude ?? undefined,
      radius_miles: area.radius_miles ?? 15,
      zip_codes: area.zip_codes,
      is_active: area.is_active,
    });
    setActionError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editing) return;
    setSaving(true);
    setActionError(null);
    try {
      const input: SaveServiceAreaInput = { ...editing };
      delete (input as Record<string, unknown>)._isNew;
      await saveShopServiceArea("", input);
      setEditing(null);
      retry();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [editing, retry]);

  const handleDelete = useCallback(
    async (areaId: string) => {
      setDeleting(areaId);
      setActionError(null);
      try {
        await deleteShopServiceArea("", areaId);
        retry();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to delete");
      } finally {
        setDeleting(null);
      }
    },
    [retry]
  );

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setActionError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setEditing((prev) =>
          prev
            ? {
                ...prev,
                center_latitude: Math.round(pos.coords.latitude * 1000000) / 1000000,
                center_longitude: Math.round(pos.coords.longitude * 1000000) / 1000000,
              }
            : prev
        );
      },
      () => setActionError("Could not get your location"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  if (!isOpen) return null;

  const bg = isLight ? "bg-white" : "bg-slate-900";
  const border = isLight ? "border-slate-200" : "border-slate-700";
  const text = isLight ? "text-slate-900" : "text-white";
  const textMuted = isLight ? "text-slate-500" : "text-slate-400";
  const inputBg = isLight ? "bg-slate-50 border-slate-300" : "bg-slate-800 border-slate-600";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={saving ? undefined : onClose}
      />
      <div
        className={`relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl ${bg} ${border} border shadow-2xl`}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${border} ${bg}`}>
          <div className="flex items-center gap-2">
            <MapPin size={18} style={{ color: primaryColor }} />
            <h2 className={`text-lg font-semibold ${text}`}>Service Areas</h2>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className={`p-1.5 rounded-lg hover:bg-slate-700/50 ${textMuted}`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Error banner */}
          {(loadError || actionError) && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">
              <AlertCircle size={14} />
              {actionError || loadError}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin" style={{ color: primaryColor }} />
            </div>
          )}

          {/* Area list */}
          {!isLoading && !editing && (
            <>
              {serviceAreas.length === 0 ? (
                <div className={`text-center py-8 ${textMuted}`}>
                  <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No service areas defined yet.</p>
                  <p className="text-xs mt-1">Add your first service area to start receiving nearby reports.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {serviceAreas.map((area) => (
                    <div
                      key={area.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${border} ${
                        area.is_active ? "" : "opacity-50"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${text} truncate`}>
                          {area.label}
                        </div>
                        <div className={`text-xs ${textMuted}`}>
                          {area.area_type === "radius"
                            ? `${area.radius_miles ?? 15} mi radius`
                            : `${area.zip_codes.length} ZIP codes`}
                          {!area.is_active && " · Inactive"}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startEdit(area)}
                          className="px-2.5 py-1 text-xs rounded-md hover:bg-slate-700/50"
                          style={{ color: primaryColor }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(area.id)}
                          disabled={!!deleting}
                          className="p-1.5 rounded-md text-red-400 hover:bg-red-500/10"
                        >
                          {deleting === area.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={startNew}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
              >
                <Plus size={16} />
                Add Service Area
              </button>
            </>
          )}

          {/* Edit form */}
          {editing && (
            <div className="space-y-4">
              <h3 className={`text-sm font-medium ${text}`}>
                {editing._isNew ? "New Service Area" : "Edit Service Area"}
              </h3>

              {/* Label */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Label</label>
                <input
                  type="text"
                  value={editing.label ?? ""}
                  onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${text} border focus:outline-none focus:ring-1`}
                  style={{ focusRingColor: primaryColor } as React.CSSProperties}
                  placeholder="e.g., Primary Zone"
                />
              </div>

              {/* Type */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Type</label>
                <div className="flex gap-2">
                  {(["radius", "zip_codes"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setEditing({ ...editing, area_type: t })}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        editing.area_type === t
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : `${border} ${textMuted}`
                      }`}
                    >
                      {t === "radius" ? "Radius" : "ZIP Codes"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius fields */}
              {editing.area_type === "radius" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={editing.center_latitude ?? ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            center_latitude: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                        className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${text} border focus:outline-none`}
                        placeholder="33.749"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={editing.center_longitude ?? ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            center_longitude: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                        className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${text} border focus:outline-none`}
                        placeholder="-84.388"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleUseMyLocation}
                    className={`text-xs ${textMuted} hover:underline`}
                  >
                    Use my current location
                  </button>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${textMuted}`}>
                      Radius (miles)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={editing.radius_miles ?? 15}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          radius_miles: parseInt(e.target.value) || 15,
                        })
                      }
                      className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${text} border focus:outline-none`}
                    />
                  </div>
                </>
              )}

              {/* ZIP codes field */}
              {editing.area_type === "zip_codes" && (
                <div>
                  <label className={`block text-xs font-medium mb-1 ${textMuted}`}>
                    ZIP Codes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={(editing.zip_codes ?? []).join(", ")}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        zip_codes: e.target.value
                          .split(",")
                          .map((z) => z.trim())
                          .filter(Boolean),
                      })
                    }
                    className={`w-full px-3 py-2 rounded-lg text-sm ${inputBg} ${text} border focus:outline-none`}
                    placeholder="30301, 30302, 30303"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditing(null)}
                  disabled={saving}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${border} ${textMuted}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
