import argparse
from datetime import date
import os

def create_post(post_name,ct,sub,date_,cat,tags):
    post = open(post_name,'w',encoding="utf8")
    post.write("---\n")
    post.write("layout: post\n")
    post.write("title: %s\n" % ct)
    post.write("subtitle: '%s'\n" % sub)
    post.write("date: %s\n" % date_)
    post.write("category: %s\n" % cat)
    post.write("tags: [%s]\n" % tags)
    post.write("---\n")
    post.close()

    print("%s 创建成功！" % post_name)

if __name__ == '__main__':
    # print(sys.argv)
    parser = argparse.ArgumentParser(description='创建post')
    parser.add_argument('-et', '--english-title', help='英文标题')
    parser.add_argument('-ct', '--chinese-title', help='中文标题')
    parser.add_argument('-sub', '--subtitle', help='中文子标题')
    parser.add_argument('-cat', '--category', help='分类')
    parser.add_argument('-tags', '--tags', help='标签 多个用逗号分隔')
    args = parser.parse_args()
    # print(type(args),args)
    et = args.english_title if args.english_title else ""
    ct = args.chinese_title if args.chinese_title else ""
    sub = args.subtitle if args.subtitle else ""
    cat = args.category if args.category else ""
    tags = args.tags if args.tags else ""
    # print(et,ct)
    et = et.replace(" ","-")
    today = date.today()
    date_ = today.strftime("%Y-%m-%d")
    post_name = "_posts/%s-%s.md" % (date_, et)
    # print(post_name)
    if os.path.exists(post_name):
        print(os.path.abspath(post_name))
        str = input("%s已存在 是否覆盖？Y-是 N-否 :"% post_name)
        if 'Y' == str:
            create_post(post_name,ct,sub,date_,cat,tags)
    else:
        create_post(post_name,ct,sub,date_,cat,tags)



