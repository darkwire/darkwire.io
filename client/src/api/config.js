/* istanbul ignore file */
let host;
let protocol;
let port;

switch (import.meta.env.MODE) {
  case 'staging':
    host = import.meta.env.VITE_API_HOST || 'localhost';
    protocol = import.meta.env.VITE_API_PROTOCOL || 'http';
    port = import.meta.env.VITE_API_PORT || 80;
    break;
  case 'production':
    host = import.meta.env.VITE_API_HOST || 'localhost';
    protocol = import.meta.env.VITE_API_PROTOCOL || 'http';
    port = import.meta.env.VITE_API_PORT || 80;
    break;
  default:
    host = import.meta.env.VITE_API_HOST || 'localhost';
    protocol = import.meta.env.VITE_API_PROTOCOL || 'http';
    port = import.meta.env.VITE_API_PORT || 80;
}

export default {
  host,
  port,
  protocol,
};
