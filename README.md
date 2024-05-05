# getbump

[![npm version][npm-version-src]][npm-href]
[![npm downloads][npm-downloads-src]][npm-href]
[![bundle][bundle-src]][bundle-href]

[![Scc Count Badge](https://sloc.xyz/github/iamkhan21/getbump?category=code)][repo-href]
[![Scc Count Badge](https://sloc.xyz/github/iamkhan21/getbump?category=blanks)][repo-href]
[![Scc Count Badge](https://sloc.xyz/github/iamkhan21/getbump?category=lines)][repo-href]
[![Scc Count Badge](https://sloc.xyz/github/iamkhan21/getbump?category=comments)][repo-href]
[![Scc Count Badge](https://sloc.xyz/github/iamkhan21/getbump?category=cocomo)][repo-href]

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
[npm-href]: https://npmjs.com/package/getbump
[npm-downloads-src]: https://img.shields.io/npm/dm/getbump?style=flat&colorA=18181B&colorB=F0DB4F
[bundle-src]: https://img.shields.io/bundlephobia/minzip/getbump?style=flat&colorA=18181B&colorB=F0DB4F
[bundle-href]: https://bundlephobia.com/result?p=getbump
[repo-href]: https://github.com/iamkhan21/getbump
