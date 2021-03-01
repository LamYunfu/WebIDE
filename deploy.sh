redis-cli flushdb
docker stop `docker container ls | grep emmyar/webide | awk '{ print $1 }'`
docker rm `docker container ls -a | grep emmyar/webide | awk '{ print $1 }'`
docker tag webidelatest emmyar/webide:latest