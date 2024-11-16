# ba-image-db
[nonebot-plugin-ba-tools](https://github.com/hanasa2023/nonebot-plugin-ba-tools) 的图片数据库构建工具，每日自动更新图片数据库。

## 使用方法
如果你想自行构建图片数据库，可以按照以下步骤进行操作：
1. 安装依赖
```shell
npm install
```

2. 在项目根目录下创建 `.env` 文件，填写以下内容：
```shell
REDIS_URL=<redis数据库连接地址>
Cookies=<你的pixiv Cookies>
```

3. 运行脚本
```shell
# 创建数据库
npm create-db
# 更新数据库
npm update-db
# 修复数据库
npm fix-db
```
