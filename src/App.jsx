import { useState, useEffect } from 'react';
import { Upload, Camera, Globe, AlertCircle, Heart, Loader2, CheckCircle, Copy, Check, ChevronDown, ChevronUp, MapPin, Send } from 'lucide-react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function App() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [targetLang, setTargetLang] = useState('en');
  const [copiedField, setCopiedField] = useState(null);
  const [isPredictionsExpanded, setIsPredictionsExpanded] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          setLocationError(error.message);
          console.log('Location error:', error.message);
        }
      );
    }
  }, []);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' },
    { code: 'zh', name: '中文' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'uk', name: 'Українська' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ur', name: 'اردو' },
    { code: 'fa', name: 'فارسی' },
    { code: 'ps', name: 'پښتو' },
    { code: 'ku', name: 'کوردی' },
    { code: 'so', name: 'Soomaali' },
    { code: 'am', name: 'አማርኛ' },
    { code: 'ti', name: 'ትግርኛ' },
    { code: 'sw', name: 'Kiswahili' },
    { code: 'ha', name: 'Hausa' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'th', name: 'ไทย' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'tl', name: 'Tagalog' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pl', name: 'Polski' },
    { code: 'ro', name: 'Română' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'el', name: 'Ελληνικά' },
    { code: 'he', name: 'עברית' },
    { code: 'my', name: 'မြန်မာ' },
    { code: 'ne', name: 'नेपाली' },
    { code: 'si', name: 'සිංහල' },
    { code: 'ta', name: 'தமிழ்' }
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
                  text: `You are a crisis response translator. Analyze this image and respond with ONLY valid JSON (no markdown, no extra text).

CRITICAL: Write ALL fields (translation, context, suggestedResponse, additionalNotes, predictedConditions) in ${targetLangName}. Everything must be in ${targetLangName}, not English.

{
  "detectedText": "exact text visible in the image (keep in original language)",
  "detectedLanguage": "name of detected language (in English)",
  "translation": "translation to ${targetLangName} in SIMPLE, CLEAR language",
  "urgencyLevel": "low/medium/high/critical",
  "medicalKeywords": ["keyword1 in ${targetLangName}", "keyword2 in ${targetLangName}"],
  "predictedConditions": [
    {"condition": "condition name in ${targetLangName} using simple terms", "probability": "high/medium/low", "reasoning": "explanation in ${targetLangName} using plain, everyday language"},
    {"condition": "second condition in ${targetLangName} using simple terms", "probability": "high/medium/low", "reasoning": "explanation in ${targetLangName} using plain language"}
  ],
  "context": "brief situation description in ${targetLangName} using simple, everyday language",
  "suggestedResponse": "culturally appropriate response in ${targetLangName} using simple, clear language",
  "additionalNotes": "important notes in ${targetLangName} using plain language"
}

ABSOLUTELY NO MEDICAL JARGON OR TECHNICAL TERMS. Write everything as if explaining to someone who never went to medical school. Use ONLY simple everyday words in ${targetLangName}:
- Instead of medical terms, use common everyday words
- Instead of "laceration" say "cut" or "wound"
- Instead of "hypovolemic shock" say "losing too much blood" or "body shutting down"
- Instead of "traumatic injury" say "bad injury" or "serious hurt"
- Instead of "hemorrhage" say "heavy bleeding" or "bleeding a lot"
- Instead of "fracture" say "broken bone"
- Instead of "contusion" say "bruise"
- Instead of "abrasion" say "scrape"
- Instead of "severe, uncontrolled bleeding" say "bleeding that won't stop"
- Instead of "immediate attention" say "help right now"

DO NOT use words like: laceration, traumatic, hypovolemic, hemorrhage, contusion, abrasion, severe, uncontrolled.
DO use words like: cut, bleeding, hurt, broken, bruise, scrape, bad, serious, heavy.

Use words that a child or someone with basic education would understand. Be direct and clear. Pretend you're explaining to your grandmother who doesn't know medical terms.

Analyze for: handwritten signs, medical forms, emergency messages, injury descriptions. Assess urgency based on signs of danger (pain, bleeding, trapped, help, emergency, insulin, allergic, etc.). Describe what you see in the simplest possible terms.`
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
            predictedConditions: [],
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

  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getUITranslations = (langCode) => {
    const translations = {
      en: {
        urgencyLevel: 'Urgency Level',
        criticalEmergency: 'CRITICAL EMERGENCY',
        immediateResponse: 'Immediate response required',
        sendAlert: 'Send Alert',
        viewLocation: 'View Location on Map',
        detectedText: 'Detected Text',
        translation: 'Translation',
        medicalKeywords: 'Medical Keywords',
        context: 'Context',
        suggestedResponse: 'Suggested Response',
        predictedConditions: 'Predicted Conditions (AI Analysis)',
        notes: 'Notes',
        highProbability: 'HIGH PROBABILITY',
        mediumProbability: 'MEDIUM PROBABILITY',
        lowProbability: 'LOW PROBABILITY',
        aiDisclaimer: 'AI predictions are for reference only. Always verify with proper medical assessment.',
        low: 'LOW',
        medium: 'MEDIUM',
        high: 'HIGH',
        critical: 'CRITICAL'
      },
      es: { urgencyLevel: 'Nivel de Urgencia', criticalEmergency: 'EMERGENCIA CRÍTICA', immediateResponse: 'Respuesta inmediata requerida', sendAlert: 'Enviar Alerta', viewLocation: 'Ver Ubicación en Mapa', detectedText: 'Texto Detectado', translation: 'Traducción', medicalKeywords: 'Palabras Clave Médicas', context: 'Contexto', suggestedResponse: 'Respuesta Sugerida', predictedConditions: 'Condiciones Predichas (Análisis IA)', notes: 'Notas', highProbability: 'ALTA PROBABILIDAD', mediumProbability: 'PROBABILIDAD MEDIA', lowProbability: 'BAJA PROBABILIDAD', aiDisclaimer: 'Las predicciones de IA son solo de referencia. Siempre verificar con evaluación médica.', low: 'BAJA', medium: 'MEDIA', high: 'ALTA', critical: 'CRÍTICA' },
      fr: { urgencyLevel: 'Niveau d\'Urgence', criticalEmergency: 'URGENCE CRITIQUE', immediateResponse: 'Réponse immédiate requise', sendAlert: 'Envoyer Alerte', viewLocation: 'Voir l\'Emplacement', detectedText: 'Texte Détecté', translation: 'Traduction', medicalKeywords: 'Mots-clés Médicaux', context: 'Contexte', suggestedResponse: 'Réponse Suggérée', predictedConditions: 'Conditions Prédites (IA)', notes: 'Notes', highProbability: 'HAUTE PROBABILITÉ', mediumProbability: 'PROBABILITÉ MOYENNE', lowProbability: 'BASSE PROBABILITÉ', aiDisclaimer: 'Les prédictions IA sont à titre indicatif. Toujours vérifier avec un médecin.', low: 'FAIBLE', medium: 'MOYEN', high: 'ÉLEVÉ', critical: 'CRITIQUE' },
      ar: { urgencyLevel: 'مستوى الطوارئ', criticalEmergency: 'طوارئ حرجة', immediateResponse: 'مطلوب استجابة فورية', sendAlert: 'إرسال تنبيه', viewLocation: 'عرض الموقع', detectedText: 'النص المكتشف', translation: 'ترجمة', medicalKeywords: 'كلمات طبية', context: 'السياق', suggestedResponse: 'الاستجابة المقترحة', predictedConditions: 'الحالات المتوقعة', notes: 'ملاحظات', highProbability: 'احتمال عالٍ', mediumProbability: 'احتمال متوسط', lowProbability: 'احتمال منخفض', aiDisclaimer: 'التنبؤات للإشارة فقط. تحقق دائمًا مع طبيب.', low: 'منخفض', medium: 'متوسط', high: 'عالٍ', critical: 'حرج' },
      zh: { urgencyLevel: '紧急程度', criticalEmergency: '危急紧急情况', immediateResponse: '需要立即响应', sendAlert: '发送警报', viewLocation: '查看位置', detectedText: '检测到的文本', translation: '翻译', medicalKeywords: '医疗关键词', context: '情况', suggestedResponse: '建议响应', predictedConditions: '预测病症', notes: '备注', highProbability: '高概率', mediumProbability: '中概率', lowProbability: '低概率', aiDisclaimer: 'AI预测仅供参考。请务必进行医疗评估。', low: '低', medium: '中', high: '高', critical: '危急' },
      hi: { urgencyLevel: 'आपातकाल स्तर', criticalEmergency: 'गंभीर आपातकाल', immediateResponse: 'तत्काल प्रतिक्रिया आवश्यक', sendAlert: 'अलर्ट भेजें', viewLocation: 'स्थान देखें', detectedText: 'पाया गया पाठ', translation: 'अनुवाद', medicalKeywords: 'चिकित्सा शब्द', context: 'संदर्भ', suggestedResponse: 'सुझाई गई प्रतिक्रिया', predictedConditions: 'अनुमानित स्थितियाँ', notes: 'नोट्स', highProbability: 'उच्च संभावना', mediumProbability: 'मध्यम संभावना', lowProbability: 'कम संभावना', aiDisclaimer: 'AI भविष्यवाणी केवल संदर्भ के लिए है।', low: 'कम', medium: 'मध्यम', high: 'उच्च', critical: 'गंभीर' },
      pt: { urgencyLevel: 'Nível de Urgência', criticalEmergency: 'EMERGÊNCIA CRÍTICA', immediateResponse: 'Resposta imediata necessária', sendAlert: 'Enviar Alerta', viewLocation: 'Ver Localização', detectedText: 'Texto Detectado', translation: 'Tradução', medicalKeywords: 'Palavras-chave Médicas', context: 'Contexto', suggestedResponse: 'Resposta Sugerida', predictedConditions: 'Condições Previstas', notes: 'Notas', highProbability: 'ALTA PROBABILIDADE', mediumProbability: 'PROBABILIDADE MÉDIA', lowProbability: 'BAIXA PROBABILIDADE', aiDisclaimer: 'Previsões de IA são apenas para referência.', low: 'BAIXA', medium: 'MÉDIA', high: 'ALTA', critical: 'CRÍTICA' },
      ru: { urgencyLevel: 'Уровень Срочности', criticalEmergency: 'КРИТИЧЕСКАЯ СИТУАЦИЯ', immediateResponse: 'Требуется немедленный ответ', sendAlert: 'Отправить Сигнал', viewLocation: 'Показать Местоположение', detectedText: 'Обнаруженный Текст', translation: 'Перевод', medicalKeywords: 'Медицинские Ключевые Слова', context: 'Контекст', suggestedResponse: 'Предлагаемый Ответ', predictedConditions: 'Прогнозируемые Состояния', notes: 'Примечания', highProbability: 'ВЫСОКАЯ ВЕРОЯТНОСТЬ', mediumProbability: 'СРЕДНЯЯ ВЕРОЯТНОСТЬ', lowProbability: 'НИЗКАЯ ВЕРОЯТНОСТЬ', aiDisclaimer: 'Прогнозы ИИ только для справки.', low: 'НИЗКИЙ', medium: 'СРЕДНИЙ', high: 'ВЫСОКИЙ', critical: 'КРИТИЧЕСКИЙ' },
      uk: { urgencyLevel: 'Рівень Терміновості', criticalEmergency: 'КРИТИЧНА СИТУАЦІЯ', immediateResponse: 'Потрібна негайна відповідь', sendAlert: 'Надіслати Сигнал', viewLocation: 'Показати Місцезнаходження', detectedText: 'Виявлений Текст', translation: 'Переклад', medicalKeywords: 'Медичні Ключові Слова', context: 'Контекст', suggestedResponse: 'Запропонована Відповідь', predictedConditions: 'Прогнозовані Стани', notes: 'Примітки', highProbability: 'ВИСОКА ЙМОВІРНІСТЬ', mediumProbability: 'СЕРЕДНЯ ЙМОВІРНІСТЬ', lowProbability: 'НИЗЬКА ЙМОВІРНІСТЬ', aiDisclaimer: 'Прогнози ШІ лише для довідки.', low: 'НИЗЬКИЙ', medium: 'СЕРЕДНІЙ', high: 'ВИСОКИЙ', critical: 'КРИТИЧНИЙ' },
      tr: { urgencyLevel: 'Aciliyet Seviyesi', criticalEmergency: 'KRİTİK ACİL DURUM', immediateResponse: 'Acil müdahale gerekli', sendAlert: 'Alarm Gönder', viewLocation: 'Konumu Göster', detectedText: 'Algılanan Metin', translation: 'Çeviri', medicalKeywords: 'Tıbbi Anahtar Kelimeler', context: 'Bağlam', suggestedResponse: 'Önerilen Yanıt', predictedConditions: 'Tahmin Edilen Durumlar', notes: 'Notlar', highProbability: 'YÜKSEK OLASILIK', mediumProbability: 'ORTA OLASILIK', lowProbability: 'DÜŞÜK OLASILIK', aiDisclaimer: 'AI tahminleri sadece referans içindir.', low: 'DÜŞÜK', medium: 'ORTA', high: 'YÜKSEK', critical: 'KRİTİK' },
      nl: { urgencyLevel: 'Urgentieniveau', criticalEmergency: 'KRITIEKE NOODSITUATIE', immediateResponse: 'Onmiddellijke reactie vereist', sendAlert: 'Alarm Versturen', viewLocation: 'Locatie Bekijken', detectedText: 'Gedetecteerde Tekst', translation: 'Vertaling', medicalKeywords: 'Medische Trefwoorden', context: 'Context', suggestedResponse: 'Voorgestelde Reactie', predictedConditions: 'Voorspelde Aandoeningen', notes: 'Notities', highProbability: 'HOGE WAARSCHIJNLIJKHEID', mediumProbability: 'GEMIDDELDE WAARSCHIJNLIJKHEID', lowProbability: 'LAGE WAARSCHIJNLIJKHEID', aiDisclaimer: 'AI-voorspellingen zijn alleen ter referentie.', low: 'LAAG', medium: 'GEMIDDELD', high: 'HOOG', critical: 'KRITIEK' },
      de: { urgencyLevel: 'Dringlichkeitsstufe', criticalEmergency: 'KRITISCHER NOTFALL', immediateResponse: 'Sofortige Reaktion erforderlich', sendAlert: 'Alarm Senden', viewLocation: 'Standort Anzeigen', detectedText: 'Erkannter Text', translation: 'Übersetzung', medicalKeywords: 'Medizinische Schlüsselwörter', context: 'Kontext', suggestedResponse: 'Vorgeschlagene Antwort', predictedConditions: 'Vorhergesagte Zustände', notes: 'Notizen', highProbability: 'HOHE WAHRSCHEINLICHKEIT', mediumProbability: 'MITTLERE WAHRSCHEINLICHKEIT', lowProbability: 'NIEDRIGE WAHRSCHEINLICHKEIT', aiDisclaimer: 'KI-Vorhersagen sind nur zur Referenz.', low: 'NIEDRIG', medium: 'MITTEL', high: 'HOCH', critical: 'KRITISCH' },
      ko: { urgencyLevel: '긴급도', criticalEmergency: '위급 상황', immediateResponse: '즉각적인 대응 필요', sendAlert: '경보 전송', viewLocation: '위치 보기', detectedText: '감지된 텍스트', translation: '번역', medicalKeywords: '의료 키워드', context: '상황', suggestedResponse: '제안된 대응', predictedConditions: '예측 상태', notes: '참고사항', highProbability: '높은 가능성', mediumProbability: '중간 가능성', lowProbability: '낮은 가능성', aiDisclaimer: 'AI 예측은 참고용입니다. 항상 의료 평가를 받으세요.', low: '낮음', medium: '중간', high: '높음', critical: '위급' },
      ja: { urgencyLevel: '緊急度', criticalEmergency: '重大緊急事態', immediateResponse: '即時対応が必要', sendAlert: '警報送信', viewLocation: '場所を表示', detectedText: '検出されたテキスト', translation: '翻訳', medicalKeywords: '医療キーワード', context: '状況', suggestedResponse: '推奨対応', predictedConditions: '予測される状態', notes: '注意事項', highProbability: '高確率', mediumProbability: '中確率', lowProbability: '低確率', aiDisclaimer: 'AI予測は参考用です。', low: '低', medium: '中', high: '高', critical: '重大' },
      vi: { urgencyLevel: 'Mức Độ Khẩn Cấp', criticalEmergency: 'KHẨN CẤP NGHIÊM TRỌNG', immediateResponse: 'Cần phản ứng ngay lập tức', sendAlert: 'Gửi Cảnh Báo', viewLocation: 'Xem Vị Trí', detectedText: 'Văn Bản Phát Hiện', translation: 'Dịch', medicalKeywords: 'Từ Khóa Y Tế', context: 'Bối Cảnh', suggestedResponse: 'Phản Ứng Đề Xuất', predictedConditions: 'Tình Trạng Dự Đoán', notes: 'Ghi Chú', highProbability: 'KHẢ NĂNG CAO', mediumProbability: 'KHẢ NĂNG TRUNG BÌNH', lowProbability: 'KHẢ NĂNG THẤP', aiDisclaimer: 'Dự đoán AI chỉ để tham khảo.', low: 'THẤP', medium: 'TRUNG BÌNH', high: 'CAO', critical: 'NGHIÊM TRỌNG' },
      th: { urgencyLevel: 'ระดับความเร่งด่วน', criticalEmergency: 'ภาวะฉุกเฉินวิกฤต', immediateResponse: 'ต้องการการตอบสนองทันที', sendAlert: 'ส่งการแจ้งเตือน', viewLocation: 'ดูตำแหน่ง', detectedText: 'ข้อความที่ตรวจพบ', translation: 'การแปล', medicalKeywords: 'คำหลักทางการแพทย์', context: 'บริบท', suggestedResponse: 'การตอบสนองที่แนะนำ', predictedConditions: 'สภาวะที่คาดการณ์', notes: 'หมายเหตุ', highProbability: 'โอกาสสูง', mediumProbability: 'โอกาสปานกลาง', lowProbability: 'โอกาสต่ำ', aiDisclaimer: 'การคาดการณ์ AI เพื่อการอ้างอิงเท่านั้น', low: 'ต่ำ', medium: 'ปานกลาง', high: 'สูง', critical: 'วิกฤต' },
      id: { urgencyLevel: 'Tingkat Urgensi', criticalEmergency: 'DARURAT KRITIS', immediateResponse: 'Respons segera diperlukan', sendAlert: 'Kirim Peringatan', viewLocation: 'Lihat Lokasi', detectedText: 'Teks Terdeteksi', translation: 'Terjemahan', medicalKeywords: 'Kata Kunci Medis', context: 'Konteks', suggestedResponse: 'Respons yang Disarankan', predictedConditions: 'Kondisi yang Diprediksi', notes: 'Catatan', highProbability: 'KEMUNGKINAN TINGGI', mediumProbability: 'KEMUNGKINAN SEDANG', lowProbability: 'KEMUNGKINAN RENDAH', aiDisclaimer: 'Prediksi AI hanya untuk referensi.', low: 'RENDAH', medium: 'SEDANG', high: 'TINGGI', critical: 'KRITIS' },
      tl: { urgencyLevel: 'Antas ng Kagyat', criticalEmergency: 'KRITIKAL NA EMERHENSYA', immediateResponse: 'Kailangan ng agarang tugon', sendAlert: 'Magpadala ng Alerto', viewLocation: 'Tingnan ang Lokasyon', detectedText: 'Natukoy na Teksto', translation: 'Salin', medicalKeywords: 'Medikal na Keyword', context: 'Konteksto', suggestedResponse: 'Iminumungkahing Tugon', predictedConditions: 'Hinulaang Kalagayan', notes: 'Mga Tala', highProbability: 'MATAAS NA POSIBILIDAD', mediumProbability: 'KATAMTAMANG POSIBILIDAD', lowProbability: 'MABABANG POSIBILIDAD', aiDisclaimer: 'Ang AI predictions ay para lamang sa reference.', low: 'MABABA', medium: 'KATAMTAMAN', high: 'MATAAS', critical: 'KRITIKAL' },
      bn: { urgencyLevel: 'জরুরিতার স্তর', criticalEmergency: 'গুরুতর জরুরি অবস্থা', immediateResponse: 'তাৎক্ষণিক প্রতিক্রিয়া প্রয়োজন', sendAlert: 'সতর্কতা পাঠান', viewLocation: 'অবস্থান দেখুন', detectedText: 'শনাক্ত করা টেক্সট', translation: 'অনুবাদ', medicalKeywords: 'চিকিৎসা শব্দ', context: 'প্রসঙ্গ', suggestedResponse: 'প্রস্তাবিত প্রতিক্রিয়া', predictedConditions: 'পূর্বাভাসিত অবস্থা', notes: 'নোট', highProbability: 'উচ্চ সম্ভাবনা', mediumProbability: 'মাঝারি সম্ভাবনা', lowProbability: 'কম সম্ভাবনা', aiDisclaimer: 'AI পূর্বাভাস শুধুমাত্র রেফারেন্সের জন্য।', low: 'কম', medium: 'মাঝারি', high: 'উচ্চ', critical: 'গুরুতর' },
      ur: { urgencyLevel: 'فوری سطح', criticalEmergency: 'انتہائی ایمرجنسی', immediateResponse: 'فوری جواب درکار', sendAlert: 'الرٹ بھیجیں', viewLocation: 'مقام دیکھیں', detectedText: 'شناخت شدہ متن', translation: 'ترجمہ', medicalKeywords: 'طبی مطلوبہ الفاظ', context: 'سیاق و سباق', suggestedResponse: 'تجویز کردہ جواب', predictedConditions: 'متوقع حالات', notes: 'نوٹس', highProbability: 'زیادہ امکان', mediumProbability: 'درمیانی امکان', lowProbability: 'کم امکان', aiDisclaimer: 'AI پیشن گوئیاں صرف حوالہ کے لیے ہیں۔', low: 'کم', medium: 'درمیانی', high: 'زیادہ', critical: 'انتہائی' },
      fa: { urgencyLevel: 'سطح فوریت', criticalEmergency: 'اورژانس بحرانی', immediateResponse: 'نیاز به پاسخ فوری', sendAlert: 'ارسال هشدار', viewLocation: 'مشاهده موقعیت', detectedText: 'متن شناسایی شده', translation: 'ترجمه', medicalKeywords: 'کلمات کلیدی پزشکی', context: 'زمینه', suggestedResponse: 'پاسخ پیشنهادی', predictedConditions: 'شرایط پیش‌بینی شده', notes: 'یادداشت‌ها', highProbability: 'احتمال بالا', mediumProbability: 'احتمال متوسط', lowProbability: 'احتمال پایین', aiDisclaimer: 'پیش‌بینی‌های هوش مصنوعی فقط برای مرجع است.', low: 'پایین', medium: 'متوسط', high: 'بالا', critical: 'بحرانی' },
      ps: { urgencyLevel: 'بیړنی کچه', criticalEmergency: 'جدي بیړنی حالت', immediateResponse: 'سمدستي ځواب ته اړتیا', sendAlert: 'خبرتیا واستوئ', viewLocation: 'موقعیت وګورئ', detectedText: 'وپیژندل شوی متن', translation: 'ژباړه', medicalKeywords: 'طبي کلیدي کلمې', context: 'شرایط', suggestedResponse: 'وړاندیز شوی ځواب', predictedConditions: 'وړاندوینه شوي حالتونه', notes: 'یادښتونه', highProbability: 'لوړه احتمال', mediumProbability: 'منځنی احتمال', lowProbability: 'ټیټه احتمال', aiDisclaimer: 'AI وړاندوینې یوازې د حوالې لپاره دي.', low: 'ټیټ', medium: 'منځنی', high: 'لوړ', critical: 'جدي' },
      ku: { urgencyLevel: 'Asta Lezgîniyê', criticalEmergency: 'REWŞA LEZGÎN A GİRİNG', immediateResponse: 'Bersiva bilez pêwîst e', sendAlert: 'Hişyariyê Bişîne', viewLocation: 'Cih Bibîne', detectedText: 'Nivîsa Dîtî', translation: 'Werger', medicalKeywords: 'Peyvên Sereke yên Bijîşkî', context: 'Ziman', suggestedResponse: 'Bersiva Pêşniyar', predictedConditions: 'Rewşên Pêşbînî', notes: 'Nîşan', highProbability: 'PÊBAWERBÛNA BILIND', mediumProbability: 'PÊBAWERBÛNA NAVÎN', lowProbability: 'PÊBAWERBÛNA NIZM', aiDisclaimer: 'Pêşbîniyên AI tenê ji bo referansê ne.', low: 'NIZM', medium: 'NAVÎN', high: 'BILIND', critical: 'GİRİNG' },
      so: { urgencyLevel: 'Heerka Degdegga', criticalEmergency: 'XAALAD DEGDEG HALIS AH', immediateResponse: 'Jawaab degdeg ah ayaa loo baahan yahay', sendAlert: 'Dir Digniin', viewLocation: 'Eeg Goobta', detectedText: 'Qoraalka la helay', translation: 'Turjumaad', medicalKeywords: 'Erayada Muhiimka ah ee Caafimaad', context: 'Macnaha', suggestedResponse: 'Jawaabta la soo jeediyay', predictedConditions: 'Xaaladaha la saadaaliyay', notes: 'Xusuusyo', highProbability: 'SUURTAGAL SARE', mediumProbability: 'SUURTAGAL DHEXE', lowProbability: 'SUURTAGAL HOOSE', aiDisclaimer: 'Saadaalinta AI waa tixraac oo keliya.', low: 'HOOSE', medium: 'DHEXE', high: 'SARE', critical: 'HALIS' },
      am: { urgencyLevel: 'የአስቸኳይ ደረጃ', criticalEmergency: 'ወሳኝ አስቸኳይ ሁኔታ', immediateResponse: 'አፋጣኝ ምላሽ ያስፈልጋል', sendAlert: 'ማስጠንቀቂያ ላክ', viewLocation: 'አካባቢ ይመልከቱ', detectedText: 'የተገኘ ጽሑፍ', translation: 'ትርጉም', medicalKeywords: 'የህክምና ቁልፍ ቃላት', context: 'አውድ', suggestedResponse: 'የታቀደ ምላሽ', predictedConditions: 'የተገመቱ ሁኔታዎች', notes: 'ማስታወሻዎች', highProbability: 'ከፍተኛ እድል', mediumProbability: 'መካከለኛ እድል', lowProbability: 'ዝቅተኛ እድል', aiDisclaimer: 'የአርቴፊሻል ኢንተለጀንስ ትንበያዎች ለማጣቀሻ ብቻ ናቸው።', low: 'ዝቅተኛ', medium: 'መካከለኛ', high: 'ከፍተኛ', critical: 'ወሳኝ' },
      ti: { urgencyLevel: 'ደረጃ ቅልጡፍነት', criticalEmergency: 'ወሳኒ ህጹጽ ኩነታት', immediateResponse: 'ቅልጡፍ መልሲ የድሊ', sendAlert: 'መጠንቀቂ ስደድ', viewLocation: 'ቦታ ርአ', detectedText: 'ዝተረኽበ ጽሑፍ', translation: 'ትርጉም', medicalKeywords: 'ቁልፊ ቓላት ሕክምና', context: 'ዛዕባ', suggestedResponse: 'ዝተሓሰበ መልሲ', predictedConditions: 'ዝተገመቱ ኩነታት', notes: 'መዘኻኽር', highProbability: 'ልዑል ተኽእሎ', mediumProbability: 'ማእከላይ ተኽእሎ', lowProbability: 'ትሑት ተኽእሎ', aiDisclaimer: 'AI ትንበያታት ንምዝኽኻር ጥራይ እዮም።', low: 'ትሑት', medium: 'ማእከላይ', high: 'ልዑል', critical: 'ወሳኒ' },
      sw: { urgencyLevel: 'Kiwango cha Dharura', criticalEmergency: 'DHARURA MUHIMU', immediateResponse: 'Jibu la haraka linahitajika', sendAlert: 'Tuma Tahadhari', viewLocation: 'Angalia Mahali', detectedText: 'Maandishi Yaliyogunduliwa', translation: 'Tafsiri', medicalKeywords: 'Maneno Muhimu ya Matibabu', context: 'Muktadha', suggestedResponse: 'Jibu Lililopendekezwa', predictedConditions: 'Hali Zilizokadiria', notes: 'Vidokezo', highProbability: 'UWEZEKANO WA JUU', mediumProbability: 'UWEZEKANO WA KATI', lowProbability: 'UWEZEKANO WA CHINI', aiDisclaimer: 'Utabiri wa AI ni kwa kumbukumbu tu.', low: 'CHINI', medium: 'KATI', high: 'JUU', critical: 'MUHIMU' },
      ha: { urgencyLevel: 'Matakin Gaggawa', criticalEmergency: 'GAGGAWAR MUHIMMANCI', immediateResponse: 'Ana buƙatar amsa cikin gaggawa', sendAlert: 'Aika Faɗakarwa', viewLocation: 'Duba Wurin', detectedText: 'Rubutun da aka Gano', translation: 'Fassara', medicalKeywords: 'Mahimman Kalmomin Likita', context: 'Yanayi', suggestedResponse: 'Amsar da aka Ba da Shawarar', predictedConditions: 'Yanayin da aka Hasashe', notes: 'Bayanai', highProbability: 'YIWUWAR SAMA', mediumProbability: 'YIWUWAR MATSAKAICI', lowProbability: 'YIWUWAR ƘASA', aiDisclaimer: 'Hasashen AI don tunani ne kawai.', low: 'ƘASA', medium: 'MATSAKAICI', high: 'SAMA', critical: 'MUHIMMANCI' },
      it: { urgencyLevel: 'Livello di Urgenza', criticalEmergency: 'EMERGENZA CRITICA', immediateResponse: 'Risposta immediata richiesta', sendAlert: 'Invia Allerta', viewLocation: 'Visualizza Posizione', detectedText: 'Testo Rilevato', translation: 'Traduzione', medicalKeywords: 'Parole Chiave Mediche', context: 'Contesto', suggestedResponse: 'Risposta Suggerita', predictedConditions: 'Condizioni Previste', notes: 'Note', highProbability: 'ALTA PROBABILITÀ', mediumProbability: 'MEDIA PROBABILITÀ', lowProbability: 'BASSA PROBABILITÀ', aiDisclaimer: 'Le previsioni AI sono solo di riferimento.', low: 'BASSA', medium: 'MEDIA', high: 'ALTA', critical: 'CRITICA' },
      pl: { urgencyLevel: 'Poziom Pilności', criticalEmergency: 'KRYTYCZNA SYTUACJA AWARYJNA', immediateResponse: 'Wymagana natychmiastowa reakcja', sendAlert: 'Wyślij Alert', viewLocation: 'Zobacz Lokalizację', detectedText: 'Wykryty Tekst', translation: 'Tłumaczenie', medicalKeywords: 'Słowa Kluczowe Medyczne', context: 'Kontekst', suggestedResponse: 'Sugerowana Odpowiedź', predictedConditions: 'Przewidywane Stany', notes: 'Notatki', highProbability: 'WYSOKIE PRAWDOPODOBIEŃSTWO', mediumProbability: 'ŚREDNIE PRAWDOPODOBIEŃSTWO', lowProbability: 'NISKIE PRAWDOPODOBIEŃSTWO', aiDisclaimer: 'Prognozy AI służą wyłącznie do celów informacyjnych.', low: 'NISKI', medium: 'ŚREDNI', high: 'WYSOKI', critical: 'KRYTYCZNY' },
      ro: { urgencyLevel: 'Nivel de Urgență', criticalEmergency: 'URGENȚĂ CRITICĂ', immediateResponse: 'Răspuns imediat necesar', sendAlert: 'Trimite Alertă', viewLocation: 'Vezi Locația', detectedText: 'Text Detectat', translation: 'Traducere', medicalKeywords: 'Cuvinte Cheie Medicale', context: 'Context', suggestedResponse: 'Răspuns Sugerat', predictedConditions: 'Condiții Previzionate', notes: 'Notițe', highProbability: 'PROBABILITATE MARE', mediumProbability: 'PROBABILITATE MEDIE', lowProbability: 'PROBABILITATE MICĂ', aiDisclaimer: 'Previziunile AI sunt doar pentru referință.', low: 'MIC', medium: 'MEDIU', high: 'MARE', critical: 'CRITIC' },
      el: { urgencyLevel: 'Επίπεδο Επείγουσας Ανάγκης', criticalEmergency: 'ΚΡΙΣΙΜΗ ΕΚΤΑΚΤΗ ΑΝΑΓΚΗ', immediateResponse: 'Απαιτείται άμεση απάντηση', sendAlert: 'Αποστολή Ειδοποίησης', viewLocation: 'Προβολή Τοποθεσίας', detectedText: 'Ανιχνευμένο Κείμενο', translation: 'Μετάφραση', medicalKeywords: 'Ιατρικές Λέξεις-Κλειδιά', context: 'Περιεχόμενο', suggestedResponse: 'Προτεινόμενη Απάντηση', predictedConditions: 'Προβλεπόμενες Καταστάσεις', notes: 'Σημειώσεις', highProbability: 'ΥΨΗΛΗ ΠΙΘΑΝΟΤΗΤΑ', mediumProbability: 'ΜΕΣΗ ΠΙΘΑΝΟΤΗΤΑ', lowProbability: 'ΧΑΜΗΛΗ ΠΙΘΑΝΟΤΗΤΑ', aiDisclaimer: 'Οι προβλέψεις AI είναι μόνο για αναφορά.', low: 'ΧΑΜΗΛΗ', medium: 'ΜΕΣΗ', high: 'ΥΨΗΛΗ', critical: 'ΚΡΙΣΙΜΗ' },
      he: { urgencyLevel: 'רמת דחיפות', criticalEmergency: 'מצב חירום קריטי', immediateResponse: 'נדרשת תגובה מיידית', sendAlert: 'שלח התראה', viewLocation: 'הצג מיקום', detectedText: 'טקסט שזוהה', translation: 'תרגום', medicalKeywords: 'מילות מפתח רפואיות', context: 'הקשר', suggestedResponse: 'תגובה מוצעת', predictedConditions: 'מצבים צפויים', notes: 'הערות', highProbability: 'סבירות גבוהה', mediumProbability: 'סבירות בינונית', lowProbability: 'סבירות נמוכה', aiDisclaimer: 'תחזיות AI הן להתייחסות בלבד.', low: 'נמוך', medium: 'בינוני', high: 'גבוה', critical: 'קריטי' },
      my: { urgencyLevel: 'အရေးပေါ်အဆင့်', criticalEmergency: 'အထူးအရေးပေါ်အခြေအနေ', immediateResponse: 'ချက်ခြင်းတုံ့ပြန်ရန်လိုအပ်သည်', sendAlert: 'သတိပေးချက်ပို့ပါ', viewLocation: 'တည်နေရာကြည့်ပါ', detectedText: 'ရှာဖွေတွေ့ရှိသောစာသား', translation: 'ဘာသာပြန်ချက်', medicalKeywords: 'ဆေးဘက်ဆိုင်ရာအဓိကစကားလုံးများ', context: 'အကြောင်းအရာ', suggestedResponse: 'အကြံပြုတုံ့ပြန်ချက်', predictedConditions: 'ခန့်မှန်းထားသောအခြေအနေများ', notes: 'မှတ်ချက်များ', highProbability: 'မြင့်မားသောဖြစ်နိုင်ခြေ', mediumProbability: 'အလတ်စားဖြစ်နိုင်ခြေ', lowProbability: 'နိမ့်သောဖြစ်နိုင်ခြေ', aiDisclaimer: 'AI ခန့်မှန်းချက်များသည် ရည်ညွှန်းရန်သာဖြစ်သည်။', low: 'နိမ့်', medium: 'အလတ်', high: 'မြင့်', critical: 'အထူး' },
      ne: { urgencyLevel: 'आकस्मिकताको स्तर', criticalEmergency: 'गम्भीर आपतकालीन', immediateResponse: 'तत्काल प्रतिक्रिया आवश्यक छ', sendAlert: 'चेतावनी पठाउनुहोस्', viewLocation: 'स्थान हेर्नुहोस्', detectedText: 'पत्ता लगाइएको पाठ', translation: 'अनुवाद', medicalKeywords: 'चिकित्सा मुख्य शब्दहरू', context: 'सन्दर्भ', suggestedResponse: 'सुझाव दिइएको प्रतिक्रिया', predictedConditions: 'अनुमानित अवस्थाहरू', notes: 'टिप्पणीहरू', highProbability: 'उच्च सम्भावना', mediumProbability: 'मध्यम सम्भावना', lowProbability: 'कम सम्भावना', aiDisclaimer: 'AI भविष्यवाणीहरू सन्दर्भको लागि मात्र हो।', low: 'कम', medium: 'मध्यम', high: 'उच्च', critical: 'गम्भीर' },
      si: { urgencyLevel: 'හදිසි මට්ටම', criticalEmergency: 'තීරණාත්මක හදිසි තත්ත්වය', immediateResponse: 'ක්ෂණික ප්‍රතිචාරයක් අවශ්‍යයි', sendAlert: 'ඇඟවීම යවන්න', viewLocation: 'ස්ථානය බලන්න', detectedText: 'හඳුනාගත් පාඨය', translation: 'පරිවර්තනය', medicalKeywords: 'වෛද්‍ය මූල පද', context: 'සන්දර්භය', suggestedResponse: 'යෝජිත ප්‍රතිචාරය', predictedConditions: 'අනාවැකි කළ තත්ත්වයන්', notes: 'සටහන්', highProbability: 'ඉහළ සම්භාවිතාව', mediumProbability: 'මධ්‍යම සම්භාවිතාව', lowProbability: 'අඩු සම්භාවිතාව', aiDisclaimer: 'AI අනාවැකි යොමුව සඳහා පමණි.', low: 'අඩු', medium: 'මධ්‍යම', high: 'ඉහළ', critical: 'තීරණාත්මක' },
      ta: { urgencyLevel: 'அவசர நிலை', criticalEmergency: 'முக்கியமான அவசரநிலை', immediateResponse: 'உடனடி பதில் தேவை', sendAlert: 'எச்சரிக்கையை அனுப்பு', viewLocation: 'இடத்தைக் காண்க', detectedText: 'கண்டறியப்பட்ட உரை', translation: 'மொழிபெயர்ப்பு', medicalKeywords: 'மருத்துவ முக்கிய சொற்கள்', context: 'சூழல்', suggestedResponse: 'பரிந்துரைக்கப்பட்ட பதில்', predictedConditions: 'கணிக்கப்பட்ட நிலைமைகள்', notes: 'குறிப்புகள்', highProbability: 'உயர் சாத்தியம்', mediumProbability: 'நடுத்தர சாத்தியம்', lowProbability: 'குறைந்த சாத்தியம்', aiDisclaimer: 'AI கணிப்புகள் குறிப்புக்கு மட்டுமே.', low: 'குறைந்த', medium: 'நடுத்தர', high: 'உயர்', critical: 'முக்கியமான' }
    };
    return translations[langCode] || translations.en;
  };

  const sendEmergencyAlert = () => {
    if (!result) return;

    const locationStr = location 
      ? `Location: https://www.google.com/maps?q=${location.latitude},${location.longitude}\nCoordinates: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
      : 'Location: Not available';

    const alertMessage = `🚨 CRITICAL EMERGENCY ALERT 🚨\n\n` +
      `Urgency Level: ${result.urgencyLevel?.toUpperCase()}\n\n` +
      `Detected Issue: ${result.detectedText || 'See image'}\n\n` +
      `Translation: ${result.translation || 'N/A'}\n\n` +
      `Medical Keywords: ${result.medicalKeywords?.join(', ') || 'None'}\n\n` +
      `Context: ${result.context || 'N/A'}\n\n` +
      `Suggested Response: ${result.suggestedResponse || 'N/A'}\n\n` +
      `${locationStr}\n\n` +
      `Time: ${new Date().toLocaleString()}\n\n` +
      `Additional Notes: ${result.additionalNotes || 'None'}`;

    // Copy to clipboard
    copyToClipboard(alertMessage, 'emergency');

    // Open mailto with pre-filled content
    const subject = encodeURIComponent('🚨 CRITICAL EMERGENCY - Immediate Response Required');
    const body = encodeURIComponent(alertMessage);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');

    alert('Emergency alert copied to clipboard and email composer opened. Please send to local emergency services and hospitals.');
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

        {GEMINI_API_KEY === "" && (
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
                  <div className="font-semibold text-sm uppercase mb-1">{getUITranslations(targetLang).urgencyLevel}</div>
                  <div className="text-2xl font-bold">{getUITranslations(targetLang)[result.urgencyLevel?.toLowerCase()] || result.urgencyLevel?.toUpperCase()}</div>
                </div>

                {result.urgencyLevel?.toLowerCase() === 'critical' && (
                  <div className="bg-red-600 text-white rounded-lg p-4 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-lg mb-1">🚨 {getUITranslations(targetLang).criticalEmergency}</div>
                        <div className="text-sm">{getUITranslations(targetLang).immediateResponse}</div>
                      </div>
                      <button
                        onClick={sendEmergencyAlert}
                        className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {getUITranslations(targetLang).sendAlert}
                      </button>
                    </div>
                    {location && (
                      <div className="mt-3 text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <a 
                          href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-red-100"
                        >
                          {getUITranslations(targetLang).viewLocation}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {result.detectedText && (
                  <div className="border rounded-lg p-4">
                    <div className="font-semibold text-sm text-gray-600 mb-2 flex items-center justify-between">
                      <span>{getUITranslations(targetLang).detectedText} ({result.detectedLanguage})</span>
                      <button
                        onClick={() => copyToClipboard(result.detectedText, 'detectedText')}
                        className="text-gray-500 hover:text-gray-700 transition"
                        title="Copy to clipboard"
                      >
                        {copiedField === 'detectedText' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="text-gray-800">{result.detectedText}</div>
                  </div>
                )}

                {result.translation && (
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <div className="font-semibold text-sm text-blue-800 mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {getUITranslations(targetLang).translation}
                      </div>
                      <button
                        onClick={() => copyToClipboard(result.translation, 'translation')}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Copy to clipboard"
                      >
                        {copiedField === 'translation' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="text-lg text-blue-900 font-medium">{result.translation}</div>
                  </div>
                )}

                {result.medicalKeywords?.length > 0 && (
                  <div className="border rounded-lg p-4 bg-red-50">
                    <div className="font-semibold text-sm text-red-800 mb-2">{getUITranslations(targetLang).medicalKeywords}</div>
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
                    <div className="font-semibold text-sm text-gray-600 mb-2 flex items-center justify-between">
                      <span>{getUITranslations(targetLang).context}</span>
                      <button
                        onClick={() => copyToClipboard(result.context, 'context')}
                        className="text-gray-500 hover:text-gray-700 transition"
                        title="Copy to clipboard"
                      >
                        {copiedField === 'context' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="text-gray-800">{result.context}</div>
                  </div>
                )}

                {result.suggestedResponse && (
                  <div className="border rounded-lg p-4 bg-green-50">
                    <div className="font-semibold text-sm text-green-800 mb-2 flex items-center justify-between">
                      <span>{getUITranslations(targetLang).suggestedResponse}</span>
                      <button
                        onClick={() => copyToClipboard(result.suggestedResponse, 'suggestedResponse')}
                        className="text-green-600 hover:text-green-800 transition"
                        title="Copy to clipboard"
                      >
                        {copiedField === 'suggestedResponse' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="text-gray-800">{result.suggestedResponse}</div>
                  </div>
                )}

                {result.predictedConditions?.length > 0 && (
                  <div className="border-2 rounded-lg p-4 bg-purple-50 border-purple-300">
                    <div className="font-semibold text-sm text-purple-800 mb-3 flex items-center justify-between">
                      <button
                        onClick={() => setIsPredictionsExpanded(!isPredictionsExpanded)}
                        className="flex items-center gap-2 hover:text-purple-900 transition"
                      >
                        <span>🔮 {getUITranslations(targetLang).predictedConditions}</span>
                        {isPredictionsExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      {isPredictionsExpanded && (
                        <button
                          onClick={() => copyToClipboard(
                            result.predictedConditions.map(c => `${c.condition} (${c.probability} probability): ${c.reasoning}`).join('\n\n'),
                            'predictedConditions'
                          )}
                          className="text-purple-600 hover:text-purple-800 transition"
                          title="Copy to clipboard"
                        >
                          {copiedField === 'predictedConditions' ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                    {isPredictionsExpanded && (
                      <>
                        <div className="space-y-3">
                          {result.predictedConditions.map((condition, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-3 border border-purple-200">
                              <div className="flex items-start justify-between mb-1">
                                <span className="font-semibold text-purple-900">{condition.condition}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  condition.probability === 'high' ? 'bg-red-200 text-red-800' :
                                  condition.probability === 'medium' ? 'bg-orange-200 text-orange-800' :
                                  'bg-yellow-200 text-yellow-800'
                                }`}>
                                  {condition.probability === 'high' ? getUITranslations(targetLang).highProbability :
                                   condition.probability === 'medium' ? getUITranslations(targetLang).mediumProbability :
                                   getUITranslations(targetLang).lowProbability}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mt-2">{condition.reasoning}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-xs text-purple-700 bg-purple-100 rounded p-2">
                          ⚠️ {getUITranslations(targetLang).aiDisclaimer}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {result.additionalNotes && (
                  <div className="border rounded-lg p-4 bg-yellow-50">
                    <div className="font-semibold text-sm text-yellow-800 mb-2 flex items-center justify-between">
                      <span>{getUITranslations(targetLang).notes}</span>
                      <button
                        onClick={() => copyToClipboard(result.additionalNotes, 'additionalNotes')}
                        className="text-yellow-600 hover:text-yellow-800 transition"
                        title="Copy to clipboard"
                      >
                        {copiedField === 'additionalNotes' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
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