/**

   
   2018. new
   
*/
let date1 = new Date();
let timeStart = date1.getTime();


let g_disableAll = false;
let g_styleElements = {};
let iframeObserver;

let cache = {
    name: "content",
    run_at: "document_start",
    cssBackgroundPlace:/url *\( *\" *\" *\)/,
    pCat: {  // picturesCategories
        pictureOnlySavedPathName: null,
        pictureSavedAsBase64Name: null
    }
};
let CssTimeCost = null;


let defaultPicture = '../image/default.jpg';
let blackPicture = '../image/Black Dark Picture.png';
let notifyIcon = '../image/logo-128.png';

let currentPicture = null;
let ifPickNextPicture = true;

// if (self == top) {
//     // document.write('<plaintext style=display:none>');
//     document.write('<pre style=display:none>');
// }




function requestStyles() {

    return new Promise(function (resolve, reject) {

        //console.warn((new Date()).toISOString(),' get css...........');
        // not use getStore that with Promise, to render fast
        chrome.storage.local.get(['ifPinPicInSites', 'pinPicInSites', 'ifPictureBackground', 'config_css_match_sites', 'setPictureAsCssEternal', 'PictureAsCssEternalBase64', 'config_css', 'nextPicture', 'nextPictureBase64', 'csFunctions', 'csFunctionsDelayTime'], function (result) {

            cache.csFunction = {
                csFunctions: result.csFunctions,
                csFunctionsDelayTime: result.csFunctionsDelayTime
            }

            let ifPictureBackground = result.ifPictureBackground;
            if (!ifPictureBackground) {
                ifPickNextPicture = false;
                return
            };

            let config_css_match_sites = result.config_css_match_sites;
            let regexp = new RegExp(config_css_match_sites, "ig");
            regexp = eval(regexp);
            if (config_css_match_sites != undefined && config_css_match_sites != '' && !regexp.test(window.location.href)) {
                ifPickNextPicture = false;
                return
            }

             
            let config_css = result.config_css;
            let nextPictureBase64 = null;
            if (result.ifPinPicInSites) {
                let ppisName = '';
                let ppisPath = '';
                for (pp in result.pinPicInSites) {
                    let regPPISTemp = result.pinPicInSites[pp].sites;
                    let regexpPP = new RegExp(regPPISTemp);
                    regexpPP = eval(regexpPP);
                    if (regexpPP.test(window.location.href)) {
                        ppisName = pp;
                        ppisPath = result.pinPicInSites[pp].path;
                        break;
                    }
                }
                if (ppisName != '') {
                 
                    chrome.storage.local.get([ppisName + "-base64"], function (rePPIS) {
                        nextPictureBase64 = rePPIS[ppisName + "-base64"]; 
                        config_css = config_css.replace(cache.cssBackgroundPlace, "url('" + nextPictureBase64 + "')");

                        applySections('1', config_css); 
                        currentPicture = dealPath(ppisPath);
                        let date = new Date();
                        let timeEnd = date.getTime();
                        CssTimeCost = timeEnd - timeStart;

                        rePPIS = null;
                    });
                   
                } else {  
                    if (result.setPictureAsCssEternal) {
                        nextPictureBase64 = result.PictureAsCssEternalBase64;
                    } else {
                        nextPictureBase64 = result.nextPictureBase64;
                    }
                    config_css = config_css.replace(cache.cssBackgroundPlace, "url('" + nextPictureBase64 + "')")
                    applySections('1', config_css);

                    currentPicture = result.nextPicture;
                    let date = new Date();
                    let timeEnd = date.getTime();
                    CssTimeCost = timeEnd - timeStart;

                    result = null;
                }
            } else {
                /////////////////////////////////////////////////////// 
                if (result.setPictureAsCssEternal) {
                    nextPictureBase64 = result.PictureAsCssEternalBase64;
                } else {
                    nextPictureBase64 = result.nextPictureBase64;
                }
                config_css = config_css.replace(cache.cssBackgroundPlace, "url('" + nextPictureBase64 + "')")
                applySections('1', config_css);

                ///////////////////////////////////////////////////////////

                currentPicture = result.nextPicture;
                let date = new Date();
                let timeEnd = date.getTime();
                CssTimeCost = timeEnd - timeStart;
            }
            //////////////////////////////////////////  
            if (Object.keys(g_styleElements).length) {
                // when site response is application/xml Chrome displays our style elements
                // under document.documentElement as plain text so we need to move them into HEAD
                // (which already is autogenerated at this moment for the xml response)
                if (document.head && document.head.firstChild && document.head.firstChild.id == "xml-viewer-style") {
                    for (let id in g_styleElements) {
                        document.head.appendChild(document.getElementById(id));
                    }
                }
                document.addEventListener("DOMContentLoaded", function () {
                    addDocumentStylesToAllIFrames();
                    iframeObserver.start();
                });
            }
            ////////////////////////////  
            console.log('currentPicture: ', currentPicture);

            resolve(result);
        });
    });
}

function applySections(styleId, sections) {

    // console.warn((new Date()).toISOString(),' aply css...........');
    let styleElement = document.getElementById("stylish-" + styleId);
    // Already there.
    if (styleElement) {
        if (document.location.protocol == "file:") {
            return;
        }
        styleElement.parentNode.removeChild(styleElement);

        //return;
    }
    if (document.documentElement instanceof SVGSVGElement) {
        // SVG document, make an SVG style element.
        styleElement = document.createElementNS("http://www.w3.org/2000/svg", "style");
    } else {
        // This will make an HTML style element. If there's SVG embedded in an HTML document, this works on the SVG too.
        styleElement = document.createElement("style");
    }
    styleElement.setAttribute("id", "stylish-" + styleId);
    styleElement.setAttribute("class", "stylish-cc");
    styleElement.setAttribute("type", "text/css");
    styleElement.appendChild(document.createTextNode(sections));
    addStyleElement(styleElement, document);
    g_styleElements[styleElement.id] = styleElement;

}

function addStyleElement(styleElement, doc) {
    if (!doc.documentElement || doc.getElementById(styleElement.id)) {
        return;
    }
    doc.documentElement.appendChild(doc.importNode(styleElement, true))
        .disabled = g_disableAll;
    getDynamicIFrames(doc).forEach(function (iframe) {
        if (iframeIsLoadingSrcDoc(iframe)) {
            addStyleToIFrameSrcDoc(iframe, styleElement);
        } else {
            addStyleElement(styleElement, iframe.contentDocument);
        }
    });
}

function addDocumentStylesToIFrame(iframe) {
    let doc = iframe.contentDocument;
    let srcDocIsLoading = iframeIsLoadingSrcDoc(iframe);
    for (let id in g_styleElements) {
        if (srcDocIsLoading) {
            addStyleToIFrameSrcDoc(iframe, g_styleElements[id]);
        } else {
            addStyleElement(g_styleElements[id], doc);
        }
    }
}

function addDocumentStylesToAllIFrames() {
    getDynamicIFrames(document).forEach(addDocumentStylesToIFrame);
}

// Only dynamic iframes get the parent document's styles. Other ones should get styles based on their own URLs.
function getDynamicIFrames(doc) {
    return Array.prototype.filter.call(doc.getElementsByTagName('iframe'), iframeIsDynamic);
}

function iframeIsDynamic(f) {
    let href;
    try {
        href = f.contentDocument.location.href;
    } catch (e) {
        // Cross-origin, so it's not a dynamic iframe 
        return false;
    }
    return href == document.location.href || href.indexOf("about:") == 0;
}

function iframeIsLoadingSrcDoc(f) {
    return f.srcdoc && f.contentDocument.all.length <= 3;
    // 3 nodes or less in total (html, head, body) == new empty iframe about to be overwritten by its 'srcdoc'
}

function addStyleToIFrameSrcDoc(iframe, styleElement) {
    if (g_disableAll) {
        return;
    }
    iframe.srcdoc += styleElement.outerHTML;
    // make sure the style is added in case srcdoc was malformed
    setTimeout(addStyleElement.bind(null, styleElement, iframe.contentDocument), 100);
}

// Observe dynamic IFRAMEs being added
function initObserver() {
    iframeObserver = new MutationObserver(function (mutations) {
        if (mutations.length > 1000) {
            // use a much faster method for very complex pages with 100,000 mutations
            // (observer usually receives 1k-10k mutations per call)
            addDocumentStylesToAllIFrames();
            return;
        }
        // move the check out of current execution context
        // because some same-domain (!) iframes fail to load when their "contentDocument" is accessed (!)
        // namely gmail's old chat iframe talkgadget.google.com
        setTimeout(process.bind(null, mutations), 0);
    });

    function process(mutations) {
        for (let m = 0, ml = mutations.length; m < ml; m++) {
            let mutation = mutations[m];
            if (mutation.type === "childList") {
                for (let n = 0, nodes = mutation.addedNodes, nl = nodes.length; n < nl; n++) {
                    let node = nodes[n];
                    if (node.localName === "iframe" && iframeIsDynamic(node)) {
                        addDocumentStylesToIFrame(node);
                    }
                }
            }
        }
    }

    iframeObserver.start = function () {
        // will be ignored by browser if already observing
        iframeObserver.observe(document, {
            childList: true,
            subtree: true
        });
    }
}

function ifDecoratePlugins(DecoratePluginsUrlRegex) {
    let regT = DecoratePluginsUrlRegex;
    regT = new RegExp(regT, "ig");
    regT = eval(regT);
    if (regT.test(window.location.href)) {
        return true;
    } else {
        return false;
    }
}


let DecoratePluginsCache = {
    clockWidget: null
};

function applyOnMessage(request, sender, sendResponse) {



    if (typeof (request) == 'object') {
        return
    }

    if (request.trim() == 'regexSearch' && document.getElementById('regexSearchBoxDiv') == null) { 
        DecoratePluginsCache.regexSearch.start()
    } else if (request.trim() == 'disableClockInCSS' && document.getElementById('clockWidgetId') != null) { // 
        if (DecoratePluginsCache.clockWidget != null) {

            DecoratePluginsCache.clockWidget.stop();
            DecoratePluginsCache.clockWidget = null;
        }
        let clockWidgetEle = document.getElementById('clockWidgetId');
        clockWidgetEle.parentNode.removeChild(clockWidgetEle);
    } else if (request.trim() == 'enableClockInCSS' && document.getElementById('clockWidgetId') == null) {

        if (ifDecoratePlugins(DecoratePluginsCache.DecoratePluginsUrlRegex)) {
            DecoratePluginsCache.clockWidget = new ClockWidget();
        }
    } else if (request.trim() == 'onlyBooksButton') {


    } else if (request.trim() == 'saveFullHtml') {

        let saveFullHtml = new SaveFullHtml(DecoratePluginsCache.saveFullHtmlOptions);
        saveFullHtml.save();

    } else if (request.trim() == 'ShowOrHideBookmarks') {
        if (DecoratePluginsCache.showBookmarks == false) {
            DecoratePluginsCache.bookmarks.showBookMarks();
            DecoratePluginsCache.showBookmarks = true;
        } else if (DecoratePluginsCache.showBookmarks == true) {
            DecoratePluginsCache.bookmarks.hideBookMarks();
            DecoratePluginsCache.showBookmarks = false;
        }
    }


}

function showCssLoadingTime() {
    chrome.storage.local.get('showMsgOnTitleTime', function (result) {
        let showMsgOnTitleTime = result.showMsgOnTitleTime;
        if (showMsgOnTitleTime == undefined) {
            showMsgOnTitleTime = 2;
        }
        let originalTitle = document.title;
        let msg = CssTimeCost + 'ms :CssTimeCost; ';
        let count = 0;
        showOnTitle(msg, originalTitle);
        let showOnTitleTimer = setInterval(function () {
            if ((count * 2 > showMsgOnTitleTime)) {
                showOnTitle('', originalTitle);
                clearInterval(showOnTitleTimer);
            } else {
                count++;
            }
        }, 2000)
    });
}

function showOnTitle(msg, originalTitle) {
    document.title = msg + originalTitle;
    //window.clearInterval(); 
}



function cs_observer() {
    // Select the node that will be observed for mutations
    const observer_targetNode = document.documentElement;

    // Options for the observer (which mutations to observe)
    const observer_config = {
        attributes: false,
        childList: true,
        subtree: true
    };

    // Callback function to execute when mutations are observed
    const observer_callback = function (mutationsList, observer) {

        // Use traditional 'for loops' for IE 11
        for (const mutation of mutationsList) {
            // console.log(mutation);
            if (mutation.previousSibling == null && mutation.type === 'childList' && mutation.target.localName == "html" && mutation.addedNodes.length > 0 && mutation.addedNodes[0].localName == "head") {
                // console.log("...........root.................");

            }
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0 && mutation.addedNodes[0].rel == "stylesheet") {



            }
            //     // else if (mutation.type === 'attributes') {
            //     //     console.log('The ' + mutation.attributeName + ' attribute was modified.');
            //     // }
            // }
        };

        // Create an observer instance linked to the callback function
        const c_observer = new MutationObserver(observer_callback);

        // Start observing the target node for configured mutations
        c_observer.observe(observer_targetNode, observer_config);

        // Later, you can stop observing
        // c_observer.disconnect();
    }
}



/**
 * 
 * @param {object} vc  data storaged in chrome
 */
function getHtmlDocumentAgainAndRender(vc) {
    // document.close();
    let htmlStr = httpRequest(window.location.href, "GET")

    let domParser = new DOMParser();
     
    let doc = domParser.parseFromString(htmlStr, "text/html")
 
    let scriptFlies = searchAndAddFilesScript(doc)

    let script = searchAndAddInlineScript(doc)
    let div = createElement("div")
    let scriptTag = createElement("script")
    scriptTag.text = script

    let head = doc.head.innerHTML
    let body = doc.body.innerHTML
    document.head.innerHTML = head
    document.body.innerHTML = body 

    setTimeout(() => {
        document.documentElement.appendChild(div).appendChild(scriptTag)
    }, 1000)
    setTimeout(() => {
        document.close();
    }, 5000)
 
}


function delayLoadedFeatures() {
    let delayLoadedPluginsTimeout = setTimeout(function () {

        let ifSubFrame = self != top ? true : false;

        ////////////////////////////////////////////////////////////////////////////////////////////
        chrome.storage.local.get(["ifPictureBackground", 'config_css_match_sites', 'otherOptions', 'saveFullHtmlOptions', 'inPageSearchOptions', 'ClockInCSS', 'DecoratePluginsUrlRegex', 'ClockOptions', 'chromeBookmarks', 'bookmarksOptions'], function (re) {
            try {
                DecoratePluginsCache.saveFullHtmlOptions = re.saveFullHtmlOptions
                DecoratePluginsCache.regexSearch=new RegexSearch()
                
                let regTT = re.DecoratePluginsUrlRegex;
                DecoratePluginsCache.DecoratePluginsUrlRegex = regTT;
                if (ifDecoratePlugins(regTT)) {
                    if (re.ClockInCSS && !ifSubFrame) {
                        DecoratePluginsCache.clockWidget = new ClockWidget(re.ClockOptions);
                    }

                    let scrollTopOrBottom = new ScrollTopOrBottom({
                        is_ScrollTopOrBottom_Bar_RightTop: re.otherOptions.is_ScrollTopOrBottom_Bar_RightTop
                    });
                    try {
                        re.bookmarksOptions.data = re.chromeBookmarks;
                        if (!ifSubFrame) {
                            DecoratePluginsCache.bookmarks = new ChromeBookmarks(re.bookmarksOptions);
                        }
                        DecoratePluginsCache.showBookmarks = true;
                    } catch (e) {
                        pushAndStoreErrorLogArray({
                            error: e
                        })
                    }

                } else {
                    /**
                      try {
                        re.bookmarksOptions.data = re.chromeBookmarks;
                        if (!ifSubFrame) {
                            DecoratePluginsCache.bookmarks = new ChromeBookmarks(re.bookmarksOptions);
                        }
                        DecoratePluginsCache.showBookmarks = false;
                    } catch (e) {
                        pushAndStoreErrorLogArray({ error: e })
                    }
                     */
                }
                if (!ifSubFrame) {
                    new InPageSearch(re.inPageSearchOptions);
                }
            } catch (e) {
                pushAndStoreErrorLogArray({
                    error: e
                })
                console.error(e);
            }

            try {
                if (re.otherOptions.pickNextPictureInBackground == true) {
                    chrome.runtime.sendMessage({
                        currentPicture: currentPicture,
                        info: 'pickNextPicture',
                        ifPickNextPicture: ifPickNextPicture
                    });
                } else {
                    loadPicturesCategoriesToCache(cache, {
                        callback: function () { 
                            pickNextPicture({
                                currentPicture: currentPicture,
                                ifPickNextPicture: ifPickNextPicture
                            })
                        }
                    }) 
                }
            } catch (e) {
                pushAndStoreErrorLogArray({
                    error: e
                })
                console.error(e);
            }

            re = null;
            ////////////////////////////////////////////////////////////////////////////////////////////

            let hiddenProperty = 'hidden' in document ? 'hidden' :
                'webkitHidden' in document ? 'webkitHidden' :
                'mozHidden' in document ? 'mozHidden' :
                null;
            let visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
            let onVisibilityChange = function () {
                if (!document[hiddenProperty] && currentPicture != null && currentPicture.indexOf("Black Dark Picture.png") < 0) {
                    setStore({
                        currentPicture: currentPicture
                    });

                } //else{
                //
                //}
            }
            document.addEventListener(visibilityChangeEvent, onVisibilityChange);

            /**
              chrome.runtime.sendMessage({greeting: "hello"}, function(response) {

               }); 
              */
            // let showOnTitleTimer = setInterval(function() {
            //requestStyles();
            // }, 2000)

            chrome.runtime.onMessage.addListener(applyOnMessage);
            ////////////////////////// 

            showCssLoadingTime();
            ////////////////////////////////////////////////////////////////////////////////////////////
            clearTimeout(delayLoadedPluginsTimeout);
        });
    }, 1100);
}

//  not use window.onload, sometimes a web page will use a long long time to be onload 
// window.onload = function () { 

// }

// cs_observer();

initObserver();

if (document.location.protocol == "file:") {
    let loadFileTimeout = setTimeout(function () {
        clearTimeout(loadFileTimeout);
        requestStyles().then((re) => {
            // getHtmlDocumentAgainAndRender(re) // ater requestStyles();
            customFunctions({
                content_cache: cache
            })
        })

        delayLoadedFeatures();
    }, 700);
} else {
    requestStyles().then((re) => {
        // getHtmlDocumentAgainAndRender(re) // ater requestStyles();
        customFunctions({
            content_cache: cache
        })
    })
    delayLoadedFeatures();
}