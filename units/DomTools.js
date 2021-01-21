/**
 * @description this has bug ... not use
 * @param {string} tag 
 * @param {string} stringData 
 * @param {boolean} containTag
 * @example tag="head"
   stringData=` <!DOCTYPE html>
   <html>
	<head>
		<title> bing</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    </head>
    <body> cccccc  </body> 
    </html> `
 return 
 ` <head>
		<title> bing</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    </head>`
 */
function getHtmlTagStringFromString(tag, stringData, containTag) {
    let ar = stringData.split("\n")
    let result = []
    let open = false
    let reg1 = new RegExp("< *" + tag + " *>", "ig")
    let reg2 = new RegExp("< *\/ *" + tag + " *>", "ig")
    for (let str of ar) {
        if (!open) {
            if (reg1.test(str)) {
                open = true
                if (containTag) {
                    result.push(str)
                }
            } else {
                continue
            }
        } else {
            if (!reg2.test(str)) {
                result.push(str)
            } else {
                open = false
                if (containTag) {
                    result.push(str)
                }
                break
            }
        }
    }
}


/**
 * modify Site's CSS
 * @param elementNode
 * @param {boolean} httpToHttps 
 */
function removeSiteCssBackgroundColorAndImportant(elementNode, {
    httpToHttps = false,
    onlySetLinkNull = false,
    getViaIframe = false
}) {
    //  modify site's css
    let styleCSS = ''

    let links = elementNode.getElementsByTagName("link")
    styleCSS = removeSiteCssBackgroundColorAndImportantSub(links, {
        httpToHttps: httpToHttps,
        onlySetLinkNull: onlySetLinkNull,
        getViaIframe: getViaIframe
    })
    // styleCSS = styleCSS + "\n" + "img{max-width:4096px !important;max-height:2048px !important;}";

    let style = null;
    if (!getViaIframe) {
        if ((style = document.querySelector("#style-site")) != undefined) {
            styleCSS = style.innerHTML + ";\n" + styleCSS
            style.innerHTML = styleCSS
        } else {
            style = document.createElement('style');
            style.id = "style-site"
            style.setAttribute("type", "text/css");
            document.documentElement.appendChild(style).appendChild(document.createTextNode(styleCSS));
        }
    }


}
/**
 * 
 * @param {*} linksArray 
 * @param {boolean} httpToHttps 
 */
function removeSiteCssBackgroundColorAndImportantSub(linksArray, options = {
    httpToHttps : false,
    onlySetLinkNull : false,
    getViaIframe : false
}) {
    let styleCSS = ''
    let links = []
    for (let i of linksArray) {
        try {
            if (i.attributes["rel"].nodeValue == "stylesheet") {
                links.push(i)
            }
        } catch (error) {

        }
    }

    for (let i = 0; i < links.length; i++) {
        try {
            let rel = links[i].attributes["rel"].nodeValue
            if (rel == "stylesheet") {
                let href = links[i].attributes["href"].nodeValue
                if (!options.onlySetLinkNull) {
                    let resp = null
                    if (options.getViaIframe) {

                        let iframe = document.createElement('iframe');
                        iframe.style = "display:none;"
                        iframe.id = "cs_css_iframe_" + getCurrentTime()
                        iframe.name = "cs_css_iframe"
                        iframe.src = href + "?parentOrigin=" + window.location.origin + "&ccFrom=ccGetCSS";
                        iframe.setAttribute("data-origin", window.location.origin)

                        let cSiteDiv = null
                        if ((cSiteDiv = document.querySelector("#cSiteDiv")) != undefined) {
                            cSiteDiv.appendChild(iframe)
                        } else {
                            document.documentElement.appendChild(iframe)
                            cSiteDiv = document.createElement("div");
                            cSiteDiv.id = "cSiteDiv";
                            document.documentElement.appendChild(cSiteDiv).appendChild(iframe);
                        }
                        setTimeout(function () {
                            iframe.parentNode.removeChild(iframe)
                        }, 3000)
                        try {
                            links[i].setAttribute("href", "")
                        } catch (error) {

                        }
                    } else {
                        resp = httpRequest(href, "GET", {
                            httpToHttps: options.httpToHttps,
                            mimeType: "text/css"
                        })
                    }

                    let respRegular = /@import *url\(([^\(\)]+\.css)\)/ig
                    let respRegularBoolean = respRegular.test(resp)
                    let respPostCSS = ""
                    if (respRegularBoolean) {
                        let linksArraySub = []
                        let hrefSub = href.replace(/(.*\/)[^\/]+/ig, "$1")
                        let respMach = resp.match(respRegular)
                        respPostCSS = resp.replace(respRegular, "")
                        for (let rm of respMach) {
                            try {
                                rm = rm.replace(respRegular, "$1")
                                if (/(?:^https?|ftps?|javascript|file):\/\//ig.test(rm.trim())) {

                                } else {
                                    rm = hrefSub + rm.trim()
                                }
                                let linkObj = {
                                    attributes: {}
                                }
                                linkObj.attributes.rel = {
                                    nodeValue: "stylesheet"
                                }
                                linkObj.attributes.href = {
                                    nodeValue: rm
                                }
                                linksArraySub.unshift(linkObj)
                            } catch (error) {
                                console.error(error);

                            }
                        }
                        styleCSS = styleCSS + "\n" + removeSiteCssBackgroundColorAndImportantSub(linksArraySub)
                    }
                    if (!options.getViaIframe && (!respRegularBoolean || (respRegularBoolean && respPostCSS.length > 5))) {
                        filterCSSText(resp)

                        if (!respRegularBoolean && typeof (resp) == "string") {
                            resp = filterCSSText(resp)
                            styleCSS = styleCSS + "\n" + resp
                            try {
                                links[i].setAttribute("href", "")
                            } catch (error) {

                            }
                            // links[i].parentNode.removeChild(links[i])
                        }
                        if (respPostCSS.length > 5) {
                            respPostCSS = filterCSSText(respPostCSS, "")
                            styleCSS = styleCSS + "\n" + respPostCSS
                            try {
                                links[i].setAttribute("href", "")
                            } catch (error) {

                            }
                        }
                    }
                } else {
                    try {
                        links[i].setAttribute("href", "")
                    } catch (error) {

                    }
                }

            }
        } catch (e) {
            console.error(e);
        }

    }
    return styleCSS
}
/**
 * 
 * @param {*} cssText 
 * @param {*} replaceWithStr if not point this , use default
 */
function filterCSSText(cssText, replaceWithStr = undefined) {
    let removeCSSReg1 = /background *:[^\{\};]*!important *;?/ig
    let removeCSSReg2 = /background-color *:[^\{\};]*!important *;?/ig
    let removeCSSReg3 = /! *important/ig
    try {
        if (replaceWithStr) {
            cssText = cssText.replace(removeCSSReg1, "")
            cssText = cssText.replace(removeCSSReg2, "")
            cssText = cssText.replace(removeCSSReg3, "")
        } else {
            cssText = cssText.replace(removeCSSReg1, "background: transparent !important;")
            cssText = cssText.replace(removeCSSReg2, "background-color: transparent !important;")
            cssText = cssText.replace(removeCSSReg3, "")
        }
    } catch (e) {
        console.log(e); 
    }
    
    return cssText
}

function deleteScriptLinkElements(element) {

    for (let c = 0; c <= 3; c++) {
        let scripts = element.getElementsByTagName("script");
        for (let i = 0; i < scripts.length; i++) {
            try {
                if (scripts[i].getAttribute("src") != undefined) {
                    scripts[i].setAttribute("src", "null");
                    scripts[i].parentNode.removeChild(scripts[i]);
                }
            } catch (e) {
                console.error(e);
            }

        }
    }
}

function searchAndAddInlineScript(element) {
    let script = ''
    for (let c = 0; c <= 3; c++) {
        let scripts = element.getElementsByTagName("script");
        for (let i = 0; i < scripts.length; i++) {
            try {
                if (scripts[i].getAttribute("src") == undefined) {
                    script += "try {" + scripts[i].text + " } catch (e) { console.error(e)};"
                    scripts[i].parentNode.removeChild(scripts[i]);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
    return script
}

function searchAndAddFilesScript(element) {
    let script = ''
    for (let c = 0; c <= 3; c++) {
        let scripts = element.getElementsByTagName("script");
        for (let i = 0; i < scripts.length; i++) {
            try {
                if (scripts[i].getAttribute("src") != undefined) {
                    script += "try {" + scripts[i].text + " } catch (e) { console.error(e)};"
                    scripts[i].parentNode.removeChild(scripts[i]);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
    return script
}
/**
 * return chrome/firefox/ie
 */
function getBroswerType() {
    if (navigator.userAgent.toLowerCase().indexOf("chrome") > 0 ? true : false) {
        return "chrome"
    } else if (navigator.userAgent.toLowerCase().indexOf("firefox") > 0 ? true : false) {
        return "firefox"
    } else if (navigator.userAgent.toLowerCase().indexOf("msie") > 0 ? true : false) {
        return "ie"
    }

}

function createBlockDiv() {
    let div = document.createElement("div")
    div.className = "cc-fullScreen cc-background-dark-5 cc-topLayer-3nd"
    return div
}

function getElementById(id) {
    return document.getElementById(id)
}
/**
 * 
 * @param {string} boxId 
 * @param {Element} parentNode 
 */
function createTransparentDarkDivBox(boxId, parentNode) {
    let div = document.createElement("div")
    div.id = boxId
    div.style = "width:40%;height:80%"
    div.className = "cc-centerDiv cc-overflow-auto cc-top-10 pointer cc-border-c cc-background-dark-8 cc-topLayer-2nd"
    parentNode.appendChild(div)
    return div
}

function fakeClick(obj) {
    let ev = document.createEvent("MouseEvents");
    ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    obj.dispatchEvent(ev);
}

function exportData(fileName, data) {
    return new Promise(function (resolve, reject) {
        let urlObject = window.URL || window.webkitURL || window;
        let export_blob = new Blob([data]);
        let save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
        save_link.href = urlObject.createObjectURL(export_blob);
        save_link.download = fileName;
        fakeClick(save_link);

        resolve(true);
    });
}



/**
 * 
 * @param {Element} element one element ,that will  append  MsgDivBox
 * @param {function} handler  execute when close MsgDivBox
 * @returns {Element} element
 */
function showMsgDivBox(element, handler) {
    handler = handler || String
    element = element || null
    let div = document.getElementById('showMsgDivBox')
    if (div) {
        div.innerHTML = ''
    } else {
        div = document.createElement('div')
        div.className = 'cc-border-c cc-msgDivBox cc-background-dark-8 cc-topLayer'

        div.id = "showMsgDivBox"

        let close = document.createElement('button')
        close.className = "pointer  cc-circle-30  configButton transparent font-green-dark"
        close.style = "right:5px !important;position: absolute;"
        close.innerHTML = "Close"
        close.onclick = function () {
            handler()
            this.parentNode.parentNode.removeChild(div)
        }

        div.appendChild(close)
    }

    if (element) {
        div.appendChild(element)
    }
    document.documentElement.appendChild(div)

    return div
}

/**
 * @param {String} HTML representing any number of sibling elements
 * @return {NodeList} 
 */
function htmlToElements(html) {
    let template = document.createElement('template');
    template.innerHTML = html;
    return template.content.childNodes;
}

/**
 * @param {string} HTML representing a single element
 * @return {Element}
 */
function htmlStringToElement(htmlString) {
    let template = document.createElement('template');
    htmlString = htmlString.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = htmlString;
    return template.content.firstChild;
}

function stringToDOM(str) {
    let template = document.createElement('html');
    str = str.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = str;
    // return template.content.childNodes;
    return template
}

function createElementFromHTML(htmlString) {
    let div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes
    return div.childNodes;
}

function removeScrollbar(){
   let scrollbar= document.querySelector("#cc-scrollbar")
   if(scrollbar){
    scrollbar.parentNode.removeChild(scrollbar)
   }
   
}
/**
 * 
 * @param {Array} elements 
 */
function createScrollbar(elements=[]){
    let scrollbar= document.querySelector("#cc-scrollbar")
    if(scrollbar){
     scrollbar.parentNode.removeChild(scrollbar)
    }

    let viewh=document.documentElement.clientHeight 
    let bodyh=document.body.clientHeight>document.body.scrollHeight?document.body.clientHeight:document.body.scrollHeight
 
    let div =document.createElement("div") 
    div.id="cc-scrollbar"
    div.style="width:13px !important;height:"+viewh+"px !important;top: 0px !important;  "
    div.className="cc-scrollbar"
 
    for( let e of elements){
        // let eleHeightInBody=e.offsetTop
        let eleHeightInBody=offset_m2(e).top 
        
        let eleHeightInView=parseInt((eleHeightInBody/bodyh)*viewh)
        let markStr=`<hr style="height:3px;border:none;border-top:5px solid  yellow;position:relative  !important;top:${eleHeightInView}px  !important; border-color: yellow !important;border-top-color: yellow !important;" />`
        let mark=htmlStringToElement(markStr) //  relative  absolute
        
        div.appendChild(mark)
    }
    document.documentElement.appendChild(div)
}
/**
   * returns the absolute position of an element regardless of position/float issues
   * @param {HTMLElement} el - element to return position for 
   * @returns {object} { x: num, y: num }
   */
function offset_m1(el) {

    var x = 0,
        y = 0;

    while (el != null && (el.tagName || '').toLowerCase() != 'html') {
        x += el.offsetLeft || 0; 
        y += el.offsetTop || 0;
        el = el.offsetParent;
    }

    return { x: parseInt(x, 10), y: parseInt(y, 10) };
  }
/**
 * 
 * @param {Element} element 
 * @returns {object} { left: num, top: num }
 */
  function offset_m2(element){

    var pos={left:0, top:0}; 
    var parent=element.offsetParent;

    pos.left+=element.offsetLeft;
    pos.top+=element.offsetTop;

    while(parent && !/html|body/i.test(parent.tagName)){ 
        pos.left+=parent.offsetLeft;
        pos.top+=parent.offsetTop; 

        parent=parent.offsetParent;
    }
    return pos;
}

function isElementExist(element) {
    return (element == undefined || element == null || element == "") ? false : true
}
/**
 * 
 * @param {string} info 
 * @param {Number} time  millisecond 
 * @param {string} style   eg: "line-height:33px"
 */
function showMsgInfo(info, time = 90000, style = "line-height:30px") {

    let msgIdEleStr = `
    <div id="msgInfoDiv" class="cc-msgInfo font-white-red  cc-topLayer cc-background-dark-5 ">
        <p id="closeMsgInfoDiv" class=" cc-rightTopCorner pointer circle cc-background-dark-8 ">X</p>
        <pre id="msgInfo" class="cc-wrap cc-background-dark-8  cc-border-r font-height-normal" ></pre>
    </div>
    `
    let msgInfoEle = htmlStringToElement(msgIdEleStr)

    let msgdiv = document.getElementById('msgInfoDiv');
    if (msgdiv == undefined || msgdiv == null) {
        document.body.appendChild(msgInfoEle)
    } else {
        msgInfoEle = msgdiv
    }

    if (msgInfoEle.innerHTML.length > 1) {
        let infoEle = document.createElement('pre')
        infoEle.className = 'cc-wrap cc-border-top-r  cc-background-dark-8'
        infoEle.style = style
        infoEle.innerHTML = info
        msgInfoEle.appendChild(infoEle)
    } else {
        msgInfoEle.innerHTML = info;
    }
    // document.querySelector("#msgInfoDiv").style = style

    let closeMsgInfoDiv = document.getElementById('closeMsgInfoDiv');
    closeMsgInfoDiv.onclick = function msgdivsh() {
        msgInfoEle.innerHTML = "";
        closeMsgInfoDiv.onclick = null;
        if (isElementExist(msgInfoEle) && isElementExist(msgInfoEle.parentNode)) {
            msgInfoEle.parentNode.removeChild(msgInfoEle)
        }
        if (cache.msgTimeoutTimer) {
            clearTimeout(cache.msgTimeoutTimer);
        }
    };


    if (cache.msgTimeoutTimer) {
        clearTimeout(cache.msgTimeoutTimer);
        cache.msgTimeoutTimer = null
    }
    cache.msgTimeoutTimer = setTimeout(function () {
        msgInfoEle.innerHTML = "";
        closeMsgInfoDiv.onclick = null;
        if (isElementExist(msgInfoEle) && isElementExist(msgInfoEle.parentNode)) {
            msgInfoEle.parentNode.removeChild(msgInfoEle)
        }
        clearTimeout(cache.msgTimeoutTimer);
    }, time);

}

function createElement(tag) {
    return document.createElement(tag);
}

function createTextNode(string) {
    return document.createTextNode(string);
}
/**
 * 
 * @param {String} title 
 * @param {String} messageBody 
 * @param {object} otherPara   {iconUrl:,hideTime:}
 */
function desktopNotify(title, messageBody, otherPara) {
    otherPara = otherPara || {};
    otherPara.iconUrl = otherPara.iconUrl ? otherPara.iconUrl : notifyIcon;
    otherPara.hideTime = otherPara.hideTime ? otherPara.hideTime : 60000;

    let notify = new Notification(title, {
        icon: otherPara.iconUrl,
        body: messageBody
    });
    if (!cache.notification) {
        cache.notification = []
    }
    cache.notification.push(notify);
    if (cache.notification.length > 2) {
        cache.notification.shift().close();
    }

}


/**
 * 
 * @param {Array} array array of tabs  
 * @returns {{ windowsNum:Number,TabsNum:Number,windowsTabs:  { windowId: [{tab}] } }} re,  windowsTabs: { windowId: [tabs] };
 */
function parseTabs(array) {
    let win = {};
    let re = {}
    let tabNum = 0
    for (let i = 0; i < array.length; i++) {

        if (cache.ifFilterChromeUrl && array[i].url.indexOf('chrome') == 0) {
            continue
        } else {
            tabNum++
        }
        if (!win[array[i].windowId]) {
            win[array[i].windowId] = [array[i]]
        } else if (win[array[i].windowId]) {
            win[array[i].windowId].push(array[i])
        }
    }

    re.windowsNum = Object.keys(win).length
    re.TabsNum = tabNum
    re.windowsTabs = win

    return re
}
/**
 * 
 * @param {string} tabUrl 
 * @param {object} blockScriptOptions 
 * @example tabUrl="http://www.eeo.com.cn/7.shtml"  blockScriptOptions={domainNameWithCountryCode=".com.cn"}  return "eeo.com.cn"
 * @example tabUrl="https://zhidao.baidu.com/4.html"  blockScriptOptions={domainNameWithCountryCode=".com.cn"}  return "baidu.com"
 */
function getMainDomainName(tabUrl, blockScriptOptions) {

    let siteUrlReg =  /(?:^https?|file|ftps?|about|javascript):\/\/([^\/]*).*/i
    let siteUrlRegNum=/(?:^https?|file|ftps?|about|javascript):\/\/(\d+\.\d+\.\d+\.\d+).*/i
    
    if(siteUrlRegNum.test(tabUrl)){
        return tabUrl.replace(siteUrlRegNum,"$1")
    }


    let siteUrl = tabUrl.replace(siteUrlReg, "$1")
    //  domain name with country code
    let domainNameWithCountryCode = null
    let ifDomainNameWithCountryCode = false
    if (blockScriptOptions.domainNameWithCountryCode != undefined) {
        for (let dnwcc of blockScriptOptions.domainNameWithCountryCode) {
            let domainUrlReg = new RegExp("^[^/]*" + dnwcc)
            domainUrlReg = eval(domainUrlReg)
            if (domainUrlReg.test(siteUrl)) {
                ifDomainNameWithCountryCode = true
                domainNameWithCountryCode = dnwcc.substring(1)
                break
            }
        }
    }

    let urlHeadReg = null
    let mainDomainName = null
    if (ifDomainNameWithCountryCode) {
        let urlHeadRegExp = new RegExp("^https?:\\/\\/([^\\/\\.]+\\.)+" + domainNameWithCountryCode + "(:\\d{1,5})?\\/?.*")
        let urlHeadRegEval = eval(urlHeadRegExp)
        mainDomainName = tabUrl.replace(urlHeadRegEval, "$1" + domainNameWithCountryCode + "$2")
    } else {
        urlHeadReg = /^https?\:\/\/([^\/\.]+\.)*(\w+\:?\d{0,9})\/?.*/i
        mainDomainName = tabUrl.replace(urlHeadReg, "$1$2")
    }
    return mainDomainName
}


/**
 * 
 * @param {string} tabUrl 
 * @param {object} blockScriptOptions 
 * @example tabUrl="http://www.eeo.com.cn/409307.shtml", return "www.eeo.com.cn"
 */
function getSubDomainName(tabUrl) {
    let siteUrlReg = /^https?\:\/\/([^\/]*).*/i
    let siteUrl = tabUrl.replace(siteUrlReg, "$1")

    return siteUrl
}