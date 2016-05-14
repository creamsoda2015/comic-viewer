this.comicviewer = this.comicviewer||{};
(function() {
    "use strict";

    function PageLoader() 
    {
        this.EventDispatcher_constructor();
        this._loadQueue = [];
        // loadqueueからとれるとよりよい
        this._imageUrls = [];
    }
    var p = createjs.extend(PageLoader, createjs.EventDispatcher);
    p.load = function()
    {
        // PreloadJS complete call twice on Android4.x Default Broser.
        // http://qiita.com/androhi/items/25a1fd4a0cd4302293c6
        if(this._loadQueue.length > 0)
        {
            var e = new createjs.Event("error");
            this.dispatchEvent(e);
        }

        var manifest = this._getManifest();
        var i = 0;
        var length = manifest.length;
        while(i < length)
        {
            this._imageUrls.push(manifest[i]["src"]);
            i++;
        }

        this._loadQueue = new createjs.LoadQueue();
        this._loadQueue.setMaxConnections(3);
        this._loadQueue.addEventListener("error",    createjs.proxy(this.handleError,    this));
        this._loadQueue.addEventListener("progress", createjs.proxy(this.handleProgress, this));
        this._loadQueue.addEventListener("complete", createjs.proxy(this.handleComplete, this));
        this._loadQueue.loadManifest(manifest);
    }
    p._getManifest = function()
    {
        var manifest = [];
        var url;
        var serial = "?20160316";
        for(var i = 1;i <= comicviewer.Content.maxPageOB;i++)
        {
            url = comicviewer.Content.imageHost + "/" 
                + "contents" + "/" 
                + comicviewer.Utils.zfill(comicviewer.Content.seriesId, 3) + "/" 
                + comicviewer.Utils.zfill(comicviewer.Content.volumeId, 3) + "/" 
                + comicviewer.Utils.zfill(comicviewer.Content.episodeId, 3) + "/" 
                + comicviewer.Content.dirName + "/" 
                + comicviewer.Utils.zfill(i, 3) + ".jpg" 
                + serial;
            manifest.push({src: url, type:"image", id: i - 1});
        }
        return manifest;
    }
    p.handleError = function(event) 
    {
        this._loadQueue.removeAllEventListeners();
        this._loadQueue = [];
        var e = new createjs.Event("error");
        this.dispatchEvent(e);
    }
    p.handleProgress = function(event) 
    {
        var e = new createjs.Event("progress");
        e.ratio = Math.min(1.0, event.progress / event.total);
        this.dispatchEvent(e);
    }
    p.handleComplete = function(event) 
    {
        this._loadQueue.removeAllEventListeners();

        var images = [];
        var i      = 0;
        var length = this._imageUrls.length;
        while(i < length)
        {
            images.push(this._loadQueue.getResult(this._imageUrls[i]));
            i++;
        }

        this._loadQueue = [];

        var e = new createjs.Event("complete");
        e.images = images;
        this.dispatchEvent(e);
    }

    comicviewer.PageLoader = createjs.promote(PageLoader, "EventDispatcher");  
}());
