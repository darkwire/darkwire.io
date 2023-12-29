import en from './en';
import fr from './fr';
import oc from './oc';
import de from './de';
import it from './it';
import zhCN from './zh-CN';
import nl from './nl';
import ru from './ru';
import esAR from './es-AR';
import ja from './ja';
import tr from './tr';
import ko from './ko';
import pl from './pl';

const languagesMap = {
  en,
  fr,
  oc,
  de,
  it,
  zhCN,
  nl,
  ru,
  esAR,
  ja,
  tr,
  ko,
  pl
};

/**
 * Return best match for lang and variant.
 * @param {string} language string from navigator configuration or cookie.
 * @returns the translation dict
 */
export function getTranslations(language = '') {
  const [lang, variant] = language.split('-');

  if (Object.prototype.hasOwnProperty.call(languagesMap, `${lang}${variant}`)) {
    return languagesMap[`${lang}${variant}`];
  }

  if (Object.prototype.hasOwnProperty.call(languagesMap, `${lang}`)) {
    return languagesMap[lang];
  }

  return languagesMap['en'];
}
