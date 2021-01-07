echo "**/*.ts">.yarnclean
echo "**/*.ts.map">>.yarnclean
echo "**/*.spec.*" >>.yarnclean
echo "**/*.zip" >>.yarnclean 

yarn autoclean --force
find   -maxdepth 2 -type d -name src |xargs rm -r
rm .yarnclean 