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

console.log("111111");


var Scroll = React.createClass({

    componentDidMount:function(){
        this.pullDownOffset = this.refs.pullDown.offsetHeight;
        this.pullUpOffset = this.refs.pullUp.offsetHeight;
        console.log("------",this.pullDownOffset,this.pullUpOffset);
        this.mScroll = new IScroll(this.refs.Scroll, {topOffset:this.pullDownOffset,bottomOffset:this.pullUpOffset});
        // console.log(this.mScroll.maxScrollY);

        // console.log(this.mScroll.mixScrollY, this.pullDownOffset);
        // this.mScroll.minScrollY -= this.pullDownOffset;
        // this.mScroll.maxScrollY += this.pullUpOffset;
        this.mScroll.on("scrollStart", this.scrollStart);
        this.mScroll.on("scrollMove", this.scrollMove);
        this.mScroll.on("scrollEnd", this.scrollEnd);
    },

    scrollMove:function(x, y){
        // console.log("----scrollMove", x, y,this.mScroll);

        var mScroll = this.mScroll,
            pullDown = this.refs.pullDown,
            pullUp = this.refs.pullUp;

        if (y > 30 && !pullDown.className.match('flip') && !pullDown.className.match('loading')) {
            pullDown.className = 'flip';
            pullDown.innerHTML = '松手开始更新...';
            mScroll.minScrollY = 0;
        } else if (y < 30 && pullDown.className.match('flip') && !pullDown.className.match('loading')) {
            pullDown.className = '';
            pullDown.innerHTML = '下拉刷新...';
            mScroll.minScrollY = -this.pullDownOffset;
        } else if (y < (mScroll.maxScrollY - 30) && !pullUp.className.match('flip') && !pullUp.className.match('loading')) {
            pullUp.className = 'flip';
            pullUp.innerHTML = '松手开始更新...';
            mScroll.maxScrollY = mScroll.maxScrollY-this.pullUpOffset;
        } else if (y > (mScroll.maxScrollY + 30) && pullUp.className.match('flip') && !pullUp.className.match('loading')) {
            pullUp.className = '';
            pullUp.innerHTML = '上拉加载更多...';
            // mScroll.maxScrollY = this.pullUpOffset;
        }
    },

    scrollStart:function(){
        console.log("----zoomStart",this.mScroll);
    },

    changeState:function(ui, cls, html){
        ui.className = cls;
        ui.innerHTML = html;
    },

    scrollEnd:function(){
        console.log("----zoomEnd", this.mScroll);
        var pullDown = this.refs.pullDown,
            pullUp = this.refs.pullUp;
        if (pullDown.className.match('flip')) {
            pullDown.className = 'loading';
            pullDown.innerHTML = '加载中...';
            // pullDownAction();   // ajax call
        } else if (pullUp.className.match('flip')) {
            pullUp.className = 'loading';
            pullUp.innerHTML = '加载中...';
            // pullUpAction(); // ajax call
        }
    },

    refresh:function(){
        var pullDown = this.refs.pullDown,
            pullUp = this.refs.pullUp;
        this.mScroll.minScrollY = -this.pullDownOffset;
        this.mScroll.maxScrollY += this.pullUpOffset;
        pullDown.className = '';
        pullUp.className = '';
        this.mScroll.refresh();
    },

    render:function(){
        return <div className="Scroll" ref="Scroll">
            <div className="ScrollStyle">
                <div ref="pullDown">下拉刷新</div>
                {this.props.children}
                <div ref="pullUp">加载更多</div>
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
