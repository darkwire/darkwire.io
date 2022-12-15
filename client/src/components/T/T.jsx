import PropTypes from 'prop-types';
import _ from 'lodash';

import { getTranslations } from '@/i18n';

const regex = /{(.*?)}/g;

const T = ({ language, path, data }) => {
  const t = getTranslations(language);
  const englishT = getTranslations('en');
  const str = _.get(t, path, '') || _.get(englishT, path, '');

  let string = str.split(regex);

  // Data for string interpolation
  if (data) {
    string = string.map(word => {
      if (data[word]) {
        return data[word];
      }
      return word;
    });
    return <span>{string}</span>;
  }
  return string;
};

T.propTypes = {
  path: PropTypes.string.isRequired,
};

export default T;
