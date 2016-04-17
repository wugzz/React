/**
 * Created by wugz on 16/3/19.
 */


Store.createStore("Home", {
    data:["打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框","打开弹框"],
});


var Home = React.createClass({
    render:function(){

        //<Button >打开弹框</Button>
        //<Button >打开弹框</Button>
        //<Button >打开弹框</Button>

        var data = this.props.store.get("Home").get("data");

        return <div className="Home">
            <Scroll>
                <Grid data={data} border={false} division={1} ratio={fromJS([1,1])} titles={fromJS([1])} renderChild={function(child, i){
                    return <Button key={i}>{child}</Button>
                }}>
                </Grid>
                <Button onClick={this.onShow}>打开弹框</Button>
                <Model ref="model">
                    <Img src="img/ss.jpeg"/>
                </Model>
            </Scroll>
        </div>
    },

    onShow:function(){
        this.refs.model.show({game:"123"});
    },
});

//console.log("----",document.getElementById("react_root"));
window.onload = function(){
    var app = ReactDOM.render(<App />, document.getElementById("react_root"));
    app.startActivity("Home", {data:"data"});
};




