cd udc-extension
yarn build 
cd ../demo 
yarn build 
cd drawboard-extension
yarn build
cd ./plugins/unity
yarn 
mv unity.theia ../node/unity.theia
cd ../../browser-app
export THEIA_DEFAULT_PLUGINS=local-dir:../plugins/node
#export THEIA_DEFAULT_PLUGINS=local-dir:../plugins/unity
yarn start
