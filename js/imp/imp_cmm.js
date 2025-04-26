/**
 * @File Name : imp_cmm.js
 * @Description : 수입통관 공통 함수
 * @author : 신현삼 mong32@gmail.com
 * @since : 2013. 07. 23.
 * @version : 1.0
 * 
 * <pre>
 *  == 개정이력(Modification Information) ==
 *   
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *  2013. 07. 23.  신현삼          최초 생성
 *	2013. 08. 06.	신현삼		iframe과 같은 레벨에 LblockButton 이 있을 경우 height 조정.
 * </pre>
 */

/*********************************
 * Ajax로 로컬 파일을 로드 (화면 설계용).
 */


var callRightFrame = function(fn,opt) {

	$.ajax({
		url: fn,
		async : true,
		dataType : 'text',
		data: null,
		success: function(res){
			var body_html = res.substring(res.indexOf('<body'),res.indexOf('</body>') + 7);
			var $div = $(body_html).filter('.LblockRight');

			$('.LblockRight').remove()
			if (opt!=null) {
				if (opt.src!=null) $div = $div.find(opt.src);
				if (!$div.hasClass('.LblockRight')) {
					var divid = '11111';
					var $blockRight = $('<div id="LblockBlank' + divid + '" class="LblockBlank LblockRight" style="height:100%;overflow:none;overflow-y:auto;"></div>');
					$div = $blockRight.append($div);
				}
			}

			$('.Lclear').append($div);
			var v_height = $(window).height() - $('.Lclear').offset().top;
			//$('.LblockMainBody').css('height',v_height);
			//$('.Lclear').css('height','100%');
			$('.LblockLeft,.LblockRight').css('height', v_height).css('overflow','hidden').css('overflow-y','auto');
			$('.LblockLeft').find('#LblockButton').css('width','100%');
			$('.LblockRight').find('#LblockButton').css('width','100%');
		},
		error:function() {}
	});
}


var applyImpCmm = function() {
	// 공통 스타일
	//$('th').css('text-align','center');
	$('input[readonly="readonly"]').css('background-color','#CDCDCD');
	$('body > .LblockRight').css('width','100%');
	
	//if ($('.LblockLeft').length>0 && $('.LblockRight').length>0) {
	if (($('iframe').length<=0
		|| $('body > .LblockLeft').length>0 && $('body > .LblockRight').length>0)
		|| (($('.Lclear > .LblockLeft').length>0 && $('.Lclear > .LblockRight').length>0))
		&& $('.Lclear').siblings().length<=0
		) {
		log.debug('와이드 적용');
		$('#LblockMainBody').attr('id','LblockMainBodyFull');
		$('#LblockButton').css('width','100%');
		$('.LblockRight').find('#LblockButton').css('width','100%')
	}
	
	if ($('body > .LblockLeft').length<=0 && $('body > .LblockRight').length>0) {
		log.debug('단독화면');
		//$('#LblockBody').attr('id','LblockBodyFull');
		$('#LblockBody').css('width','100%');
		$('body > .LblockRight').removeClass('LblockRight').addClass('LblockLeft');
	}
	
	// 코드 검색
	$('input[data-type="comn_cd"]').change(function() {
		log.debug($(this).val());
	});
	
	$('input[data-type="comn_cd_nm"]').keyup(function() {
		log.debug($(this).val());
	});
	
	$('img[data-cd!=""]').click(function() {
		log.debug('코드 검색 팝업');
	});
	
	// css 보기좋게 수정
	$('input:radio').css('vertical-align','bottom').css('margin','2px').css('margin-right','0px');
	$('input:radio').siblings().filter('label').css('margin-right','4px');
	$('input[size=2],input[size=1]').css('margin-right','2px');

	// 테이블 연결을 위해 생성한 빈 row 제거
	//$('tr:has(span.sign:empty)').filter(function() { return $(this).find('td').length == $(this).find('span.sign:empty').length ? true:false; }).remove();
	$('tr:has(span.sign:contains(REMOVE ROW))').remove();
	
	
	// 리스트 checkbox 선택 이벤트
	// 전체선택
	$('.LblockListTable').find('thead > tr').find('input:checkbox').on('change', function() {
		var chked = $(this).prop('checked');
		log.debug('ALL');
		$(this).parent().parent().parent().siblings().filter('tbody').find('tr').find('input:checkbox').prop('checked',chked);
	});

	$('.LblockListTable').find('tbody > tr').find('td').filter(':not(:has(input:checkbox,input:button))').on('click', function() {
		var chkbx = $(this).parent().find('input:checkbox');
		chkbx.trigger('click');
	});
	
	$('.LblockListTable').find('tbody > tr').find('td').filter(':not(:has(input:radio))').on('click', function() {
		var chkbx = $(this).parent().find('input:radio');
		chkbx.trigger('click');
	});

	// 2013.08.05 기간형태에 ~넣기
	//$('img[src="../images/icon/icon_calender.gif"]').filter(function() { return $(this).find('~ img[src="../images/icon/icon_calender.gif"]').length>0 ? true:false; }).after('&nbsp;~&nbsp;');
	$('td:not(:contains("~"))').find('img[src="../images/icon/icon_calender.gif"]').filter(function() { return $(this).find('~ img[src="../images/icon/icon_calender.gif"]').length>0 ? true:false; }).after('&nbsp;~&nbsp;');
	
	/*$('iframe').css('height','100%').parents().filter(':not(#LblockMainBody)').css('height','100%');
	$('iframe').contents().find('#LblockBody,#LblockMainBody').css('overflow','hidden').css('height','100%');*/
	
	// 2013.08.13 목록 전체건수 공통 적용
	var cntStr = '<div id="LblockDetail99" class="LblockDetail">'
		+'				<table summary="총건수">'
		+'					<caption>총건수</caption>'
		+'					<tbody>'
		+'						<tr>'
		+'							<td style="border:none; width:80px;">전체: 000건</td>'
		+'							<td style="border:none;">페이지당'
		+'								<select id="audtDt1" name="audtDt1">'
		+'									<option value="">-- 선택 --</option>'
		+'									<option value="10">10</option>'
		+'									<option value="50">50</option>'
		+'									<option value="100" selected="selected">100</option>'
		+'									<option value="200">200</option>'
		+'								</select>'
		+'							</td>'
		+'							<td style="border:none;">'
		+'							</td>'
		+'						</tr>'
		+'					</tbody>'
		+'				</table>'
		+'			</div>';
	$('.LblockListTable:has(ul)').filter(function() { return $(this).siblings().filter('.LblockDetail:has(table[summary="총건수"])').length>0 ? false:true; }).each(function() {
		$(this).before($(cntStr));
	});
	
	// 2013.08.14 조회버튼
	/*$('input.Limage.search,input.LimageMore').each(function() {
		var $div = $(this).parents('div#LblockSearch:first');
		if ($div.length<=0) $div = $(this).parents('div#LblockSearch2:first');
		var $adiv = $div.find('~#searchBtn');
		if ($adiv.length<=0) {
			$div.after($('<div id="searchBtn" style="text-align:right"></div>'));
			$adiv = $div.find('~#searchBtn');
		}
		//log.debug('조회 버튼 끄집어내기' + $div.length + '/' + $div.attr('id'));
		$div.css('border','none').css('margin-bottom','5px').find('table').css('border','solid 2px #BFDCEE').css('width','100%');
		//$div.after($('<div style="text-align:right"></div>').append($(this)).css('margin-bottom','20px').width($div.width()));
		$adiv.append($(this).css('vertical-align','middle').css('margin-left','5px')).css('margin-bottom','20px').width($div.width());
	});*/ // 2013.08.26 신규 모델러에서 css 적용됨
	// 2013.09.02 초기화버튼 추가
	$('input.Limage.search,input.LimageMore').each(function() {
		var $div = $(this).siblings().filter('input.Limage.search[value="초기화"]');
		if ($div.length<=0) {
			$(this).before($('<input type="button" class="Limage search" alt="button" value="초기화">'));
		}
	});
	
	//2013.08.14 input box highlight
	$('input.highlight').css('border', '2px solid yellow');
	
	// 2013.08.14 필수값
	$('input[class*=":true"]').parent().prev('th').append('<span style="color:red">*</span>');
	
	// 2013.08.28 수입신고번호 란입력
	$('input[data-type="impDclrNoTpcd"]').each(function() { if ($(this).prev(':not(input)').filter(':contains("-")').length<=0) { $(this).before('<span>-</span>&nbsp;'); } });
	
	// 2013.09.02 새 css 에서 목록 정렬 css가 바뀜...왜??? LblockBlank 를 뺀거지?
	$('.LblockListTable').find('td').css('vertical-align','middle');
	$('.LblockDetail').find('th,td').css('padding','3px');

	$('input[value="추징고지등록"]').click(function() {
		var tmp = window.parent.$('.LblockTab').find('li:has(a[href="#adchNfcpnRgsr"])');
		//log.debug(tmp.attr('href'));
		if (tmp) tmp.trigger('click');
	});
	
	$('input[value="담보정보"]').click(function() {
		var tmp = window.parent.$('.LblockTab').find('li:has(a[href="#mgInfo"])');
		//log.debug(tmp.attr('href'));
		if (tmp) tmp.trigger('click');
	});
	
	// 전체를 앞으로...(왜 뒤에 붙는거지?)
	if ($('label[for="sCstm-Dvsn1"]').length>0 && $('label[for="sCstm-Dvsn2"]').length>0) {
		$('label[for="sCstm-Dvsn2"]').detach().prependTo($('#sCstm-Dvsn2').parent())
		$('#sCstm-Dvsn2').detach().prependTo($('#sCstm-Dvsn2').parent())
	}
	
	// 아코디언 적용
	var accDetail = [];
	$('.LblockAccDetail').each(function() {
		var nm = $(this).attr('data-div-nm');
		accDetail[nm] = $(this).outerHTML();
	});
	$('td:contains("[ACC]")').html(function() {
		var txt = $(this).text();
		txt = txt.replaceAll('[ACC]','');
		log.debug(txt);
		//return $('.LblockAccDetail[data-div-nm="' + txt + '"]').outerHTML();
		return accDetail[txt];
	}).css('padding','0px').parent().hide(0);
	$('.LblockAccDetail').hide(0).css('border','1px solid gray').css('border-bottom','2px solid gray').find('td').css('text-align','left');
	$('td').find('.LblockAccDetail').show(0);
	$('input[onclick="fnc아코디언토글()"]').click(function() {
		$(this).parent().parent().parent().next().toggle('fast');
	});
}


// iframe height 맞추기
var setDocSize = function() {
	log.debug('리사이즈');
	var iLen = $('iframe').length;
	var btnHeight = 0;
	if ($('iframe').siblings().filter('#LblockButton').length>0) {
		//iHeight = $('iframe').height();
		btnHeight = $($('iframe').siblings().filter('#LblockButton')[0]).outerHeight(true) + 5;
	}

	$('#LblockMainBodyFull').css('height','95%').css('overflow','hidden'); 
	$('#LblockMainBody').css('overflow','hidden').css('overflow-y','auto'); 
	$('iframe').contents().find('body').css('width','97%');
	//if ($('iframe').siblings().filter('#LblockButton').length>0) {
	if (iLen>0 && btnHeight>0) {
		log.debug('iframe resize 1');
		$('iframe').height($('iframe').height() - btnHeight);
	} else if (iLen>0) {
	//} else {
		log.debug('iframe resize 2' + iLen);
		//var bodyHeight = $('body').height();
		var bodyHeight = document.documentElement.clientHeight;
		/*var lbl = $('iframe').parents().filter('#LblockMainBody');
		if (lbl.length>0) {
			bodyHeight = lbl.outerHeight(true);
		}*/
		var offt = $('iframe').parent().offset().top;
		var h = bodyHeight - offt - 10;
		log.debug(h);
		$('iframe').css('height','100%').parents().filter(':not(#LblockMainBody)').height(h);
		//$('iframe').css('height','100%').parents().filter(':not(#LblockMainBody)').css('height','100%');
		//$('iframe').contents().find('#LblockBody,#LblockMainBody').css('overflow','hidden').css('height','100%');
	}
	$('#LblockMainBody').find('#searchBtn').css('width','100%');
};

// 문서 로드 완료
//var bodyHeight = $('body').outerHeight(true);
$(document).ready(function() {
	applyImpCmm();
	if (typeof init == 'function') init();
	
	$(window).bind("resize", function(e) {
		setTimeout(setDocSize,50 );
	});
	
	$('iframe').load(function() {
		log.debug('iframe loaded');
		//$(window).trigger('resize');
	});
	
	$('.LblockTab').find('a').on('click', function() {
		log.debug('탭 클릭');
		$(window).trigger('resize');
	});
});




var fnc아코디언토글 = function() {
};



