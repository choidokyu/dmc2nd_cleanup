/**
 * @File Name : userInfo.js
 * @Description : 자바스크립트에서 사용자 정보를 사용하기 위한 객체
 * @author : 신현삼 mong32@gmail.com
 * @since : 2013. 04. 02.
 * @version : 1.0
 * 
 * <pre>
 *  == 개정이력(Modification Information) ==
 *   
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *  2013. 04. 02.  신현삼          최초 생성
 *  로그인/아웃은 spring security로 처리
 *	
 * </pre>
 */

var userInfo = {
	_sId:null,
	_sNm:null,
	brMode:null,		// 브라우저 모드
	getId:function() {
		return trim(this._sId);
	},
	setId:function(sId) {
		this._sId = sId;
	},
	getNm:function() {
		return trim(this._sNm);
	},
	setNm:function(sNm) {
		this._sNm = sNm;
	},
	clear: function() {
		var _m = this;
		_m.id = null;
		_m.nm = null;
	},
	// User Agent 모드 반환(-1:지원안함,1:웹표준지원브라우저,2:웹표준지원IE,3:IE8이상 호환성모드,-2:지원하지않는IE)
	getAgentMode: function() {
		var ua = navigator.userAgent;
		var supUa = ['MSIE','Chrome','Firefox','Opera','Safari'];	// 지원 브라우저

		var chk = -1;
		var msie = ua.indexOf('MSIE ');
		if (msie>=0) {	// MSIE 버젼 확인
			treng = ua.indexOf('Trident/');
			var ie_ver = parseInt(ua.substring(msie+5, ua.indexOf (".", msie )),10);
			var tr_ver = parseInt(ua.substring(treng + 8, ua.indexOf (".", treng)),10);
			if (ie_ver > 7) chk = 2;
			else if (tr_ver>=4) chk = 3;	// IE8 이상 호환성모드
			else chk = -2;
		} else {
			for (var i=0;i<supUa.length;i++) {
				if (ua.indexOf(supUa[i])>=0) {
					chk = 1;
					break;
				}
			}
		}
		return chk;
	},
	chkUAgent: function() {
		var chk = this.getAgentMode();
		var msg = '';
		if (chk==-2) {
			msg = '구버젼의 인터넷 익스플로러를 사용하고 계십니다.\n사이트 이용에 제약이 있으니 윈도우를 업데이트하시거나 다른 브라우저로 이용하시기 바랍니다.\n(인터넷익스플로러8 이상, 크롬, 파이어폭스, 사파리, 오페라 지원)';
		} else if (chk<0) {
			msg = '웹표준 지원이 확인되지 않은 브라우저를 사용하고 계십니다.\n사이트 이용에 제약이 있을 수 있으니 다른 브라우저로 이용하시기를 권장합니다.\n(인터넷익스플로러8 이상, 크롬, 파이어폭스, 사파리, 오페라 지원)';
		} else if (chk==3) {
			msg = '인터넷 익스플로러의 호환성 모드에서는 사이트 이용에 제약이 있을 수 있으니 호환성 모드를 해제하여 주시기 바랍니다.';
		}
		if (msg!='') showMsgWhile(msg,2000);
	}
};

