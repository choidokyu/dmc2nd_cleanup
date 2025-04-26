/**
 * @File Name : validator.js
 * @Description : element에 정의된 속성을 바탕을 validation을 수행한다.
 * @author : 신현삼 mong32@gmail.com
 * @since : 2010년 언제쯤??
 * @version : 1.0
 * 
 * <pre>
 *  == 개정이력(Modification Information) ==
 *   
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *  2010.??  신현삼          최초 생성
 *  2013.03.25	신현삼		common.js 에서 분리
 * </pre>
 */

/**********************************************************************
 * required : 필수
 * min : 최소값
 * max : 최대값
 * minlength : 최소길이
 * maxlength : 최대길이
 * data-max-co : checkbox에서 선택할 수 있는 최대 개수
 * 기타 등등 소스 참조
 *
 */
// 조사 여부
String.prototype.hasFinalConsonant = function(str) {
   str = this != window ? this : str; 
   var strTemp = str.substr(str.length-1);
   return ((strTemp.charCodeAt(0)-16)%28!=0);
};

//조사(을/를) 붙이기
var conjunc = function(str,tail) {
   return (str.hasFinalConsonant()) ? tail.substring(0,1) : tail.substring(1,2);
};


/**
 * 2012.01.05 객체 형태로 수정 및 기능 추가 신현삼
 * 2012.09.30.	HTML5 selector 추가 (특정 엘리먼트만 selector 체크 가능)
 * @param frm	: 폼 오브젝트 또는 폼 엘리먼트
 * @returns boolean
 *  form의 element attribute 에 정의된 대로 validation을 수행한다.
 */
var validator = {
	msg : {
		/// 에러메시지 포맷 정의 ///
		PL_INPUT : "{name+을를} 입력해 주십시오",
		PL_SELECT : "{name+을를} 선택해주십시오",
		TOO_LONG : "{name+을를} {mxlen}자 이내로 입력해 주십시오.",
		TOO_SHORT : "{name+을를} {mnlen}자 이상 입력해 주십시오.",
		CHK_LEN : "{name+을를} {mnlen}자로 입력해 주십시오.",
		NOT_FILE : "금칙파일은 업로드가 불가능합니다.",
		NOT_DATE : '{name}의 날짜 형식이 맞지 않습니다.',
		NOT_PAST_DATE : '{name}은 현재일자 이후일 수 없습니다.',
		NOT_BIGGER_DATE : '{name}은 {name2} 이후이어야 합니다.',
		NOT_TELNO : '{name}의 전화번호 형식이 맞지 않습니다.<br/>예)050-XXXX-XXXX',
		NOT_EMAIL : '{name}의 형식이 맞지 않습니다.',
		BEL_MIN : '{name+을를} {min} 이상 입력하세요.',
		OVER_MAX : '{name+은는} {max}를 초과할 수 없습니다.',
		NOT_IN : '{name}에 입력할 수 없는 값({val})입니다.',
		OV_MAX_CO : "{name+은는} {max}개 까지만 선택해 주십시오.",
		CONF_MAX : '{name}값이 {max}를 초과하였습니다.확인 후 계속 진행합니다.'
	},
	el:null, // 대상 엘리먼트
	data_confirm:null,
	spl_at:',',	// 여러 속성 체크시 속성별 구분자(data_confirm)
	spl_kv:':',	// 여러 속성 체크시 키/밸류 구분자
	msg_mode:1,
	onCallback:null,
	onParams:[],
	offCallback:null,
	offParams:[],
	beforeFocus:null,
	beforeShowHelp:null,
	// validation 수행
	// TODO Number 함수 확인
	checkEl : function(frm,el) {
		var _m = this;
		if (el!=null) {
			log.debug('validator.check : ' + frm.name + '/' + el.name);
			_m.el = el;
			return _m.checkElem(frm,el);
		} else {
			log.debug('validator.check : ' + frm.name);
			for (var i = 0; i < frm.elements.length; i++ ) {
				var el = frm.elements[i];
				_m.el = el;
				if (!_m.checkElem(frm,el)) return false;
			} // end for
		}
		return true;
	},
	// HTML5 Selector 적용
	check : function(frm,sel) {
		var _m = this;
		log.debug('validator.check : ' + frm.name + ' / ' + typeof(sel) + ':' + sel);
		if (typeof sel == 'object') {
			_m.el = sel;
			return _m.checkElem(frm,sel);
		} else if (sel!=null) {
			//var elms = frm.elements;
			var elms = frm.querySelectorAll(sel);	// HTML5 selector
			for (var i = 0; i < elms.length; i++ ) {
				var el = elms[i];
				_m.el = el;
				if (!_m.checkElem(frm,el)) return false;
			} // end for
		}
		return true;
	},
	checkElem : function(frm,el) {
		var _m = this;
		// 2012.10.18 readonly 거나 disable 이면 return true;
		//log.debug(el.getAttribute('id') + '/' + trim(el.getAttribute('disabled')) + '/' + trim(el.getAttribute('readonly')) + '/' + trim($(el).attr('disabled')) + '/' + trim($(el).attr('readonly')) + '.' + el.getAttribute("data-type"));
		//if (trim(el.getAttribute('readonly'))!='' || trim(el.getAttribute('disabled'))!='') return true;	// 이건 왜 안되지?? 이해가 안되네?? 분명히 ''가 찍히는데 이걸 넘어간다???
		if (trim($(el).attr('readonly'))!='' || trim($(el).attr('disabled'))!='') return true;
		//log.debug('2222222222222222222222222222' + el.name + '/' + el.value + '/' + el.getAttribute('REQUIRED'));
		var required = el.getAttribute("REQUIRED");	// 필수 여부(HTML5 Element)
		_m.data_confirm = el.getAttribute('data-confirm');		// 필수는 아니지만 경고를 보여줌. (,로 항목 구분,:로 키와 값을 구분)
		var required_if = el.getAttribute('data-required-if');	// 조건 필수
		var mxlen = Number(el.getAttribute('MAXLENGTH'));	// 최대 길이(HTML5 Element)
		var mnlen = Number(el.getAttribute("MINLENGTH")); // 최소 길이
		//var ime_mode = el.getAttribute("IME_MODE");	// 입력모드  : K-한글,E-영문,N-숫자,C-통화(,포함)
		//var fmtStr = el.getAttribute("FORMAT");	// 입력된 값을 해당 포맷을 변환한다.
		var data_type = el.getAttribute("data-type");	// 입력형식
		if (data_type != null) { data_type = data_type.toLowerCase(); }
		//var req_val = el.getAttribute('data-required-val');	// 지정된 엘리먼트의 값이 지정된 값일 때
		var max_co = el.getAttribute('data-max_co');	// 선택항목 최대 선택 개수
		var el_val = '';
		if (el.value!=undefined && el.value!='') {
			el.value = trim(el.value);
			el_val = el.value;
		}
		var inLen = getByteLen(el_val);	// 입력된 길이
		var min = el.getAttribute('min');	// 최소값
		var max = el.getAttribute('max');	// 최대값
		//var data_with = el.getAttribute('data-with');	// 같이 입력해야될 엘리먼트
		var data_bigger_than = el.getAttribute('data-bigger-than');	// 지정된 엘리먼트보다 값이 커야 함.(날짜)
		var data_in = el.getAttribute('data-in-list');	// ,로 구분된 값 중 하나이어야 함.
		if (data_in!=null) data_in = data_in.split(',');
		var tag_type = el.getAttribute('type');
		if (tag_type!=null) tag_type = tag_type.toLowerCase();

		// required_if
		if (required_if != null) {
			var func = new Function('return ' + required_if)();
			if (func()==true) {
				required = true;
			}
		}
		var required_if = el.getAttribute('data-required-if-en');
		if (required_if != null) {
			if (el.disabled != true) {
				required = true;
			}
		}
		var ty = el.type;

		// REQUIRED 속성이 있으면 필수 체크
		if (required != null) {
		//if (trim(required) != '') {
			log.debug('REQUIRED CHECK : ' + ty + ' = ' + el_val);
			//select 구문 처리
			if(ty.indexOf("select")>-1){
				//if (el.selectedIndex==0) {
				if (el_val == null || el_val == "") {
					return _m.showHelp(el,'PL_SELECT');
				}
			// radio, checkbox
			} else if ((ty.indexOf("radio")>-1) || (ty.indexOf("checkbox")>-1)) {
				var el_p = eval("document." + frm.name + "." + el.name);
				var chk_co = this.getCheckCnt(el_p);
				if (chk_co==0) {
					return _m.showHelp(el,'PL_SELECT');
				}
			} else if (ty.indexOf("file")>-1) {
			} else if (ty.indexOf("hidden")>-1) {
				if (el_val == null || el_val == "") {
					return _m.showHelp(el,'PL_INPUT');
				}
			// text
			//} else if (ty.indexOf("text")>-1 || ty.indexOf("number")>-1 || ty.indexOf("email")>-1 || ty.indexOf("tel")>-1) {
			} else {
				if (el_val == null || el_val == "") {
					return _m.showHelp(el,'PL_INPUT');
				}
			}
		} // 필수 체크

		//if (required != null || inLen>0) {	// 필수이거나 입력된 값이 있을때만 길이를 확인한다.
		if (trim(required) != '' || inLen>0) {
			// maxLength와 minLength가 같으면 자리수 일치하는지 확인
			if (mxlen>0 && mxlen==mnlen && inLen != mnlen) {
				return _m.showHelp(el,'CHK_LEN',mnlen);
			}

			// maxlength 속성이 있을 때 최대길이 확인
			if (mxlen>0 && inLen > mxlen) {
				return _m.showHelp(el,'TOO_LONG',mxlen);
			}

			// MINLENGTH 속성이 있을 때 최소길이 확인
			if (mnlen>0 && inLen<mnlen) {
				return _m.showHelp(el,'TOO_SHORT',mnlen);
			}
			
			// min 최소값
			if (min>0 && Number(el_val) < min) {
				return _m.showHelp(el,'BEL_MIN',min);
			}
			
			// max 최대값
			if (max>0 && Number(el_val) > max) {
				return _m.showHelp(el,'OVER_MAX',max);
			}
			
			if (ty.indexOf("email")>-1) {
				if (!_m.isEmail(el_val)) {
					return _m.showHelp(el, 'NOT_EMAIL');
				}
			}
			
			// checkbox 최대 선택개수 제한
			if (ty.indexOf("checkbox")>-1) {
				var el_p = eval("document." + frm.name + "." + el.name);
				var chk_co = _m.getCheckCnt(el_p);
				if (max_co>0 && chk_co>max_co) {
					el.setAttribute('checked','');
					if ($) {
						$(el).attr('checked',false).checkboxradio();
					}
					return _m.showHelp(el,'OV_MAX_CO',max_co);
				}
			}
		} // 필수이거나 입력값 있을때...

		// 날짜 형식 확인
		if (data_type == 'date' || data_type == 'p-date') {
			var yy_obj = frm[el.getAttribute('year')];
			var mm_obj = frm[el.getAttribute('month')];
			var dd_obj = el;
			var ln_obj = frm[el.getAttribute('lunsol')];
			var yy = '';
			var mm = '';
			var ln = '1';	// 양력
			if (yy_obj!=null) {
				yy = yy_obj.value;
				mm = mm_obj.value;
				if (ln_obj!=null) ln = ln_obj.value;
			}
			// 2012.09.05 인총용 추가
			else if ($ && yy_obj==null) {	// jQuery가 있으면
				var up_id = $(el).attr('data-up_id');
				var h_id = $(el).attr('data-hm_id');
				var p = $(el).attr('data-rty').substring(0,1);
				yy_obj = $('input[id^="iem_"][id$="_' + h_id + '"]').filter('[data-rty="' + p + 'YR"]').filter('[data-up_id="' + up_id + '"]')[0];
				mm_obj = $('input[id^="iem_"][id$="_' + h_id + '"]').filter('[data-rty="' + p + 'MN"]').filter('[data-up_id="' + up_id + '"]')[0];
				dd_obj = $('input[id^="iem_"][id$="_' + h_id + '"]').filter('[data-rty="' + p + 'DY"]').filter('[data-up_id="' + up_id + '"]')[0];
				var ln_obj = $('input[id^="iem_"][id$="_' + h_id + '"]').filter('[data-rty="LN"]').filter('[data-up_id="' + up_id + '"]')[0];
				yy = $(yy_obj).val();
				mm = $(mm_obj).val();
				ln = trim($(ln_obj).val());
				//log.debug(up_id + '/' + h_id + ':' + p + '/' + yy + '/' + mm + '/' + ln);
			}
			if (dd_obj==null) { dd_obj = el; el_val = '01';	} // 년,월만 확인할 수 있게...
			yy = trim(yy);
			mm = trim(mm);
			//if (required != null || (yy!='' || mm!='' || (el_val!='' && el_val!='01'))) {
			if (trim(required) != '' || (yy!='' || mm!='' || (el_val!='' && el_val!='01'))) {
				if (yy=='') {
					return _m.showHelp(yy_obj,'PL_INPUT');
				}
				if (mm=='') {
					return _m.showHelp(mm_obj,'PL_INPUT');
				}
				if (el_val=='') {
					return _m.showHelp(el,'PL_INPUT');
				}
				if (mm.length<2) {
					mm = '0' + mm;
					mm_obj.value = mm;
				}
				if (el_val.length<2) {
					el.value = el_val = '0' + el_val;
				}
				if (ln=='') ln = '1';
				if (!_m.isDate(yy,mm,el_val,ln)) {
					return _m.showHelp(el,'NOT_DATE');
				}
				if (data_type=='p-date' && !_m.isPastDate(yy, mm, el_val, ln)) {
					return _m.showHelp(el,'NOT_PAST_DATE');
				}
				/*var el_dte = new Date(yy,mm-1,el_val).valueOf();
				if (data_type=='p-date') {
					var chk = new Date().valueOf();
					if (el_dte > chk) {
						return _m.showHelp(el,'NOT_PAST_DATE');
					}
				}*/
				if (data_bigger_than!=null) {
					var arr_el_nm = data_bigger_than.split('/');
					var yy1 = frm[arr_el_nm[0]].value;
					var mm1 = frm[arr_el_nm[1]].value;
					var dd1 = frm[arr_el_nm[2]].value;
					var chk = new Date(yy1,mm1-1,dd1).valueOf();
					if (Number(el_dte) < Number(chk)) {
						return _m.showHelp(el,'NOT_BIGGER_DATE',frm[arr_el_nm[2]]);
					}
				}
			}
		} // 날짜 형식 확인 끝
		
		// 전화번호 형식 확인
		if (data_type == 'tel') {
			//if (required != null || el_val!='') {
			if (trim(required) != '' || el_val!='') {
				if (mxlen>4) {
					if (!_m.isTelNo(el,el_val)) {
						return _m.showHelp(el, 'NOT_TELNO');
					}
				} else {
					if (tag_type=='number' && el_val.substring(0,1)!='0' && el_val.length<=2) {
						el_val = '0' + el_val;	// 임시(number일때 모바일과 PC의 입력형태가 다름) : TODO
					}
					var tmp_reg = /^02|^0[0-9]{2}/;
					if (!tmp_reg.test(el_val)) {
						return _m.showHelp(el, 'NOT_TELNO');
					}
				}
			}
		}
		
		// 입력 허용 값 목록 확인
		if (data_in!=null && data_in.length>0) {
			var chk = false;
			for (key in data_in) {
				if (el_val == data_in[key]) {
					chk = true;
					break;
				}
			}
			if (!chk) {
				return _m.showHelp(el, 'NOT_IN', el_val);
			}
		}
		
		/////============== confirm (확인창 후 넘어감)
		//log.debug('................' + _m.data_confirm);
		if (_m.data_confirm != null) {
			var conf = _m.data_confirm.split(_m.spl_at);
			for (var i=0;i<conf.length;i++) {
				var chk = conf[i].split(_m.spl_kv);
				var k = chk[0].toLowerCase();
				var v = chk[1];
				//var chk_v = el.getAttribute(k);
				log.debug('확인 항목 : ' + k + ' = ' + v);
				if (k=='max') {
					if (Number(v)<Number(el_val)) {
						return _m.confirm(el,'CONF_MAX' + _m.spl_kv + v);
					}
				}
			}
			return true;
			//required = true;
		}
		
		return true;
	},
	// 날짜 형식 맞는지 확인
	isDate : function(yyyy,mm,dd,ls) {
		// 음력일 경우 양력 변환
		if (ls=='2') {
			var sdate = lunarCal.convDate(yyyy,mm,dd,2,0); // 윤달 선택 없으므로 일단 아닌것으로
			if (!sdate) return false;
			yyyy = sdate.year;
			mm = sdate.month;
			dd = sdate.day;
		}
		var mval = Number(mm) - 1;
		var chk = new Date();
		chk.setFullYear(yyyy, mval, dd);
		var chkYr = chk.getFullYear();
		var chkMm = chk.getMonth();
		var chkDd = chk.getDate();
		if (chkDd.length<2) chkDd = "0" + chkDd;
		log.debug('CHECK DATE : ' + yyyy + '/' + mm + '(' + mval + ')/' + dd + '===' + chkYr + '/' + chkMm + '/' + chkDd);
		if (chkYr == yyyy  && chkMm == mval && chkDd == dd) {
			return true;
		} else {
			return false;
		}
	},
	// 날짜가 현재 이전 날짜인지 확인
	isPastDate : function(yy,mm,dd,ls) {
		var _m = this;
		if (dd==null) dd = '01';
		//if (!_m.isDate(yy,mm,dd,ls)) return false;
		var today = new Date();
		var chk = new Date();
		chk.setFullYear(yy, mm - 1, dd);
		log.debug('CHECK PAST DATE : ' + yy + '/' + mm + '/' + dd + '===' + chk.valueOf() + '/' + today.valueOf());
		if (chk.valueOf() > today.valueOf()) return false;
		return true;
	},
	// 전화번호 형식 맞는지 확인
	isTelNo : function(el,telno) {
		var regExp = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/;
		// 0505 는 050-xxxx-xxxx 형태로 입력해야 함.
		if (!regExp.test(telno)) {
			return false;
		} else {
			telno = telno.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/,"$1-$2-$3");
			el.value = telno;
		}
		return true;
	},
	// EMAIL 형식 맞는지 확인
	isEmail : function(mail) {
		var regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
		if (!regExp.test(mail)) {
			return false;
		}
		return true;
	},
	// checkbox 선택된 개수 반환
	getCheckCnt : function(obj) {
		var chk = -1;
		if (obj != undefined) {
			chk = 0;
			if (obj.length != undefined) {
				for (var i=0;i<obj.length;i++) {
					if (obj[i].checked) chk++;
				}
			} else {
				if (obj.checked) chk = 1;
			}
		}
		return chk;
	},
	// 메시지 출력
	showHelp : function(el,msgcl,nm2) {
		var _m = this;
		var msg = _m.getMsg(el,{"msgcl":msgcl,"nm2":nm2});
		var fc_el = el.getAttribute("FOCUS");	// FOCUS속성이 있을땐 해당 속성의 이름을 가진 엘리먼트에 focus를 준다.
		//if (el.type=="hidden" && fc_el!=null) { // IE7에서 focus가 function으로 반환됨.
		//if (el.type=="hidden" && fc_el!=null && typeof($(fc_el))!='object') {
		var fc = el;
		_m.failElem = el;
		log.debug(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>" + _m.failElem);
		if (_m.beforeFocus!=null) _m.beforeFocus;
		if (el.type=="hidden" && fc_el!=null) {
			fc = $(fc_el);
			/*if (fc!=undefined && fc.focus()) return el.name;
			else return el.name;*/
		} else if (el.type!="hidden") {
			el.focus();
		}
		if (_m.msg_mode==2 && (msgcl=='PL_INPUT' || msgcl=='PL_SELECT')) {
			_m.onParams.unshift(fc);
			_m.offParams.unshift(fc);
			_m.onParams.unshift(el);
			_m.offParams.unshift(el);
			if (_m.beforeShowHelp!=null) _m.beforeShowHelp(el,fc);
			showConfirm('확인필요', msg, {"onTxt":"불응처리","onFunc":_m.onCallback,"onParams":_m.onParams,"offTxt":"재입력","offFunc":_m.offCallback,"offParams":_m.offParams});
			return false;
		} else {
			if (_m.beforeShowHelp!=null) _m.beforeShowHelp;
			log.debug('validation fail');
			showMsg(msg, function() { 
				fc.focus();
			});
			return false;
		}
		//return el.name;
	},
	// 확인창 출력
	confirm : function(el,msg,nm2) {
		var _m = this;
		var msgcl = msg.split(_m.spl_kv);
		var msg = _m.getMsg(el,{"msgcl":msgcl[0],"nm2":msgcl[1]});
		var fc_el = el.getAttribute("FOCUS");	// FOCUS속성이 있을땐 해당 속성의 이름을 가진 엘리먼트에 focus를 준다.
		//if (el.type=="hidden" && fc_el!=null) { // IE7에서 focus가 function으로 반환됨.
		//if (el.type=="hidden" && fc_el!=null && typeof($(fc_el))!='object') {
		var fc = el;
		_m.failElem = el;
		log.debug(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>" + _m.failElem);
		if (el.type=="hidden" && fc_el!=null) {
			fc = $(fc_el);
			/*if (fc!=undefined && fc.focus()) return el.name;
			else return el.name;*/
		} else if (el.type!="hidden") {
			el.focus();
		}
		return confirm(msg);
		//showMsg(msg, function() { fc.focus(); });
		//return el.name;
	},
	// 출력 메시지 생성
	getMsg: function(el,opt) {
		var _m = this;
		var msgcl = opt.msgcl;
		var nm2 = opt.nm2;
		var pattern = /{([a-zA-Z0-9_]+)\+?([가-힣]{2})?}/;
		var msg = _m.msg[msgcl];
		var name = el.getAttribute("HNAME");
		if (name==null || name==undefined) name = (hname = el.getAttribute("TITLE")) ? hname : el.getAttribute("NAME");
		var rex = pattern.exec(msg);
		//var tail = (RegExp.$2) ? conjunc(eval(RegExp.$1),RegExp.$2) : "";	// 크롬에서 뭔가 문제가...
		var tail = (rex[2]) ? conjunc(eval(rex[1]),rex[2]) : "";
		if (typeof(nm2)=='object') {
			var name2 = nm2.getAttribute("HNAME");
			if (name2==null || name2==undefined) name2 = (hname = nm2.getAttribute("TITLE")) ? hname : nm2.getAttribute("NAME");
			nm2 = name2;
		}
		//msg = msg.replace(pattern,eval(RegExp.$1) + tail).replace(pattern,nm2);
		msg = msg.replace(pattern,eval(rex[1]) + tail).replace(pattern,nm2);
		log.debug("validator msg : " + msg);
		return msg;
	},
	failElem : null
};

