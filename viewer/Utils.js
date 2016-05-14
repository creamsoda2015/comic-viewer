this.comicviewer = this.comicviewer||{};
(function() {
    "use strict";

    function Utils() 
    {
        throw "Utils cannot be instantiated.";
    }
    Utils.zfill = function(number, length)
    {
        return (Array(length).join("0") + number).slice(-length);
    }
    Utils.dlog = function(text)
    {                                                                                                             
        document.getElementById("debug_log").innerText = document.getElementById("debug_log").innerText + text + "\n";
    }
    Utils.getAndroidVersion = function()
    {
        var ua = navigator.userAgent;
        if(ua.indexOf("Android") > 0)
        {
            return parseFloat(ua.slice(ua.indexOf("Android")+8));
        }
        return false;
    } 

    comicviewer.Utils = Utils;
}());
