
    var MinVersion = 0x05050111;
    var pHwpCtrl;
    var bFrameActionEnabled = false;
    
    /************************************************************************************
	Function 명     : OnStartDoc
	Function 기능   : 기안문 작성 및 검토서 조회를 위한 한글 컨트롤러 호출
	Event           :
	사용예          :
	*************************************************************************************/
   	function OnStartDoc(file_path, file_name, mode, file_type) {
    	pHwpCtrl = document.HwpController.HwpCtrl;
    	
    	FrameActionEnabled()				// 단축키 사용을 위한 Function
    	
    	if(!_VerifyVersion())
    		return;
    
    	pHwpCtrl.SetClientName("RELEASE");
		
		if(!pHwpCtrl.Open(file_path + file_name)) {
    		alert("잘못된 문서경로입니다.\n관리자에게 문의바랍니다.");
    	}
    	
    	/**
    	*  0 : 블럭 가능하고 수정 안되고 누름틀 적용안됨
    	*  1 : 블럭 가능 하고 수정 가능
    	*  2 : 블럭 불가능하고 수정 안되고 누름틀 적용됨
    	*/
		
		if (mode == "1") {
    		document.HwpController.HwpCtrl.EditMode = 1;
    	} else if (mode == "2") {
    		document.HwpController.HwpCtrl.EditMode = 2;
    	} else if (mode == "0") {
    		document.HwpController.HwpCtrl.EditMode = 0;
    	}
    	    	
    	if (file_type == "A") {
		    if (mode == "1") {
		    	ChangeName();
		    } else if (mode == "0") {
		    	js_CallHwpControl();
		    }
		} 
		else if (file_type == "B") {
			if (mode == "0") {
	    		js_CallHwpControl();
		    } else if (mode == "1") {
		    	js_CallHwpControl_reset();
		    }
		} else if (file_type == "C") {
			if (mode == "1") {
		    	js_CallHwpControl_reset();
		    } else if (mode == "0") {
		    	js_CallHwpControl();
		    	ChangeName();
		    }
		}
    }

    
	 /************************************************************************************
	Function 명     : OnStartDoc
	Function 기능   : 기안문 작성 및 검토서 조회를 위한 한글 컨트롤러 호출
	Event           :
	사용예          :
	*************************************************************************************/
   	function OnExaView(file_path, file_name) {
    	pHwpCtrl = document.HwpController.HwpCtrl;
    
    	if(!_VerifyVersion())
    		return;
    
    	pHwpCtrl.SetClientName("RELEASE");
		if(!pHwpCtrl.Open(file_path + file_name)) {
    		alert("잘못된 문서경로입니다.\n관리자에게 문의바랍니다.");
    	}
    	
    	/**
    	*  0 : 블럭 가능하고 수정 안되고 누름틀 적용안됨
    	*  1 : 블럭 가능 하고 수정 가능
    	*  2 : 블럭 불가능하고 수정 안되고 누름틀 적용됨
    	*/
		
   		document.HwpController.HwpCtrl.EditMode = 0;
    }
    /************************************************************************************
	Function 명     : OnStartExaDoc
	Function 기능   : 기안문 작성 및 검토서 조회를 위한 한글 컨트롤러 호출
	Event           :
	사용예          :
	*************************************************************************************/
   	function OnStartExaDoc(file_path, file_name, exa_prog_situ) {
    	pHwpCtrl = document.HwpController.HwpCtrl;
		if(!_VerifyVersion()) { 
    		return;
    	}
		pHwpCtrl.SetClientName("RELEASE");
		if(!pHwpCtrl.Open(file_path + file_name, "HWP")) {
    		alert("잘못된 문서경로입니다.\n관리자에게 문의바랍니다.");
    	}
		if (exa_prog_situ == "SG" || exa_prog_situ == "SI") {
			document.HwpController.HwpCtrl.EditMode = 2;
			js_CallHwpControl();
		} else {
			document.HwpController.HwpCtrl.EditMode = 1;
		}
    	/**
    	*  0 : 블럭 가능하고 수정 안되고 누름틀 적용안됨
    	*  1 : 블럭 가능 하고 수정 가능
    	*  2 : 블럭 불가능하고 수정 안되고 누름틀 적용됨
    	*/
	}
    
	
	/************************************************************************************
	Function 명     : _VerifyVersion
	Function 기능   : 한글컨트롤러의 버전정보를 체크한다.
	Event           :
	사용예          :
	*************************************************************************************/    
    function _VerifyVersion() {
    	//설치 확인
    	if(pHwpCtrl.getAttribute("Version") == null)
    	{
    		alert("한글 컨트롤이 설치되지 않았습니다.");
    		return false;
    	}
    	//버젼 확인
    	CurVersion = pHwpCtrl.Version;
    	
    	//alert("현재버전 : "+CurVersion);
    	//alert("최소버전 : "+MinVersion);
    	
    	if(CurVersion < MinVersion)
    	{
    		alert("HwpCtrl의 버전 오류입니다.\n문서작성시 정상적으로 동작하지 않을 수 있습니다.\n"+
    			"최신 버젼으로 업데이트하기를 권장합니다.\n\n"+
    			"자세한 내용은 관리자에게 문의바랍니다.\n"+
    			"현재 버젼:" + CurVersion + "\n"+
    			"권장 버젼:" + MinVersion + " 이상"			
    			);
    	}
    	return true;
    }
    
    
    /*************************************************************************************
	Function 명     : fnUploadServer
	Function 기능   : 한글 문서를 저장한다.
	Event           :
	사용예          :
	*************************************************************************************/
	function OnUploadServer(server, userName, password, Directory, fileName, saveType, pHwpCtrl) {
	    var act = pHwpCtrl.CreateAction("FtpUpload");
	    var set = act.CreateSet();
	    act.GetDefault(set);
	    set.SetItem( "Server"   , server);
	    set.SetItem( "UserName" , userName);
	    set.SetItem( "Password" , password);
	    set.SetItem( "Directory", Directory);
	    set.SetItem( "FileName" , fileName);
	    set.SetItem( "SaveType" , saveType);
	    var vReturn = act.Execute(set);
 		
 		if (vReturn == 0) {
 			return false;
 		}
 		return true;
	}

	/*************************************************************************************
	Function 명     : FrameActionEnabled
	Function 기능   : 단축키설정
	Event           :
	사용예          :
	*************************************************************************************/
	function FrameActionEnabled()
	{
		pHwpCtrl = document.HwpController.HwpCtrl;

		if (bFrameActionEnabled)
		{
			//pHwpCtrl.ReplaceAction("FileNew", "FileNew");
			//pHwpCtrl.ReplaceAction("FileOpen", "FileOpen");
			pHwpCtrl.ReplaceAction("FileSave", "FileSave");
			pHwpCtrl.ReplaceAction("FileSaveAs", "FileSaveAs");
			pHwpCtrl.ReplaceAction("FindDlg", "FindDlg");
			pHwpCtrl.ReplaceAction("ReplaceDlg", "ReplaceDlg");
			bFrameActionEnabled = false;
		}
		else
		{
			//pHwpCtrl.ReplaceAction("FileNew", "HwpCtrlFileNew");
			//pHwpCtrl.ReplaceAction("FileOpen", "HwpCtrlFileOpen");
			pHwpCtrl.ReplaceAction("FileSave", "HwpCtrlFileSave");
			pHwpCtrl.ReplaceAction("FileSaveAs", "HwpCtrlFileSaveAs");
			pHwpCtrl.ReplaceAction("FindDlg", "HwpCtrlFindDlg");
			pHwpCtrl.ReplaceAction("ReplaceDlg", "HwpCtrlReplaceDlg");
			bFrameActionEnabled = true;
		}
	}

	
	/*************************************************************************************
	Function 명     : js_CallHwpControl
	Function 기능   : 한글문서의 인쇄기능을 제외한 나머지 기능을 비활성화한다.
	Event           :
	사용예          :
	*************************************************************************************/
	function js_CallHwpControl()
	{
		pHwpCtrl = document.HwpController.HwpCtrl;
		pHwpCtrl.LockCommand("Print", false);					//인쇄
		pHwpCtrl.LockCommand("Undo", true);						//되돌리기
		pHwpCtrl.LockCommand("Redo", true);						//다시실행
		pHwpCtrl.LockCommand("Cut", true);						//오려두기
		pHwpCtrl.LockCommand("Copy", true);                   	//복사하기
		pHwpCtrl.LockCommand("Paste", true);                  	//붙여넣기
		pHwpCtrl.LockCommand("ShapeCopyPaste", true);         	//모양복사
		pHwpCtrl.LockCommand("CharShape", true);              	//글자모양
		pHwpCtrl.LockCommand("ParagraphShape", true);         	//문단모양
		pHwpCtrl.LockCommand("Style", true);                  	//스타일
		pHwpCtrl.LockCommand("MultiColumn", true);            	//다단
		pHwpCtrl.LockCommand("MasterPage", true);             	//바탕쪽
		pHwpCtrl.LockCommand("PageSetup", true);              	//편집 용지
		pHwpCtrl.LockCommand("HeaderFooter", true);           	//머리말/꼬리말
		pHwpCtrl.LockCommand("AutoSpell Run", true);          	//맞춤법 도우미 동작
		pHwpCtrl.LockCommand("HwpDic", true);                 	//한컴사전
		pHwpCtrl.LockCommand("Presentation", true);           	//프리젠테이션
		pHwpCtrl.LockCommand("PictureInsertDialog", true);    	//그림
		pHwpCtrl.LockCommand("TableCreate", true);            	//표만들기
		pHwpCtrl.LockCommand("MacroPlay1", true);             	//키매크로1 
	}
	
	
	
	/*************************************************************************************
	Function 명     : js_HwpDisabled
	Function 기능   : 한글문서의 인쇄기능을 제외한 나머지 기능을 비활성화한다.
	Event           :
	사용예          :
	*************************************************************************************/	
	function js_HwpDisabled() {

		pHwpCtrl.LockCommand("Print", false);					//인쇄
		pHwpCtrl.LockCommand("Undo", true);						//되돌리기
		pHwpCtrl.LockCommand("Redo", true);						//다시실행
		pHwpCtrl.LockCommand("Cut", true);						//오려두기
		pHwpCtrl.LockCommand("Copy", true);                   	//복사하기
		pHwpCtrl.LockCommand("Paste", true);                  	//붙여넣기
		pHwpCtrl.LockCommand("ShapeCopyPaste", true);         	//모양복사
		pHwpCtrl.LockCommand("CharShape", true);              	//글자모양
		pHwpCtrl.LockCommand("ParagraphShape", true);         	//문단모양
		pHwpCtrl.LockCommand("Style", true);                  	//스타일
		pHwpCtrl.LockCommand("MultiColumn", true);            	//다단
		pHwpCtrl.LockCommand("MasterPage", true);             	//바탕쪽
		pHwpCtrl.LockCommand("PageSetup", true);              	//편집 용지
		pHwpCtrl.LockCommand("HeaderFooter", true);           	//머리말/꼬리말
		pHwpCtrl.LockCommand("AutoSpell Run", true);          	//맞춤법 도우미 동작
		pHwpCtrl.LockCommand("HwpDic", true);                 	//한컴사전
		pHwpCtrl.LockCommand("Presentation", true);           	//프리젠테이션
		pHwpCtrl.LockCommand("PictureInsertDialog", true);    	//그림
		pHwpCtrl.LockCommand("TableCreate", true);            	//표만들기
		pHwpCtrl.LockCommand("MacroPlay1", true);             	//키매크로1 
	}


	/*************************************************************************************
	Function 명     : js_CallHwpControl_reset
	Function 기능   : 한글문서의 기능을 활성화한다.
	Event           :
	사용예          :
	*************************************************************************************/
	function js_CallHwpControl_reset() {
		pHwpCtrl = document.HwpController.HwpCtrl;
		pHwpCtrl.LockCommand("Print", false);					//인쇄
		pHwpCtrl.LockCommand("Undo", false);					//되돌리기
		pHwpCtrl.LockCommand("Redo", false);					//다시실행
		pHwpCtrl.LockCommand("Cut", false);						//오려두기
		pHwpCtrl.LockCommand("Copy", false);                   	//복사하기
		pHwpCtrl.LockCommand("Paste", false);                  	//붙여넣기
		pHwpCtrl.LockCommand("ShapeCopyPaste", false);         	//모양복사
		pHwpCtrl.LockCommand("CharShape", false);              	//글자모양
		pHwpCtrl.LockCommand("ParagraphShape", false);         	//문단모양
		pHwpCtrl.LockCommand("Style", false);                  	//스타일
		pHwpCtrl.LockCommand("MultiColumn", false);            	//다단
		pHwpCtrl.LockCommand("MasterPage", false);             	//바탕쪽
		pHwpCtrl.LockCommand("PageSetup", false);              	//편집 용지
		pHwpCtrl.LockCommand("HeaderFooter", false);           	//머리말/꼬리말
		pHwpCtrl.LockCommand("AutoSpell Run", false);          	//맞춤법 도우미 동작
		pHwpCtrl.LockCommand("HwpDic", false);                 	//한컴사전
		pHwpCtrl.LockCommand("Presentation", false);           	//프리젠테이션
		pHwpCtrl.LockCommand("PictureInsertDialog", false);    	//그림
		pHwpCtrl.LockCommand("TableCreate", false);            	//표만들기
		pHwpCtrl.LockCommand("MacroPlay1", false);             	//키매크로1 
	}

