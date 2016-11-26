'use strict';
import * as vscode from 'vscode';
import MergeDecoratorService from './mergeDecorator';
import CodeLensProvider from './codeLensProvider';
import DocumentTracker from './documentTracker';

export function activate(context: vscode.ExtensionContext) {

    const documentTracker = new DocumentTracker();
    const mergeDecorator = new MergeDecoratorService(context, documentTracker);
    const codeLensProvider = new CodeLensProvider(context, documentTracker);
    mergeDecorator.begin();
    codeLensProvider.begin();

    // Register disposables
    context.subscriptions.push(
        documentTracker,
        mergeDecorator,
        codeLensProvider
    );
}

export function deactivate() {
}

