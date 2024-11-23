#!/bin/sh

api_host=$API_HOST

if [[ "$HEROKU_APP_NAME" =~ "-pr-" ]]
then
  api_host=""
fi

echo "building client..."
cd client
yarn install
yarn upgrade
yarn --production=false
yarn build
cd ../

echo "building server..."
cd server
yarn install
yarn upgrade
yarn  --production=false
yarn build