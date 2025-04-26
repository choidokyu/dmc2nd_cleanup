/**
 * @File Name : treeViewDetail.js
 * @Description : 트리노드의 Detail View 스크립트
 * @author : 신현삼 mong32@gmail.com
 * @since : 2013.04.26.
 * @version : 1.0
 * 
 * <pre>
 *  == 개정이력(Modification Information) ==
 *   
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *  2013.04.26  신현삼          최초 생성(treeView에서 Detail 기능만 분리)
 *  
 * </pre>
 */

$.fn.treeViewDetail = function($par, rootData, cmmData) {
	return new treeViewDetail(this, $par, rootData, cmmData);
};

/**
 * 생성자
 */
var treeViewDetail = function($obj, $par, rootData,cmmData) {
	var _m = this;
	hideLoading();
	log.debug('트리 디테일 뷰 생성');

	_m._$Detail = $obj;
	_m._parent = $par;
	if (_m._parent!=null) {
		_m._$TreePath = _m._parent._$TreePath;
		_m._$NowNode = _m._parent._$RootNode;
	}
	_m._jCmmData = cmmData;
	_m._sFirstCode = '';

	_m._aPath = ['ROOT'];
	_m._aPathTxt = ['◎'];
	_m._sLang = 'kor';
	_m._aToPath = new Array();
	
	_m._$Scroll = _m._$Detail;
	if (_m._parent==null) _m._$Scroll = $;

	// TODO 아래부분 밖으로 빼내기
	_m.hashListener = function() {
		var hsh = location.hash;
		log.debug('hash change : ' + hsh);
		if (hsh.length>1) {
			showLoading();
			if (_m._parent == null) {
				_m.setHashToPath(hsh);
			} else {
				_m._aPath = _m._parent._aPath;
				_m._aPathTxt = _m._parent._aPathTxt;
				_m._aToPath = _m._parent._aToPath;
			}

			if (_m._aToPath.length==1) {	// 대분류 보이기
				_m.viewDepth1(_m._aToPath[0]);
			} else if (_m._aToPath.length>1) {	// 중분류 보이기
				var hcode = '';
				if (_m._aToPath.length>2) hcode = _m._aToPath[_m._aToPath.length-1];
				_m.viewDepth2(_m._aToPath[1], hcode);
			}
		} else {
			if ($par==null && _m._sFirstCode!='') {
				_m.highLightDetail(_m._$Detail.find('li[id="' + _m._sFirstCode + '"]'));
			}
			_m._aToPath = new Array();
		}
		// TODO : 간혹 같은 중분류 레이어가 두개 생성되는 경우가 있음. 성능을 위해 트리노드 확장과 디테일뷰를 동시 처리하면서 둘다 load 이벤트가 발생하는 경우일 수 있으니 확인 필요. 
	};

	if (_m._$Detail!=null && _m._$Detail.length>0) {
		_m._$Detail.bind('load', function() {
			if (_m._parent != null) {
				_m._aPath = _m._parent._aPath;
				_m._aPathTxt = _m._parent._aPathTxt;
				_m._aToPath = _m._parent._aToPath;
			}
			log.debug('상세 정보창 로드 완료' + _m._aPath + ':' + _m._aPath.length + ' //// ' + _m._aToPath + ':' + _m._aToPath.length);

			/*if (_m._aPath.length>3) {
				//_m._$NowNode.parent().find('[data-tree-role="viewDetail"][data-code="' + _m._aPath[_m._aPath.length-1] + '"]').trigger('select');
				_m.highLightDetail(_m._$Detail.find('li[data-code="' + _m._aPath[_m._aPath.length-1] + '"]'));
			} else {
				_m.highLightDetail();
			}*/
			_m.highLightDetail();
			hideLoading('');
		});
	}

	// 통계 링크
	_m.get$Detail().on('click', '.depth_hw_st,.cl_detail_st', function() {
		var code = $(this).attr('data-code');
		var nm = $(this).prev().text();
		var params = encodeURI('stat_cl=' + code + '&nm=' + nm);
		//var url = contextRoot + 'stat/viewPop.do?stat_cl=' + code;
		var url = contextRoot + 'stat/viewPop/kcdDisStat.tsp?' + params;
		var pop = window.open(url, '질병통계', 'height=500,width=800,left=50px,top=50px,location=no,menubar=no,resizable=yes,scrollbars=no,status=no,titlebar=yes,toolbar=no');
	});

	return _m;
};


treeViewDetail.prototype.setHashToPath = function(hsh) {
	var _m = this;

	var hsh = unescape(hsh);
	var path = trim(hsh.replaceAll('#',''));
	var aTmp = path.split('|');
	_m._aToPath = aTmp;
	var code1 = aTmp[0];
	/*var code2 = aTmp[1];
	var hcode = '';*/
	/*if (trim(code1)!='' && code1!=_m._aPath[1]) {
		if (_m._aPath.length>1) _m._aPath = _m._aPath.slice(0,1);	// 대분류 이하 삭제
		_m._aPath = _m._aPath.concat(aTmp);
		log.debug('============ 대분류 변경 : ' + _m._aPath);
	} else {
		if (_m._aPath.length>1) _m._aPath = _m._aPath.slice(1,2);	// 중분류 이하 삭제
		_m._aPath = _m._aPath.concat(aTmp.slice(1,-1));
		log.debug('============ 변경 : ' + _m._aPath);
	}*/
	//if (aTmp.length>2) hcode = aTmp[aTmp.length-1];
};

treeViewDetail.prototype.setFirstCode = function(code) {
	var _m = this;
	_m._sFirstCode = code;
	_m._$Detail.find('#group_2_').attr('data-code',code).attr('id','group_2_' + code);
};

/**
 * getter
 */
treeViewDetail.prototype.get$Detail = function() {
	return this._$Detail;
};

/**
 * 현재 경로 설정
 * @param $obj : treenode 내 첫번째 자식 node 
 */
/*treeDetail.prototype._setPath = function(trig) {
	var _m = this;
	_m._aPath = nPath;
	_m._aPathTxt = nPathTxt;
	_m.highLightTree();
	_m._$TreePath.html(_m._aPathTxt.join(' > '));
};
*/

treeViewDetail.prototype.setDefaultContents = function(str) {
	var _m = this;
	_m._$Detail.find('#defaultContents').html(str);
};


/***************************
 * 아래 기능들은 필요에 따라 버젼별로 오버라이드 한다.
 */


/*******************************************************
 * v6 용 정의 : 기본으로 한다. 변경이 있을 경우 kcd.v7.js 등의 파일로 생성하여 오버라이드 한다.
 */


treeViewDetail.prototype.viewDepth1 = function(code) {
	var _m = this;
	showLoading();
	
	var depth = 1;
	/*var kor_nm = _m._$NowNode.attr('data-nm-kor');
	var eng_nm = _m._$NowNode.attr('data-nm-eng');
	var head = kor_nm + '</br>&nbsp;(' + eng_nm + ')';*/

	var $div = _m._$Detail.find('[id="group_1_' + code + '"]');
	if ($div.length<=0) {
		var paramData = {"ver":_m._jCmmData.ver,"upper_diss_cl_code":code};
		$.ajax({
			url: contextRoot + 'kcd/getInfo.do',
			async : true,
			dataType : 'html',
			data: paramData,
			success: function(res){
				$div = $('<div id="group_1_' + code + '" data-code="' + code + '" class="group_1"></div>');
				$div.html(res).data('paramData',JSON.stringify(paramData));
				_m._$Detail.append($div);
			}
		});
	}

	_m._$Detail.find('#defaultContents').hide(0);
	_m._$Detail.find('div[id^="group_1_"]').hide(0);
	_m._$Detail.find('div[id^="group_2_"]').hide(0);
	$div.show(0);
	_m._$Scroll.scrollTo(0,0);
	_m._$Detail.trigger('load');	
};


/**
 * 중분류 상세창 보여주기
 * @param code : 중분류코드
 * @param hcode : 하이라이트할 코드
 */
treeViewDetail.prototype.viewDepth2 = function(code,hcode) {
	var _m = this;

	log.debug('중분류 보여주기 : ' + code + ' / ' + hcode);	// TODO 두번 실행되는 경우가 있음...(특히 북마크)
	showLoading('');

	// 중분류 내용 보여주기
	var $div = _m._$Detail.find('[id="group_2_' + code + '"]');
	if ($div.length<=0) {
		$div = $('<div id="group_2_' + code + '" data-code="' + code + '" class="group_2"></div>');
		_m._$Detail.append($div);
	}

	_m._$Detail.find('#defaultContents').hide(0);
	_m._$Detail.find('div[id^="group_1_"]').hide(0);
	_m._$Detail.find('div[id^="group_2_"]').hide(0);
	$div.show(0);
	var paramData = {"ver":_m._jCmmData.ver,"mlsfc_code":code};

	if (trim($div.html())=='') {
		var head = _m._aPathTxt[1];
		$.ajax({
			url: contextRoot + 'kcd/getDetail.do',
			async : true,
			dataType : 'html',
			data: paramData,
			success: function(res){
				$div.html(res).data('paramData',JSON.stringify(paramData));
				$div.find('#head').html(head);

				/*if (hcode!='') _m.highLightDetail(_m._$Detail.find('li[id="' + hcode + '"]'));
				else _m._$Detail.scrollTo(0,0);*/
				_m._$Detail.trigger('load');
				hideLoading();
			}
		});
	} else {
		/*if (hcode!='') _m.highLightDetail(_m._$Detail.find('li[id="' + hcode + '"]'));
		else _m._$Detail.scrollTo(0,0);*/
		_m._$Detail.trigger('load');
		hideLoading();
	}
};

/**
 * 소분류 하이라이트
 * @param code
 */
treeViewDetail.prototype.highLightDetail = function($obj) {
	var _m = this;

	var $div = _m._$Detail.find('div[id^="group_2_"][data-code="' + _m._aToPath[1] + '"]');

	//if (typeof $obj == 'string') {
	if ($obj==null || $obj.length<=0) {
		//$div = $('div[id^="group_2_"][data-code="' + $obj + '"]');
		log.debug('소분류 포커스 : ' + _m._aPath + ' / ' + _m._aToPath);
		if (_m._aToPath.length>2) $obj = $div.find('li[id="' + _m._aToPath[_m._aToPath.length-1] + '"]:first');
		else if (_m._aPath.length>3) $obj = $div.find('li[id="' + _m._aPath[_m._aPath.length-1] + '"]:first');
	} else {
		log.debug('소분류 포커스 ' + $obj.attr('id'));
		//$('div[id^="group_2_"]').hide(0);
		$div = _m._$Detail.find('div[id^="group_2_"]').has($obj);
	}

	if ($div.length<=0) {
		log.debug('중분류 정보 로드되지 않음');
		return;
	}
	$div.show(0, function() {
		// 상세정보 하이라이트 표시
		if ($obj!=null && $obj.length>0) {
			log.debug($obj.outerHTML());
			_m._$Scroll.scrollTo($obj,100,{offset:-50});
			_m._$Detail.find('h4').removeClass('hilight');
			_m._$Detail.find('li > div').removeClass('hilight');
			$obj.find('div:eq(1)').addClass('hilight');
		} else {
			// 중분류 포커스
			log.debug('중분류 포커스');
			_m._$Scroll.scrollTo(0,0);
			$(this).find('h4').addClass('hilight');
			_m._$Detail.find('li > div').removeClass('hilight');
		}
	});
	hideLoading();
	
};


