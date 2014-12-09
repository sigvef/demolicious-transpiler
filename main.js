
var transpiler = require('./transpiler');

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(data) {
  var glsl = transpiler.transpile(data);
  console.log(glsl);
});
