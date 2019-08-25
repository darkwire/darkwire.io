import en from './en';
import fr from './fr';
import oc from './oc';
import de from './de';
import it from './it';
import zhCN from './zh-CN';
import nl from './nl';

const languagesMap = {
  en,
  fr,
  oc,
  de,
  it,
  zhCN,
  nl
}

export function getTranslations(language) {
  return languagesMap[language];
}
