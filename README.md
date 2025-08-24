# markular

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![npm version](https://badge.fury.io/js/markular.svg)](//npmjs.com/package/markular)
[![Test and Deploy](https://github.com/larswaechter/markular/actions/workflows/deploy.yml/badge.svg)](https://github.com/larswaechter/markular/actions)

A lightweight Markdown Editor for Angular.

![Preview](https://raw.githubusercontent.com/larswaechter/markular/main/screenshots/preview.png)

## 📍 Introduction

markular is a fast to setup and easy to use open source **Mark**down editor for Ang**ular** >= 20.

Key features are:

- Markdown editing
- Formatting toolbar
- Keyboard shortcuts
- Editing history
- Markdown file download
- Markdown to HTML rendering / preview

Internally, it uses [marked](https://www.npmjs.com/package/marked) for parsing Markdown and [dompurify](https://www.npmjs.com/package/dompurify) for sanitizing the output HTML.

### [Demo](https://larswaechter.github.io/markular/)

## 📦 Installation

Install via npm:

```bash
npm i --save markular
```

## 🔨 Usage

### Setup

Import the according component:

```ts
import { Markular } from 'markular';

@Component({
  imports: [Markular]
  // ...
})
export class MyApp {
  markdown = '# Hello World!'
}
```

and use it in your template:

```html

<markular [(ngModel)]="markdown"></markular>
```

See the [demo app](https://github.com/larswaechter/markular/tree/main/projects/demo/src/app) for a more detailed example.

### API

| Name        | Description           | Type                                                                                                      | Default                                                                                                       |
|-------------|-----------------------|-----------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| options     | Markular options      | [Options](https://github.com/larswaechter/markular/blob/main/projects/markular/src/lib/models/options.ts) | [Default](https://github.com/larswaechter/markular/blob/main/projects/markular/src/lib/models/options.ts#L28) |
| placeholder | Editor placeholder    | string                                                                                                    | 'Enter markdown...'                                                                                           |
| rows        | Editor number of rows | number                                                                                                    | 10                                                                                                            |

### Keyboard Shortcuts

On MacOS use CMD button instead of Ctrl.

| Shortcut | Action                  |
|----------|-------------------------|
| Ctrl + b | Bold                    |
| Ctrl + i | Italic                  |
| Ctrl + z | Undo                    |
| Ctrl + y | Redo                    |
| Ctrl + k | Toggle editor / preview |

## 👋 Shoutouts

A big shoutout and thank you to:

- [Flowbite](https://flowbite.com/icons/) for their icons

## 🧩 Contributing

Any contribution is appreciated! See [CONTRIBUTING.md](https://github.com/larswaechter/markular/blob/master/CONTRIBUTING.md)

<a href='https://ko-fi.com/larswaechter' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi3.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

## 🔑 License

markular is released under [MIT](https://github.com/larswaechter/markular/blob/master/LICENSE) license.
