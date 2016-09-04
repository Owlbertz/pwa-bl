var gulp = require('gulp'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  babel = require('gulp-babel'),
  compressor = require('gulp-compressor'),
  minifyCss = require('gulp-minify-css');

var destPath = 'dist/',
    srcPath = './';

gulp.task('default', ['build']);


gulp.task('build', ['js:assets', 'js:worker', 'css:main', 'html', 'copy'], function() {

  return;
  
  var images = [
    config.srcPath + 'assets/img/*'
  ];
  return gulp.src(images)
    .pipe(gulp.dest(config.destPath + 'assets/img/'));
});

// Minify JS assets
gulp.task('js:assets', function () {
  return gulp.src([srcPath + 'js/*.js'])
    .pipe(babel())
    .pipe(uglify())
      .on('error', function(err) {
        console.error(err);
      })
    .pipe(gulp.dest(destPath + 'js/'));
});
// Minify worker.js
gulp.task('js:worker', function () {
  return gulp.src([srcPath + 'worker.js'])
    .pipe(babel())
    .pipe(uglify())
      .on('error', function(err) {
        console.error(err);
      })
    .pipe(gulp.dest(destPath));
});
// Minify main.css
gulp.task('css:main', function () {
  return gulp.src([srcPath + 'css/main.css'])
    .pipe(minifyCss())
    .pipe(gulp.dest(destPath + 'css/'));
});
// Minify html
gulp.task('html', function () {
  return gulp.src([srcPath + '*.html'])
    .pipe(compressor({
      'remove-intertag-spaces': true,
      'simple-bool-attr': true,
      'compress-js': true,
      'compress-css': true
    }))
    .pipe(gulp.dest(destPath));
});

// Copy other files
gulp.task('copy', function () {
  return gulp.src([srcPath + 'manifest.json'])
    .pipe(gulp.dest(destPath));
});

gulp.task('publish', function(cb) {
  exec('git subtree push --prefix dist origin gh-pages', function(error, stdout, stderr) {
    console.log(stdout);
    cb();
  });
});

gulp.task('watch', function() {
});