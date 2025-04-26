/**
 * @author LG CNS
 */
$(window).load(function(){
	$(window).resize(function(){
		w_width = $(this).width(); //window width
		w_height = $(this).height(); //window height
		
		left_height = w_height - 35 - 38 -20 + "px";
		mainleft_height = w_height - 98 + "px";
		right_height = w_height - 50 + "px";
		left_width = $("#LblockLeft").width() - 1 + "px";
		
		$("#LblockLeft").height(w_height);
		$("#LblockMainBody").height(mainleft_height);
		$("#LblockMainBodyFull").height(mainleft_height);
		$("#LblockRight").height(w_height);
		$("#LblockLeft").width(left_width);
		$("#IP_iframe_left").height(left_height);
		$("#IP_iframe_right").height(right_height);
		$("#OP_iframe").height(w_height);
		
		
		if (w_width > 1600) {
			$(".Llayer_popup600").addClass('wide');
			$(".Llayer_popup400").addClass('wide');
		}else if (w_width <=1600 && w_width > 1400){ 
			$(".Llayer_popup600").removeClass('wide');
			$(".Llayer_popup400").addClass('wide');
		}else {
			$(".Llayer_popup600").removeClass('wide');
			$(".Llayer_popup400").removeClass('wide');
		}
	});
	$(window).resize();
});

$(document).ready(function(){
	
	$("#LblockSearch .detailsearch").click(function(){
		var searchDetail = $(this).parent().parent().children('table').find('.LsearchDetail');
		
		if(!$(searchDetail).hasClass('Lnodisplay')){
			$(searchDetail).addClass('Lnodisplay');
		}else {
			$(searchDetail).removeClass('Lnodisplay');
		}
		
	});
	
	
	$(".Lbtn3.hideTable").click(function(){
		var tableDetail = $(this).parent().next();
		var appendColorBox = "<div class='LblockEmptyTable'><span class='Lnodisplay'>This empty area shows users that there would be a table if they click the button</span></div>";
		if(!$(tableDetail).hasClass('Lnodisplay')){
			$(tableDetail).addClass('Lnodisplay');
			$(this).parent().append(appendColorBox);
		}else {
			$(tableDetail).removeClass('Lnodisplay');
			$(this).parent().find("div.LblockEmptyTable").remove();
			
		}
		
	});
	
	
	$(".Lbtn.close").click(function(){
		$(".Llayer_popup600").addClass('Lnodisplay');
		$(".Llayer_popup400").addClass('Lnodisplay');
	});
	
	$(".iconHelp").hover(function(){
		$(this).parent().next(".LCommentLayer").removeClass('Lnodisplay');
		
	},function(){
		$(this).parent().next(".LCommentLayer").addClass('Lnodisplay');
	});
	
	$(".hiddenCells").addClass('Lnodisplay');
	
	$(".Lbtn4").click(function(e){
		e.preventDefault();
		var hidden = $(".LblockListTable").find('.hiddenCells');
		
		if($(this).hasClass('openAll')){
			$(hidden).removeClass('Lnodisplay').css('display','table-row');
			$(this).find('input').val('모두접기');
			$(this).removeClass('openAll').addClass('closeAll');
		}else if($(this).hasClass('closeAll')){
			$(hidden).addClass('Lnodisplay').css('display','none');
			$(this).find('input').val('모두보기');
			$(this).removeClass('closeAll').addClass('openAll');
		}else {
			$(".hiddenCells").addClass('Lnodisplay').css('display','none');
			$(this).parent().parent().next('.hiddenCells').removeClass('Lnodisplay').css('display','table-row');
	
		}
	});
	
	
	
});

function showLayerPopup(target){
	var getId = "#" + target;
	
	$(".Llayer_popup600").addClass('Lnodisplay');
	$(".Llayer_popup400").addClass('Lnodisplay');
	$(getId).removeClass('Lnodisplay');
}


