---
slug: nginx bu-shu-xiang-mu-chang-yong-ming-ling
title: nginx 部署项目常用命令
authors:
  name: zhoujun134
  title: 不要等! 不管想做什么, 都要立刻动起来。
  url: https://github.com/zhoujun134
  image_url: https://img.zbus.top/zbus/logo.jpg
tags: [随笔]
image: https://img.zbus.top/zbus/blog202403150754487.webp
---
 
 本文记录了日常使用nginx部署项目所需的一些常用命令，包括nginx配置https、http重定向到https、将java程序部署到后台运行、nginx相关命令和进程管理相关命令。 
<!-- truncate -->  
 ![img](https://img.zbus.top/zbus/blog202405130847944.jpg)

本文主要记录了日常对于 nginx 进行部署项目所使用到的一些日常常用命令：

## nginx 配置 https

```nginx
http {
    ##
    # SSL Settings
    ##

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
    ssl_prefer_server_ciphers on;
    
    # 配置自己下载的数字证书
    ssl_certificate  /soft/zbus.top_nginx/zbus.top_bundle.crt;
    # 配置自己下载的服务器私钥
    ssl_certificate_key /soft/zbus.top_nginx/zbus.top.key;
    
    server {
            # 监听HTTPS默认的443端口
            listen 443;
            # 配置自己项目的域名
            server_name zbus.top www.zbus.top;
            # 打开SSL加密传输
            ssl on;
            # 输入域名后，首页文件所在的目录
            root html;
            # 配置首页的文件名
            index index.html index.htm index.jsp index.ftl;
            # 配置自己下载的数字证书
            ssl_certificate  /soft/zbus.top_nginx/zbus.top_bundle.crt;
            # 配置自己下载的服务器私钥
            ssl_certificate_key /soft/zbus.top_nginx/zbus.top.key;
            # 停止通信时，加密会话的有效期，在该时间段内不需要重新交换密钥
            ssl_session_timeout 5m;
            # TLS握手时，服务器采用的密码套件
            ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
            # 服务器支持的TLS版本
            ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
            # 开启由服务器决定采用的密码套件
            ssl_prefer_server_ciphers on;
            ## 域名访问配置
            location / {
                 autoindex on;
                 autoindex_exact_size off;
                 autoindex_localtime on;
                 ## 这里配置对应的前端打包之后的目录
                 root /home/ubuntu/soft/dist; 
                 try_files $uri $uri/ /index.html;
                 index index.html index.htm;
            }
    
            location /api/ {
                 ## 假设前端使用的后端 api 地址部署在本地的 8080 端口下，path 为 /api/
                 proxy_pass http://127.0.0.1:8080/api/;
                 proxy_set_header Host $host;
                 proxy_set_header X-Real-IP $remote_addr;
            }
    }

}
```



## http 重定向到 https 的端口下

监听 server 的 80 端口，并重定向到 https 目录下：

```yaml
server {
    listen 80;
    server_name zbus.top www.zbus.top;
 
    # 重定向所有 HTTP 请求到 HTTPS
    return 301 https://$server_name$request_uri;
}
```

## 将 java 程序部署到后台运行

```bash
nohup java -jar zjBootBlog-0.0.1-SNAPSHOT.jar > main.log 2>&1 &
```

## nginx 相关命令

```bash
## 启动 nginx
nginx
## 重启 nginx 
nginx -s reload
## nginx 的日志目录
/var/log/nginx
```

## 进程管理相关

### 查询 cpu ，内存的使用情况

```bash
## 查询进程的内存和 cpu 使用情况
htop
```