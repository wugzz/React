/**
 * Created by wugz on 16/4/16.
 */
var {Map, fromJS, is} = Immutable;

/**
 * 数据类
 * @type {{}}
 */
var Store = {

    //整棵数据树
    _storeTree: new Map(),

    //存储记录
    _storeHistory: new Map(),

    //存储数据监听器
    _events:new EventTarget(),

    /**
     * 获取数据树
     * @returns {*}
     */
    getStore:function(){
        return this._storeTree;
    },

    /**
     * 存储或获取数据
     * @param key
     * @param value
     * @param flag 是否更新界面
     * @returns {*}
     */
    store:function(key, value, flag){
        if(value == undefined){
            return this._storeTree.getIn(key);
        }
        //判读value是否为方法
        if(typeof value == "function"){
            value = value(this._storeTree.getIn(key));
            //如果没有返回值,则直接退出
            if(value == undefined) return;
        }
        else if(!value.asImmutable) value = fromJS(value);
        //修改数据
        this._storeTree = this._storeTree.setIn(key, value);
        //通知更新
        if(flag != false) this._events.fire("store",{store:this._storeTree});
    },

    /**
     * 存储或恢复数据
     * @param key
     * @param flag flag
     */
    history:function(key, flag){

    },

    /**
     * 创建一个store
     * @param name
     * @param istore
     * @param mixin
     */
    createStore: function (name, istore, mixin) {
        //存储数据
        this.store([name], fromJS(istore), false);
        //继承方法
        if(!mixin) mixin = {};

        return mixin;
    },

    /**
     * 数据监听器
     */
    MixinStore: {
        componentDidMount:function(){
            //注册监听事件的改变
            Store._events.addListener("store", this.updateStore);
        },

        componentWillUnmount:function(){
            //注册监听事件的改变
            Store._events.removeListener("store", this.updateStore);
        },

        /**
         * 更新数据,改变UI
         * @param event
         */
        updateStore:function(event){
            var state={};
            state[event.type] = event.store;
            this.setState(state);
        },

    },

    /**
     * 对控件的props和state进行比较,优化算法
     */
    MixinImmutable:{

        shallowEqualImmutable:function(objA, objB){
            if (objA === objB || is(objA, objB)) {
                return true;
            }

            if (typeof objA !== 'object' || objA === null ||
                typeof objB !== 'object' || objB === null) {
                return false;
            }

            const keysA = Object.keys(objA);
            const keysB = Object.keys(objB);

            if (keysA.length !== keysB.length) {
                return false;
            }

            // Test for A's keys different from B.
            const bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
            for (let i = 0; i < keysA.length; i++) {
                if (!bHasOwnProperty(keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
                    return false;
                }
            }

            return true;
        },

        shouldComponentUpdate:function(nextProps, nextState){
            var ret = !this.shallowEqualImmutable(this.props, nextProps) || !this.shallowEqualImmutable(this.state, nextState);
            if(ret) console.log("--------",this.dName,":render-----------");
            return ret;
        },
    },
};

/**
 * 重写创建类
 */
var ReactCreateClass = React.createClass;
React.createClass = function(cls){
    //给所有组件都加上,以便
    var mixins = [Store.MixinImmutable];
    cls.mixins = cls.mixins?mixins.concat(cls.mixins):mixins;
    cls.dName = cls.displayName;
    return ReactCreateClass(cls);
}