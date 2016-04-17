/**
 * Created by wugz on 16/4/16.
 */

var MixinScroll = {

    rAF:window.requestAnimationFrame	||
        window.webkitRequestAnimationFrame	||
        window.mozRequestAnimationFrame		||
        window.oRequestAnimationFrame		||
        window.msRequestAnimationFrame		||
        function (callback) { window.setTimeout(callback, 1000 / 60); },

    //获取事件接口
    getTime: Date.now || function getTime () { return new Date().getTime(); },

    _animate: function (destX, destY, duration, easingFn) {
        var that = this,
            startX = this.x,
            startY = this.y,
            startTime = this.getTime(),
            destTime = startTime + duration;

        function step () {
            var now = this.getTime(),
                newX, newY,
                easing;

            if ( now >= destTime ) {
                that.isAnimating = false;
                that._translate(destX, destY);

                if ( !that.resetPosition(that.options.bounceTime) ) {
                    that._execEvent('scrollEnd');
                }

                return;
            }

            now = ( now - startTime ) / duration;
            easing = easingFn(now);
            newX = ( destX - startX ) * easing + startX;
            newY = ( destY - startY ) * easing + startY;
            this._translate(newX, newY);

            if ( that.isAnimating ) {
                this.rAF(step);
            }
        }

        this.isAnimating = true;
        step();
    },

    _translate: function (x, y) {
        if ( this.options.useTransform ) {

            /* REPLACE START: _translate */

            this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;

            /* REPLACE END: _translate */

        } else {
            x = Math.round(x);
            y = Math.round(y);
            this.scrollerStyle.left = x + 'px';
            this.scrollerStyle.top = y + 'px';
        }

        this.x = x;
        this.y = y;

    },
}

var Scroll = React.createClass({

    componentDidMount:function(){
        this.mScroll = new IScroll(this.refs.Scroll);
    },

    render:function(){
        return <div className="Scroll" {...this.getEvents()} ref="Scroll">
            <div className="ScrollStyle">
                {this.props.children}
            </div>
        </div>;
    },

    /**
     * 获取注册事件
     * @returns {{onTouchStart: *, onTouchMove: *, onTouchEnd: *, onTouchCancel: *}}
     */
    getEvents:function(){
        return {
            onTouchStart:this._start,
            onTouchMove:this._move,
            onTouchEnd:this._end,
            onTouchCancel:this._end,
        }
    },

    ///**
    // * 监听touchStart
    // * @param e
    // * @private
    // */
    //_start:function(e){
    //    console.log("_start", e.touches);
    //},
    //
    ///**
    // * 监听touchMove
    // * @param e
    // * @private
    // */
    //_move:function(e){
    //    console.log("_move",e.touches);
    //    var point = e.touches?e.touches[0]:e;
    //},
    //
    ///**
    // * 监听touchEnd
    // * @param e
    // * @private
    // */
    //_end:function(e){
    //    //console.log("_move", e);
    //},
});
