echo "*.ts">.yarnclean
echo ".ts.map">>.yarnclean
echo "*.spec.*" >>.yarnclean
echo "*.zip" >>.yarnclean --force
ls  |grep rm *.zip|xargs rm
yarn autoclean --force
find   -maxdepth 2 -type d -name src |xargs rm -r