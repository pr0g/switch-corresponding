# Switch Corresponding

 `switch-corresponding` allows you to easily switch between interface and implementation files (`.h/.cpp` or `.m` etc) with one command.

![switch-corresponding-demo](https://github.com/user-attachments/assets/bb26d6cc-4ada-4a25-aa06-bafd8c371b09)

Bind your favourite key combination to this command: `extension.switch_corresponding`, `extension.switch_corresponding_same_dir` (to limit switch search to the same directory) and `switch_corresponding_same_workspace` (to limit switch search to the same workspace, if working with multiple workspaces).

(I  like `Alt+O` from Visual Assist in Visual Studio 🙂).

__NOTE:__ You must create a project for this to work.
The easiest way to do this is to `cd` to the directory you want as your root from terminal/command line, and then type `'code .'`. This will create a project with your current location as the workspace root and `switch-corresponding` will work as expected! Also if you haven't done this already, you may need to install `code` to your system PATH. If you hit F1 from inside vscode, and start typing install, you should see an option for `Shell Command: Install 'code' command in PATH` - hit that and you're away.

## For more information

- Check out the source here - [switch-corresponding](https://github.com/pr0g/switch-corresponding)
- Note: When cloning the repro - make sure to run `npm install` at the project root to be able to run the project from the vscode debugger.
  - Once you have done that, open vscode with `vscode .` from the command line at the folder you cloned the repro into, open `src/extension.ts` and hit F5!
  - (you might find that you need to also run `tsc -p ./` to compile the `extension.ts` typescript file).

__Note: No guarantees are made about if it will work 100% of the time!__

## Updates

09/05/2021 - update vscode version and npm dependencies

05/05/2019 - update npm dependencies

06/01/2018 - merge PR from _zabel-xyz_ to add support for multiple workspaces

30/03/2017 - merge PR from _zabel-xyz_ to fix (another) issue with vscode absolute/relative paths (on windows)

29/10/2016 - merge PR from _zabel-xyz_ to fix new issue with vscode absolute/relative paths

10/09/2016 - fix incompatibility with latest VSCode update (v1.5.1) where `vscode.workspace.asRelativePath` no longer returned absolute path to workspace root when at workspace root level, but `""`

__Enjoy!__
