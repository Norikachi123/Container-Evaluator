
import { DefectCode, Severity, UserRole, PricingRule } from './types';

export const DEFECT_COLORS = {
  [DefectCode.DT]: 'border-yellow-500 bg-yellow-500/20 text-yellow-700', // Dent
  [DefectCode.BW]: 'border-yellow-600 bg-yellow-600/20 text-yellow-800', // Bulge
  [DefectCode.BT]: 'border-purple-500 bg-purple-500/20 text-purple-700', // Bent
  [DefectCode.RO]: 'border-brown-500 bg-amber-900/20 text-amber-900',   // Rot
  [DefectCode.CO]: 'border-orange-500 bg-orange-500/20 text-orange-700', // Corrosion
  [DefectCode.DL]: 'border-pink-500 bg-pink-500/20 text-pink-700',       // Delamination
  [DefectCode.LO]: 'border-blue-400 bg-blue-400/20 text-blue-700',       // Loose
  [DefectCode.BR]: 'border-red-500 bg-red-500/20 text-red-700',          // Broken
  [DefectCode.CK]: 'border-red-600 bg-red-600/20 text-red-800',          // Crack
  [DefectCode.OL]: 'border-green-600 bg-green-600/20 text-green-800',    // Oil
  [DefectCode.HO]: 'border-red-700 bg-red-700/20 text-red-900',          // Hole
  [DefectCode.GD]: 'border-blue-500 bg-blue-500/20 text-blue-700',       // Gouge
  [DefectCode.CU]: 'border-red-400 bg-red-400/20 text-red-600',          // Cut
  [DefectCode.MA]: 'border-purple-700 bg-purple-700/20 text-purple-900', // Major
  [DefectCode.MS]: 'border-gray-700 bg-gray-700/20 text-gray-900',       // Missing
  [DefectCode.CT]: 'border-cyan-500 bg-cyan-500/20 text-cyan-700',       // Glue/Tape
  [DefectCode.DY]: 'border-gray-500 bg-gray-500/20 text-gray-700',       // Dirty
  [DefectCode.B]: 'border-indigo-500 bg-indigo-500/20 text-indigo-700',  // Plate
};

export const SEVERITY_COLORS = {
  [Severity.LOW]: 'bg-green-100 text-green-800',
  [Severity.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [Severity.HIGH]: 'bg-red-100 text-red-800',
};

export const MOCK_USERS = [
  { id: 'u1', name: 'John Doe', role: UserRole.INSPECTOR },
  { id: 'u2', name: 'Jane Smith', role: UserRole.REVIEWER },
  { id: 'u3', name: 'Admin User', role: UserRole.ADMIN },
];

export const DEFAULT_LABOR_RATE = 500000; // VND per hour
export const TAX_RATE = 0.10; // 10%

// Mock pricing rules generator
export const generateDefaultPricingRules = (): PricingRule[] => {
  const rules: PricingRule[] = [];
  Object.values(DefectCode).forEach(code => {
    [Severity.LOW, Severity.MEDIUM, Severity.HIGH].forEach(severity => {
      let basePrice = 500000; // 500k VND base
      let laborHours = 0.5;

      if (severity === Severity.MEDIUM) { basePrice *= 2; laborHours *= 1.5; }
      if (severity === Severity.HIGH) { basePrice *= 4; laborHours *= 2.5; }
      
      // Specific overrides
      if (code === DefectCode.HO) { basePrice += 1000000; laborHours += 1; } // Holes are expensive
      if (code === DefectCode.CO) { basePrice += 200000; } // Rust treatment

      rules.push({
        id: `rule-${code}-${severity}`,
        defectCode: code,
        severity: severity,
        basePrice,
        laborHours,
        description: `Standard repair for ${code} (${severity})`
      });
    });
  });
  return rules;
};
