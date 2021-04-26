import gulp from 'gulp';
import babel from 'gulp-babel';
import sync from 'browser-sync';

// css
import postcss from 'gulp-postcss';
import pimport from 'postcss-import';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';

// js
import eslint from 'gulp-eslint';
import terser from 'gulp-terser';
import prettier from 'gulp-prettier';

// html
import htmlmin from 'gulp-htmlmin';

// dirrections
const TEST = 'test',
  DIST = 'dist',
  SRC = 'src';

const html = () => {
  return gulp
    .src(`${SRC}/*.html`)
    .pipe(gulp.dest(`${TEST}`))
    .pipe(sync.stream());
};

const styles = () => {
  return gulp
    .src(`${SRC}/styles/index.css`)
    .pipe(postcss([pimport, autoprefixer]))
    .pipe(gulp.dest(`${TEST}/styles`))
    .pipe(sync.stream());
};

const imagesMain = (dir) => {
  return function images() {
    return gulp.src(`${SRC}/images/**/*`).pipe(gulp.dest(`${dir}/images`));
  };
};

const fontsMain = (dir) => {
  return function fonts() {
    return gulp.src(`${SRC}/fonts/**/*`).pipe(gulp.dest(`${dir}/fonts`));
  };
};

const scripts = () => {
  return gulp
    .src(`${SRC}/scripts/index.js`)
    .pipe(
      babel({
        presets: [
          [
            '@babel/env',
            {
              targets: {
                edge: '17',
                firefox: '60',
                chrome: '67',
                safari: '11.1',
                ie: '9',
              },
            },
          ],
        ],
      })
    )
    .pipe(prettier())
    .pipe(gulp.dest(`${TEST}/scripts`));
};

const server = () => {
  sync.init({
    ui: false,
    notify: false,
    server: {
      baseDir: TEST,
    },
  });
};

const watch = () => {
  gulp.watch(`${SRC}/*.html`, html);
  gulp.watch(`${SRC}/styles/**/*.css`, styles);
  gulp.watch(`${SRC}/scripts/**/*.js`, scripts);
  gulp.watch(`${SRC}/fonts/**/*`, fontsMain(TEST));
  gulp.watch(`${SRC}/images/**/*`, imagesMain(TEST));
};

export const build = () => {
  return new Promise(function (res, rej) {
    buildMain();
    res();
  });
};

export const linter = () => {
  return new Promise(function (res, rej) {
    linterMain();
    res();
  });
};

export default gulp.series(
  gulp.parallel(scripts, styles, html, imagesMain(TEST), fontsMain(TEST)),
  gulp.parallel(watch, server)
);

// build function

function buildMain() {
  linterMain(TEST);
  htmlMinify();
  cssMinify();
  jsMinify();
  imagesMain(DIST)();
  fontsMain(DIST)();
  htmlMinify();
}

// linter function

function linterMain(dir) {
  if (!dir) dir = SRC;
  gulp.src(`${dir}/scripts/index.js`).pipe(eslint()).pipe(eslint.format());
}

// minifying funtions
function htmlMinify() {
  gulp
    .src(`${TEST}/*.html`)
    .pipe(
      htmlmin({
        removeComments: true,
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest(DIST));
}

function cssMinify() {
  gulp
    .src(`${TEST}/styles/index.css`)
    .pipe(postcss([csso]))
    .pipe(gulp.dest(`${DIST}/styles`));
}

function jsMinify() {
  gulp
    .src(`${TEST}/scripts/index.js`)
    .pipe(terser())
    .pipe(gulp.dest(`${DIST}/js`));
}
