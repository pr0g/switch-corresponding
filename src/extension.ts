// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('"switch-corresponding" now active');

	const enum ESwitchMode {
		All = 0,
		Same_Workspace,
		Same_Dir
	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.switch_corresponding', () => switch_corresponding() ));
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.switch_corresponding_same_dir', () => switch_corresponding(ESwitchMode.Same_Dir) ));
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.switch_corresponding_same_workspace', () => switch_corresponding(ESwitchMode.Same_Workspace) ));

	function switch_corresponding(mode: ESwitchMode = ESwitchMode.All ) {

		const absolute_uri = vscode.window.activeTextEditor.document.uri;
		const absolute_filename = absolute_uri.fsPath;

		const filename = path.basename(absolute_filename, path.extname(absolute_filename));

		const getNormalisedRelativeFilename = (wsfolder) => {
			const fp = path.dirname(absolute_filename);

			let res = fp.slice(wsfolder.fsPath.length);
			if (res.charAt(0) === '\\' || '/')  // linux or windows
			    res = res.slice(1);
			return path.join(res, filename).replace(/\\/g, '/'); // use only character / for glob usage
  		};

		// the filename + search criteria to use for matching
		let filename_search: string;
		let relativePattern: vscode.RelativePattern;
		if (mode !== ESwitchMode.All) {
			const wsfolder = vscode.workspace.getWorkspaceFolder(absolute_uri);
			if (!wsfolder) {
				vscode.window.showErrorMessage(`No workspace for ${absolute_filename}`);
				return;
			}
			// limiting search to same directory (in same workspace folder)
			if (mode === ESwitchMode.Same_Dir)
				filename_search = getNormalisedRelativeFilename(wsfolder.uri) + ".*";
			// limiting search to same workspace folder
			else // if (mode === ESwitchMode.Same_Workspace)
				filename_search = "**/" + filename + ".*";
			relativePattern = new vscode.RelativePattern(wsfolder, filename_search);
		} else {
			// search in all workspace folders
			filename_search = "**/" + filename + ".*";
		}

		// don't include files excluded from search in the workspace
		// const search_exclude_settings = vscode.workspace.getConfiguration('search', absolute_uri).get('exclude');
		const search_exclude_settings = vscode.workspace.getConfiguration('search', null).get('exclude');
		const exclude_files = "{" +
			Object.keys(search_exclude_settings)
				.filter(key => search_exclude_settings[key]).toString() +
			"}";

		let findFiles: Thenable<vscode.Uri[]>;
		if (relativePattern)
			findFiles = vscode.workspace.findFiles(relativePattern, exclude_files, 100);
		else
			findFiles = vscode.workspace.findFiles(filename_search, exclude_files, 100);

		findFiles.then((files: vscode.Uri[]) => {
	        if (!files || files.length == 0) {
				vscode.window.showInformationMessage('No files to switch found');
				return;
			}

			// only want files whose name matches exactly and not the current one
			const exact_files = files.filter(file =>
					(file.fsPath !== absolute_filename) &&
					path.basename(file.fsPath, path.extname(file.fsPath)) === filename);

			if (!exact_files || exact_files.length == 0) {
				vscode.window.showInformationMessage('No files to switch found');
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
				const display_files =
					exact_files.map(file => ({
							// label: file.fsPath.substring(vscode.workspace.rootPath.length + 1),
							label: path.basename(file.fsPath),
							description: file.fsPath,
							filePath: file.fsPath
						})
					);

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