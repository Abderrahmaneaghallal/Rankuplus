import type { Locale } from './config';
import { defaultLocale } from './config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dictionaries: Record<Locale, () => Promise<any>> = {
    fr: () => import('./dictionaries/fr.json').then((module) => module.default),
    en: () => import('./dictionaries/en.json').then((module) => module.default),
    ar: () => import('./dictionaries/ar.json').then((module) => module.default),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getDictionary = async (locale: string): Promise<any> => {
    // Guard: fall back to default locale if the requested locale is unknown.
    // Without this, dictionaries[locale] returns undefined → calling undefined()
    // throws "TypeError: b[a] is not a function" and crashes the SSR render.
    const safeLocale = (locale in dictionaries ? locale : defaultLocale) as Locale;
    return dictionaries[safeLocale]();
};
