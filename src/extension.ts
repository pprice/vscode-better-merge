'use strict';
import * as vscode from 'vscode';
import Services from './services';

export function activate(context: vscode.ExtensionContext) {
    // Register disposables
    const services = new Services(context);
    services.begin();

    context.subscriptions.push(services);
}

export function deactivate() {
}

