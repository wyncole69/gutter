// Pricing data and maths. Kept framework-free so it can be unit tested with `node --test`.

export const CONDITION = { normal: 1.0, heavy: 1.35 };

// Storeys only apply to surfaces with `storeys: true`. 3+ storeys = price manually (null).
export const STOREY = { 1: 1.0, 2: 1.3, 3: null };

// Where a guide gives one figure only, low/high = typical +/- 25%.
const pm25 = (typical) => ({ typical, low: typical * 0.75, high: typical * 1.25 });

export const MARKETS = {
  US: {
    label: 'US',
    currency: 'USD',
    symbol: '$',
    areaUnit: 'sq ft',
    lengthUnit: 'linear ft',
    jobMinimum: 125,
    areaPerHour: 1500,
    surfaces: [
      { id: 'driveway', name: 'Driveway / concrete', typical: 0.25, low: 0.15, high: 0.35, flatwork: true },
      { id: 'sidewalk', name: 'Sidewalk / walkway', typical: 0.22, low: 0.15, high: 0.3, flatwork: true },
      { id: 'house', name: 'House siding (soft wash)', typical: 0.26, low: 0.12, high: 0.4, storeys: true },
      { id: 'wood-deck', name: 'Wood deck', typical: 0.38, low: 0.25, high: 0.5 },
      { id: 'composite-deck', name: 'Composite deck', typical: 0.3, low: 0.2, high: 0.4 },
      { id: 'roof', name: 'Roof (soft wash)', typical: 0.52, low: 0.3, high: 0.75, storeys: true },
      { id: 'gutters', name: 'Gutters (per linear ft)', typical: 1.25, low: 0.5, high: 2.0, storeys: true, linear: true },
    ],
  },
  UK: {
    label: 'UK',
    currency: 'GBP',
    symbol: '£',
    areaUnit: 'm²',
    lengthUnit: 'm',
    jobMinimum: 100,
    areaPerHour: 140,
    surfaces: [
      { id: 'patio', name: 'Patio slabs', typical: 3.0, low: 2.0, high: 4.5, flatwork: true },
      { id: 'block-paving', name: 'Block paving', typical: 3.5, low: 2.5, high: 5.25, flatwork: true },
      { id: 'concrete', name: 'Concrete', typical: 3.0, low: 2.0, high: 4.5, flatwork: true },
      { id: 'tarmac', name: 'Tarmac', typical: 3.0, low: 2.0, high: 4.5, flatwork: true },
      { id: 'decking', name: 'Decking', ...pm25(4.5) },
      { id: 'roof', name: 'Roof (soft wash)', typical: 11.5, low: 8.0, high: 15.0, storeys: true },
    ],
  },
};

export function round2(n) {
  return Math.round(n * 100) / 100;
}

export function getSurface(market, id) {
  const list = MARKETS[market].surfaces;
  return list.find((s) => s.id === id) || list[0];
}

/** Storey multiplier for a surface, or null when it must be priced manually. */
export function storeyMultiplier(surface, storeys) {
  if (!surface.storeys) return 1;
  const key = Math.min(Math.max(Number(storeys) || 1, 1), 3);
  return STOREY[key];
}

/** max(job minimum, area x rate x condition x storey). Returns null if storeys need manual pricing. */
export function priceFor({ area, rate, condition, storeyMult, minimum }) {
  if (storeyMult == null) return null;
  const raw = (area || 0) * (rate || 0) * CONDITION[condition] * storeyMult;
  return round2(Math.max(minimum || 0, raw));
}

/**
 * Full quote. `rate` is the (editable) typical rate; low/high come from the surface table.
 * hours/setupHours/target are optional (null when blank).
 */
export function quote({ market, surfaceId, area, condition = 'normal', storeys = 1, rate, minimum, hours, setupHours, target }) {
  const surface = getSurface(market, surfaceId);
  const storeyMult = storeyMultiplier(surface, storeys);
  const base = { area, condition, storeyMult, minimum };

  const price = priceFor({ ...base, rate: rate ?? surface.typical });
  const low = priceFor({ ...base, rate: surface.low });
  const high = priceFor({ ...base, rate: surface.high });

  const totalHours = (hours || 0) + (setupHours || 0);
  const implied = price != null && totalHours > 0 ? round2(price / totalHours) : null;
  const needed = target && totalHours > 0 ? round2(target * totalHours) : null;

  return { surface, storeyMult, price, low, high, totalHours, implied, needed, status: hourlyStatus(implied, target) };
}

/** green: at/above target; amber: up to 15% below; red: more than 15% below. */
export function hourlyStatus(implied, target) {
  if (implied == null || !target) return null;
  if (implied >= target) return 'green';
  if (implied >= target * 0.85) return 'amber';
  return 'red';
}

/** Hours on site from the flatwork "area per hour" helper. */
export function hoursFromRate(area, areaPerHour) {
  if (!area || !areaPerHour) return null;
  return round2(area / areaPerHour);
}
