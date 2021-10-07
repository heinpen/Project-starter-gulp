// import plugins
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

// Set directories.
const TEST = 'test';
const DIST = 'dist';
const SRC = 'src';

// Copy html files from SRC to TEST.
const html = () => (
  gulp
    .src(`${SRC}/*.html`)
    .pipe(gulp.dest(`${TEST}`))
    .pipe(sync.stream())
);
// Copy styles from SRC to TEST with few modifications.
const styles = () => (
  gulp
    .src(`${SRC}/styles/index.css`)
    // 'pimport' resolve path of an @import rule
    // 'autoprefixer' add or remove vendor prefixes like -webkit and -moz after checking the code
    .pipe(postcss([pimport, autoprefixer]))
    .pipe(gulp.dest(`${TEST}/styles`))
    .pipe(sync.stream())
);

const imagesMain = (dir) => function images() {
  return gulp
    .src(`${SRC}/images/**/*`)
    .pipe(gulp.dest(`${dir}/images`))
    .pipe(sync.stream());
};

const fontsMain = (dir) => function fonts() {
  return gulp
    .src(`${SRC}/fonts/**/*`)
    .pipe(gulp.dest(`${dir}/fonts`))
    .pipe(sync.stream());
};

// Copy scripts and modify with babel.
const scripts = () => gulp
  .src(`${SRC}/scripts/index.js`)
  .pipe(babel())
  .pipe(include())
  .pipe(prettier())
  .pipe(gulp.dest(`${TEST}/scripts`))
  .pipe(sync.stream());

// browser sync
const server = () => {
  sync.init({
    // more info https://browsersync.io/docs/options#option-ui
    ui: false,
    // Shows any notifications in the browser if true.
    notify: false,
    // Set directory which will be displayed in browser.
    server: {
      baseDir: TEST,
    },
  });
};

// Change "test" files according to src when any changes occur.
const watch = () => {
  gulp.watch(`${SRC}/*.html`, html);
  gulp.watch(`${SRC}/styles/**/*.css`, styles);
  gulp.watch(`${SRC}/scripts/**/*.js`, scripts);
  gulp.watch(`${SRC}/fonts/**/*`, fontsMain(TEST));
  gulp.watch(`${SRC}/images/**/*`, imagesMain(TEST));
};

// Executes when you run "gulp build" in console.
export const build = () => new Promise(((res) => {
  buildMain();
  res();
}));

function buildMain() {
  // Check with eslint by config rules in ".eslintrc.json".
  linterMain(TEST);
  // Minify js, css, html.
  htmlMinify();
  cssMinify();
  jsMinify();
  // Transfer images and fonts into folder in variable DIST.
  imagesMain(DIST)();
  fontsMain(DIST)();
}

function htmlMinify() {
  gulp
    .src(`${TEST}/*.html`)
    .pipe(
      htmlmin({
        removeComments: true,
        collapseWhitespace: true,
      }),
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

export const linter = () => new Promise(((res) => {
  linterMain();
  res();
}));

function linterMain(dir) {
  let newDir;
  if (!dir) newDir = SRC;
  gulp.src(`${newDir}/scripts/index.js`).pipe(eslint()).pipe(eslint.format());
}

export default gulp.series(
  gulp.parallel(scripts, styles, html, imagesMain(TEST), fontsMain(TEST)),
  gulp.parallel(watch, server),
);
