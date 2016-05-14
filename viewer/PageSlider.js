this.comicviewer = this.comicviewer||{};
(function() {
    "use strict";

    function PageSlider() 
    {
        this.Container_constructor();

        this._pageContainer = null;
        this._thumb         = null;
        this._slider        = null;
        this._background    = null;
        this._tempPage      = 0;
        this._maxPage       = 0;
        this._sliderMarginW = 20;
        this._thumbSize     = 10;
        this._isDisplay     = false;
        this.alpha          = 0;
        this._touchX        = 0;
        this._thumbX        = 0;
    }
    var p = createjs.extend(PageSlider, createjs.Container);
    p.init = function(pageContainer)
    {
        this._pageContainer = pageContainer;

        var barH    = 40;
        var barW    = comicviewer.Content.stageWidth;
        var barY    = comicviewer.Content.stageHeight - barH;
        var sliderH = 2;

        // 背景
        this._background = new createjs.Shape();
        this._background.graphics.beginFill(createjs.Graphics.getRGB(0x000000, 0.8))
                                 .drawRect(0, 0, barW, barH)
                                 .endFill();
        this.addChild(this._background);

        // スライダー
        this._slider = new createjs.Shape();
        this._slider.graphics.beginFill(createjs.Graphics.getRGB(0xFFFFFF, 0.8))
                             .drawRect(this._sliderMarginW, (barH / 2) - (sliderH / 2), comicviewer.Content.stageWidth - (this._sliderMarginW * 2), sliderH)
                             .endFill();
        this.addChild(this._slider);

        // スライダーサム
        this._thumb = new createjs.Shape();
        this._thumb.graphics.beginFill(createjs.Graphics.getRGB(0xFFFFFF, 1.0))
                            .drawCircle(0, 0, this._thumbSize)
                            .endFill();
        this.addChild(this._thumb);
        this._thumb.y = (barH / 2);

        this.y = barY;

        this._tempPage = this._pageContainer.getTempPage();
        this._maxPage = this._pageContainer.getMaxPage();
        this.updateThumb();

        this._pageContainer.addEventListener("pagechange", createjs.proxy(this.pageChangeHandler, this));
        
        this.addEventListener("mousedown", this.touchStart);
        this.addEventListener("pressmove", this.touchMove);
        this.addEventListener("pressup",   this.touchEnd);
    }
    p.pageChangeHandler = function(event)
    {
        this._tempPage = event.page;
        this.updateThumb();
    }
    p.updatePage = function()
    {
        this._pageContainer.refresh(this._tempPage);
    }
    p.updateThumb = function()
    {
        var unit      = (this.getThumbRightX() - this.getThumbLeftX()) / this._maxPage;
        this._thumb.x = this.getThumbRightX() - (unit * this._tempPage);
    }
    p.getThumbRightX = function()
    {
        return comicviewer.Content.stageWidth - this._sliderMarginW;
    }
    p.getThumbLeftX = function()
    {
        return this._sliderMarginW;
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
    p.changePage = function(targetX)
    {
        // MEMO : approximate judgment
        // http://qiita.com/shuuuuun/items/f0031d710ca50b21177a
        var unit    = (this.getThumbRightX() - this.getThumbLeftX()) / this._maxPage;
        var page    = Math.floor(targetX / unit);
        page        = Math.max(page, 0); 
        page        = Math.min(page, this._maxPage); 
        // MEMO : left and right reversed
        this._tempPage = this._maxPage - page;
    }
    p.touchStart = function(event)
    {
        var instance = event.currentTarget; 
        if(instance._isTweening)
        {
            return;
        }

        instance._touchX  = event.stageX;
        var targetX       = instance._touchX;
        targetX           = Math.max(targetX, instance.getThumbLeftX()); 
        targetX           = Math.min(targetX, instance.getThumbRightX()); 
        instance._thumb.x = targetX;
        instance._thumbX  = instance._thumb.x;

        event.stopImmediatePropagation();
    }
    p.touchMove = function(event)
    {
        var instance = event.currentTarget; 
        if(instance._isTweening)
        {
            return;
        }

        var targetX = instance._thumbX + (event.stageX - instance._touchX);
        instance.changePage(targetX);
        instance.updatePage();

        event.stopImmediatePropagation();
    }
    p.touchEnd = function(event)
    {
        var instance = event.currentTarget; 
        if(instance._isTweening)
        {
            return;
        }

        var targetX = instance._thumbX + (event.stageX - instance._touchX);
        instance.changePage(targetX);
        instance.updatePage();

        event.stopImmediatePropagation();
    }

    comicviewer.PageSlider = createjs.promote(PageSlider, "Container");  
}());
