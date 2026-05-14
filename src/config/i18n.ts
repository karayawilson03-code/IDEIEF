import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      scan: 'Scan Crop',
      diagnosis: 'Diagnosis',
      lateBlight: 'Late Blight (Phytophthora infestans)',
      earlyBlight: 'Early Blight (Alternaria solani)',
      bacterialWilt: 'Bacterial Wilt (Ralstonia solanacearum)',
      healthy: 'Healthy',
      recommendation: 'Management Recommendation',
      retake: 'Low confidence — please retake in good lighting',
    }
  },
  sw: {
    translation: {
      scan: 'Piga Picha ya Mmea',
      diagnosis: 'Utambuzi',
      lateBlight: 'Kuoza Majani (Phytophthora infestans)',
      earlyBlight: 'Kuoza Mapema (Alternaria solani)',
      bacterialWilt: 'Kunyauka kwa Bakteria',
      healthy: 'Mmea Mzima',
      recommendation: 'Ushauri wa Udhibiti',
      retake: 'Hakika ndogo — tafadhali piga picha tena kwenye mwanga mzuri',
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;