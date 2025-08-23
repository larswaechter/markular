import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  input,
  InputSignal,
  output,
  ViewChild
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { CommonModule } from '@angular/common';
import { DefaultOptions, Options } from './models/options';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

const EDITOR_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => Markular),
  multi: true,
};

@Component({
  selector: 'markular',
  imports: [CommonModule, FormsModule],
  providers: [EDITOR_VALUE_ACCESSOR],
  templateUrl: './markular.component.html',
  styleUrl: './markular.component.scss',
  standalone: true,
})
export class Markular implements AfterViewInit, ControlValueAccessor {
  options: InputSignal<Options | undefined> = input();
  rows: InputSignal<number> = input(10);
  placeholder: InputSignal<string> = input('Enter Markdown...');

  onChange = output<string>();

  history: string[] = [];
  historyIndex = 0;

  preview!: SafeHtml;
  showPreview = false;
  isFocused = false;
  isDisabled = false;

  _val = '';
  _options = computed<Options>(() =>
    this.options() !== undefined ? (this.options() as Options) : DefaultOptions,
  );

  @ViewChild('editor') editorRef!: ElementRef<HTMLTextAreaElement>;
  private readonly elementRef = inject(ElementRef<HTMLInputElement>);
  private readonly sanitizer = inject(DomSanitizer);
  private cursor = 0;
  private selStart = 0;
  private selEnd = 0;

  constructor() {
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
  }

  set value(value: string) {
    console.log('set value', value);
    this._val = value;
    this._onChange(value);
    this._onTouched();
    console.log(this.history);
  }

  private get selection(): string {
    return this._val.slice(this.selStart, this.selEnd);
  }

  private get lines() {
    const lines = this._val.split('\n');
    const lineRanges = [];

    let lineOffset = 0;
    for (const line of lines) {
      lineRanges.push({
        from: lineOffset,
        to: lineOffset + line.length,
        content: line,
      });

      lineOffset += line.length + 1;
    }

    const currentLineIdx = lineRanges.findIndex(
      (line) => this.cursor >= line.from && this.cursor <= line.to,
    );

    return { currentLineIdx, lines: lineRanges };
  }

  _onChange = (value: string) => {};

  _onTouched = () => {};

  writeValue(value: string) {
    console.log('write value', value);
    this._val = value;
    this.appendHistory();
    this.historyIndex--;
    // this.elementRef.nativeElement.querySelector('textarea').value = value;
  }

  registerOnChange(onChange: any) {
    this._onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this._onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  ngAfterViewInit(): void {
    window.addEventListener('insertSnippet', (e: any) => {
      const snippet: string = e.detail ?? '';
      this.replaceSelection(snippet);
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Preview
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      this.togglePreview();

      // Undo // Redo
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) {
        this.redo();
      } else {
        this.undo();
      }

      // Bold
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      this.toggleBold();

      // Italic
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'i') {
      event.preventDefault();
      this.toggleItalic();

      // Tab
    } else if (event.key === 'Tab' && this.isFocused) {
      event.preventDefault();

      // Remove tab (4 spaces)
      if (event.shiftKey) {
        if (this.selStart === this.cursor) {
          this.insert(
            this.selection
              .split('\n')
              .map((line) => line.replace(/^\s{4}/, ''))
              .join('\n'),
          );
        }

        // Add tab (4 spaces)
      } else {
        if (this.selStart === this.cursor) {
          this.insert(
            this.selection
              .split('\n')
              .map((line) => ' '.repeat(4) + line)
              .join('\n'),
          );
        } else {
          this.selStart = this.cursor;
          this.selEnd = this.cursor;
          this.insert(' '.repeat(4));
        }
      }

      this._onChange(this._val);
      this.onChange?.emit(this._val);
    }
  }

  onInput(ta: HTMLTextAreaElement) {
    this.value = ta.value;
    this.appendHistory();
  }

  toggleFocused() {
    this.isFocused = !this.isFocused;
  }

  cacheSelection(ta: HTMLTextAreaElement) {
    this.cursor = ta.selectionStart ?? 0;
    this.selStart = ta.selectionStart ?? 0;
    this.selEnd = ta.selectionEnd ?? 0;

    // Select current line if nothing selected
    if (this.selStart === this.selEnd) {
      const lines = this.lines;
      if (lines.currentLineIdx >= 0) {
        this.selStart = lines.lines[lines.currentLineIdx].from;
        this.selEnd = lines.lines[lines.currentLineIdx].to;
      }
    }

    console.log('cacheSelection', this.selStart, this.selEnd, this.cursor);
  }

  /**
   *
   * Toolbar
   *
   */

  isHeading(size: number): boolean {
    const regex = new RegExp(`^#{${size}}(?!#)`);
    return regex.test(this.selection);
  }

  toggleHeading(size: number) {
    if (this.selection.startsWith('#')) {
      const currentSize = this.countHashes(this.selection);
      if (currentSize === size) {
        this.insert(this.unwrap('#'.repeat(size), ''));
      } else if (size > currentSize) {
        this.insert(this.wrap('#'.repeat(size - currentSize), '', false));
      } else {
        this.insert(this.unwrap('#'.repeat(currentSize - size), ''));
      }
    } else {
      this.insert(this.wrap('#'.repeat(size), '', true));
    }
  }

  isBold() {
    return (
      this._val.slice(this.selStart, this.selStart + 2) === '**' &&
      this._val.slice(this.selEnd - 2, this.selEnd) === '**'
    );
  }

  toggleBold() {
    if (this.isBold()) {
      this.insert(this.unwrap('**'));
    } else {
      this.insert(this.wrap('**'));
    }
  }

  isItalic() {
    return (
      !this.isBold() &&
      this._val.slice(this.selStart, this.selStart + 1) === '*' &&
      this._val.slice(this.selEnd - 1, this.selEnd) === '*'
    );
  }

  toggleItalic() {
    if (this.isItalic()) {
      this.insert(this.unwrap('*'));
    } else {
      this.insert(this.wrap('*'));
    }
  }

  isUnorderedList(): boolean {
    return this.selection.split('\n').every((line) => /^-(?!-)/.test(line.trimStart()));
  }

  toggleUnorderedList() {
    if (this.isUnorderedList()) {
      const lines = (this.selection || '')
        .split('\n')
        .map((line) => (line ? line.replace(/^\t*-\s?/g, '') : ''));
      this.insert(lines.join('\n'));
    } else {
      if (this.isOrderedList()) {
        const lines = (this.selection || '').split('\n').map((line) => {
          const tabs = this.countTabs(line);
          return line.replace(/^\t*\d+\./, '\t'.repeat(tabs) + '-');
        });
        this.insert(lines.join('\n'));
      } else {
        const lines = (this.selection || '').split('\n').map((line) => (line ? `- ${line}` : '- '));
        this.insert(lines.join('\n'));
      }
    }
  }

  isOrderedList(): boolean {
    return this.selection.split('\n').every((line) => /^\d+\./.test(line.trimStart()));
  }

  toggleOrderedList() {
    if (this.isOrderedList()) {
      const lines = (this.selection || '')
        .split('\n')
        .map((line) => (line ? line.replace(/^\t*\d+\.\s?/g, '') : ''));
      this.insert(lines.join('\n'));
    } else {
      if (this.isUnorderedList()) {
        const lineLevels = new Map();
        const levelCounter = new Map();

        (this.selection || '').split('\n').forEach((line, i) => {
          lineLevels.set(i, this.countTabs(line));
        });

        const lines = (this.selection || '').split('\n').map((line, i) => {
          line = line.replace(/^\t*-\s?/, '');

          const tabs = lineLevels.get(i);
          const n = (levelCounter.get(tabs) || 0) + 1;

          levelCounter.set(tabs, n);

          return '\t'.repeat(tabs) + `${n}. ${line}`;
        });

        this.insert(lines.join('\n'));
      } else {
        const lines = (this.selection || '').split('\n').map((line, i) => `${i + 1}. ${line}`);
        this.insert(lines.join('\n'));
      }
    }
  }

  isLink() {
    return /^\[.*]\(.*\)/.test(this.selection);
  }

  applyLink() {
    this.insert(`[${this.selection}](https://)`);
  }

  isImage() {
    return /^!\[.*]\(.*\)/.test(this.selection);
  }

  applyImage() {
    this.insert(`![${this.selection}](https://)`);
  }

  isQuote() {
    return /^>\s?/.test(this.selection);
  }

  toggleQuote() {
    if (this.isQuote()) {
      this.insert(this.selection.replace(/>\s?/, ''));
    } else {
      this.insert(this.wrap('> ', ''));
    }
  }

  isCodeBlock() {
    return /`{3}\w*\n.*\n`{3}/.test(this.selection);
  }

  toggleCodeBlock() {
    if (!this.isCodeBlock()) {
      this.insert('```ts\n' + (this.selection || '') + '\n```');
    } else {
      const match = this.selection.match(/`{3}\w*\n(.*)\n`{3}/);
      if (match?.length === 2) {
        this.insert(match[1]);
      }
    }
  }

  isInlineCode() {
    return /`[^`]+`/.test(this.selection);
  }

  toggleInlineCode() {
    this.setSelectionToCursor();
    if (this.isInlineCode()) {
      this.insert(this.selection.replaceAll('`', ''));
    } else {
      this.insert(this.wrap('`', '`'));
    }
  }

  isDivider() {
    return /^---$/.test(this.selection);
  }

  toggleDivider() {
    if (this.isDivider()) {
      this.insert('');
    } else {
      this.insert(this.wrap('\n---', '\n\n'));
    }
  }

  undo() {
    console.log(this.history, this.historyIndex);
    if (this.canUndo()) {
      this.historyIndex--;
      this.value = this.history[this.historyIndex];
      this.editorRef.nativeElement.focus();
    }
  }

  redo() {
    if (this.canRedo()) {
      this.historyIndex++;
      this.value = this.history[this.historyIndex];
      this.editorRef.nativeElement.focus();
    }
  }

  canUndo(): boolean {
    return this.historyIndex > 0;
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  download() {
    const blob = new Blob([this._val], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  togglePreview() {
    if (!this.showPreview) {
      this.updatePreview();
    }

    this.showPreview = !this.showPreview;

    if (!this.showPreview) {
      setTimeout(() => {
        this.editorRef.nativeElement.focus();
      });
    }
  }

  private wrap(before: string, after = before, space: boolean = false) {
    if (space) {
      return `${before} ${this.selection}${after}`;
    }

    return `${before}${this.selection}${after}`;
  }

  private unwrap(before: string, after = before) {
    const selection = this.selection;
    let from = before.length;

    // Remove trailing space
    if (selection.at(from) === ' ') {
      from++;
    }

    return selection.slice(from, selection.length - after.length);
  }

  private insert(snippet: string) {
    const event = new CustomEvent('insertSnippet', { detail: snippet });
    window.dispatchEvent(event);
  }

  private countTabs(str: string) {
    return str.split(/[^\t]/)[0].length;
  }

  private countHashes(str: string) {
    return str.split(/[^#]/)[0].length;
  }

  private replaceSelection(snippet: string) {
    const before = this._val.slice(0, this.selStart);
    const after = this._val.slice(this.selEnd);

    this.value = before + snippet + after;
    this.appendHistory();

    // Move caret to end of inserted snippet
    const caret = (before + snippet).length;
    setTimeout(() => {
      this.editorRef.nativeElement.focus();
      this.editorRef.nativeElement.setSelectionRange(caret, caret);
      this.cacheSelection(this.editorRef.nativeElement);
    });
  }

  private setSelectionToCursor() {
    this.selStart = this.cursor;
    this.selEnd = this.cursor;
  }

  private updatePreview() {
    const rawHtml = marked.parse(this._val);
    const clean = DOMPurify.sanitize(rawHtml.toString(), { USE_PROFILES: { html: true } });
    this.preview = this.sanitizer.bypassSecurityTrustHtml(clean);
  }

  private appendHistory() {
    if (this._val !== this.history[this.historyIndex]) {
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(this._val ?? '');
      this.historyIndex++;
    }
  }
}
