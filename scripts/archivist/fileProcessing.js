
Archivist.fixes = {};
Archivist.fixes.makeSafe = (input) => {
  var temp = noScript(input);
  temp = noEvent(temp);
  temp = noHref(temp);
  //console.log("htmlObject", temp);
  return temp;
};

function noHref(strCode){
  var html = $(strCode.bold());
  html.find('*').removeAttr('href');
  return html.html();
}

function noEvent(strCode){
  var html = $(strCode.bold());
  var i;
  var eventsList = ["onclick",
"oncontextmenu",
"ondblclick",
"onmousedown",
"onmouseenter",
"onmouseleave",
"onmousemove",
"onmouseover",
"onmouseout",
"onmouseup",
"onkeydown",
"onkeypress",
"onkeyup",
"onabort",
"onbeforeunload",
"onerror",
"onhashchange",
"onload",
"onpageshow",
"onpagehide",
"onresize",
"onscroll",
"onunload",
"onblur",
"onchange",
"onfocus",
"oninput",
"oninvalid",
"onreset",
"onsearch",
"onselect",
"onsubmit",
"ondrag",
"ondragend",
"ondragenter",
"ondragleave",
"ondragover",
"ondragstart",
"ondrop",
"onabort",
"oncanplay",
"oncanplaythrough",
"ondurationchange",
"onemptied",
"onended",
"onerror",
"onloadeddata",
"onloadedmetadata",
"onloadstart",
"onpause",
"onplay",
"onplaying",
"onprogress",
"onratechange",
"onseeked",
"onseeking",
"onstalled",
"onsuspend",
"ontimeupdate",
"onvolumechange",
"onwaiting",
"onerror",
"onmessage",
"onmousewheel",
"ononline",
"onoffline",
"onpopstate",
"onshow",
"onstorage",
"ontoggle",
"onwheel"];

  for(i=0;i<eventsList.length;i++){
    html.find('*').removeAttr(eventsList[i]);
  }


  return html.html();
}

function noScript(strCode){
   var html = $(strCode.bold());
   html.find('script').remove();
 return html.html();
}
