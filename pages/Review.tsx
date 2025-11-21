import React, { useEffect, useState } from 'react';
import { Inspection, ReviewStatus, Severity, UserRole, User, Language, QuoteStatus, InvoiceDetails } from '../types';
import { getInspectionById, updateInspection, getNextPendingManifestItem } from '../services/dbService';
import { generateQuote } from '../services/pricingService';
import { BoundingBoxDisplay } from '../components/BoundingBoxDisplay';
import { Check, X, ChevronLeft, FileText, Image as ImageIcon, ArrowRight, DollarSign, Lock, Receipt } from 'lucide-react';
import jsPDF from 'jspdf';
import { t, tSide, tDefect } from '../i18n';

interface ReviewProps {
  inspectionId: string;
  user: User;
  onBack: () => void;
  onNextContainer: (containerNumber: string) => void;
  lang: Language;
}

// Display formatter (UI) - uses symbol
const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// PDF formatter - uses "VND" text to avoid encoding errors in standard PDF fonts
const formatVNDForPDF = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
};

export const Review: React.FC<ReviewProps> = ({ inspectionId, user, onBack, onNextContainer, lang }) => {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [selectedDefectId, setSelectedDefectId] = useState<string | null>(null);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);
  const [nextContainer, setNextContainer] = useState<string | null>(null);
  
  // Invoice Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  useEffect(() => {
    const data = getInspectionById(inspectionId);
    if (data) {
      setInspection(data);
      if (data.images.length > 0) setActiveImageId(data.images[0].id);
      if (data.defects.length > 0) setSelectedDefectId(data.defects[0].id);
      
      if (data.quote?.invoiceDetails) {
          setCustomerName(data.quote.invoiceDetails.customerName);
          setCustomerAddress(data.quote.invoiceDetails.customerAddress);
      }
    }
    const pending = getNextPendingManifestItem();
    if (pending) setNextContainer(pending.containerNumber);
  }, [inspectionId]);

  useEffect(() => {
      if (selectedDefectId && inspection) {
          const defect = inspection.defects.find(d => d.id === selectedDefectId);
          if (defect && defect.imageId !== activeImageId) {
              setActiveImageId(defect.imageId);
          }
      }
  }, [selectedDefectId]);

  const handleDefectAction = (defectId: string, action: ReviewStatus) => {
    if (!inspection) return;
    
    const updatedDefects = inspection.defects.map(d => 
      d.id === defectId ? { ...d, status: action } : d
    );

    const tempInspection = { ...inspection, defects: updatedDefects };
    const newQuote = generateQuote(tempInspection);
    
    const updatedInspection = { 
        ...tempInspection, 
        quote: { ...newQuote, status: inspection.quote?.status === QuoteStatus.APPROVED ? QuoteStatus.DRAFT : newQuote.status } 
    };

    setInspection(updatedInspection);
    updateInspection(updatedInspection);
  };

  const handleCostChange = (defectId: string, newCost: number) => {
      if (!inspection) return;
      const updatedDefects = inspection.defects.map(d => 
          d.id === defectId ? { ...d, repairCost: newCost } : d
      );
      const tempInspection = { ...inspection, defects: updatedDefects };
      const newQuote = generateQuote(tempInspection);
      
      const updatedInspection = { 
          ...tempInspection, 
          quote: { ...newQuote, status: QuoteStatus.DRAFT } 
      };

      setInspection(updatedInspection);
      updateInspection(updatedInspection);
  };

  const approveQuote = () => {
      if (!inspection || !inspection.quote) return;
      const updatedInspection = {
          ...inspection,
          quote: { ...inspection.quote, status: QuoteStatus.APPROVED, approvedBy: user.name }
      };
      setInspection(updatedInspection);
      updateInspection(updatedInspection);
  };

  const generateInvoice = () => {
      if (!inspection || !inspection.quote) return;
      
      const now = new Date();
      const dueDate = new Date();
      dueDate.setDate(now.getDate() + 30);

      const invoiceDetails: InvoiceDetails = {
          invoiceNumber: `INV-${now.getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          invoiceDate: now.toISOString(),
          dueDate: dueDate.toISOString(),
          customerName,
          customerAddress
      };

      const updatedInspection: Inspection = {
          ...inspection,
          quote: { 
              ...inspection.quote, 
              status: QuoteStatus.INVOICED,
              invoiceDetails 
          }
      };

      setInspection(updatedInspection);
      updateInspection(updatedInspection);
      setShowInvoiceModal(false);
      generateInvoicePDF(updatedInspection);
  };

  // Specific PDF generator for Invoice
  const generateInvoicePDF = (insp: Inspection) => {
      if (!insp.quote || !insp.quote.invoiceDetails) return;
      
      const doc = new jsPDF();
      const details = insp.quote.invoiceDetails;
      
      // Header
      doc.setFont("times", "bold");
      doc.setFontSize(24);
      doc.text("INVOICE", 160, 20, { align: "right" });
      
      doc.setFontSize(14);
      doc.text("ContainerAI Solutions", 15, 20);
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      doc.text("123 Port Logistics Blvd", 15, 26);
      doc.text("Ho Chi Minh City, Vietnam", 15, 31);
      doc.text("Tax ID: 0123456789", 15, 36);

      // Invoice Meta
      doc.setFont("times", "bold");
      doc.text("Invoice #:", 140, 35);
      doc.text("Date:", 140, 40);
      doc.text("Due Date:", 140, 45);
      
      doc.setFont("times", "normal");
      doc.text(details.invoiceNumber, 170, 35);
      doc.text(new Date(details.invoiceDate).toLocaleDateString(), 170, 40);
      doc.text(new Date(details.dueDate).toLocaleDateString(), 170, 45);

      // Bill To
      doc.setFont("times", "bold");
      doc.text("Bill To:", 15, 55);
      doc.setFont("times", "normal");
      doc.text(details.customerName, 15, 62);
      const splitAddress = doc.splitTextToSize(details.customerAddress, 80);
      doc.text(splitAddress, 15, 68);

      // Container Info
      doc.setFont("times", "bold");
      doc.text(`Container No: ${insp.containerNumber}`, 15, 90);

      // Table Header
      let y = 100;
      doc.setFillColor(240, 240, 240);
      doc.rect(15, y - 6, 180, 8, 'F');
      doc.setFont("times", "bold");
      doc.text("Description", 20, y);
      doc.text("Price", 185, y, { align: "right" });
      
      y += 10;
      doc.setFont("times", "normal");

      // Items
      insp.defects.forEach((d) => {
          if (d.status !== ReviewStatus.REJECTED) {
              const desc = `Repair: ${tDefect(lang, d.code)} - ${d.severity} (${tSide(lang, inspection.images.find(i => i.id === d.imageId)?.side || '')})`;
              const price = d.repairCost || 0;
              
              doc.text(desc, 20, y);
              doc.text(formatVNDForPDF(price), 185, y, { align: "right" });
              y += 8;
              
              if (y > 270) {
                  doc.addPage();
                  y = 20;
              }
          }
      });

      y += 5;
      doc.line(15, y, 195, y);
      y += 10;

      // Totals
      doc.setFont("times", "normal");
      doc.text("Subtotal:", 140, y);
      doc.text(formatVNDForPDF(insp.quote.subtotal), 185, y, { align: "right" });
      
      y += 8;
      doc.text("Tax (10%):", 140, y);
      doc.text(formatVNDForPDF(insp.quote.tax), 185, y, { align: "right" });
      
      y += 10;
      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.text("Total:", 140, y);
      doc.text(formatVNDForPDF(insp.quote.total), 185, y, { align: "right" });

      // Footer (Bank Info)
      doc.setFontSize(10);
      doc.setFont("times", "bold");
      const footerY = 260;
      doc.text("Payment Instructions:", 15, footerY);
      doc.setFont("times", "normal");
      doc.text("Bank: Vietcombank", 15, footerY + 6);
      doc.text("Account Name: ContainerAI Corp", 15, footerY + 11);
      doc.text("Account Number: 1234 5678 9012", 15, footerY + 16);
      
      doc.save(`${details.invoiceNumber}.pdf`);
  };

  const generateReportPDF = () => {
    if (!inspection) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // --- Page 1: Summary ---
    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.text(`Inspection Report`, margin, 20);
    
    doc.setFontSize(16);
    doc.text(inspection.containerNumber, margin, 30);
    
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    doc.text(`Inspector: ${inspection.inspectorId}`, margin, 45);
    doc.text(`Date: ${new Date(inspection.timestamp).toLocaleString()}`, margin, 50);
    doc.text(`Location: ${inspection.location}`, margin, 55);
    
    // Status
    doc.setFont("times", "bold");
    doc.text(`Status: ${inspection.status}`, margin, 65);
    
    // Financials Box
    if (inspection.quote) {
      let y = 75;
      doc.setDrawColor(200, 200, 200); 
      doc.setFillColor(245, 247, 250);
      doc.rect(margin, y, contentWidth, 40, 'F');
      
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text("Cost Estimate", margin + 5, y + 10);
      
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      doc.text(`Subtotal:`, margin + 5, y + 20);
      doc.text(`${formatVNDForPDF(inspection.quote.subtotal)}`, pageWidth - margin - 5, y + 20, { align: "right" });
      
      doc.text(`Tax (10%):`, margin + 5, y + 27);
      doc.text(`${formatVNDForPDF(inspection.quote.tax)}`, pageWidth - margin - 5, y + 27, { align: "right" });
      
      doc.setFont("times", "bold");
      doc.text(`Total:`, margin + 5, y + 35);
      doc.text(`${formatVNDForPDF(inspection.quote.total)}`, pageWidth - margin - 5, y + 35, { align: "right" });
      
      doc.setTextColor(0, 0, 0); // Reset color
    }
    
    // --- Detailed Pages: Images & Defects ---
    const sidesWithImages = inspection.images;

    sidesWithImages.forEach((img) => {
      doc.addPage();
      let yPos = 20;
      
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text(tSide(lang, img.side), margin, yPos);
      yPos += 10;
      
      const imgHeight = 100; 
      doc.addImage(img.url, 'JPEG', margin, yPos, contentWidth, imgHeight, undefined, 'FAST');
      
      const sideDefects = inspection.defects.filter(d => d.imageId === img.id && d.status !== ReviewStatus.REJECTED);
      
      sideDefects.forEach((d, i) => {
        const { ymin, xmin, ymax, xmax } = d.boundingBox;
        
        const pdfBoxX = margin + (xmin / 100) * contentWidth;
        const pdfBoxY = yPos + (ymin / 100) * imgHeight;
        const pdfBoxW = ((xmax - xmin) / 100) * contentWidth;
        const pdfBoxH = ((ymax - ymin) / 100) * imgHeight;
        
        doc.setDrawColor(220, 38, 38); 
        doc.setLineWidth(0.5);
        doc.rect(pdfBoxX, pdfBoxY, pdfBoxW, pdfBoxH);
        
        doc.setFillColor(220, 38, 38);
        doc.rect(pdfBoxX, pdfBoxY - 4, 6, 4, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.text(`${i + 1}`, pdfBoxX + 1, pdfBoxY - 1);
      });
      
      yPos += imgHeight + 10;
      
      if (sideDefects.length > 0) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont("times", "bold");
        doc.text("Defects Found:", margin, yPos);
        yPos += 8;
        
        sideDefects.forEach((d, i) => {
           doc.setFont("times", "normal");
           doc.setFontSize(10);
           
           const cost = d.repairCost ? formatVNDForPDF(d.repairCost) : formatVNDForPDF(0);
           const label = `${i + 1}. [${tDefect(lang, d.code)}] ${d.severity} - ${cost}`;
           
           doc.text(label, margin, yPos);
           
           doc.setFontSize(9);
           doc.setTextColor(80, 80, 80); 
           doc.text(`   ${d.description}`, margin, yPos + 5);
           
           doc.setTextColor(0, 0, 0);
           yPos += 12;
           
           if (yPos > 270) {
               doc.addPage();
               yPos = 20;
           }
        });
      } else {
          doc.setTextColor(100, 100, 100);
          doc.setFontSize(10);
          doc.setFont("times", "italic");
          doc.text("No defects detected on this side.", margin, yPos + 5);
      }
    });
    
    doc.save(`report_${inspection.containerNumber}.pdf`);
  };

  if (!inspection) return <div className="p-10 text-center">Loading...</div>;

  const activeImage = inspection.images.find(i => i.id === activeImageId);
  const currentImageDefects = inspection.defects.filter(d => d.imageId === activeImageId);
  const isReviewer = user.role === UserRole.REVIEWER || user.role === UserRole.ADMIN;
  const quote = inspection.quote;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm z-20">
        <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
                <h2 className="text-lg font-bold text-slate-800">{inspection.containerNumber}</h2>
                <div className="flex space-x-2 text-xs mt-1">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${inspection.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {t(lang, inspection.status.toLowerCase() as any) || inspection.status}
                    </span>
                    {quote && (
                        <span className={`px-2 py-0.5 rounded-full font-medium flex items-center space-x-1 ${quote.status === QuoteStatus.INVOICED ? 'bg-purple-100 text-purple-800' : quote.status === QuoteStatus.APPROVED ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                            {quote.status === QuoteStatus.INVOICED ? <Receipt className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                            <span>{quote.status}</span>
                        </span>
                    )}
                </div>
            </div>
        </div>
        <div className="flex space-x-2">
            <button 
                onClick={generateReportPDF}
                className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-md text-sm hover:bg-slate-50"
            >
                <FileText className="w-4 h-4" />
                <span>{t(lang, 'export_pdf')}</span>
            </button>
            {nextContainer && (
                <button 
                    onClick={() => onNextContainer(nextContainer)}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 shadow-md"
                >
                    <span>{t(lang, 'next_container')}</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            )}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Image Area */}
        <div className="flex-1 bg-slate-900 relative flex flex-col overflow-hidden">
             {/* View Tabs */}
             <div className="flex overflow-x-auto bg-slate-800 border-b border-slate-700 p-1 space-x-1 scrollbar-hide">
                {inspection.images.map(img => (
                    <button
                        key={img.id}
                        onClick={() => setActiveImageId(img.id)}
                        className={`px-3 py-2 text-xs font-medium whitespace-nowrap rounded flex items-center space-x-2 transition-colors ${activeImageId === img.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        <ImageIcon className="w-3 h-3" />
                        <span>{tSide(lang, img.side)}</span>
                        <span className="ml-1 bg-slate-900/50 px-1.5 rounded-full text-[10px]">
                             {inspection.defects.filter(d => d.imageId === img.id).length}
                        </span>
                    </button>
                ))}
             </div>

             <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-950">
                 {activeImage ? (
                    <div className="relative max-w-full max-h-full p-4">
                        <img 
                            ref={setImgRef}
                            src={activeImage.url} 
                            alt={activeImage.side} 
                            className="max-h-[80vh] w-auto object-contain rounded shadow-lg"
                        />
                        {imgRef && (
                            <BoundingBoxDisplay 
                                defects={currentImageDefects}
                                selectedDefectId={selectedDefectId}
                                onSelectDefect={setSelectedDefectId}
                                imageWidth={imgRef.width}
                                imageHeight={imgRef.height}
                            />
                        )}
                    </div>
                 ) : (
                     <div className="text-slate-500">Select an image</div>
                 )}
             </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-full md:w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col h-1/3 md:h-full shadow-xl z-30">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-slate-700">
                        {t(lang, 'defects_detected')} <span className="text-slate-400 font-normal">({currentImageDefects.length})</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        {activeImage ? `${tSide(lang, activeImage.side)} view` : ''}
                    </p>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {currentImageDefects.length === 0 && (
                    <div className="text-center p-8 text-slate-400">
                        <Check className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>{t(lang, 'no_defects')}</p>
                    </div>
                )}
                {currentImageDefects.map(d => (
                    <div 
                        key={d.id}
                        onClick={() => setSelectedDefectId(d.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedDefectId === d.id ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400' : 'bg-white border-slate-200 hover:border-blue-300'}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center space-x-2">
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${d.status === ReviewStatus.REJECTED ? 'bg-gray-200 text-gray-500 line-through' : 'bg-slate-100 text-slate-700'}`}>
                                    {tDefect(lang, d.code)}
                                </span>
                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                    d.severity === Severity.HIGH ? 'bg-red-100 text-red-700' : 
                                    d.severity === Severity.MEDIUM ? 'bg-yellow-100 text-yellow-700' : 
                                    'bg-green-100 text-green-700'
                                }`}>
                                    {d.severity}
                                </span>
                            </div>
                            {d.status !== ReviewStatus.REJECTED && (
                                <div className="flex items-center space-x-1">
                                    {isReviewer && quote?.status === QuoteStatus.DRAFT ? (
                                        <input 
                                            type="number" 
                                            className="w-28 text-right text-xs border rounded px-1 py-0.5" 
                                            value={d.repairCost || 0}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => handleCostChange(d.id, parseFloat(e.target.value))}
                                        />
                                    ) : (
                                        <span className="text-xs font-mono">{formatVND(d.repairCost || 0)}</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 mb-2">{d.description}</p>
                        
                        {selectedDefectId === d.id && isReviewer && quote?.status === QuoteStatus.DRAFT && (
                            <div className="flex space-x-2 mt-2 pt-2 border-t border-slate-100">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDefectAction(d.id, ReviewStatus.ACCEPTED); }}
                                    className={`flex-1 py-1.5 text-xs rounded font-medium flex items-center justify-center space-x-1 transition-colors ${d.status === ReviewStatus.ACCEPTED ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                                >
                                    <Check className="w-3 h-3" /> <span>{t(lang, 'confirm')}</span>
                                </button>
                                <button 
                                     onClick={(e) => { e.stopPropagation(); handleDefectAction(d.id, ReviewStatus.REJECTED); }}
                                     className={`flex-1 py-1.5 text-xs rounded font-medium flex items-center justify-center space-x-1 transition-colors ${d.status === ReviewStatus.REJECTED ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                                >
                                    <X className="w-3 h-3" /> <span>{t(lang, 'reject')}</span>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Pricing Summary Footer */}
            {quote && (
                <div className="bg-slate-50 p-4 border-t border-slate-200 shadow-inner z-10">
                    <div className="space-y-1 text-sm text-slate-600 mb-3">
                        <div className="flex justify-between">
                            <span>{t(lang, 'subtotal')}</span>
                            <span className="font-mono">{formatVND(quote.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t(lang, 'tax')}</span>
                            <span className="font-mono">{formatVND(quote.tax)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-800 text-base pt-2 border-t border-slate-200">
                            <span>{t(lang, 'total')}</span>
                            <span className="font-mono">{formatVND(quote.total)}</span>
                        </div>
                    </div>
                    
                    {isReviewer && quote.status === QuoteStatus.DRAFT && (
                        <button 
                            onClick={approveQuote}
                            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 transition-colors shadow-sm"
                        >
                            <Check className="w-4 h-4" />
                            <span>{t(lang, 'approve_quote')}</span>
                        </button>
                    )}
                    
                    {quote.status === QuoteStatus.APPROVED && (
                        <div className="space-y-2">
                            <div className="w-full py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium text-center flex items-center justify-center space-x-2">
                                <Lock className="w-3 h-3" />
                                <span>{t(lang, 'quote_approved')}</span>
                            </div>
                            {isReviewer && (
                                <button 
                                    onClick={() => setShowInvoiceModal(true)}
                                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 transition-colors shadow-sm"
                                >
                                    <Receipt className="w-4 h-4" />
                                    <span>{t(lang, 'create_invoice')}</span>
                                </button>
                            )}
                        </div>
                    )}

                    {quote.status === QuoteStatus.INVOICED && (
                        <button 
                            onClick={() => generateInvoicePDF(inspection)}
                            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 transition-colors shadow-sm"
                        >
                            <Receipt className="w-4 h-4" />
                            <span>{t(lang, 'download_invoice')}</span>
                        </button>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">{t(lang, 'invoice_details')}</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">{t(lang, 'customer_name')}</label>
                          <input 
                              type="text" 
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">{t(lang, 'customer_address')}</label>
                          <textarea 
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none h-24"
                              value={customerAddress}
                              onChange={(e) => setCustomerAddress(e.target.value)}
                          />
                      </div>
                  </div>
                  <div className="flex space-x-3 mt-6">
                      <button 
                          onClick={() => setShowInvoiceModal(false)}
                          className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                      >
                          {t(lang, 'cancel')}
                      </button>
                      <button 
                          onClick={generateInvoice}
                          disabled={!customerName || !customerAddress}
                          className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
                      >
                          {t(lang, 'generate')}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};