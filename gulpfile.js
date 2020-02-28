var gulp = require('gulp');
var browserify = require('browserify');
var uglify = require('gulp-uglifycss');
var envify = require('envify/custom');
var bs = require('browser-sync').create();
var source = require('vinyl-source-stream');

var bundler = browserify('./main.js', {
    standalone: 'DomLibrary',
});

function compile() {
    return bundler
        .transform(envify({
            NODE_ENV: 'development'
        }))
        .bundle()
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

function build(done) {
    bundler.transform(envify({
            NODE_ENV: 'production'
        }))
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./dist'));

    gulp.src('./index.html')
        .pipe(gulp.dest('./dist'));
    
    gulp.src('./styles.css')
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));

    done();
}

gulp.task('default', serve);

gulp.task('build', build);