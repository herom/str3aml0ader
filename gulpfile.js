'use strict';

const gulp = require('gulp');
const electron = require('electron-connect').server.create();

gulp.task('serve', () => {
  electron.start();

  gulp.watch('app.js', electron.restart);

  gulp.watch(['index.js', 'index.html'], electron.reload);
});

gulp.task('reload:browser', () => electron.restart());

gulp.task('reload:renderer', () => electron.reload());

gulp.task('default', ['serve']);