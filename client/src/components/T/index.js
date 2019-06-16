import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {getTranslations} from 'i18n';
import _ from 'lodash';
import { connect } from 'react-redux'

const regex = /{(.*?)}/g;

class T extends Component {
  render() {
    const t = getTranslations(this.props.language);
    let string = _.get(t, this.props.path, '').split(regex);
    if (this.props.data) {
      string = string.map(word => {
        if (this.props.data[word]) {
          return this.props.data[word];
        }
        return word;
      });
      return <span>{string}</span>
    }
    return string;
  }

  t() {
    const t = getTranslations(this.props.language);
    return _.get(t, this.props.path);
  }
}

T.propTypes = {
  path: PropTypes.string.isRequired,
}

export default connect(
  (state, ownProps) => ({
    language: state.app.language,
  }),
)(T)