import en from './en';
import fr from './fr';

const languagesMap = {
  en,
  fr,
}

export function getTranslations(language) {
  return languagesMap[language];
}