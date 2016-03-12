/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _utils = __webpack_require__(1);

	(0, _utils.listen)('save', ({ artist, title, url }) => {
		const link = document.createElement('a');
		link.href = url;
		link.download = `${ artist } - ${ title }`;
		document.body.appendChild(link);
		link.click();
		document.body.innerHTML = '';
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.send = send;
	exports.listen = listen;
	exports.injectFunction = injectFunction;
	function send(type, data, callback = () => {}) {
		chrome.runtime.sendMessage(chrome.runtime.id, { type, data }, null, callback);
	}

	const handlers = {};

	chrome.runtime.onMessage.addListener(({ type, data }, ...rest) => {
		if (typeof handlers[type] === 'function') {
			handlers[type](data, ...rest);
		}
	});

	document.body.addEventListener(chrome.runtime.id, ({ detail: { type, data } }) => {
		if (typeof handlers[type] === 'function') {
			handlers[type](data, ...rest);
		}

		send(type, data);
	}, false);

	function listen(type, handler) {
		handlers[type] = handler;
	}

	const injectedUtils = `
	{
		extensionId: '${ chrome.runtime.id }',
		send: ${ function (type, data) {
		document.body.dispatchEvent(new CustomEvent(this.extensionId, { detail: { type, data } }));
	} }
	}
	`;

	function injectFunction(func) {
		const script = document.createElement('script');
		script.text = `(${ func })(${ injectedUtils })`;
		document.body.appendChild(script);
	}

/***/ }
/******/ ]);