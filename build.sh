echo "building client..."
cd client
yarn  --production=false
REACT_APP_COMMIT_SHA=`git rev-parse --short HEAD` \
REACT_APP_API_HOST=$API_HOST \
REACT_APP_API_PROTOCOL=$API_PROTOCOL \
REACT_APP_API_PORT=$API_PORT \
yarn build
cd ../

echo "building server..."
cd server
yarn  --production=false
yarn build