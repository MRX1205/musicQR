# musicQR
二维码
### **使用说明**

1.  在你的项目根目录下，创建一个名为 `README.md` 的文件。
2.  将下面的所有内容（从`# 音乐二维码播放列表生成器`开始）复制并粘贴到这个文件中。
3.  **（重要）** 创建一个名为 `screenshots` 的文件夹，并放入几张你的应用截图（下面已经为你预留好了位置）。

-----

### **README.md (完整内容)**

````markdown
# 音乐二维码播放列表生成器 (Music QR Code Playlist Generator)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

这是一款轻量级的 Web 应用，允许用户上传多个 MP3 音乐文件和对应的 LRC 歌词文件，并即时生成一个指向在线播放列表的二维码。任何人通过手机扫描该二维码，即可在无需安装任何App的情况下，访问一个移动端优化的播放页面，享受带歌词同步的音乐播放体验。



## 🛠️ 技术栈

- **后端**: Node.js, Express.js
- **文件处理**: Multer
- **二维码生成**: qrcode
- **前端**: Vue.js (CDN), 原生 HTML/CSS/JavaScript

## 本地开发与运行

如果你想在自己的电脑上运行此项目进行二次开发，请遵循以下步骤：

1.  **克隆仓库**
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **配置本地测试 (可选)**
    如果需要在本地用手机扫描测试，请打开 `server.js` 文件，找到 `LOCAL_IP` 变量，并将其值修改为你电脑的局域网IP地址。同时，确保服务监听在 `0.0.0.0` 上。

4.  **启动服务**
    ```bash
    npm start
    ```
    或者
    ```bash
    node server.js
    ```

5.  **访问应用**
    在浏览器中打开 `http://localhost:3000` 即可访问上传页面。

## ☁️ 部署教程 (阿里云 + 宝塔面板)

本教程将指导你如何将此项目部署到一台装有宝塔面板的云服务器上。

### 前提条件
- 一台云服务器（如阿里云ECS）。
- 服务器上已安装好宝塔Linux面板。
- 一个域名（可选，但推荐），并已解析到你的服务器公网IP。

### 部署步骤

1.  **安装Node.js环境**:
    - 登录宝塔面板，进入【软件商店】。
    - 搜索并安装【PM2管理器】，它会自动安装Node.js（推荐选择 v16 或 v18 版本）。

2.  **上传项目文件**:
    - 在宝塔【文件】菜单中，进入 `/www/wwwroot/` 目录。
    - 创建一个新文件夹，例如 `music-app`。
    - 将你的整个项目（**不要包含 `node_modules` 文件夹**）打包成 `.zip` 文件，上传到 `music-app` 文件夹并解压。

3.  **添加Node项目**:
    - 进入宝塔【网站】菜单，选择【Node项目】。
    - 点击【添加Node项目】，并按如下配置：
        - **项目目录**: 选择你刚才创建的 `music-app` 目录。
        - **启动文件**: `server.js`
        - **项目端口**: `3000`
        - **Node版本**: 选择你已安装的版本。
    - 点击【提交】。宝塔会自动安装依赖并启动项目。

4.  **设置反向代理**:
    - 在Node项目列表中，找到你的项目，点击右侧的【设置】。
    - 选择【域名】选项卡，输入你的**域名**或**服务器公网IP**，并添加。
    - （推荐）在【SSL】选项卡中，为你的域名申请免费的Let's Encrypt证书，开启HTTPS访问。

5.  **修改Nginx配置 (重要！)**:
    - 为了支持大文件（如MP3）上传，我们需要调整Nginx的配置。
    - 在项目设置窗口，选择【配置文件】。
    - 在 `server { ... }` 代码块内，`server_name` 配置行的下方，添加一行：
      ```nginx
      client_max_body_size 200m;
      ```
    - 点击【保存】。

6.  **配置防火墙**:
    - 在**宝塔面板【安全】**菜单中，放行 `80` 和 `443` 端口。
    - 在**云服务器控制台（如阿里云）**的安全组规则中，添加入方向规则，放行 `80` 和 `443` 端口。

部署完成！现在你可以通过你的域名或IP访问你的应用了。

## 📁 项目结构

```
.
├── public/                # 前端静态文件
│   ├── css/style.css
│   ├── js/player.js
│   ├── index.html
│   └── player.html
├── uploads/               # 用户上传的文件存储目录 (自动创建)
├── package.json
├── server.js              # 后端主程序
└── README.md              # 项目说明文件
```

## 📄 开源许可

本项目基于 [MIT](LICENSE) 许可。
````
