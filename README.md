# Switch Corresponding
 `switch-corresponding` allows you to easily switch between interface and implementation files (.h/.cpp or .m etc) with one command

![Example](misc/vscode-switch-corresponding-preview.gif)

Bind your favourite key combination to this command: `extension.switch_corresponding` and `extension.switch_corresponding_same_dir` (to limit switch search to the same directory)

(I  like `Alt+O` from Visual Assist in Visual Studio :))

** NOTE: ** You must create a project for this to work.
The easiest way to do this is to `cd` to the directory you want as your root from terminal/command line, and then type `'code .'`.
This will create a project with your current location as the workspace root and `switch-corresponding` will work as expected!
Also if you haven't done this already, you may need to install `code` to your system PATH.
If you hit F1 from inside vscode, and start typing install, you should see an option for `Shell Command: Install 'code' command in PATH` - hit that and you're away!

### For more information
 * Check out the source here - https://github.com/pr0g/switch-corresponding
 * Note: When cloning the repro - make sure to run `npm install` at the project root to be able to run the project from the vscode debugger. 
  	* Once you have done that, open vscode with `vscode .` from the command line at the folder you cloned the repro into, open `src/extension.ts` and hit F5!

** Note: No guarantees are made about if it will work 100% of the time! **

## Updates
29/10/2016 - merge PR from zabel-xyz to fix new issue with vscode absolute/relative paths
10/09/2016 - fix incompatibility with latest VSCode update (v1.5.1) where `vscode.workspace.asRelativePath` no longer returned absolute path to workspace root when at workspace root level, but `""`

**Enjoy!**
