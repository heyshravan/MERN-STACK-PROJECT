import React, { createContext, useContext, useState, useEffect, useRef } from "react";

// Supported 9 Languages
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", speechCode: "en-US", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", speechCode: "hi-IN", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", speechCode: "bn-IN", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", speechCode: "te-IN", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", speechCode: "ta-IN", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", speechCode: "kn-IN", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", speechCode: "ml-IN", flag: "🇮🇳" },
  { code: "es", name: "Spanish", nativeName: "Español", speechCode: "es-ES", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", speechCode: "fr-FR", flag: "🇫🇷" },
];

// Offline Travel Dictionary across all 9 languages for core UI elements
export const TRANSLATIONS = {
  en: {
    search_placeholder: "Search any destination, city, state, country, monument or attraction...",
    search_hint: "Try: Kashmir, Hyderabad, Taj Mahal, Switzerland, Bali, Eiffel Tower",
    voice_search: "Voice Search",
    listening: "Listening... speak now",
    stop_listening: "Stop Listening",
    language_select: "Language",
    overview_heading: "Overview & Heritage",
    weather_heading: "Live Weather & Forecast",
    temperature: "Temperature",
    humidity: "Humidity",
    wind: "Wind Speed",
    advisory: "Tourist Advisory",
    gallery_heading: "Verified Photo Gallery",
    attractions_heading: "Top Nearby Attractions",
    things_to_do: "Curated Things to Do",
    travel_essentials: "Travel Essentials",
    best_time: "Best Time to Visit",
    duration: "Recommended Duration",
    how_to_reach: "How to Reach",
    air: "By Air",
    rail: "By Rail",
    road: "By Road",
    local_transport: "Local Transport",
    budget_heading: "Estimated Travel Budget",
    video_heading: "Authentic 4K Travel Tour",
    plan_trip: "Plan a Trip to this Destination",
    navigate: "Navigate",
    book_ride: "Book Ride",
    listen_guide: "Audio Guide",
    play: "Play",
    pause: "Pause",
    resume: "Resume",
    stop: "Stop",
    reading_aloud: "Audio Guide Playing",
    not_supported_tts: "Text-to-speech is not supported on this browser.",
    not_supported_stt: "Voice search is not supported on this browser. Try Chrome or Edge.",
    fallback_trans: "Gemini live translation is in fallback mode. Showing curated multilingual guide.",
    curated_destination: "ExploreX Curated",
    global_destination: "Global Discovery",
    budget_tier: "Budget Traveler",
    standard_tier: "Standard Explorer",
    luxury_tier: "Premium Luxury",
    directions_google: "Google Maps",
    ola_cabs: "Ola Cabs",
    uber_cabs: "Uber",
    close: "Close",
    fullscreen: "Fullscreen",
  },
  hi: {
    search_placeholder: "किसी भी गंतव्य, शहर, राज्य, देश, स्मारक या आकर्षण को खोजें...",
    search_hint: "उदाहरण: कश्मीर, हैदराबाद, ताजमहल, स्विट्जरलैंड, बाली, एफिल टॉवर",
    voice_search: "आवाज से खोजें",
    listening: "सुन रहे हैं... अब बोलें",
    stop_listening: "रोकें",
    language_select: "भाषा",
    overview_heading: "अवलोकन एवं विरासत",
    weather_heading: "वर्तमान मौसम और पूर्वानुमान",
    temperature: "तापमान",
    humidity: "आर्द्रता",
    wind: "हवा की गति",
    advisory: "पर्यटक सलाह",
    gallery_heading: "सत्यापित फोटो गैलरी",
    attractions_heading: "प्रमुख दर्शनीय स्थल",
    things_to_do: "करने योग्य प्रमुख गतिविधियाँ",
    travel_essentials: "यात्रा के लिए आवश्यक जानकारी",
    best_time: "घूमने का सर्वोत्तम समय",
    duration: "अनुशंसित अवधि",
    how_to_reach: "कैसे पहुँचें",
    air: "हवाई मार्ग द्वारा",
    rail: "रेल मार्ग द्वारा",
    road: "सड़क मार्ग द्वारा",
    local_transport: "स्थानीय परिवहन",
    budget_heading: "अनुमानित यात्रा बजट",
    video_heading: "प्रामाणिक 4K यात्रा टूर",
    plan_trip: "इस गंतव्य के लिए यात्रा की योजना बनाएं",
    navigate: "नेविगेट करें",
    book_ride: "राइड बुक करें",
    listen_guide: "ऑडियो गाइड",
    play: "चलाएं",
    pause: "रोकें",
    resume: "पुनः चलाएं",
    stop: "बंद करें",
    reading_aloud: "ऑडियो गाइड बज रहा है",
    not_supported_tts: "इस ब्राउज़र में टेक्स्ट-टू-स्पीच समर्थित नहीं है।",
    not_supported_stt: "इस ब्राउज़र में वॉयस सर्च समर्थित नहीं है। कृपया Chrome या Edge का उपयोग करें।",
    fallback_trans: "जेमिनी लाइव अनुवाद स्टैंडबाय में है। बहुभाषी गाइड प्रदर्शित हो रहा है।",
    curated_destination: "एक्सप्लोरएक्स चयनित",
    global_destination: "वैश्विक खोज",
    budget_tier: "बजट यात्री",
    standard_tier: "मानक खोजकर्ता",
    luxury_tier: "प्रीमियम लक्जरी",
    directions_google: "गूगल मैप्स",
    ola_cabs: "ओला कैब्स",
    uber_cabs: "उबर",
    close: "बंद करें",
    fullscreen: "पूर्ण स्क्रीन",
  },
  bn: {
    search_placeholder: "যেকোনো গন্তব্য, শহর, রাজ্য, দেশ, স্মৃতিস্তম্ভ বা আকর্ষণ খুঁজুন...",
    search_hint: "চেষ্টা করুন: কাশ্মীর, হায়দ্রাবাদ, তাজমহল, সুইজারল্যান্ড, বালি, আইফেল টাওয়ার",
    voice_search: "ভয়েস অনুসন্ধান",
    listening: "শুনছি... এখন বলুন",
    stop_listening: "থামুন",
    language_select: "ভাষা",
    overview_heading: "একনজরে ও ঐতিহ্য",
    weather_heading: "লাইভ আবহাওয়া ও পূর্বাভাস",
    temperature: "তাপমাত্রা",
    humidity: "আর্দ্রতা",
    wind: "বাতাসের গতি",
    advisory: "পর্যটক পরামর্শ",
    gallery_heading: "যাচাইকৃত ছবির গ্যালারি",
    attractions_heading: "শীর্ষ পর্যটন আকর্ষণ",
    things_to_do: "দর্শনীয় কার্যকলাপ",
    travel_essentials: "ভ্রমণ নির্দেশিকা",
    best_time: "ভ্রমণের সেরা সময়",
    duration: "সুপারিশকৃত সময়কাল",
    how_to_reach: "কীভাবে পৌঁছাবেন",
    air: "আকাশপথে",
    rail: "রেলপথে",
    road: "সড়কপথে",
    local_transport: "স্থানীয় পরিবহন",
    budget_heading: "আনুমানিক ভ্রমণ বাজেট",
    video_heading: "প্রামাণ্য 4K ভিডিও ট্যুর",
    plan_trip: "এই গন্তব্যে ভ্রমণের পরিকল্পনা করুন",
    navigate: "নেভিগেট করুন",
    book_ride: "গাড়ি বুক করুন",
    listen_guide: "অডিও গাইড",
    play: "চালান",
    pause: "বিরতি",
    resume: "পুনরায় চালান",
    stop: "থামান",
    reading_aloud: "অডিও গাইড চলছে",
    not_supported_tts: "এই ব্রাউজারে টেক্সট-টু-স্পিচ সমর্থিত নয়।",
    not_supported_stt: "এই ব্রাউজারে ভয়েস সার্চ সমর্থিত নয়। Chrome বা Edge ব্যবহার করুন।",
    fallback_trans: "জেমিনি লাইভ অনুবাদ স্ট্যান্ডবাই মোডে আছে। অনুবাদিত নির্দেশিকা প্রদর্শিত হচ্ছে।",
    curated_destination: "এক্সপ্লোরএক্স কিউরেটেড",
    global_destination: "গ্লোবাল ডিসকভারি",
    budget_tier: "বাজেট ভ্রমণকারী",
    standard_tier: "স্ট্যান্ডার্ড এক্সপ্লোরার",
    luxury_tier: "প্রিমিয়াম লাক্সারি",
    directions_google: "গুগল ম্যাপস",
    ola_cabs: "ওলা ক্যাবস",
    uber_cabs: "উবার",
    close: "বন্ধ করুন",
    fullscreen: "ফুলস্ক্রিন",
  },
  te: {
    search_placeholder: "ఏదైనా గమ్యస్థానం, నగరం, రాష్ట్రం, దేశం, స్మారక చిహ్నాన్ని శోధించండి...",
    search_hint: "ఉదాహరణ: కాశ్మీర్, హైదరాబాద్, తాజ్ మహల్, స్విట్జర్లాండ్, బాలి, ఈఫిల్ టవర్",
    voice_search: "వాయిస్ శోధన",
    listening: "వింటున్నాను... ఇప్పుడు మాట్లాడండి",
    stop_listening: "ఆపు",
    language_select: "భాష",
    overview_heading: "అవలోకనం & వారసత్వం",
    weather_heading: "ప్రత్యక్ష వాతావరణం & సూచన",
    temperature: "ఉష్ణోగ్రత",
    humidity: "తేమ",
    wind: "గాలి వేగం",
    advisory: "పర్యాటక సలహా",
    gallery_heading: "ధృవీకరించబడిన ఫోటో గ్యాలరీ",
    attractions_heading: "ప్రధాన పర్యాటక ఆకర్షణలు",
    things_to_do: "చేయవలసిన పనులు",
    travel_essentials: "ప్రయాణ అవసరాలు",
    best_time: "సందర్శించడానికి ఉత్తమ సమయం",
    duration: "సిఫార్సు చేయబడిన వ్యవధి",
    how_to_reach: "ఎలా చేరుకోవాలి",
    air: "విమానం ద్వారా",
    rail: "రైలు ద్వారా",
    road: "రోడ్డు ద్వారా",
    local_transport: "స్థానిక రవాణా",
    budget_heading: "అంచనా వేసిన ప్రయాణ బడ్జెట్",
    video_heading: "ప్రామాణిక 4K ట్రావెల్ టూర్",
    plan_trip: "ఈ గమ్యస్థానానికి పర్యటనను ప్లాన్ చేయండి",
    navigate: "నావిగేట్ చేయండి",
    book_ride: "రైడ్ బుక్ చేయండి",
    listen_guide: "ఆడియో గైడ్",
    play: "ప్లే చేయండి",
    pause: "పాజ్",
    resume: "పునఃప్రారంభించు",
    stop: "ఆపు",
    reading_aloud: "ఆడియో గైడ్ ప్లే అవుతోంది",
    not_supported_tts: "ఈ బ్రౌజర్‌లో టెక్స్ట్-టు-స్పీచ్ సపోర్ట్ చేయబడదు.",
    not_supported_stt: "ఈ బ్రౌజర్‌లో వాయిస్ సెర్చ్ సపోర్ట్ చేయబడదు. Chrome లేదా Edge వాడండి.",
    fallback_trans: "జెమిని లైవ్ అనువాదం అందుబాటులో లేదు. బహుభాషా గైడ్ ప్రదర్శించబడుతోంది.",
    curated_destination: "ఎక్స్‌ప్లోర్‌ఎక్స్ ఎంపిక",
    global_destination: "గ్లోబల్ డిస్కవరీ",
    budget_tier: "బడ్జెట్ ప్రయాణీకుడు",
    standard_tier: "ప్రామాణిక అన్వేషకుడు",
    luxury_tier: "ప్రీమియం విలాసవంతమైన",
    directions_google: "గూగుల్ మ్యాప్స్",
    ola_cabs: "ఓలా క్యాబ్స్",
    uber_cabs: "ఉబర్",
    close: "మూసివేయి",
    fullscreen: "పూర్తి స్క్రీన్",
  },
  ta: {
    search_placeholder: "எந்தவொரு இலக்கு, நகரம், மாநிலம், நாடு அல்லது நினைவுச்சின்னத்தைத் தேடுங்கள்...",
    search_hint: "முயற்சிக்கவும்: காஷ்மீர், ஹைதராபாத், தாஜ்மஹால், சுவிட்சர்லாந்து, பாலி",
    voice_search: "குரல் தேடல்",
    listening: "கேட்கிறது... இப்போது பேசுங்கள்",
    stop_listening: "நிறுத்து",
    language_select: "மொழி",
    overview_heading: "கண்ணோட்டம் மற்றும் பாரம்பரியம்",
    weather_heading: "நேரலை வானிலை & முன்னறிவிப்பு",
    temperature: "வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    wind: "காற்றின் வேகம்",
    advisory: "சுற்றுலா ஆலோசனை",
    gallery_heading: "புகைப்பட தொகுப்பு",
    attractions_heading: "முக்கிய சுற்றுலா இடங்கள்",
    things_to_do: "செய்ய வேண்டியவை",
    travel_essentials: "பயணக் குறிப்புகள்",
    best_time: "செல்ல சிறந்த நேரம்",
    duration: "பரிந்துரைக்கப்பட்ட கால அளவு",
    how_to_reach: "எப்படி அடைவது",
    air: "விமானம் மூலம்",
    rail: "ரயில் மூலம்",
    road: "சாலை மூலம்",
    local_transport: "உள்ளூர் போக்குவரத்து",
    budget_heading: "மதிப்பிடப்பட்ட பயண பட்ஜெட்",
    video_heading: "உண்மையான 4K வீடியோ டூர்",
    plan_trip: "இந்த இடத்திற்கு பயணத்தைத் திட்டமிடுங்கள்",
    navigate: "வழிகாட்டல்",
    book_ride: "வாகனம் முன்பதிவு செய்",
    listen_guide: "ஆடியோ வழிகாட்டி",
    play: "இயக்கு",
    pause: "இடைநிறுத்து",
    resume: "தொடரவும்",
    stop: "நிறுத்து",
    reading_aloud: "ஆடியோ வழிகாட்டி ஒலிக்கிறது",
    not_supported_tts: "இந்த உலாவியில் உரையிலிருந்து பேச்சு ஆதரிக்கப்படவில்லை.",
    not_supported_stt: "இந்த உலாவியில் குரல் தேடல் ஆதரிக்கப்படவில்லை. Chrome அல்லது Edge ஐப் பயன்படுத்தவும்.",
    fallback_trans: "லைவ் மொழிபெயர்ப்பு காத்திருப்பில் உள்ளது. கையேடு காட்டப்படுகிறது.",
    curated_destination: "எக்ஸ்ப்ளோர்எக்ஸ் தொகுப்பு",
    global_destination: "உலகளாவிய கண்டறிதல்",
    budget_tier: "பட்ஜெட் பயணி",
    standard_tier: "நிலையான ஆய்வாளர்",
    luxury_tier: "பிரீமியம் சொகுசு",
    directions_google: "கூகிள் வரைபடம்",
    ola_cabs: "ஓலா கேப்ஸ்",
    uber_cabs: "ஊபர்",
    close: "மூடு",
    fullscreen: "முழுத்திரை",
  },
  kn: {
    search_placeholder: "ಯಾವುದೇ ತಾಣ, ನಗರ, ರಾಜ್ಯ, ದೇಶ ಅಥವಾ ಸ್ಮಾರಕವನ್ನು ಹುಡುಕಿ...",
    search_hint: "ಪ್ರಯತ್ನಿಸಿ: ಕಾಶ್ಮೀರ, ಹೈದರಾಬಾದ್, ತಾಜ್ ಮಹಲ್, ಸ್ವಿಟ್ಜರ್ಲೆಂಡ್, ಬಾಲಿ",
    voice_search: "ಧ್ವನಿ ಹುಡುಕಾಟ",
    listening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ... ಈಗ ಮಾತನಾಡಿ",
    stop_listening: "ನಿಲ್ಲಿಸಿ",
    language_select: "ಭಾಷೆ",
    overview_heading: "ಅವಲೋಕನ ಮತ್ತು ಪರಂಪರೆ",
    weather_heading: "ನೇರ ಹವಾಮಾನ ಮತ್ತು ಮುನ್ಸೂಚನೆ",
    temperature: "ತಾಪಮಾನ",
    humidity: "ಆರ್ದ್ರತೆ",
    wind: "ಗಾಳಿಯ ವೇಗ",
    advisory: "ಪ್ರವಾಸಿ ಸಲಹೆ",
    gallery_heading: "ಫೋಟೋ ಗ್ಯಾಲರಿ",
    attractions_heading: "ಪ್ರಮುಖ ಪ್ರವಾಸಿ ತಾಣಗಳು",
    things_to_do: "ಮಾಡಬೇಕಾದ ಕೆಲಸಗಳು",
    travel_essentials: "ಪ್ರಯಾಣದ ಅಗತ್ಯತೆಗಳು",
    best_time: "ಭೇಟಿ ನೀಡಲು ಅತ್ಯುತ್ತಮ ಸಮಯ",
    duration: "ಶಿಫಾರಸು ಮಾಡಿದ ಅವಧಿ",
    how_to_reach: "ತಲುಪುವುದು ಹೇಗೆ",
    air: "ವಿಮಾನದ ಮೂಲಕ",
    rail: "ರೈಲಿನ ಮೂಲಕ",
    road: "ರಸ್ತೆಯ ಮೂಲಕ",
    local_transport: "ಸ್ಥಳೀಯ ಸಾರಿಗೆ",
    budget_heading: "ಅಂದಾಜು ಪ್ರಯಾಣ ಬಜೆಟ್",
    video_heading: "ಅಧಿಕೃತ 4K ವೀಡಿಯೊ ಪ್ರವಾಸ",
    plan_trip: "ಪ್ರವಾಸವನ್ನು ಯೋಜಿಸಿ",
    navigate: "ನ್ಯಾವಿಗೇಟ್ ಮಾಡಿ",
    book_ride: "ರೈಡ್ ಬುಕ್ ಮಾಡಿ",
    listen_guide: "ಆಡಿಯೋ ಗೈಡ್",
    play: "ಪ್ಲೇ ಮಾಡಿ",
    pause: "ವಿರಾಮ",
    resume: "ಪುನರಾರಂಭಿಸಿ",
    stop: "ನಿಲ್ಲಿಸಿ",
    reading_aloud: "ಆಡಿಯೋ ಗೈಡ್ ಚಾಲನೆಯಲ್ಲಿದೆ",
    not_supported_tts: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಟೆಕ್ಸ್ಟ್-ಟು-ಸ್ಪೀಚ್ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ.",
    not_supported_stt: "ಧ್ವನಿ ಹುಡುಕಾಟ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. Chrome ಬಳಸಿ.",
    fallback_trans: "ಲೈವ್ ಅನುವಾದ ಸ್ಟ್ಯಾಂಡ್‌ಬೈನಲ್ಲಿದೆ. ಮಾರ್ಗದರ್ಶಿ ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತಿದೆ.",
    curated_destination: "ಎಕ್ಸ್‌ಪ್ಲೋರ್‌ಎಕ್ಸ್ ಆಯ್ಕೆ",
    global_destination: "ಜಾಗತಿಕ ಶೋಧನೆ",
    budget_tier: "ಬಜೆಟ್ ಪ್ರಯಾಣಿಕ",
    standard_tier: "ಪ್ರಮಾಣಿತ ಪರಿಶೋಧಕ",
    luxury_tier: "ಪ್ರೀಮಿಯಂ ಐಷಾರಾಮಿ",
    directions_google: "ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್",
    ola_cabs: "ಓಲಾ ಕ್ಯಾಬ್ಸ್",
    uber_cabs: "ಉಬರ್",
    close: "ಮುಚ್ಚಿ",
    fullscreen: "ಪೂರ್ಣ ಪರದೆ",
  },
  ml: {
    search_placeholder: "ഏതെങ്കിലും ലക്ഷ്യസ്ഥാനം, നഗരം, സംസ്ഥാനം, രാജ്യം അല്ലെങ്കിൽ സ്മാരകം തിരയുക...",
    search_hint: "ശ്രമിക്കുക: കശ്മീർ, ഹൈദരാബാദ്, താജ്മഹൽ, സ്വിറ്റ്സർലൻഡ്, ബാലി",
    voice_search: "വോയ്സ് തിരയൽ",
    listening: "കേൾക്കുന്നു... ഇപ്പോൾ സംസാരിക്കുക",
    stop_listening: "നിർത്തുക",
    language_select: "ഭാഷ",
    overview_heading: "അവലോകനവും പൈതൃകവും",
    weather_heading: "തത്സമയ കാലാവസ്ഥയും പ്രവചനവും",
    temperature: "താപനില",
    humidity: "ഈർപ്പം",
    wind: "കാറ്റിന്റെ വേഗത",
    advisory: "വിനോദസഞ്ചാര ഉപദേശം",
    gallery_heading: "ഫോട്ടോ ഗാലറി",
    attractions_heading: "പ്രധാന ആകർഷണങ്ങൾ",
    things_to_do: "ചെയ്യേണ്ട കാര്യങ്ങൾ",
    travel_essentials: "യാത്രാ നിർദ്ദേശങ്ങൾ",
    best_time: "സന്ദർശിക്കാൻ അനുയോജ്യമായ സമയം",
    duration: "ശുപാർശ ചെയ്യുന്ന ദൈർഘ്യം",
    how_to_reach: "എങ്ങനെ എത്തിച്ചേരാം",
    air: "വിമാനം വഴി",
    rail: "ട്രെയിൻ വഴി",
    road: "റോഡ് വഴി",
    local_transport: "പ്രാദേശിക ഗതാഗതം",
    budget_heading: "കണക്കാക്കിയ യാത്രാ ബജറ്റ്",
    video_heading: "4K യാത്രാ വീഡിയോ ടൂർ",
    plan_trip: "യാത്ര പ്ലാൻ ചെയ്യുക",
    navigate: "നാവിഗേറ്റ് ചെയ്യുക",
    book_ride: "റൈഡ് ബുക്ക് ചെയ്യുക",
    listen_guide: "ഓഡിയോ ഗൈഡ്",
    play: "പ്ലേ ചെയ്യുക",
    pause: "താൽക്കാലികമായി നിർത്തുക",
    resume: "തുടരുക",
    stop: "നിർത്തുക",
    reading_aloud: "ഓഡിയോ ഗൈഡ് കേൾപ്പിക്കുന്നു",
    not_supported_tts: "ഈ ബ്രൗസറിൽ ടെക്സ്റ്റ്-ടു-സ്പീച്ച് പിന്തുണയ്ക്കുന്നില്ല.",
    not_supported_stt: "വോയ്സ് സെർച്ച് പിന്തുണയ്ക്കുന്നില്ല. Chrome ഉപയോഗിക്കുക.",
    fallback_trans: "തത്സമയ വിവർത്തനം ലഭ്യമല്ല. സാധാരണ ഗൈഡ് കാണിക്കുന്നു.",
    curated_destination: "എക്സ്പ്ലോർഎക്സ് ശേഖരം",
    global_destination: "ആഗോള കണ്ടെത്തൽ",
    budget_tier: "ബജറ്റ് യാത്രക്കാരൻ",
    standard_tier: "സ്റ്റാൻഡേർഡ് യാത്രികൻ",
    luxury_tier: "പ്രീമിയം ലക്ഷ്വറി",
    directions_google: "ഗൂഗിൾ മാപ്സ്",
    ola_cabs: "ഓല കാബ്സ്",
    uber_cabs: "ഊബർ",
    close: "അടയ്ക്കുക",
    fullscreen: "പൂർണ്ണസ്‌ക്രീൻ",
  },
  es: {
    search_placeholder: "Busca cualquier destino, ciudad, país, monumento o atracción...",
    search_hint: "Prueba: Cachemira, Hyderabad, Taj Mahal, Suiza, Bali, Torre Eiffel",
    voice_search: "Búsqueda por Voz",
    listening: "Escuchando... hable ahora",
    stop_listening: "Detener",
    language_select: "Idioma",
    overview_heading: "Descripción General y Patrimonio",
    weather_heading: "Clima en Vivo y Pronóstico",
    temperature: "Temperatura",
    humidity: "Humedad",
    wind: "Velocidad del Viento",
    advisory: "Aviso Turístico",
    gallery_heading: "Galería de Fotos Verificadas",
    attractions_heading: "Principales Atracciones Cercanas",
    things_to_do: "Actividades Recomendadas",
    travel_essentials: "Información Esencial de Viaje",
    best_time: "Mejor Época para Visitar",
    duration: "Duración Recomendada",
    how_to_reach: "Cómo Llegar",
    air: "Por Aire",
    rail: "Por Tren",
    road: "Por Carretera",
    local_transport: "Transporte Local",
    budget_heading: "Presupuesto Estimado de Viaje",
    video_heading: "Tour Auténtico en Video 4K",
    plan_trip: "Planificar un Viaje a este Destino",
    navigate: "Navegar",
    book_ride: "Reservar Transporte",
    listen_guide: "Audioguía",
    play: "Reproducir",
    pause: "Pausar",
    resume: "Reanudar",
    stop: "Detener",
    reading_aloud: "Audioguía en reproducción",
    not_supported_tts: "Texto a voz no está soportado en este navegador.",
    not_supported_stt: "La búsqueda por voz no es compatible. Utilice Chrome o Edge.",
    fallback_trans: "Traducción Gemini en modo respaldo. Mostrando guía multilingüe.",
    curated_destination: "ExploreX Curado",
    global_destination: "Descubrimiento Global",
    budget_tier: "Viajero Económico",
    standard_tier: "Explorador Estándar",
    luxury_tier: "Lujo Premium",
    directions_google: "Google Maps",
    ola_cabs: "Ola Cabs",
    uber_cabs: "Uber",
    close: "Cerrar",
    fullscreen: "Pantalla Completa",
  },
  fr: {
    search_placeholder: "Recherchez une destination, ville, région, monument ou attraction...",
    search_hint: "Essayez: Cachemire, Hyderabad, Taj Mahal, Suisse, Bali, Tour Eiffel",
    voice_search: "Recherche Vocale",
    listening: "Écoute en cours... parlez maintenant",
    stop_listening: "Arrêter",
    language_select: "Langue",
    overview_heading: "Aperçu et Patrimoine",
    weather_heading: "Météo en Direct et Prévisions",
    temperature: "Température",
    humidity: "Humidité",
    wind: "Vitesse du Vent",
    advisory: "Conseil Touristique",
    gallery_heading: "Galerie Photos Vérifiée",
    attractions_heading: "Principales Attractions à Proximité",
    things_to_do: "Activités Incontournables",
    travel_essentials: "Informations Essentielles",
    best_time: "Meilleure Période pour Visiter",
    duration: "Durée Recommandée",
    how_to_reach: "Comment s'y Rendre",
    air: "Par Avion",
    rail: "Par Train",
    road: "Par la Route",
    local_transport: "Transports Locaux",
    budget_heading: "Budget Estimé de Voyage",
    video_heading: "Visite Vidéo Authentique en 4K",
    plan_trip: "Planifier un Voyage vers cette Destination",
    navigate: "Itinéraire",
    book_ride: "Réserver un Chauffeur",
    listen_guide: "Guide Audio",
    play: "Lecture",
    pause: "Pause",
    resume: "Reprendre",
    stop: "Arrêter",
    reading_aloud: "Guide audio en cours de lecture",
    not_supported_tts: "La synthèse vocale n'est pas prise en charge sur ce navigateur.",
    not_supported_stt: "La recherche vocale n'est pas prise en charge. Utilisez Chrome ou Edge.",
    fallback_trans: "Traduction Gemini en mode secours. Affichage du guide multilingue.",
    curated_destination: "ExploreX Sélectionné",
    global_destination: "Découverte Mondiale",
    budget_tier: "Voyageur Économique",
    standard_tier: "Explorateur Standard",
    luxury_tier: "Luxe Premium",
    directions_google: "Google Maps",
    ola_cabs: "Ola Cabs",
    uber_cabs: "Uber",
    close: "Fermer",
    fullscreen: "Plein Écran",
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // 1. Language selection persisted in localStorage
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem("explorex_language");
      return saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved) ? saved : "en";
    } catch (e) {
      return "en";
    }
  });

  const setLanguage = (langCode) => {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === langCode)) return;
    setLanguageState(langCode);
    try {
      localStorage.setItem("explorex_language", langCode);
    } catch (e) {
      console.warn("Could not persist language to localStorage:", e);
    }
    // Stop any speech when switching languages
    stopSpeech();
  };

  // Helper for translated UI terms
  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en?.[key] || key;
  };

  const currentLangConfig =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // 2. Speech Synthesis (TTS) State & Controls
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentlySpeakingText, setCurrentlySpeakingText] = useState("");
  const isSpeechSynthesisSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const currentUtteranceRef = useRef(null);

  // Clean raw markdown/HTML for natural speech audio
  const sanitizeForSpeech = (rawText) => {
    if (!rawText) return "";
    return rawText
      .replace(/<[^>]*>/g, " ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[#*_`~>]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const speak = (text, langOverride) => {
    if (!isSpeechSynthesisSupported) {
      console.warn(t("not_supported_tts"));
      return false;
    }

    const cleanText = sanitizeForSpeech(text);
    if (!cleanText) return false;

    // Cancel existing utterance
    window.speechSynthesis.cancel();

    const targetLangCode = langOverride || language;
    const targetConfig =
      SUPPORTED_LANGUAGES.find((l) => l.code === targetLangCode) || currentLangConfig;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetConfig.speechCode;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick best matching system voice if available
    const voices = window.speechSynthesis.getVoices?.() || [];
    const matchedVoice =
      voices.find((v) => v.lang === targetConfig.speechCode) ||
      voices.find((v) => v.lang.startsWith(targetLangCode));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setCurrentlySpeakingText(cleanText);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentlySpeakingText("");
    };

    utterance.onerror = (err) => {
      // 'interrupted' is normal when user clicks Stop or switches page
      if (err.error !== "interrupted" && err.error !== "canceled") {
        console.warn("Speech synthesis error:", err);
      }
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentlySpeakingText("");
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  };

  const pauseSpeech = () => {
    if (!isSpeechSynthesisSupported || !isSpeaking) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const resumeSpeech = () => {
    if (!isSpeechSynthesisSupported || !isSpeaking) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const stopSpeech = () => {
    if (!isSpeechSynthesisSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentlySpeakingText("");
  };

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (isSpeechSynthesisSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeechSynthesisSupported]);

  // 3. Speech Recognition (STT Voice Search) State & Controls
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState(null);
  const recognitionRef = useRef(null);

  const isSpeechRecognitionSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startVoiceSearch = ({ onResult, onError, onEnd, langOverride }) => {
    if (!isSpeechRecognitionSupported) {
      const err = t("not_supported_stt");
      setRecognitionError(err);
      onError?.(err);
      return false;
    }

    // Abort prior recognition if active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    const SpeechRecClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecClass();

    const targetLangCode = langOverride || language;
    const targetConfig =
      SUPPORTED_LANGUAGES.find((l) => l.code === targetLangCode) || currentLangConfig;

    recognition.lang = targetConfig.speechCode;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setRecognitionError(null);
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
      if (transcript && onResult) {
        onResult(transcript);
      }
    };

    recognition.onerror = (event) => {
      let message = "Voice input error.";
      if (event.error === "no-speech") {
        message = "No speech detected. Please try speaking again.";
      } else if (event.error === "not-allowed") {
        message = "Microphone access was denied. Please allow microphone permission in your browser.";
      } else if (event.error === "network") {
        message = "Network error during speech recognition.";
      }
      setRecognitionError(message);
      onError?.(message);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      onEnd?.();
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      return true;
    } catch (e) {
      console.warn("Could not start speech recognition:", e);
      setIsListening(false);
      return false;
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // 4. Dynamic Multilingual Translation via Backend Gemini endpoint
  const translationCacheRef = useRef(new Map());

  const translateText = async (text, targetLang = language) => {
    if (!text || targetLang === "en") {
      return { translatedText: text, targetLang: "en" };
    }

    const cacheKey = `${targetLang}:${text.trim()}`;
    if (translationCacheRef.current.has(cacheKey)) {
      return { translatedText: translationCacheRef.current.get(cacheKey), targetLang };
    }

    try {
      const res = await fetch("http://localhost:5000/api/destinations/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang }),
      });

      if (res.ok) {
        const data = await res.json();
        const result = data.translatedText || text;
        translationCacheRef.current.set(cacheKey, result);
        return { translatedText: result, targetLang, fallback: Boolean(data.fallback) };
      }
    } catch (err) {
      console.warn("Translation request failed, using original text:", err.message);
    }

    return { translatedText: text, targetLang, fallback: true };
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLangConfig,
        SUPPORTED_LANGUAGES,
        t,
        // Speech Synthesis (Audio Guide)
        isSpeaking,
        isPaused,
        currentlySpeakingText,
        speak,
        pauseSpeech,
        resumeSpeech,
        stopSpeech,
        isSpeechSynthesisSupported,
        // Speech Recognition (Voice Search)
        isListening,
        recognitionError,
        startVoiceSearch,
        stopVoiceSearch,
        isSpeechRecognitionSupported,
        // Dynamic Translation
        translateText,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
