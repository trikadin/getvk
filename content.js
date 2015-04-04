document.body.addEventListener(chrome.runtime.id, function(e){
    chrome.runtime.sendMessage(e.detail);
}, false);

function executeInBody(func) {
    var scr = document.createElement("script");
    scr.text = "(" + func.toString() + ")('" + chrome.runtime.id + "')";
    document.querySelector("body").appendChild(scr);
}

executeInBody(
    function (extensionId) {
        function trim(string) {
            var str = string.replace(/^\s\s*/, ''),
                ws = /\s/,
                i = str.length;
            while (ws.test(str.charAt(--i)));
            return str.slice(0, i + 1);
        }

        function showTip() {
            Audio.rowActive(this, "Сохранить аудиозапись", [9, 5, 0]);
        }

        function hideTip() {
            Audio.rowInactive(this);
        }

        function sendMessage(message) {
            var event= new CustomEvent(extensionId, {detail: message});
            document.body.dispatchEvent(event);
        }

        function save(e) {
            e.stopPropagation();
            e.preventDefault();
            sendMessage(this.parentNode.innerHTML);
        }

        function addSaver(audio) {
            if (audio.querySelector(".audio_save")) {
                return
            }

            var url= audio.querySelector(".play_btn input").value,
                title= trim(audio.querySelector(".title_wrap").textContent);
                wrapper = document.createElement("div");
            wrapper.className = "audio_save_wrap fl_r";
            wrapper.addEventListener('mouseover', showTip, false);
            wrapper.addEventListener('mouseout', hideTip, false);

            var saver = document.createElement("a");
            saver.setAttribute("download", title + '.mp3');
            saver.className = "audio_save";
            saver.href = url;
            saver.addEventListener('click', save, false);
            wrapper.appendChild(saver);
            audio.querySelector(".actions").appendChild(wrapper)
        }

        function saveAll(count) {

        }

        setInterval(
            function () {
                if (location.pathname.indexOf("/audio") !== 0) {
                    return
                }
                var audios = [].concat.apply([], document.querySelectorAll("#audio.new .audio"));
                audios.forEach(addSaver);
            }, 300
        );

    }
);