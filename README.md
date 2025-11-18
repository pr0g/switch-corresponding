# Switch Corresponding

 `switch-corresponding` allows you to easily switch between interface and implementation files (`.h/.cpp` or `.m` etc) with one command.

![switch-corresponding-demo](https://github.com/user-attachments/assets/bb26d6cc-4ada-4a25-aa06-bafd8c371b09)

Bind your favourite key combinations* to these commands:

- `extension.switch_corresponding`
- `extension.switch_corresponding_same_dir` (to limit switch search to the same directory)
- `extension.switch_corresponding_same_workspace` (to limit switch search to the same workspace, if working with multiple workspaces).

\* (_I  like_ `Alt+O` _from Visual Assist in Visual Studio_ 🙂).

__NOTE:__ You must open a folder (workspace) for this extension to work. The easiest way to do this is to `cd` to the directory you want as your root from a terminal/command line, and then type `'code .'`. This will create a workspace with your current location as the workspace root, and `switch-corresponding` will work as expected! Also, if you haven't done this already, you may need to install `code` to your system `PATH`. If you hit F1 from inside Visual Studio Code, and start typing _install_, you should see an option for `Shell Command: Install 'code' command in PATH` - hit that and you're all set.

## For more information

- Check out the source here - [switch-corresponding](https://github.com/pr0g/switch-corresponding)
- Note: When cloning the repro - make sure to run `npm install` at the project root to be able to run the project from the Visual Studio Code debugger.
  - Once you have done that, open Visual Studio Code with `code .` from the command line at the folder you cloned the repro into, open `src/extension.ts` and hit F5!
  - (you might find that you need to also run `tsc -p ./` to compile the `extension.ts` typescript file).

__Note: No guarantees are made about if it will work 100% of the time!__

## Updates

__2025/11/18__ - Update Visual Studio Code version, npm dependencies and code tidy-up (also use relative workspace path for file list)  
__2021/05/09__ - Update Visual Studio Code version and npm dependencies  
__2019/05/05__ - Update npm dependencies  
__2018/01/06__ - Merge PR from _zabel-xyz_ to add support for multiple workspaces  
__2017/03/30__ - Merge PR from _zabel-xyz_ to fix (another) issue with Visual Studio Code absolute/relative paths (on windows)  
__2016/10/29__ - Merge PR from _zabel-xyz_ to fix new issue with Visual Studio Code absolute/relative paths  
__2016/09/10__ - Fix incompatibility with latest Visual Studio Code update (v1.5.1) where `vscode.workspace.asRelativePath` no longer returned absolute path to workspace root when at workspace root level, but `""`  

__Enjoy!__
