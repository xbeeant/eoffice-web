# eoffice web

eoffice应用前端，负责应用的主要操作（文件管理、分享、授权等），eoffice的各个类型的文件渲染、查看器通过使用qiankun框架进行接入，让整个项目的文件渲染微服务化。 后台服务api参看eoffice-server项目。

## 环境准备

Install `node_modules`:

```bash
npm install
```

or

```bash
yarn
```

### 项目启动

```bash
npm start
```

### 项目构建

```bash
npm run build
```

### 代码格式检查

```bash
npm run lint
```

不合规代码快速修正:

```bash
npm run lint:fix
```

### 子应用开发

子应用负责资源的显示，通过API获取资源的信息、更新等操作。

#### 接口

获取资源详情

```
域名 + /api/resource/detail
```

返回：

```

```
