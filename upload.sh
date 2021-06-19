#!/bin/bash
git archive master   --format zip -o ./src.zip
if [ "$1" == "formal" ]; then
    scp ./src.zip root@120.55.102.225:~
else
    scp ./src.zip root@47.111.141.133:~

fi
rm ./src.zip
