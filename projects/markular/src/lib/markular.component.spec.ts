import 'zone.js';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Markular } from './markular.component';
import { CommonModule } from '@angular/common';

describe('markular', () => {
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

  it('should insert H1', () => {
    component._val = 'Hello';
    component.toggleHeading(1);
    expect(component._val).toBe('# Hello');
  });
});
