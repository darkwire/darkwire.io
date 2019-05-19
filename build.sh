#!/bin/bash

api_host=$API_HOST

if [[ "$HEROKU_APP_NAME" =~ "-pr-" ]]
then
  api_host=""
fi

echo "building client..."
cd client
yarn  --production=false
REACT_APP_COMMIT_SHA=$SOURCE_VERSION \
REACT_APP_API_HOST=$api_host \
REACT_APP_API_PROTOCOL=$API_PROTOCOL \
REACT_APP_API_PORT=$API_PORT \
yarn build
cd ../

echo "building server..."
cd server
yarn  --production=false
yarn build