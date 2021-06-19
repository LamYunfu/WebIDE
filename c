sed -i "s/\r//g" ./clean.sh
sed -i "s/\r//g" ./deploy.sh
chmod +x ./clean.sh
chmod +x ./deploy.sh
cd new_widget
yarn prepare 
cd ../grove-extension
yarn prepare
cd ../drawboard-extension
yarn prepare
cd ../esp32_widget
yarn prepare
cd ../haas100_widget
yarn prepare
cd ../wizard-extension
yarn prepare
cd ../guild-page-extension
yarn prepare
##cd ./plugins/unity
##mv unity.theia ../node/unity.theia
cd ../udc-extension
yarn prepare 
cd ../stm32_widget
yarn prepare
cd ../demo 
yarn prepare 
cd ../browser-app
yarn prepare
rm browser-app/lib/e817279537a0417d042f62fbb1b99eea.gif
export THEIA_DEFAULT_PLUGINS=local-dir:../plugins/node
#export THEIA_DEFAULT_PLUGINS=local-dir:../plugins/unity
yarn theia start
