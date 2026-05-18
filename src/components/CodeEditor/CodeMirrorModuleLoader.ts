import type * as AutocompleteModuleImport from '@codemirror/autocomplete';
import type * as CommandsModuleImport from '@codemirror/commands';
import type * as LanguageModuleImport from '@codemirror/language';
import { EditorState, type Extension } from '@codemirror/state';
import type * as ViewModuleImport from '@codemirror/view';
import type * as HighlightModuleImport from '@lezer/highlight';

import { type CodeMirrorControllerConfig } from './CodeMirrorTypes.js';

export type AutocompleteModule = typeof AutocompleteModuleImport;
export type CommandsModule = typeof CommandsModuleImport;
export type LanguageModule = typeof LanguageModuleImport;
export type ViewModule = typeof ViewModuleImport;
export type HighlightModule = typeof HighlightModuleImport;

export interface CodeMirrorModules {
    view: ViewModule;
    commands: CommandsModule;
    autocomplete: AutocompleteModule;
    language: LanguageModule;
    highlight: HighlightModule;
}

export class CodeMirrorModuleLoader {

    private readonly indentUnit = '    ';

    private modules: CodeMirrorModules | null = null;

    async load(): Promise<CodeMirrorModules> {
        if (!this.modules) {
            this.modules = await this.loadModules();
        }
        return this.modules;
    }

    async loadLanguageExtension(language: string): Promise<Extension> {
        const [
            { javascript },
            { json },
            { html },
            { markdown },
            { yaml },
        ] = await Promise.all([
            import('@codemirror/lang-javascript'),
            import('@codemirror/lang-json'),
            import('@codemirror/lang-html'),
            import('@codemirror/lang-markdown'),
            import('@codemirror/lang-yaml'),
        ]);
        switch (this.normalizeLanguage(language)) {
            case 'javascript':
                return javascript();
            case 'json':
                return json();
            case 'html':
                return html({ selfClosingTags: true });
            case 'markdown':
                return markdown({ completeHTMLTags: false });
            case 'yaml':
                return yaml();
            default:
                return [];
        }
    }

    createExtensions(
        config: CodeMirrorControllerConfig,
        modules: CodeMirrorModules,
        languageExtension: Extension,
        debugExtensions: Extension[],
    ): Extension[] {
        const { view, language, highlight, commands, autocomplete } = modules;
        return [
            EditorState.tabSize.of(this.indentUnit.length),
            language.indentUnit.of(this.indentUnit),
            commands.history(),
            language.indentOnInput(),
            language.syntaxHighlighting(language.defaultHighlightStyle, { fallback: true }),
            language.bracketMatching(),
            autocomplete.closeBrackets(),
            view.highlightActiveLine(),
            language.syntaxHighlighting(highlight.classHighlighter),
            view.placeholder(config.placeholder),
            config.lineWrapping ? view.EditorView.lineWrapping : undefined,
            config.lineNumbers ? view.lineNumbers() : undefined,
            languageExtension,
            this.createKeymap(modules),
            ...debugExtensions,
        ].filter(_ => this.isExtension(_));
    }

    private async loadModules(): Promise<CodeMirrorModules> {
        const [
            view,
            commands,
            autocomplete,
            language,
            highlight,
        ] = await Promise.all([
            import('@codemirror/view'),
            import('@codemirror/commands'),
            import('@codemirror/autocomplete'),
            import('@codemirror/language'),
            import('@lezer/highlight'),
        ]);
        return {
            view,
            commands,
            autocomplete,
            language,
            highlight,
        };
    }

    private normalizeLanguage(language: string): string {
        const normalizedLanguage = language.trim().toLowerCase();
        if (['javascript', 'js', 'typescript', 'ts'].includes(normalizedLanguage)) {
            return 'javascript';
        }
        if (['md', 'markdown'].includes(normalizedLanguage)) {
            return 'markdown';
        }
        if (['yml', 'yaml'].includes(normalizedLanguage)) {
            return 'yaml';
        }
        return normalizedLanguage;
    }

    private createKeymap(modules: CodeMirrorModules): Extension {
        const { view, commands, autocomplete } = modules;
        return view.keymap.of([
            ...commands.defaultKeymap,
            commands.indentWithTab,
            ...autocomplete.closeBracketsKeymap,
            ...commands.historyKeymap,
        ]);
    }

    private isExtension(extension: Extension | undefined): extension is Extension {
        return !!extension;
    }

}
