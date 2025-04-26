/**
 * @File Name : httpRequest.js
 * @Description : GET 방식으로 전달되는 파라미터를 자바스크립트에서 사용하기 위한 객체
 * @author : 신현삼 mong32@gmail.com
 * @since : 2013.03.27.
 * @version : 1.0
 * 
 * <pre>
 *  == 개정이력(Modification Information) ==
 *   
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *  2013.03.27  신현삼          최초 생성
 *  
 * </pre>
 */

/**
 * GET 방식으로 전달된 파라미터를 객체로
 */
var httpRequest = function() {
	var _m = this;
	_m.params = [];
	_m.init();
};

httpRequest.prototype.init = function(enc) {
	var _m = this;
	var param = [];
	var paramValue = {};

	var pmt = location.search;
	log.debug(pmt);
	
	if (enc==null) enc=1;
	
	if (pmt.length > 1 && pmt.indexOf("?")>-1) {
		if (enc==1) pmt = decodeURI(pmt);
		pmt = pmt.substring(1,pmt.length);
		param = pmt.split("&");
	}

	for (var i=0; i<param.length; i++) {
		if (param[i].indexOf("=")>-1) {
			var pName = param[i].split("=")[0];
			var pValue = param[i].split("=")[1];
			paramValue[pName] = pValue;
		}
	}
	_m.params = paramValue;
	return paramValue;
};


httpRequest.prototype.get = function(nm) {
	var _m = this;
	if (_m.params[nm]!=null) return _m.params[nm];
	else return '';
};

