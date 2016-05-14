this.comicviewer = this.comicviewer||{};
(function() {
    "use strict";

    function Page() 
    {
        this.Container_constructor();

        this._stageWidth    = comicviewer.Content.stageWidth;
        this._stageHeight   = comicviewer.Content.stageHeight;
        this._imageWidth    = comicviewer.Content.imageWidth;
        this._imageHeight   = comicviewer.Content.imageHeight;
        this._pageContainer = null;
        this._sheetSprite   = null;
        this._lastTapTime   = 0;
        this._lastTapX      = 0;
        this._lastTapY      = 0;
        this._touchX        = 0;
        this._touchY        = 0;
        this._containerX    = 0;
        this._containerY    = 0;
        this._enableZoom    = false;
        this._isTweening    = false;
        this._isZoomUp      = false;
        this._afterZoomUp   = false;
    }
    var p = createjs.extend(Page, createjs.Container);
    p.init = function(pageContainer)
    {
        this._pageContainer = pageContainer;
        
        this.addEventListener("mousedown", this.touchStart);
        this.addEventListener("pressmove", this.touchMove);
        this.addEventListener("pressup",   this.touchEnd);

        // MEMO : Even if touch enabled, 'dblclick' is can not be user for 'double tap' detection.
        // http://www.kuma-de.com/blog/2013-07-13/5643
    }
    p.addSpriteSheet = function(images) 
    {
        var spriteSheet = new createjs.SpriteSheet({
            images: images,
            frames: { width: this._imageWidth, height: this._imageHeight, count: comicviewer.Content.maxPageOB }
        });
        this._sheetSprite = new createjs.Sprite(spriteSheet);
        this._sheetSprite.scaleX = this._sheetSprite.scaleY = 0.5;

        this.addChild(this._sheetSprite);
    }
    p.setEnableZoom = function(enable) 
    {
        this._enableZoom = enable;
    }
    p.getZoomUp = function() 
    {
        return this._isZoomUp;
    }
    p.getIsTweening = function() 
    {
        return this._isTweening;
    }
    p.isPrimary = function(event) 
    {
        return event.primary;
    }
    p.updatePage = function(page) 
    {
        // createjs spriteSheetのgotoAndStop frame is start at 0 not 1.
        this._sheetSprite.gotoAndStop(page); 
    }
    p.touchStart = function(event)
    {
        var instance = event.currentTarget; 
        if(!instance.isPrimary(event))
        {
            return;
        }

        var e = new createjs.Event("last_tap_state_change");
        e.lastTapTime   = event.timeStamp;
        e.lastTapStatus = true;
        e.lastTapStageX = event.stageX;
        instance.dispatchEvent(e);

        if(instance.getIsTweening() 
        || instance._pageContainer.getIsTweening())
        {
            return;
        }

        if(instance._isZoomUp)
        {
            instance._touchX = event.stageX;
            instance._touchY = event.stageY;
            instance._containerX = event.currentTarget.x;
            instance._containerY = event.currentTarget.y;
        }
    }
    p.touchMove = function(event)
    {
        var instance = event.currentTarget; 

// pinch
/*
if(!event.primary)
{
// comicviewer.Utils.dlog(event.pointerID);

        if(!instance.getIsTweening() && !instance._pageContainer.getIsTweening())
        {
            instance._touchX = event.stageX;
            instance._touchY = event.stageY;

            instance.zoomTween();
            return;
        }
}
*/

        if(!instance.isPrimary(event))
        {
            return;
        }

        var e = new createjs.Event("last_tap_state_change");
        e.lastTapStatus = false;
        instance.dispatchEvent(e);

        if(instance.getIsTweening() 
        || instance._pageContainer.getIsTweening())
        {
            return;
        }

        if(instance._isZoomUp)
        {
            var targetX = instance._containerX + (event.stageX - instance._touchX);
            var targetY = instance._containerY + (event.stageY - instance._touchY);

            targetX = Math.min(targetX, 0);
            targetY = Math.min(targetY, 0);

            targetX = Math.max(targetX, -instance._stageWidth);
            targetY = Math.max(targetY, -instance._stageHeight);

            instance.x = targetX;
            instance.y = targetY;

            // ページのスクロール時に、タップ判定が入っても、ダブルタップにならないようにするため
            instance.resetDoubleTap();

            // 拡大時に縦スクロールしないようにするため
            event.preventDefault();
            event.nativeEvent.preventDefault();
        }
    }
    p.touchEnd = function(event)
    {
        var instance = event.currentTarget; 
        if(!instance.isPrimary(event))
        {
            return;
        }

        if(instance.getIsTweening() 
        || instance._pageContainer.getIsTweening())
        {
            return;
        }

        instance._touchX = event.stageX;
        instance._touchY = event.stageY;

        // centerしかscaleしないので、フラグ入れて、他のPageはそもそも反応しないようにしていい
        if(instance.isDoubleTap(event))
        {
            instance.zoomTween();
        }

        instance._lastTapTime = event.timeStamp;
        instance._lastTapX = event.stageX;
        instance._lastTapY = event.stageY;
    }

    p.zoomTween = function()
    {
        this._isTweening = true;

        var e = new createjs.Event("last_tap_state_change");
        e.lastTapStatus = false;
        this.dispatchEvent(e);

        // tweeen後に、変化するページ量。
        // MEMO : tweenが引数渡せれば不要
        this._afterZoomUp = false;
        
        var tweenParam = {};
        var targetScale = 1;
        var targetX = 0, targetY = 0;
        if(!this._isZoomUp)
        {
            targetScale = 2;

            // タップしたポイントを、中央に拡大してほしい場合、タッチしたポイントの原点を中央にする
            // targetX = -(event.stageX - (this._imageWidth / 2)) * targetScale;
            // targetY = -(event.stageY - (this._imageHeight / 2)) * targetScale;

            // タップしたポイントが維持されるように拡大してほしい場合
            targetX = -(this._stageWidth * (this._touchX / this._stageWidth));
            targetY = -(this._stageHeight * (this._touchY / this._stageHeight));

            targetX = Math.min(targetX, 0);
            targetY = Math.min(targetY, 0);

            targetX = Math.max(targetX, -this._stageWidth);
            targetY = Math.max(targetY, -this._stageHeight);

            this._afterZoomUp = true;
        }

        tweenParam.x      = targetX;
        tweenParam.y      = targetY;
        tweenParam.scaleX = targetScale;
        tweenParam.scaleY = targetScale;

        createjs.Tween.get(this)
                      .to(tweenParam, 200, createjs.Ease.easeOut)
                      .call(this.scaleTweenComplete);

    }
    p.scaleTweenComplete = function(event)
    {
        var instance = event.target;
        instance._isZoomUp = instance._afterZoomUp;
        instance._isTweening = false;
        if(!instance._isZoomUp)
        {
            instance.reset();
        }
    }
    p.isDoubleTap = function(event)
    {
        var instance = event.currentTarget; 

        if(!instance._enableZoom)
        {
            return false;
        }

        var flag = false;
        
        if(!instance._lastTapTime
        || !instance._lastTapX 
        || !instance._lastTapY)
        {
            return false;
        }

        if(event.timeStamp - instance._lastTapTime < 450
        && (Math.pow(event.stageX - instance._lastTapX, 2) + Math.pow(event.stageY - instance._lastTapY, 2)) < Math.pow(30, 2))
        {
            return true;
        }
        return false;
    }
    p.reset = function()
    {
        this.x = this.y = 0;
        this.scaleX = this.scaleY = 1;
    }
    p.resetDoubleTap = function()
    {
        this._lastTapTime = 0;
        this._lastTapX = 0;
        this._lastTapY = 0;
    }

    comicviewer.Page = createjs.promote(Page, "Container");  
}());
