/**
 * styles.js - Handle stylesheets.
 *
 * @package     WPDC gulp Starter
 * @since       1.0.0
 * @author      Alain Schlesser <alain.schlesser@gmail.com>
 * @link        http://wpdevelopersclub.com/
 * @license     GNU General Public License 2.0+
 * @copyright   2015 WP Developers Club
 */

'use strict';

var gulp = require( 'gulp' );

gulp.task( 'styles', function() {

	// Dependencies for styles-lint
	var filter          = require( 'gulp-filter' );
	var postcss         = require( 'gulp-postcss' );
	var stylelint       = require( 'stylelint' );
	var reporter        = require( 'postcss-reporter' );
	var configWordPress = require( 'stylelint-config-wordpress' );
	var mergeRecursive  = require( '../util/mergeRecursive' );
	var config          = require( '../config' ).styles;

	var sassFilter = filter( [ '**/*.sass', '**/*.scss' ], { restore: false } );

	config.postcssSettings.lintSettings.rules = mergeRecursive(
		configWordPress.rules,
		config.postcssSettings.lintSettings.rules
	);

	// Additional Dependencies for styles-sass
	var sass         = require( 'gulp-sass' );
	var rename       = require( 'gulp-rename' );
	var handleErrors = require( '../util/handleErrors' );

	// Additional Dependencies for css-postprocess
	var gutil        = require( 'gulp-util' );
	var postcss      = require( 'gulp-postcss' );
	var sourcemaps   = require( 'gulp-sourcemaps' );
	var cssnano      = require( 'cssnano' );

	// Load postprocessor modules
	function loadModules ( processorsConfig ) {
		var processors = [];
		for ( var processor in processorsConfig ) {
			var processorConfig = processorsConfig[ processor ];
			var instance = null;

			gutil.log( 'Loading PostCSS Module: ' + processor );
			instance = require( processor );
			processors.push( instance( processorConfig ) );
		}
		return processors;
	}

	// And here we go!
	return gulp.src( config.buildSrc, { base: config.base } )

		// Load our Sass files
		.pipe( sassFilter )

		// Run them through the linter
		.pipe( postcss( [
			stylelint( config.postcssSettings.lintSettings ),
			reporter( { clearMessages: true } )
		] ) )

		// Sassify!
		.pipe( sass( config.sassSettings ) )
		.on( 'error', handleErrors )

		// Postprocess the CSS
		.pipe( postcss( loadModules( config.postcssSettings.processors ) ) )
		.on( 'error', handleErrors )


		// Output expanded CSS
		.pipe( gulp.dest( config.dest ) )

		// Minify!
		.pipe( postcss( [ cssnano ] ) )
		.pipe( rename( { extname: '.min.css' } ) )

		// Output minified CSS
		.pipe( gulp.dest( config.dest ) );
} );
