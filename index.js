var map     = require('map-stream');
var request = require('request');
var semver  = require('semver');

module.exports = resolvePackageVersions;

function resolvePackageVersions(opts) {
  var registry = opts.registry || 'http://registry.npmjs.org';
  var stream = map(function resolve(dependency, callback) {
    resolvePackageVersion(registry, dependency, function (err) {
      callback(err, err ? null : dependency);
    });
  }, function () { this.emit('end') }, {autoClose: false});
  stream.resolve = resolvePackageVersion.bind(null, registry);
  return stream;
}

function resolvePackageVersion(registry, dependency, callback) {
  var name = dependency.name;
  var versionRange = dependency.versionRange;
  if (versionRange === 'latest') {
    versionRange = '*';
  }

  // First check if parents have a satisfying version
  var pd = dependency.parent;
  while (pd && (pd = pd.parent)) {
    var existing = pd.dependencies && pd.dependencies[name];
    var existingVersion = existing && existing['package'].version;
    if (existingVersion && semver.satisfies(existingVersion, versionRange)) {
      var parent = dependency.parent;
      parent.dependencies[name] = existing;
      return callback()
    }
  }

	var url = [registry, name].join('/');

	return request(url, function (err, response, body) {
    if (err) return callback(err);
    var metadata = JSON.parse(body);
    var versions = Object.keys(metadata.versions || {});
    var version  = semver.maxSatisfying(versions, versionRange);
    if (!version) {
      var msg = 'No version of ' + name + ' satisfies range ' + versionRange;
      callback(new Error(msg));
    } else {
      dependency.version = version;
      callback();
    }
  })
}

if (module === require.main) {
  var dep = {name: 'tape', versionRange: 'latest'};
  resolvePackageVersion('http://registry.npmjs.org', dep, function (err) {
    if (err) throw err
  })
}
