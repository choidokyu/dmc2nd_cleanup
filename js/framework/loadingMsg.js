/**
 * @File Name : validator.js
 * @Description : 로딩중 메시지 보이기/숨기기 : multi ajax 작업 처리 확인을 위해
 * @author : 신현삼 mong32@gmail.com
 * @since : 2012.01.
 * @version : 1.0
 * 
 * <pre>
 *  == 개정이력(Modification Information) ==
 *   
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *  2012.01.  신현삼          최초 생성
 *  2013.03.27	신현삼		common.js 에서 분리
 * </pre>
 */

/******************************************
 * ajax1, ajax2, ajax3 등을 비동기 요청했을때 ajax1,ajax2가 아직 처리되지 않았는데 ajax3가 처리 완료되어서 로딩 메시지가 사라지는 문제 발생 시 사용.
 * 각각 요청시 addMsg 호출. 처리 완료시 hide 호출 : addMsg를 count 하여 hide시 count가 0이 되었을때 메시지 숨김.
 * 트랜잭션이 먹는 비즈니스 로직별로 생성하여 사용할것 : 
 * 생성 : var loading = new loadingMsg('처리중')
 *  처리로직1 추가 loading.addMsg('처리1')
 *  --> 처리 완료에 loading.hide()
 *  처리로직2 추가 loading.addMsg('처리2')
 *  --> 처리 완료에 loading.hide()
 * !!!!!!!!!!!!!!!!!!!!! 주의 !!!!!!!!!!!!!!!!!!!!!!!!!
 * addMsg와 hide의 수가 일치하지 않으면 메시지가 사라지지 않는 문제 발생할 수 있음.
 * 로딩 메시지가 떠 있는 상태에서는 keydown 이벤트를 prevent 시킴(키입력 안됨). 마우스나 터치는 로딩메시지 레이어가 z-index 최상단에 위치하게 하여 막을 수 있음.
 * 문제점 : 스크립트 처리량이 무거울 경우 로딩 메시지가 나타나기 전 다른 동기식 스크립트 처리로 인해 메시지가 보이지 않을 수 있음 : setTimeout으로 다음 스크립트 처리를 지연 시키면 임시 해결 가능.
 * TODO : 하이브리드일 경우 Plugin 처리를 통해 OS의 로딩바를 보여주는게 좋을듯 하다.
 */

var loadingMsg = function(msg) {
	this._msg = '';
	this._add_msg = '';
	this._loadingCnt = 0;
	this._totalCnt = 0;
	this._delay = 200;
	//this._layerNm = 'commonMsgLayer';
	if (msg!=null) {
		this.show(msg);
	}
};

loadingMsg.prototype.setDelay = function(d) {
	this._delay = d;
};

loadingMsg.prototype.show = function(msg) {
	log.debug('로딩 메시지 보여줌...' + msg);
	$('#commonMsg').html(trim(msg));
	$('#commonMsgLayer').css('visibility','visible');
	// 키 이벤트 안먹게 (tab,enter)...
	if (this._loadingCnt>=1) $(document).on('keydown.prevent',preventEv);
};

loadingMsg.prototype.addMsg = function(msg) {
 	//$('#commonMsg').html($('#commonMsg').html() + '<br/>' + msg);
	$('#commonMsg').html(trim(msg));
	this._loadingCnt++;
	this._totalCnt++;
	if (this._loadingCnt>=1) this.show(msg);
	log.debug("LOADING MSG ADD COUNT : " + this._loadingCnt + ' : ' + msg);
};

loadingMsg.prototype.hide = function(dl) {
	log.debug("LOADING MSG HIDE COUNT : " + this._loadingCnt);
	this._loadingCnt--;
	this.setProcBar();
	if (this._loadingCnt<1) {
		$.mobile.bHideLoading = true;
		if (dl==null) dl = this._delay;
		setTimeout('hideDiv(\'commonMsgLayer\')', dl);
		this._loadingCnt = 0;
		this._totalCnt = 0;
		$('a,button').blur();
		// 키 이벤트 다시 먹게
		$(document).off('keydown.prevent',preventEv);
	}
};


loadingMsg.prototype.setProcBar = function() {
	var _m = this;
	//var $div1 = $('commonMsgLayer').find('div#procdiv');
	var $div = $('#commonMsgLayer').find('#procbar');
	if (_m._loadingCnt>0 && _m._totalCnt>0) {
		var ing = _m._totalCnt - _m._loadingCnt;
		var wid = parseInt(ing / _m._totalCnt * 100, 10);
		$div.css('width', wid + '%');
	} else {
		$div.css('width','0px');
	}
};

// 카운트를 초기화
loadingMsg.prototype.clear = function() {
	var _m = this;
	_m._loadingCnt = 0;
	_m._totalCnt = 0;
	_m.hide();
};
