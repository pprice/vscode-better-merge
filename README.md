# vscode-better-merge

Better visual merge conflict support for [Visual Studio Code](http://code.visualstudio.com/), insired by [merge-conflicts](https://atom.io/packages/merge-conflicts) for Atom.

![Demo animation 1](content/1.gif)

Avaliable on the [Visual Studio Extension Marketplace](https://marketplace.visualstudio.com/items?itemName=pprice.better-merge).

## Features

 - Indivual conflicts are highlighted in each file
 - CodeLens actions to either accept "our" or "their" change

## Installation

- `Ctrl+P` (windows) `Cmd+P` (mac)
- Type in `ext install better-merge` and press `enter`

## TODO

 - [ ] Provide UI experience to track progress of each conflict across a single merge
 - [ ] Provide shortcuts to move to next / previous merge conflict
 - [ ] Add "accept all theirs" / "accept all ours"
 - [ ] Test on light and dark themes
 - [ ] Add keyboard shortcuts for accept actions
 - [ ] Unify file scanning for merge conflicts, currently done twice for lenses and decorations
 - [ ] Support non git conflicts

## Release Notes
### 0.1.3
Initial working version
