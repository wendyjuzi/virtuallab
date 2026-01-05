# 虚拟仿真实训教学管理平台系统 (VirtualLab)

## 项目概述

虚拟仿真实训教学管理平台系统是一个基于Web的虚拟实验室管理系统，旨在为教育机构提供完整的实验教学管理解决方案。系统支持3D虚拟实验、实验资源管理、用户权限管理、实验审核、资源分享等功能。

### 核心功能

- **用户权限管理**：支持系统管理员、部门管理员、教师、学生等多角色权限体系
- **实验管理**：实验项目的创建、编辑、审核、发布等全生命周期管理
- **3D虚拟实验**：基于Three.js的3D实验环境，支持物理仿真
- **资源管理**：实验资源的上传、分类、搜索、分享功能
- **资源分享**：支持资源分享、点赞、收藏等社交功能
- **审核系统**：实验项目的多级审核流程
- **通知系统**：实时消息通知和WebSocket通信
- **AI助手**：集成AI对话功能，支持实验相关问题解答
- **系统监控**：系统日志、数据统计、性能监控
- **数据备份**：数据库备份与恢复功能

## 技术栈

### 后端技术

- **框架**：Spring Boot 2.7.18
- **语言**：Java 17
- **数据库**：MySQL 8.0
- **缓存**：Redis
- **ORM**：MyBatis-Plus 3.5.3.1
- **安全**：Spring Security + JWT
- **文档**：Swagger 2.6.1
- **文件存储**：阿里云OSS
- **实时通信**：WebSocket
- **邮件服务**：Spring Mail (QQ邮箱)
- **其他**：Druid连接池、Lombok、Hibernate Validator

### 前端技术

- **框架**：Vue 3.4.0
- **语言**：TypeScript 5.3.0
- **构建工具**：Vite 5.0.10
- **UI组件库**：Element Plus 2.4.4
- **状态管理**：Pinia 2.1.7
- **路由**：Vue Router 4.2.5
- **3D引擎**：Three.js 0.155.0
- **物理引擎**：Cannon-es 0.20.0
- **图表**：ECharts 5.6.0、Chart.js 4.5.0
- **PDF处理**：PDF.js 3.11.174
- **实时通信**：SockJS + STOMP
- **动画**：Lottie-web 5.13.0

## 项目结构

```
virtuallab/
├── virtuallab-admin-main/          # 后端项目
│   └── virtuallab-admin-main/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/edu/virtuallab/
│       │   │   │   ├── admin/          # 系统管理模块
│       │   │   │   ├── ai/             # AI助手模块
│       │   │   │   ├── audit/          # 审核模块
│       │   │   │   ├── auth/           # 认证授权模块
│       │   │   │   ├── experiment/     # 实验管理模块
│       │   │   │   ├── resource/       # 资源管理模块
│       │   │   │   ├── notification/   # 通知模块
│       │   │   │   └── ...
│       │   │   └── resources/
│       │   │       ├── application.properties
│       │   │       ├── application-dev.properties
│       │   │       └── mapper/         # MyBatis映射文件
│       │   └── test/
│       ├── pom.xml
│       └── README.md
│
└── virtuallab-frontend-main/        # 前端项目
    └── virtuallab-frontend-main/
        ├── src/
        │   ├── api/                  # API接口定义
        │   ├── components/           # 公共组件
        │   ├── views/                # 页面视图
        │   ├── router/               # 路由配置
        │   ├── store/                # 状态管理
        │   ├── utils/                # 工具函数
        │   └── main.ts
        ├── public/                   # 静态资源
        ├── package.json
        ├── vite.config.ts
        └── README.md
```

## 环境要求

### 后端环境

- JDK 17+
- Maven 3.6+
- MySQL 8.0+
- Redis 6.0+

### 前端环境

- Node.js 16+
- npm 或 yarn

## 快速开始

### 方式一：使用 Docker 一键配置（推荐）

使用 Docker 可以快速启动 MySQL 和 Redis 服务，无需手动安装和配置。

#### 前置要求

- 安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- 确保 Docker Desktop 已启动

#### 启动步骤

1. **配置 Docker 镜像加速器（推荐，解决网络问题）**

   如果遇到拉取镜像超时，需要配置镜像加速器。详细步骤请查看 `docker/配置镜像加速器.md`

   快速配置方法：
   - 打开 Docker Desktop → Settings → Docker Engine
   - 添加镜像源配置（见下方）
   - 点击 Apply & Restart

   ```json
   {
     "registry-mirrors": [
       "https://docker.mirrors.ustc.edu.cn",
       "https://hub-mirror.c.163.com",
       "https://mirror.baidubce.com"
     ]
   }
   ```

2. **启动 Docker 环境**

   在项目根目录运行 PowerShell 脚本：

   ```powershell
   .\start-docker.ps1
   ```

   如果网络有问题，可以使用国内镜像配置：

   ```powershell
   .\start-docker.ps1 --china
   ```

   或者直接使用 docker-compose 命令：

   ```bash
   # 使用默认配置
   docker-compose up -d
   
   # 使用国内镜像源配置
   docker-compose -f docker-compose.china.yml up -d
   ```

2. **等待服务启动**

   脚本会自动：
   - 检查 Docker Desktop 是否运行
   - 创建并启动 MySQL 和 Redis 容器
   - 自动创建数据库并执行初始化 SQL
   - 等待服务就绪

3. **验证服务**

   服务启动后，可以使用以下命令查看状态：

   ```bash
   docker-compose ps
   ```

4. **服务信息**

   - **MySQL**: `localhost:3306`
     - 数据库：`virtuallab`
     - 用户名：`root`
     - 密码：`123456`
   
   - **Redis**: `localhost:6379`

5. **停止服务**

   ```powershell
   .\stop-docker.ps1
   ```

   或使用命令：

   ```bash
   docker-compose down
   ```

6. **重置数据**（删除所有数据）

   ```bash
   docker-compose down -v
   ```

#### Docker 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看 MySQL 日志
docker-compose logs -f mysql

# 查看 Redis 日志
docker-compose logs -f redis

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 停止并删除数据卷（重置数据）
docker-compose down -v
```

### 方式二：手动安装配置

### 1. 数据库准备

创建MySQL数据库：

```sql
CREATE DATABASE virtuallab CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

导入数据库表结构（SQL文件位于 `virtuallab-admin-main/virtuallab-admin-main/` 目录下）：
- `create_resource_tables.sql`
- `create_resource_share_table.sql`

### 2. 后端启动

#### 2.1 配置数据库连接

编辑 `virtuallab-admin-main/virtuallab-admin-main/src/main/resources/application-dev.properties`：

**如果使用 Docker**，配置已自动匹配，无需修改：

```properties
# 数据库配置（Docker 环境）
spring.datasource.url=jdbc:mysql://localhost:3306/virtuallab?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&connectionCollation=utf8mb4_unicode_ci
spring.datasource.username=root
spring.datasource.password=123456

# Redis配置（Docker 环境）
spring.redis.host=localhost
spring.redis.port=6379
```

**如果使用本地安装的 MySQL/Redis**，请修改为你的实际配置：

```properties
# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/virtuallab?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&connectionCollation=utf8mb4_unicode_ci
spring.datasource.username=root
spring.datasource.password=你的数据库密码

# Redis配置
spring.redis.host=localhost
spring.redis.port=6379
```

#### 2.2 配置邮件服务（可选）

如需使用邮箱验证功能，编辑 `application-dev.properties` 配置QQ邮箱：

```properties
spring.mail.host=smtp.qq.com
spring.mail.port=465
spring.mail.username=你的QQ邮箱
spring.mail.password=你的邮箱授权码
spring.mail.from=你的QQ邮箱
```

> 注意：需要使用QQ邮箱的授权码，不是登录密码。详细配置请参考 `docs/QQ邮箱配置指南.md`

#### 2.3 配置阿里云OSS（可选）

如需使用文件上传功能，编辑 `application.properties` 配置OSS：

```properties
aliyun.oss.endpoint=你的OSS端点
aliyun.oss.accessKeyId=你的AccessKeyId
aliyun.oss.accessKeySecret=你的AccessKeySecret
aliyun.oss.bucketName=你的Bucket名称
```

#### 2.4 启动Redis（如果未使用 Docker）

**如果使用 Docker**，Redis 已自动启动，可跳过此步骤。

**如果使用本地 Redis**，确保Redis服务已启动：

```bash
# Windows (如果已安装Redis)
redis-server

# Linux/Mac
redis-server
```

#### 2.5 编译并启动后端

**方式一：使用启动脚本（推荐）**

在项目根目录运行：

```powershell
.\start-backend.ps1
```

脚本会自动检查环境、编译并启动后端。

**方式二：手动启动**

```bash
# 进入后端项目目录
cd virtuallab-admin-main/virtuallab-admin-main

# Maven编译（首次运行需要下载依赖，可能需要较长时间）
# 跳过测试编译（推荐，更快）
mvn clean install -DskipTests

# 或包含测试编译
mvn clean install

# 启动Spring Boot应用
mvn spring-boot:run

# 或者使用IDE直接运行 VirtuallabAdminApplication.java
```

**后端服务信息：**
- 服务地址：`http://localhost:8080`
- API文档：`http://localhost:8080/swagger-ui.html`
- Druid监控：`http://localhost:8080/druid`（用户名：druid，密码：druid）

> 📖 详细的后端启动指南请查看：`启动后端指南.md`

### 3. 前端启动

#### 3.1 安装依赖

```bash
# 进入前端项目目录
cd virtuallab-frontend-main/virtuallab-frontend-main

# 安装依赖
npm install
# 或使用 yarn
yarn install
```

#### 3.2 配置代理（可选）

前端已配置Vite代理，默认将 `/api` 等请求代理到 `http://localhost:8080`。如需修改，编辑 `vite.config.ts`：

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

#### 3.3 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

前端服务默认运行在：`http://localhost:3000`

浏览器会自动打开，如果没有自动打开，请手动访问上述地址。

### 4. 访问系统

1. 打开浏览器访问：`http://localhost:3000`
2. 使用系统管理员账号登录（需要先在数据库中创建管理员用户）
3. 开始使用系统

## 开发说明

### 后端开发

- **主启动类**：`com.edu.virtuallab.VirtuallabAdminApplication`
- **配置文件**：
  - `application.properties`：主配置文件
  - `application-dev.properties`：开发环境配置
- **API文档**：启动后访问 `http://localhost:8080/swagger-ui.html`
- **数据库监控**：Druid监控页面 `http://localhost:8080/druid`（用户名：druid，密码：druid）

### 前端开发

- **入口文件**：`src/main.ts`
- **路由配置**：`src/router/index.ts`
- **状态管理**：`src/store/`
- **API接口**：`src/api/`
- **组件**：`src/components/`
- **页面**：`src/views/`

### 常用命令

#### 后端

```bash
# 编译项目
mvn clean compile

# 运行测试
mvn test

# 打包项目
mvn clean package

# 跳过测试打包
mvn clean package -DskipTests
```

#### 前端

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 功能模块说明

### 用户权限系统

- 支持多角色：系统管理员、部门管理员、教师、学生
- 基于RBAC的权限控制
- JWT Token认证
- 邮箱验证注册
- 临时权限管理

### 实验管理

- 实验项目创建与编辑
- 实验分类管理
- 实验审核流程
- 实验发布与下架
- 3D实验环境集成

### 资源管理

- 资源上传（支持多种格式）
- 资源分类与标签
- 资源搜索与筛选
- 资源预览功能
- 资源统计与分析

### 资源分享

- 资源分享功能
- 点赞与收藏
- 分享通知
- 分享统计

### 审核系统

- 多级审核流程
- 审核日志记录
- 审核状态跟踪
- 审核统计

### 通知系统

- 实时消息推送
- WebSocket通信
- 通知中心
- 消息分类

### AI助手

- 智能问答
- PDF文档解析
- 实验相关问题解答

## 文档说明

项目文档位于 `virtuallab-admin-main/virtuallab-admin-main/docs/` 目录下：

- `API接口使用指南.md`：API接口使用说明
- `API测试指南.md`：API测试方法
- `权限管理系统说明.md`：权限系统详细说明
- `QQ邮箱配置指南.md`：邮箱服务配置说明
- `资源管理API接口文档.md`：资源管理相关接口
- `资源分享功能接口文档.md`：资源分享功能说明
- `点赞收藏接口文档.md`：点赞收藏功能说明
- 更多文档请查看 `docs/` 目录

## 常见问题

### 1. 后端启动失败

- 检查MySQL是否启动
- 检查Redis是否启动
- 检查数据库连接配置是否正确
- 检查端口8080是否被占用

### 2. 前端启动失败

- 检查Node.js版本是否符合要求
- 删除 `node_modules` 和 `package-lock.json`，重新执行 `npm install`
- 检查端口3000是否被占用

### 3. 跨域问题

- 后端已配置CORS，确保 `WebCorsConfig` 配置正确
- 前端使用Vite代理，确保 `vite.config.ts` 中的代理配置正确

### 4. 数据库连接失败

- 检查MySQL服务是否启动
- 检查数据库名称、用户名、密码是否正确
- 检查数据库是否已创建

### 5. Redis连接失败

- 检查Redis服务是否启动
- 检查Redis配置是否正确
- 检查防火墙设置

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证。

## 联系方式

如有问题或建议，请提交 Issue 或联系项目维护者。

---

**注意**：首次运行项目时，请确保所有环境依赖已正确安装，数据库已创建并导入表结构，配置文件已根据实际情况修改。
