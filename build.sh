#!/bin/bash

api_host=$API_HOST

echo "building client..."
cd client
yarn upgrade 
yarn build
cd ../

echo "building server..."
cd server
yarn upgrade 
yarn build