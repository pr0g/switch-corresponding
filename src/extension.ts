import * as vscode from 'vscode'; // 'vscode' contains the VS Code extensibility API
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // what folders should be considered when switching files
    const enum SwitchMode {
        All,
        SameWorkspace,
        SameDir
    }

    // the command has been defined in the package.json file
    // the commandId parameter must match the command field in package.json
    context.subscriptions.push(vscode.commands.registerCommand(
            'extension.switch_corresponding', () => switch_corresponding(SwitchMode.All)));
    context.subscriptions.push(vscode.commands.registerCommand(
            'extension.switch_corresponding_same_dir', () => switch_corresponding(SwitchMode.SameDir)));
    context.subscriptions.push(vscode.commands.registerCommand(
            'extension.switch_corresponding_same_workspace', () => switch_corresponding(SwitchMode.SameWorkspace)));

    function switch_corresponding(mode: SwitchMode) {
        const absolute_uri = vscode.window.activeTextEditor.document.uri;
        const file_path = absolute_uri.fsPath;
        const filename = path.basename(file_path, path.extname(file_path));

        const get_normalized_rel_filename = (workspace_folder: vscode.Uri) => {
            const folder = path.dirname(file_path);
            let relative_path = folder.slice(workspace_folder.fsPath.length);
            // remove leading separator
            if (relative_path.charAt(0) === '\\' || '/') { // linux or windows
                relative_path = relative_path.slice(1);
            }
            // use only character / for glob usage
            return path.join(relative_path, filename).replace(/\\/g, '/');
          };

        // the filename + search criteria to use for matching
        let filename_search: string;
        let relative_pattern: vscode.RelativePattern;
        if (mode !== SwitchMode.All) {
            const workspace_folder = vscode.workspace.getWorkspaceFolder(absolute_uri);
            if (!workspace_folder) {
                vscode.window.showErrorMessage(`No workspace for ${file_path}`);
                return;
            }
            // limiting search to same directory (in same workspace folder)
            if (mode === SwitchMode.SameDir) {
                filename_search = get_normalized_rel_filename(workspace_folder.uri) + ".*";
            // limiting search to same workspace folder
            } else { // if (mode === SwitchMode.Same_Workspace)
                filename_search = "**/" + filename + ".*";
            }
            relative_pattern = new vscode.RelativePattern(workspace_folder, filename_search);
        } else {
            // search in all workspace folders
            filename_search = "**/" + filename + ".*";
        }

        // don't include files excluded from search in the workspace
        const search_exclude_settings = vscode.workspace.getConfiguration('search', null).get('exclude');
        const exclude_files = "{" +
            Object.keys(search_exclude_settings)
                .filter(key => search_exclude_settings[key]).toString() +
            "}";

        let find_files: Thenable<vscode.Uri[]>;
        if (relative_pattern) {
            find_files = vscode.workspace.findFiles(relative_pattern, exclude_files, 10);
        } else {
            find_files = vscode.workspace.findFiles(filename_search, exclude_files, 10);
        }

        find_files.then((files: vscode.Uri[]) => {
            const NoSwitchMessage = "No files to switch found"
            
            if (!files || files.length == 0) {
                vscode.window.showInformationMessage(NoSwitchMessage);
                return;
            }

            // only want files whose name matches exactly and not the current one
            const exact_files = files.filter(file =>
                (file.fsPath !== file_path) &&
                path.basename(file.fsPath, path.extname(file.fsPath)) === filename);

            if (!exact_files || exact_files.length == 0) {
                vscode.window.showInformationMessage(NoSwitchMessage);
                return;
            }

            if (exact_files.length === 1) {
                // if only one file - switch immediately
                vscode.workspace.openTextDocument(exact_files[0].fsPath)
                    .then(textDoc => {
                        let column = vscode.window.activeTextEditor.viewColumn;
                        vscode.window.showTextDocument(textDoc, column);
                    });
            } else {
                // list and open only the file selected by user
                const display_files =
                    exact_files.map(file => ({
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
