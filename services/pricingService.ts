
import { Inspection, Defect, PricingRule, Quote, QuoteStatus } from '../types';
import { getPricingRules } from './dbService';
import { DEFAULT_LABOR_RATE, TAX_RATE } from '../constants';

export const calculateDefectCost = (defect: Defect, rules: PricingRule[]): Defect => {
  // Find matching rule
  const rule = rules.find(r => r.defectCode === defect.code && r.severity === defect.severity);
  
  if (rule) {
    return {
      ...defect,
      partsCost: rule.basePrice,
      laborHours: rule.laborHours,
      repairCost: rule.basePrice + (rule.laborHours * DEFAULT_LABOR_RATE)
    };
  }
  
  // Default fallback if no rule
  return {
      ...defect,
      partsCost: 0,
      laborHours: 0,
      repairCost: 0
  };
};

export const generateQuote = (inspection: Inspection): Quote => {
  let subtotal = 0;
  
  // Sum up accepted/pending defects. Rejected ones are free.
  inspection.defects.forEach(d => {
      if (d.status !== 'REJECTED') {
          subtotal += (d.repairCost || 0);
      }
  });

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return {
    subtotal,
    tax,
    total,
    currency: 'VND',
    status: QuoteStatus.DRAFT,
    generatedAt: new Date().toISOString()
  };
};

export const applyPricingToInspection = (inspection: Inspection): Inspection => {
    const rules = getPricingRules();
    const pricedDefects = inspection.defects.map(d => {
        // If manually edited costs exist, keep them, otherwise calculate
        if (d.repairCost !== undefined) return d;
        return calculateDefectCost(d, rules);
    });
    
    const tempInspection = { ...inspection, defects: pricedDefects };
    const quote = generateQuote(tempInspection);
    
    return {
        ...tempInspection,
        quote
    };
};
