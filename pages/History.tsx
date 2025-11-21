
import React, { useState, useEffect } from 'react';
import { getInspections } from '../services/dbService';
import { Inspection, Language } from '../types';
import { Search, Eye, Check } from 'lucide-react';
import { t } from '../i18n';

interface HistoryProps {
  onView: (id: string) => void;
  lang: Language;
}

const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const History: React.FC<HistoryProps> = ({ onView, lang }) => {
  const [list, setList] = useState<Inspection[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setList(getInspections());
  }, []);

  const filtered = list.filter(i => i.containerNumber.includes(filter.toUpperCase()));

  return (
    <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">{t(lang, 'history')}</h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder={t(lang, 'search_placeholder')} 
                    className="pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-700">{t(lang, 'container_number')}</th>
                            <th className="p-4 font-semibold text-slate-700">{t(lang, 'date')}</th>
                            <th className="p-4 font-semibold text-slate-700">{t(lang, 'iicl_tags')}</th>
                            <th className="p-4 font-semibold text-slate-700">{t(lang, 'status')}</th>
                            <th className="p-4 font-semibold text-slate-700">{t(lang, 'quote')}</th>
                            <th className="p-4 font-semibold text-slate-700 text-right">{t(lang, 'action')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-400">No records found</td>
                            </tr>
                        )}
                        {filtered.map(i => (
                            <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-mono font-medium text-slate-800">{i.containerNumber}</td>
                                <td className="p-4 text-slate-500">{new Date(i.timestamp).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1">
                                        {i.iiclTags?.map((tag, idx) => (
                                            <span 
                                                key={idx} 
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase 
                                                    ${tag === 'IICL' ? 'bg-green-100 text-green-700' : 
                                                      tag === 'REPAIR' ? 'bg-red-100 text-red-700' : 
                                                      'bg-slate-100 text-slate-600'}`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${i.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {t(lang, i.status.toLowerCase() as any) || i.status}
                                    </span>
                                </td>
                                <td className="p-4 font-mono text-slate-700">
                                    {i.quote ? formatVND(i.quote.total) : '-'}
                                    {i.quote?.status === 'APPROVED' && <Check className="inline w-3 h-3 ml-1 text-green-500" />}
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => onView(i.id)}
                                        className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
