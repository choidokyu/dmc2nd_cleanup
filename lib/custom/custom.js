$( document ).ready(function() {                                                                                            
    $('.dropdown-menu li a').click(function(){                                                                              
      var selText = $(this).text();                                                                                         
      $(this).parents('.btn-group').find('.dropdown-toggle').html(selText+' <span class="caret"></span>');                
    });                                                                                                                     
});   

$(function() {

  // We can attach the `fileselect` event to all file inputs on the page
  $(document).on('change', ':file', function() {
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
  });

  // We can watch for our custom `fileselect` event like this
  $(document).ready( function() {
      $(':file').on('fileselect', function(event, numFiles, label) {

          var input = $(this).parents('.input-group').find(':text'),
              log = numFiles > 1 ? numFiles + ' files selected' : label;

          if( input.length ) {
              input.val(log);
          } else {
              if( log ) alert(log);
          }

      });
  });
  
  
  // add CDK iframe height 를 자동화 하기 위함
  window.addEventListener('load', function() {
    let url = window.location.pathname;
    var name = url.substring(url.lastIndexOf("/") + 1);
    //console.log(name);
    let message = {name : name, height: document.body.scrollHeight};
    window.parent.postMessage(message, "*");
  });
  
  window.addEventListener('resize', function() {
    let url = window.location.pathname;
    var name = url.substring(url.lastIndexOf("/") + 1);
    //console.log(name);
    let message = {name : name, height: document.body.scrollHeight};
    window.parent.postMessage(message, "*");
  });
  
  /* add CDK
   * 같은 값이 있는 열을 병합함
   * 사용법 : $('#테이블 ID').rowspan(0);
   */
  $.fn.rowspan = function(colIdx, isStats) {
      return this.each(function(){
          var that;
          $('tr', this).each(function(row) {
              $('th:eq('+colIdx+')', this).filter(':visible').each(function(col) {
                  if ($(this).html() == $(that).html()
                      && (!isStats || isStats && $(this).prev().html() == $(that).prev().html() )
                      ) {
                      rowspan = $(that).attr("rowspan") || 1;
                      rowspan = Number(rowspan)+1;
                      $(that).attr("rowspan",rowspan);
                      // do your action for the colspan cell here
                      $(this).hide();
                      //$(this).remove();
                      // do your action for the old cell here
                  } else {
                      that = this;
                  }
                  // set the that if not already set
                  that = (that == null) ? this : that;
              });
          });
      });
  };

  /* add CDK
   * 같은 값이 있는 행을 병합함
   * 사용법 : $('#테이블 ID').colspan (0);
   */
  $.fn.colspan = function(rowIdx) {
      return this.each(function(){
          var that;
          $('tr', this).filter(":eq("+rowIdx+")").each(function(row) {
              $(this).find('th').filter(':visible').each(function(col) {
                  if ($(this).html() == $(that).html()) {
                      colspan = $(that).attr("colSpan") || 1;
                      colspan = Number(colspan)+1;
                      $(that).attr("colSpan",colspan);
                      $(this).hide(); // .remove();
                  } else {
                      that = this;
                  }
                  // set the that if not already set
                  that = (that == null) ? this : that;
              });
          });
      });
  }
  
});
  
  // ADD CDK 팝업창에 이미지 원본을 그대로 띄우기 위함
  function onloadImage(url,width,height){
    var img = new Image();
    img.src = url;
    
    var w_width  = 45;
    var w_height = 45;
    
    if(isNaN(Number(width)) || isNaN(Number(height))) {
        w_width  = 768;
        w_height = 1024;
    } else {
        w_width  = w_width + Number(width);
        w_height = w_height + Number(height);
    }
    
    var OpenWindow=window.open(
        '','_blank', 'width='+w_width+', height='+w_height+', menubars=no, scrollbars=auto'
    );
    
    OpenWindow.document.write("<style>body{margin:10px;}</style><img src='"+url+"' style='padding: 10px;' />");
  }
  
