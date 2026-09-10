# 库街区登录

本项目为 [Kuro-AutoSignin](https://github.com/mxyooR/Kuro-autosignin) 的附属项目，用来获取库街区登录 Token。

---

## 安装依赖

项目使用 [uv](https://docs.astral.sh/uv/getting-started/installation/) 管理项目依赖环境，这是保证安装可靠的 **必需** 工具：

```bash
pip install -U uv  # 其他安装方式见上方官网链接
```

在项目目录下执行：

```bash
uv sync
```

该命令会 *自动* 创建 `.venv` 虚拟环境，并安装正确版本的 Python 及基础依赖。

如下载缓慢，可选用国内镜像：

```bash
uv sync --default-index "https://mirrors.aliyun.com/pypi/simple"

uv sync --default-index "https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple"
```

> [!TIP]
> **可选功能：**
>
> - `--all-extras`：自动安装下方列出的全部可选功能。可去除此选项自定义安装。
> - `--extra auto-login`：当使用 `auto_login.py` 运行时所需环境。

---

## Token 获取方法

在使用脚本前，需要获取你的登录 Token。以下提供四种方法：

### 方法一：使用 `auto_login.py` 获取 Token（图标点选验证码）

确保已安装 `auto-login` 依赖环境（`uv sync --extra auto-login`），然后在项目目录下执行：

```bash
uv run ./auto_login.py
```

按照提示输入手机号和验证码后，脚本会自动打印获取到的信息，并在当前目录下生成 `login_info.json` 文件。

---

### 方法二：使用 `login.py` 获取 Token（手动获取验证码）

> **来源**：[@2314933036](https://github.com/2314933036)
>
> **注意**：该方法可能会失效。

这种方式需要你先在浏览器中触发验证码，再回到终端把验证码交给脚本。具体步骤如下：

1. **打开登录页面**：在浏览器中访问 [库街区登录页面](https://www.kurobbs.com/mc/home/)。

2. **获取登录验证码**：点击获取验证码，但 **不要点击登录**。

3. **运行脚本**：回到项目目录，执行：

    ```bash
    uv run ./login.py
    ```

4. **按提示输入信息**：根据脚本提示输入手机号和刚刚收到的验证码。

5. **获取 Token**：脚本会返回你的 `token` 和其他相关信息。

---

### 方法三：从应用备份中提取 Token（Android）

> **来源**：[Issue #5](https://github.com/mxyooR/Kuro_login/issues/5)

1. 在手机上登录库街区 App。
2. 使用系统或第三方备份功能，备份已登录的库街区 App 数据。
3. 如有需要，将备份文件传到电脑后，用压缩工具打开备份包。
4. 在备份包中定位 `库街区(com.kurogame.kjq).bak/apps/com.kurogame.kjq/f/mmkv/user_data`。
5. 打开 `user_data`，提取其中的 `token` 字段。
6. 如果不方便直接定位路径，也可以先解压备份，再全局搜索 `eyJhbGciOiJIUzI1NiJ9` 快速查找 token。

> [!NOTE]
>
> 该方法来自社区反馈，Issue 中的测试环境为小米 K70 和当时的最新系统版本。不同品牌、系统版本或备份工具的目录结构可能略有差异，请以实际备份内容为准。

---

### 方法四：自行抓包

1. **iOS 用户**：可以下载抓包软件（如 Stream、Reqable 等）进行抓包。
2. **Android 用户**：请自行研究抓包方法。
3. **抓包目标**：获取登录请求中的 `token` 和其他相关信息。