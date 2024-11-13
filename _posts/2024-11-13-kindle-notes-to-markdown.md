---
layout: post
title: kindle笔记转成markdown
subtitle: '一个简单的python脚本'
cover: ""
date: 2024-11-13
category: Tech
tags: [python]
---
你喜欢看书吗？你平常看书，看纸质书，还是电子书？你看书的时候做笔记吗？

从少年时代起，我就一直挺喜欢看书，直到现在也喜欢在睡觉之前看会书。很长时间以来，我都是看纸质书，很少看电子书，我没有专门看电子书的设备，只偶尔在手机上看。直到去年用老婆的kindle看了罗杰•克劳利的《地中海史诗三部曲》，那是我第一次看电子版的长篇。感觉还挺不错。前几天老婆给我买了个掌阅ocean4turbo，现在我也有了自己的电子阅读器了，可以预见，我以后看的电子书将会超过纸质书。

我从小就没有做笔记的习惯，不光看书，哪怕是上课也从来不记笔记。中小学课堂上的内容其实很少，不需要记笔记，脑子也能记住，哪怕记不住，很多东西老师也会反复讲。但是大学以后，课堂上讲的内容指数级增长，不记笔记很难记住，但是那时的我没有意识到问题，盲目自信，继续头铁不记笔记，导致每次期末感觉啥都没学啥都没记住，都要靠突击才能通过考试...毕业多年后，我恍惚意识到自己的问题，但为时已晚。关于读书笔记，我也坚持一种观点：书只管看就行了，不用刻意记笔记，让大脑自然去过滤，看的时候让你有感触有共鸣的句子，你自然会回头多看几遍，看完一本书，你记住的部分就是这本书最精华的部分。但后来，可能是记忆力衰退了，我发现这方法不太管用了，看过的书也很快忘了，过段时间再翻，感觉自己在看一本新书，看过了就和没看过一样...我终于承认：读书还是得记笔记。

像钱钟书李敖那样，抄书剪书做卡片做分类的读书笔记方法，我不知道具体是如何做的，也不知道适不适合咱们普通人，毕竟人家是学者这些是人家的工作，他们不会嫌费时费力。现在是信息时代，我们应该有自己的方法，可能效率更高，而且更便于检索。  
我曾经用豆瓣读书做笔记，看纸质书的时候，看到好的地方就拿手机拍照，编辑一下划下红线，传到笔记里。像这样：
![](/assets/images/20241113/1.png)
但图片是不便于检索的。
后来豆瓣也升级了，拍的照片可以文字识别，不用保存图片可以直接保存文字了。
![](/assets/images/20241113/2.png)

这些都是保存在豆瓣上的，想看的时候要到豆瓣上找，而且搜起来很困难，豆瓣的搜索功能是出了名的差。我曾经一度把读书笔记当微博发，加个标签，搜索起来也方便。

但这些都是权益之计，既然我以后可能都主要看电子书了，一定有更好的办法。

你别说，还真是。用过kindle和微信读书的一定都会觉得这玩意做笔记太方便了。最厉害的是，笔记还可以导出来，kindle导出的是html，微信读书是能直接复制出txt。我其实更喜欢kindle一点。虽然kindle退出中国，但国际版还能正常使用，它导出的笔记是这样的：
![](/assets/images/20241113/3.png)

我想或许可以把html转成markdown，放到github上，我的博客里，归档起来，检索也方便。于是我问了下AI：
![](/assets/images/20241113/4.png)
AI好是好，但是很多情况下不能直接解决问题，虽然有了它得帮助会方便很多，但最终还是得自己动手。
于是我用python写了一版：

``` python
from bs4 import BeautifulSoup
def pc_note():
    with open("笔记本.html", encoding='UTF-8') as f:
            html = f.read()
    soup = BeautifulSoup(html, 'html.parser')
    # print(soup.prettify())
    heads = soup.find_all(['h2', 'h3'])
    pre_pos = 0
    pre_text = ''
    with open('notes.md','w',encoding='UTF-8') as md:
        for head in heads:
            if 'h2' == head.name:
                md.write('\n')
                md.write('%s%s\n' % ('## ', head.get_text()))
            elif 'h3' == head.name:
                # children = head.find_all(recursive=False)
                note_text = head.find('div', class_='noteText').get_text()
                head_text = head.get_text()
                head_text = head_text[:-len(note_text)]
                position_start = head_text.find('位置') + len('位置 ')
                pos = int(head_text[position_start:])
                # 删除空格
                note_text = note_text.replace(' ','')
                # 删除重复
                if pre_text[-2:] == note_text[0:2]:
                    note_text = note_text[2:]
                    print(note_text)
                # 位置贴近的部分不换行
                if pos - pre_pos > 10:
                    md.write('\n')
                pre_pos = pos
                pre_text = note_text
                if head_text.startswith('标注'):
                    # 原文划线内容
                    md.write('> %s  \n' % note_text)
                elif head_text.startswith('备注'):
                    #  笔记内容
                    md.write('\n%s \n' % note_text)
```

kindle笔记有几个问题：
  * 复制出的文字很多空格
  * 跨页划线的部分会有几个字重复
  * PC 导出的html格式有问题
  * PC 和 手机端导出的html标签不一致

前两个问题在程序里很容易解决，上面的脚本已经解决了。hmtl格式不一致需要做下调整，不能通过&lt;h2&gt;&lt;h3&gt;标签来取元素，要通过class来取，于是调整了一下，让PC和手机端导出的都可以直接用：

``` python 
def mobile_note():
    with open("笔记本.html", encoding='UTF-8') as f:
            html = f.read()
    soup = BeautifulSoup(html, 'html.parser')
    target_elements = soup.select('.sectionHeading, .noteHeading, .noteText')

    text_type = '原文'
    pre_pos = 0
    cur_pos = 0

    pre_text = ''
    with open('notes1.md','w',encoding='UTF-8') as md:
        for element in target_elements:
            cls = element.get('class')[0]
            if 'sectionHeading' == cls:
                md.write('\n')
                md.write('%s%s\n' % ('## ', element.get_text().strip()))
            elif 'noteHeading' == cls:
                # print(element.get_text())
                inner_text = ''
                for child in element.contents:
                    # 如果子节点是字符串类型（即文本），则将其添加到h3_text字符串中
                    if isinstance(child, str):
                        inner_text += child.strip() + ' '
                if inner_text.startswith('标注'):
                    text_type = '原文'
                else:
                    text_type = '笔记'
                position_start = inner_text.find('位置') + len('位置 ')
                cur_pos = int(inner_text[position_start:])
                print(cur_pos)
            else:
                print('pre_pos:%s cur_pos:%s' % (pre_pos,cur_pos))
                if cur_pos - pre_pos > 10:
                    md.write('\n')
                 # 删除空格
                note_text = element.get_text().strip().replace(' ','')
                # 删除重复
                if pre_text[-2:] == note_text[0:2]:
                    note_text = note_text[2:]

                if text_type == '原文':
                    # 原文划线内容
                    md.write('> %s  \n' % note_text)
                else:
                    #  笔记内容
                    md.write('\n%s \n' % note_text)
                pre_pos = cur_pos
                pre_text = note_text
```

我用上面这个脚本把笔记转成markdown放到了我的博客里[https://wangxuan.me/notes/2024/11/12/Think-Fast-and-Slow.html](https://wangxuan.me/notes/2024/11/12/Think-Fast-and-Slow.html)

效果还行，我挺满意。如果用兴趣你也可以试试，有什么问题欢迎留言跟我讨论。

最后，分享一下国际版的kindle apk安装包，关注“魔域桃源”公众号

![](/assets/img/wechat.png)

在聊天框里发送:kindle