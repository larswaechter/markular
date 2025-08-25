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
  ViewChild,
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

  history: { caretPosBefore: number; caretPosAfter: number; content: string }[] = [];
  historyIndex = 0;

  preview!: SafeHtml;
  showPreview = false;
  isFocused = false;
  isDisabled = false;

  selStart = 0;
  selEnd = 0;
  caretPos = 0;

  _val = '';
  _options = computed<Options>(() =>
    this.options() !== undefined ? (this.options() as Options) : DefaultOptions,
  );

  @ViewChild('editor') editorRef!: ElementRef<HTMLTextAreaElement>;

  private readonly elementRef = inject(ElementRef<HTMLInputElement>);
  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
  }

  set value(value: string) {
    // console.log('set value', value);
    this._val = value;
    this._onChange(value);
    this._onTouched();
  }

  private get selection(): string {
    return this._val.slice(this.selStart, this.selEnd) || '';
  }

  private get currentLine(): string {
    const lines = this.lines;
    if (lines.currentLineIdx >= 0) {
      return (
        this._val.slice(
          lines.lines[lines.currentLineIdx].from,
          lines.lines[lines.currentLineIdx].to,
        ) || ''
      );
    }

    return '';
  }

  private get selectionOrCurrentLine(): string {
    if (this.isNoneSelected()) {
      return this.currentLine;
    }

    return this.selection;
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
      (line) => this.caretPos >= line.from && this.caretPos <= line.to,
    );

    return { currentLineIdx, lines: lineRanges };
  }

  _onChange = (value: string) => {};

  _onTouched = () => {};

  writeValue(value: string) {
    this._val = value || '';
    this.historyIndex--;

    // Set selection to EOF
    this.selStart = this.selEnd = this.caretPos = this._val.length;
    this.appendHistory(this.selStart, this.selStart);

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
      const snippet: string = e.detail.snippet;
      this.replaceSelection(snippet, e.detail.moveCaret);
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
        if (this.selStart === this.caretPos) {
          this.insertEnd(
            this.selection
              .split('\n')
              .map((line) => line.replace(/^\s{4}/, ''))
              .join('\n'),
          );
        }

        // Add tab (4 spaces)
      } else {
        if (this.selStart === this.caretPos) {
          this.insertEnd(
            this.selection
              .split('\n')
              .map((line) => ' '.repeat(4) + line)
              .join('\n'),
          );
        } else {
          this.selStart = this.caretPos;
          this.selEnd = this.caretPos;
          this.insertEnd(' '.repeat(4));
        }
      }

      this._onChange(this._val);
      this.onChange?.emit(this._val);
    }
  }

  onInput(ta: HTMLTextAreaElement) {
    this.value = ta.value;

    if (this.selStart !== this.selEnd) {
      this.appendHistory(this.selEnd, this.selStart);
      this.caretPos = this.selStart;
    } else {
      this.appendHistory(this.caretPos, ta.selectionEnd);
      this.caretPos = ta.selectionEnd;
    }
  }

  toggleFocused() {
    this.isFocused = !this.isFocused;
  }

  cacheSelection(ta: HTMLTextAreaElement) {
    this.caretPos = ta.selectionStart ?? 0;
    this.selStart = ta.selectionStart ?? 0;
    this.selEnd = ta.selectionEnd ?? 0;
    // console.log('cacheSelection', this.selStart, this.selEnd);
  }

  /**
   *
   * Toolbar
   *
   */

  isHeading(size: number): boolean {
    const regex = new RegExp(`^#{${size}}(?!#)`);
    return regex.test(this.selectionOrCurrentLine);
  }

  toggleHeading(size: number) {
    if (this.isNoneSelected()) {
      this.setSelectionToCurrentLine();
    }

    if (this.selection.startsWith('#')) {
      const currentSize = this.countHashes(this.selection);
      if (currentSize === size) {
        this.insertStart(this.unwrap('#'.repeat(size), ''));
      } else if (size > currentSize) {
        this.insertEnd(this.wrap('#'.repeat(size - currentSize), '', false));
      } else {
        this.insertStart(this.unwrap('#'.repeat(currentSize - size), ''));
      }
    } else {
      this.insertEnd(this.wrap('#'.repeat(size), '', true));
    }
  }

  isBold() {
    return /^\*{2}.*\*{2}/.test(this.selection);
  }

  toggleBold() {
    if (this.isBold()) {
      this.insertEnd(this.unwrap('**'));
    } else {
      this.insertEnd(this.wrap('**'));
    }
  }

  isItalic() {
    return !this.isBold() && /^\*.*\*/.test(this.selection);
  }

  toggleItalic() {
    if (this.isItalic()) {
      this.insertEnd(this.unwrap('*'));
    } else {
      this.insertEnd(this.wrap('*'));
    }
  }

  isUnorderedList(): boolean {
    return this.selectionOrCurrentLine
      .split('\n')
      .every((line) => /^-(?!-)/.test(line.trimStart()));
  }

  toggleUnorderedList() {
    if (this.isNoneSelected()) {
      this.setSelectionToCurrentLine();
    }

    if (this.isUnorderedList()) {
      const lines = this.selection
        .split('\n')
        .map((line) => (line ? line.replace(/^\s*-\s?/g, '') : ''));
      this.insertStart(lines.join('\n'));
    } else if (this.isOrderedList()) {
      const lines = this.selection.split('\n').map((line) => {
        const tabs = this.countTabs(line);
        return line.replace(/^\s*\d+\./, ' '.repeat(4 * tabs) + '-');
      });
      this.insertEnd(lines.join('\n'));
    } else {
      const lines = this.selection.split('\n').map((line) => (line ? `- ${line}` : '- '));
      this.insertEnd(lines.join('\n'));
    }
  }

  isOrderedList(): boolean {
    return this.selectionOrCurrentLine.split('\n').every((line) => /^\d+\./.test(line.trimStart()));
  }

  toggleOrderedList() {
    if (this.isNoneSelected()) {
      this.setSelectionToCurrentLine();
    }

    if (this.isOrderedList()) {
      const lines = this.selection
        .split('\n')
        .map((line) => (line ? line.replace(/^\s*\d+\.\s?/g, '') : ''));
      this.insertStart(lines.join('\n'));
    } else if (this.isUnorderedList()) {
      const lineLevels = new Map();
      const levelCounter = new Map();

      this.selection.split('\n').forEach((line, i) => {
        lineLevels.set(i, this.countTabs(line));
      });

      const lines = this.selection.split('\n').map((line, i) => {
        line = line.replace(/^\s*-\s?/, '');

        const tabs = lineLevels.get(i);
        const n = (levelCounter.get(tabs) || 0) + 1;

        levelCounter.set(tabs, n);

        return ' '.repeat(4 * tabs) + `${n}. ${line}`;
      });

      this.insertEnd(lines.join('\n'));
    } else {
      const lines = this.selection.split('\n').map((line, i) => `${i + 1}. ${line}`);
      this.insertEnd(lines.join('\n'));
    }
  }

  isLink() {
    return /^\[.*]\(.*\)/.test(this.selection);
  }

  toggleLink() {
    if (!this.isLink()) {
      this.insertEnd(`[${this.selection}](https://)`);
    } else {
      const match = this.selection.match(/^\[(.*)]\(.*\)/);
      if (match?.length === 2) {
        this.insertEnd(match[1]);
      }
    }
  }

  isImage() {
    return /^!\[.*]\(.*\)/.test(this.selection);
  }

  toggleImage() {
    if (!this.isImage()) {
      this.insertEnd(`![${this.selection}](https://)`);
    } else {
      const match = this.selection.match(/^!\[(.*)]\(.*\)/);
      if (match?.length === 2) {
        this.insertEnd(match[1]);
      }
    }
  }

  isQuote() {
    return /^>\s?/.test(this.selectionOrCurrentLine);
  }

  toggleQuote() {
    if (this.isNoneSelected()) {
      this.setSelectionToCurrentLine();
    }

    if (this.isQuote()) {
      this.insertStart(this.selection.replace(/>\s?/, ''));
    } else {
      this.insertEnd(this.wrap('> ', ''));
    }
  }

  isCodeBlock() {
    return /`{3}\w*\n.*\n`{3}/.test(this.selection);
  }

  toggleCodeBlock() {
    if (!this.isCodeBlock()) {
      this.insertEnd('```ts\n' + this.selection + '\n```');
    } else {
      const match = this.selection.match(/`{3}\w*\n(.*)\n`{3}/);
      if (match?.length === 2) {
        this.insertEnd(match[1]);
      }
    }
  }

  isInlineCode() {
    return /`[^`]+`/.test(this.selection);
  }

  toggleInlineCode() {
    if (this.isInlineCode()) {
      this.insertEnd(this.selection.replaceAll('`', ''));
    } else {
      this.insertEnd(this.wrap('`', '`'));
    }
  }

  isDivider() {
    return /^---$/.test(this.selection);
  }

  toggleDivider() {
    if (this.isDivider()) {
      this.insertEnd('');
    } else {
      this.insertEnd(this.wrap('\n---', '\n\n'));
    }
  }

  undo() {
    if (this.canUndo()) {
      this.caretPos = this.history[this.historyIndex].caretPosBefore;

      this.historyIndex--;
      this.value = this.history[this.historyIndex].content;
      this.editorRef.nativeElement.focus();

      setTimeout(() => {
        this.editorRef.nativeElement.setSelectionRange(this.caretPos, this.caretPos);
      });
    }
  }

  redo() {
    if (this.canRedo()) {
      this.historyIndex++;
      this.value = this.history[this.historyIndex].content;
      this.caretPos = this.history[this.historyIndex].caretPosAfter;

      this.editorRef.nativeElement.focus();

      setTimeout(() => {
        this.editorRef.nativeElement.setSelectionRange(this.caretPos, this.caretPos);
      });
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

  /**
   * Insert snippet and move caret to start of snippet
   * @param snippet to insert
   * @private
   */
  private insertStart(snippet: string) {
    const event = new CustomEvent('insertSnippet', { detail: { snippet, moveCaret: 'start' } });
    window.dispatchEvent(event);
  }

  /**
   * Insert snippet and move caret to end of snippet
   * @param snippet to insert
   * @private
   */
  private insertEnd(snippet: string) {
    const event = new CustomEvent('insertSnippet', { detail: { snippet, moveCaret: 'end' } });
    window.dispatchEvent(event);
  }

  private countTabs(str: string) {
    return str.split(/\S/)[0].length / 4;
  }

  private countHashes(str: string) {
    return str.split(/[^#]/)[0].length;
  }

  private replaceSelection(snippet: string, moveCaret: 'start' | 'end' = 'end') {
    const before = this._val.slice(0, this.selStart);
    const after = this._val.slice(this.selEnd);

    // Replace selection
    this.value = before + snippet + after;

    if (moveCaret === 'start') {
      /**
       * caretPosBefore is current position
       * caretPosAfter is start of selection
       */
      this.appendHistory(this.caretPos, this.selStart);
      this.caretPos = this.selStart;
    } else {
      /**
       * caretPosBefore is current position
       * caretPosAfter is after inserted snippet
       */
      this.appendHistory(this.caretPos, this.selStart + snippet.length);
      this.caretPos = this.selStart + snippet.length;
    }

    // Move caret to start / end of inserted snippet

    setTimeout(() => {
      this.editorRef.nativeElement.focus();
      this.editorRef.nativeElement.setSelectionRange(this.caretPos, this.caretPos);
      this.cacheSelection(this.editorRef.nativeElement);
    });
  }

  private isNoneSelected() {
    return this.selStart === this.selEnd;
  }

  private setSelectionToCurrentLine() {
    const lines = this.lines;
    if (lines.currentLineIdx >= 0) {
      this.selStart = lines.lines[lines.currentLineIdx].from;
      this.selEnd = lines.lines[lines.currentLineIdx].to;
    }
  }

  private updatePreview() {
    const rawHtml = marked.parse(this._val);
    const clean = DOMPurify.sanitize(rawHtml.toString(), { USE_PROFILES: { html: true } });
    this.preview = this.sanitizer.bypassSecurityTrustHtml(clean);
  }

  private appendHistory(caretPosBefore: number, caretPosAfter: number) {
    if (this._val !== this.history[this.historyIndex]?.content) {
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(
        this._val
          ? { caretPosBefore, caretPosAfter, content: this._val }
          : { caretPosBefore: 0, caretPosAfter: 0, content: '' },
      );
      this.historyIndex++;
    }
  }
}
