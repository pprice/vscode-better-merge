
import * as vscode from 'vscode';
import * as interfaces from './interfaces';

export default class MergeConflictCodeLensProvider implements vscode.CodeLensProvider, vscode.Disposable {

    private disposables: vscode.Disposable[] = [];

    constructor(private context: vscode.ExtensionContext, private tracker: interfaces.IDocumentMergeConflictTracker) {
    }

    begin() {
        this.disposables.push(
            vscode.languages.registerCodeLensProvider({ pattern: '**/*' }, this),
            vscode.commands.registerTextEditorCommand('better-merge.accept.ours', (editor, edit, ...args) => {
                if (!args[0]) { return; }

                const conflict: interfaces.IDocumentMergeConflict = args[0];
                conflict.commitEdit(interfaces.CommitType.Ours, editor, edit);
            }),
            vscode.commands.registerTextEditorCommand('better-merge.accept.theirs', (editor, edit, ...args) => {
                if (!args[0]) { return; }

                const conflict: interfaces.IDocumentMergeConflict = args[0];
                conflict.commitEdit(interfaces.CommitType.Theirs, editor, edit);
            })
        );
    }

    dispose() {
        if (this.disposables) {
            this.disposables.forEach(disposable => disposable.dispose());
            this.disposables = null;
        }
    }

    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] {

        let conflicts = this.tracker.getConflicts(document);

        if (!conflicts || conflicts.length == 0) {
            return null;
        }

        let items: vscode.CodeLens[] = [];

        conflicts.forEach(conflict => {
            let acceptOursCommand: vscode.Command = {
                command: 'better-merge.accept.ours',
                title: `Accept Our Changes`,
                arguments: [conflict]
            };

            let acceptTheirsCommand: vscode.Command = {
                command: 'better-merge.accept.theirs',
                title: `Accept Their Changes`,
                arguments: [conflict]
            };

            items.push(new vscode.CodeLens(conflict.range, acceptOursCommand));
            items.push(new vscode.CodeLens(conflict.range, acceptTheirsCommand));
        });

        return items;
    }

    resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.CodeLens {
        return;
    }
}