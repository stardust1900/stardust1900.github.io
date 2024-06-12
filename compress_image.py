import os
import re
import sys

'''
•  JPG 或 JPEG 格式的图片通常会比较小，因为它使用了有损压缩，适合存储颜色渐变平滑的自然场景或照片https://imagekit.io/blog/jpeg-vs-png-vs-gif-which-image-format-use/。

•  PNG 格式的图片大小中等，提供无损压缩和支持透明度，适合需要透明背景或包含文字和对比度高的图像，如标志https://imagekit.io/blog/jpeg-vs-png-vs-gif-which-image-format-use/。

•  GIF 格式的图片通常较大，因为它支持动画和有限的颜色范围，适合简单动画图像https://imagekit.io/blog/jpeg-vs-png-vs-gif-which-image-format-use/。
'''

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

'''
压缩图片
'''
def compress(pic):
    '''
    压缩图片
    '''
    print("compress %s" % pic)
    if jpgexp.match(pic):
        os.system("jpegoptim -m80 --strip-all --all-progressive %s" % pic)
    else:
        os.system("optipng -o7 -strip all %s" % pic)
    



if __name__ == '__main__':
    print(len(sys.argv))
    target = "./assets/images/"
    if(len(sys.argv)>=2):
        target = target+sys.argv[1]

    print(target)
    traverse(target)
