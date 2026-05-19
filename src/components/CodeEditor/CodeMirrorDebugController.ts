import { Extension, RangeSet, StateEffect, StateEffectType, StateField, Transaction } from '@codemirror/state';
import {
    BlockInfo,
    Decoration,
    DecorationSet,
    EditorView,
    gutter,
    GutterMarker,
} from '@codemirror/view';

import { CodeMirrorControllerConfig, EditorBreakpoint } from './CodeMirrorTypes.js';

class BreakpointMarker extends GutterMarker {

    toDOM(): HTMLElement {
        const el = document.createElement('div');
        el.className = 'cm-breakpoint';
        el.title = 'Breakpoint';
        return el;
    }

}

export class CodeMirrorDebugController {

    private view: EditorView | null = null;
    private breakpointState: StateField<RangeSet<GutterMarker>> | null = null;
    private readonly setBreakpointsEffect: StateEffectType<EditorBreakpoint[]>;
    private readonly setExecutionLineEffect: StateEffectType<number | null>;

    constructor() {
        this.setBreakpointsEffect = StateEffect.define<EditorBreakpoint[]>();
        this.setExecutionLineEffect = StateEffect.define<number | null>();
    }

    mount(view: EditorView) {
        this.view = view;
    }

    unmount() {
        this.view = null;
    }

    createExtensions(config: CodeMirrorControllerConfig): Extension[] {
        if (!config.debugEnabled) {
            return [];
        }
        this.breakpointState = this.createBreakpointState(config.breakpoints);
        return [
            this.breakpointState,
            this.createExecutionLineState(config.executionLine),
            this.createBreakpointGutter(this.breakpointState, config.onToggleBreakpoint),
        ];
    }

    updateBreakpoints(breakpoints: EditorBreakpoint[]) {
        if (!this.view) {
            return;
        }
        this.view.dispatch({
            effects: [this.setBreakpointsEffect.of(breakpoints)],
        });
    }

    updateExecutionLine(line: number | null) {
        if (!this.view) {
            return;
        }
        const effects: StateEffect<unknown>[] = [this.setExecutionLineEffect.of(line)];
        if (this.isValidLine(line)) {
            const pos = this.view.state.doc.line(line).from;
            effects.push(EditorView.scrollIntoView(pos, { y: 'nearest', yMargin: 120 }));
        }
        this.view.dispatch({ effects });
    }

    getBreakpoints(): EditorBreakpoint[] {
        if (!this.view || !this.breakpointState) {
            return [];
        }
        const doc = this.view.state.doc;
        const breakpoints: EditorBreakpoint[] = [];
        this.view.state.field(this.breakpointState).between(0, doc.length, from => {
            breakpoints.push({ line: doc.lineAt(from).number });
        });
        return this.normalizeBreakpoints(breakpoints);
    }

    private createBreakpointState(breakpoints: EditorBreakpoint[]) {
        return StateField.define<RangeSet<GutterMarker>>({
            create: state => this.toBreakpointSet(breakpoints, state.doc),
            update: (set, tr) => this.updateBreakpointSet(set, tr),
        });
    }

    private updateBreakpointSet(
        set: RangeSet<GutterMarker>,
        tr: Transaction,
    ): RangeSet<GutterMarker> {
        // eslint-disable-next-line unicorn/no-array-callback-reference
        let nextSet = set.map(tr.changes);
        for (const effect of tr.effects) {
            if (effect.is(this.setBreakpointsEffect)) {
                nextSet = this.toBreakpointSet(effect.value, tr.state.doc);
            }
        }
        return nextSet;
    }

    private toBreakpointSet(
        breakpoints: EditorBreakpoint[],
        doc: Transaction['state']['doc'],
    ): RangeSet<GutterMarker> {
        const ranges = [];
        for (const breakpoint of breakpoints) {
            if (breakpoint.line > 0 && breakpoint.line <= doc.lines) {
                ranges.push(new BreakpointMarker().range(doc.line(breakpoint.line).from));
            }
        }
        return RangeSet.of(ranges, true);
    }

    private normalizeBreakpoints(breakpoints: EditorBreakpoint[]): EditorBreakpoint[] {
        const lines = new Set<number>();
        for (const breakpoint of breakpoints) {
            lines.add(breakpoint.line);
        }
        return [...lines]
            .sort((left, right) => left - right)
            .map(line => ({ line }));
    }

    private createExecutionLineState(executionLine: number | null) {
        const lineDecoration = Decoration.line({ class: 'cm-execution-line' });
        return StateField.define<DecorationSet>({
            create: state => this.createExecutionDecoration(lineDecoration, state.doc, executionLine),
            update: (decorations, tr) => this.updateExecutionLineDecorations(lineDecoration, decorations, tr),
            provide: field => EditorView.decorations.from(field),
        });
    }

    private updateExecutionLineDecorations(
        lineDecoration: Decoration,
        decorations: DecorationSet,
        tr: Transaction,
    ): DecorationSet {
        for (const effect of tr.effects) {
            if (effect.is(this.setExecutionLineEffect)) {
                return this.createExecutionDecoration(lineDecoration, tr.state.doc, effect.value);
            }
        }
        // eslint-disable-next-line unicorn/no-array-callback-reference
        return decorations.map(tr.changes);
    }

    private createExecutionDecoration(
        lineDecoration: Decoration,
        doc: Transaction['state']['doc'],
        lineNo: number | null,
    ): DecorationSet {
        if (!lineNo || lineNo <= 0 || lineNo > doc.lines) {
            return Decoration.none;
        }
        return Decoration.set([lineDecoration.range(doc.line(lineNo).from)]);
    }

    private createBreakpointGutter(
        breakpointState: StateField<RangeSet<GutterMarker>>,
        onToggleBreakpoint: (line: number) => void,
    ): Extension {
        return gutter({
            class: 'cm-breakpoint-gutter',
            markers: view => view.state.field(breakpointState),
            domEventHandlers: {
                mousedown(view: EditorView, line: BlockInfo) {
                    onToggleBreakpoint(view.state.doc.lineAt(line.from).number);
                    return true;
                },
            },
        });
    }

    private isValidLine(line: number | null): line is number {
        return typeof line === 'number' && Number.isInteger(line) &&
            !!this.view && line > 0 && line <= this.view.state.doc.lines;
    }

}
