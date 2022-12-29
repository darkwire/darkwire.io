/* istanbul ignore file */
let host;
let protocol;
let port;

switch (import.meta.env.MODE) {
  case 'staging':
    host = import.meta.env.VITE_API_HOST;
    protocol = import.meta.env.VITE_API_PROTOCOL || 'https';
    port = import.meta.env.VITE_API_PORT || 443;
    break;
  case 'production':
    host = import.meta.env.VITE_API_HOST;
    protocol = import.meta.env.VITE_API_PROTOCOL || 'https';
    port = import.meta.env.VITE_API_PORT || 443;
    break;
  default:
    host = import.meta.env.VITE_API_HOST || 'localhost';
    protocol = import.meta.env.VITE_API_PROTOCOL || 'http';
    port = import.meta.env.VITE_API_PORT || 3001;
}

export default {
  host,
  port,
  protocol,
};
