// Gulp and package
const {src, dest, parallel, series, watch} = require('gulp');

// Plugins
const autoprefixer = require('autoprefixer');
const concat = require('gulp-concat');
const cssnano = require('cssnano');
const pixrem = require('pixrem');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const npmdist = require('gulp-npm-dist');
const replace = require('gulp-replace');
{%- if cookiecutter.ui_library == 'Tailwind' %}
const tailwindcss = require('@tailwindcss/postcss');
{%- else %}
const gulUglifyES = require('gulp-uglify-es');
const gulpSass = require('gulp-sass');
const dartSass = require('sass');
const tildeImporter = require('node-sass-tilde-importer');
const sass = gulpSass(dartSass);
const uglify = gulUglifyES.default;
{%- endif %}


{%- if cookiecutter.has_plugins_config == 'y' %}
const pluginFile = require("./plugins.config"); // Import the plugins list
{%- else %}
const pluginFile = {
    vendorsCSS: [],
    vendorsJS: []
}
{%- endif %}


const paths = {
    baseDistAssets: "apps/static/",  // build assets directory
    baseSrcAssets: "apps/static/",   // source assets directory
};

{%- if cookiecutter.has_plugins_config == 'y' %}
// Copying Third Party Plugins Assets
const plugins = function () {
    const out = paths.baseDistAssets + "/plugins/";

    pluginFile.forEach(({name, vendorsJS, vendorCSS, vendorFonts, assets, fonts, font, media, img, webfonts}) => {

        const handleError = (label, files) => (err) => {
            const shortMsg = err.message.split('\n')[0];
            console.error(`\n${label} - ${shortMsg}`);
            throw new Error(`${label} failed`);
        };

        if (vendorsJS) {
            src(vendorsJS)
                .on('error', handleError('vendorsJS'))
                .pipe(concat("vendors.min.js"))
                .pipe(dest(paths.baseDistAssets + "/js/"));
        }

        if (vendorCSS) {
            src(vendorCSS)
              .pipe(concat("vendors.min.css"))
              .on('error', handleError('vendorCSS'))
              .pipe(replace(/url\((['"]?)(remixicon|boxicons)/g, "url($1fonts/$2"))
              .pipe(dest(paths.baseDistAssets + "/css/"));
        }

        if (vendorFonts) {
            src(vendorFonts)
                .on('error', handleError('vendorFonts'))
                .pipe(dest(paths.baseDistAssets + "/css/fonts/"));
        }

        if (assets) {
            src(assets)
                .on('error', handleError('assets'))
                .pipe(dest(`${out}${name}/`));
        }

        if (img) {
            src(img)
                .on('error', handleError('img'))
                .pipe(dest(`${out}${name}/images/`));
        }

        if (media) {
            src(media)
                .on('error', handleError('media'))
                .pipe(dest(`${out}${name}/`));
        }


        if (fonts) {
            src(fonts)
                .on('error', handleError('fonts'))
                .pipe(dest(`${out}${name}/fonts/`));
        }

        if (font) {
            src(font)
                .on('error', handleError('font'))
                .pipe(dest(`${out}${name}/font/`));
        }

        if (webfonts) {
            src(webfonts)
                .on('error', handleError('webfonts'))
                .pipe(dest(`${out}${name}/webfonts/`));
        }
    });

    return Promise.resolve();
};

{%- else %}

const vendorStyles = function () {
const out = paths.baseDistAssets + "/css/";

return src(pluginFile.vendorsCSS, {sourcemaps: true, allowEmpty: true})
    .pipe(concat('vendors.css'))
    .pipe(plumber()) // Checks for errors
    .pipe(postcss(processCss))
    .pipe(dest(out))
    .pipe(rename({suffix: '.min'}))
    .pipe(postcss(minifyCss)) // Minifies the result
    .pipe(dest(out));
}

const vendorScripts = function () {
    const out = paths.baseDistAssets + "/js/";

    return src(pluginFile.vendorsJS, {sourcemaps: true, allowEmpty: true})
        .pipe(concat('vendors.js'))
        .pipe(dest(out))
        .pipe(plumber()) // Checks for errors
        .pipe(uglify()) // Minifies the js
        .pipe(rename({suffix: '.min'}))
        .pipe(dest(out, {sourcemaps: '.'}));
}

const plugins = function () {
  const out = paths.baseDistAssets + "/plugins/";
  return src(npmdist(), { base: "./node_modules" })
    .pipe(rename(function (path) {
      path.dirname = path.dirname.replace(/\/dist/, '').replace(/\\dist/, '');
    }))
    .pipe(dest(out));
};
{%- endif %}


{%- if cookiecutter.ui_library == 'Tailwind' %}

const processCss = [
    tailwindcss(),
    autoprefixer(), // adds vendor prefixes
    pixrem(), // add fallbacks for rem units
];

const minifyCss = [
    cssnano({preset: 'default'}), // minify result
];

const styles = function () {
    const out = paths.baseDistAssets + "/css/";

    return src(paths.baseSrcAssets + "/css/app.css")
        .pipe(plumber()) // Checks for errors
        .pipe(postcss(processCss))
        // .pipe(dest(out))
        .pipe(rename({suffix: '.min'}))
        .pipe(postcss(minifyCss)) // Minifies the result
        .pipe(dest(out));
};

const watchFiles = function () {
    watch(paths.baseSrcAssets + "/css/**/*.css", series(styles));
}

{%- else %}

const processCss = [
    autoprefixer(), // adds vendor prefixes
    pixrem(), // add fallbacks for rem units
];

const minifyCss = [
    cssnano({preset: 'default'}), // minify result
];

const styles = function () {
    const out = paths.baseDistAssets + "/css/";

    return src(paths.baseSrcAssets + "/scss/**/*.scss")
        .pipe(
            sass({
                importer: tildeImporter,
                includePaths: [paths.baseSrcAssets + "/scss"],
            }).on('error', sass.logError),
        )
        .pipe(plumber()) // Checks for errors
        .pipe(postcss(processCss))
        .pipe(dest(out))
        .pipe(rename({suffix: '.min'}))
        .pipe(postcss(minifyCss)) // Minifies the result
        .pipe(dest(out));
};

function watchFiles() {
    watch(paths.baseSrcAssets + "/scss/**/*.scss", series(styles));
}

{%- endif %}


// Production Tasks
exports.default = series(
    plugins,
    {%- if cookiecutter.has_plugins_config == 'n' %}
        vendorStyles,
        vendorScripts,
    {%- endif %}
    parallel(styles),
    parallel(watchFiles)
);

// Build Tasks
exports.build = series(
    plugins,
    {%- if cookiecutter.has_plugins_config == 'n' %}
        vendorStyles,
        vendorScripts,
    {%- endif %}
    parallel(styles),
);
