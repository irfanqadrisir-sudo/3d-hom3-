
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { generate360HomeImage } from './services/geminiService';
import { LoadingIndicator } from './components/LoadingIndicator';
import { VoiceAssistant } from './components/VoiceAssistant';
import { PhotoSphereViewerComponent } from './components/PhotoSphereViewer';
import { SavedDesignsGallery } from './components/SavedDesignsGallery';
import { ExamplePrompts } from './components/ExamplePrompts';

// --- I18n Translations ---
const translations = {
  en: {
    appTitle: 'AI 360° Home Generator',
    appSubtitle: "Describe your dream home, and we'll bring it to life in a 360° interactive view.",
    textPromptTab: 'Text Prompt',
    voiceAssistantTab: 'Voice Assistant',
    promptPlaceholder: 'e.g., A cozy cabin in the woods with a stone fireplace...',
    styleLabel: 'Style',
    timeOfDayLabel: 'Time of Day',
    cameraStyleLabel: 'Camera Style',
    generateButton: 'Generate 360° View',
    generatingButton: 'Generating...',
    loadingMessage: 'Generating your 360° view...',
    interactiveViewTitle: 'Your Interactive 360° View',
    photoSphereCaption: 'Your 360° Home View - Click and drag to explore',
    saveDesignButton: 'Save Design',
    designSavedMessage: 'This design has been saved!',
    savedDesignsTitle: 'My Saved Designs',
    viewButton: 'View',
    deleteButton: 'Delete',
    inspirationTitle: 'Need inspiration? Try one of these:',
    voiceAssistantReady: 'Assistant is ready. Tap the mic to speak.',
    voiceAssistantFinalPromptLabel: 'Final Prompt (edit or use summary from assistant)',
    voiceAssistantFinalPromptPlaceholder: 'The assistant will help you build this prompt...',
    voiceAssistantGenerateButton: 'Generate With This Prompt',
    voiceSystemInstruction: "You are a friendly and creative virtual architect. Your goal is to help the user design their dream home by asking clarifying questions. Guide them to describe the architectural style, materials, environment, time of day, and camera shots. Keep your responses concise and encouraging. At the end of the conversation, summarize the final design description for them in a single paragraph. YOU MUST SPEAK IN ENGLISH.",
    designDeleted: "Design deleted.",
    undoButton: "Undo",
  },
  es: {
    appTitle: 'Generador de Casas 360° con IA',
    appSubtitle: 'Describe la casa de tus sueños y la haremos realidad en una vista interactiva de 360°.',
    textPromptTab: 'Texto',
    voiceAssistantTab: 'Asistente de Voz',
    promptPlaceholder: 'Ej: Una acogedora cabaña en el bosque con una chimenea de piedra...',
    styleLabel: 'Estilo',
    timeOfDayLabel: 'Hora del Día',
    cameraStyleLabel: 'Estilo de Cámara',
    generateButton: 'Generar Vista 360°',
    generatingButton: 'Generando...',
    loadingMessage: 'Generando tu vista 360°...',
    interactiveViewTitle: 'Tu Vista Interactiva 360°',
    photoSphereCaption: 'Tu Vista 360° - Haz clic y arrastra para explorar',
    saveDesignButton: 'Guardar Diseño',
    designSavedMessage: '¡Este diseño ha sido guardado!',
    savedDesignsTitle: 'Mis Diseños Guardados',
    viewButton: 'Ver',
    deleteButton: 'Eliminar',
    inspirationTitle: '¿Necesitas inspiración? Prueba uno de estos:',
    voiceAssistantReady: 'El asistente está listo. Toca el micrófono para hablar.',
    voiceAssistantFinalPromptLabel: 'Prompt Final (edita o usa el resumen del asistente)',
    voiceAssistantFinalPromptPlaceholder: 'El asistente te ayudará a construir este prompt...',
    voiceAssistantGenerateButton: 'Generar con este Prompt',
    voiceSystemInstruction: "Eres un arquitecto virtual amigable y creativo. Tu objetivo es ayudar al usuario a diseñar la casa de sus sueños haciendo preguntas aclaratorias. Guíalos para que describan el estilo arquitectónico, los materiales, el entorno, la hora del día y las tomas de cámara. Mantén tus respuestas concisas y alentadoras. Al final de la conversación, resume la descripción final del diseño en un solo párrafo. DEBES HABLAR EN ESPAÑOL.",
    designDeleted: "Diseño eliminado.",
    undoButton: "Deshacer",
  },
  fr: {
    appTitle: 'Générateur de Maison 360° par IA',
    appSubtitle: 'Décrivez la maison de vos rêves, et nous lui donnerons vie dans une vue interactive à 360°.',
    textPromptTab: 'Texte',
    voiceAssistantTab: 'Assistant Vocal',
    promptPlaceholder: 'Ex: Un chalet confortable dans les bois avec une cheminée en pierre...',
    styleLabel: 'Style',
    timeOfDayLabel: 'Moment de la Journée',
    cameraStyleLabel: 'Style de Caméra',
    generateButton: 'Générer la Vue 360°',
    generatingButton: 'Génération...',
    loadingMessage: 'Génération de votre vue 360°...',
    interactiveViewTitle: 'Votre Vue Interactive 360°',
    photoSphereCaption: 'Votre Vue 360° - Cliquez et faites glisser pour explorer',
    saveDesignButton: 'Enregistrer le Design',
    designSavedMessage: 'Ce design a été enregistré !',
    savedDesignsTitle: 'Mes Designs Enregistrés',
    viewButton: 'Voir',
    deleteButton: 'Supprimer',
    inspirationTitle: "Besoin d'inspiration ? Essayez l'un de ceux-ci :",
    voiceAssistantReady: "L'assistant est prêt. Appuyez sur le micro pour parler.",
    voiceAssistantFinalPromptLabel: 'Prompt Final (modifiez ou utilisez le résumé de l\'assistant)',
    voiceAssistantFinalPromptPlaceholder: "L'assistant vous aidera à construire ce prompt...",
    voiceAssistantGenerateButton: 'Générer avec ce Prompt',
    voiceSystemInstruction: "Vous êtes un architecte virtuel amical et créatif. Votre objectif est d'aider l'utilisateur à concevoir la maison de ses rêves en posant des questions de clarification. Guidez-le pour décrire le style architectural, les matériaux, l'environnement, le moment de la journée et les plans de caméra. Gardez vos réponses concises et encourageantes. À la fin de la conversation, résumez la description finale du design en un seul paragraphe. VOUS DEVEZ PARLER EN FRANÇAIS.",
    designDeleted: "Design supprimé.",
    undoButton: "Annuler",
  },
  ja: {
    appTitle: 'AI 360° ホームジェネレーター',
    appSubtitle: 'あなたの夢の家を説明すれば、360°のインタラクティブビューで実現します。',
    textPromptTab: 'テキストプロンプト',
    voiceAssistantTab: '音声アシスタント',
    promptPlaceholder: '例：石の暖炉がある森の中の居心地の良いキャビン...',
    styleLabel: 'スタイル',
    timeOfDayLabel: '時間帯',
    cameraStyleLabel: 'カメラスタイル',
    generateButton: '360°ビューを生成',
    generatingButton: '生成中...',
    loadingMessage: '360°ビューを生成しています...',
    interactiveViewTitle: 'あなたのインタラクティブ360°ビュー',
    photoSphereCaption: '360°ホームビュー - クリック＆ドラッグで探索',
    saveDesignButton: 'デザインを保存',
    designSavedMessage: 'このデザインは保存されました！',
    savedDesignsTitle: '保存されたデザイン',
    viewButton: '表示',
    deleteButton: '削除',
    inspirationTitle: 'インスピレーションが必要ですか？これらを試してみてください：',
    voiceAssistantReady: 'アシスタントの準備ができました。マイクをタップして話してください。',
    voiceAssistantFinalPromptLabel: '最終プロンプト（編集またはアシスタントの要約を使用）',
    voiceAssistantFinalPromptPlaceholder: 'アシスタントがこのプロンプトの作成を手伝います...',
    voiceAssistantGenerateButton: 'このプロンプトで生成',
    voiceSystemInstruction: "あなたはフレンドリーで創造的なバーチャル建築家です。あなたの目標は、明確な質問をすることでユーザーが夢の家を設計するのを助けることです。建築様式、素材、環境、時間帯、カメラショットについて説明するように案内してください。回答は簡潔で励みになるものにしてください。会話の最後に、最終的なデザインの説明を1つの段落にまとめてください。あなたは日本語で話さなければなりません。",
    designDeleted: "デザインを削除しました。",
    undoButton: "元に戻す",
  },
  hi: {
    appTitle: 'एआई 360° होम जेनरेटर',
    appSubtitle: 'अपने सपनों के घर का वर्णन करें, और हम इसे 360° इंटरैक्टिव व्यू में जीवंत कर देंगे।',
    textPromptTab: 'टेक्स्ट प्रॉम्प्ट',
    voiceAssistantTab: 'वॉयस असिस्टेंट',
    promptPlaceholder: 'उदा., पत्थर की चिमनी के साथ जंगल में एक आरामदायक केबिन...',
    styleLabel: 'शैली',
    timeOfDayLabel: 'दिन का समय',
    cameraStyleLabel: 'कैमरा शैली',
    generateButton: '360° व्यू जेनरेट करें',
    generatingButton: 'जेनरेट हो रहा है...',
    loadingMessage: 'आपका 360° व्यू जेनरेट हो रहा है...',
    interactiveViewTitle: 'आपका इंटरैक्टिव 360° व्यू',
    photoSphereCaption: 'आपका 360° होम व्यू - एक्सप्लोर करने के लिए क्लिक करें और खींचें',
    saveDesignButton: 'डिज़ाइन सहेजें',
    designSavedMessage: 'यह डिज़ाइन सहेज लिया गया है!',
    savedDesignsTitle: 'मेरे सहेजे गए डिज़ाइन्स',
    viewButton: 'देखें',
    deleteButton: 'हटाएं',
    inspirationTitle: 'प्रेरणा चाहिए? इनमें से कोई एक आज़माएँ:',
    voiceAssistantReady: 'असिस्टेंट तैयार है। बोलने के लिए माइक पर टैप करें।',
    voiceAssistantFinalPromptLabel: 'अंतिम प्रॉम्प्ट (संपादित करें या सहायक से सारांश का उपयोग करें)',
    voiceAssistantFinalPromptPlaceholder: 'सहायक आपको यह प्रॉम्प्ट बनाने में मदद करेगा...',
    voiceAssistantGenerateButton: 'इस प्रॉम्प्ट के साथ जेनरेट करें',
    voiceSystemInstruction: "आप एक मैत्रीपूर्ण और रचनात्मक वर्चुअल वास्तुकार हैं। आपका लक्ष्य स्पष्ट प्रश्न पूछकर उपयोगकर्ता को उनके सपनों का घर डिजाइन करने में मदद करना है। उन्हें वास्तुशिल्प शैली, सामग्री, पर्यावरण, दिन का समय और कैमरा शॉट्स का वर्णन करने के लिए मार्गदर्शन करें। अपनी प्रतिक्रियाओं को संक्षिप्त और उत्साहजनक रखें। बातचीत के अंत में, उनके लिए अंतिम डिजाइन विवरण को एक पैराग्राफ में सारांशित करें। आपको हिंदी में बोलना होगा।",
    designDeleted: "डिज़ाइन हटा दिया गया।",
    undoButton: "पूर्ववत करें",
  },
  bn: {
    appTitle: 'এআই ৩৬০° হোম জেনারেটর',
    appSubtitle: 'আপনার স্বপ্নের বাড়ির বর্ণনা দিন, এবং আমরা এটিকে একটি ৩৬০° ইন্টারেক্টিভ ভিউতে জীবন্ত করে তুলব।',
    textPromptTab: 'টেক্সট প্রম্পট',
    voiceAssistantTab: 'ভয়েস অ্যাসিস্ট্যান্ট',
    promptPlaceholder: 'যেমন, পাথরের ফায়ারপ্লেস সহ জঙ্গলে একটি আরামদায়ক কেবিন...',
    styleLabel: 'শৈলী',
    timeOfDayLabel: 'দিনের সময়',
    cameraStyleLabel: 'ক্যামেরা স্টাইল',
    generateButton: '৩৬০° ভিউ জেনারেট করুন',
    generatingButton: 'জেনারেট হচ্ছে...',
    loadingMessage: 'আপনার ৩৬০° ভিউ জেনারেট করা হচ্ছে...',
    interactiveViewTitle: 'আপনার ইন্টারেক্টিভ ৩৬০° ভিউ',
    photoSphereCaption: 'আপনার ৩৬০° হোম ভিউ - অন্বেষণ করতে ক্লিক করুন এবং টেনে আনুন',
    saveDesignButton: 'ডিজাইন সংরক্ষণ করুন',
    designSavedMessage: 'এই ডিজাইনটি সংরক্ষণ করা হয়েছে!',
    savedDesignsTitle: 'আমার সংরক্ষিত ডিজাইন',
    viewButton: 'দেখুন',
    deleteButton: 'মুছে ফেলুন',
    inspirationTitle: 'অনুপ্রেরণা প্রয়োজন? এগুলির মধ্যে একটি চেষ্টা করুন:',
    voiceAssistantReady: 'সহকারী প্রস্তুত। কথা বলতে মাইকে আলতো চাপুন।',
    voiceAssistantFinalPromptLabel: 'চূড়ান্ত প্রম্পট (সম্পাদনা করুন বা সহকারীর সারাংশ ব্যবহার করুন)',
    voiceAssistantFinalPromptPlaceholder: 'সহকারী আপনাকে এই প্রম্পট তৈরি করতে সাহায্য করবে...',
    voiceAssistantGenerateButton: 'এই প্রম্পট দিয়ে জেনারেট করুন',
    voiceSystemInstruction: "আপনি একজন বন্ধুত্বপূর্ণ এবং সৃজনশীল ভার্চুয়াল স্থপতি। আপনার লক্ষ্য হল ব্যবহারকারীকে স্পষ্ট প্রশ্ন জিজ্ঞাসা করে তাদের স্বপ্নের বাড়ি ডিজাইন করতে সাহায্য করা। স্থাপত্য শৈলী, উপকরণ, পরিবেশ, দিনের সময় এবং ক্যামেরা শট বর্ণনা করার জন্য তাদের গাইড করুন। আপনার প্রতিক্রিয়া সংক্ষিপ্ত এবং উৎসাহব্যঞ্জক রাখুন। কথোপকথনের শেষে, তাদের জন্য চূড়ান্ত নকশার বিবরণ একটি অনুচ্ছেদে সংক্ষিপ্ত করুন। আপনাকে অবশ্যই বাংলায় কথা বলতে হবে।",
    designDeleted: "ডিজাইন মুছে ফেলা হয়েছে।",
    undoButton: "পূর্বাবস্থায় ফেরান",
  },
  ta: {
    appTitle: 'ஏஐ 360° முகப்பு ஜெனரேட்டர்',
    appSubtitle: 'உங்கள் கனவு இல்லத்தை விவரிக்கவும், நாங்கள் அதை 360° ஊடாடும் பார்வையில் உயிர்ப்பிப்போம்।',
    textPromptTab: 'உரை ப்ராம்ப்ட்',
    voiceAssistantTab: 'குரல் உதவியாளர்',
    promptPlaceholder: 'எ.கா., காட்டில் ஒரு கல் நெருப்பிடம் கொண்ட ஒரு வசதியான கேபின்...',
    styleLabel: 'பாணி',
    timeOfDayLabel: 'பகல் நேரம்',
    cameraStyleLabel: 'கேமரா பாணி',
    generateButton: '360° காட்சியை உருவாக்கவும்',
    generatingButton: 'உருவாக்குகிறது...',
    loadingMessage: 'உங்கள் 360° காட்சி உருவாக்கப்படுகிறது...',
    interactiveViewTitle: 'உங்கள் ஊடாடும் 360° காட்சி',
    photoSphereCaption: 'உங்கள் 360° முகப்பு காட்சி - ஆராய கிளிக் செய்து இழுக்கவும்',
    saveDesignButton: 'வடிவமைப்பைச் சேமி',
    designSavedMessage: 'இந்த வடிவமைப்பு சேமிக்கப்பட்டது!',
    savedDesignsTitle: 'எனது சேமித்த வடிவமைப்புகள்',
    viewButton: 'காண்க',
    deleteButton: 'நீக்கு',
    inspirationTitle: 'உத்வேகம் வேண்டுமா? இவற்றில் ஒன்றை முயற்சிக்கவும்:',
    voiceAssistantReady: 'உதவியாளர் தயாராக உள்ளார். பேச மைக்கைத் தட்டவும்.',
    voiceAssistantFinalPromptLabel: 'இறுதி ப்ராம்ப்ட் (உதவியாளரிடமிருந்து சுருக்கத்தைத் திருத்தவும் அல்லது பயன்படுத்தவும்)',
    voiceAssistantFinalPromptPlaceholder: 'இந்த ப்ராம்ப்டை உருவாக்க உதவியாளர் உங்களுக்கு உதவுவார்...',
    voiceAssistantGenerateButton: 'இந்த ப்ராம்ப்ட் மூலம் உருவாக்கவும்',
    voiceSystemInstruction: "நீங்கள் ஒரு நட்பான மற்றும் படைப்பாற்றல் மிக்க மெய்நிகர் கட்டிடக் கலைஞர். தெளிவுபடுத்தும் கேள்விகளைக் கேட்பதன் மூலம் பயனர் தங்கள் கனவு இல்லத்தை வடிவமைக்க உதவுவதே உங்கள் குறிக்கோள். கட்டிடக்கலை பாணி, பொருட்கள், சூழல், দিনের நேரம் மற்றும் கேமரா ஷாட்களை விவரிக்க அவர்களுக்கு வழிகாட்டவும். உங்கள் பதில்களை சுருக்கமாகவும் ஊக்கமாகவும் வைத்திருங்கள். உரையாடலின் முடிவில், இறுதி வடிவமைப்பு விளக்கத்தை அவர்களுக்காக ஒரே பத்தியில் சுருக்கவும். நீங்கள் தமிழில் பேச வேண்டும்.",
    designDeleted: "வடிவமைப்பு நீக்கப்பட்டது.",
    undoButton: "செயல்தவிர்",
  }
};

type Language = keyof typeof translations;
type TranslationKey = keyof typeof translations['en'];

const getTranslator = (lang: Language) => (key: TranslationKey): string => {
  return translations[lang]?.[key] || translations.en[key];
};

type Tab = 'text' | 'voice';

export interface Design {
  id: number;
  prompt: string;
  imageUrl: string;
}

const LanguageSelector: React.FC<{
  language: Language,
  onLanguageChange: (lang: Language) => void
}> = ({ language, onLanguageChange }) => {
  return (
    <div className="relative">
      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value as Language)}
        className="bg-gray-700 border border-gray-600 rounded-md py-2 pl-3 pr-8 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none appearance-none"
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
        <option value="ja">日本語</option>
        <option value="hi">हिन्दी</option>
        <option value="bn">বাংলা</option>
        <option value="ta">தமிழ்</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('A modern, minimalist two-story house with large glass windows, a wooden exterior, surrounded by a lush green forest.');
  const [currentGeneratedPrompt, setCurrentGeneratedPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [savedDesigns, setSavedDesigns] = useState<Design[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [recentlyDeleted, setRecentlyDeleted] = useState<Design | null>(null);
  const undoTimeoutRef = useRef<number | null>(null);

  const t = useMemo(() => getTranslator(language), [language]);

  // Customization state
  const [style, setStyle] = useState<string>('Modern');
  const [timeOfDay, setTimeOfDay] = useState<string>('Sunny Day');
  const [cameraShot, setCameraShot] = useState<string>('Cinematic');

  const examplePrompts = [
    "A futuristic biodome home on Mars with a view of Olympus Mons.",
    "An underwater research lab with large circular windows showing marine life.",
    "A cozy, Hobbit-style burrow built into a green hillside with a round door.",
    "A grand, gothic castle on a cliffside overlooking a stormy sea.",
    "A tranquil Japanese teahouse surrounded by a zen garden and cherry blossoms.",
    "A luxurious, multi-level treehouse connected by rope bridges in a redwood forest."
  ];

  useEffect(() => {
    try {
      const storedDesigns = localStorage.getItem('savedHomeDesigns');
      if (storedDesigns) {
        setSavedDesigns(JSON.parse(storedDesigns));
      }
      const storedLanguage = localStorage.getItem('appLanguage');
      if (storedLanguage && translations[storedLanguage as Language]) {
        setLanguage(storedLanguage as Language);
      }
    } catch (e) {
      console.error("Failed to parse from localStorage", e);
    }
  }, []);
  
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
  }

  const saveCurrentDesign = () => {
    if (imageUrl && currentGeneratedPrompt) {
      const newDesign: Design = {
        id: Date.now(),
        prompt: currentGeneratedPrompt,
        imageUrl: imageUrl,
      };
      const updatedDesigns = [...savedDesigns, newDesign];
      setSavedDesigns(updatedDesigns);
      localStorage.setItem('savedHomeDesigns', JSON.stringify(updatedDesigns));
    }
  };

  const loadDesign = (design: Design) => {
    setImageUrl(design.imageUrl);
    setCurrentGeneratedPrompt(design.prompt);
    setPrompt(design.prompt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUndoDelete = () => {
    if (!recentlyDeleted) return;
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
    setSavedDesigns(prevDesigns => 
        [...prevDesigns, recentlyDeleted].sort((a, b) => a.id - b.id)
    );
    setRecentlyDeleted(null);
  };

  const deleteDesign = (id: number) => {
    const designToDelete = savedDesigns.find(d => d.id === id);
    if (!designToDelete) return;

    if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
    }

    setRecentlyDeleted(designToDelete);

    const updatedDesigns = savedDesigns.filter(design => design.id !== id);
    setSavedDesigns(updatedDesigns);

    undoTimeoutRef.current = window.setTimeout(() => {
        localStorage.setItem('savedHomeDesigns', JSON.stringify(updatedDesigns));
        setRecentlyDeleted(null);
        undoTimeoutRef.current = null;
    }, 5000);
  };

  const handleGenerate = async (finalPrompt: string) => {
    if (!finalPrompt.trim()) {
      setError('Please enter a description for your home design.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    setCurrentGeneratedPrompt(finalPrompt);

    try {
      const url = await generate360HomeImage(finalPrompt);
      setImageUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while generating the image.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTextPromptGenerate = () => {
    const customizedPrompt = `${prompt}, in a ${style.toLowerCase()} architectural style. The scene is a ${cameraShot.toLowerCase()} shot during a ${timeOfDay.toLowerCase()}.`;
    handleGenerate(customizedPrompt);
  }

  const handleSelectExample = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };
  
  const renderContent = () => {
    const isDesignSaved = savedDesigns.some(d => d.imageUrl === imageUrl);

    return (
        <div className="p-4 md:p-8 flex flex-col items-center">
            <header className="w-full max-w-4xl text-center mb-8">
                <div className="flex justify-center items-center gap-4 mb-2">
                  <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                      {t('appTitle')}
                  </h1>
                  <LanguageSelector language={language} onLanguageChange={handleLanguageChange} />
                </div>
                <p className="text-gray-400 mt-2">{t('appSubtitle')}</p>
            </header>
            
            <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-6 shadow-2xl">
                <div className="flex justify-center border-b border-gray-700 mb-6">
                    <button onClick={() => setActiveTab('text')} className={`px-6 py-3 text-lg font-medium transition-all duration-300 ${activeTab === 'text' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}>
                        {t('textPromptTab')}
                    </button>
                    <button onClick={() => setActiveTab('voice')} className={`px-6 py-3 text-lg font-medium transition-all duration-300 ${activeTab === 'voice' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}>
                        {t('voiceAssistantTab')}
                    </button>
                </div>

                {activeTab === 'text' ? (
                    <div>
                        <textarea
                            className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none transition resize-none"
                            placeholder={t('promptPlaceholder')}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isLoading}
                        />
                        <ExamplePrompts prompts={examplePrompts} onSelect={handleSelectExample} t={t} />
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <label htmlFor="style" className="block text-sm font-medium text-gray-400 mb-1">{t('styleLabel')}</label>
                                <select id="style" value={style} onChange={e => setStyle(e.target.value)} disabled={isLoading} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none">
                                    <option>Modern</option>
                                    <option>Victorian</option>
                                    <option>Rustic</option>
                                    <option>Japanese</option>
                                    <option>Mediterranean</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="timeOfDay" className="block text-sm font-medium text-gray-400 mb-1">{t('timeOfDayLabel')}</label>
                                <select id="timeOfDay" value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)} disabled={isLoading} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none">
                                    <option>Sunny Day</option>
                                    <option>Golden Hour Sunset</option>
                                    <option>Starry Night</option>
                                    <option>Overcast</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="cameraShot" className="block text-sm font-medium text-gray-400 mb-1">{t('cameraStyleLabel')}</label>
                                <select id="cameraShot" value={cameraShot} onChange={e => setCameraShot(e.target.value)} disabled={isLoading} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none">
                                    <option>Cinematic</option>
                                    <option>Photorealistic</option>
                                    <option>Wide-angle</option>
                                    <option>Fisheye</option>
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={handleTextPromptGenerate}
                            disabled={isLoading}
                            className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? t('generatingButton') : t('generateButton')}
                        </button>
                    </div>
                ) : (
                    <VoiceAssistant onGenerate={handleGenerate} isLoading={isLoading} t={t} />
                )}
            </div>

            {error && <div className="mt-6 text-red-400 bg-red-900/50 p-4 rounded-md w-full max-w-2xl">{error}</div>}

            <div className="w-full max-w-4xl mt-8">
                {isLoading && <LoadingIndicator message={t('loadingMessage')} />}
                {imageUrl && (
                    <>
                        <PhotoSphereViewerComponent imageUrl={imageUrl} title={t('interactiveViewTitle')} caption={t('photoSphereCaption')} />
                        <div className="text-center mt-4">
                            {!isDesignSaved ? (
                                <button
                                    onClick={saveCurrentDesign}
                                    className="bg-green-500 text-white font-bold py-2 px-6 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-all duration-300"
                                >
                                    {t('saveDesignButton')}
                                </button>
                            ) : (
                                <p className="text-green-400">{t('designSavedMessage')}</p>
                            )}
                        </div>
                    </>
                )}
            </div>

            <SavedDesignsGallery designs={savedDesigns} onLoad={loadDesign} onDelete={deleteDesign} t={t} />

            {recentlyDeleted && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-700 text-white py-3 px-6 rounded-lg shadow-lg flex items-center justify-between z-50 animate-fade-in-up">
                    <p className="mr-4">{t('designDeleted')}</p>
                    <button
                        onClick={handleUndoDelete}
                        className="font-bold text-purple-400 hover:text-purple-300 transition-colors"
                        aria-label={t('undoButton')}
                    >
                        {t('undoButton')}
                    </button>
                </div>
            )}
        </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white font-sans pb-12">
      {renderContent()}
    </main>
  );
};

export default App;
