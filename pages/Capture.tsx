import React, { useState, useEffect } from 'react';
import { Camera, Loader2, ArrowRight, Plus, X, ScanLine } from 'lucide-react';
import { analyzeImage, readContainerNumber } from '../services/geminiService';
import { saveInspection } from '../services/dbService';
import { Inspection, User, ContainerSide, InspectionImage, Defect, Language } from '../types';
import { t, tSide } from '../i18n';

interface CaptureProps {
  user: User;
  onComplete: (inspectionId: string, containerNumber: string) => void;
  lang: Language;
  initialContainerNumber?: string;
}

const REQUIRED_SIDES: ContainerSide[] = [
    'FRONT_EXT', 'FRONT_INT', 
    'REAR_EXT', 'REAR_INT', 
    'LEFT_EXT', 'LEFT_INT', 
    'RIGHT_EXT', 'RIGHT_INT', 
    'ROOF_EXT', 'ROOF_INT', 
    'FLOOR', 'DOOR'
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
      reader.onloadend = () => {
        setImages(prev => ({ ...prev, [side]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOCRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setIsScanning(true);
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64 = reader.result as string;
              const result = await readContainerNumber(base64);
              setIsScanning(false);
              if (result) {
                  setContainerNum(result);
              } else {
                  alert(t(lang, 'id_not_found'));
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
      const newInspection: Inspection = {
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
            <div className="flex space-x-2">
                <input 
                    type="text" 
                    required
                    readOnly={!!initialContainerNumber || isScanning}
                    pattern="[A-Za-z0-9]{4,11}"
                    className={`flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono text-lg tracking-wider ${initialContainerNumber ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
                    placeholder="ABCD1234567"
                    value={isScanning ? t(lang, 'scanning') : containerNum}
                    onChange={(e) => setContainerNum(e.target.value.toUpperCase())}
                />
                {!initialContainerNumber && (
                    <label className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                        <ScanLine className="w-5 h-5" />
                        <span className="hidden sm:inline">{t(lang, 'scan_id')}</span>
                        <input 
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            capture="environment"
                            onChange={handleOCRChange}
                            disabled={isScanning}
                        />
                    </label>
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
                                <Camera className="w-8 h-8 text-slate-400 mb-2" />
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