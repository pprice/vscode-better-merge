import * as vscode from 'vscode';
import * as interfaces from './interfaces';

export class DocumentMergeConflict implements interfaces.IDocumentMergeConflict {

    public range: vscode.Range;
    public ours: interfaces.IMergeRegion;
    public theirs: interfaces.IMergeRegion;
    public splitter: vscode.Range;

    constructor(document: vscode.TextDocument, match: RegExpExecArray, offsets?: number[]) {
        this.range = new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length));

        this.ours = {
            name: match[2],
            header: this.getMatchPositions(document, match, 1, offsets),
            content: this.getMatchPositions(document, match, 3, offsets),
        };

        this.splitter = this.getMatchPositions(document, match, 5, offsets);

        this.theirs = {
            name: match[9],
            header: this.getMatchPositions(document, match, 8, offsets),
            content: this.getMatchPositions(document, match, 6, offsets),
        };

    }

    public commitEdit(type: interfaces.CommitType, editor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
        if (type === interfaces.CommitType.Ours) {
            edit.replace(this.range, editor.document.getText(this.ours.content));
        }
        else if (type === interfaces.CommitType.Theirs) {
            edit.replace(this.range, editor.document.getText(this.theirs.content));
        }
    }

    private getMatchPositions(document: vscode.TextDocument, match: RegExpExecArray, groupIndex: number, offsetGroups?: number[]): vscode.Range {
        // Javascript doesnt give of offsets within the match, we need to calculate these
        // based of the prior groups, skipping nested matches (yuck).
        if (!offsetGroups) {
            offsetGroups = match.map((i, idx) => idx);
        }

        let start = match.index;

        for (var i = 0; i < offsetGroups.length; i++) {
            let value = offsetGroups[i];

            if (value >= groupIndex) {
                break;
            }

            start += match[value].length;
        }

        let targetMatchLength = match[groupIndex].length;
        let end = (start + targetMatchLength);

        // Move the end up if it's capped by a trailing \r\n, this is so regions don't expand into
        // the line below, and can be "pulled down" by editing the line below
        if (match[groupIndex].lastIndexOf('\n') === targetMatchLength - 1) {
            end--;

            // .. for windows encodings of new lines
            if (match[groupIndex].lastIndexOf('\r') === targetMatchLength - 2) {
                end--;
            }
        }

        return new vscode.Range(document.positionAt(start), document.positionAt(end));
    }
}

export class MergeConflictParser {

    static scanDocument(document: vscode.TextDocument): DocumentMergeConflict[] {

        // Match groups
        // 1: "our" header
        // 2: "our" name
        // 3: "our" content
        // 4: Garbage (rouge \n)
        // 5: Splitter
        // 6: "their" content
        // 7: Garbage  (rouge \n)
        // 8: "their" header
        // 9: "their" name
        const conflictMatcher = /(<<<<<<< (.+)\r?\n)^((.*\s)+?)(^=======\r?\n)^((.*\s)+?)(^>>>>>>> (.+)$)/mg;
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
