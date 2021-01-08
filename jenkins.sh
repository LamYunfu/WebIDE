set -e
export NODE_TLS_REJECT_UNAUTHORIZED=0
yarn  config set strict-ssl false
yarn install 
sed -i "s/\r//g" ./clean.sh
sed -i "s/\r//g" ./deploy.sh
chmod +x ./clean.sh
chmod +x ./deploy.sh
cd new_widget
yarn build 
cd ../grove-extension
yarn build
cd ../drawboard-extension
yarn build
cd ../esp32_widget
yarn prepare
##cd ./plugins/unity
##mv unity.theia ../node/unity.theia
cd ../udc-extension
yarn build 
cd ../demo 
yarn build 
cd ../browser-app
yarn theia build
rm lib/e817279537a0417d042f62fbb1b99eea.gif
export THEIA_DEFAULT_PLUGINS=local-dir:../plugins/node
cd ..
./clean.sh
docker build . -t webidelatest
./deploy.sh
#export THEIA_DEFAULT_PLUGINS=local-dir:../plugins/unity
##yarn theia start
