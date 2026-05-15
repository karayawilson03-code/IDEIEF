const GEMINI_API_KEY = 'AIzaSyDtShWqfdMhw5DuHjojQh9rgrTT1MH-JnU';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/' +
  'gemini-1.5-flash-latest:generateContent?key=' +
  GEMINI_API_KEY;

const PROMPT = `You are an expert plant pathologist specialising in
Kenyan potato diseases. Analyse this potato leaf image and respond
ONLY with a JSON object in this exact format, no markdown:
{
  "disease": "Late Blight" or "Early Blight" or "Bacterial Wilt" or "Common Scab" or "Black Scurf" or "Soft Rot" or "Healthy",
  "confidence": 0.0-1.0,
  "severity": "High" or "Medium" or "Low",
  "recommendation_en": "specific management advice in English",
  "recommendation_sw": "ushauri maalum wa udhibiti kwa Kiswahili"
}
Focus on visible lesion colour, shape, and pattern.`;

export async function classifyWithGemini(base64: string): Promise<{
  disease: string;
  confidence: number;
  severity: string;
  recommendation: { en: string; sw: string };
  source: 'gemini';
}> {
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
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
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