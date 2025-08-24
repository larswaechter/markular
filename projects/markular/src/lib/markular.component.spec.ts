import 'zone.js';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Markular } from './markular.component';
import { CommonModule } from '@angular/common';

describe('Markular', () => {
  let component: Markular;
  let fixture: ComponentFixture<Markular>;

  /*
  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
  });
   */

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Markular, CommonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(Markular);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Heading tests', () => {
    it('should insert H1', () => {
      component._val = 'Hello';
      component.selStart = 0;
      component.selEnd = 5;
      component.toggleHeading(1);
      expect(component._val).toBe('# Hello');
    });

    it('should be H1', () => {
      component._val = '# Hello';
      component.selStart = 0;
      component.selEnd = 7;
      expect(component.isHeading(1)).toBeTruthy();
    });

    it('should remove H1', () => {
      component._val = '# Hello';
      component.selStart = 0;
      component.selEnd = 7;
      component.toggleHeading(1);
      expect(component._val).toBe('Hello');
    });

    it('should convert H1 => H2', () => {
      component._val = '# Hello';
      component.selStart = 0;
      component.selEnd = 7;
      component.toggleHeading(2);
      expect(component._val).toBe('## Hello');
    });

    it('should convert H2 => H1', () => {
      component._val = '## Hello';
      component.selStart = 0;
      component.selEnd = 8;
      component.toggleHeading(1);
      expect(component._val).toBe('# Hello');
    });
  });

  describe('Bold tests', () => {
    it('should insert bold', () => {
      component._val = 'Hello';
      component.selStart = 0;
      component.selEnd = 5;
      component.toggleBold();
      expect(component._val).toBe('**Hello**');
    });

    it('should be bold', () => {
      component._val = '**Hello**';
      component.selStart = 0;
      component.selEnd = 9;
      expect(component.isBold()).toBeTruthy();
    });

    it('should not be italic', () => {
      component._val = '**Hello**';
      component.selStart = 0;
      component.selEnd = 9;
      expect(component.isItalic()).toBeFalse();
    });

    it('should remove bold', () => {
      component._val = '**Hello**';
      component.selStart = 0;
      component.selEnd = 9;
      component.toggleBold();
      expect(component._val).toBe('Hello');
    });
  });

  describe('Italic tests', () => {
    it('should insert italic', () => {
      component._val = 'Hello';
      component.selStart = 0;
      component.selEnd = 5;
      component.toggleItalic();
      expect(component._val).toBe('*Hello*');
    });

    it('should be italic', () => {
      component._val = '*Hello*';
      component.selStart = 0;
      component.selEnd = 7;
      expect(component.isItalic()).toBeTruthy();
    });

    it('should remove italic', () => {
      component._val = '*Hello*';
      component.selStart = 0;
      component.selEnd = 7;
      component.toggleItalic();
      expect(component._val).toBe('Hello');
    });
  });

  describe('Unordered list tests', () => {
    it('should insert ul', () => {
      component._val = 'Hello';
      component.selStart = 0;
      component.selEnd = 5;
      component.toggleUnorderedList();
      expect(component._val).toBe('- Hello');
    });

    it('should insert ul multiline', () => {
      component._val = 'Hello\nWorld';
      component.selStart = 0;
      component.selEnd = 11;
      component.toggleUnorderedList();
      expect(component._val).toBe('- Hello\n- World');
    });

    it('should be ul', () => {
      component._val = '- Hello';
      component.selStart = 0;
      component.selEnd = 7;
      expect(component.isUnorderedList()).toBeTruthy();
    });

    it('should be ul multiline', () => {
      component._val = '- Hello\n- World';
      component.selStart = 0;
      component.selEnd = 11;
      expect(component.isUnorderedList()).toBeTruthy();
    });

    it('should remove ul', () => {
      component._val = '- Hello';
      component.selStart = 0;
      component.selEnd = 7;
      component.toggleUnorderedList();
      expect(component._val).toBe('Hello');
    });

    it('should remove ul multiline', () => {
      component._val = '- Hello\n- World';
      component.selStart = 0;
      component.selEnd = 11;
      component.toggleUnorderedList();
      expect(component._val).toBe('Hello\nWorld');
    });

    it('should remove ul nested multiline', () => {
      component._val = '- abc\n    - def\n    - ghi\n- jkl';
      component.selStart = 0;
      component.selEnd = 31;
      component.toggleUnorderedList();
      expect(component._val).toBe('abc\ndef\nghi\njkl');
    });

    it('should convert ul => ol multiline', () => {
      component._val = '- Hello\n- World';
      component.selStart = 0;
      component.selEnd = 11;
      component.toggleOrderedList();
      expect(component._val).toBe('1. Hello\n2. World');
    });

    it('should convert ul => ol nested multiline', () => {
      component._val = '- abc\n    - def\n    - ghi\n- jkl';
      component.selStart = 0;
      component.selEnd = 31;
      component.toggleOrderedList();
      expect(component._val).toBe('1. abc\n    1. def\n    2. ghi\n2. jkl');
    });
  });

  describe('Ordered list tests', () => {
    it('should insert ol', () => {
      component._val = 'Hello';
      component.selStart = 0;
      component.selEnd = 5;
      component.toggleOrderedList();
      expect(component._val).toBe('1. Hello');
    });

    it('should insert ol multiline', () => {
      component._val = 'Hello\nWorld';
      component.selStart = 0;
      component.selEnd = 11;
      component.toggleOrderedList();
      expect(component._val).toBe('1. Hello\n2. World');
    });

    it('should be ol', () => {
      component._val = '1. Hello';
      component.selStart = 0;
      component.selEnd = 8;
      expect(component.isOrderedList()).toBeTruthy();
    });

    it('should be ol multiline', () => {
      component._val = '1. Hello\n2. World';
      component.selStart = 0;
      component.selEnd = 13;
      expect(component.isOrderedList()).toBeTruthy();
    });

    it('should remove ol', () => {
      component._val = '1. Hello';
      component.selStart = 0;
      component.selEnd = 8;
      component.toggleOrderedList();
      expect(component._val).toBe('Hello');
    });

    it('should remove ol multiline', () => {
      component._val = '1. Hello\n2. World';
      component.selStart = 0;
      component.selEnd = 13;
      component.toggleOrderedList();
      expect(component._val).toBe('Hello\nWorld');
    });

    it('should remove ol nested multiline', () => {
      component._val = '1. abc\n    1. def\n    2. ghi\n2. jkl';
      component.selStart = 0;
      component.selEnd = 35;
      component.toggleOrderedList();
      expect(component._val).toBe('abc\ndef\nghi\njkl');
    });

    it('should convert ol => ul multiline', () => {
      component._val = '1. Hello\n2. World';
      component.selStart = 0;
      component.selEnd = 13;
      component.toggleUnorderedList();
      expect(component._val).toBe('- Hello\n- World');
    });

    it('should convert ol => ul nested multiline', () => {
      component._val = '1. abc\n    1. def\n    2. ghi\n2. jkl';
      component.selStart = 0;
      component.selEnd = 35;
      component.toggleUnorderedList();
      expect(component._val).toBe('- abc\n    - def\n    - ghi\n- jkl');
    });
  });

  describe('Blockquote tests', () => {
    it('should insert blockquote', () => {
      component._val = 'Hello';
      component.selStart = 0;
      component.selEnd = 5;
      component.toggleQuote();
      expect(component._val).toBe('> Hello');
    });

    it('should be blockquote', () => {
      component._val = '> Hello';
      component.selStart = 0;
      component.selEnd = 7;
      expect(component.isQuote()).toBeTruthy();
    });

    it('should remove blockquote', () => {
      component._val = '> Hello';
      component.selStart = 0;
      component.selEnd = 7;
      component.toggleQuote();
      expect(component._val).toBe('Hello');
    });
  });

  describe('Codeblock tests', () => {
    it('should insert codeblock', () => {
      component._val = 'Hello';
      component.selStart = 0;
      component.selEnd = 5;
      component.toggleCodeBlock();
      expect(component._val).toBe('```ts\nHello\n```');
    });

    it('should be codeblock', () => {
      component._val = '```ts\nHello\n```';
      component.selStart = 0;
      component.selEnd = 15;
      expect(component.isCodeBlock()).toBeTruthy();
    });

    it('should remove codeblock', () => {
      component._val = '```ts\nHello\n```';
      component.selStart = 0;
      component.selEnd = 15;
      component.toggleCodeBlock();
      expect(component._val).toBe('Hello');
    });
  });

  describe('Inline code tests', () => {
    it('should insert inline code', () => {
      component._val = 'Hello';
      component.selStart = 0;
      component.selEnd = 5;
      component.toggleInlineCode();
      expect(component._val).toBe('`Hello`');
    });

    it('should be inline code', () => {
      component._val = '`Hello`';
      component.selStart = 0;
      component.selEnd = 7;
      expect(component.isInlineCode()).toBeTruthy();
    });

    it('should remove inline code', () => {
      component._val = '`Hello`';
      component.selStart = 0;
      component.selEnd = 7;
      component.toggleInlineCode();
      expect(component._val).toBe('Hello');
    });
  });

  describe('Horizontal divider tests', () => {
    it('should insert divider', () => {
      component._val = '';
      component.selStart = 0;
      component.selEnd = 0;
      component.toggleDivider();
      expect(component._val).toBe('\n---\n\n');
    });

    it('should be divider', () => {
      component._val = '---';
      component.selStart = 0;
      component.selEnd = 3;
      expect(component.isDivider()).toBeTruthy();
    });

    it('should remove divider', () => {
      component._val = '---';
      component.selStart = 0;
      component.selEnd = 3;
      component.toggleDivider();
      expect(component._val).toBe('');
    });
  });

  describe('Hyperlink tests', () => {
    it('should insert link', () => {
      component._val = 'Hello';
      component.selStart = 0;
      component.selEnd = 5;
      component.toggleLink();
      expect(component._val).toBe('[Hello](https://)');
    });

    it('should be link', () => {
      component._val = '[Hello](https://)';
      component.selStart = 0;
      component.selEnd = 17;
      expect(component.isLink()).toBeTruthy();
    });

    it('should not be image', () => {
      component._val = '[Hello](https://)';
      component.selStart = 0;
      component.selEnd = 17;
      expect(component.isImage()).toBeFalsy();
    });

    it('should remove link', () => {
      component._val = '[Hello](https://)';
      component.selStart = 0;
      component.selEnd = 17;
      component.toggleLink();
      expect(component._val).toBe('Hello');
    });
  });

  describe('Image tests', () => {
    it('should insert image', () => {
      component._val = 'Hello';
      component.selStart = 0;
      component.selEnd = 5;
      component.toggleImage();
      expect(component._val).toBe('![Hello](https://)');
    });

    it('should be image', () => {
      component._val = '![Hello](https://)';
      component.selStart = 0;
      component.selEnd = 18;
      expect(component.isImage()).toBeTruthy();
    });

    it('should not be link', () => {
      component._val = '![Hello](https://)';
      component.selStart = 0;
      component.selEnd = 18;
      expect(component.isLink()).toBeFalsy();
    });

    it('should remove image', () => {
      component._val = '![Hello](https://)';
      component.selStart = 0;
      component.selEnd = 18;
      component.toggleImage();
      expect(component._val).toBe('Hello');
    });
  });
});
