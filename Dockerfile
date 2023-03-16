# TODO Start: [Student] Complete Dockerfile
# Stage 0 : build
FROM node:18 AS build

ENV FRONTEND=/opt/frontend

WORKDIR $FRONTEND
# 将 Yarn 换源到 npmmirror (https://registry.npmmirror.com) 以加速下载；

RUN yarn config set registry https://registry.npmmirror.com

COPY . .

# 通过 Next.js 构建静态页面文件
RUN yarn install

RUN yarn build

RUN yarn export

# Stage 1
FROM nginx:1.22 

ENV HOME=/opt/app

WORKDIR $HOME
# 最终镜像中，静态页面文件位于 /opt/app/dist 目录下。
COPY --from=build /opt/frontend/out dist

COPY nginx /etc/nginx/conf.d

EXPOSE 80
# TODO End