/**
 * Created by wugz on 16/3/19.
 */

var Image = React.createClass({
    render:function(){
        console.log("this.props ", this.props);
        return <img src={this.props.src}/>
    },
});

Store.createStore("Home", {
    data:[["打开弹框","打开弹框","打开弹框","打开弹框"],["打开弹框","打开弹框","打开弹框","打开弹框"]],
});


var Home = React.createClass({
    render:function(){

        //<Button >打开弹框</Button>
        //<Button >打开弹框</Button>
        //<Button >打开弹框</Button>

        var data = this.props.store.get("Home").get("data");

        return <div className="Home">
            <Grid data={data} border={false} titles={fromJS([1,2,3,4])} renderChild={function(child, i){
                console.log("-------");
                return <Button key={i}>{child}</Button>
            }}>
            </Grid>
            <Button onClick={this.onShow}>打开弹框</Button>
            <Model ref="model">
                <Image src="img/ss.jpeg"/>
            </Model>
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




