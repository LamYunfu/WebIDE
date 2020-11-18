#!/bin/bash
log_dir="/root/LinkLab/webide/logs/"
log_path='/root/LinkLab/webide/logs/webide.csv'
num_path=`echo $log_dir/docker_num.csv`
create_path=`echo $log_dir/docker_create.csv`
docker_res=`echo $log_dir/docker_res.csv`
if [ -d "$log_dir" ]
then
        echo "exist"
else
        mkdir -p $log_dir
fi
docker container ls -a --filter="ancestor=emmyar/webide:latest" --format="{{.ID}}::{{.Names}}::{{.CreatedAt}}"> ./tmp  
docker_info=`gawk -F "::" '{split( $3 ,c," ")}{ printf("%s::%s::%s\n",$1,$2,c[2]) }' tmp`
echo "$docker_info"
docker_arr=`echo "$docker_info"|awk -F "::" '{print $1}'`
docker_num=`echo "${docker_arr}"|wc -l`
docker stats --no-stream --format="{{.Container}}::{{.CPUPerc}}::{{.MemPerc}}::{{.NetIO}}" $docker_arr >./docker_statusecho "$docker_info" >./docker_info
echo docker_arr "$docker_arr"
echo docker_num "$docker_num"
date=`date "+%Y/%m/%d %H:%M:%S"`
echo "date:$date"
echo $date  $docker_num >$num_path
awk -v x="$date" -F "::" 'NR==FNR{a[$1]=$0} NR!=FNR{split($4,c," / ");$4=c[1];$5=c[2];;printf("%s::%s::%s::%s::%s::%s::%s\n",x,a[$1],$1,$2,$3,c[1],c[2])}' docker_info docker_status >$log_path
awk -F "::" '{printf("%s  %s  %s  %s\n",$1,$2,$3,$4)}' $log_path >$create_path
awk -F "::" '{printf("%s  %s  %s  %s  %s  %s  %s  %s\n",$1,$2,$3,$6,$7,$8,$9,$10)}' $log_path >$docker_res