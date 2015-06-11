// File: Gulpfile.js
'use strict';

var gulp  = require('gulp'),
connect   = require('gulp-connect'),
stylus    = require('gulp-stylus'),
nib       = require('nib'),
jshint    = require('gulp-jshint'),
gulpif    = require('gulp-if'),
minifyCss = require('gulp-minify-css'),
useref    = require('gulp-useref'),
uglify    = require('gulp-uglify'),
uncss     = require('gulp-uncss'),
historyApiFallback = require('connect-history-api-fallback');

// Servidor web de desarrollo
gulp.task('server', function() {
	connect.server({
		root: './app',
		hostname: '0.0.0.0',
		port: 8000,
		livereload: true,
		middleware: function(connect, opt) {
			return [ historyApiFallback ];
		}
	});
});

// Servidor web para probar el entorno de producción
gulp.task('server-dist', function() {
	connect.server({
		root: './dist',
		hostname: '0.0.0.0',
		port: 8080,
		livereload: true,
		middleware: function(connect, opt) {
			return [ historyApiFallback ];
		}
	});
});

// Busca errores en el JS y nos los muestra por pantalla
gulp.task('jshint', function() {
	return gulp.src('./app/js/*.js')
	.pipe(jshint('.jshintrc'))
	.pipe(jshint.reporter('jshint-stylish'))
	.pipe(jshint.reporter('fail'));
});

// Preprocesa archivos Stylus a CSS y recarga los cambios
gulp.task('css', function() {
	gulp.src('./app/css/main.styl')
	.pipe(stylus({ use: nib() }))
	.pipe(gulp.dest('./app/css'))
	.pipe(connect.reload());
});

// Recarga el navegador cuando hay cambios en el HTML
gulp.task('html', function() {
	gulp.src('./app/*.html')
	.pipe(connect.reload());
});

// Comprime los archivos CSS y JS enlazados en el index.html
// y los minifica.
gulp.task('compress', function() {
	gulp.src('./app/index.html')
	.pipe(useref.assets())
	.pipe(gulpif('*.js', uglify({mangle: false })))
	.pipe(gulpif('*.css', minifyCss()))
	.pipe(gulp.dest('./dist'));
});

// Elimina el CSS que no es utilizado para reducir el peso del archivo
gulp.task('uncss', function() {
	gulp.src('./dist/css/style.min.css')
	.pipe(uncss({
		html: ['./app/index.html'] //, './app/views/post-list.tpl.html', './app/views/post-detail.tpl.html']
	}))
	.pipe(gulp.dest('./dist/css'));
});

// Copia el contenido de los estáticos e index.html al directorio
// de producción sin tags de comentarios
gulp.task('copy', function() {
	gulp.src('./app/index.html')
	.pipe(useref())
	.pipe(gulp.dest('./dist'));
});

// Vigila cambios que se produzcan en el código
// y lanza las tareas relacionadas
gulp.task('watch', function() {
	gulp.watch(['./app/**/*.html'], ['html']);
	gulp.watch(['./app/css/*.styl'], ['css']);
	gulp.watch(['./app/js/*.js', './Gulpfile.js'], ['jshint', 'html']);
	gulp.watch(['./app/js/*.js', './Gulpfile.js'], ['jshint']);
});

gulp.task('default', ['server', 'watch']);
gulp.task('build', ['compress', 'uncss']);
gulp.task('build', ['uncss']);
