import * as vscode from "vscode";
import * as path from "path";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // what folders should be considered when switching files
  const enum SwitchMode {
    All,
    SameWorkspace,
    SameDir,
  }

  // the command has been defined in the package.json file
  // the commandId parameter must match the command field in package.json
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.switch_corresponding", () =>
      switchCorresponding(SwitchMode.All)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.switch_corresponding_same_dir",
      () => switchCorresponding(SwitchMode.SameDir)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.switch_corresponding_same_workspace",
      () => switchCorresponding(SwitchMode.SameWorkspace)
    )
  );

  function switchCorresponding(mode: SwitchMode) {
    const absoluteUri = vscode.window.activeTextEditor.document.uri;
    const filePath = absoluteUri.fsPath;
    const filename = path.basename(filePath, path.extname(filePath));

    const getNormalizedRelativeFilename = (workspaceFolder: vscode.Uri) => {
      const folder = path.dirname(filePath);
      let relativePath = folder.slice(workspaceFolder.fsPath.length);
      // remove leading separator
      if (relativePath.charAt(0) === "\\" || "/") {
        // linux or windows
        relativePath = relativePath.slice(1);
      }
      // use only '/' character for glob usage
      return path.join(relativePath, filename).replace(/\\/g, "/");
    };

    // the filename + search criteria to use for matching
    let filenameSearch: string;
    let relativePattern: vscode.RelativePattern;
    if (mode !== SwitchMode.All) {
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(absoluteUri);
      if (!workspaceFolder) {
        vscode.window.showErrorMessage(`No workspace for ${filePath}`);
        return;
      }
      // limiting search to same directory (in same workspace folder)
      if (mode === SwitchMode.SameDir) {
        filenameSearch =
          getNormalizedRelativeFilename(workspaceFolder.uri) + ".*";
        // limiting search to same workspace folder
      } else {
        // mode === SwitchMode.SameWorkspace
        filenameSearch = "**/" + filename + ".*";
      }
      relativePattern = new vscode.RelativePattern(
        workspaceFolder,
        filenameSearch
      );
    } else {
      // search in all workspace folders
      filenameSearch = "**/" + filename + ".*";
    }

    // don't include files excluded from search in the workspace
    const searchExcludeSettings = vscode.workspace
      .getConfiguration("search", null)
      .get("exclude");
    const excludeFiles =
      "{" +
      Object.keys(searchExcludeSettings)
        .filter((key) => searchExcludeSettings[key])
        .toString() +
      "}";

    const maxResults = 10;
    let foundFiles: Thenable<vscode.Uri[]>;
    foundFiles = vscode.workspace.findFiles(
      relativePattern ?? filenameSearch,
      excludeFiles,
      maxResults
    );
    foundFiles.then(
      (files: vscode.Uri[]) => {
        const NoSwitchMessage = "No files to switch found";
        if (!files || files.length == 0) {
          vscode.window.showInformationMessage(NoSwitchMessage);
          return;
        }
        // only want files whose name matches exactly and not the current one
        const exactFiles = files.filter(
          (file) =>
            file.fsPath !== filePath &&
            path.basename(file.fsPath, path.extname(file.fsPath)) === filename
        );
        if (!exactFiles || exactFiles.length == 0) {
          vscode.window.showInformationMessage(NoSwitchMessage);
          return;
        }
        if (exactFiles.length === 1) {
          // if only one file has matched - switch immediately
          vscode.workspace
            .openTextDocument(exactFiles[0].fsPath)
            .then((textDoc) => {
              vscode.window.showTextDocument(
                textDoc,
                vscode.window.activeTextEditor.viewColumn
              );
            });
        } else {
          // list and open only the file selected by the user
          const displayedFiles = exactFiles.map((file) => ({
            label: path.basename(file.fsPath),
            description: vscode.workspace.asRelativePath(file),
            filePath: file.fsPath,
          }));
          vscode.window.showQuickPick(displayedFiles).then((file) => {
            if (file) {
              vscode.workspace
                .openTextDocument(file.filePath)
                .then((textDoc) => {
                  vscode.window.showTextDocument(
                    textDoc,
                    vscode.window.activeTextEditor.viewColumn
                  );
                });
            }
          });
        }
      },
      (reason) => {
        console.warn(reason);
      }
    );
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
