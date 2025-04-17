# 库街区登录

本项目为 [Kuro-AutoSignin](https://github.com/mxyooR/Kuro-autosignin) 的附属项目，用来获取库街区登录 Token 的功能。

在使用脚本前，需要获取你的登录 Token。以下提供三种方法：

### 方法一：使用 `sms_send.py` 获取 Token
> **来源**: [@Ko-Koa](https://github.com/Ko-Koa)

1. 运行 `sms_send.py`。
2. 输入你的手机号，获取验证码。
3. 输入验证码，脚本会返回你的 `token` 和其他相关信息。

#### 环境依赖

- NodeJS
  - 国内: <https://nodejs.cn/download/>
  - 官网: [Node.js — Download Node.js® (nodejs.org)]
(https://nodejs.org/en/download/package-manager)
- Python 环境

  - `pip install -r ./requirements.txt`(若要使用短信发送来获取token)
  - `pip install -r ./requirements_normal.txt`(不使用`sms_send.py` 来获取token)

#### 短信登录工具说明

现已将极验验证的接口转为图标点选，并重新编写参数加密部分。目前图片识别使用网上的模型以及`ddddocr`，成功率有点感人但凑活着用吧。若不通过可多尝试几次。

**图片处理部分代码来自** [Bump-mann/simple_ocr: 一个简单的识别验证码的代码](https://github.com/Bump-mann/simple_ocr)

### 方法二：使用 `login.py` 获取 Token
> **来源**: [@2314933036](https://github.com/2314933036)

1. 打开 [库街区登录页面](https://www.kurobbs.com/mc/home/)。
2. 获取你的登录验证码，但**不要点击登录**。
3. 安装`uuid`、`requests`库。
4. 运行 `login.py`，输入手机号和验证码。
5. 脚本会返回你的 `token` 和其他相关信息。

### 方法三：自行抓包

1. **iOS 用户**：可以下载抓包软件（如 Stream、Reqable 等）进行抓包。
2. **Android 用户**：请自行研究抓包方法
3. **抓包目标**：获取登录请求中的 `token` 和其他相关信息。
