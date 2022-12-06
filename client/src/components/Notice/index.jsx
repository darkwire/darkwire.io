import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Notice = props => (
  <div>
    <div
      className={classNames({
        info: props.level === 'info',
        warning: props.level === 'warning',
        danger: props.level === 'danger',
      })}
    >
      {props.children}
    </div>
  </div>
);

Notice.defaultProps = {
  level: 'info',
};

Notice.propTypes = {
  children: PropTypes.node.isRequired,
  level: PropTypes.string,
};

export default Notice;
