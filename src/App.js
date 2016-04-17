/**
 * Created by wugz on 16/3/19.
 */


var Home = React.createClass({
    render:function(){
        return <div>home</div>
    },
});

//console.log("----",document.getElementById("react_root"));
window.onload = function(){
    var app = ReactDOM.render(<App />, document.getElementById("react_root"));
    app.startActivity("Home", {data:"data"});
};




