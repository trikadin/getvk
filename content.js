function executeInBody(func) {
    var scr = document.createElement("script");
    scr.text= "(" + func.toString() + ")()";
    document.querySelector("body").appendChild(scr);
}

executeInBody(function() {

    function newSaver(/*String*/ audioUrl) {
        var wrap = document.createElement("div");
        wrap.className = "audio_save_wrap fl_r";
        wrap.onmouseover = function () {
            Audio.rowActive(this, "Сохранить аудиозапись", [9, 5, 0]);
        };
        wrap.onmouseout = function () {
            Audio.rowInactive(this);
        };
        wrap.onclick = function (e) {
            e.stopPropagation();
        };
        var saver = document.createElement("a");
        saver.setAttribute("download","huynya.mp3");
        saver.className = "audio_save";
        saver.href = audioUrl+"?/huynya.mp3";
        wrap.appendChild(saver);
        return wrap;
    }

    function saveAll(count) {

    }

    setInterval(function () {
        if (location.pathname.indexOf("/audio") !== 0) {
            return
        }
        var audios = document.querySelectorAll("#audio.new .audio");
        for (var i = 0; i !== audios.length; ++i) {
            if (audios[i].querySelector(".audio_save")) {
                continue;
            }
            audios[i].querySelector(".actions").appendChild(
                newSaver(audios[i].querySelector(".play_btn input").value)
            )
        }
    }, 300);

});