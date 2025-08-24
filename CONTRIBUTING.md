# Contributing

Feel free to contribute to markular!

## Development setup

Build library:

```shell
npm run build
```

and run the demo app:

```shell
npm run serve
```

In order to run the tests enter:

```shell
npm test
```

## Contributing

1. Create a fork
2. Create a new branch from `release` (or `main` if not existing)
3. Make your changes
4. Run tests
5. Commit & push your changes
6. Submit a pull request 🚀

## Publishing to GH Pages

```shell
ng build demo --configuration production --base-href "/markular/"
npx angular-cli-ghpages --dir=dist/demo/browser                                               
```
