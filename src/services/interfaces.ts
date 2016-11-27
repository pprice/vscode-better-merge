import * as vscode from 'vscode';

export interface IMergeRegion {
    name: string;
    header: vscode.Range;
    content: vscode.Range;
}

export enum CommitType {
    Ours,
    Theirs
}

export interface IDocumentMergeConflict {
    range: vscode.Range;
    ours: IMergeRegion;
    theirs: IMergeRegion;
    splitter: vscode.Range;

    commitEdit(type: CommitType, editor: vscode.TextEditor, edit?: vscode.TextEditorEdit);
    applyEdit(type: CommitType, editor: vscode.TextEditor, edit: vscode.TextEditorEdit);
}

export interface IDocumentMergeConflictTracker {
    getConflicts(document: vscode.TextDocument): PromiseLike<IDocumentMergeConflict[]>;
    forget(document : vscode.TextDocument);
}
