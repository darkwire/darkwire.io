import { connect } from 'react-redux';
import T from 'components/T/T';

export default connect((state, ownProps) => ({
  language: state.app.language,
}))(T);
