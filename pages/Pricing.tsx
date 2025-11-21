
import React, { useState, useEffect } from 'react';
import { PricingRule, Language, DefectCode, Severity } from '../types';
import { getPricingRules, savePricingRules } from '../services/dbService';
import { t, tDefect } from '../i18n';
import { Save } from 'lucide-react';

interface PricingProps {
  lang: Language;
}

export const Pricing: React.FC<PricingProps> = ({ lang }) => {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setRules(getPricingRules());
  }, []);

  const handleChange = (id: string, field: keyof PricingRule, value: number) => {
    const newRules = rules.map(r => 
        r.id === id ? { ...r, [field]: value } : r
    );
    setRules(newRules);
    setIsDirty(true);
  };

  const handleSave = () => {
      savePricingRules(rules);
      setIsDirty(false);
      alert(t(lang, 'save_changes') + ' OK');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{t(lang, 'pricing_settings')}</h2>
        <button 
            onClick={handleSave}
            disabled={!isDirty}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Save className="w-4 h-4" />
            <span>{t(lang, 'save_changes')}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="p-4 font-semibold text-slate-700">Defect Type</th>
                    <th className="p-4 font-semibold text-slate-700">Severity</th>
                    <th className="p-4 font-semibold text-slate-700">{t(lang, 'base_price')}</th>
                    <th className="p-4 font-semibold text-slate-700">{t(lang, 'labor_hours')} (h)</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {rules.map(rule => (
                    <tr key={rule.id} className="hover:bg-slate-50">
                        <td className="p-4 font-medium text-slate-800">{tDefect(lang, rule.defectCode)}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                rule.severity === Severity.HIGH ? 'bg-red-100 text-red-700' : 
                                rule.severity === Severity.MEDIUM ? 'bg-yellow-100 text-yellow-700' : 
                                'bg-green-100 text-green-700'
                            }`}>
                                {rule.severity}
                            </span>
                        </td>
                        <td className="p-4">
                            <input 
                                type="number" 
                                min="0"
                                step="1000"
                                className="w-32 px-2 py-1 border border-slate-300 rounded"
                                value={rule.basePrice}
                                onChange={(e) => handleChange(rule.id, 'basePrice', parseFloat(e.target.value))}
                            />
                        </td>
                        <td className="p-4">
                             <input 
                                type="number" 
                                min="0"
                                step="0.1"
                                className="w-24 px-2 py-1 border border-slate-300 rounded"
                                value={rule.laborHours}
                                onChange={(e) => handleChange(rule.id, 'laborHours', parseFloat(e.target.value))}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};
