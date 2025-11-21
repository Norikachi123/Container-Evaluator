
import React, { useState, useEffect } from 'react';
import { Camera, Loader2, ArrowRight, Plus, X } from 'lucide-react';
import { analyzeImage, readContainerNumber } from '../services/geminiService';
import { saveInspection } from '../services/dbService';
import { applyPricingToInspection } from '../services/pricingService';
import { Inspection, User, ContainerSide, InspectionImage, Defect, Language } from '../types';
import { t, tSide } from '../i18n';

interface CaptureProps {
  user: User;
  onComplete: (inspectionId: string, containerNumber: string) => void;
  lang: Language;
  initialContainerNumber?: string;
}

const REQUIRED_SIDES: ContainerSide[] = [
    'DOOR_EXT', // Door Wall (Exterior) - Primary spot for OCR
    'SIDE_1_EXT', 
    'SIDE_2_EXT', 
    'FRONT_EXT', 
    'ROOF_EXT', 
    'UNDER_EXT',
    
    'DOOR_INT',
    'SIDE_1_INT',
    'SIDE_2_INT',
    'FRONT_INT',
    'ROOF_INT',
    'FLOOR_INT'
];

export const Capture: React.FC<CaptureProps> = ({ user, onComplete, lang, initialContainerNumber }) => {
  const [containerNum, setContainerNum] = useState('');
  const [images, setImages] = useState<Record<string, string>>({}); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
      if (initialContainerNumber) {
          setContainerNum(initialContainerNumber);
      }
  }, [initialContainerNumber]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: ContainerSide) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImages(prev => ({ ...prev, [side]: base64 }));

        // Auto-OCR if uploading DOOR_EXT (Door Wall) and no container number is set
        if (side === 'DOOR_EXT' && !initialContainerNumber) {
             setIsScanning(true);
             try {
                 const result = await readContainerNumber(base64);
                 if (result) {
                     setContainerNum(result);
                 }
             } catch (e) {
                 console.error("Auto-OCR failed", e);
             } finally {
                 setIsScanning(false);
             }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (side: ContainerSide) => {
      const newImages = { ...images };
      delete newImages[side];
      setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(images).length === 0 || !containerNum) {
        setError(t(lang, 'no_images'));
        return;
    }

    setIsAnalyzing(true);
    setError(null);
    setProgress(0);

    try {
      const totalImages = Object.keys(images).length;
      let completedImages = 0;
      const allDefects: Defect[] = [];
      const inspectionImages: InspectionImage[] = [];

      // Async batch analysis
      const analysisPromises = Object.entries(images).map(async ([side, base64]) => {
          const imageId = `img-${Date.now()}-${side}`;
          
          inspectionImages.push({
              id: imageId,
              side: side as ContainerSide,
              url: base64
          });

          const defects = await analyzeImage(base64, containerNum, imageId, side);
          allDefects.push(...defects);
          
          completedImages++;
          setProgress((completedImages / totalImages) * 100);
      });

      await Promise.all(analysisPromises);
      
      // Determine IICL Tags
      const uniqueCodes = Array.from(new Set(allDefects.map(d => d.code)));
      const iiclTags = uniqueCodes.length > 0 ? uniqueCodes : ['IICL'];

      // Create Inspection Object
      let newInspection: Inspection = {
        id: `insp-${Date.now()}`,
        containerNumber: containerNum.toUpperCase(),
        timestamp: new Date().toISOString(),
        inspectorId: user.id,
        location: 'Port Gate 4', 
        images: inspectionImages,
        defects: allDefects,
        status: allDefects.length > 0 ? 'REVIEW_NEEDED' : 'COMPLETED',
        overallCondition: allDefects.length > 0 ? 'DAMAGED' : 'SOUND',
        iiclTags: iiclTags
      };

      // Apply Pricing Rules automatically
      newInspection = applyPricingToInspection(newInspection);

      saveInspection(newInspection);
      onComplete(newInspection.id, newInspection.containerNumber);

    } catch (err) {
      setError(t(lang, 'analysis_failed'));
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">{t(lang, 'new_inspection')}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-1">{t(lang, 'container_number')}</label>
            <div className="relative">
                <input 
                    type="text" 
                    required
                    readOnly={!!initialContainerNumber || isScanning}
                    pattern="[A-Za-z0-9]{4,11}"
                    className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono text-lg tracking-wider ${initialContainerNumber ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
                    placeholder="ABCD1234567"
                    value={isScanning ? t(lang, 'scanning') : containerNum}
                    onChange={(e) => setContainerNum(e.target.value.toUpperCase())}
                />
                {isScanning && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2 bg-white pl-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-xs text-blue-600 font-medium">{t(lang, 'scanning')}</span>
                    </div>
                )}
            </div>
        </div>

        <div>
           <h3 className="text-lg font-semibold text-slate-700 mb-4">{t(lang, 'sides_to_capture')}</h3>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {REQUIRED_SIDES.map(side => {
                 const hasImage = !!images[side];
                 return (
                    <div key={side} className={`relative aspect-square rounded-xl border-2 ${hasImage ? 'border-blue-500 bg-blue-50' : 'border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100'} transition-all overflow-hidden`}>
                        {hasImage ? (
                            <>
                                <img src={images[side]} alt={side} className="w-full h-full object-cover" />
                                <div className="absolute top-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2 text-center truncate">
                                    {tSide(lang, side)}
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => removeImage(side)}
                                    className="absolute top-1 right-1 p-1 bg-white text-red-500 rounded-full shadow-md hover:bg-red-50"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </>
                        ) : (
                            <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-2">
                                <Camera className={`w-8 h-8 mb-2 ${side === 'DOOR_EXT' ? 'text-blue-500' : 'text-slate-400'}`} />
                                <span className="text-xs font-medium text-slate-600 text-center break-words w-full">{tSide(lang, side)}</span>
                                <span className="text-[10px] text-slate-400 mt-1 text-center">+ {t(lang, 'upload_photo')}</span>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    className="hidden"
                                    capture="environment"
                                    onChange={(e) => handleFileChange(e, side)}
                                />
                            </label>
                        )}
                    </div>
                 );
             })}
           </div>
        </div>

        {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                {error}
            </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 md:static md:bg-transparent md:border-0 md:p-0 z-10">
            <button 
            type="submit" 
            disabled={Object.keys(images).length === 0 || !containerNum || isAnalyzing}
            className="w-full md:max-w-md mx-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-lg font-semibold shadow-lg md:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {isAnalyzing ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t(lang, 'analyzing')} {Math.round(progress)}%</span>
                </>
            ) : (
                <>
                    <span>{t(lang, 'start_inspection')}</span>
                    <ArrowRight className="w-5 h-5" />
                </>
            )}
            </button>
        </div>
        <div className="h-20 md:hidden"></div>
      </form>
    </div>
  );
};
