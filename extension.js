var vscode = require('vscode');
var fs = require('fs');
var compileSass = require('./lib/sass.node.spk.js');
var pathModule = require('path');

var CompileSassExtension = function () {

	// Private fields ---------------------------------------------------------

	var outputChannel;

	// Constructor ------------------------------------------------------------

	outputChannel = vscode.window.createOutputChannel("Scss2Css");

	// Private functions ------------------------------------------------------

	// Processes result of css file generation.
	function handleResult(outputPath, result) {
		if (result.status == 0) {

			try {
				fs.writeFileSync(outputPath, result.text, { flags: "w" });
			} catch (e) {
				outputChannel.appendLine("Failed to generate CSS: " + e);
			}

			outputChannel.appendLine("Successfully generated CSS: " + outputPath);
		} else {

			if (result.formatted) {
				outputChannel.appendLine(result.formatted);
			} else if (result.message) {
				outputChannel.appendLine(result.message);
			} else {
				outputChannel.appendLine("Failed to generate CSS from SASS, but the error is unknown.");
			}

			vscode.window.showErrorMessage('Scss2Css: could not generate CSS file. See Output panel for details.');
		}
	}

	// Generates source path for searching scss/sass files for the CompileAll command, based on the sourceDir setting.
	// The current workspace folder is used as root.
	// The given path is appended to the dir found in the settings.
	function generateSourcePath(path) {
		var configuration = vscode.workspace.getConfiguration('Scss2Css'), sourceDir = '';
		if (configuration.sourceDir != undefined && configuration.sourceDir.length > 0) {
			sourceDir = configuration.sourceDir;
		}
		return pathModule.join(sourceDir, path);
	}

	// Generates target path for scss/sass file basing on its path
	// and Scss2Css.targetDir setting. If the setting specifies
	// relative path, current workspace folder is used as root.
	function generateTargetPath(path) {
		var configuration = vscode.workspace.getConfiguration('Scss2Css');
		var targetDir = pathModule.dirname(path);
		var filename = pathModule.basename(path);
		if (configuration.targetDir != undefined && configuration.targetDir.length > 0) {
			if (pathModule.isAbsolute(configuration.targetDir)) {
				targetDir = configuration.targetDir;
			} else {
				var folder = vscode.workspace.rootPath;
				if (folder == undefined) {
					throw "Path specified in Scss2Css.targetDir is relative, but there is no open folder in VS Code!";
				}
				targetDir = pathModule.join(folder, configuration.targetDir);
			}
		}

		return {
			targetDir: targetDir,
			filename: filename
		};
	}

	// Compiles single scss/sass file.
	function compileFile(path) {
		var configuration = vscode.workspace.getConfiguration('Scss2Css');
		outputChannel.appendLine("Scss2Css: compileFile(" + path + ")");
		var outputPathData = generateTargetPath(path);
		var format, style;

		// Iterate through formats from configuration
		if (configuration.formats.length == 0) {
			throw "No formats are specified. Define Scss2Css.formats setting (or remove to use defaults)";
		}

		for (var i = 0; i < configuration.formats.length; i++) {
			format = configuration.formats[i];

			// Evaluate style for sass generator
			switch (format.format) {
				case "nested":
					style = compileSass.Sass.style.nested;
					break;
				case "compact":
					style = compileSass.Sass.style.compact;
					break;
				case "expanded":
					style = compileSass.Sass.style.expanded;
					break;
				case "compressed":
					style = compileSass.Sass.style.compressed;
					break;
				default:
					throw "Invalid format specified for Scss2Css.formats[" + i + "]. Look at setting's hint for available formats.";
			}

			// Check target extension
			if (format.extension == undefined || format.extension.length == 0) {
				throw "No extension specified for Scss2Css.formats[" + i + "].";
			}
			var fileName = outputPathData.filename.substring(0, outputPathData.filename.lastIndexOf('.'));
			let mainFile = configuration.mainFile;
			if (mainFile) {
				path = path.substring(0, path.lastIndexOf('/')) + '/' + mainFile;
				fileName = mainFile.substring(0, mainFile.lastIndexOf('.'));
			}
			var targetPath = pathModule.join(outputPathData.targetDir, fileName + format.extension);
			// Using closure to properly pass local variables to callback
			(function (path_, targetPath_, style_) {
				// Run the compilation process
				compileSass(path_, { style: style_ }, function (result) {
					handleResult(targetPath_, result);
				});
			})(path, targetPath, style);
		}
	}

	// Checks whether the file matches the exclude regular expression
	function checkExclude(filename) {
		var configuration = vscode.workspace.getConfiguration('Scss2Css');
		return configuration.excludeRegex.length > 0 && new RegExp(configuration.excludeRegex).test(filename);
	}

	// Checks wether the path matches the exclude directory regular expression
	function checkExcludeDir(path) {
		var configuration = vscode.workspace.getConfiguration('Scss2Css');
		return configuration.excludeDirRegex.length > 0 && new RegExp(configuration.excludeDirRegex).test(path);
	}

	function compileAll() {
		outputChannel.appendLine("Scss2Css: Compiling all");
		// var configuration = vscode.workspace.getConfiguration('Scss2Css');
		var sourcePath = generateSourcePath("**/*.s[ac]ss");
		outputChannel.appendLine("Scss2Css: sourcePath: " + sourcePath);
		vscode.workspace.findFiles(sourcePath).then(function (files) {
			var i, filename;
			outputChannel.appendLine("Scss2Css: found " + files.length + " files in sourcePath");
			for (i = 0; i < files.length; i++) {
				outputChannel.appendLine("Scss2Css: filepath: " + files[i].fsPath);
				if (checkExcludeDir(files[i].fsPath)) {
					outputChannel.appendLine("File " + files[i].fsPath + " is in a directory excluded from building to CSS. Check Scss2Css.excludeDirRegex setting.");
					continue;
				}
				filename = pathModule.basename(files[i].fsPath);
				if (checkExclude(filename)) {
					outputChannel.appendLine("File " + files[i].fsPath + " is excluded from building to CSS. Check Scss2Css.excludeRegex setting.");
					continue;
				}
				try {
					compileFile(files[i].fsPath);
				} catch (e) {
					vscode.window.showErrorMessage('Scss2Css: could not generate CSS file: ' + e);
				}
			}
		});
	}

	// Public -----------------------------------------------------------------

	return {
		OnSave: function (document) {
			outputChannel.clear();
			outputChannel.show(true);
			try {
				var configuration = vscode.workspace.getConfiguration('Scss2Css');
				var filename = pathModule.basename(document.fileName);

				if (configuration.compileAfterSave) {
					if (document.fileName.toLowerCase().endsWith('.scss') || document.fileName.toLowerCase().endsWith('.sass')) {
						if (!checkExclude(filename)) {
							compileFile(document.fileName);
						} else if (configuration.compileAllAfterSaveExcluded) {
							compileAll();
						} else {
							outputChannel.appendLine("File " + document.fileName + " is excluded from building to CSS. Check Scss2Css.excludeRegex setting.");
						}
					}
				}
			} catch (e) {
				vscode.window.showErrorMessage('Scss2Css: could not generate CSS file: ' + e);
			}
		},
		CompileAll: function () {
			outputChannel.clear();
			outputChannel.show(true);
			compileAll();
		}
	};
};

function activate(context) {
	var extension = CompileSassExtension();
	vscode.workspace.onDidSaveTextDocument(function (document) { extension.OnSave(document) });
	var disposable = vscode.commands.registerCommand('Scss2Css.compileAll', function () {
		extension.CompileAll();
	});
	context.subscriptions.push(disposable);
}

function deactivate() { }

exports.activate = activate;
exports.deactivate = deactivate;
