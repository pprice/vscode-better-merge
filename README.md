# 🎉Extension merged into [vscode](https://github.com/Microsoft/vscode) 🎉

This extension is now part of the official Visual Studio Code feature set, as of 1.13.0. This version of the extension will no longer be maintained and any issues or pull requests should be opened against [Microsoft/vscode](https://github.com/Microsoft/vscode). 

See [PR #27150](https://github.com/Microsoft/vscode/pull/27150).

## Migration from extension 

 - Configuration
   - `better-merge.enableCodeLens` --> `merge-conflict.codeLens.enabled`
   - `better-merge.enableDecorations` and `better-merge.enableEditorOverview` --> `merge-conflict.decorators.enabled`
 - Commands. All commands are identical, but have been moved from `better-merge.*` to `merge-conflict.*` 

The code here is now a reference for anyone interested 😎

# vscode-better-merge (deprecated)
Better visual merge conflict support for [Visual Studio Code](http://code.visualstudio.com/), inspired by [merge-conflicts](https://atom.io/packages/merge-conflicts) for Atom.

![Demo animation 1](content/1.gif)

Available on the [Visual Studio Extension Marketplace](https://marketplace.visualstudio.com/items?itemName=pprice.better-merge).

## Features

 - Individual conflicts are highlighted in each file
 - Command palette commands for resolving and navigating between merge conflicts (see below)
 - CodeLens actions to either accept "current", "incoming" or "both" changes
 - Navigation shortcuts between conflicts

### Commands

All commands use a double key chord combination by default. First press `Alt+M` then press the second key.

 - `Accept current` - `Alt+M, 1` - Accept current (local) change in the current conflict
 - `Accept incoming` - `Alt+M, 2` - Accept incoming change in the current conflict
 - `Accept both` - `Alt+M, 3` - Accept the union of both the current and incoming change for the current conflict
 - `Accept selection` - `Alt+M, Enter` - Accept the change the editor cursor is currently within
 - `Next conflict` - `Alm+M, Down Arrow` - Navigate to the next conflict in the current file
 - `Previous conflict` - `Alm+M, Down Arrow` - Navigate to the previous conflict in the current file
 - `Accept all current` - Accept all current changes in the current file
 - `Accept all incoming` - Accept all incoming changes in the current file
 - `Accept all both` - Accept all changes as a "both" merge in the current file
  - `Compare current conflict` - Compares the active conflict in the VSCode diff utility 

*NOTE*: All accept commands can be undone with Undo (`Ctrl+Z` / `Cmd+Z`)

### Key bindings

The following commands are exposed if you wish to customize key bindings (*Preferences > Keyboard Shortcuts*)

```
better-merge.accept.current
better-merge.accept.incoming
better-merge.accept.both
better-merge.accept.selection
better-merge.next
better-merge.previous
better-merge.accept.all-current
better-merge.accept.all-incoming
better-merge.accept.all-both
better-merge.compare
```

### Configuration

- `better-merge.enableCodeLens` (default: `true`) - Enable / disable inline code lens actions above merge conflict blocks
- `better-merge.enableDecorations` (default: `true`) - Enable / disable additional editor decoration (background color, etc) of merge conflict blocks
- `better-merge.enableEditorOverview` (default: `true`) - Enable / disable highlighting of merge conflicts in the editor overview area (right hand side)
