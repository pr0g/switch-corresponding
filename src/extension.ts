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
	var disposable = vscode.commands.registerCommand('extension.switch_corresponding', () => {
		var filePath = vscode.window.activeTextEditor.document.fileName;
		var fileNameAndExtension = path.basename(filePath);
		var fileName = fileNameAndExtension.substring(0, fileNameAndExtension.lastIndexOf('.'));

		var files = vscode.workspace.findFiles("**/" + fileName + "*", "**/" + fileNameAndExtension, 100);

		files.then((files) => {

            if (files.length === 1) {
                // if only one file => switch
                vscode.workspace.openTextDocument(files[0].fsPath)
                    .then(textDoc => {
                        vscode.window.showTextDocument(textDoc);
                    });
            } else {
                // else => list and open only the file selected by user
                let displayFiles = [];

                for (let index = 0, file; index < files.length; index++) {
                    file = files[index];
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

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}