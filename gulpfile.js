var gulp = require('gulp');
var browserify = require('browserify');
var bs = require('browser-sync').create();
var source = require('vinyl-source-stream');

var bundler = browserify('./main.js', {
    standalone: 'DomLibrary'
});



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

gulp.task('js-watch', gulp.series('js', reload));
gulp.task('file-watch', reload);

function serve() {
    bs.init({
        server: './'
    });

    gulp.watch('main.js', gulp.series('js-watch'));
    gulp.watch('./src/*.js', gulp.series('js-watch'));
    gulp.watch('./*.css', gulp.series('file-watch'));
}

exports.serve = serve;

gulp.task('default', serve);