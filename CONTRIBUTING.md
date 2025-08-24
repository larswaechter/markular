# Contributing

## Development setup

Build library:

```shell
ng build markular --watch
```

and run the demo app:

```shell
ng serve demo
```

## Contributing

Feel free to contribute to markular:

1. Create a fork
2. Create a new branch from `release` (or `main` if not existing)
3. Make your changes
4. Commit & push your changes
5. Submit a pull request 🚀

## Publishing to GH Pages

```shell
ng build demo --configuration production --base-href "https://larswaechter.github.io/markular/"
npx angular-cli-ghpages --dir=dist/demo/browser                                                
```
