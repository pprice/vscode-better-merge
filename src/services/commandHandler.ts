import * as vscode from 'vscode';
import * as interfaces from './interfaces';

export default class CommandHandler implements vscode.Disposable {

    private disposables: vscode.Disposable[] = [];
    constructor(private context: vscode.ExtensionContext, private tracker: interfaces.IDocumentMergeConflictTracker)
    { }

    begin() {

        const textEditorCommand = (name: string, callback: any) => {
            this.disposables.push(vscode.commands.registerTextEditorCommand(name, callback, this));
        };

        textEditorCommand('better-merge.accept.ours', this.acceptOurs);
        textEditorCommand('better-merge.accept.theirs', this.acceptTheirs);
        textEditorCommand('better-merge.accept.all-ours', this.acceptAllOurs);
        textEditorCommand('better-merge.accept.all-theirs', this.acceptAllTheirs);
    }

    acceptOurs(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args) {
        this.accept(interfaces.CommitType.Ours, editor, edit, ...args);
    }

    acceptTheirs(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args) {
        this.accept(interfaces.CommitType.Theirs, editor, edit, ...args);
    }

    acceptAllOurs(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args) {
        this.acceptAll(interfaces.CommitType.Ours, editor, edit);
    }

    acceptAllTheirs(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args) {
        this.acceptAll(interfaces.CommitType.Theirs, editor, edit);
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
            let conflicts = this.tracker.getConflicts(editor.document);
            conflict = this.findMatchingConflict(editor, conflicts);
        }

        if (!conflict) {
            vscode.window.showWarningMessage('Your cursor is not within a merge conflict');
            return;
        }

        // Tracker can forget as we know we are going to do an edit
        this.tracker.forget(editor.document);
        conflict.commitEdit(type, editor, edit);
    }

    private acceptAll(type: interfaces.CommitType, editor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
        let conflicts = this.tracker.getConflicts(editor.document);

        if (!conflicts || conflicts.length === 0) {
            vscode.window.showWarningMessage('No merge conflicts found in this file');
            return;
        }

        // For get the current state of the document, as we know we are doing to do a large edit
        this.tracker.forget(editor.document);

        conflicts.forEach(conflict => {
            conflict.commitEdit(type, editor, edit);
        });
    }

    private findMatchingConflict(editor: vscode.TextEditor, conflicts: interfaces.IDocumentMergeConflict[]) {
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
}