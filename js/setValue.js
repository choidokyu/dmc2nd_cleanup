
var selMenuInfo = {
	_langId:null,
	_parentId:null,
	getLangId:function() {
		console.log("get langId="+this._langId);
		return this._langId;
	},
	setId:function(langId) {
		this._langId = langId;
		console.log("set blangId="+this._langId);
	},
	getParentId:function() {
		console.log("get _parentId="+this._parentId);
		return this._parentId;
	},
	setParentId:function(parentId) {
		this._parentId = parentId;
		console.log("set _parentId="+this._parentId);

	},
	clear: function() {
		var _m = this;
		_m.id = null;
		_m.nm = null;
	}
};

