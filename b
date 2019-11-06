yarn prepare
cd browser-app
yarn build
export THEIA_DEFAULT_PLUGINS=local-dir:../plugins/node
yarn start
