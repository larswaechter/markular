import { Component } from '@angular/core';
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
  options: Options = {
    toolbar: {
      headings: [1, 2, 3],
      lists: {
        ordered: true,
      },
    },
  };

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      markdown:  `# Simple Chocolate Cake

- 200 g sugar
- 150 g flour
- 50 g cocoa powder
- 120 ml milk
- ...

Bon appétit!`,
    });

    this.form.get('markdown')?.valueChanges.subscribe((change) => {
      console.log('.subscribe change', change);
    });

    // this.form.get('markdown')?.disable();
  }

  handleChange($event: any) {
    console.log('output change: ', $event);
  }
}
