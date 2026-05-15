import * as FileSystem from 'expo-file-system';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/' +
  'gemini-1.5-flash:generateContent?key=' +
  process.env.GEMINI_API_KEY;

const PROMPT = `You are an expert plant pathologist specialising in
Kenyan potato diseases. Analyse this potato leaf image and respond
ONLY with a JSON object in this exact format, no markdown:
{
  "disease": "Late Blight" or "Early Blight" or "Bacterial Wilt" or "Healthy",
  "confidence": 0.0-1.0,
  "severity": "High" or "Medium" or "Low",
  "recommendation_en": "specific management advice in English",
  "recommendation_sw": "ushauri maalum wa udhibiti kwa Kiswahili"
}
Focus on visible lesion colour, shape, and pattern.`;

export async function classifyWithGemini(imageUri: string): Promise<{
  disease: string;
  confidence: number;
  severity: string;
  recommendation: { en: string; sw: string };
  source: 'gemini';
}> {
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const body = {
    contents: [{
      parts: [
        { text: PROMPT },
        {
          inline_data: {
            mime_type: 'image/jpeg',
            data: base64,
          },
        },
      ],
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 512,
    },
  };

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
  const clean = text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(clean);

  return {
    disease: parsed.disease ?? 'Unknown',
    confidence: parsed.confidence ?? 0.5,
    severity: parsed.severity ?? 'Medium',
    recommendation: {
      en: parsed.recommendation_en ?? '',
      sw: parsed.recommendation_sw ?? '',
    },
    source: 'gemini',
  };
}