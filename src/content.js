document.body.addEventListener(
  chrome.runtime.id,
  (e) => chrome.runtime.sendMessage(null, e.detail),
  false
);

function executeInBody(func) {
  const src = document.createElement('script');
  src.text = `(${func.toString()})('${chrome.runtime.id}')`;
  document.querySelector('body').appendChild(src);
}

executeInBody((extensionId) => {
  'use strict';

  function showTip() {
    Audio.rowActive(this, 'Сохранить аудиозапись', [9, 5, 0]);
  }

  function hideTip() {
    Audio.rowInactive(this);
  }

  function sendMessage(message) {
    const event = new CustomEvent(extensionId, {detail: message});
    document.body.dispatchEvent(event);
  }

  function save(e) {
    e.stopPropagation();
    e.preventDefault();
    sendMessage(this.parentNode.innerHTML);
  }

  function addSaver(audio) {
    if (audio.querySelector('.audio_save')) {
      return;
    }

    const
      url = audio.querySelector('input').value,
      titleEl = audio.querySelector('.title_wrap'),
      artist = titleEl.querySelector('a').textContent.trim(),
      title = titleEl.querySelector('.title').textContent.trim(),
      fullTitle = `${artist} - ${title}`,
      wrapper = document.createElement('div');

    wrapper.className = 'audio_save_wrap fl_r';
    wrapper.addEventListener('mouseover', showTip, false);
    wrapper.addEventListener('mouseout', hideTip, false);

    const saver = document.createElement('a');
    saver.setAttribute('download', `${fullTitle}.mp3`);
    saver.className = 'audio_save';
    saver.href = url;
    saver.addEventListener('click', save, false);

    wrapper.appendChild(saver);
    audio.querySelector('.actions').appendChild(wrapper);
  }

  const observer = new MutationObserver((records) => {
    for (let record of records) {
      for (let i = 0; i !== record.addedNodes.length; ++i) {
        const node = record.addedNodes[i];
        if (node.nodeType === Element.ELEMENT_NODE && node.classList.contains('audio')) {
          addSaver(node);
        } else if (typeof node.querySelectorAll === 'function') {
          const nodes = [].concat.apply([], node.querySelectorAll('.audio'));
          nodes.forEach(addSaver);
        }
      }
    }
  });

  observer.observe(document.body, {childList: true, subtree: true});

  if (location.pathname.indexOf('/audio') === 0) {
    const audios = [].concat.apply([], document.querySelectorAll('.audio'));
    audios.forEach(addSaver);
  }
});
