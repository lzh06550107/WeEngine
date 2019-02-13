$(document).ready(function(){$(".vjs-big-play-button").show();videojs.options.flash.swf="/e/js/xgcj/video-js.swf"
if(document.documentMode<=8){$(".page_style").css({"min-width":"1200px"});}
else
{$("head").append('<meta name="viewport" content="width=device-width,initial-scale=1">');WowS("fadedown","fadeInDown");WowS("fadeleft","fadeInLeft");WowS("faderight","fadeInRight");WowS("fadeup","fadeInUp");Wows("animates","fadeInUp",3);Wows("animates4","fadeInUp",4);Wows("tpzs_animate","fadeInUp",4);}});function Lmdjhd()
{var $windows=$(window).innerWidth();if($windows>=1000)
{$(".menu_box").children("ul").children("li").each(function(p){$(this).children("a").click(function(){var $this_href=$(this).attr("href");$(".page_style").css({"transform":"scale(0.89,0.89)","transition":"transform 0.5s ease"});$(".page_style").after('<div class="page_hd"></div>')
$(".page_hd").animate({"top":"0px"},1100,function(){window.location.href=$this_href;});return false;})});}else{$(".menu_box").children("ul").children("li").children("a").unbind();return false;}}
$(window).resize(function(){});function WowS(BoxClassName,Fadehdfx){var wow=new WOW({boxClass:BoxClassName,animateClass:'animated '+Fadehdfx,offset:0,mobile:true,live:true});wow.init();}
function Wows(classname,hdclassname,cout)
{var $classname=$("."+classname);$classname.each(function(i){if(i%cout==0){$(this).attr({"data-wow-delay":"0.2s"});}
else if(i%cout==1){$(this).attr({"data-wow-delay":"0.4s"});}
else if(i%cout==2){$(this).attr({"data-wow-delay":"0.6s"});}
else if(i%cout==3){$(this).attr({"data-wow-delay":"0.8s"});}
else if(i%cout==4){$(this).attr({"data-wow-delay":"0.9s"});}
else if(i%cout==5){$(this).attr({"data-wow-delay":"1s"});}
else if(i%cout==6){$(this).attr({"data-wow-delay":"1.1s"});}
else if(i%cout==7){$(this).attr({"data-wow-delay":"1.2s"});}
else if(i%cout==8){$(this).attr({"data-wow-delay":"1.3s"});}
else if(i%cout==9){$(this).attr({"data-wow-delay":"1.4s"});}});var wow=new WOW({boxClass:classname,animateClass:'animated '+hdclassname,offset:80,mobile:true,live:true});wow.init();}
function ShowSubMenu(id)
{var $Menu=$("#Menu");if($Menu.size()!=1){return;}
var $MenuItem=$Menu.children("ul").children("li");var $CurrentMenuItem=$("#MenuItem"+id);if($MenuItem.size()<=1){return;}
if(typeof(submenu_style)=="undefined")
{submenu_style=0;}
var classname="menu_current";switch(submenu_style)
{case 2:$MenuItem.children("ul").hide();document.write('<link rel="stylesheet" type="text/css" href="/e/css/submenu.css" />');$CurrentMenuItem.children("ul").show();$CurrentMenuItem.addClass(classname).siblings().removeClass(classname);$MenuItem.mouseenter(function(){$(this).addClass(classname).children("ul").show();$(this).siblings().removeClass(classname).children("ul").hide();});break;case 1:var ck_widths=document.documentElement.clientWidth;document.write('<link rel="stylesheet" type="text/css" href="/e/css/dropmenu.css" />');function Dhxl(ck_widths)
{$MenuItem.children("ul").hide();$MenuItem.mouseenter(function(){$(this).addClass(classname).siblings().removeClass(classname);});$MenuItem.mouseleave(function(){$(this).removeClass(classname);});$MenuItem.mouseenter(function(){$(this).children("ul").stop().slideDown("fast");});$MenuItem.mouseleave(function(){$(this).children("ul").stop().slideUp("fast");});if(typeof(Lanmu_Id)!="undefined")
{$Menu.bind('mouseleave',function(){$CurrentMenuItem.addClass(classname);});}};if(document.documentMode<=8)
{}
else
{if(ck_widths>=1000){Dhxl();}else{$MenuItem.unbind();$MenuItem.children("ul").show();};$(window).resize(function(){var ck_width=document.documentElement.clientWidth;if(ck_width>=1000){Dhxl();}
else
{$MenuItem.unbind();$MenuItem.children("ul").show();$Menu.children("ul").children("li").each(function(i){$Menu.children("ul").children("li").eq(i).children("ul").css({"height":"auto"});});};});}
break;}}
$(function(){var $menuli=$("#Menu").children("ul").children("li");if($menuli.size()==0){return;}
$menuli.bind('mouseenter',function(){if($(this).children("ul").size()==0)
{$(this).removeClass("hover");}});});$(function(){var icon='<a class="gotoptop_icon" id="gotoptop_icon" href="#" title="返回顶部"></a>';$("body").append(icon);var $window=$(window);var $gotoptop_icon=$("#gotoptop_icon");var $body=(window.opera)?(document.compatMode=="CSS1Compat"?$('html'):$('body')):$('html,body');$(window).bind('scroll resize',function(){if($window.scrollTop()>0)
{$gotoptop_icon.show();}
else
{$gotoptop_icon.hide();}});$gotoptop_icon.bind('click',function(){$body.animate({scrollTop:'0px'},"fast");return false;});});function goto(id)
{var pos=0;var obj=$(id);if(obj.size()==0){return;}
pos=obj.offset().top;pos=pos-137;var $body=(window.opera)?(document.compatMode=="CSS1Compat"?$('html'):$('body')):$('html,body');$body.animate({scrollTop:pos+'px'});}