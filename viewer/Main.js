this.comicviewer = this.comicviewer||{};
(function() {
    "use strict";

    function Main(canvasId, contentInfo) 
    {
        this._stage         = null;
        this._canvas        = null;
        this._canvasId      = canvasId;
        this._lastTapTime   = 0;
        this._lastTapStatus = false;
        this._lastTapStageX = 0;
        this._pageContainer = null;
        this._pageInfo      = null;
        this._pageSlider    = null;
        this._navigation    = null;

        comicviewer.Content.imageHost     = contentInfo.imageHost;
        comicviewer.Content.contentId     = parseInt(contentInfo.contentId);
        comicviewer.Content.nextContentId = parseInt(contentInfo.nextContentId);
        comicviewer.Content.seriesId      = parseInt(contentInfo.seriesId);
        comicviewer.Content.volumeId      = parseInt(contentInfo.volumeId);
        comicviewer.Content.episodeId     = parseInt(contentInfo.episodeId);
        comicviewer.Content.lastEpisodeId = parseInt(contentInfo.lastEpisodeId);
        comicviewer.Content.seriesTitle   = contentInfo.seriesTitle;
        comicviewer.Content.episodeTitle  = contentInfo.episodeTitle;
        comicviewer.Content.dirName       = contentInfo.dirName;
        comicviewer.Content.maxPageOB     = parseInt(contentInfo.maxPageOB);
        comicviewer.Content.imageWidth    = parseInt(contentInfo.imageWidth);
        comicviewer.Content.imageHeight   = parseInt(contentInfo.imageHeight);
        comicviewer.Content.lastPageText  = contentInfo.lastPageText;
    }
    var p = Main.prototype;
    p.init = function()
    {
        this._canvas = document.getElementById(this._canvasId);
        this._stage  = new createjs.Stage(this._canvas);

        // 特定のAndroid端末（dtab, Android 4.1.2など）で、mouseイベントとtouchイベントが2重に発火する問題の対策
        this._stage.enableDOMEvents(false);

        // stageをタッチした際にも、縦スクロールさせるために、preventSelection(false)と、Touch.enableの第３引数(true)を設定
        // PageContainerに、タッチ角度による縦スクロール判定制限を入れている
        // この設定をいれて、preventDefaultを外さない場合、Android5以上のブラウザにて、ダブルタップなどの判定が悪くなる現象があった
        this._stage.preventSelection = false;
        createjs.Touch.enable(this._stage, false, true);

        comicviewer.Content.stageWidth = this._stage.canvas.width;
        comicviewer.Content.stageHeight = this._stage.canvas.height;
        createjs.Ticker.setFPS(this._getFrameRate());
        createjs.Ticker.addEventListener("tick", createjs.proxy(this._handleTick, this));
        this._loadImage(); 
    }
    p._loadImage = function()
    {
        var loadingBar = new comicviewer.LoadingBar();
        loadingBar.init();
        this._stage.addChild(loadingBar);

        if(this._isHideLoadingBarDevice())
        {
            this._canvas.style.visibility = 'hidden';
        }

        var pageLoader = new comicviewer.PageLoader();
        pageLoader.addEventListener("error", createjs.proxy(function(event){
            pageLoader.removeAllEventListeners();
            pageLoader = null;
            this._stage.removeChild(loadingBar);
            loadingBar = null;
            this._handleError("Image Load Failed");
        }, this));
        pageLoader.addEventListener("progress", createjs.proxy(function(event){
            loadingBar.setProgress(event.ratio);
        }, this));
        pageLoader.addEventListener("complete", createjs.proxy(function(event){
            if(this._isHideLoadingBarDevice())
            {
                this._canvas.style.visibility = 'visible';
            }

            pageLoader.removeAllEventListeners();
            pageLoader = null;

            this._stage.removeChild(loadingBar);
            loadingBar = null;

            this._addViewer(event.images);
        }, this));
        pageLoader.load();
    }
    p._addViewer = function(images)
    {
        // ページ画面
        this._pageContainer = new comicviewer.PageContainer();
        this._pageContainer.init(images);
        this._stage.addChild(this._pageContainer);
        this._pageContainer.x = 0;
        this._pageContainer.y = 0;
        this._pageContainer.addEventListener("last_tap_state_change", createjs.proxy(this._lastTapStateChange, this));
    
        // ページ情報
        this._pageInfo = new comicviewer.PageInfo();
        this._pageInfo.init(this._pageContainer);
        this._stage.addChild(this._pageInfo);
        this._pageInfo.show();
    
        // スライダー
        this._pageSlider = new comicviewer.PageSlider();
        this._pageSlider.init(this._pageContainer);
        this._stage.addChild(this._pageSlider);
        this._pageSlider.show();

        // ナビゲーション
        this._navigation = new comicviewer.Navigation();
        this._navigation.init(this._pageContainer);
        this._stage.addChild(this._navigation);
    }
    p._handleError = function(message)
    {
        alert(message); 
    }
    p._handleTick = function(event)
    {
        this._checkTap();
        this._stage.update();
    }
    p._getFrameRate = function()
    {
        var version = comicviewer.Utils.getAndroidVersion();
        if(version 
        && version < 3)
        {
            return 24;
        }
        return 60;
    }
    p._isHideLoadingBarDevice = function()
    {
        // canvasをいったん非表示にしてロード後に表示しないと、描画が更新されない端末がある
        // ブラウザでは起こらず、アプリでのみ起こる
        // Android4であれば、ローディングバーを出さないようにする
        // http://d.hatena.ne.jp/koba04/20140110/1389344763

        // ※ 再現端末のUA
        // Mozilla/5.0 (Linux; U; Android 4.3; ja-jp; SC-02E Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 tantora-android [2.0.14]
        // Mozilla/5.0 (Linux; U; Android 4.2.2; ja-jp; SHL23 Build/S8201) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 tantora-android [2.0.14]
        // Mozilla/5.0 (Linux; U; Android 4.2.2; ja-jp; SH-07E Build/SA160) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 tantora-android [2.0.14]
        // Mozilla/5.0 (Linux; U; Android 4.2.2; ja-jp; SBM206SH Build/S0022) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 tantora-android [2.0.14]
        // Mozilla/5.0 (Linux; U; Android 4.2.2; ja-jp; SBM302SH Build/S0020) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 tantora-android [2.0.14]

        var version = comicviewer.Utils.getAndroidVersion();
        if(!version)
        {
            return false;
        }
        if(version < 4
        || version >= 5)
        {
            return false;
        }
        return true;
    }
    p._checkTap = function()
    {
        if(this._lastTapStatus 
        && (this._lastTapTime + 300 < (new Date()).getTime()))
        {
            this._lastTapStatus = false;
            switch(this.getTapArea(this._lastTapStageX))
            {
                case 1:
                    // page +1
                    this._pageContainer.moveNextPage();
                    break;
                case 2:
                    this._pageInfo.displayToggle();
                    this._pageSlider.displayToggle();
                    break;
                case 3:
                    // page -1
                    this._pageContainer.movePreviousPage();
                    break;
                case 0:
                default:
                    break;
            }
        }
    }
    p._lastTapStateChange = function(event)
    {
        if(event.lastTapTime != undefined)
        {
            this._lastTapTime = event.lastTapTime;
        }
        if(event.lastTapStatus != undefined)
        {
            this._lastTapStatus = event.lastTapStatus;
        }
        if(event.lastTapStageX != undefined)
        {
            this._lastTapStageX = event.lastTapStageX;
        }
    }
    // 表示エリアを横に三分割した際に、どのエリアにタッチされたか
    p.getTapArea = function(lastTapStageX) 
    {
        var touchThresholdWidth = Math.floor(comicviewer.Content.stageWidth / 3);
        if(lastTapStageX <= 0 
        || lastTapStageX >= comicviewer.Content.stageWidth)
        {
            return 0;
        }
        else if(lastTapStageX < touchThresholdWidth)
        {
            // 左部
            return 1;
        }
        else if(lastTapStageX < (touchThresholdWidth * 2))
        {
            // 中央
            return 2;
        }
        else if(lastTapStageX < (touchThresholdWidth * 3))
        {
            // 右部
            return 3;
        }
        return 0;
    }

    comicviewer.Main = Main;
}());
