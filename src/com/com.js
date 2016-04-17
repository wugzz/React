/**
 * Created by wugz on 16/4/16.
 */

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
        Store.store(["AStore","activitys"], function(list){
            return list.push(fromJS({url:url, intent:intent, view:window[url], models:[]}));
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

    /**
     * 回退
     */
    back:function(){
        Store.store(["AStore","activitys"], function(list){
            if(list.size == 0) return;
            //判断是否有弹出框
            var models = list.last().get("models");
            if(models.size > 0){
                //关闭最后一个弹框,并移除
                models.last().close();
                return list.setIn([list.size-1,"models"],models.pop());
            }else{
                return list.pop();
            }
        });
    },
});

/**
 * 页面管理中心
 */
var ActivityCenter = React.createClass({

    propTypes:{
        activitys:React.PropTypes.any,
    },

    mixins:[MixinAStore],

    render:function(){

        var {activitys} = this.props;
        console.log("activitys == ", activitys);
        //获取最后一个页面
        var activity = activitys.size>0?activitys.last():null;
        //判断释放包含界面
        if(activity == null) return null;

        return (<div className="ActivityCenter">
            {activity.get("view") != null ? React.createElement(activity.get("view"), {mIntent:activity.get("mIntent")}):""}
        </div>);
    },
});

/**
 * 弹出框
 */
var MixinPStore = Store.createStore("PopupsStore",{
    popups:{},
},{
    showPopup:function(component, props){

    },

    /**
     * 关闭弹框
     */
    closePopup:function(){

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
        //<PopupCenter popups={store.get("popups")}/>
        var store = this.state.store.get("AStore");
        return (<div className="App">
            <ActivityCenter activitys={store.get("activitys")}/>
        </div>);
    },
});