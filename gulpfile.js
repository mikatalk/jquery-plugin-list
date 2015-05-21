/*!
 * $ npm install gulp-ruby-sass gulp-autoprefixer gulp-minify-css gulp-jshint \
 *   gulp-concat gulp-uglify gulp-imagemin gulp-notify gulp-rename gulp-livereload gulp-cache del --save-dev
 */

// Load plugins
var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del');


// Styles
gulp.task('sass', function() {
    return sass('src/styles/', { style: 'expanded' })
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest('dist/styles'))
        .pipe(rename({
        suffix: '.min'
    }))
        .pipe(minifycss())
        .pipe(gulp.dest('dist/styles'))
    //     .pipe(notify({
    //     message: 'Styles task complete'
    // }));
    console.log('update sass files');
});

// Scripts
gulp.task('scripts', function() {
    return gulp.src('src/scripts/**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        // .pipe(concat('main.js'))
        .pipe(gulp.dest('dist/scripts'))
        .pipe(rename({
        suffix: '.min'
    }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts'))
    //     .pipe(notify({
    //     message: 'Scripts task complete'
    // }));
});

// Images
gulp.task('images', function() {
    return gulp.src('src/images/**/*')
        .pipe(cache(imagemin({
        optimizationLevel: 3,
        progressive: true,
        interlaced: true
    })))
        .pipe(gulp.dest('dist/images'))
    //     .pipe(notify({
    //     message: 'Images task complete'
    // }));
});

// HTML
gulp.task('html', function() {
    return gulp.src('src/**/*')
        .pipe(gulp.dest('dist/'));
});

// Clean
gulp.task('clean', function(cb) {
    del(['dist/styles', 'dist/scripts', 'dist/images'], cb)
});

// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('html', 'sass', 'scripts', 'images', 'watch');
});

// Watch
gulp.task('watch', function() {

    // Watch .html files
    gulp.watch('src/**/*.html', ['html']);

    // Watch .scss files
    gulp.watch('src/styles/**/*.scss', ['sass']);

    // Watch .js files
    gulp.watch('src/scripts/**/*.js', ['scripts']);

    // Watch image files
    gulp.watch('src/images/**/*', ['images']);
    
    // Create LiveReload server
    livereload.listen();
    
    // Watch any files in dist/, reload on change
    gulp.watch(['dist/**', 'src/**']).on('change', livereload.changed);
   
});

