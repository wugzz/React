/**
 * Created by wugz on 16/3/19.
 */
/**
 * 组件安装
 * npm install gulp-util gulp-imagemin gulp-ruby-sass gulp-minify-css gulp-jshint gulp-uglify gulp-rename gulp-concat gulp-clean gulp-livereload tiny-lr --save-dev
 * sudo npm install -g gulp-babel
 * */

// 引入 gulp及组件
var gulp    = require('gulp'),                 //基础库
    gutil = require('gulp-util'),
    sequence = require('gulp-sequence'),
    imagemin = require('gulp-imagemin'),       //图片压缩
    sass = require('gulp-ruby-sass'),          //sass
    minifycss = require('gulp-minify-css'),    //css压缩
    //jshint = require('gulp-jshint'),           //js检查
    uglify  = require('gulp-uglify'),          //js压缩
    rename = require('gulp-rename'),           //重命名
    concat  = require('gulp-concat'),          //合并文件
    clean = require('gulp-clean'),             //清空文件夹
    tinylr = require('tiny-lr'),               //livereload
    server = tinylr(),
    port = 35729,
    livereload = require('gulp-livereload'),//livereload
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    changed = require('gulp-changed'),
    gulpif = require('gulp-if'),
    rev = require('gulp-rev'),
    gzip = require('gulp-gzip');
    //exec = require('gulp-exec'),
    //exece = require('child_process').exec;

/**
 * 配置文件
 * */
var Config = {
    //开发状态值
    dev:true,
    //js源文件
    srcJS:"src/**/*.js",
    //html路径
    srcHtml:"src/**/*.html",
    //css路径
    srcCSS:"src/**/*.css",
    //img路径
    srcImage:"src/img/**",
    //img目标路径
    distImage:"dist/img",
    //目标目录
    dist:"dist",
    //
}

//默认执行任务
gulp.task('default', function(){
    //根据输入的命令参数,修改开发状态
    if(gutil.env.dev == "false"){
        Config.dev = false;
        Config.dist = 'release';
        Config.distImage = 'release/img/';
    }
    if(gutil.env.clean == "true"){
        gulp.start('clean');
    }else{
        gulp.start('trans', 'WatchSrc');
    }
});

//开始编译命令
gulp.task('trans', function(){
    //开始
    gulp.start('TaskJS','TaskCSS','TaskImage','TaskHtml');
});

//清除命令
gulp.task('clean', function(){
    gulp.src([Config.dist], {read: false})
        .pipe(clean());
});

//执行js编译任务
gulp.task('TaskJS',function(){
    gulp.src(Config.srcJS)
        //比较,只重新编译修改的文件
        .pipe(changed(Config.dist))
        //转译JSX文件
        .pipe(babel())
        //判断是否为开发版,如果不是则执行压缩
        //.pipe(gulpif(!Config.dev,uglify()))
        //.pipe(gulpif(!Config.dev, rev()))
        //拷贝到指定目录下
        .pipe(gulp.dest(Config.dist))
        //.pipe(gzip({append:false}))
        //.pipe(gulp.dest("public"))
        //.pipe(rev.manifest())
        //.pipe(gulp.dest(Config.dist))
});

//执行html编译任务
gulp.task('TaskHtml',function(){
    gulp.src(Config.srcHtml)
        .pipe(changed(Config.dist))
        .pipe(gulp.dest(Config.dist))
});

//图片编译任务
gulp.task('TaskImage', function(){
    gulp.src(Config.srcImage)
        .pipe(changed(Config.distImage))
        //如果不是开发版,则对图片进行压缩
        .pipe(gulpif(!Config.dev, imagemin()))
        .pipe(gulp.dest(Config.distImage))
})

//css编译任务
gulp.task('TaskCSS',function(){
    gulp.src(Config.srcCSS)
        .pipe(changed(Config.dist))
        //如果不是开发版,则对css文件进行压缩
        .pipe(gulpif(!Config.dev,minifycss()))
        .pipe(gulp.dest(Config.dist))
});

//监听src下所有文件的改变
gulp.task('WatchSrc',function(){
    gulp.watch("src/**/*", function(event){
        var path = event.path;
        path = path.substr(path.indexOf('src/'), path.length);
        //打印改变的文件,以及类型
        console.log("文件: "+ path + " is " + event.type);
        //判断文件的类型,分别执行不同的编译任务
        if(path.indexOf('.js')>0)
            gulp.start('TaskJS');
        else if(path.indexOf('.css')>0)
            gulp.start('TaskCSS');
        else if(path.indexOf('.html')>0)
            gulp.start('TaskHtml');
        else
            gulp.start('TaskImage');
    });
});


//
//var transJS = function(path,dist){
//    gulp.src(path)
//        //.pipe(uglify())
//        .pipe(babel())
//        .pipe(gulp.dest(dist));
//}
//
//gulp.task('js', function(){
//    transJS("build/**/*.js", "dist");
//});
//
//gulp.task('img', function(){
//    gulp.src("src/img/**")
//        //.pipe(imagemin())
//        .pipe(gulp.dest("dist/img"))
//});
//
//gulp.task('html', function(){
//    gulp.src("src/*.html")
//        .pipe(gulp.dest("dist/"))
//});
//
//// 样式处理
//gulp.task('css', function () {
//
//    gulp.src("src/css/*.css")
//        //.pipe(sass({style:'expanded'}))
//        .pipe(gulp.dest('dist/css'))
//        .pipe(rename({ suffix: '.min' }))
//        .pipe(minifycss())
//        .pipe(gulp.dest('dist/css'));
//});
//
//gulp.task('jsx-file', function(){
//    exece('jsx --harmony src/ build/', function(){
//        //开始将压缩js文件
//        gulp.start('js');
//    })
//})
//
////转译所有js文件
//var transJSX = function(path){
//    var build = path.replace("src/","build/");
//    gulp.task(path, function(){
//        exece('jsx --harmony '+path+' '+build, function(){
//            //开始将压缩js文件
//            transJS(build, path.replace("src/","dist/"))
//        })
//    })
//    gulp.start(path);
//};
//
//
//
//
//gulp.watch("src/**/*", function(event){
//    console.log("File:"+event.path+" was "+event.type);
//    var index = event.path.indexOf('src/');
//    console.log(index, event.path.substr(index, event.path.length));
//    if(event.path.indexOf('.js') > 0)
//        //transJSX(event.path);
//        gulp.start('TaskJS');
//    else if(event.path.indexOf('.css') > 0)
//        gulp.start('css');
//    else if(event.path.indexOf('.html') > 0)
//        gulp.start('html');
//    else
//        gulp.start('img');
//
//});


//var Config={
//    //html
//    htmlSrc:"src/*.html",
//    htmlDst:"dist/",
//    //css
//    cssSrc:"src/css/*.css",
//    cssDst:"dist/css/",
//    //image
//    imgSrc:'/src/img/**/*',
//    imgDst:'./dist/img',
//    //js
//    jsSrc:'./src/js/*.js',
//    jsDst:'./dist/js',
//}
//
//
//// HTML处理
//gulp.task('html', function() {
//    gulp.src(Config.htmlSrc)
//        .pipe(livereload(server))
//        .pipe(gulp.dest(Config.htmlDst))
//});
//
//// 样式处理
//gulp.task('css', function () {
//
//    gulp.src(Config.cssSrc)
//        .pipe(sass({ style: 'expanded'}))
//        .pipe(gulp.dest(Config.cssDst))
//        .pipe(rename({ suffix: '.min' }))
//        .pipe(minifycss())
//        .pipe(livereload(server))
//        .pipe(gulp.dest(Config.cssDst));
//});
//
//// 图片处理
//gulp.task('images', function(){
//    gulp.src(Config.imgSrc)
//        .pipe(imagemin())
//        .pipe(livereload(server))
//        .pipe(gulp.dest(Config.imgDst));
//})
//
//// js处理
//gulp.task('js', function () {
//
//    gulp.src(Config.jsSrc)
//        //.pipe(jshint('.jshintrc'))
//        //.pipe(jshint.reporter('default'))
//        .pipe(concat('main.js'))
//        .pipe(gulp.dest(Config.jsDst))
//        .pipe(rename({ suffix: '.min' }))
//        .pipe(uglify())
//        .pipe(livereload(server))
//        .pipe(gulp.dest(Config.jsDst));
//});
//
//// 清空图片、样式、js
//gulp.task('clean', function() {
//    gulp.src([Config.cssDst, Config.jsDst, Config.imgDst], {read: false})
//        .pipe(clean());
//});
//
//// 默认任务 清空图片、样式、js并重建 运行语句 gulp
////gulp.task('default', ['clean'], function(){
////    gulp.start('html','css','images','js');
////});
//
//
//
//// 监听任务 运行语句 gulp watch
//gulp.task('watch',function(){
//
//    //server.listen(port, function(err){
//    //    if (err) {
//    //        return console.log(err);
//    //    }
//    //
//    //    // 监听html
//    //    gulp.watch(Config.htmlSrc, function(event){
//    //        gulp.run('html');
//    //    })
//    //
//    //    // 监听css
//    //    gulp.watch(Config.cssSrc, function(){
//    //        gulp.run('css');
//    //    });
//    //
//    //    // 监听images
//    //    gulp.watch(Config.imgSrc, function(){
//    //        gulp.run('images');
//    //    });
//    //
//    //    // 监听js
//    //    gulp.watch(Config.jsSrc, function(){
//    //        gulp.run('js');
//    //    });
//    //
//    //});
//});