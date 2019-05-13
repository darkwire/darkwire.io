import { sanitize } from './index.js';

test('sanitizes should strip bad characters', () => {
  expect(sanitize('d@rkW1r# e is L3git&&!&*A*')).toBe('d-rkW1r--e-is-L3git-----A-');
});
