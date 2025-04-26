/**
 * @(#) dui_webvalidator.js version 1.1
 *
 *  Copyright(저작권) Do Not Erase This Comment!!! (이 주석문을 지우지 말것)
 *
 *  Do Not re-distribute with-out permission. especially out-side of LG-CNS.
 *  허가 없이 재배포 해서는 안된다. 특히 LG-CNS의 외부로 유출을 하여서는 안된다.
 *
 * AUTHORS LIST       E-MAIL  
 * jaehyun lim    jhylim@lgcns.com
 */
String.prototype.advancedSplit = function(delim, options) {
	if (options == null || options.strip() == "") {
		return this.split(delim);
	}

	var optionI = false;
	var optionT = false;
	
	options = options.strip().toUpperCase();
	
	for (var i = 0; i < options.length; i++) {
		if (options.charAt(i) == 'I') {
			optionI = true;
		} else if (options.charAt(i) == 'T') {
			optionT = true;
		}
	}
	
	var arr = new Array();
	var cnt = 0;
	var startIdx = 0;
	var delimIdx = -1;
	var str = this;
	var temp = 0;
	
	while ( (delimIdx = (str == null) ? 
	         -1 : str.indexOf(delim, startIdx)
	        ) != -1
	      ) {

		if (optionI && str.substr(delimIdx - 1, 2) == '\\' + delim) {
			str = str.cut(delimIdx - 1, 1);
			startIdx = delimIdx;
			continue;
		}

		arr[cnt++] = optionT ? str.substring(0, delimIdx).strip() :
		                       str.substring(0, delimIdx);
		str = str.substr(delimIdx + 1);
		startIdx = 0;
	}
	
	arr[cnt] = (str == null) ? "" : str;
				
	return arr;
}
String.prototype.cut = function(start, length) {
    return this.substring(0, start) + this.substr(start + length);
}

dui.wv = {};
dui.wv.Message = {};
dui.wv.Message.get = function (msg, args) {
	if (!msg || !args) return msg;
	var index = 0, cnt = 0, arg;
	if (!(args instanceof Array)) args = [args];
	
	while ( (index = msg.indexOf("@", index)) != -1) {
		msg = msg.substr(0, index) + args[cnt] + msg.substring(index + 1);
		index = index + String(args[cnt]).length;
		cnt++;
	}
	return msg;
}
dui.wv.Message.getById = function (msgId, args) {
	var msg = dui.wv.Message.data[msgId];
	if (!msg) return null;
	return dui.wv.Message.get(msg, args);
}
dui.wv.Message.data = {
	"001":"필수 입력 항목입니다.",
	"002":"공백없이 입력하십시오.",
	"003":"@자리수만큼 입력하십시오.",
	"004":"@부터 @사이로 입력하십시오.",
	"005":"숫자만을 입력하십시오.",
	"006":"문자만을 입력하십시오.",
	"007":"숫자와 문자만을 입력하십시오.(공백제외)",
	"008":"숫자와 문자만을 입력하십시오.(공백포함)",
	"009":"@자 이상으로 입력하십시오.",
	"010":"@자 이하로 입력하십시오.",
	"011":"@ 이상으로 입력하십시오.",
	"012":"@ 이하로 입력하십시오.",
	"013":"년도가 잘못되었습니다.",
	"014":"유효한 주민등록번호가 아닙니다.",
	"015":"유효한 사업자등록번호가 아닙니다.",
	"016":"유효한 날짜가 아닙니다.",
	"017":"월이 잘못되었습니다.",
	"018":"일이 잘못되었습니다.",
	"019":"시가 잘못되었습니다.",
	"020":"분이 잘못되었습니다.",
	"021":"초가 잘못되었습니다.",
	"022":"@년 @월 @일 이후이어야 합니다.",
	"023":"@년 @월 @일 이전이어야 합니다.",
	"024":"'@' 형식이어야 합니다.\n" +
	      "  - # : 문자 혹은 숫자\n" +
	      "  - h, H : 한글(H는 공백포함)\n" +
	      "  - A, Z : 문자(Z는 공백포함)\n" +
	      "  - 0, 9 : 숫자(9는 공백포함)",
	"029":"@자리수만큼 입력하십시오. (한글은 @자리수)",
	"030":"@자 이상으로 입력하십시오. (한글은 @자 이상)",
	"031":"@자 이하로 입력하십시오. (한글은 @자 이하)",
	"032":"----미정",
	"033":"@ 문자는 사용할 수 없습니다.",
	"034":"유효한 이메일 주소가 아닙니다.",
	"035":"정수부를 @자 이하로 입력하십시오.",
	"036":"소수부를 @자로 입력하십시오.",
	"037":"'@' 형식으로 입력하십시오.",
	"100":"Validator 표현식이 잘못되었습니다. (@)",
	"101":"Validator 표현식에서 해당 검사항목은 존재하지 않습니다. (@)"
};

dui.wv.Global = {
	"MONTH_IN_YEAR" : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	"SHORT_MONTH_IN_YEAR" : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	"DAY_IN_WEEK" : ["Sunday", "Monday", "Tuesday", "Wednesday","Thursday", "Friday", "Saturday"],
	"SHORT_DAY_IN_WEEK" : ["Sun", "Mon", "Tue", "Wed","Thu", "Fri", "Sat"],
	"DAYS_IN_MONTH" : [31,28,31,30,31,30,31,31,30,31,30,31]
};

dui.wv.Validator = function () {};
dui.wv.Validator.prototype = {
	validate : function (objArr) {
		if (typeof(objArr) == "string") objArr = document.getElementById(objArr);
		if (!objArr) return false;
		if (objArr.length == null) objArr = [objArr];
		for (var i = 0; i < objArr.length; i++) {
			var el = D$(objArr[i]);
			if (el.tagName == "INPUT" || el.tagName == "SELECT" || el.tagName == "TEXTAREA") {
				if (el.tagName != "INPUT" || el.type.toUpperCase() != "FILE") el.value = el.value.strip(); // element의 값을 trim 시켜준다.
				var expStr = this.getExpression(el.className);
				if (!expStr) continue;
				try {
					var exp = new dui.wv.Exp(expStr);
				} catch (e) {
					if (e.name == "WVError") {
						alert(e.message);
						return false;
					} else {
						throw e;
					}
				}
				if (!this.validateValue(exp, el.value)) {
					alert(exp.itemName+" : "+exp.errMsg);
					if (el.enable != false && el.disabled != true) el.focus();
					return false;
				}
			} else {
				if (!this.validate(el.childElements())) return false;
			}
		}
		return true;
	},
	
	getExpression : function (className) {
		var index;
		if ((index=className.indexOf("WV:")) != -1) {
			var expStr = className.substring(index+3);
			if (expStr && (expStr=expStr.strip()) != "") return expStr;
		}
		return null;
	},
	
	validateValue : function (exp, value) {
		if (exp.required && dui.wv.Validator.isNull(value)) {
			exp.errMsg = dui.wv.Message.getById("001");
			return false;
		} 
		if (!exp.required && dui.wv.Validator.isNull(value)) return true;
		if (exp.validators.length == 0) return true;
		for (var i = 0; i < exp.validators.length; i++) {
			if (!exp.validators[i].validate(value)) {
				exp.errMsg = exp.validators[i].message;
				return false;
			}
		}
		return true;
	}
}

dui.wv.Validator.isNull = function (value) {
	if (!value || (typeof(value) == "string" && value.strip() == "")) return true;
	return false;
}

dui.wv.validate = function (obj) {
	var v = new dui.wv.Validator();
	return v.validate(obj);
}

dui.wv.run = function () {
	var frms = document.forms;
	for (var i = 0; i < frms.length; i++) {
		var oldOnsubmit = frms[i].onsubmit;

		if (typeof frms[i].onsubmit != "function") {
			frms[i].onsubmit = function() {
				return dui.wv.validate(this);
			}
		}
	}
}

dui.CB.addEventHandler(window, "load", dui.wv.run);

dui.wv.Exp = Class.create();
dui.wv.Exp.prototype = {
    itemName : null,
    required : false,
	validators : null,
	
	initialize : function (expression) {
		this.validators = [];
	    this.parse(expression);
	},
	
	parse : function (expression) {
		if (!expression) return false;
		var columns = expression.advancedSplit(":", "it");
		this.itemName = columns[0];
		this.required = columns[1] == "true" ? true : false;
		if (dui.wv.Validator.isNull(columns[2])) return;
		var vExps = columns[2].advancedSplit("&", "it");
		for (var i = 0; i < vExps.length; i++) {
			if (dui.wv.Validator.isNull(vExps[i])) continue;
			var sArr = vExps[i].advancedSplit("=", "it");
			if (dui.wv.Validator.isNull(sArr[0])) throw new dui.wv.WVError(this.itemName+" : "+dui.wv.Message.getById("100", vExps[i]));
			if (sArr.length>1 && sArr[1].strip() == "") throw new dui.wv.WVError(this.itemName+" : "+dui.wv.Message.getById("100", vExps[i]));
			if (!eval("dui.wv.type."+sArr[0]+"Validator")) throw new dui.wv.WVError(this.itemName+" : "+dui.wv.Message.getById("101", vExps[i]));
			try {
				if (sArr[1]) this.validators[i] = eval("new dui.wv.type."+sArr[0]+"Validator('"+sArr[1]+"')");
				else this.validators[i] = eval("new dui.wv.type."+sArr[0]+"Validator()");
			} catch (e) {
				if (e.name == "WVError") e.message = this.itemName+" : "+dui.wv.Message.getById("100", vExps[i]);
				throw e;
			}
		}
	}
}

dui.wv.WVError = Class.create();
Object.extend(dui.wv.WVError.prototype, Error.prototype);
dui.wv.WVError.prototype.name = "WVError";
dui.wv.WVError.prototype.initialize = function (message) {
	this.message = message;
}

dui.wv.type = {};

/**
 * lengthValidator
 */
dui.wv.type.lengthValidator = Class.create();
dui.wv.type.lengthValidator.prototype = {
	msgId : "003",
	initialize : function (length) {
		if (isNaN(length)) throw new dui.wv.WVError();
	    this.length = parseInt(length);
	},
	
	validate : function (value) {
		if (!this.checkCondition(value, this.length)) {
			this.message = dui.wv.Message.getById(this.msgId, this.length);
			return false;
		}
		return true;
	},
	
	checkCondition : function (value, vValue) { return value.length == vValue; }
}

/**
 * minLengthValidator
 */
dui.wv.type.minLengthValidator = Class.create();
Object.extend(dui.wv.type.minLengthValidator.prototype, dui.wv.type.lengthValidator.prototype);
dui.wv.type.minLengthValidator.prototype.checkCondition = function (value, vValue) { return value.length >= vValue; }
dui.wv.type.minLengthValidator.prototype.msgId = "009";

/**
 * minLengthValidator
 */
dui.wv.type.maxLengthValidator = Class.create();
Object.extend(dui.wv.type.maxLengthValidator.prototype, dui.wv.type.lengthValidator.prototype);
dui.wv.type.maxLengthValidator.prototype.checkCondition = function (value, vValue) { return value.length <= vValue; }
dui.wv.type.maxLengthValidator.prototype.msgId = "010";

/**
 * byteLengthValidator
 */
dui.wv.type.byteLengthValidator = Class.create();
dui.wv.type.byteLengthValidator.prototype = {
	msgId : "029",
	initialize : function (length) {
		if (isNaN(length)) throw new dui.wv.WVError();
	    this.length = parseInt(length);
	},
	
	validate : function (value) {
		if (!this.checkCondition(this.getByteLength(value), this.length)) {
			this.message = dui.wv.Message.getById(this.msgId, [String(this.length), String(Math.floor(this.length/2))]);
			return false;
		}
		return true;
	},
	
	getByteLength : function (value) {
		var byteLength = 0, c;
		
		for(var i = 0; i < value.length; i++) {
			c = escape(value.charAt(i));      
			
			if (c.length == 1) {  
				byteLength ++;          
			} else if (c.indexOf("%u") != -1)  { 
				byteLength += 2;        
			} else if (c.indexOf("%") != -1)  {  
				byteLength += c.length/3;                
			}
		}
		
		return byteLength;   
	},
	
	checkCondition: function(value, vValue) { return (value == vValue) }
}

/**
 * minByteLengthValidator
 */
dui.wv.type.minByteLengthValidator = Class.create();
Object.extend(dui.wv.type.minByteLengthValidator.prototype, dui.wv.type.byteLengthValidator.prototype);
dui.wv.type.minByteLengthValidator.prototype.checkCondition = function (value, vValue) { return value >= vValue; }
dui.wv.type.minByteLengthValidator.prototype.msgId = "030";

/**
 * maxByteLengthValidator
 */
dui.wv.type.maxByteLengthValidator = Class.create();
Object.extend(dui.wv.type.maxByteLengthValidator.prototype, dui.wv.type.byteLengthValidator.prototype);
dui.wv.type.maxByteLengthValidator.prototype.checkCondition = function (value, vValue) { return value <= vValue; }
dui.wv.type.maxByteLengthValidator.prototype.msgId = "031";

/**
 * numberValidator
 */
dui.wv.type.numberValidator = Class.create();
dui.wv.type.numberValidator.prototype = {
	re : /\s*(\d+)\s*.\s*(\d+)\s*/,
	iLength : null,
	dLength : null, 
	initialize : function (format) {
		if (!format) return;
		var r = format.match(this.re);
		if (!r) return;
		this.iLength = Number(r[1]);
		this.dLength = Number(r[2]);
	},
	
	validate: function(value){
		if (isNaN(value)) {
			this.message = dui.wv.Message.getById("005");
			return false;
		} 
		if (dui.wv.Validator.isNull(this.iLength)) return true;
		
		var strValue = String(value);
		var idx = strValue.indexOf('.');
		if (idx == -1) {
			this.message = dui.wv.Message.getById("036", this.dLength);
			return false;
		}
		var iNumStr = strValue.substr(0, idx);
		var dNumStr = strValue.substr(idx + 1);
		if (iNumStr.length > this.iLength) {
			this.message = dui.wv.Message.getById("035", this.iLength);
			return false;
		} else 	if (dNumStr.length != this.dLength) {
			this.message = dui.wv.Message.getById("036", this.dLength);
			return false;
		}
		
		return true;
	}
}

/**
 * minNumberValidator
 */
dui.wv.type.minNumberValidator = Class.create();
dui.wv.type.minNumberValidator.prototype = {
	initialize : function (minNumber) {
		if (isNaN(minNumber)) throw new dui.wv.WVError();
	    this.minNumber = Number(minNumber);
	},
	
	validate : function (value) {
		if (isNaN(value)) {
			this.message = dui.wv.Message.getById("005");
			return false;
		}
		this.minNumber = Number(this.minNumber);
		value = Number(value);
		
		if (value < this.minNumber) {
			this.message = dui.wv.Message.getById("011", this.minNumber);
			return false;
		}

		return true;
	}
}

/**
 * maxNumberValidator
 */
dui.wv.type.maxNumberValidator = Class.create();
dui.wv.type.maxNumberValidator.prototype = {
	initialize : function (maxNumber) {
		if (isNaN(maxNumber)) throw new dui.wv.WVError();
	    this.maxNumber = Number(maxNumber);
	},
	
	validate : function (value) {
		if (isNaN(value)) {
			this.message = dui.wv.Message.getById("005");
			return false;
		}
		this.maxNumber = Number(this.maxNumber);
		value = Number(value);
		
		if (value > this.maxNumber) {
			this.message = dui.wv.Message.getById("012", this.maxNumber);
			return false;
		}

		return true;
	}
}

/**
 * inNumberValidator
 */
dui.wv.type.inNumberValidator = Class.create();
dui.wv.type.inNumberValidator.prototype = {
	initialize : function (inNumber) {
		var index = inNumber.indexOf("~");
		this.minNumber = inNumber.substring(0, index);
		this.maxNumber = inNumber.substr(index+1);
		if (isNaN(this.minNumber) || isNaN(this.maxNumber)) throw new dui.wv.WVError();
		this.minNumber = Number(this.minNumber);
		this.maxNumber = Number(this.maxNumber);
	},
	
	validate : function (value) {
		if (isNaN(value)) {
			this.message = dui.wv.Message.getById("005");
			return false;
		}
		value = Number(value);
	
		if (value < this.minNumber || value > this.maxNumber) {
			this.message = dui.wv.Message.getById("004", [this.minNumber,this.maxNumber]);
			return false;
		}

		return true;
	}
}

/**
 * minDateValidator
 */
dui.wv.type.minDateValidator = Class.create();
dui.wv.type.minDateValidator.prototype = {
	msgId : "022",
	format : null,
	initialize : function (minDate) {
		var index = minDate.indexOf("(");
		this.format = "YYYYMMDD";
		this.minDate = minDate;
		if (index != -1) {
			this.minDate = minDate.substring(0, index);
			this.format = minDate.substring(index + 1, minDate.length - 1);
		}
		if (!(new dui.wv.type.dateValidator(this.format).validate(this.minDate))) throw new dui.wv.WVError();
	},
	
	validate : function (value) {
		if (!(new dui.wv.type.dateValidator(this.format).validate(value))) {
			this.message = dui.wv.Message.getById("016");
			return false;
		}
		
		if (!this.checkCondition(value, this.minDate)) {
			var msgParams = new Array(4);
			msgParams[0] = this.minDate.substring(0,4);
			msgParams[1] = this.minDate.substring(4,5) == "0" ? this.minDate.substring(5,6) : this.minDate.substring(4,6);
			msgParams[2] = this.minDate.substring(6,7) == "0" ? this.minDate.substring(7,8) : this.minDate.substring(6,8)
			this.message = dui.wv.Message.getById(this.msgId, msgParams);
			return false;
		}
		return true;
	},
	
	checkCondition : function (value, vValue) { return (value >= vValue); }
}

/**
 * maxDateValidator
 */
dui.wv.type.maxDateValidator = Class.create();
Object.extend(dui.wv.type.maxDateValidator.prototype, dui.wv.type.minDateValidator.prototype);
dui.wv.type.maxDateValidator.prototype.checkCondition = function (value, vValue) {	return (value <= vValue) }
dui.wv.type.maxDateValidator.prototype.msgId = "023";

/**
 * formatValidator
 *
 *   #    : 모든문자
 *   h, H : 한글 (H는 공백포함)
 *   A, Z : 문자 (Z는 공백포함)
 *   0, 9 : 숫자 (9는 공백포함) 
 */
dui.wv.type.formatValidator = Class.create();
dui.wv.type.formatValidator.prototype = {
	initialize : function (format) {
		this.format = format;
	},
	
	validate: function(value){
		if (value.length != this.format.length) {
			this.message = dui.wv.Message.getById("024", this.format);
			return false;
		}
		var invalid = false;
		for (var i = 0; i < this.format.length; i++) {
			var chr = value.charAt(i);
			var cCode = value.charCodeAt(i);
			switch (this.format.charAt(i)) {
				case 'h':
					if ((chr == " ") ||
					!((0xAC00 <= cCode && cCode <= 0xD7A3) || (0x3131 <= cCode && cCode <= 0x318E))) invalid = true;
					break;
					
				case 'H':
					var cCode = value.charCodeAt(i);
					if ((chr != " ") &&
					!((0xAC00 <= cCode && cCode <= 0xD7A3) || (0x3131 <= cCode && cCode <= 0x318E))) invalid = true;
					break;
					
				case '0':
					if (isNaN(chr) || chr == " ") invalid = true;
					break;
					
				case '9':
					if (isNaN(chr)) {
						if (chr != " ") invalid = true;
					}
					break;
					
				case 'A':
					if ((chr == " ") || !isNaN(chr)) invalid = true;
					break;
					
				case 'Z':
					if ((chr != " ") && !isNaN(chr)) invalid = true;
					break;
					
				case '#':
					break;
					
				default:
					if (chr != this.format.charAt(i)) invalid = true;
			}
			if (invalid) {
				this.message = dui.wv.Message.getById("024", this.format);
				return false;
			}
		}
		return true;
	}
}

/**
 * ssnValidator
 */
dui.wv.type.ssnValidator = Class.create();
dui.wv.type.ssnValidator.prototype = {
	initialize : function () {},
	
	validate : function (value) {
		if ( !value || value.length != 13 || isNaN(value) )  {
			this.message = dui.wv.Message.getById("014");
			return false;
		}
		
		var jNum1 = value.substr(0, 6);
		var jNum2 = value.substr(6);
	
		/* ----------------------------------------------------------------
		   잘못된 생년월일을 검사합니다.
		   2000년도부터 성구별 번호가 바뀌였슴으로 구별수가 2보다 작다면
		   1900년도 생이되고 2보다 크다면 2000년도 이상생이 됩니다. 
		   단 1800년도 생은 계산에서 제외합니다.
		---------------------------------------------------------------- */
		
		bYear = (jNum2.charAt(0) <= "2") ? "19" : "20";
	
		// 주민번호의 앞에서 2자리를 이어서 4자리의 생년을 저장합니다.
		bYear += jNum1.substr(0, 2);
	
		// 달을 구합니다. 1을 뺀것은 자바스크립트에서는 1월을 0으로 표기하기 때문입니다.
		bMonth = jNum1.substr(2, 2) - 1;
	
		bDate = jNum1.substr(4, 2);
	
		bSum = new Date(bYear, bMonth, bDate);
	
		// 생년월일의 타당성을 검사하여 거짓이 있을시 에러메세지를 나타냄
		if ( bSum.getYear() % 100 != jNum1.substr(0, 2) || bSum.getMonth() != bMonth || bSum.getDate() != bDate) {
			this.message = dui.wv.Message.getById("014");
			return false;
		}

		total = 0;
		temp = new Array(13);
		
		for (var i = 1; i <= 6; i++) 
			temp[i] = jNum1.charAt(i-1);
			
		for (var i = 7; i <= 13; i++)
			temp[i] = jNum2.charAt(i-7);
			
		for (var i = 1; i <= 12; i++) {
			k = i + 1;
			// 각 수와 곱할 수를 뽑아냅니다. 곱수가 만일 10보다 크거나 같다면 계산식에 의해 2로 다시 시작하게 됩니다.
			if(k >= 10) k = k % 10 + 2;
			// 각 자리수와 계산수를 곱한값을 변수 total에 누적합산시킵니다.
			total = total + (temp[i] * k);
		}
		// 마지막 계산식을 변수 last_num에 대입합니다.
		last_num = (11- (total % 11)) % 10;
		// laster_num이 주민번호의마지막수와 같은면 참을 틀리면 거짓을 반환합니다.
		if(last_num != temp[13]) {
			this.message = dui.wv.Message.getById("014");
			return false;
		}
		return true;
	}
}

/**
 * csnValidator
 */
dui.wv.type.csnValidator = Class.create();
dui.wv.type.csnValidator.prototype = {
	initialize : function () {},
	
	validate: function (value) {
		if (!value || value.length != 10 || isNaN(value)) {
			this.message = dui.wv.Message.getById("015");
			return false;
		}
		
		var sum = 0, nam = 0, checkDigit = -1;
		var checkArray = [1, 3, 7, 1, 3, 7, 1, 3, 5];
		
		for (var i = 0; i < 9; i++) 
			sum += value.charAt(i) * checkArray[i];
		
		sum = sum + ((value.charAt(8) * 5) / 10);
		nam = Math.floor(sum) % 10;
		checkDigit = (nam == 0) ? 0 : 10 - nam;
		
		if (value.charAt(9) != checkDigit) {
			this.message = dui.wv.Message.getById("015");
			return false;
		}
		return true;
	}
}

/**
 * filterValidator : 지정된 문자가 들어있을 경우 유효하지 않은 것으로 판단한다.
 * 
 * Wild 문자
 *   ;    - \;
 *   한글 - \h  
 *   영문 - \a
 *   숫자 - \n
 */
dui.wv.type.filterValidator = Class.create();
dui.wv.type.filterValidator.prototype = {
	fStrArr : null,
	
	initialize : function (fStr) {
	    this.fStrArr = fStr.advancedSplit(";", "i");
	    for (var i = 0; i < this.fStrArr.length; i++) {
	    	if (this.fStrArr[i] == "\\h") {
	    		this.fStrArr[i] = "한글";
	    	} else if (this.fStrArr[i] == "\\a") {
	    		this.fStrArr[i] = "영문";
	    	} else if (this.fStrArr[i] == "\\n") {
	    		this.fStrArr[i] = "숫자";
	    	}
	    }
	},
	
	validate : function (value) {
		for (var i = 0; i < this.fStrArr.length; i++) {
			var fStr = this.fStrArr[i];
			if (
			     ((fStr == "한글" || fStr == "영문" || fStr == "숫자") && !this.checkWildChr(value, fStr)) ||
			     (value.indexOf(fStr) != -1) 
			   ) {
				this.message = dui.wv.Message.getById("033", fStr);
				return false;
			}
		}
		return true;
	},
	
	checkWildChr : function (value, fChr) {
		for (var i = 0; i < value.length; i++) {
			var chr = value.charAt(i);
			var cCode = chr.charCodeAt(0);
			if ((fChr == "한글" && ((0xAC00 <= cCode && cCode <= 0xD7A3) || (0x3131 <= cCode && cCode <= 0x318E))) ||
				(fChr == "영문" && ((0x61 <= cCode && cCode <= 0x7A) || (0x41 <= cCode && cCode <= 0x5A))) ||
				(fChr == "숫자" && !isNaN(chr)) ) {
				return false;
			}
		}
		return true;
	}
}

/**
 * emailValidator
 */
dui.wv.type.emailValidator = Class.create();
dui.wv.type.emailValidator.prototype = {
	format : /^((\w|[\-\.])+)@((\w|[\-\.])+)\.([A-Za-z]+)$/,
	initialize : function () {},
	
	validate: function (value) {
		if (value.search(this.format) == -1) {
			this.message = dui.wv.Message.getById("034");
			return false;
		}
		return true;
	}
}

/**
 * dateValidator
 * 
 * format문자 :  YYYY,  -> 4자리 년도
 *               YY,    -> 2자리 년도. 2000년 이후.
 *               MM,    -> 2자리 숫자의 달. 
 *               DD,    -> 2자리 숫자의 일. 
 *               hh,    -> 2자리 숫자의 시간. 12시 기준
 *               HH,    -> 2자리 숫자의 시간. 24시 기준 
 *               mm,    -> 2자리 숫자의 분. 
 *               ss     -> 2자리 숫자의 초. 
 * 
 * 예) 
 *     'YYYYMMDD' -> '20020328'    
 *     'YYYY/MM/DD' -> '2002/03/28'
 *     'Today : YY-MM-DD' -> 'Today : 02-03-28'
 * 
 * 참고) 
 *       format문자가 중복해서 나오더라도 처음 나온 문자에 대해서만
 *       format문자로 인식된다. YYYY와 YY, hh와 HH 도 중복으로 본다.
 *       날짜는 년,월이 존재할 때만 정확히 체크하고 만일 년, 월이 없다면
 *       1 ~ 31 사이인지만 체크한다.
 */
dui.wv.type.dateValidator = Class.create();
dui.wv.type.dateValidator.prototype = {
	dateExp: null,
	year : null,
	month : null,
	value : null,
	
	initialize : function (dateExp) {
	    this.dateExp = dateExp;
	},
	
	validate : function (value) {
		this.value = value;
		
		return (
			this.checkLength(value) &&
			this.checkYear(value) &&
			this.checkMonth(value) &&
			this.checkDay(value) &&
			this.checkHour(value) &&
			this.checkMin(value) &&
			this.checkSec(value) &&
			this.checkRest(value)
		);
	},

	checkLength : function () {
		if (this.value.length != this.dateExp.length) {
			this.message = dui.wv.Message.getById("037", this.dateExp);
			return false;
		}
		return true;
	},
	
	checkYear : function () {
		var index = -1;

		if ( (index = this.dateExp.indexOf("YYYY")) != -1 ) {
			subValue = this.value.substr(index, 4);
			if ( !isNaN(subValue) && (subValue > 0) ) {
				this.dateExp = this.dateExp.cut(index, 4);
				this.value = this.value.cut(index, 4);
				this.year = subValue;
				return true;
			} else {
				this.message = dui.wv.Message.getById("013");
				return false;
			}
		} 
		
		if ( (index = this.dateExp.indexOf("YY")) != -1 ) {
			subValue = "20" + this.value.substr(index, 2);
			if ( !isNaN(subValue) && (subValue > 0) ) {
				this.dateExp = this.dateExp.cut(index, 2);
				this.value = this.value.cut(index, 2);
				this.year = subValue;
				return true;
			} else {
				this.message = dui.wv.Message.getById("013");
				return false;
			}
		} 
		return true;
	},
	
	checkMonth : function () {
		var index = -1;
	
		if ( (index = this.dateExp.indexOf("MM")) != -1 ) {
			subValue = this.value.substr(index, 2);
			if ( !isNaN(subValue) && (subValue > 0) && (subValue <= 12) ) {
				this.dateExp = this.dateExp.cut(index, 2);
				this.value = this.value.cut(index, 2);
				this.month = subValue;
				return true;
			} else {
				this.message = dui.wv.Message.getById("017");
				return false;
			}
		} 
		return true;
	},
	
	checkDay : function () {
		var index = -1;
		var days = 0;
		
		if ( (index = this.dateExp.indexOf("DD")) != -1 ) {
			if ( (this.year) && (this.month) ) {
				days = (this.month != 2) ? dui.wv.Global["DAYS_IN_MONTH"][this.month-1] : (( (this.year % 4) == 0 && (this.year % 100) != 0 || (this.year % 400) == 0 ) ? 29 : 28 );
			} else {
				days = 31;
			}
			
			subValue = this.value.substr(index, 2);
			if ( (!isNaN(subValue)) && (subValue > 0) && (subValue <= days) ) {
				this.dateExp = this.dateExp.cut(index, 2);
				this.value = this.value.cut(index, 2);
				return true;
			} else {
				this.message = dui.wv.Message.getById("018");
				return false;
			}
		} 
		return true;
	},
	
	checkHour : function () {
		var index = -1;
		
		if ( (index = this.dateExp.indexOf("hh")) != -1 ) {
			subValue = this.value.substr(index, 2);
			if ( !isNaN(subValue) && ((subValue=Number(subValue)) >= 0) && (subValue <= 12) ) {
				this.dateExp = this.dateExp.cut(index, 2);
				this.value = this.value.cut(index, 2);
				return true;
			} else {
				this.message = dui.wv.Message.getById("019");
				return false;
			}
		} 
		
		if ( (index = this.dateExp.indexOf("HH")) != -1 ) {
			subValue = this.value.substr(index, 2);
			if ( !isNaN(subValue) && ((subValue=Number(subValue)) >= 0) && (subValue < 24) ) {
				this.dateExp = this.dateExp.cut(index, 2);
				this.value = this.value.cut(index, 2);
				return true;
			} else {
				this.message = dui.wv.Message.getById("019");
				return false;
			}
		} 
		return true;
	},
	
	checkMin : function () {
		var index = -1;
	
		if ( (index = this.dateExp.indexOf("mm")) != -1 ) {
			subValue = this.value.substr(index, 2);
			if ( !isNaN(subValue) && ((subValue=Number(subValue)) >= 0) && (subValue < 60 ) ) {
				this.dateExp = this.dateExp.cut(index, 2);
				this.value = this.value.cut(index, 2);
				this.month = subValue;
				return true;
			} else {
				this.message = dui.wv.Message.getById("020");
				return false;
			}
		} 
		return true;
	},
	
	checkSec : function () {
		var index = -1;
	
		if ( (index = this.dateExp.indexOf("ss")) != -1 ) {
			subValue = this.value.substr(index, 2);
			if ( (!isNaN(subValue)) && ((subValue=Number(subValue)) >= 0) && (subValue < 60 ) ) {
				this.dateExp = this.dateExp.cut(index, 2);
				this.value = this.value.cut(index, 2);
				this.month = subValue;
				return true;
			} else {
				this.message = dui.wv.Message.getById("021");
				return false;
			}
		} 
		return true;
	},
	
	checkRest : function () {
		if (this.value == this.dateExp) return true;
		return false;
	}
}

