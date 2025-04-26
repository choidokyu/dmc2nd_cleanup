/**
 * @File Name : treeView.js
 * @Description : 트리노드 생성을 위한 js
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
 *  2013.04.26	신현삼		treeViewDetail.js 분리
 * </pre>
 */

$.fn.treeView = function(dataUrl, rootData, cmmData) {
	return new treeView(this, dataUrl, rootData, cmmData);
};

/**
 * 생성자
 * @param $obj : 트리뷰를 사용할 마스터 레이어
 * @param dataUrl : 루트 JSON 데이터를 요청할 URL
 * @param rootData : 루트 데이터 요청시 파라미터
 * @param cmmData : 모든 요청에 공통으로 들어갈 파라미터(버젼정보)
 */
var treeView = function($obj,dataUrl,rootData,cmmData) {
	var _m = this;
	log.debug('트리 노드 생성');

	//_m._$RootNode = $rn;
	_m._$RootNode = $obj.find('[data-tree-role="node-root"]');
	_m._$RootNode.data('paramData', rootData);
	_m._$NowNode = _m._$RootNode;
	_m._iNowDepth = 0;
	_m._$Detail = $obj.find('[data-tree-role="node-detail"]');
	_m._$TreePath = $obj.find('[data-tree-role="node-path"]');
	_m._sDataUrl = dataUrl;
	_m._jCmmData = cmmData;
	_m._jParamData = null;
	_m._sPreParamData = "";
	_m._bLastNode = false;
	_m.$TreeViewDetail= null;

	_m._aPath = ['ROOT'];
	_m._aPathTxt = ['◎'];
	_m.expandHtml = '-&nbsp;';
	_m.shortHtml = '+&nbsp;';
	_m._sLang = 'kor';
	_m._aToPath = new Array();

	_m._$BkmkLi = null;	// 즐겨찾기 목록 ul

	// 디테일 뷰
	if (_m._$Detail!=null && _m._$Detail.length>0) _m.$TreeViewDetail= _m._$Detail.treeViewDetail(_m, rootData, _m._jCmmData);
	
	_m._expand(_m._$RootNode,true);

	_m.hashListener = function() {
		var hsh = location.hash;
		log.debug('hash change : ' + hsh);
		if (hsh.length>3) {
			if (hsh.indexOf('#search')==0) {
				log.debug('검색 결과 보여주기 : ' + hsh);
				var aTmp = hsh.split('|');
				var schParam = aTmp[1];
				if (trim(schParam)!='') {
					_m._search(schParam);
				}
			} else {
				showLoading();
				_m.setHashToPath(hsh);
				// 검색결과 숨김
				if (_m._$Detail!=null && _m._$Detail.length>0) _m._$Detail.find('div[id^="kcdSearch_"]').hide(0);
				// 노드 확장
				_m._expandTo();
				if (_m.$TreeViewDetail!=null) _m.$TreeViewDetail.hashListener();
			}
		} else {
			_m._aToPath = new Array();
		}
		// TODO : 간혹 같은 중분류 레이어가 두개 생성되는 경우가 있음. 성능을 위해 트리노드 확장과 디테일뷰를 동시 처리하면서 둘다 load 이벤트가 발생하는 경우일 수 있으니 확인 필요. 
	};

	_m._$RootNode.on('click', '[data-tree-role="toggle"]', function() {
		/*var $obj = $(this).parent().find('[data-tree-role="viewDetail"]');
		_m._toggleUnder($obj);*/
		_m._toggleUnder($(this));
	});

	_m._$RootNode.on('expand', '[data-tree-role="toggle"]', function() {
		/*var $obj = $(this).parent().find('[data-tree-role="viewDetail"]');
		_m._toggleUnder($obj);*/
		_m.expandUnder($(this));
	})

	_m._$RootNode.on('dblclick', '[data-tree-role="viewDetail"]', function() {
		//var $obj = $(this).parent().find('[data-tree-role="toggle"]');
		log.debug('더블클릭');
		_m._toggleUnder($(this));
	});
	
	_m._$RootNode.bind('load', function() {
		log.debug('트리 노드 로드 완료' + _m._aPath + ':' + _m._aPath.length + ' //// ' + _m._aToPath + ':' + _m._aToPath.length);
		_m._setPath();
		_m.highLightTree();
		hideLoading();
	});
	
	_m._$RootNode.bind('changenode', function() {
		log.debug('트리 노드 변경' + _m._aPath + ':' + _m._aPath.length + ' //// ' + _m._aToPath + ':' + _m._aToPath.length);
		_m._setPath();
		_m.highLightTree();
		hideLoading();
	});
	
	// 검색폼
	//$('#kcdSearchFrm').bind('submit', function() {
	$('form[data-tree-role="search"]').bind('submit', function() {
		$frm = $(this);
		$frm.find('input[name="ver"]').val(_m._jCmmData.ver);
		if (trim($frm.find('input[name="searchWrd"]').val()).getByte()<2) {	// 하나 체크하는데 validator 사용할 필요까진 없을듯.
			showMsg('검색어를 2자 이상 입력해주세요',function() { $frm.find('input[name="searchWrd"]').focus(); });
			return false;
		}
		params = $frm.serialize();
		log.debug('SEARCH2 : ' + params);
		window.location.hash = '#search|' + params;
		return false;
	});

	return _m;
};


treeView.prototype.setHashToPath = function(hsh) {
	var _m = this;

	var hsh = unescape(hsh);
	var path = trim(hsh.replaceAll('#',''));
	var aTmp = path.split('|');
	_m._aToPath = aTmp;
	var code1 = aTmp[0];
	/*var code2 = aTmp[1];
	var hcode = '';*/
	if (trim(code1)!='' && (code1!=_m._aPath[1] || aTmp.length==1)) {
		if (_m._aPath.length>1) _m._aPath = _m._aPath.slice(0,1);	// 대분류 이하 삭제
		_m._aPath = _m._aPath.concat(aTmp);
		log.debug('============ 대분류 변경 : ' + _m._aPath);
	} else {
		if (_m._aPath.length>1) _m._aPath = _m._aPath.slice(1,2);	// 중분류 이하 삭제
		_m._aPath = _m._aPath.concat(aTmp.slice(1,-1));
		log.debug('============ 변경 : ' + _m._aPath);
	}
	//if (aTmp.length>2) hcode = aTmp[aTmp.length-1];
};

/**
 * getter
 */
treeView.prototype.get$Detail = function() {
	return this._$Detail;
};

/**
 * setter
 */
treeView.prototype.set$Detail = function($obj) {
	if ($obj!=null) this._$Detail = $obj;
};

/******************************************
 * 검색 기능
 * @param $frm
 */

treeView.prototype._search = function($frm) {
	var _m = this;
	var params = '';
	log.debug('SEARCH : ' + typeof $frm);
	if (typeof $frm == 'string') {
		params = $frm;
		log.debug('SEARCH1 : ' + params);
	} else {
		return;
	}
	
	if (_m._$Detail!=null && _m._$Detail.length>0)  {
		_m._$Detail.find('div[id^="kcdSearch_"]').hide(0);
		_m._$Detail.find('#defaultContents').hide(0);
		_m._$Detail.find('div[id^="group_1_"]').hide(0);
		_m._$Detail.find('div[id^="group_2_"]').hide(0);
	
		var $objAll = _m._$Detail.find('div[id^="kcdSearch_"][data-params!="' + params + '"]');
		if ($objAll.length>3) {	// 최근 3개의 검색결과만 갖고 있자.너무 많으면 화면 제어가 느려질듯.
			$objAll.first().remove();
		}
		var $chk = _m._$Detail.find('div[id^="kcdSearch_' + params + '"]');
		$('#kcdBookmark').hide('fast');
	
		if ($chk.length>0) {
			$objAll.hide(0);
			$chk.show(0);
			_m._$Detail.scrollTo(0,0);
		} else {
			$.ajax({
				url: contextRoot + 'kcd/kcdSearch.do',
				async : true,
				dataType : 'html',
				data: params,
				success: function(res){
					var sHtml = '<div id="kcdSearch_' + params + '" data-params="' + params + '">' + res + '</div>';
					//_m._$Detail.html(sHtml);
					_m._$Detail.prepend(sHtml);
					_m._$Detail.scrollTo(0,0);
					window.location.hash = '#search|' + params;
					hideLoading();
				}
			});
		}
	} else {
		log.debug('검색결과를 보여줄 디테일뷰가 없습니다.');
	}
};

/**
 * 노드 토글 기능
 * @param obj
 */
treeView.prototype._toggleUnder = function($obj) {
	var _m = this;
	//var $obj = $(obj);
	var params = unescape($obj.attr('data-params'));
	if (params=='') params = '{}';

	var code = $obj.attr('data-code');
	//_m._$NowNode = $obj.parent().find('ul:first');
	_m._$NowNode = $obj.parents().find('ul[data-code="' + code + '"]');
	//_m._$NowNode = _m._$RootNode.find('ul[data-code="' + code + '"]');

	log.debug('노드 상태 : ' + _m._$NowNode.length + ' : ' + _m._$NowNode.attr('data-view-st'));
	//if (_m._$NowNode.is(':visible')) {
	if (trim(_m._$NowNode.attr('data-view-st'))=='' || _m._$NowNode.attr('data-view-st')=='N') {
		/*$obj.parent().removeClass('collapse').addClass('expand');
		$obj.parent().find('[data-tree-role="toggle"]').find('.icon').html(_m.expandHtml);*/
		_m.expandUnder($obj);
	} else {
		/*$obj.parent().removeClass('expand').addClass('collapse');
		$obj.parent().find('[data-tree-role="toggle"]').find('.icon').html(_m.shortHtml);*/
		$obj.parents('li:first').removeClass('expand').addClass('collapse');
		$obj.parents().find('[data-tree-role="toggle"][data-code="' + code + '"]').find('.icon').html(_m.shortHtml);
		_m._shorten(0);
		_m._$RootNode.trigger('changenode');
		window.location.hash = '';
		_m._$NowNode.attr('data-view-st','N');
	}
};


/**
 * 현재 경로 설정
 *  
 */
treeView.prototype._setPath = function(trig) {
	var _m = this;

	var $node = _m._$NowNode;
	var depth = parseInt($node.attr('data-depth'),10);

	log.debug('\\\\\\\\\\\\\ _setPath : ' + depth);

	var code = $node.attr('data-code');
	var par_code = '';
	//var txt = $node.attr('data-nm-' + _m._sLang);
	var txt = $node.attr('data-nm-kor') + '(' + $node.attr('data-nm-eng') + ')';
	var nPath = new Array();
	var nPathTxt = new Array();

	//if (_m._aPath.length-1<=depth) {
	if (depth>=2) {
		//par_code = $node.parent().parent().attr('data-code');
		var par_code = $node.attr('data-upper-code');
		//par_code = $node.parents().find('ul[data-code="' + up_code + '"]');
		//log.debug('CCCCCCCCCCCCCCCCCCCCCCCCCCCC ' + _m._aPath[depth-1] + '/' + par_code);
		if (_m._aPath[depth-1]!=par_code) {
			//log.debug('UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU 상위 변경');
			//for (var $par=$node;;$par = $par.parent().parent()) {
			//var i = 0;
			for (var $par=$node;;$par = $par.parents().find('ul[data-code="' + $par.attr('data-upper-code') + '"]')) {
				var tmp_depth = parseInt($par.attr('data-depth'),10);
				//log.debug($par.outerHTML() + ' ////// ' + tmp_depth + ' ///  ' + $par[0].tagName);
				//log.debug($par.attr('data-code') + ' >> ' + $par.attr('data-upper-code'));
				if (tmp_depth<1 || $par==null) break;
				var tmp_code = $par.attr('data-code');
				if ($par[0].tagName.toLowerCase()!='ul' || tmp_code == $par.attr('data-upper-code')) break;
				var tmp_txt = $par.attr('data-nm-kor') + '(' + $par.attr('data-nm-eng') + ')';
				_m._aPath[tmp_depth] = tmp_code;
				_m._aPathTxt[tmp_depth] = tmp_txt;
				//i++;
			}
		}
	}

	if (_m._aPath.length>1) {
		//log.debug(_m._aPath.length + ' SSSSSSSSSSSSSSSSSSSSSSSSSSSS ' + depth);
		nPath = _m._aPath.slice(0,depth);
		nPathTxt = _m._aPathTxt.slice(0, depth);
		nPath[depth] = code;
		nPathTxt[depth] = txt;
	} else {
		nPath[1] = code;
		nPathTxt[1] = txt;
	}

	_m._aPath = nPath;
	_m._aPathTxt = nPathTxt;
	_m._$TreePath.html(_m._aPathTxt.join(' > '));
};


treeView.prototype.expandUnder = function($obj) {
	var _m = this;

	var params = unescape($obj.attr('data-params'));
	if (params=='') params = '{}';

	var code = $obj.attr('data-code');
	//_m._$NowNode = $obj.parent().find('ul:first');
	_m._$NowNode = $obj.parents().find('ul[data-code="' + code + '"]');
	//_m._$NowNode = _m._$RootNode.find('ul[data-code="' + code + '"]');

	$obj.parents('li:first').removeClass('collapse').addClass('expand');
	$obj.parents().find('[data-tree-role="toggle"][data-code="' + code + '"]').find('.icon').html(_m.expandHtml);
	_m._$NowNode.data('paramData', JSON.parse(params));
	_m._expand($obj);
	_m._$RootNode.trigger('changenode');
	_m._$NowNode.attr('data-view-st','Y');	
};

/**
 * 노드 확장
 */
treeView.prototype._expand = function($obj,first) {
	var _m = this;
	showLoading('');
	
	//$obj = $(obj);
	//_m._$NowNode = $obj.find('ul[id^="treeNode_"]');
	var paramData = _m._$NowNode.data('paramData');
	if (paramData!=null && typeof(paramData)!='object') paramData = JSON.parse(paramData);
	paramData = $.extend({},_m._jCmmData, paramData);
	log.debug('파라미터 데이터 ' + JSON.stringify(paramData) + ' / ' + _m._bLastNode);
	_m._jParamData = paramData;
	//_m._iNowDepth = parseInt(_m._$NowNode.attr('data-depth'),10);

	var bLastNode = _m._$NowNode.attr('data-last-node');
	if (bLastNode == 'Y') _m._bLastNode = true;
	else _m._bLastNode = false;

	if (_m._$NowNode.find('li').length<=0 && !_m._bLastNode) {
		$.ajax({
			url: contextRoot + _m._sDataUrl,
			async : true,
			dataType : 'json',
			data: paramData,
			success: function(res){
				if (res.result != 'S') {
					showMsg(res.msg);
					return false;
				}

				var li_html = '<li>검색된 자료가 없습니다</li>';
				if (res.list!=null) {
					_m._$NowNode.empty();
					if (res.list.length>0) {
						//_m._iNowDepth++;
						li_html = _m.getLiHtml(res.list);
					}
				}

				_m._$NowNode.append(li_html);

				if (first) {
					var hsh = location.hash;
					if (hsh.length>3) { // 주소를 직접 입력하거나 브라우저의 즐겨찾기를 이용할 경우
						$(window).trigger('hashchange');
					}
				}

				_m._continueExpand();
				_m.onExpand();
			}
		});
	} else {
		_m._$RootNode.trigger('load');
		_m.onExpand();
	}
	//log.debug('>>>>>>>>>>>>>>>> show ' + _m._$NowNode.outerHTML());
	_m._$NowNode.show(0);
};

/**
 * 하위 노드까지 계속 확장
 */
treeView.prototype._continueExpand = function() {
	var _m = this;

	if (_m._aToPath.length>0 && _m._aToPath[0]!=null) {
		var toCode = null;
		//var code = _m._$NowNode.attr('data-code');
		var nowCode = _m._aPath[_m._aPath.length-1];
		toCode = _m._aToPath[_m._aPath.length-1];
		if (toCode==nowCode) {
			toCode = '';
		}

		if (trim(toCode)!='') {
			_m._$NowNode.find('[data-tree-role="toggle"][data-code="' + toCode + '"]').trigger('click');
		} else {
			_m._$RootNode.trigger('load');
		}
	}
};


/*********************
 * aToPath 정보에 따라 노드 확장
 */
treeView.prototype._expandTo = function() {
	var _m = this;

	//var code = _m._aToPath[1];
	var code = _m._aToPath[_m._aToPath.length-1];
	var hcode = '';
	if (_m._aToPath.length>2) hcode = _m._aToPath[_m._aToPath.length-1];

	if (trim(hcode)!='') _m._$NowNode = _m._$RootNode.find('ul[data-code="' + hcode + '"]');
	else _m._$NowNode = _m._$RootNode.find('ul[data-code="' + code + '"]');
	log.debug('노드 확장 : ' + _m._$NowNode.length + ' / ' + code + ' : ' + hcode + ' / ' + _m._aPath[1]);

	// 좌측 중분류 트리노드가 확장되어 있는지 확인
	var par_code = _m._aPath[1];
	if (par_code==null) par_code = _m._aToPath[0];
	log.debug('++++ ' + par_code);
	var $exp_obj = _m._$RootNode.find('li.collapse').find('[data-tree-role="toggle"][data-code="' + par_code + '"]');
	if (trim(hcode)!='') {
		log.debug('하위노드 확인');
		var $depth2 = _m._$RootNode.find('ul[id="treeNode_2_' + par_code + '"]');
		// 하위분류 트리노드가 확장되어 있는지 확인
		var $chk = $depth2.find('ul[data-code="' + hcode + '"]');
		if ($chk.length<=0 && _m._aToPath.length>2) {
			var $child = _m._$RootNode.find('ul').filter(function() {
				var path = $(this).attr('data-path');
				if (_m._aToPath.join('|').indexOf(path)>=0) return true;
				else return false;
			}).filter(':last');
			log.debug('>>>>>>>>>>>>>>>> 하위 분류 확장 : ' + hcode + ' / ' + code + ' / ' + par_code + ' // ' + $child.length + ' / ' + $child.outerHTML());
			$exp_obj = _m._$RootNode.find('li.collapse').find('[data-tree-role="toggle"][data-code="' + $child.attr('data-code') + '"]');
		}
	}
	
	if ($exp_obj.length>0) {
		$exp_obj.trigger('expand');
	} else {
		//_m._$RootNode.trigger('changenode');
		_m._$RootNode.trigger('load');
	}
};


/**
 * 노드 축소
 * @param dur
 */
treeView.prototype._shorten = function(dur) {
	var _m = this;
	_m._$NowNode.hide(dur);
	_m.onShorten();
};


/***** 여기서부터 즐겨찾기 *******/

/**
 * 즐겨찾기 사용 설정
 * @param $obj1 : 즐겨찾기 목록(ul)과 닫기 버튼이 있는 레이어
 * @param $obj2 : 즐겨찾기 토글 버튼과 추가 버튼이 있는 레이어
 */
treeView.prototype.useBkmk = function($obj1,$obj2) {
	var _m = this;

	_m._$BkmkLi = $obj1.find('[data-tree-role="bkmk-list"]');

	$obj2.find('[data-tree-role="bkmk-toggle"]').bind('click', function() {
		if (userInfo.getId()!='') {
			_m.getBookmark();
			$('#kcdBookmark').toggle('fast');
		} else {
			showMsg('로그인 후 이용하실 수 있습니다');
		}
		return false;
	});
	
	$obj2.find('[data-tree-role="bkmk-add"]').bind('click', function() {
		if (userInfo.getId()!='') _m.addBookmark();
		else showMsg('로그인 후 이용하실 수 있습니다');
		return false;
	});
	
	$obj1.find('[data-tree-role="bkmk-close"]').bind('click', function() {
		$('#kcdBookmark').hide('fast');
		return false;
	});
};

/**
 * 즐겨찾기 가져오기
 */
treeView.prototype.getBookmark = function() {
	var _m = this;
	$.ajax({
		url: contextRoot + 'kcd/getBkmk.json',
		async : true,
		dataType : 'json',
		data: {},
		success: function(res){
			if (res.result != 'S') {
				log.debug('......................');
				showMsg(res.msg);
				return false;
			}

			_m._$BkmkLi.empty();
			var li_html = '<li class="nodata">저장된 북마크가 없습니다.</li>';
			_m._$BkmkLi.append(li_html);
			if (res.list!=null) {
				if (res.list.length>0) {
					_m._$BkmkLi.find('.nodata').hide(0);
					li_html = _m.getBkmkHtml(res.list);
					_m._$BkmkLi.append(li_html);
					_m._$BkmkLi.find('[id^="delBkmk_"]').click(function() {
						_m.delBkmk($(this));
					});
				}
			}
		}
	});
};

/**
 * 즐겨찾기 추가
 */
treeView.prototype.addBookmark = function() {
	var _m = this;

	var gubn = _m._aPath.length - 1;

	if (gubn<2) {
		showMsg('중분류 이하를 검색 혹은 선택해 주세요');
		return;
	}

	var path = _m._aPath.slice(1).join('|');
	//var nm = _m._aPathTxt.slice(_m._aPathTxt.length-1).join(':');
	var nm = _m._$NowNode.attr('data-nm-kor');
	var memo = _m._aPathTxt.slice(1).join('|');	// TODO
	log.debug(path + nm);
	var params = {"cl_gubn":gubn,"diss_cl_path":path,"bkmk_nm":nm,"memo":memo};
	$.ajax({
		url: contextRoot + 'kcd/setBkmk.json',
		async : true,
		dataType : 'json',
		data: params,
		success: function(res){
			if (res.result != 'S') {
				showMsg(res.msg);
				return false;
			}

			_m._$BkmkLi.find('.nodata').hide(0);
			if (_m._$BkmkLi.find('[data-code="' + path + '"]').length<=0) {
				var li_html = _m.getBkmkHtml([params]);
				_m._$BkmkLi.append(li_html);
				_m._$BkmkLi.find('[id^="delBkmk_"]').click(function() {
					_m.delBkmk($(this));
				});
			}
			showMsgWhile('저장되었습니다',1000);
		}
	});
};

/**
 * 즐겨찾기 목록 HTML 생성 반환
 * @param data
 */
treeView.prototype.getBkmkHtml = function(data) {
	var _m = this;
	var html = '';
	$(data).each(function(i,itm) {
		var depth = itm.cl_gubn;
		var path = itm.diss_cl_path;
		var nm = itm.bkmk_nm;
		var memo = itm.memo;
		var tmp = path.split('|');
		var cd = tmp[tmp.length-1]; 
		//nm = cd + '&nbsp;:&nbsp;' + nm;
		switch (parseInt(depth,10)) {
			case 2 : dp = '중'; break;
			case 3 : dp = '소'; break;
			case 4 : dp = '세'; break;
			case 5 : dp = '세세'; break;
			case 6 : dp = '세세세'; break;
		}
		html += '<li id="bkmk_' + path + '" data-code="' + path + '">'
			+ '<a href="#' + path + '" title="' + memo.replaceAll('|',' > ') + '"><div class="code txt-elip">' + cd + '(' + dp + ')</div><div class="nm txt-elip">&nbsp;:&nbsp;' + nm + '</div></a>'
			+ '<a id="delBkmk_' + path + '" href="#" data-code="' + path + '" title="' + nm + '"><div class="del"><img src="' + contextRoot + '/images/icon_x.gif" border="0" /></div></a>'
			+ '</li>';
	});
	return html;
};

/**
 * 즐겨찾기 삭제
 * @param $obj
 */
treeView.prototype.delBkmk = function($obj) {
	var _m = this;
	
	var code = $obj.attr('data-code');
	var txt = $obj.attr('title');
	
	if (trim(code)=='') {
		log.error('코드 오류');
		return;
	}

	if (confirm('"' + txt + '"을(를) 북마크에서 삭제하시겠습니까?')) {
		$.ajax({
			url: contextRoot + 'kcd/delBkmk.json',
			async : true,
			dataType : 'json',
			data: {"diss_cl_path":code},
			success: function(res){
				if (res.result != 'S') {
					showMsg(res.msg);
					return false;
				}
	
				_m._$BkmkLi.find('li[data-code="' + code + '"]').remove();
				if (_m._$BkmkLi.find('li:not(.nodata)').length<=0) _m._$BkmkLi.find('.nodata').show(0);
			}
		});
	}
};


/***************************
 * 아래 기능들은 필요에 따라 버젼별로 오버라이드 한다.
 */

/**
 * 노드 공통 속성 생성
 * @param itm
 */
treeView.prototype._getNodeAttrHtml = function(itm) {
	var _m = this;
	var attr = '';
	attr += ' data-view-st=""'
		+ ' data-code="' + itm.diss_cl_code + '"'
		/*+ ' data-depth="' + _m._iNowDepth + '"'*/
		+ ' data-nm-kor="' + itm.diss_cl_nm + '"'
		+ ' data-nm-eng="' + itm.diss_cl_nm_eng + '"'
		+ ' data-last-node="' + itm.last_node_at + '"'
		+ ' data-depth="' + itm.depth + '"'
		+ ' data-upper-code="' + itm.upper_diss_cl_code + '"'
		+ ' data-path="' + itm.diss_cl_path + '"';
	// TODO 명칭에 특수문자 포함시 처리해야 함...
	return attr;
};

/**
 * 노드 확장 시 실행될 메소드
 */
treeView.prototype.onExpand = function() {
	log.debug('확장');
};

/**
 * 노드 축소 시 실행될 메소드
 */
treeView.prototype.onShorten = function() {
	log.debug('축소');
};


/**
 * 노드 LIST HTML 만드는 메소드
 * @param data
 * @returns {String}
 */
treeView.prototype.getLiHtml = function(data) {
	var html = '';
	return html;
};


/**
 * 중분류 상세창 보여주기
 * @param code : 중분류코드
 * @param hcode : 하이라이트할 코드
 */
treeView.prototype.viewDepth2 = function(code,hcode) {
	var _m = this;
	if (_m.$TreeViewDetail!=null) _m.$TreeViewDetail(code,hcode);
};


/**
 * 소분류 하이라이트
 * @param code
 */
treeView.prototype.highLightDetail = function($obj) {
	var _m = this;
	if (_m.$TreeViewDetail!=null) _m.$TreeViewDetail.highLightDetail($obj);
};

/*******************************************************
 * v6 용 정의 : 기본으로 한다. 변경이 있을 경우 kcd.v7.js 등의 파일로 생성하여 오버라이드 한다.
 */


/**
 * 노드 LIST HTML 만드는 메소드
 * data-tree-role="toggle" : 노드 확장 역할
 * data-tree-role="viewDetail" : 디테일 뷰 역할
 * data-tree-role 및 ul 태그 등의 attribute들은 형식을 유지하여야 함.
 * @param data
 * @returns {String}
 */
treeView.prototype.getLiHtml = function(data) {
	var _m = this;
	var html = '';
	//html += '<ul id="treeNode_' + _m._iNowDepth + '" class="treeNode">';

	$(data).each(function(i,itm) {
		var last_at = itm.last_node_at;
		var li_css = 'collapse';
		var icon = _m.shortHtml;
		if (last_at == 'Y') {
			li_css = 'last';
			icon = _m.expandHtml;
		}
		var params = escape(JSON.stringify({"upper_diss_cl_code":itm.diss_cl_code}));
		html += '<li class="' + li_css + '">&nbsp;'
			+ '<a id="togUn_' + itm.depth + '_' + itm.diss_cl_code + '" data-tree-role="toggle" data-code="' + itm.diss_cl_code + '"'
			+ ' data-params="' + params + '"'
			+ ' title="' + itm.diss_cl_txt + '">'
			+ '<div class="icon">' + icon + '</div></a>'
			//+ "<a id='getUn_" + itm.depth + "_" + itm.diss_cl_code + "' data-tree-role='viewDetail' data-code='" + itm.diss_cl_code + "' href='#' data-params='{\"upper_diss_cl_code\":\"" + itm.diss_cl_code + "\"}' title='" + itm.diss_cl_txt + "'>" + itm.diss_cl_txt + '</a>'
			+ '<a id="getUn_' + itm.depth + '_' + itm.diss_cl_code + '" data-tree-role="viewDetail" data-code="' + itm.diss_cl_code + '" href="#' + itm.diss_cl_path + '"'
			+ ' data-params="' + params + '"'
			+ ' title="' + itm.diss_cl_txt + '">'
			+ '<div class="code">' + itm.diss_cl_code + '&nbsp;</div>'
			+ '<div class="nm nm_depth_' + itm.depth + '">:&nbsp;' + itm.diss_cl_nm + '</div></a>'
			//+ '<a><div style="float:left;display:inline-block;height:16px;padding:1px;">통계</div></a>'
			+ '<div><ul id="treeNode_' + itm.depth + '_' + itm.diss_cl_code + '" class="treeNode" ' + _m._getNodeAttrHtml(itm) + '>' 
			+ '</ul></div></li>';
	});
	//html += '</ul>';
	return html;
};


/**
 * 트리노드 선택 하이라이트
 */
treeView.prototype.highLightTree = function() {
	var _m = this;
	// 트리노드 하이라이트 표시
	var $obj = _m._$RootNode.find('[data-tree-role="viewDetail"][data-code="' + _m._aPath[_m._aPath.length-1] + '"]');
	if ($obj.length<=0) {
		$obj = _m._$RootNode.find('[data-tree-role="toggle"][data-code="' + _m._aPath[_m._aPath.length-1] + '"]');
	}
	_m._$RootNode.find('[data-tree-role="toggle"]').removeClass('hilight');
	_m._$RootNode.find('[data-tree-role="viewDetail"]').removeClass('hilight');

	if ($obj.length>0) {
		$obj.addClass('hilight');
		_m._$RootNode.parent().scrollTo($obj,100,{axis:"y",offset:-50});
	}
	hideLoading();
};



