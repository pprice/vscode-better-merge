# vscode-better-merge

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
 - `Accept selection` - `Alt+M, Enter` - Accept the change the editor cursor is currenty within
 - `Next conflict` - `Alm+M, Down Arrow` - Navigate to the next conflict in the current file
 - `Previous conflict` - `Alm+M, Down Arrow` - Navigate to the previous conflict in the current file
 - `Accept all current` - Accept all current changes in the current file
 - `Accept all incoming` - Accept all incoming changes in the current file
 - `Accept all both` - Accept all changes as a "both" merge in the current file

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

### 0.6.1
 - Fixed handling of empty incoming merges 
 - Fixed potential endless loop when parsing merge conflicts in open files

### 0.6.0
 - Update vscode engine version for 1.11.0 compatibility

### 0.5.1
 - Add "Accept all both" command

### 0.5.0
 - Add "Accept both" command and CodeLens action.

### 0.4.0
 - Use "Current" and "Incoming" naming over "Ours" and "Theirs"

### 0.3.x
 - Fix crash on startup for linux (or any other case sensitive file system).
 - Add user configuration
 - Small UI Tweaks (naming consistency)

