
"use client";

import { useState, useEffect, useCallback } from 'react';
import { translations, type Translations } from '@/lib/translations';

type Language = 'English' | 'Hindi';

export const useTranslation = () => {
    const [language, setLanguageState] = useState<Language>('English');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // This effect runs only on the client side after the component mounts.
        // It's safe to access localStorage here.
        const storedLang = localStorage.getItem('selectedLanguage') as Language;
        if (storedLang && (storedLang === 'English' || storedLang === 'Hindi')) {
            setLanguageState(storedLang);
        }
        setIsLoaded(true);
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        // Persist the language choice to localStorage
        localStorage.setItem('selectedLanguage', lang);
    }, []);
    
    // During server-side rendering or before the client-side effect runs, default to English.
    // Once loaded on the client, it will use the correct language from the state.
    const t = isLoaded ? translations[language] : translations.English;

    return {
        t,
        setLanguage,
        language,
        isLoaded,
    };
};
