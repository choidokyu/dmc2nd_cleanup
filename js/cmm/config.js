/**
 * @File Name : common.js
 * @Description : 공통 자바스크립트 글로벌 변수 설정
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
 *	
 * </pre>
 */

/*********************************
 * 환경 설정
 */
// 운영 적용 시 여기서부터
var isDebug = true;		// 디버깅모드(console.log) : console 로그 출력 여부 : 운영시 반드시 false로 하지 않으면 스크립트 처리 속도가 매우!!! 느려짐.
var isDev = true;		// 개발모드 : log web view 사용 여부. 로그인 페이지 비밀번호 초기화 여부 등 기타 기능상 차이 둘 때(운영시 반드시 false로)
// 여기까지 수정

/*********************************
 * 공통 전역 변수
 */
var session = window.sessionStorage;
var local = window.localStorage;

var g_homeurl = location.hostname;
var g_nowpage = location.pathname;
var g_np = new String(g_nowpage);
var g_nowpath = g_np.substring(0, g_np.lastIndexOf("/"))+"/";
g_nowpage = g_nowpage.replace(contextRoot, "");

//var ua = navigator.userAgent.toLowerCase();
var contextRoot = '';
var tmp = null;
