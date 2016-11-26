'use strict';
import * as vscode from 'vscode';
import MergeDecoratorService from './merge-decorator-service';
import MergeConflictParser, { DocumentMergeConflict } from './merge-conflict-parser';

export function activate(context: vscode.ExtensionContext) {

    console.log('better-merge activated');

    // Listen for active editor changes
    const mergeDecorator = new MergeDecoratorService(context);

    mergeDecorator.begin();

    // Register for everything :|
    context.subscriptions.push(
        mergeDecorator,
        vscode.languages.registerCodeLensProvider({ pattern: '**/*' }, new CLP()),
        vscode.commands.registerTextEditorCommand('better-merge.accept.ours', (editor, edit, ...args) => {
            if(!args[0]) { return; }

            const conflict : DocumentMergeConflict = args[0];
            conflict.commitOursEdit(editor, edit);
        }),
        vscode.commands.registerTextEditorCommand('better-merge.accept.theirs', (editor, edit, ...args) => {
            if(!args[0]) { return; }

            const conflict : DocumentMergeConflict = args[0];
            conflict.commitTheirsEdit(editor, edit);
        })
    );
}

export function deactivate() {
}

class CLP implements vscode.CodeLensProvider {
    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] {
        if (!MergeConflictParser.containsConflict(document)) {
            return null;
        }

        let items: vscode.CodeLens[] = [];
        MergeConflictParser.scanDocument(document).forEach(conflict => {
            let command: vscode.Command = {
                command: 'better-merge.accept.ours',
                title: `Accept Our Change`,
                arguments: [conflict]
            };

            let command2: vscode.Command = {
                command: 'better-merge.accept.theirs',
                title: `Accept Their Change`,
                arguments: [conflict]
            };
            items.push(new vscode.CodeLens(conflict.range, command));
            items.push(new vscode.CodeLens(conflict.range, command2));
        });

        return items;
    }

    resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.CodeLens {
        return;
    }


}