import { EditorSelection, Extension } from '@codemirror/state';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { dependency, Mesh } from 'mesh-ioc';

import { CodeMirrorDebugController } from './CodeMirrorDebugController.js';
import { CodeMirrorModuleLoader, CodeMirrorModules } from './CodeMirrorModuleLoader.js';
import { CodeMirrorControllerConfig, EditorBreakpoint } from './CodeMirrorTypes.js';

export class CodeMirrorController {

    mesh = new Mesh('CodeMirrorController');
    modules = dependency(this, CodeMirrorModuleLoader);
    debug = dependency(this, CodeMirrorDebugController);

    editorView: EditorView | null = null;

    private mounted = false;
    private syncingDocument = false;
    private breakpoints: EditorBreakpoint[];

    constructor(private readonly config: CodeMirrorControllerConfig) {
        this.breakpoints = config.breakpoints;
        this.mesh.connect(this);
        this.mesh.service(CodeMirrorModuleLoader);
        this.mesh.service(CodeMirrorDebugController);
    }

    async mount(parent: HTMLElement) {
        this.mounted = true;
        const modules = await this.modules.load();
        const languageExtension = await this.modules.loadLanguageExtension(this.config.language);
        if (!this.mounted) {
            return;
        }
        const debugExtensions = this.debug.createExtensions(this.config);
        const extensions = this.createExtensions(modules, languageExtension, debugExtensions);
        this.editorView = new modules.view.EditorView({
            doc: this.config.doc,
            extensions,
            parent,
        });
        this.debug.mount(this.editorView);
        this.debug.updateExecutionLine(this.config.executionLine);
    }

    unmount() {
        this.mounted = false;
        this.debug.unmount();
        this.editorView?.destroy();
        this.editorView = null;
    }

    syncDocument(content: string) {
        if (!this.editorView) {
            return;
        }
        const currentContent = this.editorView.state.doc.toString();
        if (currentContent === content) {
            return;
        }
        try {
            this.syncingDocument = true;
            this.editorView.dispatch({
                changes: {
                    from: 0,
                    to: currentContent.length,
                    insert: content,
                },
                selection: this.createPreservedSelection(content.length),
            });
        } finally {
            this.syncingDocument = false;
        }
    }

    updateBreakpoints(breakpoints: EditorBreakpoint[]) {
        this.breakpoints = breakpoints;
        this.debug.updateBreakpoints(breakpoints);
    }

    updateExecutionLine(line: number | null) {
        this.debug.updateExecutionLine(line);
    }

    private createExtensions(
        modules: CodeMirrorModules,
        languageExtension: Extension,
        debugExtensions: Extension[],
    ): Extension[] {
        return [
            ...this.modules.createExtensions(this.config, modules, languageExtension, debugExtensions),
            modules.view.EditorView.editable.of(!this.config.readOnly),
            modules.view.EditorView.updateListener.of(update => this.onViewUpdate(update)),
        ];
    }

    private onViewUpdate(update: ViewUpdate) {
        if (update.docChanged && !this.syncingDocument) {
            this.config.onChange(update.state.doc.toString());
            this.syncMappedBreakpoints();
        }
    }

    private syncMappedBreakpoints() {
        if (!this.config.debugEnabled) {
            return;
        }
        const breakpoints = this.debug.getBreakpoints();
        if (this.areBreakpointsEqual(this.breakpoints, breakpoints)) {
            return;
        }
        this.breakpoints = breakpoints;
        this.config.onBreakpointsChanged(breakpoints);
    }

    private areBreakpointsEqual(left: EditorBreakpoint[], right: EditorBreakpoint[]) {
        if (left.length !== right.length) {
            return false;
        }
        return left.every((breakpoint, index) => breakpoint.line === right[index]?.line);
    }

    private createPreservedSelection(docLength: number): EditorSelection | undefined {
        const selection = this.editorView?.state.selection.main;
        if (!selection) {
            return undefined;
        }
        return EditorSelection.create([
            EditorSelection.range(
                Math.min(selection.anchor, docLength),
                Math.min(selection.head, docLength),
            ),
        ]);
    }

}
