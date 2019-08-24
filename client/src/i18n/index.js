import en from './en';
import fr from './fr';
import oc from './oc';

const languagesMap = {
  en,
  fr,
  oc,
}

export function getTranslations(language) {
  return languagesMap[language];
}
