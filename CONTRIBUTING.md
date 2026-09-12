# Contributing

Development happens on the `next` branch. Pull requests to `latest` are reserved
for stable releases and must come from `next`.

## Setup

Use the Node version in `.nvmrc`, then install dependencies:

```sh
npm install
```

Generate API documentation after changing public declarations:

```sh
npm run docs
```

Pull request titles and commit messages use one of these prefixes:

- `breaking:` for breaking package changes
- `feat:` for new package features
- `fix:` for package fixes
- `misc:` for changes that should not affect the stable package version
