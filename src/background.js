import { listen } from './utils';

listen('save', ({artist, title, url}) => {
	const link = document.createElement('a');
	link.href = url;
	link.download = `${artist} - ${title}`;
	document.body.appendChild(link);
	link.click();
	document.body.innerHTML = '';
});
