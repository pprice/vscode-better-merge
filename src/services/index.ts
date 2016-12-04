import * as vscode from 'vscode';
import DocumentTracker from './documentTracker';
import CodeLensProvider from './codelensProvider';
import CommandHandler from './commandHandler';
import Decorator from './mergeDecorator';

const ConfigurationSectionName = 'better-merge';

export default class ServiceWrapper implements vscode.Disposable {

    private services: vscode.Disposable[] = [];

    constructor(private context: vscode.ExtensionContext) {
    }

    begin() {

        let configuration = vscode.workspace.getConfiguration(ConfigurationSectionName);
        const documentTracker = new DocumentTracker();

        this.services.push(
            documentTracker,
            new CommandHandler(this.context, documentTracker),
            new CodeLensProvider(this.context, documentTracker),
            new Decorator(this.context, documentTracker),
        );

        this.services.forEach((service: any) => {
            if (service.begin && service.begin instanceof Function) {
                service.begin(configuration);
            }
        });

        vscode.workspace.onDidChangeConfiguration(() => {
            this.services.forEach((service: any) => {
                if (service.configurationUpdated && service.configurationUpdated instanceof Function) {
                    service.configurationUpdated(vscode.workspace.getConfiguration(ConfigurationSectionName));
                }
            });
        });
    }

    dispose() {
        if (this.services) {
            this.services.forEach(disposable => disposable.dispose());
            this.services = null;
        }
    }
}

