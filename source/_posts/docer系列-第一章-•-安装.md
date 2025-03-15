---
title: docer系列 第一章 • 安装
tags:
  - docker
  - devops
categories:
  - docker
date: 2025-03-15 18:00:10
---

这里主要介绍 linux 系统 的 docker 安装

<!-- more -->

# 安装 Docker

1. 更新系统包索引

```bash
sudo yum update -y
```

2. 卸载旧版本 Docker（如果有）

```bash
# 如果系统中已经安装了旧版本的 Docker，建议先卸载它：
sudo yum remove docker docker-common docker-selinux docker-engine
```

3. 安装必要的依赖包

```bash
# 安装一些 Docker 所需的依赖包，例如 yum-utils 和存储驱动相关的工具：
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
```

4. 添加 Docker 官方或阿里云镜像仓库

```bash
# 为了加速 Docker 的安装，可以使用阿里云的镜像仓库。
# 运行以下命令添加阿里云的 Docker CE 镜像源：
sudo yum-config-manager \
--add-repo \
http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```

5. 更新 Yum 软件包索引

```bash
# 添加镜像源后，更新 Yum 的软件包索引以确保获取最新的 Docker 版本：
sudo yum makecache fast
```

6. 安装 Docker CE

```bash
# 安装 Docker 社区版（Docker CE）：
sudo yum install -y docker-ce docker-ce-cli containerd.io
```

7. 启动 Docker 服务

```bash
# 启动 docker
sudo systemctl start docker

# 设置开机自启动
sudo systemctl enable docker
```

8. 验证 Docker 是否安装成功

```bash
# 查看 docker 版本信息
docker --version
```

如果输出类似 `Docker version xx.xx.xx` 的信息，则说明安装成功。

还可以运行一个测试容器来进一步验证：

```bash
docker run hello-world
```

![1.png](https://img-bed.renouc.cn/v2/8jVgVQO.png)

查看 hello-world 镜像：

```bash
docker images
```

![2.png](https://img-bed.renouc.cn/v2/41Ow6kt.png)

# 删除 Docker

1. 停止 Docker 服务

在卸载之前，首先需要停止正在运行的 Docker 服务：

```bash
sudo systemctl stop docker
```

2. 卸载 Docker 软件包

使用 yum 包管理器卸载 Docker 及其相关依赖项：

```bash
sudo yum remove docker \
                docker-common \
                docker-selinux \
                docker-engine
```

如果安装的是 Docker CE（社区版），可以运行以下命令卸载：

```bash
sudo yum remove docker-ce docker-ce-cli containerd.io
```

3. 删除 Docker 镜像、容器和数据卷

Docker 的默认存储目录是 /var/lib/docker/，其中包含所有镜像、容器、网络和存储卷的数据。

如果需要彻底清理这些数据，可以手动删除该目录：

```bash
sudo rm -rf /var/lib/docker
```

> 注意：此操作会永久删除所有 Docker 数据，请确保你已经备份了重要的镜像或容器数据。

4. 删除 Docker 配置文件

如果需要完全清理 Docker 的配置文件，可以删除相关的配置目录：

```bash
sudo rm -rf /etc/docker
```

5. 清理残留文件

有时，系统中可能还会残留一些与 Docker 相关的文件或依赖项。可以通过以下命令查找并清理：

```bash
sudo find / -name "*docker*" -exec rm -rf {} \;
```

6. 验证 Docker 是否已完全卸载

```bash
docker --version
```

# 配置阿里云镜像加速（可选）

为了加速镜像拉取，可以配置阿里云提供的 Docker 镜像加速服务。

编辑或创建 /etc/docker/daemon.json 文件，添加以下内容：

```json
{
  "registry-mirrors": ["<你的阿里云镜像加速地址>"]
}
```

将 <你的阿里云镜像加速地址> 替换为你在阿里云控制台获取的专属加速地址。

然后重启 Docker 服务：

```bash
# 用于在修改或新增服务配置后通知 systemd 更新其状态
sudo systemctl daemon-reload
# 重启 docker
sudo systemctl restart docker
```

相关命令可以直接在阿里云查看：

![3.png](https://img-bed.renouc.cn/v2/UpCC4c7.png)
