import * as interfaces from './interfaces';
import * as vscode from 'vscode';

export class DocumentMergeConflict implements interfaces.IDocumentMergeConflict {

    public range: vscode.Range;
    public current: interfaces.IMergeRegion;
    public incoming: interfaces.IMergeRegion;
    public splitter: vscode.Range;

    constructor(document: vscode.TextDocument, match: RegExpExecArray, offsets?: number[]) {
        this.range = new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length));

        this.current = {
            name: match[2],
            header: this.getMatchPositions(document, match, 1, offsets),
            content: this.getMatchPositions(document, match, 3, offsets),
        };

        this.splitter = this.getMatchPositions(document, match, 5, offsets);

        this.incoming = {
            name: match[9],
            header: this.getMatchPositions(document, match, 8, offsets),
            content: this.getMatchPositions(document, match, 6, offsets),
        };

    }

    public commitEdit(type: interfaces.CommitType, editor: vscode.TextEditor, edit?: vscode.TextEditorEdit): Thenable<boolean> {

        if (edit) {

            this.applyEdit(type, editor, edit);
            return Promise.resolve(true);
        };

        return editor.edit((edit) => this.applyEdit(type, editor, edit));
    }

    public applyEdit(type: interfaces.CommitType, editor: vscode.TextEditor, edit: vscode.TextEditorEdit): void {

        // Each conflict is a set of ranges as follows, note placements or newlines
        // which may not in in spans
        // [ Conflict Range             -- (Entire content below)
        //   [ Current Header ]\n       -- >>>>> Header
        //   [ Current Content ]        -- (content)
        //   [ Splitter ]\n             -- =====
        //   [ Incoming Content ]       -- (content)
        //   [ Incoming Header ]\n      -- <<<<< Incoming
        // ]
        if (type === interfaces.CommitType.Current) {
            // Replace [ Conflict Range ] with [ Current Content ]
            edit.replace(this.range, editor.document.getText(this.current.content));
        }
        else if (type === interfaces.CommitType.Incoming) {
            // Replace [ Conflict Range ] with [ Incoming Content ]
            edit.replace(this.range, editor.document.getText(this.incoming.content));
        }
        else if (type === interfaces.CommitType.Both) {
            // Replace [ Conflict Range ] with [ Current Content ] + \n + [ Incoming Content ]
            //
            // NOTE: Dude to headers and splitters NOT covering \n (this is so newlines inserted)
            // by the user after (e.g. <<<<< HEAD do not fall into the header range but the
            // content ranges), we can't push 3x deletes, we need to replace the range with the
            // union of the content.

            const currentContent = editor.document.getText(this.current.content);
            const incomingContent = editor.document.getText(this.incoming.content);

            edit.setEndOfLine(vscode.EndOfLine.LF);
            let updatedContent = currentContent.concat('\n', incomingContent);

            edit.replace(this.range, updatedContent);
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