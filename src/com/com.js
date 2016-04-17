/**
 * Created by wugz on 16/4/16.
 */

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
            return list.push(fromJS({url:url, intent:intent, view:window[url]}));
        });
    },

    /**
     * 结束当前页面
     */
    finish:function(){
        Store.store(["AStore","activitys"], function(list){
            return list.pop();
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
        var activity = activitys.size>0?activitys.last().toJS():null;

        activity != null && console.log("activitys == ", activity);
        return (<div className="ActivityCenter">
            {activity != null ? React.createElement(activity.view, {mIntent:activity.mIntent}):""}
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

/***
 * 弹出框管理中心
 */
var PopupCenter = React.createClass({
    render:function(){
        console.log("PopupCenter render");
        return (<div></div>);
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
        var store = this.state.store.get("AStore");
        return (<div className="App">
            <ActivityCenter activitys={store.get("activitys")}/>
            <PopupCenter popups={store.get("popups")}/>
        </div>);
    },
});