#!/bin/bash

api_host=$API_HOST

if [[ "$HEROKU_APP_NAME" =~ "-pr-" ]]
then
  api_host=""
fi

echo "building client..."
cd client
yarn --production=false
yarn build
cd ../

echo "building server..."
cd server
yarn  --production=false
yarn build