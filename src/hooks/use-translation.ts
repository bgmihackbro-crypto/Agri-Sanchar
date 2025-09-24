
"use client";

import { useState, useEffect, useCallback } from 'react';
import { translations, type Translations } from '@/lib/translations';

export const useTranslation = () => {
    const [language, setLanguageState] = useState<'English' | 'Hindi'>('English');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // This effect now only marks that the component has mounted on the client.
        // It no longer tries to read from localStorage directly.
        setIsLoaded(true);
    }, []);

    const setLanguage = useCallback((lang: 'English' | 'Hindi') => {
        setLanguageState(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem('selectedLanguage', lang);
        }
    }, []);

    // The initial render will use English. The subsequent render after the effect in the component
    // sets the language will use the correct translation.
    const t = isLoaded ? (translations[language] || translations.English) : translations.English;

    return {
        t,
        setLanguage,
        language,
        isLoaded, // Expose isLoaded to allow components to wait for the client-side mount
    };
};
