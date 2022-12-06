#!/bin/bash

api_host=$API_HOST

if [[ "$HEROKU_APP_NAME" =~ "-pr-" ]]
then
  api_host=""
fi

echo "building client..."
cd client
yarn  --production=false
VITE_COMMIT_SHA=$SOURCE_VERSION \
VITE_API_HOST=$api_host \
VITE_API_PROTOCOL=$API_PROTOCOL \
VITE_API_PORT=$API_PORT \
yarn build
cd ../

echo "building server..."
cd server
yarn  --production=false
yarn build