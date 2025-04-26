/**
 * @File Name : common.js
 * @Description : 공통 자바스크립트 함수
 * @author : 신현삼 mong32@gmail.com
 * @since : 2010. 10. 18.
 * @version : 1.0
 * 
 * <pre>
 *  == 개정이력(Modification Information) ==
 *   
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *  2010. 10. 20.  신현삼          최초 생성
 *	2012. 08. 20.  신현삼		템플릿 기능 확장
 *	2012. 09. 05.	신현삼		validator 인총용 추가
 *  2012. 09. 19.	신현삼		validator 수정(data-max_co 추가). disableOther,enableOther 추가
 *  2013. 03. 27.	신현삼		mobile 용 제거 및 정리.validator, loadingMsg 분리
 *  2013. 04. 12.	신현삼		getPaginationHtml, request 분리
 *  2013. 04. 22.	신현삼		일부 정리
 * </pre>
 */


/****************************************************
 * jquery 공통 설정 및 jquery 확장 메소드
 */
(function($) {
	/**
	 * ajax request 공통 설정
	 */
    $.ajaxSetup({
		beforeSend: function(xhr) {
			//xhr.setRequestHeader("Access-Control-Request-Method", "POST,GET,OPTIONS");
			//xhr.setRequestHeader("Access-Control-Request-Headers", "Origin,imp");
			//xhr.setRequestHeader("Origin", "imp");
			//xhr.setRequestHeader("referer","http://192.168.0.32:7003/");
		},
		type: "POST",
		//contentType: "application/json; charset=utf-8",	// POST 일때는 이부분 주석
		//dataType: "json",
		cache: false,
		timeout: 30000,
		error: function (XMLHttpRequest, textStatus, errorThrown) { log.debug("JQ Ajax Request Error!!!!"); showError(XMLHttpRequest, textStatus, errorThrown); } // error
    });
    
    // ajax 요청시 로딩 메시지 모두 보이기
    /*var jAjax = $.ajax;
    $.ajax = function(options) {
    	showLoading();
    	var callback = options.success;
    	if (callback!=null) {
    		success = function(res) {
    			callback(res);
    			hideLoading();
    		};
    		options.success = success;
    	}
    	jAjax(options);
    };*/
    $(document).ajaxStart(function() {
    	log.debug('Ajax Start');
    	showLoading();
    });
    $(document).ajaxSuccess(function() {
    	log.debug('Ajax Success');
    	hideLoading();
    });
    
    

	/*****************************
	 * 여기서부터 jquery 기능 확장
	 */
	// json object 를 string으로...
	$.jsonToParams = function(obj) {
		var t = typeof (obj);
		if (t != "object" || obj === null) {
			if (t == "string") return String(obj);
		} else {
			var v;
			var params = '';
			
			for (var n in obj) {
				v = obj[n];
				t = typeof(v);
				if (obj.hasOwnProperty(n)) {
					if (t == "string") v = '' + v + '';
					else if (t == "object" && v !== null) v = jQuery.jsonToParams(v);
					if (t == 'string' && v.getByte()>paramLimit && paramLimit>0) {
						var tmp = v.splitByte(paramLimit);
						params += $.map(tmp, function(itm,i) { return split_head + n + '_' + i + '=' + itm; }).join('&') + '&';
					} else {
						params += n + '=' + String(v) + '&';
					}
				}
			}
			if (params.length>0) params = params.substring(0,params.length-1) + '&split_header=' + split_head;
			return params;
		}
	};
	

	
	// SELECT BOX 특정값을 선택 (.val 확장)
	$.fn.selectval = function(v) {
		if (v==null) {
			return $(this).find('option:selected').val();
		} else {
			return $(this).find('option[value="' + v + '"]').attr("selected","selected");
		}
	};
	
	// val() 대신 사용(selectbox, checkbox, radio 확장) : 2012.09.17 현재 일부 기능만 구현
	// radio, checkbox의 경우 child element에서 호출해도 값을 가져오도록 구현
	$.fn.v = function(vl,ev) {
		var $t = this;
		var nm = $t.attr('name');
		var rtn = [];
		if (vl==null) {	// get value
			if ($t.prop("type") == 'select-one') {
				return $t.find('option:selected').val();
			} else if ($t.prop("type") == 'radio') {
				//return $t.parents().find('input[name="' + nm + '"]').filter(':checked').val();
				return $t.parent().siblings().andSelf().find(':checked').val();
			} else if ($t.prop("type") == 'checkbox') {
				// checkbox 일 경우 같은 이름의 엘리먼트에서 선택값을 ,로 연결하여 반환
				if (nm!=null) {
					//var $c = $t.parents().find('input[name="' + nm + '"]');
					var $c = $t.parent().siblings().andSelf();
					var vl = '';
					$c.find(':checked').each(function() {
						vl += $(this).val() + ',';
					});
					vl = vl.split(',').uniq().join(',');
					if (vl=='') vl = null;
					return vl;
				} else {
					return null;
				}
			} else {
				return $t.val();
			}
		} else {		// set value
			this.each(function() {	// 다른 방법 없나?
				var $t = $(this);
				//log.debug('SET VALUE : ' + $t.prop('type') + '/' + $t.attr('type') + '/' + $t.attr('id') + '=' + vl);
				if ($t.prop("type") == 'select-one') {
					rtn.push($t.find('option[value="' + vl + '"]').attr("selected",true).parent().selectmenu('refresh'));
				} else if ($t.prop("type") == 'radio') {
					if (vl=='') $t.parent().siblings().andSelf().attr('checked',false);
					var $obj = $t.parent().siblings().andSelf().find('[value="' + vl + '"]');
					if ($obj.length>0) rtn.push($obj.attr("checked",true).checkboxradio('refresh'));
					else rtn.push($obj);
				} else if ($t.prop("type") == 'checkbox') {
					if (vl=='') {
						rtn.push($t.attr('checked',false).removeAttr('checked').checkboxradio('refresh'));
					} else {
						/*var $obj = $t.parent().siblings().andSelf().find('[value="' + vl + '"]');
						if ($obj.length>0) {
							if ($obj.attr('data-sbj_co')=='-1') $obj.disableOther();	// 조사표용
							rtn.push($obj.attr("checked",true).checkboxradio('refresh'));
						} else {
							rtn.push($obj);
						}*/
						if ($t.val()==vl) rtn.push($t.attr("checked",true).checkboxradio('refresh'));
						else rtn.push($t);
					}
				} else {
					rtn.push($t.val(vl));
				}
				if (ev!=null) $t.trigger(ev);
			});
			if (this.prop("type") == 'checkbox' && this.attr('data-sbj_co')=='-1') this.disableOther();	// 조사표용
			//this.checkboxradio('refresh');
			if (rtn.length==1) rtn = rtn[0];
			return rtn;
		}
	};
	
	
	// form reset 기능
	$.fn.reset = function() {
		var frmX = $(this)[0];
		var tg = trim(frmX.tagName).toLowerCase();
		log.debug('000000000000000 FORM RESET : ' + tg);
		//if (tg == 'form') {
		if (typeof frmX.reset == 'function' || (typeof frmX.reset == 'object' && !frmX.reset.nodeType)) {
			log.debug('RESET!!!');
            frmX.reset();
			$(this).find('input:checkbox,input:radio').removeAttr('checked').checkboxradio('refresh');
			$(this).find('select > options').removeAttr('selected').checkboxradio('refresh');	// 확인안됨
		} else {
			$(this).val('');
		}
	};
    
    //SELECT BOX OPTION 삭제
	$.fn.emptySelect = function() {
		return this.each(function(){
			if (this.tagName=='SELECT') this.options.length = 0;
		});
	};
	
	// SELECT BOX OPTION 추가
	$.fn.loadSelect = function(data, txtNm, vlNm, selected, opts, attrs) {
		return this.emptySelect().each(function(){
			if (this.tagName=='SELECT') {
				var el = this;
				if (attrs != null && attrs != undefined) {
					$.each(attrs, function(idx, itm){
						el.setAttribute(itm.attr, itm.val);
					});
				}
				if (opts != null && opts != undefined) {
					$.each(opts, function(idx, itm){
						var opt = new Option(itm.text, itm.value);
						el.add(opt, null);
					});
				}
				if (data.length>0) {
					$.each(data, function(idx, itm){
						var opt = new Option(itm[txtNm], itm[vlNm]);
						if (opt.value == selected) opt.selected = true;
						el.add(opt, null);
					});
				}
			}
		});
	};
	
	/*
	* 엘리먼트를 Disable 시킨다.
	* keepValue 값이 true 일때 같은 이름/값의 hidden 엘리먼트를 생성한다.
	*/
	$.fn.disable = function(keepValue) {
		var nm = $(this).attr('name');
		var selval = $(this).val();
		//log.debug(this.tagName + '/' + $(this).prop('type') + '/' + $(this).attr('type'));
		return this.each(function(){
			if (this.tagName=='SELECT') {
				$(this).attr('disabled',true);
				$(this).addClass('readonly');
				if (keepValue==true) {
					$(this).parent().children('input[name="' + nm + '"]').remove();
					if (isDebug) log.debug('SELECT DISABLE KEEP VALUE : ' + nm + '=' + selval);
					$(this).parent().append($('<input/>')
					        .attr({ type:'hidden', name:nm, value:selval })
				    );
				}
			} else if ($(this).prop('type') == 'checkbox') {
				$(this).attr('disabled',true);
				$(this).addClass('readonly').checkboxradio('refresh');
			} else {
				$(this).attr('readonly',true);
				$(this).attr('disabled',true);
				$(this).addClass('readonly');
			}
		});
	};
	// 엘리먼트 활성화
	$.fn.enable = function() {
		var nm = $(this).attr('name');
		//var selval = $(this).val();
		return this.each(function(){
			if (this.tagName=='SELECT') {
				$(this).attr('disabled',false);
				//$(this).removeAttr("disabled");
				$(this).removeClass('readonly');
				var chk = $(this).parent().children('input[name="' + nm + '"]');
				if (chk.attr('type')=='hidden') {
					if (isDebug) log.debug('SELECT ENABLE KEEP VALUE : ' + chk.val());
					$(this).val(chk.val());
					chk.remove();
				}
			} else if ($(this).prop('type') == 'checkbox') {
				$(this).attr('disabled',false);
				//$(this).removeAttr('disabled');
				$(this).removeAttr('readonly');
				$(this).removeClass('readonly').checkboxradio('refresh');
			} else {
				$(this).attr('readonly',false);
				$(this).removeAttr("readonly");
				$(this).attr('disabled',false);
				//$(this).removeAttr("disabled");
				$(this).removeClass('readonly');
			}
		});
	};
	
	// CHECKBOX 특정값을 선택했을때 나머지 선택항목을 선택하지 못하도록 한다.
	$.fn.disableOther = function(chk) {
		if (chk==null) chk = false;
		var $sib = $(this).parent().siblings().find('input:checkbox');
		$sib.attr('checked',chk).checkboxradio('refresh');
		$sib.unbind('click.en_oth');
		$sib.bind('click.dis_oth',function(event) {
			//log.debug('WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW' + $(this).attr('type'));
			//$(this).data('backup',$(this).data('events'));
			//$(this).unbind();
			$(this).attr('checked',chk);
			/*event.preventDefault;
			event.stopPropagation();*/
			return false;
		}).addClass('readonly').checkboxradio('refresh');
		var txt_len = $(this).parent().siblings().find('input:text').length - 1;
		var i = 0;
		$(this).parent().siblings().find('input:text').val('').disable().parent().hide(0, '', function() {
			if (i == txt_len - 1) {
				$($(this).parent().siblings()[0]).trigger('changeSize');
			}
			i++;
		});

		if (!chk && $(this).attr('data-iem_id')!=null) {	// 인총 DB 처리
			$(this).attr('data-chk_no',0);
			sf = $.getSurv();
			//sf.loading.addMsg('삭제중');
			var rslt_id = $(this).attr('data-rslt_id');
			var id = $(this).attr('data-iem_id');
			var v = $(this).val();
			dao.surv.delIemExc([sf.id,rslt_id,id,v],function() {
				log.debug("삭제됨");
				//sf.loading.hide();
			});
		}
		
		//$(this).parent().siblings().hide();
	};
	$.fn.enableOther = function() {
		var $sib = $(this).parent().siblings().find('input:checkbox');
		$sib.unbind('click.dis_oth');
		/*$(this).parent().siblings().find('input').each(function() {
			$(this).bind($(this).data('backup'));
		});*/
		$sib.bind('click.en_oth',function(event) {
			//log.debug('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
			return true;
		}).removeClass('readonly').checkboxradio('refresh');
		$(this).parent().siblings().find('input:text').enable();
		//$(this).parent().siblings().show();
	};

	// 높이에 + (px)
	$.fn.addHeight = function(h) {
		//if ($(this).attr('id')) {
		if ($(this).get(0)) {
			var oh = $(this).height();
			if (typeof h == 'object') h = $(h).height();
			//log.debug('ADD HEIGHT : ' + oh + ' + ' + h);
			var h = parseFloat(oh) + parseFloat(h);
			$(this).css('height',h + 'px');
			//log.debug('function addHeight : ' + $(this).get(0).tagName + ' : ' + $(this).attr('id') + ' : new height = ' + h + ' (' + oh + ')');
		}
	};
	
	// 넓이에 + (px)
	$.fn.addWidth = function(h) {
		//if ($(this).attr('id')) {
		if ($(this).get(0)) {
			var oh = $(this).width();
			if (typeof h == 'object') h = $(h).width();
			//log.debug('ADD HEIGHT : ' + oh + ' + ' + h);
			var h = parseFloat(oh) + parseFloat(h);
			$(this).css('width',h + 'px');
			//log.debug('function addWidth : ' + $(this).get(0).tagName + ' : ' + $(this).attr('id') + ' : new width = ' + h + ' (' + oh + ')');
		}
	};
	
	// checkbox에서 check 된것 중 몇번째인지 index 반환
	$.fn.checkedIdx = function() {
		var $chk = $('input[name="' + $(this).attr('name') + '"]:checked');
		var v = $(this).val();
		//log.debug(v);
		var rtn = null;
		$chk.each(function(index) {
			//log.debug(index + '/' + $(this).val());
			if ($(this).val()==v) {
				//log.debug('match ' + index);
				rtn = index;
				return false;
			}
		});
		return rtn;
	};
	
	// 모든 속성값을 복사
	$.fn.copyAttrTo = function(des,ex) {
	    var src = $(this)[0];
	    if (ex==null) ex = ["name","id","data-role"];
		for (var i = 0; i < src.attributes.length; i++) {
	        var a = src.attributes[i];
	        if (ex.indexOf(a.name)<0) {
		        //log.debug('COPY ATTRIBUTE : ' + a.name + '=' + a.value);
		        des.attr(a.name, a.value);
	        }
	    }
	};
	
	// IE의 outerHTML과 같은 기능 구현
	$.fn.outerHTML = function() {
		return $(this).clone().wrapAll("<div/>").parent().html();
	};
	
	
	// 엘리먼트들의 값을 SUM
	$.fn.sum = function() {
		var s = 0;
		$.each($(this), function(i,el) {
			var v = parseInt($(el).val(),10);
			s += v;
		});
		return s;
	};

	// 해당 엘리먼트를 화면 중앙으로 스크롤 이동
	$.fn.scrollCenter = function(ad,ovarg) {
		var x = $(document.body).scrollLeft();
		var y = $(document.body).height();
		var off = $(this).offset();
		var h = $(this).height();
		//var hh = $.mobile.activePage.find('header:visible:visible').outerHeight(true);
		var hh = 0;
		y = off.top - h / 2 - y / 2 + hh;
		if (ad!=null) y += ad;
		//log.debug('SCROLL TO : ' + x + ', ' + y + ' / ' + ad);
		//scroll(x,y);
		$(document.body).scrollTop(y);
		if (ovarg) {	// 레이어 overflow로 스크롤바 생성되었을때
			var $ov = ovarg.obj;	// 레이어 객체
			var ty = $(this).prop('type');
			//var x = $(this).position().left;
			var x = $(this).parent().position().left;
			var w = 0;
			// 현재 스크롤 위치
			var nx = $ov.scrollLeft();
			//var w = $(this).width();
			if (nx < x - 15) {
				if (ty=='checkbox' || ty=='radio') w = $(this).parent().width();
				else w = $(this).width();
			}
			x = x - 15;
			//if (ty=='checkbox' || ty=='radio') w = -15;
			//log.debug('SCROLL CENTER : x=' + x + ' / w=' + w + '/' + nx);
			x = x + w;
			var dur = ovarg.dur;	// duration
			if (dur==null) dur = 0;
			//$ov.animate({scrollLeft:0},0);
			$ov.animate({scrollLeft:x},dur);
		}
	};
	
	// 3자리 마다 , 삽입
	$.fn.addCommas = function(){ 
		return $(this).each(function(){
			$(this).text(addCommas($(this).text()));
		});
	};
	
	// 폼 데이터를 JSON 형태로
	$.fn.serializeObject = function() {
		var arrayData;
		var objectData = {};
		arrayData = this.serializeArray();

		$.each(arrayData, function() {
			var nm = this.name;
			var val = trim(this.value);

			if (objectData[nm] != null) {
				if (!objectData[nm].push)
					objectData[nm] = [objectData[nm]];
				objectData[nm].push(val);
		    } else {
		    	objectData[nm] = val;
		    }
		});
		return objectData;
	};
	
	
	/***************************
	 * 공통 메시지
	 */
	$.msg = {
		'nodata':'검색된 자료가 없습니다',
		'saved':'저장되었습니다',
		'deleted':'삭제되었습니다'
	};

	
	/****************************************
	 * 여기서부터 사이트 기본 모듈 등록
	 */
	
	/**
	 * 모듈 로드 메소드
	 * initApp
	 */
	
	$.fn.initApp = function(method) {
		if ( methods[method] ) {
			log.debug('\n)))))))))))))))))))))))))))))))))))))))))))))))))) initApp : ' + method);
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			log.debug('\n)))))))))))))))))))))))))))))))))))))))))))))))))) initAll )))))))))');
			return methods.initAll.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist' );
		}
	};
	
	methods = {
		
	};


})(jQuery);


/**
 * JSON 형태의 params를 array로 리턴
 */
var jsonToArgs = function(obj) {
	var rt = new Array();
	$.each(obj, function(key,val) {
		rt.push(val);
	});
	return rt;
};

/**
 * func함수에 JSON params를 전달하여 실행
 */
var run = function(func, params) {
	if (params!=null && params!=undefined) {
		var args = jsonToArgs(params);
		func.apply(this||window, args);
	} else {
		func.apply(this||window);
	}
};

var doIt = {
	func:[],
	params:[],
	clear:function() {
		var _m = this;
		_m.func = [];
		_m.params = [];
	},
	run:function(n) {
		var _m = this;
		if (n == null) {
			for (var i=0;i<_m.func.length;i++) {
				if (i < _m.params.length) params = _m.params[i];
				else params = null;
				_m.func[i].apply(window, params);
			}
		} else if (n < _m.func.length) {
			if (n < _m.params.length) params = _m.params[n];
			else params = null;
			_m.func[n].apply(window, params);
		}
	}
};


/**
 * 메시지 보여주기
 */
var msgTid;	// 항상 화면 가운데로 보이게...
var showMsg = function(strHtml, callback, params) {
	
	var $page = $("#pageMsg");
	if (strHtml!='') {
		$(document).on('keydown.prevent2',preventEv);
		$("#pageMsg .content > #msg_ct").html(strHtml);
		var btnHtml = '<button name="close" onclick="hideDiv(\'pageMsg\',0);" class="button" style="z-index:9510;">닫기</button>';
		$('#show_msg_btn').html(btnHtml);
		$('a[name="close"]').hover(function() { $(this).addClass('ui-btn-active'); }, function() { $(this).removeClass('ui-btn-active'); });
		$('a[name="close"]').click(function() {
			$(this).addClass('ui-btn-active');
		});
		$('a[name="close"]').blur(function() {
			$(this).removeClass('ui-btn-active');
		});
		msgTid = setInterval(function() {
			setDivCenter('pageMsgDiv');
		},50);
		setTimeout(function() { clearInterval(msgTid); },5000);
		$page.css('visibility','visible');
		$page.show(0);
	}
	if(typeof(callback)==='function'){
		$page.data('callback', callback);
		$page.data('params', params);
	}
	
};

var showMsgWhile = function(sMsg,iTime) {
	showMsg(sMsg);
	setTimeout(function() {
		hideDiv('pageMsg',iTime/10);
	},iTime);
};


// event 안먹게...
var preventEv = function(e) {
	log.debug('PREVENT EVENT : ' + e.keyCode);
	e.preventDefault();
	//e.stopImmediatePropagation();
	//e.stopPropagation();
	return false;
};


//레이어 가운데 정렬
var setDivCenter = function(obj_id) {
	var obj = obj_id;
	if (typeof obj_id == 'string') {
		obj = $("#" + obj_id);
	}
	var scTop = $(window).scrollTop(); //clientHeight;
	var objHei = obj.height();
	var objWid = obj.width();
	var posTop = scTop - objHei/2;
	var posLeft = -objWid/2;

    obj.css({
        "position": "absolute",
        "left": "50%",
        "margin-left": posLeft,
    	"top": "50%",
        "margin-top": posTop
    });
};

/**
 * 확인창 보여주기
 * 2012.10.17 많이 수정 ㅡㅡ; 신현삼
 */
//var showConfirm = function(title, strHtml, onFunc, offFunc, onTxt, offTxt, onparams,offparams) {
var showConfirm = function(title, strHtml, opt) {
	var onTxt = opt.onTxt;
	var onFunc = opt.onFunc;
	var onParams = opt.onParams;
	var offTxt = opt.offTxt;
	var offFunc = opt.offFunc;
	var offParams = opt.offParams;
	if (onTxt == null || onTxt == '') onTxt = '예';
	if (offTxt == null || offTxt == '') offTxt = '아니오';
	if (offFunc == null || offFunc == '') {
		offFunc = "hideDiv";
		offparams = "{divid:\'pageMsg\',to:0}";
	}
	strHtml = '<span style="float:left; margin:10px;" id="msg">' + strHtml + '</span>';
	var dodo = doIt;
	dodo.clear();
	dodo.func.push(onFunc);
	dodo.params.push(onParams);
	dodo.func.push(offFunc);
	dodo.params.push(offParams);
	var btnHtml = '<a id="confirm_btn1" class="ui-btn-inner" style="z-index:9510;">' + onTxt + '</a>';
	btnHtml += '<a id="confirm_btn2" class="ui-btn-inner" style="z-index:9510;">' + offTxt + '</a>';
	showMsg(strHtml);
	$('#show_msg_btn').html(btnHtml).data('dodo',dodo);
	$('a[id^="confirm_btn"]').hover(function() { $(this).addClass('ui-btn-active'); }, function() { $(this).removeClass('ui-btn-active'); });
	$('a[id^="confirm_btn"]').click(function() { $(this).addClass('ui-btn-active'); });
	$('a[id^="confirm_btn"]').blur(function() { $(this).removeClass('ui-btn-active'); });
	$('a#confirm_btn1').bind('click.run', function() { 
		var dodo = $(this).parent().data('dodo');
		log.debug('button1 click : ' + dodo);
		if (dodo!=null) {
			dodo.run(0);
		}
		hideDiv('pageMsg',0);
	});
	$('a#confirm_btn2').bind('click.run', function() { 
		var dodo = $(this).parent().data('dodo');
		log.debug('button2 click : ' + dodo);
		if (dodo!=null) {
			dodo.run(1);
		}
		hideDiv('pageMsg',0);
	});
};

/**
 * 확인창 보여주기2 : 목록형태 선택 : 미완성 - 별 필요없을듯.
 */
/*var showOptions = function(title, strHtml, options) {
	strHtml = '<span style="float:left; margin:10px;" id="msg">' + strHtml + '</span>';
	var btnHtml = '';
	$.each(options, function(i,opt) {
		btnHtml += '<li><button onClick="run(' + opt.func + ', '+ opt.params + ')" class="ui-btn-inner" style="width:100px;z-index:9510;">' + opt.txt + '</button></li>';
	});
	btnHtml = '<ul>' + btnHtml + '</ul>';
	log.debug('test' + btnHtml);
	showMsg(strHtml);
	$('#show_msg_btn').html(btnHtml);	// TODO 수정 필요.
};*/

/**
 * 에러 보여주기
 */
var showError = function(XMLHttpRequest, textStatus, errorThrown) {
	var txt = trim(XMLHttpRequest.responseText);
	if (txt.msg!=null) {
		showMsg(txt.msg);
	} else if (isDebug) {
		/*showMsg('<p align="left"><b>responseText</b>: ' + txt
			+ '<br/><b>textStatus</b>: ' + textStatus
			+ '<br/><b>errorThrown</b>: ' + errorThrown + '</p>');*/
		log.debug("Error : " + txt);
	} else {
		showMsg('오류 발생 : 관리자에게 문의해주세요');
	}
};


/**
 * JSON 형태의 obj 값들을 frmName 폼의 같은 이름의 엘리먼트에 넣어주는 메소드
 * @param FrmX
 * @param obj
 * 
 */
var setObjToForm = function(frmName, obj) {
	var fld;
	for (var key in obj) {
		fld = $("#" + frmName + " :input[name='" + key + "']");
		if (fld.attr("type") == 'text' || fld.attr("type") == 'hidden'
			|| fld.prop("type") == 'select-one'
			|| fld.prop("type") == 'textarea'
			|| fld.attr("type") == 'number'
			|| fld.attr("type") == 'tel'
			|| fld.attr("type") == 'email'
			|| fld.attr("type") == 'date'
			) {
			fld.val(obj[key]);
		}
		if (fld.attr("type") == 'radio' || fld.attr("type") == 'checkbox') {
			fld.filter('[value="' + obj[key] + '"]').attr('checked', 'checked');
		}
	}
};


/**
 * byte 길이 반환
 * @param str		: 확인할 문자열
 * @param ignchr	: 무시할 문자
 * @returns {Number}
 * string의 byte length를 반환
 */
var getByteLen = function(str,ignchr) {
	var len = 0;
	var tmpStr = new String(str);
	if (ignchr==undefined) ignchr = [];

	var chr;
	for ( var k=0; k<tmpStr.length; k++ ) {
		chr = tmpStr.charAt(k);
		if (ignchr.indexOf(chr)<0) {
			if (escape(chr).length > 4) {
				len += 2;
			} else {
				len += 1;
			}
		}
	}
	return len;
};

/**
 * TRIM 
 * @param val
 * @returns
 */
var trim = function(val) {
	if (val==null || val=='' || val=='null' || val=='undefined') return '';
	if (typeof val == 'string') {
		val = val.replace(/(^\n*)/g,"");
		val = val.replace(/(^\r*)/g,"");
		val = val.replace(/(^\s*)|(\s*$)/g,"");
	}
	return val;
};


/**
 * 레이어 숨기기
 */
var hideDiv = function(divid,iTime) {
	//$('#' + divid).css('visibility','hidden');
	if (divid=='pageMsg') {
		log.debug('메시지 닫기');
		$(document).off('keydown.prevent2',preventEv);
		clearInterval(msgTid);
	}
	var tarDiv = $('#' + divid);
	var callback = tarDiv.data('callback');
	var params = tarDiv.data('params');
	tarDiv.data('callback',null);
	tarDiv.data('params',null);
	if (iTime!=null) tarDiv.fadeOut(iTime);
	else tarDiv.css('visibility','hidden');
	if (typeof(callback)==='function') {
		run(callback, params);
	}
};

/**
 * 테이블에서 선택 row를 강조처리
 */
var setSelectRow = function($row) {
	var tagName = $row[0].nodeName;
	/*row.parent().children(tagName).css('backgroundColor','#FFFFFF');
	row.css('backgroundColor','#CCDDFF');*/
	$row.parent().children(tagName).removeClass('selectrow');
	$row.addClass('selectrow');
};



/**************************************************************
 * 기타 등등
 */


/**
 * Random String 생성
 */
var getRandomStr = function (len) {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var str = '';
	for (var i=0; i<len; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		str += chars.substring(rnum, rnum+1);
	}
	return str;
};


var var_dump = function(object) {
	var str = '';
	str += 'var_dump : ' + object + '\n';
	for (var member in object) {
		if (typeof(object[member])=='object') {
			str += '>>> Object : ' + member + '\n';
			for (var m2 in object[member]) {
				str += '	' + m2 + '=' + object[member][m2] + '\n';
			}
			//var_dump(object[member]);
		} else {
			str += '		' + member + '=' + object[member] + "  (" + typeof(object[member]) + ")" + '\n';
		}
	}
	console.log(str);
};


/**
 * JSON Search
 */
var searchJSON = function(json, keyToSearch, valueToSearch, defaultValue, keyToGet) {
	log.debug("SearchJSON : " + json);
	$.each(json, function(i,item) {
		if (item[keyToSearch] == valueToSearch) {
			if (keyToGet==null) {
				return item;
			} else {
				return item[keyToGet];
			}
		}
	});
	return defaultValue;
};


var getViewHtml = function(txt) {
	var html = txt.replace(new RegExp('\n',"g"),'<br/>');
	return html;
};



var getTelStr = function(txt) {
	if (txt!=null) {
		return txt.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/,"$1-$2-$3");
	} else {
		return '';
	}
};





var getDocHei = function(){
    var D = document;
    return Math.max(Math.max(D.body.scrollHeight,    D.documentElement.scrollHeight), Math.max(D.body.offsetHeight, D.documentElement.offsetHeight), Math.max(D.body.clientHeight, D.documentElement.clientHeight));
};





var showLoading = function(msg){
	$('body').css('cursor','progress');
	if (msg!=null) {
		$('#commonMsg').html(msg);
	} else {
		$('#commonMsg').html('');
	}
	log.debug(".................로딩중 메시지........" + msg);
	$('#commonMsgLayer').css('visibility','visible').show(0);
};

var hideLoading = function(interval){
	if (interval==null || interval==undefined) interval = 10;
	log.debug(".......................로딩중 메시지 숨김.......");
	//setTimeout('hideDiv(\'commonMsgLayer\')', interval);
	$('#commonMsgLayer').fadeOut(interval);
	setTimeout(function() { $('body').css('cursor','default'); }, interval * 1.1);
};


// 3자리마다 , 삽입
var addCommas = function(input) {
	return (input.toString()).replace(
	    /^([-+]?)(0?)(\d+)(.?)(\d+)$/g, function(match, sign, zeros, before, decimal, after) {
	    	var reverseString = function(string) { return string.split('').reverse().join(''); };
	    	var insertCommas  = function(string) { 
	    		var reversed           = reverseString(string);
	    		var reversedWithCommas = reversed.match(/.{1,3}/g).join(',');
	    		return reverseString(reversedWithCommas);
	    	};
	    	return sign + (decimal ? insertCommas(before) + decimal + after : insertCommas(before + after));
	    }
	);
};




/*************************
 * Javascript 기본 객체 확장
 * @param o
 * @param r
 * @returns
 */

// string 객체에 replaceAll추가
String.prototype.replaceAll = function(o,r) {
	var _m = this;
	_m.html = _m.split(o).join(r);
	return _m.html;
};

// string 객체에 trim 추가
String.prototype.trim = function() {
	var _m = this;
	if (_m==null || _m=='') return '';
	return _m.replace(/(^\n*)/g,"").replace(/(^\r*)/g,"").replace(/(^\s*)|(\s*$)/g,"");
};

// Array 중복 제거 및 빈값 제거
Array.prototype.uniq = function() {
	var _m = this;
	var tmp = {};
	var rtn = new Array();
	for (var k in _m) {
		var nm = new String(_m[k]).trim();
		//log.debug('test ' + k + ' : ' + typeof _m[k]);
		//if (nm!='' && k!='uniq' && k!='min' && k!='max') {
		if (typeof _m[k] != 'function' && nm!='') {
			//log.debug(k + ' : ' + _m[k] + '/' + nm + '/' + typeof _m[k]);
			if (tmp[_m[k]]==null) {
				tmp[_m[k]] = 1;
				rtn.push(_m[k]);
			}
		}
	};
	return rtn;
};

// Array에서 최소값, 최대값 찾기
Array.prototype.min = function() {
	return Math.min.apply(Math, this);
};
Array.prototype.max = function() {
	return Math.max.apply(Math, this);
};

// Array에서 특정 원소값 제거(idx)
Array.prototype.remove = function(idx) {
    //return (idx<0 || idx>this.length) ? this : this.slice(0, idx).concat(this.slice(idx+1, this.length));
	return (idx<0 || idx>this.length) ? this : this.splice(idx, 1);
};
Array.prototype.removeByVal = function(vl) {
	for (var i=0; i<this.length; i++) {
        if(this[i] == vl) {
            this.splice(i, 1);
            break;
        }
    }
};


// 구분자가 들어간 String에서 빈값을 제거 (1,2,3, ==> 1,2,3)
String.prototype.uniq = function(c) {
	var _m = this;
	if (_m=='') return '';
	if (c==null || c=='') c = ',';
	return _m.split(c).uniq().join(c);
};

// Object length : jquery와 충돌...ㅠ
/*Object.prototype.length = function() {
	var cnt = 0;
	for (var k in this) {
		if (this.hasOwnProperty(k)) {
			cnt++;
		}
	}
	return cnt;
};*/

// Object를 array로 변환 ( {"0":{...},"0":{...}} ==> "0":[{...},{...}] 형태로 변환)
var toArray = function(obj) {
	var arr = [];
	for (var k in obj) {
		if (obj.hasOwnProperty(k)) {
			arr.push(obj[k]);
		}
	}
	return arr;
};

// String byte 반환
String.prototype.getByte = function() {
    var str = this;
    var l = 0;
    //for (var i=0; i<str.length; i++) l += (str.charCodeAt(i) > 128) ? 2 : 1;
    for (var i=0; i<str.length; i++) l += (escape(str.charAt(i)).length > 4) ? 2 : 1;
    return l;
};

//String을 byte 단위로 잘라 array로 return
String.prototype.splitByte = function(len) {
    var str = this;
    var l = 0;
    var rtn = [];
    var p = 0;
    for (var i=0; i<=str.length; i++) {
        //l += (str.charCodeAt(i) > 128) ? 2 : 1;
    	l += (escape(str.charAt(i)).length > 4) ? 2 : 1;
        if (l > len || i == str.length) {
        	rtn.push(str.substring(p,i));
        	p = i;
        	l = 1;
        }
    }
    return rtn;
};

// 서버 전송전 문자열 검사(?,& 등이 들어갈 경우 오류남)
var toTrnsStr = function(str) {
	str = str.split('?').join('&#63;');
	str = str.split('&').join('&#38;');
	return str;
};

/*String.prototype.cut = function(len) {
    var str = this;
    var l = 0;
    var rtn = [];
    for (var i=0; i<str.length; i++) {
            l += (str.charCodeAt(i) > 128) ? 2 : 1;
            if (l > len) return str.substring(0,i);
    }
    return str;
};*/


// alert 함수 오버라이드
/*var oAlert = window.alert;
window.alert = function(msg) {
	log.debug('ALERT : ' + msg);
	//oAlert(msg);
	showMsg(msg);
};*/


var setOn = function(obj) {
	$(obj).addClass('mouse-on');
};

var setOff = function(obj) {
	$(obj).removeClass('mouse-on');
};


var nl2br = function(str) {
	if (str == null)
		return '';
	if (str.length == 0)
		return '';

	var result = str.replaceAll("\n", "<br/>");

	return result;
};
