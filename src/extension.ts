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
		var absolute_filename = vscode.window.activeTextEditor.document.fileName;
		
		var filename = Path.basename(absolute_filename, Path.extname(absolute_filename));
		var filename_and_extension = Path.basename(absolute_filename);

		// note: replace(/\\/g, '/') statement is a regex search for all backslashes `\`
		// in path, it then replaces each with a forward slash '/' -- (start and ending '/'
		// encase regex, 'g' matches all occurunces not just first)

		// returns directory name of a path
		let absolute_dir = Path.dirname(absolute_filename);
		// note: here `normalised` refers to ensuring all separator characters
		// are forward slashes (/) not backward slashes (\)
		let relative_dir = vscode.workspace.asRelativePath(absolute_dir);
		let normalised_relative_dir = relative_dir.replace(/\\/g, '/');
		let normalised_relative_filename = Path.join(relative_dir, filename);
		let normalised_relative_filename_and_extension = Path.join(relative_dir, filename_and_extension);

		// the filename + search criteria to use for matching
		var filename_search = "";
		
		if (same_dir) {
			// limiting search to same directory
			filename_search = normalised_relative_filename + ".*";
		} else {
			// search entire workspace
			filename_search = "**/" + filename + ".*";
		}

		// don't include files excluded form the workspace
		let search_config = vscode.workspace.getConfiguration( "search" );
		let search_exclude_settings = search_config.get( "exclude" );
		let exclude_files = "{";

		for ( var exclude in search_exclude_settings ) {
			if( search_exclude_settings.hasOwnProperty( exclude ) ) {
				exclude_files += exclude + ",";
			}
		}

		exclude_files += normalised_relative_filename_and_extension + "}";

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