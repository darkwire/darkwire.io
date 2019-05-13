rm -rf build
rm -rf dist
npx babel src -d dist/src --copy-files

sha=`git rev-parse HEAD`

echo $sha

perl -pi -e "s/SHA/$sha/g" dist/src/config.json