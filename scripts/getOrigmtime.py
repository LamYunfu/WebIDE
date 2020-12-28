import os
import time
import datetime
import sys

def GetFileList(dir, fileList):
    if os.path.isfile(dir):
        fileList.append(dir.decode('gbk'))
    elif os.path.isdir(dir):  
        for s in os.listdir(dir):
            newDir=os.path.join(dir,s)
            GetFileList(newDir, fileList)  
    return fileList

workdir = sys.argv[1]
os.chdir(workdir)

osdir = 'os'
list = GetFileList(osdir, [])
for e in list:
    nowmv = os.path.getmtime(e)
    print '%s:%s' % (e,nowmv)