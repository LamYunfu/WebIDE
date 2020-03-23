docker_arr=$(echo "$docker_info" | awk -F "::" '{print $1}')
docker_num=$(echo "${docker_arr}" | wc -l)
docker_status=$(docker stats --no-stream --format="::{{.MemPerc}}::{{.CPUPerc}}::{{.NetIO}}" $docker_arr)
echo "$docker_info" >docker_info
echo docker_arr "$docker_arr"
echo docker_num "$docker_num"
echo docker_status "$docker_status" >docker_status
log_dir="/root/LinkLab/webide/logs/"
log_path='/root/LinkLab/webide/logs/webide.log'
if [ -d "$log_dir" ]; then
    echo "exist"
else
    mkdir -p $log_dir
fi
echo "$docker_num" >$log_path
awk -F "::" 'NR==FNR{a[FNR]=$0} NR!=FNR{print a[FNR] $0}' docker_info docker_status >>$log_path
