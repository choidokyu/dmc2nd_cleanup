/**
 * @File Name : layout.js
 * @Description : 레이아웃 관련 js
 * @author : 신현삼 mong32@gmail.com
 * @since : 2013. 03. 27.
 * @version : 1.0
 * 
 * <pre>
 *  == 개정이력(Modification Information) ==
 *   
 *   수정일      수정자           수정내용
 *  -------    --------    ---------------------------
 *  2013. 04. 22.  신현삼          최초 생성
 *  
 * </pre>
 */


(function($) {
	// a 태그로 만들어진 메뉴 클릭시 선택 표시 설정
	$.fn.menu = function(param_nm) {
		var $obj = $(this);
		if (trim(param_nm)!='') {	// 페이지 이동 형태
			var req = new httpRequest();
			//var params = $.param(req.params);
			var chk_param = req.get(param_nm);
			log.debug(param_nm + '=' + chk_param);
			var $sel = $obj.find('a[href$="' + param_nm + '=' + chk_param + '"]');
			
			if ($sel.length>0) {
				$sel.addClass('leftSel');
				var txt = $sel.text();
				$('.cur_page').html(txt);
			}
		} else {	// 페이지 이동이 없을때
			$obj.find('a').click(function() {
				var txt = $(this).text();
				$('.cur_page').html(txt);
				$obj.find('a').removeClass('leftSel');
				$(this).addClass('leftSel');
			});
		}
	};
	
})(jQuery);
