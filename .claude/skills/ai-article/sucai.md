标题：面试官：Anthropic在Claude Code中偷偷植入隐形代码，只为识别中国用户，你了解吗？我：严肃研究过。






1、Anthropic在给大家封号的邮件里，甚至还偷偷埋了一个地址追踪

![](https://cdn.paicoding.com/stutymore/sucai-95d4c86173bb112c754d83a8d7b6f789.png)

2、Reddit上有大佬逆向了一下Claude Code，然后在里面发现了一个Anthropic为了封堵中国用户，而搞出来的究极骚操作

Claude Code会静默的读取你本地的电脑的信息，并且用一种极度隐秘的方式，秘密的向服务器传输这个用户是否是中国用户。

![](https://cdn.paicoding.com/stutymore/sucai-076cf6c3312f34f70feb90172d6f2203.png)

我也把我本地的Claude Code用Codex逆向验证了一遍

第一条路径是操作系统时区。

第二条路径是ANTHROPIC_BASE_URL这个环境变量。

方式就是把ANTHROPIC_BASE_URL改成中转站的地址。

Claude Code在本地拿到你设置的这个地址之后，会自动把域名取出来，跟一份内置的列表做比对。

这份列表是Anthropic收集到的所有已知中转站、国内大厂内网代理、竞品AI公司的域名合集。

不仅有N个中转站地址，国内各大厂的域名，也都赫然在列。包括美团、网易、百度、携程、小红书、阿里巴巴、蚂蚁、字节跳动、京东、B站、月之暗面、MiniMax、阶跃星辰等等等等。

![](https://cdn.paicoding.com/stutymore/sucai-20260701110854.png)

而且这些列表不是明文存储的，它们是被base64编码之后又做了一次XOR异或运算，密钥是91，如果你自己去打开Claude Code的包，看到的是一串完全无法阅读的乱码

每一次你在Claude Code里输入一个指令，不管是让它写段代码还是干个啥，Claude Code在把你的请求发给Anthropic的后端之前，都会自动在最前面拼接一段系统提示词。这段系统提示词为了让模型知道一些最新的事实信息，所以一般会在里面拼一行很普通的信息，就是这个：Today's date is 2026-06-30.

Reddit那个老哥发现，Claude Code的打包文件里藏了一组函数，这组函数会根据上面两条路径的识别结果，如果在本地发现你是中国的用户，就会在你真正的发送请求之前，对这行日期字符串做两处修改。

第一处修改是「Today's」里那个单引号。

第二处修改是日期里的分隔符。

但如果Claude Code检测到你的操作系统时区设置是Asia/Shanghai（上海）或者Asia/Urumqi（乌鲁木齐），它就会把连字符换成斜杠，变成2026/06/30。

这个东西在技术上有个名字，叫隐写术，steganography。

