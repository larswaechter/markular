import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Markular } from './markular.component';

describe('MarkdownEditor', () => {
  let component: Markular;
  let fixture: ComponentFixture<Markular>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Markular]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Markular);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
