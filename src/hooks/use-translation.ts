
"use client";

import { useState, useEffect, useCallback } from 'react';
import { translations, type Translations } from '@/lib/translations';

export const useTranslation = () => {
    const [language, setLanguageState] = useState<'English' | 'Hindi'>('English');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const storedLang = localStorage.getItem('selectedLanguage');
        if (storedLang === 'Hindi') {
            setLanguageState('Hindi');
        } else {
            setLanguageState('English');
        }
        setIsLoaded(true);
    }, []);

    const setLanguage = useCallback((lang: 'English' | 'Hindi') => {
        setLanguageState(lang);
        localStorage.setItem('selectedLanguage', lang);
    }, []);

    // Return default translations until the language is loaded from localStorage
    const t = isLoaded ? (translations[language] || translations.English) : translations.English;

    return {
        t,
        setLanguage,
        language,
    };
};
