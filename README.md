# vscode-better-merge

Better visual merge conflict support for [Visual Studio Code](http://code.visualstudio.com/), insired by [merge-conflicts](https://atom.io/packages/merge-conflicts) for Atom.

![Demo animation 1](content/1.gif)

Avaliable on the [Visual Studio Extension Marketplace](https://marketplace.visualstudio.com/items?itemName=pprice.better-merge).

## Features

 - Indivual conflicts are highlighted in each file
 - CodeLens actions to either accept "our" or "their" change
 - Navigation shortcuts between conflicts

### Commands

 - `Accept ours` - `Alt+m, 1` - Accept "our" change in the current conflict
 - `Accept theirs` - `Alt+m, 2` - Accept "their" change in the current conflict
 - `Accept current` - `Alt+m, enter` - Accept the change the editor cursor is currenty within
 - `Next Conflict` - `Alm+m, down` - Navigate to the next conflict in the current file
 - `Previous Conflict` - `Alm+m, down` - Navigate to the previous conflict in the current file
 - `Accept all ours (current file)` - Accpect all "our" changes in the current file
 - `Accept all thiers (current file)` - Accept all "their" changes in the current file

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


## Installation

- `Ctrl+P` (windows, linux) `Cmd+P` (mac)
- Type `ext install better-merge` and press `enter`

## TODO

 - [ ] Provide UI experience to track progress of each conflict across a single merge
 - [ ] Test on light and dark themes
 - [ ] Support non git conflicts
 - [ ] Async scanning of documents

## Release Notes

### 0.2.0
- Expose commands for code lens actions
- Add "accept all" commands
- Add "accept current" for focused conflict
- Add "Next / Previous conflict" navigation

### 0.1.3
- Initial working version
