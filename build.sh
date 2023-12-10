#!/bin/bash

api_host=$API_HOST



echo "building client..."
cd client
yarn --production=true
yarn build
cd ../

echo "building server..."
cd server
yarn  --production=true
yarn build