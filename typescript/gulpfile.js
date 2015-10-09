
var gulp = require('gulp');
var del = require('del');
var ts = require('gulp-typescript');
var browserSync = require('browser-sync').create();
var concatCss = require('gulp-concat-css');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var sourcemaps = require('gulp-sourcemaps');
var size = require('gulp-size');

gulp.task('default', ['build']);

gulp.task('build', ['clean', 'html', 'css', 'config', 'compile' ]);


gulp.task('clean', function () {
    del.sync([
        'output/**/*',
        'output'
    ]);
});

gulp.task('config', function () {
    return gulp.src(['source/system.config.js'])
        .pipe(gulp.dest('output'));
});

gulp.task('html', function () {
    return gulp.src('source/index.html', { base: 'source' })
        .pipe(gulp.dest('output/'))
        .pipe(replace('<link href="/node_modules/basscss/css/basscss.css" rel="stylesheet" type="text/css"/>', ''))
        .pipe(replace('<link href="/node_modules/font-awesome/css/font-awesome.css" rel="stylesheet" type="text/css"/>', ''))
        .pipe(replace('<link href="/css/styles.css" rel="stylesheet" type="text/css" />', '<link href="/styles.min.css" rel="stylesheet" type="text/css" />'))
        .pipe(replace('<script src="/node_modules/systemjs/dist/system.js"></script>', ''))
        .pipe(replace('<script src="/system.config.js"></script>', ''))
        .pipe(replace('<script>System.import(\'js/app\');</script>', '<script src="/app.min.js"></script>'))
        .pipe(gulp.dest('output/dist/'));
});
gulp.task('css', function () {
    gulp.src('source/**/*.css',
             { base: 'source/css' })
        .pipe(gulp.dest('output/css'));
    
    return gulp.src([
        'output/css/styles.css',
        'node_modules/basscss/css/basscss.css',
        'node_modules/font-awesome/css/font-awesome.css'
    ])
        .pipe(concatCss('styles.min.css'))
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('output/dist/'));
});

gulp.task('compile', function (done) {
    
    var tsProject = ts.createProject('tsconfig.json', {
        typescript: require('typescript')
    });
    var tsResult = tsProject.src()
            .pipe(sourcemaps.init({debug: true}))
            .pipe(ts(tsProject));

    // the files are being renamed here so as not to go to
    // ./output/js/source/ts but straight into ./output/js/
    // preserving the original directory structure otherwise
    return tsResult.js
        .pipe(rename(function (path) {
            path.dirname = path.dirname.replace('source/ts', 'js');
            path.dirname = path.dirname.replace('source\\ts', 'js'); //windows fix
        }))
        .pipe(size({title: 'JS Size:'}))
        .pipe(sourcemaps.write({sourceRoot: '/'}))
        .pipe(gulp.dest('output'));
    
    // var exec = require('child_process').exec;
    
    // exec('tsc', function(error, stdOut, stdErr) {
    //   if (error) {
    //     console.log(stdOut);
    //   }
    
    //   return done();
    // });
    
});


gulp.task('serve', ['build'], function () {

    browserSync.init({
        server: {
            baseDir: ['output'],
            routes: {
                "/node_modules": "node_modules"
            }
        },
        files: ['output/**/*'],
        port: 8080,
        open: false
    });

    gulp.watch('source/css/*.css', ['css']);
    gulp.watch('source/index.html', ['html']);
    gulp.watch('source/*.config.js', ['config']);
    gulp.watch('source/ts/**/*.html', ['template-cache']);
    gulp.watch('source/ts/**/*.ts', ['compile']);
    
});
