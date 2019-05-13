export function sanitize(str) {
  return str.replace(/[^A-Za-z0-9]/g, '-');
}
