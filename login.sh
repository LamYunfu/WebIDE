#!/bin/bash
if [ "$1" == "formal" ]; then
    ssh root@120.55.102.225
else if [ "$1" == "my" ]; then
  #  ssh root@107.172.30.238 
  ssh root@45.8.159.126
else if [ "$1" == "pi" ]; then
  ssh pi@192.168.88.31
else
    ssh root@118.31.19.202
fi
fi
fi
