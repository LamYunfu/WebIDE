echo "*.ts">.yarnclean
echo ".ts.map">>.yarnclean
echo "*.spec.*" >>.yarnclean
echo "*.sh" >>.yarnclean
echo "*.zip" >>.yarnclean
rm ".*zip" ".*sh"
yarn autoclean