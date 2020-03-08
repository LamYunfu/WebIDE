
cd udc-extension
yarn build 
cd ../demo 
yarn build 
cd ../drawboard-extension
yarn build
pushd
cd ./plugins/unity
mv unity.theia ../node/unity.theia
popd
cd ../browser-app
yarn theia build
export THEIA_DEFAULT_PLUGINS=local-dir:../plugins/node
#export THEIA_DEFAULT_PLUGINS=local-dir:../plugins/unity
yarn theia start
