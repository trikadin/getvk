var
  gulp = require('gulp'),
  babel = require('gulp-babel'),
  del = require('del'),
  watch = require('gulp-watch'),
  plumber = require('gulp-plumber');

gulp.task('clean', function (next){
  del(['./dist'], next);
});

var TASKS = [];

function task(path, handlers, name) {
  TASKS.push({
    path: path,
    handlers: handlers,
    name: name
  });
}

task('manifest.json', [gulp.dest('./dist')], 'Manifest');

task('static/**/*.*', [gulp.dest('./dist/static')], 'Static');

task('src/**/*.js', [
  babel({
    blacklist: [
      'regenerator',
      'es6.blockScoping',
      'es6.constants',
      'es6.forOf',
      'es6.templateLiterals'
    ],
    optional: ['asyncToGenerator'],
    comments: false
  }),
  gulp.dest('./dist')
], 'Source');

gulp.task('default', ['clean'], function (cb) {
  var counter = 0;
  function count() {
    ++counter;
    if (counter == TASKS.length) {
      cb()
    }
  }

  for (var i = 0; i < TASKS.length; i++) {
    var task = TASKS[i];
    var stream = gulp.src('./' + task.path);

    for (var j = 0; j < task.handlers.length; j++) {
      stream = stream.pipe(task.handlers[j]);
    }

    stream.on('end', count);
  }
});

gulp.task('watch', ['clean'], function () {
  for (var i = 0; i < TASKS.length; i++) {
    var task = TASKS[i];
    var stream =
      gulp.src('./' + task.path)
        .pipe(watch(task.path, {verbose: true, name: task.name || 'watcher'}))
        .pipe(plumber());

    for (var j = 0; j < task.handlers.length; j++) {
      stream = stream.pipe(task.handlers[j]);
    }
  }
});
