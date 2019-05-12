echo "building client..."
cd client
yarn  --production=false
REACT_APP_API_HOST=$API_HOST \
REACT_APP_API_PROTOCOL=$API_PROTOCOL \
REACT_APP_API_PORT=$API_PORT \
yarn react-scripts build
cd ../

echo "building server..."
cd server
yarn  --production=false
yarn build