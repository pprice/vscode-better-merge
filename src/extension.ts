'use strict';
import * as vscode from 'vscode';
import MergeDecoratorService from './merge-decorator-service';
import CodeLensProvider from './codelens-provider';

export function activate(context: vscode.ExtensionContext) {

    console.log('better-merge activated');

    // Listen for active editor changes
    const mergeDecorator = new MergeDecoratorService(context);
    const codeLensProvider = new CodeLensProvider(context);
    mergeDecorator.begin();
    codeLensProvider.begin();

    // Register disposables
    context.subscriptions.push(
        mergeDecorator,
        codeLensProvider
    );
}

export function deactivate() {
}

