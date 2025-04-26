/**
 * @File Name : forceTriggerUnsupportEvent.js
 * @Description : 이벤트 호환성을 위한 스크립트
 * @author : 신현삼 mong32@gmail.com
 * @since : 2013. 04. 10.
 * @version : 1.0
 * 
 * <pre>
 *  == 개정이력(Modification Information) ==
 *   
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *  2013. 04. 10.	신현삼		최초 생성
 *  2013.04.11.	신현삼		jquery.ba-hashchange.js 사용으로 대체 (history 개발중)
 * </pre>
 */

if (!("onhashchange" in window)) {	// IE7 이하 
	if (isDebug && isDev) alert('hash change 이벤트 임의 생성');
	var hashHistory = [];
	var hashIdx = 0;
	var oHref = location.href;
	hashHistory[hashIdx] = oHref;
    var chkHashTid = setInterval(function() {
        var nHref = location.href;
        if (oHref !== nHref) {
            oHref = nHref;
            hashIdx++;
            hashHistory[hashIdx] = nHref;
            //if (isDebug) alert('hash change');
            $(window).trigger('hashchange');
        }
    }, 100);

	/*if (window.attachEvent) window.attachEvent('onhashchange', function() {
		if (isDebug) alert('hash change');
		$(window).trigger('hashchange');
	});*/
	/*$('a').on('click', function() {
		log.debug('hash change 임의 발생');
		var href = trim($(this).attr('href'));
		if (href!='' && href!='#') {
			$(window).trigger('hashchange');
		}
	});*/
    
    var oHistoryGo = history.go;
    history.go = function(n) {
		if (hashHistory.length>0 && hashIdx>0 && hashIdx<hashHistory.length) {
			hashIdx = hashIdx + n;
            //if (hashIdx<hashHistory.length) hashHistory = hashHistory.slice(hashIdx);
			var lastHash = hashHistory[hashIdx];
			location.href = lastHash;
		} else {
			oHistoryGo(n);
		}
    };
    
    
    var oHistoryBack = history.back;
    history.back = function() {
    	history.go(-1);
    };
}
