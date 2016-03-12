'use strict';

require('sugar');
require('colors');

const
	fs = require('fs'),
	gulp = require('gulp'),
	$C = require('collection.js').$C,
	program = require('commander'),
	semver = require('semver');

/**
 * Environment types
 *
 * @enum {string}
 */
const environments = {
	development: 'development',
	dev: 'development',
	production: 'production',
	prod: 'production'
};

/**
 * Output the message
 */
function log() {
	if (!program.silent) {
		console.log.apply(console, arguments);
	}
}

/**
 * Output the message, help and exit program
 *
 * @param {string} message
 * @param {Command} [cmd = program]
 */
function die(message, cmd) {
	cmd = cmd || program;
	log('  Fatal error'.red + ' in ', cmd.name().yellow + ':', message);
	cmd.help();
}

function determineVersion() {
	return JSON.parse(fs.readFileSync('./package.json')).version;
}

/**
 * Set NODE_ENV
 *
 * @param {environments} [value]
 */
function setEnvironment(value) {
	let env = process.env.NODE_ENV || 'development';

	if (value) {
		env = environments[value];
	}

	if (!$C(environments).indexOf(env)) {
		die(`invalid environment level value: ${value.yellow}`);
	}

	process.env.NODE_ENV = env;
	program.env = env;
	return env;
}

program
	.version(determineVersion(), '-V')
	.option('--no-color', 'No colors in output')
	.option('--silent', 'Disable output')
	.option(
		'-e, --env <environment>',
		'Set environment: (prod[uction]|dev[elopment])',
		(value) => setEnvironment(value),
		process.env.NODE_ENV || 'development'
	)
	.allowUnknownOption(true);

/*---------- BUMP COMMAND ----------*/

const cBump = program
	.command('bump [type]')
	.description(`Bump version (${
		['major', 'minor', 'patch']
			.map((s) => s.yellow)
			.join('|')
		}) [${'patch'.yellow}]`)
	.action((type) => {
		if (type && ['major', 'minor', 'patch'].indexOf(type) === -1) {
			die(`invalid type "${type.yellow}"`, cBump);
		}

		cBump.type = type || 'patch';

		gulp.task(cBump.type, [cBump.name()]);
	})
	.option('-x, --exactly <version>', 'specify the exact version', (value) => {
		if (!semver.valid(value)) {
			die(`${value.yellow} is not valid semantic version`, cBump);
		}

		return value.replace(/^[^0-9]*/, '');
	});

/*---------- BUMP END ----------*/

/*---------- BUILD COMMAND ----------*/

const cBuild = program
	.command('build')
	.description('Build project, if environment is "development" runs watcher')
	.option(
		'-w, --watch [status]',
		'exactly enable or disable running of watcher [on|off] (on)',
		(value) => {
			if (!/^(on|off)$/.test(value)) {
				die(`Invalid value for --watcher option: ${value.yellow}`, cBuild);
			}

			return value === 'on';
		},
		undefined
	)
	.action(() => {
		cBuild.running = true;
	});

/*---------- BUILD END ----------*/

program.parse(process.argv);
setEnvironment();
log(`Environment: ${program.env.yellow}`);

/*---------- BUMP TASK ----------*/

const
	bump = require('gulp-bump');

gulp.task('bump', (ignore) => {
	log(`Current version is ${program.version().yellow}`);

	const config = {};

	if (cBump.exactly) {
		config.version = cBump.exactly;
		log(`Bump to v${config.version.yellow}`);
	} else {
		config.type = cBump.type;
		log(`Bump ${config.type.yellow} version`);
	}

	gulp.src('./*.json')
		.pipe(bump(config))
		.pipe(gulp.dest('./'))
		.on('end', () => {
			log(`Done, new version is ${determineVersion().yellow}`);
		});
});

/*---------- BUMP END ----------*/

/*---------- BUILD TASK ----------*/

if (cBuild.running) {
	if (cBuild.watch === undefined) {
		cBuild.watch = program.env === 'development';
	}

	log(`Watcher ${(cBuild.watch ? 'enabled' : 'disabled').yellow}`);
}

const
	path = require('path'),
	config = require('config'),

	del = require('del'),
	gutil = require('gulp-util'),
	watch = require('gulp-watch'),
	plumber = require('gulp-plumber'),
	webpack = require('webpack');

const
	dest = config.buildDir;

gulp.task('build:clean', () => del([dest]));

gulp.task('build:copy', ['build:clean'], (cb) => {
	const srcGlobs = [
		'./manifest.json'
	];

	gulp
		.src(srcGlobs)
		.pipe(watch(srcGlobs, {
			events: ['add', 'change', 'unlink', 'ready'],
			name: 'build:copy',
			verbose: true
		}))
		.on('ready', function () {
			if (cBuild.watch) {
				cb();

			} else {
				setTimeout(() => this.close(), 10000); // TODO: починить вот этот ад
			}
		})
		.pipe(gulp.dest(dest))
		.on('end', () => {
			if (!cBuild.watch) {
				cb();
			}
		});
});

gulp.task('build:webpack', ['build:clean'], (cb) => {
	const
		compiler = webpack(require('./webpack.config')),
		isWatch = cBuild.watch;

	function listener(err, stats) {
		if (err) {
			if (isWatch) {
				gutil.log(err);
				gutil.log(err.stack);
			} else {
				throw err;
			}
		}

		gutil.log(`[${'build:webpack'.cyan}]\n`, stats.toString({
			colors: true,
			hash: true,
			timings: true,
			version: true,
			reasons: true,
			errorDetails: true,
			chunks: true,
			assets: true,
			source: true,

			chunkOrigins: false,
			cached: false,
			modules: false,
			chunkModules: false
		}));

		if (!isWatch) {
			cb();
		}
	}

	if (isWatch) {
		compiler.watch({}, listener);
	} else {
		compiler.run(listener);
	}
});

gulp.task('build', ['build:clean', 'build:copy', 'build:webpack']);

/*---------- BUILD END ----------*/
