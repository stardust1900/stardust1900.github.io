import os
import re
import sys


# 正则表达式匹配图片文件
exp = re.compile(r'.+\.(jpe?g|png|gif|bmp)$', re.I)
jpgexp = re.compile(r'.+\.(jpe?g)$', re.I)

# 遍历文件夹
def traverse(dir):
    print("dir:%s"%dir)
    for fname in os.scandir(dir):
        if os.path.isdir(fname):
            traverse(fname)
        elif exp.match(fname.name):
            print("pic %s" % fname.name)
            print("path %s" % fname.path)
            print("stat %s" % fname.stat().st_size)


if __name__ == '__main__':
    print(len(sys.argv))
    target = "./assets/images/"
    if(len(sys.argv)>=2):
        target = target+sys.argv[1]

    print(target)
    traverse(target)
