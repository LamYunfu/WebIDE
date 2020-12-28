# -*- coding: UTF8 -*-

import os
import sys
import shutil
import time
import datetime
import zipfile
def GetFileList(dir, fileList):
    if os.path.isfile(dir):
        fileList.append(dir.decode('gbk'))
    elif os.path.isdir(dir):
        for s in os.listdir(dir):
            newDir = os.path.join(dir, s)
            GetFileList(newDir, fileList)
    return fileList

def makedirsIfNotExit(dir):
    if not os.path.exists(dir):
        os.makedirs(dir)

# 打包目录为zip文件（未压缩）
def make_zip(source_dir, output_filename):
    zipf = zipfile.ZipFile(output_filename, 'w')    
    pre_len = len(os.path.dirname(source_dir))
    for parent, dirnames, filenames in os.walk(source_dir):
        for filename in filenames:
            pathfile = os.path.join(parent, filename)
            arcname = pathfile[pre_len:].strip(os.path.sep)     #相对路径
            zipf.write(pathfile, arcname)
    zipf.close()

# ================================读取原始修改时间文件=================================
# 声明一个空字典，来保存文本文件数据
dict_temp = {}
# 打开文本文件
file = open('/Users/fengjikui/temp/orig.log', 'r')

# 遍历文本文件的每一行，strip可以一处字符串头尾指定的字符（默认为空格或换行符）
for line in file.readlines():
    line = line.strip()
    k = line.split(':')[0]
    v = line.split(':')[1]
    dict_temp[k] = v

# 关闭文件
file.close()

# =====================读取当前文件的修改时间，挑选出修改时间不一致的文件到package中===================
# 根据命令参数，进入工程文件目录下
workdir = sys.argv[1]
os.chdir(workdir)

# 删除之前的package文件夹
packagedir = '../package'
if(os.path.exists(packagedir)):
    shutil.rmtree(packagedir)
osdir = 'os'

# 复制非os文件到package中
os.makedirs(packagedir)
for file in os.listdir('./'):
    print file
    if (file == 'os'):
        continue
    if (os.path.isfile(file)):
        shutil.copy(file, packagedir)
    elif (os.path.isdir(file)):
        basename = os.path.basename(file)
        shutil.copytree(file, os.path.join(packagedir, basename))

# 挑选出修改时间不一致的文件到package中
list = GetFileList(osdir, [])
for e in list:
    origmv = dict_temp[e]
    nowmv = str(os.path.getmtime(e))
    if nowmv != origmv:
        print(e, origmv, nowmv)
        destfile = os.path.join(packagedir, e)
        parent_path = os.path.dirname(destfile)
        makedirsIfNotExit(parent_path)
        shutil.copyfile(e,destfile)

outfile = sys.argv[2]
make_zip(packagedir, outfile)
if(os.path.exists(packagedir)):
    shutil.rmtree(packagedir)