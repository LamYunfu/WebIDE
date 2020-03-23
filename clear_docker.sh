sayHighlight(){
if [ "$2" = "green" ]
then
 echo "\33[32m$1\33[0m"
else
echo "\33[31m$1 \33[0m"
fi 
}
duration="70"
containertab=`docker container ls |grep emmyar/webide:latest  |gawk -F " " 'match($0,/:(.[0-9]+)-/,a) {printf("%s %s %s\n", $1, a[1],$12)}'`
res=`echo "$containertab"|gawk -F " " '{print $2}'`
echo res:$res
option=''
for port in $res
do
	if [  "$option" != '' ]
	then
		option="$option ||tcp dst port $port"
	else
		option="tcp dst port $port"
	fi
done
echo option:$option
timeout $duration tcpdump -Ul  -i  any  "($option) && tcp[((tcp[12:1] & 0xf0)>>2):1]=0x8a" |tee dump
active=`awk -F " " '{print $5}' ./dump  | sed -n  "s/.*\.\|://gp"|uniq`
echo "$containertab">res
echo "$active">active
echo alldocker:$res
unactive_tab=`gawk 'NR==FNR{a[$1]=1} NR!=FNR{if(a[$2]!=1) printf("%s %s %s\n",$1, $2,$3)}' active res`
echo "$unactive_tab">unactive_tab
allstr="$active\n$res"
res=`echo "$allstr" |sort| uniq -u `
sayHighlight "active port:$active" green
sayHighlight "active mapp relationship:" green
awk 'NR==FNR{a[$2]=1}NR!=FNR{if(a[$2]!=1) printf("%s-->%s:%s\n",$3,$1,$2)}' unactive_tab res
sayHighlight "unactive port:$res"
sayHighlight "unactive map relationship:"
awk '$1!=""{printf("%s-->%s:%s\n",$3,$1,$2)}' unactive_tab
awk '{print $1}' unactive_tab| xargs docker container stop
sayHighlight "ok" green
return $res


