'use strict';

var gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    browserSync  = require('browser-sync'),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglifyjs'),
    cssnano      = require('gulp-cssnano'),
    rename       = require('gulp-rename'),
    del          = require('del'),
    imagemin     = require('gulp-imagemin'),
    pngquant     = require('imagemin-pngquant'),
    cache        = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    gutil        = require('gulp-util' ),
    ftp          = require('vinyl-ftp');


// 'Sass' task
gulp.task('sass', function () {
    return gulp.src('./app/sass/**/*.scss')
        .pipe(sass({outputStyle:'expanded'}).on('error', sass.logError))
        .pipe(autoprefixer(['last 15 versions']))
        .pipe(gulp.dest('./app/css'))
        .pipe(browserSync.reload({stream: true}));
});

// 'Scripts' task
gulp.task('scripts', function () {
    return gulp.src([
            './app/libs/jquery/dist/jquery.min.js',
        ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./app/js'));
});

// 'Css-libs' task
gulp.task('css-libs', function () {
    return gulp.src([
            './app/libs/bootstrap-grid/bootstrap-grid.css',
        ])
        .pipe(concat('libs.min.css'))
        .pipe(cssnano())
        .pipe(gulp.dest('./app/css'));
});
// 'Css-libs' task
// gulp.task('css-libs', ['sass'], function () {
//     return gulp.src('./app/css/libs.css')
//         .pipe(cssnano())
//         .pipe(rename({suffix: '.min'}))
//         .pipe(gulp.dest('./app/css'));
// });

// 'Browser-sync' task
gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: './app'
        },
        notify: false,
        // tunnel: true,
        // tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
    });
});

// 'RemoveDist' task
gulp.task('removedist', function () {
    return del.sync('./dist');
});

// 'ClearCache' task _ handler
gulp.task('clearcache', function () {
    return cache.clearAll();
});

// 'ImageMin' task
gulp.task('imagemin', function () {
    return gulp.src('./app/img/**/*')
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('./dist/img'));
});

// 'Watch' task
gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function () {
    gulp.watch('./app/sass/**/*.scss', ['sass']);
    gulp.watch('./app/*.html', browserSync.reload);
    gulp.watch('./app/js/**/*.js', browserSync.reload);
});


// 'Default' task
gulp.task('default', ['watch']);


// 'Build' task
gulp.task('build', ['removedist', 'imagemin', 'sass','css-libs', 'scripts'], function () {
    
    var buildCss = gulp.src([
        './app/css/style.css',
        './app/css/libs.min.css'
        ])
        .pipe(gulp.dest('./dist/css'));

    var buildFonts = gulp.src('./app/fonts/**/*')
        .pipe(gulp.dest('./dist/fonts'));

    var buildJs = gulp.src('./app/js/**/*')
        .pipe(gulp.dest('./dist/js'));

    var buildLibs = gulp.src('./app/libs/**/*')
        .pipe(gulp.dest('./dist/libs'));

    var buildHtml = gulp.src('./app/*.html')
        .pipe(gulp.dest('./dist'));

});


// 'Deploy' task
gulp.task('deploy', function() {

    var conn = ftp.create({
        host:     'hostname.com',
        user:     'username',
        password: 'userpassword',
        parallel: 10,
        log:      gutil.log
    });

    var globs = [
        './dist/**',
        // './dist/.htaccess'
    ];
    return gulp.src(globs, {buffer: false})
        .pipe(conn.dest('/public_html/path-to-folder-on-server'));

});