import * as vscode from 'vscode';
import * as interfaces from './interfaces';
import { DocumentMergeConflict } from './documentMergeConflict';

export class MergeConflictParser {

    static scanDocument(document: vscode.TextDocument): interfaces.IDocumentMergeConflict[] {

        // Match groups
        // 1: "current" header
        // 2: "current" name
        // 3: "current" content
        // 4: Garbage (rouge \n)
        // 5: Splitter
        // 6: "incoming" content
        // 7: Garbage  (rouge \n)
        // 8: "incoming" header
        // 9: "incoming" name
        const conflictMatcher = /(<<<<<<< (.+)\r?\n)^((.*\s)+?)(^=======\r?\n)(?:^((.*\s)+?))*?(^>>>>>>> (.+)$)/mg;
        const offsetGroups = [1, 3, 5, 6, 8]; // Skip inner matches when calculating length

        let result: DocumentMergeConflict[] = [];
        let text = document.getText();
        let match: RegExpExecArray;
        while (match = conflictMatcher.exec(text)) {
            // Esnure we don't get stuck in an infinite loop
            if (match.index === conflictMatcher.lastIndex) {
                conflictMatcher.lastIndex++;
            }

            result.push(new DocumentMergeConflict(document, match, offsetGroups));
        }

        return result;
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
