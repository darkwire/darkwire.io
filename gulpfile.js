var gulp = require('gulp');
var uglify = require('gulp-uglify');
var nodemon = require('gulp-nodemon');
var browserify = require('browserify');
var babel = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

gulp.task('bundle', function() {
  return browserify('src/js/main.js', { debug: true }).transform(babel.configure({
        presets: ["es2015"]
    })).bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('src/public'))
});

gulp.task('start', function() {
  nodemon({
    script: 'index.js',
    ext: 'css js mustache',
    ignore: ['src/public/main.js'],
    env: {
      'NODE_ENV': 'development'
    },
    tasks: ['bundle']
  })
});
