var gulp = require('gulp');
var uglify = require('gulp-uglify');
var nodemon = require('gulp-nodemon');

gulp.task('watch', function() {
  gulp.watch('src/js/main.js', ['build']);
});

gulp.task('build', ['uglify']);

gulp.task('uglify', function() {
  gulp.src('src/js/main.js')
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
    tasks: ['build']
  })
})
