git archive test5 --format zip -o ./src.zip
if "$1" == "former"; then
    scp ./src.zip root@120.55.102.225:~
else
    scp ./src.zip root@47.114.130.247:~

fi
rm ./src.zip
