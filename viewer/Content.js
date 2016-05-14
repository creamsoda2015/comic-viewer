this.comicviewer = this.comicviewer||{};
(function() {
    "use strict";

    function Content() 
    {
        throw "Content cannot be instantiated.";
    }

    Content.imageHost     = null;
    Content.contentId     = 0;
    Content.seriesId      = 0;
    Content.volumeId      = 0;
    Content.episodeId     = 0;
    Content.lastEpisodeId = 0;
    Content.maxPageOB     = 0;
    Content.seriesTitle   = null;
    Content.episodeTitle  = null;
    Content.dirName       = null;
    Content.imageWidth    = 0;
    Content.imageHeight   = 0;
    Content.lastPageText  = null;

    Content.stageWidth  = 0;
    Content.stageHeight = 0;

    comicviewer.Content = Content;
}());
