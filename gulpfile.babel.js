import gulp from 'gulp';
import uglify from 'gulp-uglify';
import nodemon from 'gulp-nodemon';
import browserify from 'browserify';
import babel from 'babelify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import childProcess from 'child_process';

let spawn = childProcess.spawn;

gulp.task('bundle', function() {
  return browserify('src/js/main.js', {
    debug: true
  }).transform(babel.configure({
    presets: ['es2015']
  })).bundle()
  .pipe(source('main.js'))
  .pipe(buffer())
  .pipe(uglify())
  .pipe(gulp.dest('src/public'));
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
  });
});

gulp.task('test', function() {
  let test = spawn(
    'mocha',
    ['test', '--compilers', 'js:babel-core/register'],
    {stdio: 'inherit'}
  );
});
