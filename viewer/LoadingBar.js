this.comicviewer = this.comicviewer||{};
(function() {
    "use strict";

    function LoadingBar() 
    {
        this.Container_constructor();

        this._pageContainer = null;
        this._stageWidth    = comicviewer.Content.stageWidth;
        this._stageHeight   = comicviewer.Content.stageHeight;
        this._loadingBar    = null;
        this._barShape      = null;
        this._barW          = this._stageWidth - 60;
        this._barShape      = null;
        this._isDisplay     = false;
    }
    var p = createjs.extend(LoadingBar, createjs.Container);
    p.init = function()
    {
        var color          = createjs.Graphics.getRGB(0xBBBBBB, 1.0)
        var shape          = new createjs.Shape();
        var padding        = 3;
        this._loadingBar   = new createjs.Container();
        var barH           = 8;
        this._barW         = this._stageWidth - 60;
        this._barShape     = new createjs.Shape();
        this._barShape.graphics.beginFill(color).drawRect(0, 0, 1, barH).endFill();
        shape.graphics.setStrokeStyle(1).beginStroke(color).drawRect(-padding / 2, -padding / 2, this._barW + padding, barH + padding);
        this._loadingBar.addChild(this._barShape, shape);
        this._loadingBar.x = Math.round(this._stageWidth / 2 - this._barW / 2);
        this._loadingBar.y = Math.round(this._stageHeight / 2 - barH / 2);
        this.addChild(this._loadingBar);
    }
    p.show = function()
    {
        this._isDisplay = true;
        createjs.Tween.get(this)
                      .to({alpha:1.0}, 300, createjs.Ease.linear);
    }
    p.hide = function()
    {
        this._isDisplay = false;
        createjs.Tween.get(this)
                      .to({alpha:0}, 300, createjs.Ease.linear);
    }
    p.setProgress = function(ratio)
    {
        this._barShape.scaleX = ratio * this._barW;
    }

    comicviewer.LoadingBar = createjs.promote(LoadingBar, "Container");  
}());
