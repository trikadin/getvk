export function send(type, data, callback = () => {}) {
	chrome.runtime.sendMessage(
		chrome.runtime.id,
		{type, data},
		null,
		callback
	);
}

const handlers = {};

chrome.runtime.onMessage.addListener(
	({type, data}, ...rest) => {
		if (typeof handlers[type] === 'function') {
			handlers[type](data, ...rest);
		}
	}
);

document.body.addEventListener(
	chrome.runtime.id,
	({detail: {type, data}}) => {
		if (typeof handlers[type] === 'function') {
			handlers[type](data, ...rest);
		}

		send(type, data);
	},
	false
);

export function listen(type, handler) {
	handlers[type] = handler;
}

const injectedUtils = `
{
	extensionId: '${chrome.runtime.id}',
	send: ${
		(
			function (type, data) {
				document.body.dispatchEvent(
					new CustomEvent(this.extensionId, {detail: {type, data}})
				);
			}
		)
	}
}
`;

export function injectFunction(func) {
	const script = document.createElement('script');
	script.text = `(${func})(${injectedUtils})`;
	document.body.appendChild(script);
}
