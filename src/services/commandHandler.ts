import * as vscode from 'vscode';
import * as interfaces from './interfaces';

const messages = {
    cursorNotInConflict: 'Editor cursor is not within a merge conflict',
    cursorOnSplitterRange: 'Editor cursor is within the merge conflict splitter, please move it to either the "current" or "incoming" block',
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
        this.disposables.push(
            vscode.commands.registerTextEditorCommand('better-merge.accept.current', this.acceptCurrent, this),
            vscode.commands.registerTextEditorCommand('better-merge.accept.incoming', this.acceptIncoming, this),
            vscode.commands.registerTextEditorCommand('better-merge.accept.selection', this.acceptSelection, this),
            vscode.commands.registerTextEditorCommand('better-merge.accept.all-current', this.acceptAllCurrent, this),
            vscode.commands.registerTextEditorCommand('better-merge.accept.all-incoming', this.acceptAllIncoming, this),
            vscode.commands.registerTextEditorCommand('better-merge.next', this.navigateNext, this),
            vscode.commands.registerTextEditorCommand('better-merge.previous', this.navigatePrevious, this)
        );
    }

    acceptCurrent(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args): Promise<void> {
        return this.accept(interfaces.CommitType.Current, editor, ...args);
    }

    acceptIncoming(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args): Promise<void> {
        return this.accept(interfaces.CommitType.Incoming, editor, ...args);
    }

    acceptAllCurrent(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args): Promise<void> {
        return this.acceptAll(interfaces.CommitType.Current, editor);
    }

    acceptAllIncoming(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args): Promise<void> {
        return this.acceptAll(interfaces.CommitType.Incoming, editor);
    }

    navigateNext(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args): Promise<void> {
        return this.navigate(editor, NavigationDirection.Forwards);
    }

    navigatePrevious(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args): Promise<void> {
        return this.navigate(editor, NavigationDirection.Backwards);
    }

    async acceptSelection(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args): Promise<void> {
        let conflict = await this.findConflictContainingSelection(editor);

        if (!conflict) {
            vscode.window.showWarningMessage(messages.cursorNotInConflict);
            return;
        }

        let typeToAccept: interfaces.CommitType = null;

        // Figure out if the cursor is in current or incoming, we do this by seeing if
        // the active position is before or after the range of the splitter. We can
        // use this trick as the previous check in findConflictByActiveSelection will
        // ensure it's within the conflict range, so we don't falsely identify "current"
        // or "incoming" if outside of a conflict range.
        if (editor.selection.active.isBefore(conflict.splitter.start)) {
            typeToAccept = interfaces.CommitType.Current;
        }
        else if (editor.selection.active.isAfter(conflict.splitter.end)) {
            typeToAccept = interfaces.CommitType.Incoming;
        }
        else {
            vscode.window.showWarningMessage(messages.cursorOnSplitterRange);
            return;
        }

        this.tracker.forget(editor.document);
        conflict.commitEdit(typeToAccept, editor);
    }

    dispose() {
        if (this.disposables) {
            this.disposables.forEach(disposable => disposable.dispose());
            this.disposables = null;
        }
    }

    private async navigate(editor: vscode.TextEditor, direction: NavigationDirection): Promise<void> {
        let navigationResult = await this.findConflictForNavigation(editor, direction);

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

    private async accept(type: interfaces.CommitType, editor: vscode.TextEditor, ...args): Promise<void> {

        let conflict: interfaces.IDocumentMergeConflict = null;

        // If launched with known context, take the conflict from that
        if (args[0] === 'known-conflict') {
            conflict = args[1];
        }
        else {
            // Attempt to find a conflict that matches the current curosr position
            conflict = await this.findConflictContainingSelection(editor);
        }

        if (!conflict) {
            vscode.window.showWarningMessage(messages.cursorNotInConflict);
            return;
        }

        // Tracker can forget as we know we are going to do an edit
        this.tracker.forget(editor.document);
        conflict.commitEdit(type, editor);
    }

    private async acceptAll(type: interfaces.CommitType, editor: vscode.TextEditor): Promise<void> {
        let conflicts = await this.tracker.getConflicts(editor.document);

        if (!conflicts || conflicts.length === 0) {
            vscode.window.showWarningMessage(messages.noConflicts);
            return;
        }

        // For get the current state of the document, as we know we are doing to do a large edit
        this.tracker.forget(editor.document);

        // Apply all changes as one edit
        await editor.edit((edit) => conflicts.forEach(conflict => {
            conflict.applyEdit(type, editor, edit);
        }));
    }

    private async findConflictContainingSelection(editor: vscode.TextEditor, conflicts?: interfaces.IDocumentMergeConflict[]): Promise<interfaces.IDocumentMergeConflict> {

        if (!conflicts) {
            conflicts = await this.tracker.getConflicts(editor.document);
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

    private async findConflictForNavigation(editor: vscode.TextEditor, direction: NavigationDirection, conflicts?: interfaces.IDocumentMergeConflict[]): Promise<IDocumentMergeConflictNavigationResults> {
        if (!conflicts) {
            conflicts = await this.tracker.getConflicts(editor.document);
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