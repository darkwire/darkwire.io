import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { getTranslations } from '@/i18n';

const regex = /{(.*?)}/g;

class T extends Component {
  render() {
    const t = getTranslations(this.props.language);
    const englishT = getTranslations('en');
    const str = _.get(t, this.props.path, '') || _.get(englishT, this.props.path, '');
    let string = str.split(regex);
    if (this.props.data) {
      string = string.map(word => {
        if (this.props.data[word]) {
          return this.props.data[word];
        }
        return word;
      });
      return <span>{string}</span>;
    }
    return string;
  }
}

T.propTypes = {
  path: PropTypes.string.isRequired,
};

export default T;
