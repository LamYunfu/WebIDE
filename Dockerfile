ARG NODE_VERSION=11.15.0
# FROM node:${NODE_VERSION}-alpine
# #RUN apk add --no-cache make gcc g++ python bash
# #RUN apk add  make gcc g++ python bash
# WORKDIR /home/theia
# # 注意：plugin和 extension并不在docker中再次编译，故在docker build前一定注意要在本目录编译好plugin和 extension
# ADD ./ ./
# RUN yarn 
# yarn build && \
# yarn --pure-lockfile && \
# 	 yarn config set registry https://registry.npm.taobao.org/ &&\
#     yarn --production && \
#     yarn build && \
    #yarn autoclean --init && \
   # echo *.ts >> .yarnclean && \
    #echo *.ts.map >> .yarnclean && \
    #echo *.spec.* >> .yarnclean && \
    #yarn autoclean --force && \
   # rm -rf ./node_modules/electron && \
   # yarn cache clean

FROM node:${NODE_VERSION}-alpine
RUN addgroup theia && \
    adduser -G theia -s /bin/sh -D theia;
RUN chmod g+rw /home && \
    mkdir -p /home/project && \
    chown -R theia:theia /home/theia && \
    chown -R theia:theia /home/project;
#RUN apk add  git openssh bash
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories && apk add openssh make gcc g++ python bash
ENV HOME /home/theia
WORKDIR /home/theia
COPY --chown=theia:theia ./ /home/theia
RUN mv /home/theia/lcli /usr/bin && \
    chmod +x /usr/bin/lcli;
EXPOSE 3000
ENV SHELL /bin/bash
#ENV USE_LOCAL_GIT true
# 指定 plugin 路径
ENV THEIA_PLUGINS local-dir:./plugins/node
USER theia
# ENTRYPOINT [ "yarn" , "start" , "plugin"]
ENTRYPOINT [ "node", "/home/theia/browser-app/src-gen/backend/main.js", "/home/project", "--hostname=0.0.0.0" ]
