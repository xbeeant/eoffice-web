# eoffice web
eoffice应用的前端。eoffice 致力于打造一套在线、多人实时协同办公的系统，支持word，Excel，PPT，UML，markdown等文件的编辑、预览、pdf的在线预览。

eoffice web 采用ant design 组件库，使用ant design pro基础框架结合qiankun框架将各个文件类型的渲染通过子应用的方式进行接入。

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
