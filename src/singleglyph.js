var React=require("react");
var E=React.createElement;
var SingleGlyph=React.createClass({

	render:function() {
		return E("span",null,"composing"+ this.props.expression);
	}


})
module.exports=SingleGlyph;