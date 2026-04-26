# 库街区登录

本项目为 [Kuro-AutoSignin](https://github.com/mxyooR/Kuro-autosignin) 的附属项目，用来获取库街区登录 Token 的功能。

## 验证码类型说明

库街区目前使用两种验证码类型：
1. **图标点选验证码**：需要识别并点击图片中的特定图标
2. **滑块验证码**：需要拖动滑块到指定位置


## 环境配置

### 方式一：使用conda虚拟环境（推荐）

```bash
# 创建虚拟环境
conda create -n kuro_login python=3.11 -y

# 激活环境
conda activate kuro_login

#图标点选
pip install -r requirements.txt

#图标点选
pip install -r requirements_slice.txt
```

### 方式二：直接安装

```bash
#图标点选
pip install -r requirements.txt

#滑块验证码
pip install -r requirements_slice.txt
```

## Token获取方法

在使用脚本前，需要获取你的登录 Token。以下提供四种方法：

### 方法一：使用 `sms_send.py` 获取 Token（图标点选验证码）
> **来源**: [@Ko-Koa](https://github.com/Ko-Koa)

1. 确保已安装完整版依赖：`pip install -r requirements.txt`
2. 运行 `sms_send.py`
3. 输入你的手机号，获取验证码
4. 输入验证码，脚本会返回你的 `token` 和其他相关信息,并写入当前目录下的`login_data.json`文件中

**图标点选的图片处理部分代码来自** [Bump-mann/simple_ocr: 一个简单的识别验证码的代码](https://github.com/Bump-mann/simple_ocr)

> [!WARNING]
>
> 1.由于目前库街区已换回滑块验证,关于图标点选验证仅使用极验官网的Demo进行测试,并不能保证使用
>
> 且识别点选的模型是用网络上的模型,并不保证识别率
>
> 2.由于`ddddocr`模块目前并不支持3.13以上版本,安装环境时注意`python`版本控制在`3.13`以下

### 方法二：使用 `login.py` 获取 Token（手动获取验证码）
> **来源**: [@2314933036](https://github.com/2314933036)

**注意**：可能会失效

1. 打开 [库街区登录页面](https://www.kurobbs.com/mc/home/)
2. 获取你的登录验证码，但**不要点击登录**
3. 安装基础依赖：`pip install uuid requests`
4. 运行 `login.py`，输入手机号和验证码
5. 脚本会返回你的 `token` 和其他相关信息

### 方法三：从应用备份中提取 Token（Android）
> **来源**: [Issue #5](https://github.com/mxyooR/Kuro_login/issues/5)

1. 在手机上登录库街区 App
2. 使用系统或第三方备份功能，备份已登录的库街区 App 数据
3. 如有需要，将备份文件传到电脑后，用压缩工具打开备份包
4. 在备份包中定位 `库街区(com.kurogame.kjq).bak/apps/com.kurogame.kjq/f/mmkv/user_data`
5. 打开 `user_data`，提取其中的 `token` 字段
6. 如果不方便直接定位路径，也可以先解压备份，再全局搜索 `eyJhbGciOiJIUzI1NiJ9` 快速查找 token

> [!NOTE]
>
> 该方法来自社区反馈，Issue 中的测试环境为小米 K70 和当时的最新系统版本。不同品牌、系统版本或备份工具的目录结构可能略有差异，请以实际备份内容为准。

### 方法四：自行抓包

1. **iOS 用户**：可以下载抓包软件（如 Stream、Reqable 等）进行抓包
2. **Android 用户**：请自行研究抓包方法
3. **抓包目标**：获取登录请求中的 `token` 和其他相关信息

