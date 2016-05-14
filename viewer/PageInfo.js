this.comicviewer = this.comicviewer||{};
(function() {
    "use strict";

    function PageInfo() 
    {
        this.Container_constructor();

        this._info           = null;
        this._pageContainer  = null;
        this._background     = null;
        this._pageNumberText = null;
        this._helpShape      = null;
        this._helpButton     = null;
        this._helpArea       = null;
        this._barWidth       = 0;
        this._barHeight      = 0;
        this._isDisplay      = false;
        this.alpha           = 0;
    }
    var p = createjs.extend(PageInfo, createjs.Container);
    p.init = function(pageContainer)
    {
        this._pageContainer = pageContainer;

        this._addBackground();
        this._addTitleText();
        this._addPageNumberText();
        this._addHelpButton();
        this._addHelpArea();

        this.x = 0;
        this.y = 0;

        this._pageContainer.addEventListener("pagechange", createjs.proxy(this.pageChange, this));

        this._background.addEventListener("pressup", function(event){
            window.scrollTo(0,0);
            event.stopImmediatePropagation();
        });
    }
    p._addBackground = function()
    {
        var barY = 0;
        this._barWidth = comicviewer.Content.stageWidth;
        this._barHeight = 40;
        this._background = new createjs.Shape();
        this._background.graphics.beginFill(createjs.Graphics.getRGB(0x000000, 0.8)).drawRect(0, barY, this._barWidth, this._barHeight).endFill();
        this.addChild(this._background);
    }
    p._addTitleText = function()
    {
        var text = new createjs.Text(comicviewer.Content.episodeTitle,"14px Arial","#BBBBBB");
        text.x   = 8;
        text.y   = 13;
        this.addChild(text);
    }
    p._addPageNumberText = function()
    {
        var tempPage = this._pageContainer.getTempPage();
        var maxPage = this._pageContainer.getMaxPage();
        this._pageNumberText = new createjs.Text(this.getPageInfoText(tempPage,maxPage),"14px Arial","#BBBBBB");
        this._pageNumberText.textAlign = "right";
        this._pageNumberText.x = comicviewer.Content.stageWidth - 20 - 24;
        this._pageNumberText.y = 12;
        this.addChild(this._pageNumberText);
    }
    p._addHelpButton = function()
    {
        this._helpButton = new createjs.Container();

        this._helpShape = new createjs.Shape();
        this._helpShape.graphics.beginFill("#BBBBBB");
        this._helpShape.graphics.drawCircle(0,0,10);
        this._helpShape.x = comicviewer.Content.stageWidth - 20;
        this._helpShape.y = this._barHeight / 2;
        this._helpShape.graphics.endFill();
        this._helpButton.addChild(this._helpShape);

        var text = new createjs.Text("?","14px Arial","#000000");
        text.textAlign   = "center";
        text.textBaseline = "middle";
        text.x = comicviewer.Content.stageWidth - 20;
        text.y = this._barHeight / 2;
        this._helpButton.addChild(text);

        // MEMO : hitArea is effective, if it's not added by addChild.
        var hitAreaShape = new createjs.Shape();
        hitAreaShape.graphics.beginFill("#FFFF00");
        hitAreaShape.graphics.drawRect(0,0,this._barHeight,this._barHeight);
        hitAreaShape.x = comicviewer.Content.stageWidth - this._barHeight;
        hitAreaShape.y = 0;
        hitAreaShape.graphics.endFill();
        this._helpButton.hitArea = hitAreaShape;

        this._helpButton.addEventListener("pressup", function(event){

            var instance = event.currentTarget;
            instance.parent.displayHelpToggle();

            event.stopImmediatePropagation();
        });

        this.addChild(this._helpButton);
    }
    p._addHelpArea = function()
    {
        this._helpArea = new createjs.Container();

        var unitWidth  = (comicviewer.Content.stageWidth) / 3;
        var areaY = this._barHeight + 10 + 30 + 70;

        var areaWidth  = ((comicviewer.Content.stageWidth - 40) / 3);
        var areaHeight = comicviewer.Content.stageHeight - (this._barHeight * 2) - 20 - 30 - 70;

        var titleArea = new createjs.Shape();
        titleArea.graphics.beginFill(createjs.Graphics.getRGB(0x478bf9, 0.9));
        titleArea.graphics.drawRoundRect(0, 0, comicviewer.Content.stageWidth - 20, 30, 3, 3);
        titleArea.graphics.endFill();
        this._helpArea.addChild(titleArea);

        titleArea.x = 10
        titleArea.y = this._barHeight + 10;

        var titleText           = new createjs.Text("Manual","16px Arial","#FFFFFF");
        titleText.textAlign    = "center";
        titleText.textBaseline = "middle";
        titleText.x = comicviewer.Content.stageWidth / 2;
        titleText.y = this._barHeight + 26;
        this._helpArea.addChild(titleText);

        this.addChild(this._helpArea);
    }
    p.getPageInfoText = function(tempPage, maxPage)
    {
        var dispTemp = tempPage + 1;
        var dispMax = maxPage + 1;
        return dispTemp + " / " + dispMax;
    }
    p.pageChange = function()
    {
        this._pageNumberText.text = this.getPageInfoText(this._pageContainer.getTempPage(), this._pageContainer.getMaxPage());

        if(this._helpArea.alpha == 1)
        {
            this._helpArea.alpha = 0;
        }
    }
    p.displayHelpToggle = function()
    {
        if(this._helpArea.alpha)
        {
            this._helpArea.alpha = 0;
        }
        else
        {
            this._helpArea.alpha = 1;
        }
    }
    p.displayToggle = function()
    {
        // MEMO : alpha property
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
        this._isDisplay = true;
        createjs.Tween.get(this)
                      .to({alpha:1.0}, 300, createjs.Ease.linear);
    }
    p.hide = function()
    {
        this._isDisplay = false;
        createjs.Tween.get(this)
                      .to({alpha:0}, 300, createjs.Ease.linear)
                      .call(this._hideComplete);
    }
    p._hideComplete = function(event)
    {
        var instance = event.target;
        instance._helpArea.alpha = 0;
    }

    comicviewer.PageInfo = createjs.promote(PageInfo, "Container");  
}());
