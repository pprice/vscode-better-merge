import * as vscode from 'vscode';
import * as interfaces from './interfaces';

const messages = {
    cursorNotInConflict: 'Editor cursor is not within a merge conflict',
    cursorOnSplitterRange: 'Editor cursor is within the merge conflict splitter, please move it to either the "ours" or "theirs" block',
    noConflicts: 'No merge conflicts found in this file',
    noOtherConflictsInThisFile: 'No other merge conflicts within this file'
};

interface IDocumentMergeConflictNavigationResults {
    canNavigate: boolean;
    conflict?: interfaces.IDocumentMergeConflict;
}

enum NavigationDirection {
    Forwards,
    Backwards
}

export default class CommandHandler implements vscode.Disposable {

    private disposables: vscode.Disposable[] = [];

    constructor(private context: vscode.ExtensionContext, private tracker: interfaces.IDocumentMergeConflictTracker) {
    }

    begin() {

        const textEditorCommand = (name: string, callback: any) => {
            this.disposables.push(vscode.commands.registerTextEditorCommand(name, callback, this));
        };

        textEditorCommand('better-merge.accept.ours', this.acceptOurs);
        textEditorCommand('better-merge.accept.theirs', this.acceptTheirs);
        textEditorCommand('better-merge.accept.current', this.acceptCurrent);
        textEditorCommand('better-merge.accept.all-ours', this.acceptAllOurs);
        textEditorCommand('better-merge.accept.all-theirs', this.acceptAllTheirs);
        textEditorCommand('better-merge.next', this.navigateNext);
        textEditorCommand('better-merge.previous', this.navigatePrevious);
    }

    acceptOurs(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args) {
        this.accept(interfaces.CommitType.Ours, editor, edit, ...args);
    }

    acceptTheirs(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args) {
        this.accept(interfaces.CommitType.Theirs, editor, edit, ...args);
    }

    acceptCurrent(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args) {
        let conflict = this.findConflictContainingSelection(editor);

        if (!conflict) {
            vscode.window.showWarningMessage(messages.cursorNotInConflict);
            return;
        }

        let typeToAccept: interfaces.CommitType = null;

        // Figure out if the cursor is in ours or thiers, we do this by seeing if
        // the active position is before or after the range of the splitter. We can
        // use this trick as the previous check in findConflictByActiveSelection will
        // ensure it's within the conflict range, so we don't falsely identify "ours"
        // or "thiers" if outside of a conflict range.
        if (editor.selection.active.isBefore(conflict.splitter.start)) {
            typeToAccept = interfaces.CommitType.Ours;
        }
        else if (editor.selection.active.isAfter(conflict.splitter.end)) {
            typeToAccept = interfaces.CommitType.Theirs;
        }
        else {
            vscode.window.showWarningMessage(messages.cursorOnSplitterRange);
            return;
        }

        this.tracker.forget(editor.document);
        conflict.commitEdit(typeToAccept, editor, edit);
    }

    acceptAllOurs(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args) {
        this.acceptAll(interfaces.CommitType.Ours, editor, edit);
    }

    acceptAllTheirs(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args) {
        this.acceptAll(interfaces.CommitType.Theirs, editor, edit);
    }

    navigateNext(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args) {
        this.navigate(editor, NavigationDirection.Forwards);
    }

    navigatePrevious(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args) {
        this.navigate(editor, NavigationDirection.Backwards);
    }

    navigate(editor: vscode.TextEditor, direction: NavigationDirection) {
        let navigationResult = this.findConflictForNavigation(editor, direction);

        if (!navigationResult) {
            vscode.window.showWarningMessage(messages.noConflicts);
            return;
        }
        else if (!navigationResult.canNavigate) {
            vscode.window.showWarningMessage(messages.noOtherConflictsInThisFile);
            return;
        }

        // Move the selection to the first line of the conflict
        editor.selection = new vscode.Selection(navigationResult.conflict.range.start, navigationResult.conflict.range.start);
        editor.revealRange(navigationResult.conflict.range, vscode.TextEditorRevealType.Default);
    }

    dispose() {
        if (this.disposables) {
            this.disposables.forEach(disposable => disposable.dispose());
            this.disposables = null;
        }
    }

    private accept(type: interfaces.CommitType, editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args) {

        let conflict: interfaces.IDocumentMergeConflict = null;

        // If launched with known context, take the conflict from that
        if (args[0] === 'known-conflict') {
            conflict = args[1];
        }
        else {
            // Attempt to find a conflict that matches the current curosr position
            conflict = this.findConflictContainingSelection(editor);
        }

        if (!conflict) {
            vscode.window.showWarningMessage(messages.cursorNotInConflict);
            return;
        }

        // Tracker can forget as we know we are going to do an edit
        this.tracker.forget(editor.document);
        conflict.commitEdit(type, editor, edit);
    }

    private acceptAll(type: interfaces.CommitType, editor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
        let conflicts = this.tracker.getConflicts(editor.document);

        if (!conflicts || conflicts.length === 0) {
            vscode.window.showWarningMessage(messages.noConflicts);
            return;
        }

        // For get the current state of the document, as we know we are doing to do a large edit
        this.tracker.forget(editor.document);

        conflicts.forEach(conflict => {
            conflict.commitEdit(type, editor, edit);
        });
    }

    private findConflictContainingSelection(editor: vscode.TextEditor, conflicts?: interfaces.IDocumentMergeConflict[]): interfaces.IDocumentMergeConflict {

        if (!conflicts) {
            conflicts = this.tracker.getConflicts(editor.document);
        }

        if (!conflicts || conflicts.length === 0) {
            return null;
        }

        for (let i = 0; i < conflicts.length; i++) {
            if (conflicts[i].range.contains(editor.selection.active)) {
                return conflicts[i];
            }
        }

        return null;
    }

    private findConflictForNavigation(editor: vscode.TextEditor, direction: NavigationDirection, conflicts?: interfaces.IDocumentMergeConflict[]): IDocumentMergeConflictNavigationResults {
        if (!conflicts) {
            conflicts = this.tracker.getConflicts(editor.document);
        }

        if (!conflicts || conflicts.length === 0) {
            return null;
        }

        let selection = editor.selection.active;
        if (conflicts.length === 1) {
            if (conflicts[0].range.contains(selection)) {
                return {
                    canNavigate: false
                };
            }

            return {
                canNavigate: true,
                conflict: conflicts[0]
            };
        }

        let predicate: (conflict) => boolean = null;
        let fallback: () => interfaces.IDocumentMergeConflict = null;

        if (direction === NavigationDirection.Forwards) {
            predicate = (conflict) => selection.isBefore(conflict.range.start);
            fallback = () => conflicts[0];
        } else if (direction === NavigationDirection.Backwards) {
            predicate = (conflict) => selection.isAfter(conflict.range.start);
            fallback = () => conflicts[conflicts.length - 1];
        } else {
            throw new Error(`Unsupported direction ${direction}`);
        }

        for (let i = 0; i < conflicts.length; i++) {
            if (predicate(conflicts[i]) && !conflicts[i].range.contains(selection)) {
                return {
                    canNavigate: true,
                    conflict: conflicts[i]
                };
            }
        }

        // Went all the way to the end, return the head
        return {
            canNavigate: true,
            conflict: fallback()
        };
    }
}