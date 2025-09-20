
"use client";

import { useState, useEffect, useCallback } from 'react';
import { translations, type Translations } from '@/lib/translations';

export const useTranslation = () => {
    const [language, setLanguageState] = useState<'English' | 'Hindi'>('English');

    useEffect(() => {
        const storedLang = localStorage.getItem('selectedLanguage');
        if (storedLang === 'Hindi') {
            setLanguageState('Hindi');
        } else {
            setLanguageState('English');
        }
    }, []);

    const setLanguage = useCallback((lang: 'English' | 'Hindi') => {
        setLanguageState(lang);
        localStorage.setItem('selectedLanguage', lang);
    }, []);

    return {
        t: translations[language] as Translations,
        setLanguage,
        language,
    };
};

    