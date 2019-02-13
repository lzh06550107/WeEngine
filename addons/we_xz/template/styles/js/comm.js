function ShowSubMenu(id)
{var $Menu=$("#Menu");if($Menu.size()!=1){return;}
var $MenuItem=$Menu.children("ul").children("li");var $CurrentMenuItem=$("#MenuItem"+id);if($MenuItem.size()<=1){return;}
if(typeof(submenu_style)=="undefined")
{submenu_style=0;}
var classname="menu_current";switch(submenu_style)
{case 2:$MenuItem.children("ul").hide();document.write('<link rel="stylesheet" type="text/css" href="/e/css/submenu.css" />');$CurrentMenuItem.children("ul").show();$CurrentMenuItem.addClass(classname).siblings().removeClass(classname);$MenuItem.mouseenter(function(){$(this).addClass(classname).children("ul").show();$(this).siblings().removeClass(classname).children("ul").hide();});break;case 1:$MenuItem.children("ul").hide();$MenuItem.mouseenter(function(){$(this).addClass(classname).siblings().removeClass(classname);});$MenuItem.mouseleave(function(){$(this).removeClass(classname);});document.write('<link rel="stylesheet" type="text/css" href="/e/css/dropmenu.css" />');$MenuItem.mouseenter(function(){$(this).children("ul").slideDown("fast");});$MenuItem.mouseleave(function(){$(this).children("ul").slideUp("fast");});if(typeof(Lanmu_Id)!="undefined")
{$Menu.bind('mouseleave',function(){$CurrentMenuItem.addClass(classname)});}
break;}}
function Initialization_Nav(rootulid,currentid,parentids)
{if(typeof(shut_subnav)=="undefined"){shut_subnav=1;}
if(shut_subnav==1)
{var rootul=document.getElementById(rootulid);if(rootul==null){return;}
var child_ul=rootul.getElementsByTagName("ul");var child_span=rootul.getElementsByTagName("span");if(child_ul!=null)
{for(i=0;i<child_ul.length;i++)
{child_ul[i].style.display="";}}
if(child_span!=null)
{for(i=0;i<child_span.length;i++)
{if(child_span[i].className=="node")
{child_span[i].className="node_close";}}}}
if(currentid!="0")
{var c_sublanmu=document.getElementById(currentid);if(c_sublanmu!=null)
{var child_ul=c_sublanmu.getElementsByTagName("ul");var first_span=c_sublanmu.getElementsByTagName("span")[0];if(child_ul[0]!=null)
{child_ul[0].style.display="";if(first_span.className=="node_close"&&parentids!="0")
{first_span.className="node"}}
var first_a=c_sublanmu.getElementsByTagName("a")[0];first_a.className=first_a.className+" current";}
if(parentids!="0"&&parentids!=null)
{var Aparentids=parentids.split(",");var parentid;for(i=0;i<Aparentids.length;i++)
{if(Aparentids[i]!="")
{parentid="sl"+Aparentids[i];document.getElementById(parentid).style.display="";var child_ul=document.getElementById(parentid).getElementsByTagName("ul");var child_span=document.getElementById(parentid).getElementsByTagName("span");var child_a=document.getElementById(parentid).getElementsByTagName("a");if(child_ul.length>0){child_ul[0].style.display="";}
if(child_a.length>0){child_a[0].className=child_a[0].className+" current";}
if(child_span.length>0)
{if(child_span[0].className=="node_close"&&i>1)
{child_span[0].className="node";}}}}}}
var $navmenu=$(".nav_menu");if($navmenu.size()==0){return;}
var $navmenu_a=$navmenu.children("ul").children("li").find("a");var $navmenu_a_current;if($navmenu_a.size()>0)
{$navmenu_a_current=$navmenu.children("ul").children("li").find("a.current");$navmenu_a.bind('mouseenter',function(){$(this).parent().siblings().children("a").removeClass("current");});$navmenu.bind('mouseleave',function(){$navmenu_a_current.addClass("current");});}}
function subnav(id,isroot)
{var thisobj=$("#"+id);if(thisobj.size()==0){return;}
var first_ul=thisobj.children("ul");var first_span=thisobj.children("span");thisobj.siblings().children("ul").slideUp();thisobj.siblings().children("span.node").attr("class","node_close");if(first_ul.size()>0)
{if(first_ul.is(":hidden"))
{first_ul.slideDown();}
else
{first_ul.slideUp();}
if(isroot){return;}
if(first_span.attr("class")=="node")
{first_span.attr("class","node_close");}
else
{first_span.attr("class","node");}}}
function AddFavourites(sid,tb,Id)
{var x=new PAAjax();x.setarg("post",true);var Url=location.href;x.send("/e/aspx/add_favo.aspx","table="+tb+"&id="+Id+"&url="+UrlEncode(Url)+"&post=add",function(v){AddFavourites_Back(sid,v)});}
function TongJi(s)
{var url=location.href;var re=/http:\/\/([^\/]+)\//i;var h=url.match(re);url=h[1];var referer=document.referrer;if(referer==null){referer=""};if(referer=="http://www.baidu.com/s?wd=a")
{return;}
var tjcookie=GetCookie("tongji");if(tjcookie!="1")
{var x=new PAAjax();x.setarg("get",true);x.send("/e/aspx/count.aspx","referer="+UrlEncode(referer)+"&s="+s,function(v){TJCookie(v,referer)});}}
function TJCookie(v,Referer)
{SetCookie("tongji","1",24*60*60);SetCookie("referer",Referer,24*60*60);}
function FontZoom(Size,Id)
{var Obj=document.getElementById(Id);Obj.style.fontSize=Size;Obj.style.lineHeight="180%";}
function ordercart(sid,Table,Id,thecolor,thesize,thetype)
{if(Table==null){Table="";}
if(Id==null){Id=0;}
if(thecolor==null){thecolor="";}
if(thesize==null){thesize="";}
if(thetype==null){thetype="";}
var Membercookie=GetCookie("Member");if(Membercookie!="")
{IDialog('订购窗口',"/e/order/order.aspx?s="+sid+"&table="+Table+"&id="+Id+"&color="+thecolor+"&size="+thesize+"&type="+thetype,800,500);}
else
{quick_login(sid,"ordercart('"+sid+"','"+Table+"',"+Id+")");}}
function exchange(sid,Table,Id)
{var Membercookie=GetCookie("Member");if(Membercookie!="")
{IDialog('积分兑换窗口',"/e/order/exchange.aspx?s="+sid+"&table="+Table+"&id="+Id,550,450);}
else
{quick_login(sid,"exchange('"+sid+"','"+Table+"',"+Id+")");}}
function open_calendar(Id,showtime)
{Id=document.getElementById(Id);if(showtime==1)
{SelectDate(Id,'yyyy-MM-dd hh:mm:ss',80,0);}
else
{SelectDate(Id,'yyyy-MM-dd',80,0);}}
function Code_Change(Id)
{var obj=document.getElementById(Id);var R=Math.random();obj.src="/e/aspx/yzm.aspx?r="+R;}
function Get_Info(Table,Id)
{var objclicks=document.getElementById("clicks");var objcomments=document.getElementById("comments");var objdownloads=document.getElementById("downloads");var objreserves=document.getElementById("reserves");if(objclicks==null&&objcomments==null&&objdownloads==null&&objreserves==null)
{return;}
var R=Math.random();var x=new PAAjax();x.setarg("get",true);x.send("/e/aspx/get_info.aspx","table="+Table+"&id="+Id+"&r="+R,function(v){Write_Info(v)});}
function Write_Info(V)
{var Av=V.split('&');if(Av.length==4)
{var sublanmu_content=document.getElementById("sublanmu_content");if(sublanmu_content!=null){sublanmu_content.style.display="";}
var clicks=Av[0].split('=')[1];var comments=Av[1].split('=')[1];var downloads=Av[2].split('=')[1];var reserves=Av[3].split('=')[1];var objclicks=document.getElementById("clicks");var objcomments=document.getElementById("comments");var objdownloads=document.getElementById("downloads");var objreserves=document.getElementById("reserves");if(objclicks!=null){objclicks.innerHTML=parseInt(clicks)+1;}
if(objcomments!=null){objcomments.innerHTML=comments;}
if(objdownloads!=null){objdownloads.innerHTML=downloads;}
if(objreserves!=null){objreserves.innerHTML=reserves;}}}
function Link_Open(link,Target)
{if(link!="")
{window.open(link,Target);}}
document.write("<script src=\"e/js/function.js\" type=\"text/javascript\"></script>");document.write("<script src=\"e/js/dialog.js\" type=\"text/javascript\"></script>");document.write("<script src=\"./e/incs/pie/PIE.js\" type=\"text/javascript\"></script>");