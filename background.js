/**
 * @fileOverview , date 04.04.15:
 * @author <trikadin@mail.ru>
 */

chrome.runtime.onMessage.addListener(
    function(msg){
        document.body.innerHTML= msg;
        document.body.firstChild.click();
        document.body.innerHTML= "";
    }
);