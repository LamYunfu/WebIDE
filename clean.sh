echo "*.ts">.yarnclean
echo ".ts.map">>.yarnclean
echo "*.spec.*" >>.yarnclean
echo "*.zip" >>.yarnclean
ls  |grep rm *.zip|xargs rm
yarn autoclean
x=read