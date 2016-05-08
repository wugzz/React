/**
 * Created by wugz on 2016/4/18.
 */
/**
 * Created by wugz on 16/4/16.
 */
var ReactTransitionGroup = React.addons.CSSTransitionGroup;
var TransitionGroup = React.addons.TransitionGroup;
var VEffects = Velocity.RegisterEffect.packagedEffects;
var PropTypes = React.PropTypes;
var IPropTypes = ImmutablePropTypes;


/**
 * Created by wugz on 2016/5/3.
 */
/**
 * URL加载文件
 */
var URL = React.createClass({

    propTypes:{
        //按需加载的资源文件
        source:IPropTypes.list,
    },

    getDefaultProps(){
        return {
            js:[],
            css:[],
            source:[],
        }
    },

    render(){
        return (<div ref='url'>
        </div>);
    },

    componentDidMount(){
        //try{
            $(this.refs.url).append(this.loadSource());
        //}catch (e){
        //    console.log('------e--------',e)
        //}
    },


    loadSource(){
        return this.props.source.map(function(name){
            name +='?ver='+jjVersion.v;
            if(name.indexOf('.js')>0)
                return this.loadJs(name);
            else
                return this.loadCss(name);
        }.bind(this)).join('');
    },



    /**
     *加载JS
     */
    loadJs(name){
        return ('<script type="text/javascript" src="react/src/'+name+'"><\/script>');
    },

    /**
     *加载CSS
     */
    loadCss(name){
        return ('<link rel="stylesheet" href="react/css/'+name+'" \/>');
    },
});

var Textarea = React.createClass({

    propTypes:{
        autoHeight: PropTypes.bool,
        className: PropTypes.string,
        onChange: PropTypes.func,
        placeholder: PropTypes.string,
        rows: PropTypes.number,
        style: PropTypes.object,
        trigger: PropTypes.string,
        value: PropTypes.any
    },

    getDefaultProps(){
        return {
            style: {},
            rows: 1,
            trigger: 'blur',
            value: ''
        }
    },

    getInitialState:function(){
        return {
            value : this.props.value,
            rows: this.props.rows
        }
    },

    componentDidMount:function(){
        var el = this.element;

        if(this.props.autoHeight){
            this.lineHeight = MixUtils.getLineHeight(el);
            this.paddingHeight = parseInt(MixUtils.computedStyle(el, 'paddingTop')) +
                parseInt(MixUtils.computedStyle(el, 'paddingBottom'));
        }
    },

    componentWillReceiveProps:function(nextProps) {
        let value = nextProps.value;
        if (value !== this.props.value && value !== this.state.value) {
            this.setState({ value });
        }
    },

    handleChange :function(event){
        this.props.autoHeight && this.autoHeight();

        let value = event.target.value;
        this.setState({ value });

        if (this.props.trigger === 'change') {
            this.handleTrigger(event);
        }
    },

    handleTrigger (event) {
        let value = event.target.value;
        this.props.onChange&&this.props.onChange(value, event);
    },

    autoHeight () {
        let el = this.element;
        let scrH;
        let rows;

        el.style.height = '1px';
        scrH = el.scrollHeight - this.paddingHeight;
        rows = Math.floor( scrH / this.lineHeight);

        if( rows >= this.props.rows ){
            this.setState({
                rows
            });
        }
        el.style.height = 'auto';
    },

    getValue(){
        return $(this.element).val();
    },

    clearValue(){
        $(this.element).val('');
    },

    render () {
        let { className, style, autoHeight, trigger, ...other } = this.props;
        const { rows, value } = this.state;

        style.minHeight = 'auto';
        if (autoHeight) {
            style.resize = 'none';
        }

        var props = {
            className: classNames(className),
            onChange: this.handleChange,
            style,
            rows,
            value
        };

        if (trigger !== 'change') {
            var handle = 'on' + trigger.charAt(0).toUpperCase() + trigger.slice(1);
            props[handle] = this.handleTrigger;
        }

        return (
            <textarea ref={ (c) => this.element = c } { ...other } { ...props } />
        );
    }
});


/**
 * Tab控件
 */
var Tab = React.createClass({

    getInitialState:function(){
        return {
            //索引值
            index:this.props.index?this.props.index:0,
        }
    },

    render:function(){
        return (<div className={"Tab"+(this.props.className?(" "+this.props.className):"")}>
            <Group data={fromJS(this.props.tabs)} renderChild={this.renderTitle} index = {this.state.index}/>
            {this.renderBar()}
            {this.renderSlide()}
        </div>);
    },

    renderTitle:function(item, i){
        var cls = classNames({"Tabs":true, "TabsChoice":i==this.state.index});
        return <div className={cls} onClick={this.onTitleClick.bind(this, i)}>{item}</div>;
    },

    onTitleClick:function(i){
        this.refs.slide.goToPage(i);
    },

    renderBar:function(){
        var width = 100/this.props.tabs.length,
            left = width*this.state.index,
            animation = {duration:300,animation:{left:left+"%"},easing: "easeOutCirc"};

        return <VelocityComponent {...animation}>
            <div ref className="TabBarItem" style={{width:width+"%"}}><div className="TabBarItem-in"></div></div>
        </VelocityComponent>;
    },

    snapChange:function(i){
        if(i === this.state.index) return;
        this.setState({index:i, time:new Date().valueOf()});
    },

    /**
     * 切换子类
     * @returns {XML}
     */
    renderSlide:function(){
        return <Slide className="SlideItem" ref='slide' index={this.state.index} snapChange={this.snapChange}>{this.props.children}</Slide>
    },
});


var MixinScroll = {

    stopEvent:function(e){
        e.preventDefault();
    },

    getEvents:function(events){
        if(!events) events = this.stopEvent;

        if(jjVersion.isIos()) return {};

        return {
            onTouchStart:events,
            onTouchMove:events,
            onTouchCancel:events,
            onTouchEnd:events,
        }
    },
};

var Slide = React.createClass({

    mixins:[MixinScroll],

    propTypes:{
        //监听切换
        snapChange:PropTypes.func,
        //
        index:PropTypes.number,

        bounce:PropTypes.bool,
    },

    getDefaultProps:function(){
        return {
            index:0,
        }
    },

    componentDidMount:function(){
        var $tab = $(this.refs.tab),
            width = $tab.width(),
            $wrapper = $(this.refs.wrapper),
            $children = $wrapper.children();
        console.log('--------tabs--',width);
        debugger;
        for(var i=0; i<$children.length; i++){
            $children.eq(i).css({width:width+"px",left:width*i+"px"});
        }
        $wrapper.css({width:width*$children.length+"px"});
        this.mScroll = new IScroll(this.refs.tab, {snap:true,scrollY:false,scrollX:false,click:false,bounce:this.props.bounce,pageX:this.props.index});
        //绑定snapChange事件
        this.props.snapChange && this.mScroll.on("snapChange", this.props.snapChange);
        //this.props.index>0&&this.mScroll.goToPage(this.props.index,0,1);
        $tab.bind("swipeleft", function(){
            this.mScroll.next();
        }.bind(this));

        $tab.bind('swiperight',function(){
            this.mScroll.prev();
        }.bind(this));
    },

    render:function(){
        return (<div className={classNames("Slide",this.props.className)} ref='tab'>
            <div className='wrapper' ref='wrapper'>
                {this.renderChild(this.props.children)}
            </div>
        </div>);
    },

    renderChild:function(children){
        if(!(children.length > 0)) children = [children];
        return children.map(function(child,i){
            return <div key={i} className='item' >{child}</div>
        });
    },

    goToPage:function(i){
        this.mScroll.goToPage(i, 0);
    },
});


var ScrollPull = React.createClass({

    propTypes:{
        //状态值-1:不显示，0:未加载，1：将要加载，2：加载中，3：加载完成
        state:PropTypes.number.isRequired,
        //存放描述四种状态描述
        txt:PropTypes.array.isRequired,
    },

    getHeight:function(){
        return this.refs.pull?this.refs.pull.offsetHeight:0;
    },

    getState:function(){
        return this.props.state;
    },

    render:function(){
        //如果状态值为-1，则为不显示
        if(this.props.state == -1) return <div></div>;
        return (<div {...this.props} className="ScrollPull" ref="pull" >
            <div className="txt">{this.props.txt[this.props.state]}</div>
        </div>);
    },
});



/**
 * 滚动组件
 */
var Scroll = React.createClass({

    mixins:[MixinScroll],

    /**
     *
     * @returns {{}}
     */
    getInitialState:function(){
        return {
            //下拉
            mPullDown:-1,
            //上拉
            mPullUp:this.props.up==true?1:-1,
        }
    },

    propTypes:{
        pullUp:PropTypes.func,
        bounce:PropTypes.bool,
    },

    getDefaultProps:function(){
        return {
            bounce:true,
            //下拉组件
            mPullDown:ScrollPull,
            mPullDownTxt:["下拉刷新","松开刷新","刷新中...","暂无刷新"],
            //上拉组件
            mPullUp:ScrollPull,
            mPullUpTxt:["加载更多","松开加载","正努力加载...","已全部加载"],
        }
    },

    componentDidMount:function(){

        var $scroll = $(this.refs.Scroll),
            $wrapper = $(this.refs.ScrollStyle);
        $wrapper.css({minHeight:$scroll.height()+'px'})
        this.mScrollHeight = $wrapper.height();
        this.pullDownOffset = this.refs.pullDown.getHeight();
        this.pullUpOffset = this.refs.pullUp.getHeight();
        this.mScroll = new IScroll(this.refs.Scroll,{bounce:this.props.bounce});
        this.mScroll.on("scrollMove", this.scrollMove);
        this.mScroll.on("scrollEnd", this.scrollEnd);
        this.mScroll.on('beforeScrollEnd', this.beforeScrollEnd);
    },

    componentDidUpdate:function(){
        var height =  $(this.refs.ScrollStyle).height();
        if(this.mScrollHeight != height){
            this.mScrollHeight =  height;
            this.mScroll.refresh();
        }
    },

    scrollMove:function(x, y){

        var mScroll = this.mScroll,
            pullDown = this.refs.pullDown,
            pullUp = this.refs.pullUp,
            value = 30;
        if (y > value && pullDown&&pullDown.getState() == 0) {
            this.setState({mPullDown:1});
            mScroll.minScrollY = 0;
        } else if (y < value && pullDown&& pullDown.getState() == 1) {
            this.setState({mPullDown:0});
            mScroll.minScrollY = -this.pullDownOffset;
        } else if (y < (mScroll.maxScrollY - value) && pullUp&&pullUp.getState() == 0) {
            this.setState({mPullUp:1});
        } else if (y > (mScroll.maxScrollY - value) && pullUp&&pullUp.getState() == 1) {
            this.setState({mPullUp:0});
        }
    },

    beforeScrollEnd:function(){
        var pullDown = this.refs.pullDown,
            pullUp = this.refs.pullUp;
        if (pullUp&&pullUp.getState() == 1) {
            this.mScroll.setBottomOffset(0, false);
        }
    },

    scrollEnd:function(){
        var pullDown = this.refs.pullDown,
            pullUp = this.refs.pullUp;
        if (pullDown&&pullDown.getState() == 1) {
            this.setState({mPullDown:2});
        }
        if (pullUp&&pullUp.getState() == 1) {
            this.triggerPull(2)
        }
    },

    triggerPull:function(type){
        if(type === 2){
            if(this.props.pullDown) this.props.pullDown();
            this.setState({mPullUp:2});
        }
    },

    refresh:function(){
        this.mScroll.refresh();
    },

    setPullDownState:function(state){
        //this.mScroll.maxScrollY += this.pullUpOffset;
        //this.mScroll.setBottomOffset(state==-1?this.pullUpOffset:0);
        this.setState({mPullUp:state});
    },

    render:function(){
        var {mPullDownTxt, mPullUpTxt} = this.props;
        var PullDown = this.props.mPullDown,
            PullUp = this.props.mPullUp;
        return <div {...this.getEvents(this.stopEvent)}>
            <div className="Scroll" ref="Scroll">
                <div className="ScrollStyle" ref="ScrollStyle">
                    <PullDown txt={mPullDownTxt} state={this.state.mPullDown} ref="pullDown"/>
                    {this.props.children}
                    <PullUp txt={mPullUpTxt} state={this.state.mPullUp} onClick={this.triggerPull.bind(this,2)} ref="pullUp"/>
                </div>
            </div>
        </div>
    },

});


/**
 * 加载中控件
 */
var Loading = React.createClass({

    getInitialState:function(){
        return {
            //加载状态
            lstate:1,
            //加载失败图
            limg:"img/ft_pic_nonet.png",
            ltxt:"加载中...",
        }
    },

    render:function(){
        var props = this.props;
        var create = function(){
            if(props.lstate == 1)
                return (<img className="load ani-rotate" src="react/img/pageloading.png"/>);
            else
                return (<img className="fail" src={props.limg}/>);
        };
        return (
            <div className="Loading">
                {create()}
                <div className="txt">{props.ltxt?props.ltxt:"数据加载中..."}</div>
            </div>
        );
    },
});

/**
 * 倒计时字符串
 */
var RCDString = React.createClass({

    mixins:[MixinTime, MixinSetInterval],

    propTypes:{
        //匹配字符串
        format:PropTypes.string.isRequired,
    },

    getDefaultProps:function(){
        return {
            format:"hh时mm分ss秒",
        }
    },

    getInitialState:function(){
        return {
            time:this.props.time-(new Date().valueOf() - this.props.localTime),
        }
    },

    componentDidMount:function(){
        var index = this.setInterval(function(){
            var time = this.props.time-(new Date().valueOf() - this.props.localTime);
            if(time <=0){
                time = 0;
                if(time>-1000){
                    //this.clearInterval(index);
                    if(this.props.onEnd) this.props.onEnd();
                }
            }
            this.setState({time:time});
        }.bind(this), 1000);
    },

    render:function(){
        var {className,format} = this.props;
        return <span className={className}>{this.format(this.state.time,format)}</span>
    },
});


/**
 * 按钮组件
 */
var Button = React.createClass({

    propTypes:{
        //按钮点击状态
        disabled:PropTypes.bool,
    },

    render:function(){
        return <button {...this.props} className={"Button "+this.props.className}>{this.props.children}</button>
    },
});

/**
 * 图片组件
 */
var Img = React.createClass({
    render:function(){
        return <img src={this.props.src}/>
    },
});

/***
 * 网格布局
 */
var Grid = React.createClass({
    propTypes:{
        //数据
        data:IPropTypes.list,
        //分割数据
        division:PropTypes.number,
        //生成item项回调函数
        renderChild:PropTypes.func,
        //是否显示Group边框
        border:PropTypes.bool,
        //titles
        titles:IPropTypes.list,
        //title样式，即第一行样式
        titleClass:PropTypes.string,
        //比例
        ratio:IPropTypes.list,
        //item的样式
        itemClass:PropTypes.string,
        //是否合并最后一行
        mergeLast:PropTypes.bool,
    },

    render:function(){
        return <div className={classNames("Grid",this.props.className,this.props.border==false?"GNBorder":undefined)}>
            {this.renderLine(this.props.titles,0,this.props.titleClass)}
            {this.renderChildren()}
        </div>
    },

    /**
     *
     * @returns {*}
     */
    renderChildren:function(){
        var {data, division}=this.props;
        division = Number(division);
        if(data){
            //如果定义了数组分割
            if(division>0){
                var child=[];
                for(var z=0; z<data.size; z+=division){
                    child.push(this.renderLine(data.slice(z,z+division),z));
                }
                return child;
            }else{
                var i=0;
                return data.map(function(ldata, li){
                    i+= ldata.size;
                    return this.renderLine(ldata, i-ldata.size);
                }.bind(this))
            }
        }else{
            //如果没有定义data,则使用Children
            return this.props.children;
        }
    },

    /**
     * 刷新一行数据
     * @param data
     * @param i
     * @param renderChild
     * @returns {XML}
     */
    renderLine:function(data, i, titleClass){
        if(!data||data.size == 0) return null;

        var {ratio, renderChild, itemClass,mergeLast,change} = this.props;
        return <Group key={i} data={data} ratio={ratio} mergeLast={mergeLast} change={change} itemClass={classNames(itemClass, titleClass)} renderChild={function(idata,ii){
            return renderChild?renderChild(idata,ii,data,i):idata;
        }}/>
    },
});

/**
 * Group组件
 */
var Group = React.createClass({

    propTypes:{
        //数据
        data:IPropTypes.list,
        //生成item项回调函数
        renderChild:PropTypes.func,
        //比例
        ratio:IPropTypes.list,
        //item的样式
        itemClass:PropTypes.string,
        //是否合并最后一行
        mergeLast:PropTypes.bool,
        //长宽比
        whRatio:PropTypes.number,
    },

    getInitialState:function(){
        return {
            height:0,
        }
    },

    componentDidMount:function(){
        if(this.props.whRatio){
            console.log('---this.props.whRatio--',this.props.whRatio);
            //$(this.refs.item).css('height',$(this.refs.item0).width()*this.props.whRatio+'px');
            this.setState({height:$(this.refs.item0).width()*this.props.whRatio})
        }
        //this.props.whRatio && this.setState({height:parseInt($(this.refs.item).width()*this.state.whRatio,10)+"px"});
        //$(this.refs.item)
    },

    componentWillMount:function(){
        //计算比例
        this.ratios = [];
        var {ratio, data, children}= this.props;
        var last = 100;
        //如果没有定义item,则为自动平分
        if(!ratio  || ratio && (children && ratio.size != children.length-1 && data && ratio.size != data.size-1)){
            var len = data&&data.size>0?data.size:$.isArray(children)?children.length:1;
            for(var i=0; i<len-1;i++){
                var item = (100/len).toFixed(2);
                last -= item;
                this.ratios.push((100/len).toFixed(2));
            }
            this.ratios.push(last);
            return;
        }else{
            for(var i=1; i<ratio.size-1; i++){
                var item = (ratio.get(i)*100/ratio.get(0)).toFixed(2);
                last -= item;
                this.ratios.push(item);
            }
        }
        this.ratios.push(last);
    },

    render:function(){
        return <div ref="group" className={classNames("Group", this.props.className)}>{this.renderChildren()}</div>
    },

    /**
     * 自动分割
     * @param child
     * @param i
     * @returns {*}
     */
    renderRatio:function(child, i){
        var ratio = this.ratios[i];
        var {itemClass,titleClass} = this.props;
        var style = {width:ratio+"%"};
        if(this.state.height != 0) style.height = this.state.height+"px";
        return <div key={i} ref={'item'+i} className={classNames("GroupItem",itemClass, titleClass)} style={style}>{child}</div>;
    },


    /**
     * render所有child
     */
    renderChildren:function(){

        var {renderChild,data,children} = this.props;

        var children = this.getChildren(data,children);
        var items = children.map(function(child, i){
            //如果定义了回调方法
            child = renderChild?renderChild(child, i):child;
            return this.renderRatio(child,i);
        }.bind(this));
        return items.asImmutable?items.toJS():items;
    },

    /**
     * 获取
     */
    getChildren:function(data, children){
        children=children?children.length>=0?children:[children]:[];
        //如果没有传递数据,则直接使用child
        data = data?data:children;
        return data;
    },
});
/***
 * 弹出框
 */
var Model = React.createClass({

    getInitialState:function(){
        return {
            show:false,
        }
    },

    /**
     * 打开弹出框
     */
    show:function(props){
        //添加
        MixinAStore.addModel(this);
        this.setState({show:true, props:props});
    },

    /**
     * 关闭弹出框
     */
    close:function(){
        this.setState({show:false});
    },

    render:function(){
        if(!this.state.show) return null;

        return (<div className="Model" onClick={MixinAStore.back}>
            <div className="dialog" onClick={function(event){event.stopPropagation();}}>
                {React.cloneElement(this.props.children, this.state.props)}
            </div>
        </div>);
    },
});


/**
 * 页面管理数据
 */
var MixinAStore = Store.createStore("AStore", {
    activitys:[],
},{

    /**
     * 跳转页面
     * @param url
     * @param intent
     */
    startActivity:function(url, intent){
        var activity = Store.store(["AStore","activitys"]).last();
        if(activity && activity.get('url') == url) return;
        var needShow = false;
        console.log('-------aaa----');
        //if(needShow){
            $("#react_root_mask").hide();
            $("#react_root").show();
            $("eur_page_img").hide();
        //}
        Store.store(["AStore","activitys"], function(list){
            if(list.size == 0) needShow = true;
            return list.push(fromJS({url:url, intent:intent, view:null, models:[],source:['css/'+url+'.css','activity/'+url+'.js']}));
        });
        //开始请求页面
        this.requireActivity(url);

    },

    register:function(url,view){
        //debugger;
        Store.store(["AStore","activitys"],function(list){

            console.log('---register----', url, list.last().get('url'),view);
            //判断url，是否相等，如果不相等，则直接退出
            if(url !== list.last().get("url")) return;
            return list.setIn([list.size-1, "view"], view);
        });
    },

    //requireSource:function(){
    //
    //},

    /**
     * 异步请求界面
     * @param url
     * @param intent
     * @param index
     */
    requireActivity:function(url){
        var deps = ["activity/"+url, "css!../css/"+url+".css"],
            config = ActivityConfig[url];

        if(config&&config.deps) deps = deps.concat(config.deps);

        require(deps, function(){
            //var view = window[url];
            //Store.store(["AStore","activitys"],function(list){
            //    //判断url，是否相等，如果不相等，则直接退出
            //    if(url !== list.last().get("url")) return;
            //    return list.setIn([list.size-1, "view"], view);
            //});
        });
    },

    /**
     * 添加一个Model
     */
    addModel:function(model){
        Store.store(["AStore","activitys"], function(list){
            //如果没有界面,则直接返回
            if(list.size == 0) return;
            var models = list.last().get("models");
            return list.setIn([list.size-1,"models"],models.push(model));
        }, false);
    },

    showPopup:function(component, options){

    },

    /**
     * 回退
     */
    back:function(){
        var flag = true, needBack = false;
        Store.store(["AStore","activitys"], function(list){
            if(list.size == 0){
                $("#react_root").hide();
                return;
            }
            //判断是否有弹出框
            var models = list.last().get("models");
            if(models.size > 0){
                //关闭最后一个弹框,并移除
                models.last().close();
                flag = false;
                return list.setIn([list.size-1,"models"],models.pop());
            }else{
                list.last() && Store.rebackStore(list.last().get("url"), false);
                var list = list.pop();
                if(list.size == 0){
                    needBack = true;
                }
                flag = false;

                return list;
            }
        });
        if(needBack==true){
            $("#react_root").hide();
            jjConfig.reactRoot = null;
            jjPageCore.mCurPage && jjPageCore.mCurPage._resume();
        }
        return flag;
    },
});

/**
 * 页面管理中心
 */
var ActivityCenter = React.createClass({

    propTypes:{
        store:IPropTypes.map.isRequired,
    },

    mixins:[MixinAStore],

    render:function(){
        var activitys = this.props.store.get("AStore").get("activitys");

        if(activitys.size == 0) return <div></div>;
        return (<div className="ActivityCenter">
            {activitys.map(function(activity, i){
                    return this.renderAtivity(activity,i)
                }.bind(this)).toJS()}
        </div>);
    },

    renderAtivity:function(activity,i){

        var Component = activity.get("view");
        if(Component == null) Component = LoadingActivity;
        //   <URL source={activity.get('source')}/>
        return <div key={i} className="ActivityWrap">
                <Component mIntent={activity.get("intent")} store={this.props.store} />;
            <URL source={activity.get('source')}/>
            </div>
    },
});

/**
 * 金币显示
 */
var GoldBox = React.createClass({
    render: function render() {
        return <div className="goldbox"><div className="goldtext">{this.props.gold}</div></div>;
    }
});
/**
 * Header组件
 */
var Header = React.createClass({

    getInitialState:function(){
        return {
            title:"",
            ibtns:[],
        }
    },

    onListener:function(type){
        if(this.props.onListener)
            this.props.onListener(type);
    },

    createBtn: function(value, i){
        return <img className="ibtn" key={i} src={value} onClick={this.onListener.bind(this, i+1)} />
    },

    render:function(){
        var props = this.props;

        return (<div className="Header">
            <div className="back" onClick={this.onListener.bind(this, 0)}/>
            {props.gold?<GoldBox gold={props.gold} />:<div className="title">{props.title}</div>}
            {
                props.gold?<div></div>:<div className="img">{this.state.ibtns && this.state.ibtns.map(this.createBtn)}</div>
            }
        </div>);
    },
});

/**
 * Activity组件
 */
var Activity = React.createClass({

    mixins:[MixinAStore],

    onHeaderListener:function(type){
        switch (type){
            case 0:
                jjBridge.back();
                break;
            case 1:
                this.startActivity("History");
                break;
        }
    },

    render:function() {
        var props = this.props;
        return (
            <div className={classNames("Activity",props.className)} >
                <Header onListener={this.onHeaderListener} {...props} />
                <div className="content">
                    {!props.lstate||props.lstate==0?props.children:(<Loading {...props}/>)}
                </div>
            </div>
        );
    },
});

/**
 * 加载中组件
 */
var LoadingActivity = React.createClass({

    mixins:[MixinSetInterval],

    componentDidMount:function(){
        this.setTimeout(function(){
            this.setState({state:1});
        }.bind(this), 1000);
        this.setTimeout(function () {
            this.setState({ state:2,txt: '网络异常，请返回重试', });
        }.bind(this), 3000);
    },

    getInitialState:function(){
        return {
            //状态:0：表示正在加载，1：表示加载已超过时长
            state:0,
            txt:"页面加载中...",
        }
    },

    render:function() {
        if(this.state.state==0){
            return <div className="LoadingMask"></div>;
        }
        return (<div className="LoadingActivity">
            <div className="back" onClick={jjBridge.back}/>
            <img className="gif" src="react/img/loading.gif"/>
            <div className="title">{this.state.txt}</div>
            {this.state.state==2?<div className="tback" onClick={jjBridge.back}>返回</div>:""}
        </div>);
        //return <Activity mActivityName="LoadingActivity" lstate={1} ltxt="页面加载中..." {...this.props}/>
    },
});

/**
 * 应用程序
 */
var App = React.createClass({

    mixins:[Store.MixinStore, MixinAStore],

    getInitialState:function(){
        return {
            store:Store.getStore(),
        };
    },

    render:function(){
        return (<div className="App">
            <ActivityCenter store={this.state.store}/>
        </div>);
    },
});


var VelocityComponent = React.createClass({
    propTypes: {
        animation: React.PropTypes.any,
        children: React.PropTypes.element.isRequired,
        runOnMount: React.PropTypes.bool,
        targetQuerySelector: React.PropTypes.string,
        // Any additional properties will be sent as options to Velocity
    },

    getDefaultProps: function () {
        return {
            animation: null,
            runOnMount: false,
            targetQuerySelector: null,
        }
    },

    componentDidMount: function () {
        this.runAnimation();

        // Jump to the end so that the component has the visual appearance of the animation having
        // been run to completion.
        if (this.props.runOnMount !== true) {
            this._finishAnimation();
        }
    },

    componentWillUpdate: function (newProps, newState) {
        if (newProps.animation!= this.props.animation) {
            this._stopAnimation();
            this._scheduleAnimation();
        }
    },

    componentWillUnmount: function () {
        this._stopAnimation();
    },

    // It's ok to call this externally! By default the animation will be queued up. Pass stop: true in
    // to stop the current animation before running. Pass finish: true to finish the current animation
    // before running.
    runAnimation: function (config) {
        config = config || {};

        this._shouldRunAnimation = false;

        if (!this.isMounted() || this.props.animation == null) {
            return;
        }

        if (config.stop) {
            this._stopAnimation();
        } else if (config.finish) {
            this._finishAnimation();
        }

        // Delegate all props except for the ones that we have specified as our own via propTypes.
        var opts = $.extend({}, this.props);
        delete opts["animation"];
        delete opts["children"];
        delete opts["runOnMount"];
        delete opts["targetQuerySelector"];
        Velocity(this._getDOMTarget(), this.props.animation, opts);
    },

    // We trigger animations on a new tick because of a Velocity bug where adding a
    // multi-step animation from within a complete callback causes the first 2 animations to run
    // simultaneously.
    _scheduleAnimation: function () {
        if (this._shouldRunAnimation) {
            return;
        }

        this._shouldRunAnimation = true;
        setTimeout(this.runAnimation, 0);
    },

    // Returns one or more DOM nodes to apply the animation to. This is checked every time we start
    // or stop an animation, which means that if an animation is proceeding but the element is removed
    // from the page, it will run its course rather than ever being stopped. (We go this route
    // because of difficulty in tracking what animations are currently being animated, due to both
    // chained animations and the need to be able to "stop" an animation before it begins.)
    _getDOMTarget: function () {
        var node = ReactDOM.findDOMNode(this);
        if (this.props.targetQuerySelector === 'children') {
            return node.children;
        } else if (this.props.targetQuerySelector != null) {
            return node.querySelectorAll(this.props.targetQuerySelector);
        } else {
            return node;
        }
    },

    _finishAnimation: function () {
        Velocity(this._getDOMTarget(), 'finish', true);
    },

    _stopAnimation: function () {
        Velocity(this._getDOMTarget(), 'stop', true);
    },

    render:function(){
        return this.props.children;
    },
});

// Shim requestAnimationFrame for browsers that don't support it, in particular IE 9.
var shimRequestAnimationFrame =
    (typeof window !== 'undefined') && (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) { window.setTimeout(callback, 0) }
    );

// Fix 'Invalid calling object' error in IE
shimRequestAnimationFrame = (typeof window !== 'undefined') &&  shimRequestAnimationFrame.bind(window);

// Internal wrapper for the transitioned elements. Delegates all child lifecycle events to the
// parent VelocityTransitionGroup so that it can co-ordinate animating all of the elements at once.
var VelocityTransitionGroupChild = React.createClass({
    displayName: 'VelocityTransitionGroupChild',

    propTypes: {
        children: React.PropTypes.element.isRequired,
        willAppearFunc: React.PropTypes.func.isRequired,
        willEnterFunc: React.PropTypes.func.isRequired,
        willLeaveFunc: React.PropTypes.func.isRequired,
    },

    componentWillMount:function(){
    },

    componentWillAppear: function (doneFn) {
        this.props.willAppearFunc(ReactDOM.findDOMNode(this), doneFn);
    },

    componentWillEnter: function (doneFn) {
        this.props.willEnterFunc(ReactDOM.findDOMNode(this), doneFn);
    },

    componentWillLeave: function (doneFn) {
        this.props.willLeaveFunc(ReactDOM.findDOMNode(this), doneFn);
    },

    render: function () {
        return React.Children.only(this.props.children);
    },
});

var VelocityTransitionGroup = React.createClass({
    displayName: 'VelocityTransitionGroup',

    statics: {
        disabledForTest: false, // global, mutable, for disabling animations during test
    },

    propTypes: {
        runOnMount: React.PropTypes.bool,
        enter: React.PropTypes.any,
        leave: React.PropTypes.any,
        children: React.PropTypes.any,
        enterHideStyle: React.PropTypes.object,
        enterShowStyle: React.PropTypes.object,
    },

    getDefaultProps: function() {
        return {
            runOnMount: false,
            enter: null,
            leave: null,
            enterHideStyle: {
                display: 'none',
            },
            enterShowStyle: {
                display: '',
            },
        };
    },

    componentWillMount: function () {
        this._scheduled = false;
        this._entering = {nodes:[],doneFns:[]};
        this._leaving = {nodes:[],doneFns:[]};
    },

    componentWillUnmount: function () {
        this._entering = {nodes:[],doneFns:[]};
        this._leaving = {nodes:[],doneFns:[]};
    },

    render: function () {
        // Pass any props that are not our own on into the TransitionGroup delegate.
        //var transitionGroupProps = _.omit(this.props, _.keys(this.constructor.propTypes))
        var props = $.extend({}, this.props);
        delete props["children"];
        var transitionGroupProps = ObjectUtil.omit(props, Object.keys(this.constructor.propTypes));

        // Without our custom childFactory, we just get a default TransitionGroup that doesn't do
        // anything special at all.
        //if (!this.constructor.disabledForTest && !Velocity.velocityReactServerShim) {
        transitionGroupProps.childFactory = this._wrapChild;
        transitionGroupProps.component = "div";
        //}
        return React.createElement(TransitionGroup, transitionGroupProps, this.props.children);
    },

    childWillAppear: function (node, doneFn) {
        if (this.props.runOnMount) {
            this.childWillEnter(node, doneFn);
        } else {
            this._finishAnimation(node, this.props.enter);

            // Important to tick over so that any callbacks due to finishing the animation complete first.
            // isMounted check necessary to avoid exception in tests, which can mount and unmount a
            // component before this runs over, as the "doneFn" callback does a ref lookup rather than
            // closing over the component.
            //
            // Using setTimeout so that doneFn gets called even when the tab is hidden.
            var self = this;
            window.setTimeout(function () {
                if (self.isMounted()) {
                    doneFn();
                }
            }, 0);
        }
    },

    childWillEnter: function (node, doneFn) {
        if (this._shortCircuitAnimation(this.props.enter, doneFn)) return;

        // By finishing a "leave" on the element, we put it in the right state to be animated in. Useful
        // if "leave" includes a rotation or something that we'd like to have as our starting point, for
        // symmetry.
        // We use overrideOpts to prevent any "begin" or "complete" callback from triggering in this case, since
        // it doesn't make a ton of sense.
        this._finishAnimation(node, this.props.leave, {begin: undefined, complete: undefined});

        // We're not going to start the animation for a tick, so set the node's display to none (or any
        // custom "hide" style provided) so that it doesn't flash in.
        $.each(this.props.enterHideStyle, function (key,val) {
            Velocity.CSS.setPropertyValue(node, key, val);
        });

        this._entering.nodes.push(node);
        this._entering.doneFns.push(doneFn);
        //  this._entering.push({
        //  node: node,
        //  doneFn: doneFn,
        //});

        this._schedule();
    },

    childWillLeave: function (node, doneFn) {
        if (this._shortCircuitAnimation(this.props.leave, doneFn)) return;

        //this._leaving.push({
        //  node: node,
        //  doneFn: doneFn,
        //});

        this._leaving.nodes.push(node);
        this._leaving.doneFns.push(doneFn);


        this._schedule();
    },

    // document.hidden check is there because animation completion callbacks won't fire (due to
    // chaining off of rAF), which would prevent entering / leaving DOM nodes from being cleaned up
    // while the tab is hidden.
    //
    // Returns true if this did short circuit, false if lifecycle methods should continue with
    // their animations.
    _shortCircuitAnimation: function (animationProp, doneFn) {
        if (document.hidden || (this._parseAnimationProp(animationProp).animation == null)) {
            if (this.isMounted()) {
                doneFn();
            }

            return true;
        } else {
            return false;
        }
    },

    _schedule: function () {
        if (this._scheduled) {
            return;
        }

        this._scheduled = true;

        // Need rAF to make sure we're in the same event queue as Velocity from here out. Important
        // for avoiding getting wrong interleaving with Velocity callbacks.
        shimRequestAnimationFrame(this._runAnimations);
    },

    _runAnimations: function () {
        this._scheduled = false;

        this._runAnimation(true, this._entering, this.props.enter);
        this._runAnimation(false, this._leaving, this.props.leave);

        this._entering = {nodes:[],doneFns:[]};
        this._leaving = {nodes:[],doneFns:[]};
    },

    // Used to parse out the 'enter' and 'leave' properties. Handles cases where they are omitted
    // as well as when they are just strings and not hashes of animation and options.
    _parseAnimationProp: function (animationProp) {
        var animation, opts, style;

        if (typeof animationProp === 'string') {
            animation = animationProp;
            style = null;
            opts = {};
        } else {
            animation = (animationProp != null) ? animationProp.animation : null;
            style = (animationProp != null) ? animationProp.style : null;
            opts = ObjectUtil.omit(animationProp, ['animation', 'style']);
        }

        return {
            animation: animation,
            style: style,
            opts: opts,
        };
    },

    _runAnimation: function (entering, queue, animationProp) {
        if (!this.isMounted() || queue.length === 0) {
            return;
        }

        var nodes = queue.nodes;
        var doneFns = queue.doneFns;

        var parsedAnimation = this._parseAnimationProp(animationProp);
        var animation = parsedAnimation.animation;
        var style = parsedAnimation.style;
        var opts = parsedAnimation.opts;

        // Clearing display reverses the behavior from childWillAppear where all elements are added with
        // display: none to prevent them from flashing in before the animation starts. We don't do this
        // for the fade/slide animations or any animation that ends in "In," since Velocity will handle
        // it for us.
        //
        // If a custom "enterShowStyle" prop is passed, (i.e. not one that just reverses display: none)
        // we always run it, regardless of the animation, since it's probably doing something around
        // opacity or positioning that Velocity will not necessarily reset.
        if (entering) {
            //if (!_.isEqual(this.props.enterShowStyle, {display: ''})
            if(!(Object.keys(this.props.enterShowStyle).length ==1 && this.props.enterShowStyle.display == '')
                || !(/^(fade|slide)/.test(animation) || /In$/.test(animation))) {
                var styles = $.extend({}, this.props.enterShowStyle);
                style = $.extend(styles, style);
            }
        }

        // Because Safari can synchronously repaint when CSS "display" is reset, we set styles for all
        // browsers before the rAF tick below that starts the animation. This way you know in all
        // cases that you need to support your static styles being visible on the element before
        // the animation begins.
        if (style != null) {
            $.each(style, function (key,value) {
                Velocity.hook(nodes, key, value);
            });
        }

        var self = this;
        var doneFn = function () {
            if (!self.isMounted()) {
                return;
            }

            doneFns.map(function (doneFn) { doneFn(); });
        };

        // For nodes that are entering, we tell the TransitionGroup that we're done with them
        // immediately. That way, they can be removed later before their entering animations complete.
        // If we're leaving, we stop current animations (which may be partially-completed enter
        // animations) so that we can then animate out. Velocity typically makes these transitions
        // very smooth, correctly animating from whatever state the element is currently in.
        if (entering) {
            doneFn();
            doneFn = null;
        } else {
            Velocity(nodes, 'stop');
        }

        var combinedCompleteFn;
        if (doneFn && opts.complete) {
            var optsCompleteFn = opts.complete;
            combinedCompleteFn = function () {
                doneFn();
                optsCompleteFn();
            };
        } else {
            // One or the other or neither.
            combinedCompleteFn = doneFn || opts.complete;
        }

        // Bit of a hack. Without this rAF, sometimes an enter animation doesn't start running, or is
        // stopped before getting anywhere. This should get us on the other side of both completeFn and
        // any _finishAnimation that's happening.
        shimRequestAnimationFrame(function () {
            Velocity(nodes, animation, $.extend(opts, {
                complete: combinedCompleteFn,
            }));
        });
    },

    _finishAnimation: function (node, animationProp, overrideOpts) {
        var parsedAnimation = this._parseAnimationProp(animationProp);
        var animation = parsedAnimation.animation;
        var style = parsedAnimation.style;
        var opts = $.extend(parsedAnimation.opts, overrideOpts);

        if (style != null) {
            $.each(style, function (key, value) {
                Velocity.hook(node, key, value);
            });
        }

        if (animation != null) {
            // Opts are relevant even though we're immediately finishing, since things like "display"
            // can affect the animation outcome.
            Velocity(node, animation, opts);
            Velocity(node, 'finish', true);
        }
    },

    _wrapChild: function (child) {
        return React.createElement(VelocityTransitionGroupChild, {
            willAppearFunc: this.childWillAppear,
            willEnterFunc: this.childWillEnter,
            willLeaveFunc: this.childWillLeave,
        }, child);
    },
});
