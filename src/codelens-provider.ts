
import * as vscode from 'vscode';
import MergeConflictParser, { DocumentMergeConflict } from './merge-conflict-parser';

export default class MergeConflictCodeLensProvider implements vscode.CodeLensProvider, vscode.Disposable {

    private disposables: vscode.Disposable[] = [];

    constructor(private context: vscode.ExtensionContext) {

    }

    begin() {
        this.disposables.push(
            vscode.languages.registerCodeLensProvider({ pattern: '**/*' }, this),
            vscode.commands.registerTextEditorCommand('better-merge.accept.ours', (editor, edit, ...args) => {
                if (!args[0]) { return; }

                const conflict: DocumentMergeConflict = args[0];
                conflict.commitOursEdit(editor, edit);
            }),
            vscode.commands.registerTextEditorCommand('better-merge.accept.theirs', (editor, edit, ...args) => {
                if (!args[0]) { return; }

                const conflict: DocumentMergeConflict = args[0];
                conflict.commitTheirsEdit(editor, edit);
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
        if (!MergeConflictParser.containsConflict(document)) {
            return null;
        }

        let items: vscode.CodeLens[] = [];
        let conflicts = MergeConflictParser.scanDocument(document);

        conflicts.forEach(conflict => {
            let acceptOursCommand: vscode.Command = {
                command: 'better-merge.accept.ours',
                title: `Accept Our Change`,
                arguments: [conflict]
            };

            let acceptTheirsCommand: vscode.Command = {
                command: 'better-merge.accept.theirs',
                title: `Accept Their Change`,
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