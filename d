cd udc-extension
echo "compile watching"
(yarn watch &)
cd ../browser-app
echo "web pack watching"
(yarn watch &)
echo "service start"

(export THEIA_DEFAULT_PLUGINS=local-dir:../plugins/node && yarn start)

