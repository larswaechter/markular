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
  Renderer2,
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
  standalone: true
})
export class Markular implements AfterViewInit, ControlValueAccessor {
  options: InputSignal<Options | undefined> = input();
  rows: InputSignal<number> = input(10);
  placeholder: InputSignal<string> = input('Enter Markdown...');

  onChange = output<string>();

  preview!: SafeHtml;
  showPreview = false;
  isFocused = false;

  private readonly elementRef = inject(ElementRef<HTMLInputElement>);
  private readonly sanitizer = inject(DomSanitizer);

  private cursor = 0;
  private selStart = 0;
  private selEnd = 0;

  _val = '';
  _onChange = (value: string) => {};
  _onTouched = () => {};

  _options = computed<Options>(() =>
    this.options() !== undefined ? (this.options() as Options) : DefaultOptions,
  );

  set value(value: string) {
    this._val = value;
    this._onChange(value);
    this._onTouched();
  }

  writeValue(value: string) {
    this.value = value;
    // this._elementRef.nativeElement.querySelector('textarea').value = value;
  }

  registerOnChange(onChange: any) {
    this._onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this._onTouched = onTouched;
  }

  @ViewChild('editor') editorRef!: ElementRef<HTMLTextAreaElement>;

  constructor() {
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
  }

  ngAfterViewInit(): void {
    window.addEventListener('insertSnippet', (e: any) => {
      const snippet: string = e.detail ?? '';
      this.replaceSelection(snippet);
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      this.togglePreview();
    } else if (event.key === 'Tab' && this.isFocused) {
      event.preventDefault();
      if (event.shiftKey) {
        if (this.selStart === this.cursor) {
          this.insert(
            this.selection
              .split('\n')
              .map((line) => line.replace(/^\t/, ''))
              .join('\n'),
          );
        }
      } else {
        if (this.selStart === this.cursor) {
          this.insert(
            this.selection
              .split('\n')
              .map((line) => '\t' + line)
              .join('\n'),
          );
        } else {
          this.selStart = this.cursor;
          this.selEnd = this.cursor;
          this.insert('\t');
        }
      }

      this._onChange(this._val);
      this.onChange?.emit(this._val);
    }
  }

  onInput(ta: HTMLTextAreaElement) {
    this._val = ta.value;
    this._onChange(this._val);
    this.onChange?.emit(this._val);
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

  private countTabs(str: string) {
    return str.split(/[^\t]/)[0].length;
  }

  private replaceSelection(snippet: string) {
    const before = this._val.slice(0, this.selStart);
    const after = this._val.slice(this.selEnd);
    this._val = before + snippet + after;

    // Move caret to end of inserted snippet
    const caret = (before + snippet).length;
    setTimeout(() => {
      this.editorRef.nativeElement.focus();
      this.editorRef.nativeElement.setSelectionRange(caret, caret);
      this.cacheSelection(this.editorRef.nativeElement);
    });
  }

  private updatePreview() {
    const rawHtml = marked.parse(this._val);
    const clean = DOMPurify.sanitize(rawHtml.toString(), { USE_PROFILES: { html: true } });
    this.preview = this.sanitizer.bypassSecurityTrustHtml(clean);
  }

  /**
   *
   * Toolbar
   *
   */

  isHeadline(size: number): boolean {
    const regex = new RegExp(`^#{${size}}(?!#)`);
    return regex.test(this.selection);
  }

  toggleHeadline(size: number) {
    const selection = this.selection;

    if (selection.startsWith('#')) {
      for (let i = 1; i <= 6; i++) {
        if (this.isHeadline(i)) {
          this.insert(this.unwrap('#'.repeat(i), ''));
        }
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
    return /^\[.*\]\(.*\)/.test(this.selection);
  }

  applyLink() {
    this.insert(`[${this.selection}](https://)`);
  }

  isImage() {
    return /^!\[.*\]\(.*\)/.test(this.selection);
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
    return /\`{3}\w*\n.*\n\`{3}/.test(this.selection);
  }

  toggleCodeBlock() {
    this.insert('```ts\n' + (this.selection || '') + '\n```');
  }

  isInlineCode() {
    return /\`[^\`]+\`/.test(this.selection);
  }

  toggleInlineCode() {
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
}
