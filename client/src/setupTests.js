import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// this adds jest-dom's custom assertions
import '@testing-library/jest-dom/extend-expect';
import { enableFetchMocks } from 'jest-fetch-mock';

configure({ adapter: new Adapter() });
enableFetchMocks();
