this.comicviewer = this.comicviewer||{};
(function() {
    "use strict";

    function PageContainer() 
    {
        this.Container_constructor();

        this._stageWidth     = comicviewer.Content.stageWidth;
        this._stageHeight    = comicviewer.Content.stageHeight;
        this._imageWidth     = comicviewer.Content.imageWidth;
        this._imageHeight    = comicviewer.Content.imageHeight;
        this._tempPage       = 0;
        this._maxPage        = 0;
        this._imageList      = [];
        this._touchX         = 0;
        this._containerX     = 0;
        this._isPress        = false;
        this._isTweening     = false;
        this._pageOffset     = 0;
        this._leftPage       = null;
        this._rightPage      = null;
        this._centerPage     = null;
        this._touchY         = 0;
        this._containerY     = 0;
        this._touchStartTime = 0;

    }
    var p = createjs.extend(PageContainer, createjs.Container);
    p.init = function(images)
    {
        this._imageList  = images;
        this._maxPage    = (this._imageList.length - 1);
        // MEMO : center layer is the most front layer.
        this._leftPage   = new comicviewer.Page();
        this._rightPage  = new comicviewer.Page();
        this._centerPage = new comicviewer.Page();
        this._leftPage.init(this);
        this._rightPage.init(this);
        this._centerPage.init(this);
        this._centerPage.setEnableZoom(true);
        this._leftPage.addSpriteSheet(images);
        this._rightPage.addSpriteSheet(images);
        this._centerPage.addSpriteSheet(images);
        this.addChild(this._leftPage);
        this.addChild(this._rightPage);
        this.addChild(this._centerPage);
        this._leftPage.x   = -this._stageWidth;
        this._leftPage.y   = 0;
        this._centerPage.x = 0;
        this._centerPage.y = 0;
        this._rightPage.x  = this._stageWidth;
        this._rightPage.y  = 0;
        this._afterZoomUp  = false;
        this.updatePage();
        this._centerPage.addEventListener("last_tap_state_change", createjs.proxy(this.lastTapStateChange, this));
        this.addEventListener("pagechange", createjs.proxy(this.pageChange, this));
        this.addEventListener("mousedown", this.touchStart);
        this.addEventListener("pressmove", this.touchMove);
        this.addEventListener("pressup",   this.touchEnd);
    }
    p.lastTapStateChange = function(event)
    {
        var e = new createjs.Event("last_tap_state_change");
        e.lastTapStatus = event.lastTapStatus;
        e.lastTapTime   = event.lastTapTime;
        e.lastTapStageX = event.lastTapStageX;
        this.dispatchEvent(e);
    }
    p.touchStart = function(event)
    {
        var instance = event.currentTarget; 

        if(!instance.isPrimary(event))
        {
            return;
        }

        if(instance.getIsTweening() 
        || instance._centerPage.getIsTweening())
        {
            return;
        }

        instance._touchStartTime = event.timeStamp;

        instance._touchX = event.stageX;
        instance._touchY = event.stageY;
        instance._containerX = event.currentTarget.x;
        instance._containerY = event.currentTarget.y;
    }
    p.touchMove = function(event)
    {
        var instance = event.currentTarget; 
        if(!instance.isPrimary(event))
        {
            return;
        }

        if(instance.getIsTweening() 
        || instance._centerPage.getIsTweening())
        {
            return;
        }

        var e = new createjs.Event("last_tap_state_change");
        e.lastTapStatus = false;
        instance.dispatchEvent(e);
        if(instance._centerPage.getZoomUp())
        {
            if(instance._centerPage.x < 0 && instance._centerPage.x > -instance._stageWidth)
            {
                instance._touchX = event.stageX;
                return;
            }
        }

        var targetX = instance._containerX + (event.stageX - instance._touchX);
        var targetY = instance._containerY + (event.stageY - instance._touchY);

        // MEMO : vertical touch move allows vertical scroll.
        var threshold = 30;
        if(Math.abs(targetX / targetY) > Math.tan(threshold * (Math.PI / 180)))
        {
            if(event.nativeEvent.cancelable)
            {
                event.preventDefault();
                event.nativeEvent.preventDefault();
            }
        }

        if(instance._tempPage <= 0)
        {
            targetX = Math.max(targetX, 0);
        }
        if(instance._tempPage >= instance._maxPage)
        {
            targetX = Math.min(targetX, 0);
        }

        instance.x = targetX;
    }
    p.touchEnd = function(event)
    {
        var instance = event.currentTarget; 
        if(!instance.isPrimary(event))
        {
            return;
        }

        if(instance.getIsTweening() 
        || instance._centerPage.getIsTweening())
        {
            return;
        }

        // same position
        if(instance.x == instance._containerX)
        {
            return;
        }

        // flick judgement
        var diffX = instance._touchX - event.stageX;
        if((event.timeStamp - instance._touchStartTime) < 400 
        && diffX != 0 
        && Math.abs(diffX) < 300)
        {
            if(diffX < 0)
            {

                instance.moveNextPage();
            }
            else
            {

                instance.movePreviousPage();
            }

            return;
        }

        switch(instance.getSlideArea(event))
        {
            case 1:
                instance._isTweening = true;
                instance._pageOffset = -1;
                createjs.Tween.get(instance)
                              .to({x: -instance._stageWidth}, 200, createjs.Ease.easeOut)
                              .call(instance.tweenComplete);

                if(instance._centerPage.getZoomUp())
                {
                    instance._centerPage.zoomTween();
                }
                break;
            case 2:
                instance._isTweening = true;
                instance._pageOffset = 0;
                createjs.Tween.get(instance)
                              .to({x: 0}, 200, createjs.Ease.easeOut)
                              .call(instance.tweenComplete);
                break;
            case 3:
                instance._isTweening = true;
                instance._pageOffset = 1;
                createjs.Tween.get(instance)
                              .to({x: instance._stageWidth}, 200, createjs.Ease.easeOut)
                              .call(instance.tweenComplete);

                if(instance._centerPage.getZoomUp())
                {
                    instance._centerPage.zoomTween();
                }
                break;
            case 0:
            default:
                break;
        }
    }
    p.tweenComplete = function(event)
    {
        var instance = event.target;
        instance.x = 0;
        instance._tempPage += instance._pageOffset;
        instance._tempPage  = Math.min(instance._tempPage, instance._maxPage);
        instance._tempPage  = Math.max(instance._tempPage, 0);
        instance.resetDoubleTap();
        instance.updatePage();
        var e = new createjs.Event("pagechange");
        e.page = instance._tempPage;
        instance.dispatchEvent(e);
        instance._isTweening = false;
    }
    p.moveNextPage = function() 
    {
        if(this._tempPage >= this._maxPage)
        {
            return;
        }

        this._isTweening = true;
        this._pageOffset = 1;
        createjs.Tween.get(this)
                      .to({x: this._stageWidth}, 200, createjs.Ease.easeOut)
                      .call(this.tweenComplete);

        if(this._centerPage.getZoomUp())
        {
            this._centerPage.zoomTween();
        }
    }
    p.movePreviousPage = function() 
    {
        if(this._tempPage <= 0)
        {
            return;
        }

        this._isTweening = true;
        this._pageOffset = -1;
        createjs.Tween.get(this)
                      .to({x: -this._stageWidth}, 200, createjs.Ease.easeOut)
                      .call(this.tweenComplete);

        if(this._centerPage.getZoomUp())
        {
            this._centerPage.zoomTween();
        }
    }
    p.getSlideArea = function(event) 
    {
        var instance = event.currentTarget; 
        var slideThresholdWidth = Math.floor(instance._stageWidth / 4);
        if(instance._centerPage.getZoomUp())
        {
            slideThresholdWidth = Math.floor(instance._stageWidth / 3)
        }

        if(instance.x < -slideThresholdWidth)
        {
            // left area
            return 1;
        }
        else if(instance.x > slideThresholdWidth)
        {
            // right area
            return 3;
        }

        // center area
        return 2;
    }
    p.getTempPage = function() 
    {
        return this._tempPage;
    }
    p.getMaxPage = function() 
    {
        return this._maxPage;
    }
    p.getIsTweening = function() 
    {
        return this._isTweening;
    }
    p.isPrimary = function(event) 
    {
        return event.primary;
    }
    p.pageChange = function(event)
    {
        this._tempPage = event.page;
        this.updatePage();
    }
    p.refresh = function(page) 
    {
        var e = new createjs.Event("pagechange");
        e.page = page;
        this.dispatchEvent(e);
    }
    p.updatePage = function() 
    {
        this._leftPage.updatePage(Math.min(this._tempPage + 1, this._maxPage));
        this._rightPage.updatePage(Math.max(this._tempPage - 1, 0));
        this._centerPage.updatePage(this._tempPage);
    }
    p.resetPages = function() 
    {
        // this._leftPage.reset();
        this._centerPage.reset();
        // this._rightPage.reset();
    }
    p.resetDoubleTap = function() 
    {
        // this._leftPage.resetDoubleTap();
        this._centerPage.resetDoubleTap();
        // this._rightPage.resetDoubleTap();
    }

    comicviewer.PageContainer = createjs.promote(PageContainer, "Container");  
}());
