import { useState, useEffect } from 'react';
import { Upload, Camera, Globe, AlertCircle, Heart, Loader2, CheckCircle } from 'lucide-react';

// ⚠️ REPLACE WITH YOUR GEMINI API KEY
const GEMINI_API_KEY = "AIzaSyCwVOwXeKZtD7ASl-UmUpOi9-s2BVxCAhU";

function App() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [targetLang, setTargetLang] = useState('en');

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'ar', name: 'Arabic' },
    { code: 'zh', name: 'Chinese' },
    { code: 'hi', name: 'Hindi' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'tr', name: 'Turkish' }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const base64Data = image.split(',')[1];
      const targetLangName = languages.find(l => l.code === targetLang)?.name;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: `You are a crisis response translator. Analyze this image and respond with ONLY valid JSON (no markdown, no extra text):

{
  "detectedText": "exact text visible in the image",
  "detectedLanguage": "name of detected language",
  "translation": "translation to ${targetLangName}",
  "urgencyLevel": "low/medium/high/critical",
  "medicalKeywords": ["keyword1", "keyword2"],
  "context": "brief situation context",
  "suggestedResponse": "culturally appropriate response",
  "additionalNotes": "important notes for first responders"
}

Analyze for: handwritten signs, medical forms, emergency messages, injury descriptions. Assess urgency based on medical terms (pain, bleeding, trapped, help, emergency, insulin, allergic, etc.).`
                },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data
                  }
                }
              ]
            }]
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `API Error: ${response.status}`);
      }

      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        try {
          const parsed = JSON.parse(text);
          setResult(parsed);
        } catch (parseError) {
          setResult({
            detectedText: "Image analyzed",
            detectedLanguage: "Unknown",
            translation: text.substring(0, 200),
            urgencyLevel: "medium",
            medicalKeywords: [],
            context: "Analysis completed",
            suggestedResponse: text.substring(0, 200),
            additionalNotes: "Full response: " + text.substring(0, 300)
          });
        }
      } else {
        throw new Error('No response from Gemini API');
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({
        error: true,
        message: `${error.message}. Verify your API key at https://aistudio.google.com/app/apikey`
      });
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (level) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      critical: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[level?.toLowerCase()] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lightcyan-900 to-navajowhite-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-10 h-10 text-red-500" />
            <h1 className="text-4xl font-bold text-Maroon-800">Crisis Response Translator</h1>
          </div>
          <p className="text-lg text-gray-600">AI-powered communication for emergency responders</p>
          <p className="text-sm text-gray-500 mt-2">Powered by Google Gemini</p>
        </div>

        {GEMINI_API_KEY === "AIzaSyCwVOwXeKZtD7ASl-UmUpOi9-s2BVxCAhU" && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-800">API Key Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Add your Gemini API key in src/App.jsx line 5. Get it from{' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">
                  Google AI Studio
                </a>
              </p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Capture or Upload Image
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Language</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>

            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 mb-2">Click to Upload Image</p>
                <p className="text-sm text-gray-500">Photos of signs, notes or wound</p>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
            </label>

            {image && (
              <div className="mt-4">
                <img src={image} alt="Uploaded" className="w-full rounded-lg shadow-md" />
                <button
                  onClick={analyzeImage}
                  disabled={loading}
                  className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:bg-gray-400 flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Globe className="w-5 h-5" />
                      Analyze & Translate
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-sm text-blue-900 mb-2">Test Examples:</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Handwritten emergency notes</li>
                <li>• Medical prescriptions</li>
                <li>• Unknown language signs</li>
                <li>• Wound Pics</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Analysis Results
            </h2>

            {!result && !loading && (
              <div className="text-center py-12 text-gray-400">
                <Globe className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p>Upload an image to begin</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin text-blue-600" />
                <p className="text-gray-600">Processing with Gemini AI...</p>
              </div>
            )}

            {result && !result.error && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border-2 ${getUrgencyColor(result.urgencyLevel)}`}>
                  <div className="font-semibold text-sm uppercase mb-1">Urgency Level</div>
                  <div className="text-2xl font-bold">{result.urgencyLevel?.toUpperCase()}</div>
                </div>

                {result.detectedText && (
                  <div className="border rounded-lg p-4">
                    <div className="font-semibold text-sm text-gray-600 mb-2">
                      Detected Text ({result.detectedLanguage})
                    </div>
                    <div className="text-gray-800">{result.detectedText}</div>
                  </div>
                )}

                {result.translation && (
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <div className="font-semibold text-sm text-blue-800 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Translation
                    </div>
                    <div className="text-lg text-blue-900 font-medium">{result.translation}</div>
                  </div>
                )}

                {result.medicalKeywords?.length > 0 && (
                  <div className="border rounded-lg p-4 bg-red-50">
                    <div className="font-semibold text-sm text-red-800 mb-2">Medical Keywords</div>
                    <div className="flex flex-wrap gap-2">
                      {result.medicalKeywords.map((keyword, idx) => (
                        <span key={idx} className="px-3 py-1 bg-red-200 text-red-900 rounded-full text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.context && (
                  <div className="border rounded-lg p-4">
                    <div className="font-semibold text-sm text-gray-600 mb-2">Context</div>
                    <div className="text-gray-800">{result.context}</div>
                  </div>
                )}

                {result.suggestedResponse && (
                  <div className="border rounded-lg p-4 bg-green-50">
                    <div className="font-semibold text-sm text-green-800 mb-2">Suggested Response</div>
                    <div className="text-gray-800">{result.suggestedResponse}</div>
                  </div>
                )}

                {result.additionalNotes && (
                  <div className="border rounded-lg p-4 bg-yellow-50">
                    <div className="font-semibold text-sm text-yellow-800 mb-2">Notes</div>
                    <div className="text-gray-800">{result.additionalNotes}</div>
                  </div>
                )}
              </div>
            )}

            {result?.error && (
              <div className="text-center py-12 text-red-600">
                <AlertCircle className="w-16 h-16 mx-auto mb-3" />
                <p className="font-semibold mb-2">Error</p>
                <p className="text-sm">{result.message}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-semibold text-lg mb-3">Gemini Features Used</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">Vision API</h4>
              <p className="text-sm text-gray-600">Analyzes images and extracts text including handwriting</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">Multilingual Translation</h4>
              <p className="text-sm text-gray-600">Translates 10+ languages with medical terminology accuracy</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">Contextual Intelligence</h4>
              <p className="text-sm text-gray-600">Assesses urgency and provides appropriate guidance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;