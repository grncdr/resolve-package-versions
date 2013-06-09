# resolve-package-versions

## Synopsis

```javascript
var resolvePackageVersions = require('resolve-package-versions')

var resolver = resolvePackageVersions();
var dependency = {
  name: 'request',
  versionRange: '2.x'
};

resolver.resolve(dependency, function (err) {
  console.log(dependency.version) //=> 2.21.0
})

// Or use as a through stream

var createDependencyStream = require('create-dependency-stream');
var dependencies = createDependencyStream('/path/to/package.json');
dependencies.pipe(resolver);
```

## Description

This package uses a remote registry to determine the version of a package that
will satisfy a requested version range.

## License

MIT
