import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Markular, Options } from 'markular';

@Component({
  selector: 'app-root',
  imports: [FormsModule, Markular],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  markdown: string = '# Hello World!';
  options: Options = {
    toolbar: {
      headings: [1, 2, 3],
      lists: {
        ordered: true
      }
    }
  }

  protected readonly title = signal('demo');

  handleChange($event: any) {
    console.log('external change: ', $event);
  }
}
