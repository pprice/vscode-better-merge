import * as vscode from 'vscode';
import DocumentTracker from './documentTracker';
import CodeLensProvider from './codeLensProvider';
import CommandHandler from './commandHandler';
import Decorator from './mergeDecorator';

export default class ServiceWrapper implements vscode.Disposable {

    private disposables: vscode.Disposable[] = [];

    constructor(private context: vscode.ExtensionContext) {
    }

    begin() {
        const documentTracker = new DocumentTracker();

        this.disposables.push(
            documentTracker,
            new CommandHandler(this.context, documentTracker),
            new CodeLensProvider(this.context, documentTracker),
            new Decorator(this.context, documentTracker),
        );

        this.disposables.forEach((service: any) => {
            if (service.begin && service.begin instanceof Function) {
                service.begin();
            }
        });
    }

    dispose() {
        if (this.disposables) {
            this.disposables.forEach(disposable => disposable.dispose());
            this.disposables = null;
        }
    }
}

