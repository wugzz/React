/**
 * Created by wugz on 16/4/16.
 */


var Tab = React.createClass({

    componentDidMount:function(){
        console.log('mount',this.refs.wrapper);
        var width = $(this.refs.tab).width(),
            $wrapper = $(this.refs.wrapper);
            $children = $wrapper.children();
        for(var i=0; i<$children.length; i++){
            $children.eq(i).css({width:width+"px"});
        }
        this.mScroll = new IScroll(this.refs.tab, {snap:true,scrollY:false,scrollX:true});
    },

	render:function(){
        return (<div className="Tab" ref='tab'>
                <div className='wrapper' ref='wrapper'>
                    {this.renderChild(this.props.children)}
                </div>
            </div>);
    },

    renderChild:function(children){

        console.log("-----renderChild", children);
        if(!(children.length > 0)) children = [children];

        return children.map(function(child,i){
            return <div className='item' style={{left:i*100+"%"}}>{child}</div>
        });
    },

 });


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
