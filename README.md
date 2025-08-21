# markular

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A lightweight Markdown Editor for Angular.

![Preview](https://raw.githubusercontent.com/larswaechter/markular/main/screenshots/preview.png)

## 📍 Introduction

markular is an open source **Mark**down editor for Ang**ular** >= 14 with preview support.

Features:

- Markdown editing
- Markdown to HTML rendering

## 💻 Installation

Install via npm:

```bash
npm i --save markular
```

## 🔨 Usage

Import the standalone component:

```ts
import { Markular } from 'markular';

@Component({
  imports: [Markular]
})
```

and use it in your template:

```html

<markular [(ngModel)]="markdown"></markular>
```

See the [demo app](https://github.com/larswaechter/markular/tree/main/projects/demo/src/app) for a more detailed example.

## 👋 Shoutouts

A big shoutout to:

- [Flowbite](https://flowbite.com/icons/) for their icons

## 🧩 Contributing

Any contribution is appreciated! See [CONTRIBUTING.md](https://github.com/larswaechter/markular/blob/master/CONTRIBUTING.md)

<a href='https://ko-fi.com/larswaechter' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi3.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

## 🔑 License

markular is released under [MIT](https://github.com/larswaechter/markular/blob/master/LICENSE) license.
