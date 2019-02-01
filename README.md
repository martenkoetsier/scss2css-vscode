# scss2css-vscode

VSCode plugin for compiling scss into css

This is a fork of a project of cyyjs: https://github.com/cyyjs/scss2css-vscode. That version has two issues that are solved here:
- There is no option to setup a specific source directory;
- The documentation is in Chinese.

The intended workflow is that if some scss file in the workspace is saved, it is automatically complied. If it is a file that is normally excluded (`Scss2Css.excludeRegex` setting), the compile all command is initiated, which compiles all scss files found in the workspace, except those excluded because of either `Scss2Css.excludeRegex` or `Scss2Css.excludeDirRegex`.

Example workflow:
- store all scss files in `resources/scss/`
- prefix all 'included' scss files with underscore
- optionally have some framework, with some scss files, all framework files are in `vendor/`
- compiled files go to `public/css/`

Settings suggested:

```js
{
    "Scss2Css.compileAfterSave": true,
    "Scss2Css.compileAllAfterSaveExcluded": true,
    "Scss2Css.formats": [{
        "format": "expanded",
        "extension": ".css"
    }, {
        "format": "compressed",
        "extension": ".min.css"
    }]
    "Scss2Css.excludeRegex": '^_',
    "Scss2Css.excludeDirRegex": '^vendor',
    "Scss2Css.sourceDir": '', // or 'resources/scss/'
    "Scss2Css.targetDir": 'public/css',
}
```


## Features

After saving a scss file in the source directory, this plugin automatically compiles the configured scss files into css files.

## Extension Settings

-   `Scss2Css.compileAfterSave`: Whether to compile upon saving a file
-   `Scss2Css.compileAllAfterSaveExcluded`: Whether to compile all files upon saving a file that is excluded because of the `excludeRegex` setting
-   `Scss2Css.formats`: Compilation method (see formats below)
-   `Scss2Css.excludeRegex`: Regular expression used to exclude filenames, the default is `^_`, i.e. all files starting with underscore
-   `Scss2Css.excludeDirRegex`: Regular expression used to exclude directories, the default is `^vendor`, i.e. all files of which the path starts with 'vendor' are excluded.
-   `Scss2Css.sourceDir`: The directory (within the current workspace folder) to scan for scss files, the default is `''`
-   `Scss2Css.targetDir`: The directory where compiled files are placed (can be relative), the default is the current directory

## Formats description

Configure as an array to compile multiple types at the same time.

Example：

```js
{
    "Scss2Css.formats": [{
        "format": "expanded",
        "extension": ".css"
    }, {
        "format": "compressed",
        "extension": ".min.css"
    }]
}
```

| Format     | Description                                             |
| ---------- | ------------------------------------------------------- |
| nested     | With indented child styles                              |
| compact    | Compact css output                                      |
| expanded   | Extended format, which is easy to read, for development |
| compressed | Compressed css for production                           |

**English documentation**

I am not familiar with the Chinese language. I have used Google Translate and my own English language skills to translate this plugin.
