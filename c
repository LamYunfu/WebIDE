
cd udc-extension
yarn build 
cd ../demo 
yarn build 
cd ../drawboard-extension
yarn build
##cd ./plugins/unity
##mv unity.theia ../node/unity.theia
cd ../browser-app
yarn theia build
export THEIA_DEFAULT_PLUGINS=local-dir:../plugins/node
#export THEIA_DEFAULT_PLUGINS=local-dir:../plugins/unity
yarn theia start
