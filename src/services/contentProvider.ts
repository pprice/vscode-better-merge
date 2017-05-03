'use strict';
import * as vscode from 'vscode';
import * as interfaces from './interfaces';

export default class MergeConflictContentProvider implements vscode.TextDocumentContentProvider, vscode.Disposable {

    static scheme = 'better-merge.conflict-diff';

    constructor(private context: vscode.ExtensionContext) {
    }

    begin(config : interfaces.IExtensionConfiguration) {
        this.context.subscriptions.push(
            vscode.workspace.registerTextDocumentContentProvider(MergeConflictContentProvider.scheme, this)
        );
    }

    dispose() {
    }

    async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        try {
            const [start, end] = JSON.parse(uri.query) as { line: number, character: number }[];

            const document = await vscode.workspace.openTextDocument(uri.with({ scheme: 'file', query: undefined }));
            const text = document.getText(new vscode.Range(start.line, start.character, end.line, end.character));
            return text;
        }
        catch (ex) {
            await vscode.window.showErrorMessage('Unable to show comparison');
            return undefined;
        }
    }
}