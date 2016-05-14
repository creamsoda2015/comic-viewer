this.comicviewer = this.comicviewer||{};
(function() {
    "use strict";

    function Navigation() 
    {
        this.Container_constructor();

        this._pageContainer  = null;
        this._background     = null;
        this._linkButton     = null;
        this._linkURL        = null;
        this._linkText       = null;
        this._isDisplay      = false;
        this.alpha           = 0;
    }
    var p = createjs.extend(Navigation, createjs.Container);
    p.init = function(pageContainer)
    {
        this._pageContainer = pageContainer;

        this._addInfoText();
        this._addLinkButton();

        this._pageContainer.addEventListener("pagechange", createjs.proxy(this.pageChange, this));
    }
    p._addInfoText = function()
    {
        // MEMO : テキスト改行記号入れて、１つのテキストにしたいが、左に寄ってしまうため、別々の２つのテキストにしている
        var episodeId = comicviewer.Content.episodeId;
        var upperText = new createjs.Text("episode " + episodeId + "is end","16px sans-serif","#000000");
        upperText.textAlign   = "center";
        upperText.textBaseline = "middle";
        upperText.x = comicviewer.Content.stageWidth / 2;
        upperText.y = comicviewer.Content.stageHeight / 3 - 20;
        this.addChild(upperText);

        var episodeId = comicviewer.Content.episodeId;
        var lowerText = new createjs.Text(comicviewer.Content.lastPageText,"16px sans-serif","#000000");
        lowerText.textAlign   = "center";
        lowerText.textBaseline = "middle";
        lowerText.x = comicviewer.Content.stageWidth / 2;
        lowerText.y = comicviewer.Content.stageHeight / 3 + 20;
        this.addChild(lowerText);
    }
    p._addLinkButton = function()
    {
        this._linkButton = new createjs.Container();

        // MEMO : コンテナの座標が0,0だが、ボタン自体の座標を変えたほうが良い
        var backWidth = 200;
        var backHeight = 50;

        var backX = (comicviewer.Content.stageWidth - backWidth) / 2;
        var backY = (comicviewer.Content.stageHeight - backHeight) / 2;

        this._background = new createjs.Shape();
        this._background.graphics.beginFill(createjs.Graphics.getRGB(0x000000, 0.8))
        this._background.graphics.drawRoundRect(0, 0, backWidth, backHeight, 6, 6);
        this._background.graphics.endFill();
        this._linkButton.addChild(this._background);

        this._background.x = backX;
        this._background.y = backY;

        this._linkText = new createjs.Text("back","14px Arial","#FFFFFF");
        this._linkButton.addChild(this._linkText);
        this._linkText.x = backX + ((backWidth - this._linkText.getMeasuredWidth()) / 2);
        this._linkText.y = backY + ((backHeight - this._linkText.getMeasuredHeight()) / 2);

        this.addChild(this._linkButton);

        this._linkButton.addEventListener("pressup", function(event){
            var instance = event.currentTarget;
            var linkURL = instance.parent.getLinkURL();
            if(linkURL)
            {
                window.location = linkURL;
            }
            event.stopImmediatePropagation();
        });
    }
    p.pageChange = function()
    {
        if(this._pageContainer.getTempPage() == this._pageContainer.getMaxPage())
        {
            this.show();
        }
        else
        {
            this.hide();
        }
    }
    p.getLinkURL = function()
    {
        return "/comic-viewer1";
    }
    p.displayToggle = function()
    {
        if(this._isDisplay)
        {
            this.hide();
        }
        else
        {
            this.show();
        }
    }
    p.show = function()
    {
        if(this._isDisplay)
        {
            return;
        }
        this._isDisplay = true;
        createjs.Tween.get(this)
                      .to({alpha:1.0}, 100, createjs.Ease.linear);
    }
    p.hide = function()
    {
        if(!this._isDisplay)
        {
            return;
        }
        this._isDisplay = false;
        createjs.Tween.get(this)
                      .to({alpha:0}, 100, createjs.Ease.linear);
    }
    comicviewer.Navigation = createjs.promote(Navigation, "Container");  
}());
