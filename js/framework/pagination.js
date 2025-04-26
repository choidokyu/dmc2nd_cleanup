/**
 * @File Name : pagination.js
 * @Description : ajax 데이터 처리시 페이징 처리를 위한 객체
 * @author : 신현삼 mong32@gmail.com
 * @since : 2013. 04. 12.
 * @version : 1.0
 * 
 * <pre>
 *  == 개정이력(Modification Information) ==
 *   
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *  2013. 04. 12.	신현삼		최초 생성 : common.js 에서 분리하여 prototype 형태로 수정.
 *  레이어의 내용을 템플릿으로 삼아 페이지 링크 생성
 *  2013. 04. 19.	신현삼		hash change 이벤트 사용으로 변경.(history 이동 가능)
 *  
 * </pre>
 */


/*******
 * 생성자
 * @param opt = {"pageSize":한페이지당 목록수, "unitSize":페이지링크 블럭수}
 * @param runFunc = 페이지 링크 클릭시 실행할 메소드
 */
$.fn.pagination = function(opt,runFunc) {
	return new pagination(this, opt, runFunc);
};


var pagination = function($obj,opt,runFunc) {
	var _m = this;
	_m._$Div = $obj;

	_m._jHashData = {"page":1};
	_m.listenHash = true;
	_m._iCurPage = 1;
	_m._iCurUnit = 1;
	_m._iFirstIndex = 0;
	_m._iTotalCnt = 0;
	_m._iPageSize = parseInt(opt.pageSize,10);
	_m._iUnitSize = parseInt(opt.unitSize,10);
	_m._aIgnoreHash = [];

	log.debug('==== Pagination Init ====== ' + _m._iPageSize + ' / ' + _m._iUnitSize);

	_m.params = {};
	_m._run = runFunc;

	// page label
	_m._$first = _m._$Div.find('[data-page-role="first"]');
	_m._$prev = _m._$Div.find('[data-page-role="prev"]');
	_m._$current = _m._$Div.find('[data-page-role="current"]');
	_m._$other = _m._$Div.find('[data-page-role="other"]');
	_m._$next = _m._$Div.find('[data-page-role="next"]');
	_m._$last = _m._$Div.find('[data-page-role="last"]');
	_m._$pages = _m._$Div.find('[data-page-role="pages"]');
	_m._$infoFirstIndex = _m._$Div.parents().find('[data-page-info-role="first"]:first');
	_m._$infoLastIndex = _m._$Div.parents().find('[data-page-info-role="last"]:first');
	_m._$infoTotalCnt = _m._$Div.parents().find('[data-page-info-role="totalCnt"]:first');
	_m._$form = $('[data-page-role="form"]');
	_m._$form.submit(function() {
		var page = $(this).find('[data-page-role="go_page"]').val();
		if (isNaN(page)) return false;
		_m.movePage(page);
		return false;
	});
	
	_m._$first.unbind('.page');
	_m._$prev.unbind('.page');
	_m._$next.unbind('.page');
	_m._$last.unbind('.page');
	_m._$first.bind('click.page', function() { _m.setHash(1); return false; });
	_m._$prev.bind('click.page', function() { _m.setHash(_m._iPrevUnit); return false; });
	_m._$next.bind('click.page', function() { _m.setHash(_m._iNextUnit); return false; });
	_m._$last.bind('click.page', function() { _m.setHash(_m._iLastPage); return false; });
	
	_m._$pages.on('click.page', '[data-page-role="other"]', function() {
		log.debug('페이지 이동 : ' + $(this).data('page'));
		_m._iCurPage = parseInt($(this).data('page'),10);
		_m.setHash(_m._iCurPage);
		return false;
	});

	_m._$pages.on('click.page', '[data-page-role="current"]', function() { return false; });

	// Hash Change에 따라 페이지 이동 처리
	_m.getHashData();
	var hashListener = function() {
		//if (_m.listenHash && !_m.isIgnoreHash()) {
		if (_m.listenHash) {
			log.debug('HASH CHANGE : ' + window.location.hash);
			_m.getHashData();
			var page = _m._jHashData.page;
			log.debug('........page : ' + page);
			_m.movePage(page);
		}
	};
	
	$(window).unbind('.page');
	$(window).on('hashchange.page', hashListener);

};

pagination.prototype.initHash = function() {
	var hsh = window.location.hash;
	if (hsh.length>1) { // 주소를 직접 입력하거나 브라우저의 즐겨찾기를 이용할 경우
		$(window).trigger('hashchange');
	}
};

// 초기화
pagination.prototype.clear = function() {
	var _m = this;
	_m._iFirstIndex = 0;
	_m._iCurPage = 1;
	_m._iCurUnit = 1;
	_m._iCurFirstPage = 1;
	_m._iCurLastPage = _m._iUnitSize;
	_m._iFirstPage = 1;
	_m._iLastPage = _m._iUnitSize;
};

pagination.prototype.setCurPage = function(iPage) {
	var _m = this;
	_m._iCurPage = iPage;
	_m._iCurUnit = Math.ceil(_m._iCurPage / _m._iUnitSize);
};

// 페이징 계산
pagination.prototype.setPagingInfo = function(iTotalCnt) {
	var _m = this;
	_m._iTotalCnt = iTotalCnt;

	// 페이지 계산
	_m._iCurUnit = Math.ceil(_m._iCurPage / _m._iUnitSize);				// 현재 블록 번호
	_m._iTotalPageCnt = Math.ceil(_m._iTotalCnt / _m._iPageSize);		// 총 페이지수
	_m._iTotalUnitCnt = Math.ceil(_m._iTotalPageCnt / _m._iUnitSize);		// 총 블록 수
	_m._iCurFirstPage = _m._iUnitSize * (_m._iCurUnit - 1) + 1;			// 현재 페이지 블럭의 첫 페이지
	_m._iCurLastPage = _m._iCurFirstPage + _m._iUnitSize - 1;				// 현재 페이지 블럭의 마지막 페이지
	_m._iFirstPage = 1;
	_m._iLastPage = _m._iTotalPageCnt;
	if (_m._iTotalPageCnt < _m._iCurLastPage) _m._iCurLastPage = _m._iTotalPageCnt;	// 현재 페이지 블럭의 마지막 페이지
	_m._iPrevUnit = (_m._iCurUnit - 2) * _m._iUnitSize + 1;
	_m._iNextUnit = _m._iCurUnit * _m._iUnitSize + 1;

	log.debug("RENDERING PAGING HTML : " + _m._iFirstIndex +  ':' + _m._iCurFirstPage + ' / ' + _m._iCurLastPage + ' / ' + _m._iTotalCnt + ' / ' + _m._iTotalPageCnt + ' / ' + _m._iTotalUnitCnt + ' / ' + _m._iFirstPage + ' / ' + _m._iLastPage);
};

// HTML 렌더링
pagination.prototype.renderHtml = function(iTotalCnt) {
	var _m = this;

	_m._iTotalCnt = iTotalCnt;
	_m.setPagingInfo(iTotalCnt);

	// 페이지 링크
	_m._$pages.empty();
	for(var i = _m._iCurFirstPage; i<=_m._iCurLastPage; i++){
	    if (i != _m._iCurPage){
	    	var $obj = _m._$other.clone();
	    	_m._$pages.append($obj.data('page',i).html(i));
	    } else {
	    	var $obj = _m._$current.clone();
	    	_m._$pages.append($obj.html(i));
	    }
	}
	
	_m.afterRender();

};

// 페이지 이동 처리
pagination.prototype.movePage = function(page) {
	var _m = this;
	if (page!=null) {
		_m._iCurPage = parseInt(page,10);
		_m.getData();
	}
	_m.setHash(_m._iCurPage);
};

// 데이터 가져오기
pagination.prototype.getData = function() {
	var _m = this;
	_m._iFirstIndex = (_m._iCurPage - 1) * _m._iPageSize;
	_m._iLastIndex = _m._iCurPage * _m._iPageSize;

	_m.params = {"pageSize":_m._iPageSize,"firstIndex":_m._iFirstIndex,"lastIndex":_m._iLastIndex};
	_m.params = $.extend({},_m.params,_m._jHashData);

	run(_m._run);	// common.js
};

// renderHTML 처리 후 실행
pagination.prototype.afterRender = function() {
	var _m = this;
	if (_m._$infoFirstIndex.length>0) _m._$infoFirstIndex.html(_m._iFirstIndex + 1);
	if (_m._$infoLastIndex.length>0) _m._$infoLastIndex.html(_m._iLastIndex);
	if (_m._$infoTotalCnt.length>0) _m._$infoTotalCnt.html(_m._iTotalCnt);
	if (_m._$form!=null) {
		var $obj = _m._$form.find('[data-page-role="go_page"]');
		if ($obj.length>0) $obj.val(_m._iCurPage);
	}
};

// hash change
pagination.prototype.setHash = function(p) {
	var _m = this;
	_m._jHashData.page = p;
	var n_hash = _m.serializeHash();
	log.debug('NEW HASH : ' + n_hash);
	window.location.hash = n_hash;
};

pagination.prototype.getHashData = function() {
	var _m = this;
	var hsh = unescape(location.hash);
	hsh = trim(hsh.replaceAll('#',''));
	var hshData = {};
	if (hsh.indexOf('&')>0) {
		var aTmp = hsh.split('&');
		for (var i=0;i<aTmp.length;i++) {
			var aTmp2 = aTmp[i].split('=');
			hshData[aTmp2[0]] = aTmp2[1];
		}
	} else if (hsh.length>1 && hsh.indexOf('=')>0) {
		var aTmp = hsh.split('=');
		hshData[aTmp[0]] = aTmp[1];
	} else {
		hshData.page = 1;
	}
	_m._jHashData = hshData;
	return hshData;
};

pagination.prototype.serializeHash = function() {
	var _m = this;
	var hsh = '';
	//log.debug(JSON.stringify(_m._jHashData));
	for (k in _m._jHashData) {
		hsh += k + '=' + _m._jHashData[k] + '&';
	}
	if (hsh.length>0) hsh = hsh.slice(0,-1);
	return '#' + hsh;
};

