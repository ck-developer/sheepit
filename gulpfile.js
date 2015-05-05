'use strict';

var gulp = require('gulp'),
    $    = require('gulp-load-plugins')();

gulp.task('compress', ['compile'], function() {
  gulp.src(['dist/*.js'])
    .pipe($.sourcemaps.init())
    .pipe($.uglify())
    .pipe($.rename({suffix: '.min'}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('compile', function () {
  return gulp.src('src/**/*.coffee')
    .pipe($.coffee({ bare: true }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['compress']);