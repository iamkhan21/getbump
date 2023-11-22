# getbump

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]

A simple tool to bump your MFEs version number in your package.json file.

---

Bump your package.json MFEs version number (you can use bump or b)
```sh
npx getbump bump
```

Bump your package.json MFEs version number from specific branch and group
```sh
npx getbump bump -g <project-group> -b <project-branch>
```

Prepare your host app to new management of MFEs (you can use prepare or p)
```sh
npx getbump prepare
```

Add a new MFE to your host app (you can use add or a)
```sh
npx getbump add <mfe-gitlab-url-name> <mfe-production-url>
```

Check is your host app is ready to new management of MFEs (you can use check or c)
```sh
npx getbump check
```

## License

Made with 💛

Published under [MIT License](./LICENSE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/getbump?style=flat&colorA=18181B&colorB=F0DB4F
[npm-version-href]: https://npmjs.com/package/getbump
[npm-downloads-src]: https://img.shields.io/npm/dm/getbump?style=flat&colorA=18181B&colorB=F0DB4F
[npm-downloads-href]: https://npmjs.com/package/getbump
[bundle-src]: https://img.shields.io/bundlephobia/minzip/getbump?style=flat&colorA=18181B&colorB=F0DB4F
[bundle-href]: https://bundlephobia.com/result?p=getbump
