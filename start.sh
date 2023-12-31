#!/bin/sh


# We use this file to translate environmental variables to .env files used by the application
set_env() {
echo "
TZ=UTC
VITE_API_HOST=$VITE_API_HOST
VITE_API_PROTOCOL=$VITE_API_PROTOCOL
VITE_API_PORT=$VITE_API_PORT
VITE_COMMIT_SHA=$VITE_COMMIT_SHA
MODE=production
VITE_COMMIT_SHA=$VITE_COMMIT_SHA
VITE_MAX_FILE_SIZE=$VITE_MAX_FILE_SIZE
" > client/.env


echo "
MAILGUN_API_KEY=$MAILGUN_API_KEY
MAILGUN_DOMAIN=$MAILGUN_DOMAIN
ABUSE_TO_EMAIL_ADDRESS=$ABUSE_TO_EMAIL_ADDRESS
ABUSE_FROM_EMAIL_ADDRESS=$ABUSE_FROM_EMAIL_ADDRESS
CLIENT_DIST_DIRECTORY='client/dist/'
ROOM_HASH_SECRET=$ROOM_HASH_SECRET
SITE_URL=$SITE_URL
STORE_BACKEND=$STORE_BACKEND
STORE_HOST=$STORE_HOST
" > server/.env
}

generate_self_signed_ssl() {
    local key_file="certs/selfsigned.key"
    local cert_file="certs/selfsigned.crt"
    local csr_file="certs/selfsigned.csr"
    local days_valid=365

    # Create "certs" directory if it doesn't exist
    mkdir -p certs

    # Generate private key
    openssl genpkey -algorithm RSA -out "$key_file"

    # Generate certificate signing request (CSR)
    openssl req -new -key "$key_file" -out "$csr_file" -subj "/C=US/ST=FL/L=Miami/O=NoxCorp/OU=GhostWorks/CN=Noxcis"

    # Generate self-signed certificate
    openssl x509 -req -days "$days_valid" -in "$csr_file" -signkey "$key_file" -out "$cert_file"

    # Provide information about the generated files
    echo "Self-signed SSL key: $key_file"
    echo "Self-signed SSL certificate: $cert_file"
    echo "Certificate signing request: $csr_file"
}

set_env &&
# Start your application
generate_self_signed_ssl &&
nginx &&
yarn start #&
