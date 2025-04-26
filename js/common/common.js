 ﻿/**
 *  common.js version 1.0
 *
 * AUTHORS LIST       E-MAIL  
 * jaehyun lim    jhylim@lgcns.com
 */
var _topMenu, _leftMenu, _leftMenuHtml, _slideMenu;
function changeLeftMenuStyle(aEvent) { 
	_leftMenu.innerHTML = _leftMenuHtml;
	var menuObj = ""; 
	
	if(aEvent) menuObj = aEvent.target;
	else menuObj = event.srcElement;

	var changeEls = document.getElementById("LblockLeftMenuStyle").getElementsByTagName("img");
	for(var i=0;i<changeEls.length; i++) { 
	    if (changeEls[i] == menuObj) {		
			switch (i) {
				case 0:
					_leftMenu.className = "LslideMenu";
					break;
				case 1:
					_leftMenu.className = "LtreeMenu";
					break;
			}
		}
	}
	initLeftMenu();
}

function initPage() {
	initTopMenu();
	initLeftMenu();
	
	var LblockLeftMenuStyle = document.getElementById("LblockLeftMenuStyle");
	if (LblockLeftMenuStyle) {
		var changeEls = document.getElementById("LblockLeftMenuStyle").getElementsByTagName("img");
		for (var i = 0; i < changeEls.length; i++) {
			changeEls[i].onclick = changeLeftMenuStyle;
		}
	}
	initTab();
	initTable();
	initList();
	initTreeBlock();
}

function initTopMenu() {
	var root = document.getElementById("LblockTopMenu");
	if (!root || !dui.hhmenu) return;
	_topMenu = new dui.hhmenu.HHMenu();
	_topMenu.init(root.getElementsByTagName("ul")[0]);
	//_topMenu.setCurrent(1,1);
}

function initLeftMenu() {
	_leftMenu = D$("LblockLeftMenu");
	if (!_leftMenu) return;
	_leftMenuHtml = _leftMenu.innerHTML;
	if (_leftMenu.hasClassName("LslideMenu")) initSlideMenu();
	else if (_leftMenu.hasClassName("LtreeMenu")) initTreeMenu();
}

function initSlideMenu() { 
	var root = _leftMenu.getElementsByTagName("ul")[0];
	_slideMenu = dui.SlideMenu.makeSlideMenu(root, true, true); // 메뉴가 별도의 프레임일 경우 (xxx, true, xxx) , 다른걸 열면 이전게 자동으로 닫히는 경우 (xxx, xxx, true)
} 

function initTreeMenu() {
  treeMenu = new dui.tree.Tree(); 	
	treeMenu.imagePath = "../images/treemenu_images/";
	treeMenu.enableMoveNode(false);
	var root = document.getElementById("LblockLeftMenu").getElementsByTagName("ul")[0];
	treeMenu.init(root);
	//var selectedNode = treeMenu.selectNode("0>1>1");
} 

function initTab() {
	if (dui && dui.Tab) dui.Tab.initPage();	
}

function initTreeBlock() {
	if (!dui.tree) return;
	var treeBlocks = document.getElementsByClassName("LblockTree");
	for (var i=0; i<treeBlocks.length; i++) {
	  var tree = new dui.tree.Tree(); 	
		tree.imagePath = "../images/tree_images/";
		tree.enableMoveNode(false);
		var root = treeBlocks[i].getElementsByTagName("ul")[0];
		tree.init(root);
	}
}

function initTable() {
	var listTables = document.getElementsByClassName("LblockListTable");
	for (var i=0; i<listTables.length; i++) {
		styleListTable(listTables[i]);
	}
}

function initList() {
	var lists = document.getElementsByTagName("ul");
	for (var i=0; i<lists.length; i++) {
		styleList(lists[i]);
	}
}

// 테이블 hover시 Lhover 클래스 부여
function styleListTable (listTableBlock) {
	var table = listTableBlock.getElementsByTagName("table")[0];
	var trArr = table.getElementsByTagName("tr");
	for (var i=0; i<trArr.length; i++) {
		dui.CB.addEventHandler(D$(trArr[i]), "mouseover", function () { this.addClassName("Lhover");}.bind(trArr[i]) );
		dui.CB.addEventHandler(trArr[i], "mouseout", function () { this.removeClassName("Lhover");}.bind(trArr[i]) );
	}
}

// 리스트 hover시 Lhover 클래스 부여
function styleList (list) {
	var items = list.getElementsByTagName("li");
	for (var i=0; i<items.length; i++) {
		dui.CB.addEventHandler(D$(items[i]), "mouseover", function () { this.addClassName("Lhover");}.bind(items[i]) );
		dui.CB.addEventHandler(items[i], "mouseout", function () { this.removeClassName("Lhover");}.bind(items[i]) );
	}
}

// IE6 CSS 이미지 재요청 버그 대처코드
try {
    document.execCommand("BackgroundImageCache", false, true);
} catch(ignored) {}


function doSomething() {}

dui.CB.addEventHandler(window, "load", initPage);