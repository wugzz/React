/**
 * Created by wugz on 16/3/19.
 */

var Image = React.createClass({
    render:function(){
        console.log("this.props ", this.props);
        return <img src={this.props.src}/>
    },
});


var Home = React.createClass({
    render:function(){
        return <div className="Home">
            <div onClick={function(){
                console.log("------");
                this.refs.model.show({game:"123"});
            }.bind(this)}>Home</div>
            <Model ref="model">
                <Image src="img/ss.jpeg"/>
            </Model>
        </div>
    },
});

//console.log("----",document.getElementById("react_root"));
window.onload = function(){
    var app = ReactDOM.render(<App />, document.getElementById("react_root"));
    app.startActivity("Home", {data:"data"});
};




