var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var gulp = require('gulp');
var less = require('gulp-less');
var cssMin = require('gulp-minify-css');
// var imagemin = require('gulp-imagemin');
var gzip = require('gulp-gzip');
var htmlmin = require('gulp-htmlmin');

// gulp.task('minify-html', function() {
//     return gulp.src('public/**/*.html')
//         .pipe(htmlmin({collapseWhitespace: true}))
//         .pipe(gulp.dest('public'));
// });

//script paths
var jsFiles = ['themes/e-commerce/assets/js/e-commerce.js','themes/e-commerce/assets/js/e-commerce-all-pages.js'],
    jsOtherPageFile = 'themes/e-commerce/assets/js/e-commerce-all-pages.js',
    jsOrderPageFile = ['themes/e-commerce/assets/js/e-commerce-order-pages.js','themes/e-commerce/assets/js/clipboard.min.js'],
    jsDest = 'themes/e-commerce/static/js',
    cssFiles = 'themes/e-commerce/assets/less/e-commerce.less',
    cssDest = 'themes/e-commerce/static/css',
    imgFiles = 'themes/e-commerce/static/img/*',
    imgDest = 'themes/e-commerce/static/img/';

gulp.task('scripts-all', function() {
    return gulp.src(jsFiles)
        .pipe(concat('scripts.js'))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        // .pipe(gzip({ append: false }))
        .pipe(gulp.dest(jsDest));
});

gulp.task('scripts-other-page', function() {
    return gulp.src(jsOtherPageFile)
        .pipe(concat('scripts-other-page.js'))
        .pipe(rename('scripts-other-page.min.js'))
        .pipe(uglify())
        // .pipe(gzip({ append: false }))
        .pipe(gulp.dest(jsDest));
});

gulp.task('scripts-order-pages', function() {
    return gulp.src(jsOrderPageFile)
        .pipe(concat('scripts-order-pages.js'))
        .pipe(rename('scripts-order-pages.min.js'))
        .pipe(uglify())
        // .pipe(gzip({ append: false }))
        .pipe(gulp.dest(jsDest));
});

// compiles less files and outputs them to css
gulp.task('less-min', function() {
    gulp.src(cssFiles)
        .pipe(less())
        .pipe(concat('styles.css'))
        .pipe(rename('styles.min.css'))
        .pipe(cssMin({keepBreaks: false}))
        // .pipe(gzip({ append: false }))
        .pipe(gulp.dest(cssDest));
});

gulp.task('less-min-smoothproducts', function() {
    gulp.src('themes/e-commerce/assets/less/smoothproducts.less')
        .pipe(less())
        .pipe(rename('smoothproducts.min.css'))
        .pipe(cssMin({keepBreaks: false}))
        // .pipe(gzip({ append: false }))
        .pipe(gulp.dest('themes/e-commerce/static/css/'));
});

// gulp.task('theme-images', function() {
//     gulp.src(imgFiles)
//         .pipe(imagemin({
//             interlaced: true,
//             progressive: true,
//             optimizationLevel: 5
//         }))
//         .pipe(gulp.dest(imgDest));
//     }
// );
//
// gulp.task('images', function() {
//     gulp.src('static/img/**/*')
//         .pipe(imagemin({
//             interlaced: true,
//             progressive: true,
//             optimizationLevel: 5
//         }))
//         .pipe(gulp.dest('static/img'));
//     }
// );
// gulp.task('image-opt', ['images', 'theme-images']);

// gulp.task('default', ['less-min','less-min-smoothproducts','scripts-all','scripts-other-page','image-opt']);

gulp.task('default', ['less-min','less-min-smoothproducts','scripts-all','scripts-other-page', 'scripts-order-pages']);
gulp.task('watch', function(){
    gulp.watch(jsFiles, ['scripts-all']);
    gulp.watch(cssFiles, ['less-min']);
    gulp.watch(jsOtherPageFile, ['scripts-other-page']);
    gulp.watch(jsOrderPageFile, ['scripts-order-pages']);
});
