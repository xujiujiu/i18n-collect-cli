# i18n-chinese-node
### 项目中中文的提取与国际化写入脚本使用手册


> 1. 目前脚本 **仅支持 components 与 pages 里的 .vue 文件和 .js 文件** 中的中文提取与写入，如果涉及其他文件夹下的内容，可根据脚本内容进行修改对应需要处理的文件内容
> 2. 目前支持 vue 项目
> 3. 写入的脚本需 **本地 node 环境版本不能低于 10.12.0**

#### 使用手册

1. 将 getLang.js 和 writeLang.js 文件放入项目中，与 src 同级

2. 执行 getLang.js 脚本进行提取中文操作

> $ node getLang.js

执行完成后会在同级目录下生成一个 lang.json 文件，内容格式形同如下：

```js
{
  "cs_common": {
    "cs_1": "用户ID",
    "cs_2": "搜索",
  },
  "cs_error": {
    "cs_3": "请输入小于200字符！",
    "cs_4": "请正确填写年龄([0~120])！"
  }
}
```

3. 将 lang.json 文件中的中文对应的 key 用语义化字符串代替，修改后得到的 lang.json 文件如下

```js
{
  "cs_common": {
    "userId": "用户ID",
    "search": "搜索",
  },
  "cs_error": {
    "maxInput": "请输入小于200字符！",
    "ageTip": "请正确填写年龄([0~120])！"
  }
}
```

4. 执行 writeLang.js 将中文以 i18n 的模式写入文件（仅支持 components 与 pages 里的 .vue 文件和 .js 文件）

> $ node writeLang.js

> 注：非 .vue 文件需要引用 i18n 才能使用

执行以上脚本后会在 src 同级目录生成 srcDist 文件夹，文件夹内仅包含 components 与 pages 文件夹下的 .vue 文件和 .js 文件

5. 将 srcDist 文件夹内容替换到 src 文件夹中，覆盖重复的文件

6. 将 lang.json 内数据放入项目中的多语言模块，运行项目，全局遍历一下是否有遗漏


> 注： 以上基于项目中已加入 i18n ，并且已做好配置。

该脚本还不够完善，但对项目中的绝大部分中文都能够做处理，提高一定的效率。

另外，欢迎补充。
