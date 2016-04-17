/**
 * Created by wugz on 16/4/16.
 */

var PropTypes = React.PropTypes;
var IPropTypes = ImmutablePropTypes;

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
    },

    render:function(){
        return <div className={"Grid"+(this.props.border==false?" GNBorder":"")}>
            {this.renderLine(this.props.titles,0,this.props.renderChild)}
            {this.renderChildren()}
        </div>
    },

    /**
     *
     * @returns {*}
     */
    renderChildren:function(){
        var {data, renderChild, division}=this.props;
        if(data){
            //如果定义了数组分割
            if(division>0){
                var child=[];
                for(var i=0; i<data.size; i+=division){
                    child.push(this.renderLine(data.slice(i,i+division),i, renderChild));
                }
                return child;
            }else{
                return data.map(function(ldata, li){
                    return this.renderLine(ldata, li, renderChild)
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
    renderLine:function(data, i, renderChild){
        if(!data||data.size == 0) return null;
        return <Group key={i} data={data} renderChild={function(idata,ii){
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
    },

    render:function(){
        return <div className="Group">{this.renderChildren()}</div>
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
            return child;
        });

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
        store:IPropTypes.map.isRequired,
    },

    mixins:[MixinAStore],

    render:function(){
        var activitys = this.props.store.get("AStore").get("activitys");

        if(activitys.size == 0) return <div></div>;
        //获取最后一个页面
        var activity = activitys.last(),
            Component = activity.get("view");

        return (<div className="ActivityCenter">
            {Component != null ? <Component mIntent={activity.get("mIntent")} store={this.props.store} />:""}
        </div>);
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