
import * as vscode from 'vscode';
import * as interfaces from './interfaces';

export default class MergeConflictCodeLensProvider implements vscode.CodeLensProvider, vscode.Disposable {

    private disposables: vscode.Disposable[] = [];
    private config : interfaces.IExtensionConfiguration;

    constructor(private context: vscode.ExtensionContext, private tracker: interfaces.IDocumentMergeConflictTracker) {
    }

    begin(config : interfaces.IExtensionConfiguration) {
        this.config = config;
        this.disposables.push(
            vscode.languages.registerCodeLensProvider({ pattern: '**/*' }, this)
        );
    }

    configurationUpdated(config : interfaces.IExtensionConfiguration) {
        this.config = config;
    }

    dispose() {
        if (this.disposables) {
            this.disposables.forEach(disposable => disposable.dispose());
            this.disposables = null;
        }
    }

    async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {

        if(!this.config || !this.config.enableCodeLens) {
            return null;
        }

        let conflicts = await this.tracker.getConflicts(document);

        if (!conflicts || conflicts.length === 0) {
            return null;
        }

        let items: vscode.CodeLens[] = [];

        conflicts.forEach(conflict => {
            let acceptCurrentCommand: vscode.Command = {
                command: 'better-merge.accept.current',
                title: `Accept current change`,
                arguments: ['known-conflict', conflict]
            };

            let acceptIncomingCommand: vscode.Command = {
                command: 'better-merge.accept.incoming',
                title: `Accept incoming change`,
                arguments: ['known-conflict', conflict]
            };

            let acceptBothCommand: vscode.Command = {
                command: 'better-merge.accept.both',
                title: `Accept both changes`,
                arguments: ['known-conflict', conflict]
            };

            items.push(
                new vscode.CodeLens(conflict.range, acceptCurrentCommand),
                new vscode.CodeLens(conflict.range, acceptIncomingCommand),
                new vscode.CodeLens(conflict.range, acceptBothCommand)
            );
        });

        return items;
    }

    resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.CodeLens {
        return;
    }
}