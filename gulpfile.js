const {src, dest, watch, series} = require('gulp');
const del = require('del');

//文件合并
const concat = require('gulp-concat');

//js压缩
const uglify = require('gulp-uglify');

//server服务
const browserSync = require('browser-sync');

const templateCache = require('gulp-angular-templatecache');

function clean(cb) {
    del([
        'web/resource/js/app/common.min.js',
        'web/resource/js/app/templates.min.js'
    ]).then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'));
        cb();
    });
}

function javascript(cb) {
    src('web/resource/js/script/*.js', {sourcemaps: true})
        .pipe(concat('common.min.js'))
        .pipe(uglify())
        .pipe(dest('web/resource/js/app/', {sourcemaps: true}));
    cb();
}

function templatecache(cb) {
    src('web/resource/js/script/*.html')
        .pipe(templateCache('templates.min.js', {
            'root': '', 'module': 'we7app', 'transformUrl': function (url) {
                return url.substr(1);
            }
        }))
        .pipe(dest('web/resource/js/app/'));
    cb();
}

function livereload(cb) {
    browserSync({
        proxy: "www.weengine172.cn"
    });
    watch(['css/*.css', 'script/*.js'], {cwd: 'web/resource/'}, browserSync.reload);
    cb();
}

exports.default = series(clean, javascript, templatecache, livereload);