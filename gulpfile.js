var gulp = require('gulp');
var browserify = require('browserify');
var bs = require('browser-sync').create();
var source = require('vinyl-source-stream');

var bundler = browserify('./main.js');



function compile() {
    return bundler.bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./'));
}

exports.compile = compile;

gulp.task('js', compile);

function reload(done) {
    bs.reload();
    done();
}

exports.reload = reload;

gulp.task('js-watch', gulp.series('js'), reload);

function serve() {
    bs.init({
        server: './'
    });

    gulp.watch('main.js', gulp.series('js-watch'));
}

exports.serve = serve;

gulp.task('default', serve);