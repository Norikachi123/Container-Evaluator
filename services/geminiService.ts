import { GoogleGenAI, Type } from "@google/genai";
import { Defect, DefectCode, Severity, ReviewStatus } from '../types';

const MODEL_NAME = 'gemini-2.5-flash';

// Helper to clean base64 string
const cleanBase64 = (b64: string) => b64.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

export const analyzeImage = async (
  base64Image: string, 
  containerNumber: string,
  imageId: string,
  side: string
): Promise<Defect[]> => {
  
  if (!process.env.API_KEY) {
    console.error("API Key missing");
    throw new Error("API Key missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are an expert IICL certified shipping container inspector.
    Analyze the provided image of the ${side} side of container number ${containerNumber}.
    Identify all visible physical defects using the specific IICL codes provided below.
    
    STRICTLY USE ONLY THESE CODES:
    - DT (Dent / Móp)
    - BW (Bulge/Bow / Phình)
    - BT (Bent / Cong)
    - RO (Rot / Mục)
    - CO (Corrosion/Rust / Rỉ sét)
    - DL (Delamination / Bong tách lớp)
    - LO (Loose / Bung)
    - BR (Broken / Bể/vỡ)
    - CK (Crack / Nứt)
    - OL (Oil Stain / Dầu/nhớt)
    - HO (Hole / Lủng)
    - GD (Gouge/Scratch / Xước)
    - CU (Cut/Tear / Rách)
    - MA (Major Deformation / Biến dạng)
    - MS (Missing Part / Mất)
    - CT (Glue/Tape / Keo và băng keo)
    - DY (Dirty / Dơ/bẩn)
    - B  (Data Plate Issue / Hư hỏng bảng thông số)
    
    For each defect detected:
    1. Assign the correct code from the list above.
    2. Estimate severity (LOW, MEDIUM, HIGH).
    3. Provide a confidence score (0.0 to 1.0).
    4. Describe the defect briefly.
    5. Define a bounding box as percentage coordinates [ymin, xmin, ymax, xmax] (0-100).
    
    If no defects are found, return an empty list.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64(base64Image) } },
            { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            defects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  code: { type: Type.STRING, enum: Object.keys(DefectCode) },
                  severity: { type: Type.STRING, enum: Object.keys(Severity) },
                  confidence: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  box_2d: { 
                    type: Type.ARRAY, 
                    items: { type: Type.NUMBER },
                    description: "[ymin, xmin, ymax, xmax] in percentage 0-100"
                  }
                },
                required: ["code", "severity", "confidence", "description", "box_2d"]
              }
            }
          }
        }
      }
    });

    const jsonText = response.text || "{}";
    const parsed = JSON.parse(jsonText);

    if (!parsed.defects) return [];

    return parsed.defects.map((d: any, index: number) => ({
      id: `def-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      imageId: imageId,
      code: d.code as DefectCode,
      severity: d.severity as Severity,
      confidence: d.confidence,
      description: d.description,
      boundingBox: {
        ymin: d.box_2d[0],
        xmin: d.box_2d[1],
        ymax: d.box_2d[2],
        xmax: d.box_2d[3]
      },
      status: ReviewStatus.PENDING
    }));

  } catch (error) {
    console.error(`Gemini Analysis Failed for ${side}:`, error);
    return [];
  }
};

export const readContainerNumber = async (base64Image: string): Promise<string | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key missing");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this image and identify the Shipping Container Number.
    Standard format is 4 letters (Owner Code) followed by 6 digits (Serial Number) and 1 digit (Check Digit). 
    Example: ABCD 123456 7
    
    Return ONLY the alphanumeric string without spaces or special characters. 
    If you cannot clearly see a container number, return "null".
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64(base64Image) } },
            { text: prompt }
        ]
      }
    });
    
    const text = response.text?.trim();
    if (!text || text.toLowerCase() === 'null') return null;
    
    // Basic cleanup: remove spaces, dashes
    const cleaned = text.replace(/[^A-Z0-9]/gi, '');
    return cleaned;
  } catch (error) {
    console.error("OCR Failed:", error);
    return null;
  }
};