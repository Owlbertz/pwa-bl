var gulp = require('gulp'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  babel = require('gulp-babel'),
  compressor = require('gulp-compressor'),
  minifyCss = require('gulp-minify-css'),
  stripDebug = require('gulp-strip-debug'),
  minifier = require('gulp-uglify/minifier'),
  stripComments = require('gulp-strip-comments'),
  filter = require('gulp-filter'),
  selectors = require('gulp-selectors'),
  minifyCssNames = require('gulp-minify-cssnames'),
  cssNano = require('gulp-cssnano'),
  exec = require('child_process').exec;

var destPath = 'dist/',
    buildPath = '_build/',
    srcPath = './';

gulp.task('default', ['build']);


gulp.task('build', ['js:assets', 'js:worker', 'css:assets', 'html', 'copy', 'icons']);

// Minify main.css
gulp.task('css:classnames', function () {
  var jsFilter  = filter(['*.js'], { restore: true }),
      cssFilter  = filter(['*.css'], { restore: true }),
      htmlFilter  = filter(['*.html'], { restore: true });

  return gulp.src([srcPath + 'css/*.css', srcPath + '*.html', srcPath + 'js/*.js'])
    .pipe(selectors.run())
    .pipe(jsFilter)
      .pipe(gulp.dest(buildPath + 'js/'))
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
      .pipe(gulp.dest(buildPath + 'css/'))
    .pipe(cssFilter.restore)
    .pipe(htmlFilter)
      .pipe(gulp.dest(buildPath))
    .pipe(htmlFilter.restore);
});

// Minify JS assets
gulp.task('js:assets', function () {
  return gulp.src([srcPath + 'js/**/*.js'])
    .pipe(stripComments())
    .pipe(babel())
    .pipe(uglify())
      .on('error', function(err) {
        console.error(err);
      })
    .pipe(stripDebug())
    .pipe(gulp.dest(destPath + 'js/'));
});
// Minify worker.js
gulp.task('js:worker', function () {
  return gulp.src([srcPath + 'worker.js'])
    .pipe(stripComments())
    .pipe(babel())
    .pipe(uglify())
      .on('error', function(err) {
        console.error(err);
      })
    .pipe(stripDebug())
    .pipe(gulp.dest(destPath));
});
// Minify main.css
gulp.task('css:assets', function () {
  return gulp.src([srcPath + 'css/*.css'])
    .pipe(cssNano())
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
gulp.task('icons', function () {
  return gulp.src([srcPath + 'img/icon-*.png'])
    .pipe(gulp.dest(destPath + 'img/'));
});

// Copy other files
gulp.task('copy', function () {
  gulp.src([srcPath + 'manifest.json'])
    .pipe(gulp.dest(destPath));
  gulp.src([srcPath + 'css/*.{ttf,woff}'])
    .pipe(gulp.dest(destPath + 'css/'));
});

gulp.task('publish', function(cb) {
  exec('git subtree push --prefix dist origin gh-pages', function(error, stdout, stderr) {
    console.log(stdout);
    cb();
  });
});

gulp.task('watch', function() {
});