# 网站拦截

**网站拦截**是一个简单的**Chrome/Firefox扩展**，通过阻止访问您指定的分散注意力的网站来提高您的工作效率。

## 图标

<img src="public/icon_128.png" width="48">

<img src="public/toolbar/light.png" width="480">
<img src="public/toolbar/dark.png" width="480">

## 使用方法

点击图标。输入要拦截的网站。请参阅[特殊字符](#特殊字符)和[示例](#示例)。

选择如何处理被拦截的网站：**关闭标签页**，或**显示拦截信息页面**。

**拦截信息页面**显示被拦截的_url_，基于哪个_rule_被拦截，以及可选的在选定时间段内的拦截次数：
_全部时间_，_本月_，_本周_，或_今天_。

### 特殊字符

```
! ⇒ 前缀，表示排除在拦截之外
* ⇒ 匹配任意零个或多个字符
? ⇒ 匹配任意一个字符
```

### 示例

```
example.com              # 拦截 example.com/ 和其上的任何页面


example.com/             # 仅拦截 example.com/
example.com/*            # 拦截 example.com/ 和其上的任何页面


example.com/*            # 拦截 example.com/ 上的任何页面
!example.com/orange/     # 除了 example.com/orange/


*.example.com/           # 拦截 example.com/ 的任何子域名
!apple.example.com/      # 除了 apple.example.com/


*watch*                  # 拦截包含单词 "watch" 的任何页面


example.com/????/*       # 拦截例如：
                         # - example.com/pear/projects/1
                         # - example.com/plum/projects/1


example.com/*rry/*       # 拦截例如：
                         # - example.com/cherry/projects/1
                         # - example.com/strawberry/projects/1
```

### 上下文菜单

如果启用，网站拦截将被添加到浏览器的上下文菜单中。它将提供以下选项：
- 仅拦截此页面
- 拦截整个网站

## 隐私声明

网站拦截不会收集任何个人信息或数据。
所有用户设置仅存储在您的浏览器中。

## 汉化信息

由 [Pavel Bucka](https://github.com/penge) 创建

汉化者：[15973081](https://github.com/15973081/)
