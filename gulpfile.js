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

// html
import htmlmin from 'gulp-htmlmin';

// dirrections
const TEST = 'test',
  DIST = 'dist';

const html = () => {
  return gulp
    .src('src/*.html')
    .pipe(gulp.dest(`${TEST}`))
    .pipe(sync.stream());
};

const styles = () => {
  return gulp
    .src('src/styles/index.css')
    .pipe(postcss([pimport, autoprefixer]))
    .pipe(gulp.dest(`${TEST}/styles`))
    .pipe(sync.stream());
};

const imagesMain = (dir) => {
  return function images() {
    return gulp.src('src/images/**/*').pipe(gulp.dest(`${dir}/images`));
  };
};

const fontsMain = (dir) => {
  return function fonts() {
    return gulp.src('src/fonts/**/*').pipe(gulp.dest(`${dir}/fonts`));
  };
};

const scripts = () => {
  return gulp
    .src('src/scripts/index.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
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
  gulp.watch('src/*.html', html);
  gulp.watch('src/styles/**/*.css', styles);
  gulp.watch('src/scripts/**/*.js', scripts);
  gulp.watch('src/fonts/**/*', fontsMain(TEST));
  gulp.watch('src/images/**/*', imagesMain(TEST));
};

export const build = () => {
  return new Promise(function (res, rej) {
    htmlMinify(),
      cssMinify(),
      jsMinify(),
      imagesMain(DIST)(),
      fontsMain(DIST)(),
      htmlMinify();

    res();
  }).then(function buildDone() {
    console.log('building is done');
  });
};

export const linter = () => {
  gulp
    .src(`${TEST}/scripts/index.js`)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
};

export default gulp.series(
  gulp.parallel(scripts, styles, html, imagesMain(TEST), fontsMain(TEST)),
  gulp.parallel(watch, server)
);

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
