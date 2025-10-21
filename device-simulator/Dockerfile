# 使用一个官方的轻量级Node.js镜像
FROM node:18-alpine

# 在容器内设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json 文件
COPY package*.json ./

# 安装所有依赖
RUN npm install

# 把您项目的所有代码复制进去
COPY . .

# 定义启动命令
CMD [ "node", "simulator.js" ]