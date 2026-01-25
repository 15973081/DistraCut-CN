
<div align="center">
  <img src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/googlechrome.svg" width="64" alt="Chrome" />
  <img src="https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/firefoxbrowser.svg" width="64" alt="Firefox" />
  <h1>DistraCut（断燥）</h1>
  <p>
    <strong>轻量级网站拦截浏览器扩展</strong><br>
    帮助用户主动阻断分散注意力的网站，专注当下任务。
  </p>

  <!-- 访问统计 + 基本状态 -->
  <p>
    <img src="https://img.shields.io/badge/dynamic/json?logo=firefox&label=Firefox&query=%24.version&url=https%3A%2F%2Faddons.mozilla.org%2Fapi%2Fv5%2Faddons%2Faddon%2FdistraCut%2F&color=FF7139" alt="Firefox Add-ons version">
    <img src="https://img.shields.io/badge/dynamic/json?logo=googlechrome&label=Chrome&query=%24.version&url=https%3A%2F%2Fchromewebstore.google.com%2Fwebstore%2Fdetail%2FdistraCut%2F&color=4285F4" alt="Chrome Web Store version"> 
    <img src="https://komarev.com/ghpvc/?username=15973081&label=Views&color=647eff&style=flat-square" alt="Profile views">
  </p>

  <p>
    <a href="https://github.com/15973081/DistraCut/stargazers">
      <img src="https://img.shields.io/github/stars/15973081/DistraCut?style=social" alt="GitHub stars">
    </a>
    <a href="https://github.com/15973081/DistraCut/network/members">
      <img src="https://img.shields.io/github/forks/15973081/DistraCut?style=social" alt="GitHub forks">
    </a>
  </p>
</div>

## 概述

DistraCut 是一款专注力辅助工具，以极简方式实现网站黑名单拦截。  
核心设计理念：**规则透明、本地存储、无网络请求、无遥测**。

主要适用场景：

- 深度工作 / 学习时段屏蔽社交媒体、视频、新闻聚合站
- 家长控制（轻度）
- 强制执行番茄工作法 / 时间块的辅助工具

## 核心功能

- 通配符 + 排除规则的灵活匹配（`*`、`?`、`!`）
- 两种拦截行为：直接关闭标签页 / 显示自定义拦截页面
- 拦截页面显示：命中规则、URL、历史拦截次数统计（今日 / 本周 / 本月 / 全部）
- 右键菜单快速添加规则（当前页 / 整个域名）
- 完全本地存储，所有数据不离开浏览器
- 支持 Chrome、Firefox 及大多数 Chromium 衍生浏览器

## 技术栈

- Manifest V3
- JavaScript (ES6+)
- WebExtensions API
- HTML + CSS（拦截页面）

<div align="center">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/-Manifest%20V3-4285F4?style=flat&logo=googlechrome&logoColor=white" alt="Manifest V3">
</div>

## 快速开始

1. 从以下渠道安装最新版本：

   - [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/distraCut/)（推荐 Firefox 用户）
   - [Chrome Web Store](https://chromewebstore.google.com/detail/distraCut/…)（Chrome / Edge / Brave 等）

   或

2. 本地开发 / 加载最新代码：

   ```bash
   # 克隆仓库
   git clone https://github.com/15973081/DistraCut.git
   cd DistraCut
   ```

   - Chrome / 基于 Chromium 浏览器 → 扩展管理页 → 加载已解压的扩展 → 选择本目录
   - Firefox → about:debugging → 此 Firefox → 临时载入附加组件 → 选择 manifest.json

## 规则语法

支持简单但功能强大的通配符模式：

| 写法                        | 匹配行为                              | 示例说明                              |
|-----------------------------|---------------------------------------|---------------------------------------|
| `example.com`               | 匹配域名 + 任意路径                   | 拦截 example.com 全部页面             |
| `example.com/`              | 严格匹配根路径                        | 仅拦截 example.com/                   |
| `example.com/*`             | 等价于 `example.com`                  | —                                     |
| `*.example.com`             | 匹配所有子域                          | blog.example.com、app.example.com 等  |
| `!blog.example.com`         | 排除规则（优先级高于普通规则）        | 黑名单中排除特定子域                  |
| `*watch*`                   | 路径中任意位置包含 watch              | youtube.com/watch?v=…                 |
| `example.com/????/*`        | 匹配 4 个字符的路径段                 | example.com/2025/*                    |
| `example.com/*rry/*`        | 模糊匹配路径段                        | cherry、strawberry、blueberry 等      |

规则按顺序匹配，**排除规则（`!` 开头）优先级最高**。

## 使用示例

1. **最常见用法**：彻底屏蔽短视频平台

   ```
   *.douyin.com
   *.tiktok.com
   *.bilibili.com
   !live.bilibili.com   # 允许看直播
   ```

2. **工作时间段限制新闻类网站**

   在扩展选项中结合浏览器定时功能或配合其他插件实现时间条件（本扩展暂不内置时间调度）。

## 项目结构

```
.
├── manifest.json           # 扩展核心配置文件（v3）
├── src/
│   ├── background/         # 持久后台脚本、规则匹配、拦截逻辑
│   ├── content/            # content script（可选，用于注入右键菜单等）
│   ├── popup/              # 工具栏弹窗 - 规则管理界面
│   └── blocked/            # 拦截页面模板（HTML + JS + CSS）
├── icons/                  # 各尺寸图标
└── _locales/               # 多语言支持（当前仅 zh_CN）
```

## 贡献指南

欢迎提交 Issue 和 Pull Request。

接受的贡献类型（优先级排序）：

1. Bug 修复
2. 规则匹配引擎的边缘case完善
3. 拦截页面 UI/UX 改进（保持极简）
4. 多语言支持（欢迎添加）
5. 文档、示例完善

请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)（如尚未创建，可先提交 Issue 讨论）。

## 许可证

[MIT License](LICENSE)

---

<div align="center">
  <p>项目仍在活跃维护中，欢迎试用并反馈。</p>
</div>
