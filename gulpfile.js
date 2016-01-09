var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('watch', function() {
  gulp.watch('src/js/main.js', ['build']);
});

gulp.task('build', ['uglify']);

gulp.task('uglify', function() {
  gulp.src('src/js/main.js')
    .pipe(uglify())
    .pipe(gulp.dest('src/public'));
});