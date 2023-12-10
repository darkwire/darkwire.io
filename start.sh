#!/bin/sh

# We use this file to translate environmental variables to .env files used by the application
set_env() {
set -e

echo "

" > /etc/nginx/http.d/default.conf



echo "
TZ=UTC
VITE_API_HOST=$VITE_API_HOST
VITE_API_PROTOCOL=$VITE_API_PROTOCOL
VITE_API_PORT=$VITE_API_PORT
VITE_COMMIT_SHA=$VITE_COMMIT_SHA
MODE=production

# To display darkwire version
VITE_COMMIT_SHA=$VITE_COMMIT_SHA

# Set max transferable file size in MB
VITE_MAX_FILE_SIZE=$VITE_MAX_FILE_SIZE
" > client/.env.dist


echo"
MAILGUN_API_KEY=$MAILGUN_API_KEY
MAILGUN_DOMAIN=$MAILGUN_DOMAIN
ABUSE_TO_EMAIL_ADDRESS=$ABUSE_TO_EMAIL_ADDRESS
ABUSE_FROM_EMAIL_ADDRESS=$ABUSE_FROM_EMAIL_ADDRESS

CLIENT_DIST_DIRECTORY='client/dist/'

ROOM_HASH_SECRET=$ROOM_HASH_SECRET

SITE_URL=$SITE_URL

# Store configuration
STORE_BACKEND=$STORE_BACKEND
STORE_HOST=$STORE_HOST
" > server/.env.dist

exec "$@"
}
set_env &&
# Start your application
yarn start #&

# Start Nginx
#nginx -g "daemon off;"
