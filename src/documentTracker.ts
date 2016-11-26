import * as vscode from 'vscode';
import { MergeConflictParser, DocumentMergeConflict } from './mergeConflictParser'
import * as interfaces from './interfaces';

interface IMergeConflictCacheItem {
    ts: Date,
    hasConflicts: boolean;
    conflicts: interfaces.IDocumentMergeConflict[]
}

export default class DocumentMergeConflictTracker implements vscode.Disposable, interfaces.IDocumentMergeConflictTracker {

    private cache: Map<string, IMergeConflictCacheItem> = new Map();
    private cacheExperiatinMilliseconds: number = 250;

    getConflicts(document: vscode.TextDocument): interfaces.IDocumentMergeConflict[] {
        // Attempt from cache

        let cacheItem: IMergeConflictCacheItem = null;
        let key = this.getCacheKey(document);

        if (key) {
            cacheItem = this.cache.get(key);
        }

        if (cacheItem && (new Date().getTime() - cacheItem.ts.getTime()) < this.cacheExperiatinMilliseconds) {
            return cacheItem.conflicts;
        }

        // Regenerate
        const conflicts = MergeConflictParser.containsConflict(document) ? MergeConflictParser.scanDocument(document) : [];

        cacheItem = {
            ts: new Date(),
            hasConflicts: conflicts.length > 0,
            conflicts: conflicts
        };

        if (key) {
            this.cache.set(key, cacheItem);
        }

        return cacheItem.conflicts;
    }

    getCacheKey(document: vscode.TextDocument) {
        if (document.uri && document.uri.path) {
            return document.uri.path;
        }

        return null;
    }

    dispose() {
        if (this.cache) {
            this.cache.clear();
            this.cache = null;
        }
    }

}