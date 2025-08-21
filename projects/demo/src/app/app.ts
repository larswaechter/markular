import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Markular, Options } from 'markular';

@Component({
  selector: 'app-root',
  imports: [FormsModule, Markular, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  form: FormGroup;

  markdown: string = '# Hello World!';
  options: Options = {
    toolbar: {
      headings: [1, 2, 3],
      lists: {
        ordered: true,
      },
    },
  };
  protected readonly title = signal('demo');

  constructor(private formBuilder: FormBuilder) {
    this.form = formBuilder.group({ markdown: ['# Hello World!'] });

    this.form.get('markdown')?.valueChanges.subscribe((change) => {
      console.log('.subscribe change', change);
    });

    // this.form.get('markdown')?.disable();
  }

  handleChange($event: any) {
    console.log('output change: ', $event);
  }
}
