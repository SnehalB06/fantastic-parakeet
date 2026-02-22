import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import translations from '../translations';

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();
  // Show the language you will switch to
  const nextLang = language === 'en' ? 'fr' : 'en';
  return (
    <button onClick={toggleLanguage} style={{ marginLeft: 16 }}>
      {translations[nextLang]?.languageName || (nextLang === 'en' ? 'English' : 'Français')}
    </button>
  );
};

export default LanguageToggle;
