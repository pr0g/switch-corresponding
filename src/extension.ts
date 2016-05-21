// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

var path = require('path');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('"switch-corresponding" now active');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json

	var disposable_sc = vscode.commands.registerCommand('extension.switch_corresponding', () => switch_corresponding() );
	context.subscriptions.push(disposable_sc);
	var disposable_sc_samedir = vscode.commands.registerCommand('extension.switch_corresponding_sameDirectory', () => switch_corresponding(true) );
	context.subscriptions.push(disposable_sc_samedir);

	function switch_corresponding(sameDirectory?: boolean) {
		var filePath = vscode.window.activeTextEditor.document.fileName;
		var fileNameAndExtension = path.basename(filePath);
		// the exact filename
		var fileName = path.basename(filePath, path.extname(filePath));

		// the filename + search criteria to use for matching
		var fileNameSearch = "";
		if (sameDirectory) {
			// build relative path
			let dir = path.dirname(filePath),
				relative = vscode.workspace.asRelativePath(dir);
			if (dir !== relative) {
				fileNameSearch = path.join(relative, fileName).substr(1).replace(/\\/g, '/');
				fileNameAndExtension = path.join(relative, fileNameAndExtension).substr(1).replace(/\\/g, '/');
			} else {
				fileNameSearch = fileName;
			}
			fileNameSearch += ".*";
		} else {
			fileNameSearch = "**/" + fileName + ".*";
			fileNameAndExtension =  "**/" + fileNameAndExtension;
		}

		var files = vscode.workspace.findFiles(fileNameSearch, fileNameAndExtension, 100);

		files.then((files) => {
	        if (!files || files.length == 0) {
				return;
			}

			// only want files whose name matches exactly
			let exact_files = files.filter(file => path.basename(file, path.extname(file)) === fileName);
			if (!exact_files || exact_files.length == 0) {
				return;
			}

			if (exact_files.length === 1) {
				// if only one file => switch
				vscode.workspace.openTextDocument(exact_files[0].fsPath)
					.then(textDoc => {
						vscode.window.showTextDocument(textDoc);
					});
			} else {
				// else => list and open only the file selected by user
				let displayFiles = [];

				for (let index = 0, file; index < exact_files.length; index++) {
					file = exact_files[index];
					displayFiles.push({
						label: file.fsPath.substring(vscode.workspace.rootPath.length + 1),
						description: file.fsPath,
						filePath: file.fsPath
					});
				}

				vscode.window.showQuickPick(displayFiles)
					.then(val=> {
						if (val) {
							vscode.workspace.openTextDocument(val.filePath)
								.then(textDoc => {
									vscode.window.showTextDocument(textDoc);
								});
						}
					});
	            }

			}, (reason) => {
				console.log(reason);
		});
	};
}

// this method is called when your extension is deactivated
export function deactivate() {
}