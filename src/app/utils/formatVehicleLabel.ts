/**
 * formatVehicleLabel — render a "Year Make Model" label without duplicating
 * the make when the model already starts with it.
 *
 * Pass 64 (2026-05-07) — KI-124 #2 fix. Several manufacturers ship model
 * names that already contain the make name (e.g. "Mazda Mazda6", "Honda
 * Civic" rendered cleanly but "Mazda Mazda6" reads as a typo). When that
 * happens, suppress the duplicated leading make so the label reads "2014
 * Mazda6" instead of "2014 Mazda Mazda6".
 *
 * Inputs are tolerant of `undefined`, `null`, and empty strings; they are
 * skipped. The returned string is whitespace-collapsed and trimmed.
 */
export function formatVehicleLabel(parts: {
  year?: string | number | null;
  make?: string | null;
  model?: string | null;
}): string {
  const year = parts.year != null ? String(parts.year).trim() : "";
  const make = (parts.make ?? "").trim();
  const model = (parts.model ?? "").trim();

  let displayModel = model;
  let displayMake = make;
  if (make && model) {
    const lowerModel = model.toLowerCase();
    const lowerMake = make.toLowerCase();
    if (
      lowerModel === lowerMake ||
      lowerModel.startsWith(`${lowerMake} `) ||
      // Tightly concatenated manufacturer prefix (e.g. "Mazda6")
      (lowerModel.startsWith(lowerMake) && lowerModel.length > lowerMake.length)
    ) {
      // Drop the duplicated make from the rendered label
      displayMake = "";
      displayModel = model;
    }
  }

  return [year, displayMake, displayModel]
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
