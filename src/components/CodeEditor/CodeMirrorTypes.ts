export interface EditorBreakpoint {
    line: number;
}

export interface CodeMirrorControllerConfig {
    doc: string;
    language: string;
    placeholder: string;
    lineWrapping: boolean;
    lineNumbers: boolean;
    readOnly: boolean;
    debugEnabled: boolean;
    breakpoints: EditorBreakpoint[];
    executionLine: number | null;
    onChange(content: string): void;
    onToggleBreakpoint(line: number): void;
    onBreakpointsChanged(breakpoints: EditorBreakpoint[]): void;
}
