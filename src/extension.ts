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

	var disposable = vscode.commands.registerCommand('extension.switch_corresponding', () => switch_corresponding() );
	context.subscriptions.push(disposable);
	var disposable = vscode.commands.registerCommand('extension.switch_corresponding_sameDirectory', () => switch_corresponding(true) );
	context.subscriptions.push(disposable);

	function switch_corresponding(sameDirectory?: boolean) {

		var filePath = vscode.window.activeTextEditor.document.fileName;
		var fileNameAndExtension = path.basename(filePath);
		var	fileName = path.basename(filePath, path.extname(filePath));

		if (sameDirectory) {
			// build relative path
			let dir = path.dirname(filePath),
				relative = vscode.workspace.asRelativePath(dir);
			if (dir !== relative) {
				fileName = path.join(relative, fileName).substr(1).replace(/\\/g, '/');
				fileNameAndExtension = path.join(relative, fileNameAndExtension).substr(1).replace(/\\/g, '/');
			}
			fileName = fileName + ".*";
		} else {
			fileName = "**/" + fileName + ".*";
			fileNameAndExtension =  "**/" + fileNameAndExtension;
		}

		var files = vscode.workspace.findFiles(fileName, fileNameAndExtension, 100);
		files.then((value) => {
			for (var i = 0; i < value.length; ++i) {
				var textDocument = vscode.workspace.openTextDocument(value[i]);
				textDocument.then((textDoc) => {
					vscode.window.showTextDocument(textDoc);
				});
				break;
			}
		}, (reason) => {
			console.log(reason);
		});
	}
}

// this method is called when your extension is deactivated
export function deactivate() {
}