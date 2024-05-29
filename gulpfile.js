import gulp from 'gulp';

import { deleteAsync } from 'del';

import fileinclude from 'gulp-file-include';

import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import globImporter from 'node-sass-glob-importer';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import lightningcss from 'gulp-lightningcss'
import rename from 'gulp-rename';
import sourcemaps from 'gulp-sourcemaps';
import gulpif from 'gulp-if';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import terser from 'gulp-terser';

import imagemin from 'gulp-imagemin';
import changed from 'gulp-changed';

import bs from 'browser-sync';

const sass = gulpSass(dartSass);
const argv = yargs(hideBin(process.argv)).parse();

const paths = {
  src: {
    html: 'src/pages/*.html',
    styles: 'src/styles/*.scss'
  },
  dest: {
    html: 'build/',
    styles: 'build/css/'
  }
}

// clean output folder
function clean() {
  return deleteAsync('build/');
}

// html
function html() {
  return gulp.src(paths.src.html)
    .pipe(fileinclude())
    .pipe(gulp.dest(paths.dest.html));
}

// sass to css
function styles() {
  return gulp.src(paths.src.styles)
  .pipe(gulpif(!argv.prod, sourcemaps.init()))
  .pipe(sass({
    includePaths: [
      'node_modules'
    ],
    importer: [
      globImporter()
    ]
  }).on('error', sass.logError))
  .pipe(postcss([
    autoprefixer({
      cascade: false
    })
  ]))
  .pipe(gulpif(argv.prod, lightningcss({
      minify: true,
      sourceMap: false,
    })
  ))
  .pipe(rename({suffix:'.min'}))
  .pipe(gulpif(!argv.prod, sourcemaps.write()))
  .pipe(gulp.dest(paths.dest.styles));
}

function copyVendors() {
  return gulp.src([
    'node_modules/swiper/swiper-bundle.min.js'
  ])
    .pipe(gulp.dest('build/js/'));
}

// scripts
function script() {
  return gulp.src('src/js/*.js')
    .pipe(terser())
    .pipe(rename({suffix:'.min'}))
    .pipe(gulp.dest('build/js/'));
}

// images
function images() {
  return gulp.src('src/images/**/*', { encoding: false })
    .pipe(changed('build/images/'))
    .pipe(imagemin({verbose: true}))
    .pipe(gulp.dest('build/images/'));
}

// fonts
function fonts() {
  return gulp.src('src/fonts/*.woff2', { encoding: false })
    .pipe(gulp.dest('build/fonts/'));
}

// server
function runServer(done) {
  bs.init({
    server: {
      baseDir: 'build',
      index: 'index.html'
    },
    port: 8080,
    ui: { port: 8081 },
    open: true,
    notify: false,
    logPrefix: 'frontend_dev'
  });
  console.log('Сервер работает по адресу http://localhost:8080');
  done();
}

function reload(done) {
  bs.reload();
  done();
}

// watch files
function watchFiles() {
  gulp.watch(['src/pages/*.html', 'src/blocks/**/*.html'], gulp.series(html, reload));
  gulp.watch(['src/styles/**/*.scss', 'src/blocks/**/*.scss'], gulp.series(styles, reload));
  gulp.watch('src/images/**/*', gulp.series(images, reload));
  gulp.watch('src/js/*.js', gulp.series(script, reload));
}

// build
const build = gulp.series(
  clean,
  gulp.parallel(
    html,
    styles,
    copyVendors,
    script,
    images,
    fonts
  )
);

// dev
const dev = gulp.series(
  build,
  runServer,
  watchFiles
);

export { clean };
export { build };
export default dev;

export { images };