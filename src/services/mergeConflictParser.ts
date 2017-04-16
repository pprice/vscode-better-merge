import * as vscode from 'vscode';
import * as interfaces from './interfaces';
import { DocumentMergeConflict } from './documentMergeConflict';
import * as vm from 'vm';
import * as util from 'util';

export class MergeConflictParser {

    static scanDocument(document: vscode.TextDocument): interfaces.IDocumentMergeConflict[] {
        // Conflict matching regex, comments are in the format of "description - [group index] group name"
        const conflictMatcher = new RegExp([
                /(<<<<<<< (.+)\r?\n)/,          // "Current" conflict header - [1] entire line, [2] name
                /^((.*\s)+?)/,                  // "Current" conflict body - [3] body text, [4] garbage
                /(^=======\r?\n)/,              // Splitter - [5] entire line
                /(?:^((.*\s)+?))*?/,            // Incoming conflict body - [6] content, [7] garbage
                /(^>>>>>>> (.+)$)/              // Incoming conflict header - [8] entire line, [2] name
            ].map(r => r.source).join(''), 
            'mg');
        
        const offsetGroups = [1, 3, 5, 6, 8]; // Skip inner matches when calculating length

        let text = document.getText();
        let sandboxScope = {
            result: [],
            conflictMatcher,
            text: text
        };
        const context = vm.createContext(sandboxScope);
        const script = new vm.Script(`
            let match;
            while (match = conflictMatcher.exec(text)) {
                // Ensure we don't get stuck in an infinite loop
                if (match.index === conflictMatcher.lastIndex) {
                    conflictMatcher.lastIndex++;
                }

                result.push(match);
            }`);

        try {
            // If the regex takes longer than 1s consider it dead
            script.runInContext(context, { timeout: 1000 });
        }
        catch (ex) {
            return [];
        }

        return sandboxScope.result.map(match => new DocumentMergeConflict(document, match, offsetGroups));
    }

    static containsConflict(document: vscode.TextDocument): boolean {
        if (!document) {
            return false;
        }

        // TODO: Ask source control if the file contains a conflict
        let text = document.getText();
        return text.includes('<<<<<<<') && text.includes('>>>>>>>');
    }

}
