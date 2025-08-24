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

    it('should toggle H1 => H2', () => {
      component._val = '# Hello';
      component.selStart = 0;
      component.selEnd = 7;
      component.toggleHeading(2);
      expect(component._val).toBe('## Hello');
    });

    it('should toggle H2 => H1', () => {
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
});
