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
      url = audio.querySelector('.play_btn input').value,
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

  setInterval(
    () => {
      if (location.pathname.indexOf('/audio') !== 0) {
        return;
      }

      const
        audios = [].concat.apply([], document.querySelectorAll('#audio.new .audio'));

      audios.forEach(addSaver);
    },

    300
  );

});
