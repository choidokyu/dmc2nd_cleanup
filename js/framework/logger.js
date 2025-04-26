/**
 * @File Name : logger.js
 * @Description : 브라우저 콘솔에 로그 찍는 함수
 * @author : 신현삼 mong32@gmail.com
 * @since : 2012. 01. 13.
 * @version : 1.0
 * 
 * <pre>
 *  == 개정이력(Modification Information) ==
 *   
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *  2012. 01. 13.  신현삼          최초 생성
 *  그냥 gwt-log, yui2 logger 나 다른 라이브러리 쓰는게 나을듯하지만...
 *	일단 크롬에서만 테스트함.이제 기능을 슬슬 추가해볼까?
 *	2012. 09. 06.	신현삼		공통 기반에서의 테스트를 수월하게 하기 위해 웹페이지상의 콘솔 기능 추가
 * </pre>
 */

if (window.console == undefined) console = {log:function(){}};	// IE

var logger = function() {
	this._isDebugEnabled = false;
	this._isErrorEnabled = true;
	this._mode = '#####';
	this.jq;
	this._stack = {
		url : '',
		fileName : '',
		lineNumber : '',
		colNumber : ''
	};
};

logger.prototype.init = function() {
	this.log('========== LOGGER INITIALIZED ==========');
	if (isDebug) this._isDebugEnabled = true;
};

logger.prototype.log = function(msg) {
	var d = new Date();
	var nowstr = this.leadingZeros(d.getFullYear(), 4)
		     + '-' + this.leadingZeros(d.getMonth() + 1, 2)
		     + '-' + this.leadingZeros(d.getDate(), 2)
		     + ' ' + this.leadingZeros(d.getHours(), 2)
		     + ':' + this.leadingZeros(d.getMinutes(), 2)
		     + ':' + this.leadingZeros(d.getSeconds(), 2);
	this.getStack();
	msg = '########## ' + nowstr + ' ' + this._mode + ' [ '+ this._stack.fileName + ':' + this._stack.lineNumber + ' ] ' + msg;
	if (window.console) console.log(msg);
	if (this.webView.div!=null) {
		this.webView.debug(msg);
	}
};

logger.prototype.getStack = function() {
	var getErrLn = function(urlstr) {
		if (urlstr!=null) {
			return urlstr.substring(urlstr.lastIndexOf('/') + 1, urlstr.length);
		} else {
			return '';
		}
	};

	try { throw Error(''); }
	catch(err) {
		var _stack = err.stack;
		if (_stack!=null) {
			var tmparr = _stack.split('at');
			var errline = getErrLn(tmparr[5]);
			var tmparr2 = errline.split(':');
			this._stack = {
				url : tmparr[5],
				fileName : tmparr2[0],
				lineNumber : tmparr2[1],
				colNumber : tmparr2[2]
			};
		}
		return err;
	}
};

logger.prototype.debug =  function(msg) {
	if (this._isDebugEnabled) {
		this._mode = 'DEBUG';
		this.log(msg);
	}
	return true;
};

logger.prototype.error =  function(msg) {
	if (this._isErrorEnabled) {
		this._mode = 'ERROR';
		this.log(msg);
	}
	return true;
};


logger.prototype.leadingZeros = function (str, pos) {
	var zero = '';
	str = str.toString();
	if (str.length < pos) {
		for (var i = 0; i < pos - str.length; i++) {
			zero += '0';
		}
	}
	return zero + str;
};

/**
 * 웹화면 콘솔 기능
 */
logger.prototype.webView = {
		div:null,
		prompt:null,
		console:null,
		btn:null,
		jq:null,
		log:'',
		init : function(jq,$pg) {
			var _m = this;
			_m.jq = jq;
			if (_m.jq!=null && isDev) {
				var $div = $pg;
				var $console = $div.find('#console');
				var $prompt = $div.find('#prompt');
				var $btn = $div.find('#btn_cls');
				_m.div = $div;
				_m.btn = $btn;
				_m.prompt = $prompt;
				_m.console = $console;
				_m.log = '';
				$('#webConsole').hide();
				console.log('=============== Logger Webview Init ===============');
			}
		},
		printMsg : function(msg) {
			var _m = this;
			$console = _m.console;
			_m.log = _m.log + '\n' + msg;
			if ($console[0].tagName.toLowerCase()=='div') {
				msg = msg.replaceAll('<','&lt;').replaceAll('>','&gt;');
				$console.append('<br/>' + msg).scrollTop($console[0].scrollHeight);
			} else {
				$console.val(_m.log).scrollTop($console[0].scrollHeight);
			}
		},
		debug : function(msg) {
			var _m = this;
			var $div = _m.div;
			var $prompt = _m.prompt;
			var $console = _m.console;
			var $btn = _m.btn;
			_m.printMsg(msg);

			if ($prompt!=null) {
				if ($prompt.data('events')==null || $prompt.data('events').keyup==null) {
					$prompt.bind('keyup', function(e) {
						var kc = (e.keyCode ? e.keyCode:e.which);
						var inp = $(this).val();
						if (kc==13 && inp!='') {
							var rtn = new Function('return ' + inp)();
							if (inp.indexOf('$')==0) {
								//var str = rtn.prop('outerHTML');
								var str = $(rtn).outerHTML();
								_m.printMsg(str);
							} else if (typeof rtn == 'object') {
								var str = '';
								str += 'var_dump : ' + rtn + '\n';
								for (var k in rtn) {
									if (typeof(rtn[k])=='object') {
										str += '>>> Object : ' + k + '\n';
										for (var k2 in rtn[k]) {
											str += '	' + k2 + '=' + rtn[k][k2] + '\n';
										}
									} else {
										str += '		' + k + '=' + rtn[k] + "  (" + typeof(rtn[k]) + ")" + '\n';
									}
								}
								_m.printMsg(str);
							} else if (rtn!=null) {
								_m.printMsg(rtn.toString());
							}
						}
						return false;
					});
					//$prompt.data('events','keyup');
				}
			}
			
			
			var con_tog = function() {
				$('#webConsole').toggle('fast',function() {
					if ($(this).css('display') == 'block') {
						if ($console[0].tagName.toLowerCase()=='div') {
							$console.scrollTop($console[0].scrollHeight);
						} else {
							$console.val(_m.log).scrollTop($console[0].scrollHeight);
						}
						$(this).find('#prompt').focus();
					} else {
						
					}
				});
			};
			
			var con_cls = function() {
				if ($console[0].tagName.toLowerCase()=='div') {
					$console.empty();
				} else {
					$console.val('');
				}
			};

			$foot = _m.jq.mobile.activePage.find('footer');
			if ($foot.data('events')==null || $foot.data('events').click == null) {
				$foot.bind('click.console', con_tog);
				$btn.bind('click.clear', con_cls);
			}

			/*if ($btn.data('events') == null) {
				$btn.bind('click',function() {
					var chk = $(this).data('vc');
					if (chk==null || chk==1) {
						$(this).find('#log').hide();
						$(this).find('#console').hide();
						$(this).data('vc',2);
					} else {
						$(this).find('#log').show();
						$(this).find('#console').show();
						$(this).data('vc',1);
					}
				});
				$btn.data('events','click');
			}*/
		}
};


//Exception Handler
window.onerror = function(msg, url, linenumber) {
	var emsg = 'JavaScript Error : ';
	if (isDebug) {
		//emsg += '\n브라우저 정보 : ' + navigator.appName + " ( " + navigator.appVersion + ") ";
		emsg += '\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n\n\n\n' + msg + '\nUrl : ' + url + '\nLine Number : ' + linenumber;
		log.error(emsg);
		//showMsg("스크립트 오류");
		window.onbeforeunload = function() {	// 다른 페이지로 이동 방지
			 return emsg;
		};
	} else {
		emsg += '<br/>' + msg + '<br/>Url : ' + url + '<br/>Line Number : ' + linenumber;
		alert(emsg);
	}
	return false;
};


// logger initialize
var log = new logger();
log.init();
