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

gulp.task('dev', function() {
  return browserify('src/js/main.js', {
    debug: true
  }).transform(babel.configure({
    presets: ['es2015']
  })).bundle()
  .pipe(source('main.js'))
  .pipe(buffer())
  .pipe(gulp.dest('src/public'));
});

gulp.task('start', function() {
  nodemon({
    script: 'index.js',
    ext: 'css js mustache',
    ignore: ['src/public/main.js', 'test'],
    env: {
      'NODE_ENV': 'development'
    },
    tasks: ['dev']
  });
});

gulp.task('test', function() {
  let unitTest = spawn(
    'node_modules/mocha/bin/mocha',
    ['test/unit', '--compilers', 'js:babel-core/register'],
    {stdio: 'inherit'}
  );

  unitTest.on('exit', function() {

    // Start app
    let app = spawn('node', ['index.js']);

    app.stdout.on('data', function(data) {
      console.log(String(data));
    });

    let acceptanceTest = spawn(
      'node_modules/nightwatch/bin/nightwatch',
      ['--test', 'test/acceptance/index.js', '--config', 'test/acceptance/nightwatch-local.json'],
      {stdio: 'inherit'}
    );

    acceptanceTest.on('exit', function() {
      // Kill app Node process when tests are done
      app.kill();
    });
  });

});
