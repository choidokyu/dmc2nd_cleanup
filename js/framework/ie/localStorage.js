/**
 * @File Name : localStorage.js
 * @Description : localStorage 지원용 스크립트
 * @author : 신현삼 mong32@gmail.com
 * @since : 2013. 04. 26.
 * @version : 1.0
 * 
 * <pre>
 *  == 개정이력(Modification Information) ==
 *   
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *  2013. 04. 26.	신현삼		최초 생성
 *  
 * </pre>
 */


if (window.localStorage == null) {	// IE7 이하
	var localStorage = {
		items:{},
		getItem:function(key) {
			var val = this.items[key];
			if (val==null) val = Cookies.getCookie(key);
			return val;
		},
		setItem:function(key,val) {
			this.items[key] = val;
			Cookies.setCookie(key, val);
		}
	};
	
	var Cookies = {
		getCookie:function(cName) {
			cName = cName + '=';
			var cookieData = document.cookie;
			var start = cookieData.indexOf(cName);
			var cValue = '';
			if(start != -1){
				start += cName.length;
				var end = cookieData.indexOf(';', start);
				if(end == -1)end = cookieData.length;
				cValue = cookieData.substring(start, end);
			}
			return unescape(cValue);
		},
		setCookie:function(cName, cValue, cDay){
			var expire = new Date();
			expire.setDate(expire.getDate() + cDay);
			cookies = cName + '=' + escape(cValue) + '; path=/ ';
			if(typeof cDay != 'undefined') cookies += ';expires=' + expire.toGMTString() + ';';
			document.cookie = cookies;
		}
	};
	window.localStorage = localStorage;
}
