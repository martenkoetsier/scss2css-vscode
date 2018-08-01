# scss2css-vscode

VSCode scss 编译成 css 插件

## Features

保存后自动将 scss 文件编译为 css 文件

## Extension Settings

-   `Scss2Css.compileAfterSave`: 是否保存时编译
-   `Scss2Css.formats`: 编译的方式

-   `Scss2Css.excludeRegex`: 排除文件名正则表达式
-   `Scss2Css.targetDir`: 生成后的目录，默认为当前目录
-   `Scss2Css.mainFile` : 要编译的主文件名，不设置则编译当前保存的文件

## formats 说明

配置接收一个数组，可同时编译多种类型

例如：

```js
{
    "Scss2Css.formats": [{
        "format": "expanded", // 编译类型
        "extension": ".css" // 编译后文件后缀
    }]
}
```

| format     | 描述                                                   |
| ---------- | ------------------------------------------------------ |
| nested     | 嵌套格式，嵌套格式如果出现子级样式，会往右边缩进       |
| compact    | 紧凑格式，输出 css 格式                                |
| expanded   | 扩展格式，这种格式便于阅读，平时一般都是这种格式写 css |
| compressed | 压缩格式，一般用于发布文档，最后输出                   |

**Enjoy!**
