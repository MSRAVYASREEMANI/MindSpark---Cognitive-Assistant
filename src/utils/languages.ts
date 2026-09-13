export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  category: 'north-east' | 'national';
  speechCode: string;
  greeting: string;
  iconName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  // English
  {
    code: 'english',
    name: 'English',
    nativeName: 'English (India)',
    region: 'North-East & Pan-India',
    category: 'national',
    speechCode: 'en-IN',
    greeting: 'Good morning! How are you feeling today?',
    iconName: 'language',
  },
  // North-East Indian Languages
  {
    code: 'assamese',
    name: 'Assamese',
    nativeName: 'অসমীয়া (Asamiya)',
    region: 'Assam',
    category: 'north-east',
    speechCode: 'as-IN',
    greeting: 'নমস্কাৰ! আপুনি আজি কেনে অনুভৱ কৰিছে?',
    iconName: 'local_cafe',
  },
  {
    code: 'bodo',
    name: 'Bodo',
    nativeName: 'बर\' (Boro)',
    region: 'Bodoland, Assam',
    category: 'north-east',
    speechCode: 'brx',
    greeting: 'खुलुमबाय! नोंथाङा दिनै माबोरै दं?',
    iconName: 'spa',
  },
  {
    code: 'meitei',
    name: 'Manipuri / Meitei',
    nativeName: 'মৈতৈলোন্ (Meiteilon)',
    region: 'Manipur',
    category: 'north-east',
    speechCode: 'mni',
    greeting: 'খোৰুমজৰি! অদোমঙসি কমদৌৰিবগে?',
    iconName: 'nature_people',
  },
  {
    code: 'mizo',
    name: 'Mizo',
    nativeName: 'Mizo ṭawng',
    region: 'Mizoram',
    category: 'north-east',
    speechCode: 'lus',
    greeting: 'Chibai! Vawiin i tha em?',
    iconName: 'terrain',
  },
  {
    code: 'khasi',
    name: 'Khasi',
    nativeName: 'Ka Ktien Khasi',
    region: 'Meghalaya',
    category: 'north-east',
    speechCode: 'kha',
    greeting: 'Khublei shibun! Kumno phi long mynta ka sngi?',
    iconName: 'cloud',
  },
  {
    code: 'garo',
    name: 'Garo',
    nativeName: 'A·chik / A·chikku',
    region: 'Meghalaya',
    category: 'north-east',
    speechCode: 'grt',
    greeting: 'Salam! Da·alo nambatokama?',
    iconName: 'forest',
  },
  {
    code: 'kokborok',
    name: 'Kokborok',
    nativeName: 'Kokborok (Tripuri)',
    region: 'Tripura',
    category: 'north-east',
    speechCode: 'trp',
    greeting: 'Khulumkha! Nung baha hai tong?',
    iconName: 'yard',
  },
  {
    code: 'bengali',
    name: 'Bengali',
    nativeName: 'বাংলা (Tripura & Barak Valley)',
    region: 'Tripura & Assam',
    category: 'north-east',
    speechCode: 'bn-IN',
    greeting: 'নমস্কার! আজ আপনি কেমন আছেন?',
    iconName: 'wb_sunny',
  },
  {
    code: 'nagamese',
    name: 'Nagamese / Naga',
    nativeName: 'Nagamese (Naga Creole)',
    region: 'Nagaland',
    category: 'north-east',
    speechCode: 'nag',
    greeting: 'Kene ase! Aji apuni bhal ase na?',
    iconName: 'diversity_3',
  },
  {
    code: 'nepali',
    name: 'Nepali',
    nativeName: 'नेपाली (Sikkim & Assam)',
    region: 'Sikkim & Assam',
    category: 'north-east',
    speechCode: 'ne-NP',
    greeting: 'नमस्ते! आज तपाईंलाई कस्तो छ?',
    iconName: 'landscape',
  },
  {
    code: 'nyishi',
    name: 'Nyishi / Tani',
    nativeName: 'Nyishi (Arunachal)',
    region: 'Arunachal Pradesh',
    category: 'north-east',
    speechCode: 'njz',
    greeting: 'Donyi Polo! No doolo hapa dolo?',
    iconName: 'hiking',
  },
  // Hindi & Telugu
  {
    code: 'hindi',
    name: 'Hindi',
    nativeName: 'हिन्दी (Hindi)',
    region: 'National / Pan-India',
    category: 'national',
    speechCode: 'hi-IN',
    greeting: 'नमस्ते! आज आप कैसा महसूस कर रहे हैं?',
    iconName: 'translate',
  },
  {
    code: 'telugu',
    name: 'Telugu',
    nativeName: 'తెలుగు (Telugu)',
    region: 'Andhra Pradesh & Telangana',
    category: 'national',
    speechCode: 'te-IN',
    greeting: 'నమస్కారం! ఈ రోజు మీరు ఎలా ఉన్నారు?',
    iconName: 'auto_stories',
  },
];

export const getLanguageByCode = (code: string): LanguageOption => {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
};
