# vscode-better-merge

Better visual merge conflict support for [Visual Studio Code](http://code.visualstudio.com/), insired by [merge-conflicts](https://atom.io/packages/merge-conflicts) for Atom.

![Demo animation 1](content/1.gif)

Avaliable on the [Visual Studio Extension Marketplace](https://marketplace.visualstudio.com/items?itemName=pprice.better-merge).

## Features

 - Indivual conflicts are highlighted in each file
 - CodeLens actions to either accept "our" or "their" change
 - Navigation shortcuts between conflicts

### Commands

All commands use a double key chord combination by default. First press `Alt+M` then press the second key.

 - `Accept ours` - `Alt+M, 1` - Accept "our" change in the current conflict
 - `Accept theirs` - `Alt+M, 2` - Accept "their" change in the current conflict
 - `Accept current` - `Alt+M, Enter` - Accept the change the editor cursor is currenty within
 - `Next conflict` - `Alm+M, Down Arrow` - Navigate to the next conflict in the current file
 - `Previous conflict` - `Alm+M, Down Arrow` - Navigate to the previous conflict in the current file
 - `Accept all ours` - Accpect all "our" changes in the current file
 - `Accept all thiers` - Accept all "their" changes in the current file

*NOTE*: All accept commands can be undone with Undo (`Ctrl+Z` / `Cmd+Z`)

### Key bindings

The following commands are exposed if you wish to customize key bindings (*Preferences > Keyboard Shortcuts*)

```
better-merge.accept.ours
better-merge.accept.theirs
better-merge.accept.current
better-merge.next
better-merge.previous
better-merge.accept.all-ours
better-merge.accept.all-theirs
```

### Configuration

- `better-merge.enableCodeLens` (default: `true`) - Enable / disable inline code lens actions above merge conflict blocks
- `better-merge.enableDecorations` (default: `true`) - Enable / disable additional editor decoration (background color, etc) of merge conflict blocks
- `better-merge.enableEditorOverview` (default: `true`) - Enable / disable highlighting of merge conflicts in the editor overview area (right hand side)

## Installation

- `Ctrl+P` (windows, linux) `Cmd+P` (mac)
- Type `ext install better-merge` and press `enter`

## TODO

 - [ ] Provide UI experience to track progress of each conflict across a single merge
 - [ ] Support non git conflicts
 - [ ] Scanning of non-open documents
 - [ ] Change highlighting / status when a merge conflict region is edited

## Release Notes

### 0.3.1
 - Fix crash on startup for linux (or any other case sensitive file system).

### 0.3.0
 - Add user configuration
 - Small UI Tweaks (naming consistency)

### 0.2.1
 - Renamed commands
 - Conflict parsing is now async

### 0.2.0
- Expose commands for code lens actions
- Add "accept all" commands
- Add "accept current" for focused conflict
- Add "Next / Previous conflict" navigation