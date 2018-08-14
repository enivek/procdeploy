"use strict";

//******************************************************************************
//* DEPENDENCIES
//******************************************************************************

var gulp        = require("gulp"),
    tslint      = require("gulp-tslint"),
    tsc         = require("gulp-typescript"),
    sourcemaps  = require("gulp-sourcemaps"),
    clean       = require('gulp-clean'),
    path        = require("path"),
    runSequence = require("run-sequence");
    
//******************************************************************************
//* LINT
//******************************************************************************
gulp.task("lint", function() {
    var config =  { formatter: "verbose", fix: true };
    return gulp.src([
        "src/**/**.ts"
    ])
    .pipe(tslint(config))
    .pipe(tslint.report());
});

//******************************************************************************
//* CLEAN
//******************************************************************************
gulp.task("clean", function() {
  return gulp.src('bin', {read: false})
       .pipe(clean());
});

//******************************************************************************
//* BUILD
//******************************************************************************
var tstProject = tsc.createProject("tsconfig.json", { typescript: require("typescript") });

gulp.task("build", function () {
    var tsResult = tstProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(tstProject());

  return tsResult.js
    .pipe(sourcemaps.write({
      // Return relative source map root directories per file.
      sourceRoot: function (file) {
        var sourceFile = path.join(file.cwd, file.sourceMap.file);
        return path.relative(path.dirname(sourceFile), file.cwd);
      }
    }))
    .pipe(gulp.dest('bin/'));
  }
);


//******************************************************************************
//* DEFAULT
//******************************************************************************
gulp.task("default", function (cb) {
  runSequence("clean", "lint", "build", cb);
});


//******************************************************************************
//* WATCH
//******************************************************************************
gulp.task("watch", function() {
  gulp.watch(["src/**/*.ts"], ["build"]);
});