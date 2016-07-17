// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

var Path = require('path');

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
	var disposable_sc_samedir = vscode.commands.registerCommand('extension.switch_corresponding_same_dir', () => switch_corresponding(true) );
	context.subscriptions.push(disposable_sc_samedir);

	function switch_corresponding(same_dir?: boolean) {
		var filepath = vscode.window.activeTextEditor.document.fileName;
		var filename_and_extension = Path.basename(filepath);
		// the exact filename
		var filename = Path.basename(filepath, Path.extname(filepath));

		// returns directory name of a path
		let absolute_path = Path.dirname(filepath);
		// returns a path that is relative to the workspace root
		// or the absolute path to the root (if file is at root level)
		let relative_path_or_root = vscode.workspace.asRelativePath(absolute_path);

		// note: replace(/\\/g, '/') statement is a regex search for all backslashes `\`
		// in path, it then replaces each with a forward slash '/' -- (start and ending '/'
		// encase regex, 'g' matches all occurunces not just first)

		// if we got a relative directory, filename_and_extension is the whole
		// relative path to the file (so we know it's unique)
		if (absolute_path !== relative_path_or_root)
			filename_and_extension = Path.join(relative_path_or_root, filename_and_extension).substr(1).replace(/\\/g, '/');

		// the filename + search criteria to use for matching
		var filename_search = "";
		// limiting search to same directory
		if (same_dir) {
			if (absolute_path !== relative_path_or_root) {
				filename_search = Path.join(relative_path_or_root, filename).substr(1).replace(/\\/g, '/');
			} else {
				filename_search = filename;
			}
			filename_search += ".*";
		} else {
			filename_search = "**/" + filename + ".*";
		}

		let search_config = vscode.workspace.getConfiguration( "search" );
		let search_exclude_settings = search_config.get( "exclude" );
		let exclude_files = "{";

		for ( var exclude in search_exclude_settings ) {
			if( search_exclude_settings.hasOwnProperty( exclude ) ) {
				exclude_files += exclude + ",";
			}
		}

		exclude_files += filename_and_extension + "}";

		var files = vscode.workspace.findFiles(filename_search, exclude_files, 100);

		files.then((files) => {
	        if (!files || files.length == 0) {
				return;
			}

			// only want files whose name matches exactly
			let exact_files = files.filter(file => Path.basename(file, Path.extname(file)) === filename);
			if (!exact_files || exact_files.length == 0) {
				return;
			}

			if (exact_files.length === 1) {
				// if only one file - switch
				vscode.workspace.openTextDocument(exact_files[0].fsPath)
					.then(textDoc => {
						let column = vscode.window.activeTextEditor.viewColumn;
						vscode.window.showTextDocument(textDoc, column);
					});
			} else {
				// list and open only the file selected by user
				let display_files = [];

				for (let index = 0, file; index < exact_files.length; index++) {
					file = exact_files[index];
					display_files.push({
						label: file.fsPath.substring(vscode.workspace.rootPath.length + 1),
						description: file.fsPath,
						filePath: file.fsPath
					});
				}

				vscode.window.showQuickPick(display_files)
					.then(val => {
						if (val) {
							vscode.workspace.openTextDocument(val.filePath)
								.then(textDoc => {
									let column = vscode.window.activeTextEditor.viewColumn;
									vscode.window.showTextDocument(textDoc, column);
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