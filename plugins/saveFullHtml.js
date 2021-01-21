;
(function () {


    let opt = {}
    let SaveFullHtml = function (options) {
        //this.name="SaveFullHtml";
        opt = options || {
            timeoutForEachResourceRequest: 8,
            timeoutForAllResourceRequest: 18,
            maxWidthForSavedImages: 800,
            maxHeightForSavedImages: 800
        };
        opt.timeoutForEachResourceRequest = opt.timeoutForEachResourceRequest ? opt.timeoutForEachResourceRequest : 11;
        opt.timeoutForAllResourceRequest = opt.timeoutForAllResourceRequest ? opt.timeoutForAllResourceRequest : 10;
        opt.maxWidthForSavedImages = opt.maxWidthForSavedImages ? opt.maxWidthForSavedImages : 800;
        opt.maxHeightForSavedImages = opt.maxHeightForSavedImages ? opt.maxHeightForSavedImages : 800;

        this.save = () => exportFullHtml();
    };


    /**
     * 
     * @param {*} obj 
     */
    function fakeClick(obj) {
        let ev = document.createEvent("MouseEvents");
        ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        obj.dispatchEvent(ev);
    }

    /**
     * 
     * @param {*} fileName 
     * @param {*} data 
     */
    function exportData(fileName, data) {
        let urlObject = window.URL || window.webkitURL || window;

        let export_blob = new Blob([data]);
        let save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
        save_link.href = urlObject.createObjectURL(export_blob);
        save_link.download = fileName;
        fakeClick(save_link);
    }

    function deleteLinkElement(element) {

        let links = element.getElementsByTagName("link");
        for (let c = 0; c <= 7; c++) {
            for (let i = 0; i < links.length; i++) {
                try {
                    links[i].setAttribute("href", "null");
                    links[i].parentNode.removeChild(links[i]);
                } catch (e) {
                    console.error(e);
                }
            }
        }
        links = element.querySelectorAll("link");
        if (links.length > 0) {
            deleteLinkElement(element);
        }

    }

    function deleteScriptElement(element) {

        for (let c = 0; c <= 7; c++) {
            let scripts = element.getElementsByTagName("script");
            for (let i = 0; i < scripts.length; i++) {
                try {
                    scripts[i].setAttribute("src", "null");
                    scripts[i].parentNode.removeChild(scripts[i]);
                } catch (e) {
                    console.error(e);
                }

            }
        }
        let scripts = element.querySelectorAll("script");
        if (scripts.length > 0) {
            deleteScriptElement(element);
        }

    }

    function exportFullHtml() {

        let htmlO = document.getElementsByTagName('html')[0];

        let htmlZ = htmlO.cloneNode(true);

        htmlO = null;

        let meta = htmlZ.getElementsByTagName("meta");
        for (let i = 0; i < meta.length; i++) {
            try {
                let metaV = meta[i].getAttribute("charset")
                if (metaV != undefined && metaV != null && metaV.length >= 2) {
                    meta[i].parentNode.removeChild(meta[i]);
                }
                let metaC = meta[i].getAttribute("content")
                if (metaC != undefined && metaC != null && metaC.length >= 2 && metaC.indexOf("charset") >= 0) {
                    meta[i].parentNode.removeChild(meta[i]);
                }
            } catch (e) {
                console.error(e);
            }
        }
        //  save css
        let styleCSS = ''
        let links = htmlZ.getElementsByTagName("link")
        styleCSS = removeSiteCssBackgroundColorAndImportantSub(links)
        styleCSS = styleCSS + "\n" + "img{max-width:4096px !important;max-height:2048px !important;}";

        let style = document.createElement('style');
        style.setAttribute("type", "text/css");
        style.id="style-save"
        htmlZ.appendChild(style).appendChild(document.createTextNode(styleCSS));
        // let js = '';
        // let jscript = htmlZ.getElementsByTagName("script");
        // for (let i = 0; i < jscript.length; i++) {
        //     let src = jscript[i].getAttribute("src")
        //     if (src != null && src.indexOf('.js') > 0) {
        //         let href = jscript[i].attributes["src"].nodeValue;
        //         jscript[i].parentNode.removeChild(jscript[i]);
        //
        //         let resp = httpRequest(href, "GET", null);
        //         js = js + "\n" + resp;

        //     }
        //     jscript[i].parentNode.removeChild(jscript[i]);

        // }
        // let script = document.createElement('script');
        // script.setAttribute("type", "text/javascript");
        deleteScriptElement(htmlZ);

        // htmlZ.appendChild(script).appendChild(document.createTextNode(js));

        deleteLinkElement(htmlZ);

        // Comple url link with host
        let a_urls = htmlZ.getElementsByTagName("a");
        for (let i = 0; i < a_urls.length; i++) {
            try {
                let href = a_urls[i].attributes["href"].nodeValue
                if (href.indexOf("http") != 0 && href.indexOf("ftp") != 0 && href.indexOf("file") != 0 && href.indexOf("about") != 0 && href.indexOf("javascript") != 0&&href.indexOf("#") != 0) {
                    let oladHref = window.location.href
                    if (href.indexOf("/") == 0) {
                        href = href.substr(1)
                    }
                    href = oladHref.substr(0, oladHref.lastIndexOf("/")) + "/" + href
                    a_urls[i].attributes["href"].nodeValue = href
                }
            } catch (e) {
                console.error(e);
            }
        }
        // save image
        let imgs = htmlZ.getElementsByTagName("img")
        let imgNum = 0;
        let sdate = new Date();
        let stime = sdate.getTime();

        for (let i = 0; i < imgs.length; i++) {
            try {
                let srcAttr = imgs[i].attributes["src"];
                let src;
                if (srcAttr) {
                    src = srcAttr.nodeValue;
                } else {
                    continue;
                }
                imgNum = imgNum + 1;
                httpRequest(src, "GET", {
                    async: true,
                    responeType: 'blob',
                    timeout: opt.timeoutForEachResourceRequest * 1000,
                    callback: function (srcData) {

                        let urlObject = window.URL || window.webkitURL || window;
                        let srcDataUrl = urlObject.createObjectURL(srcData);
                        getBase64FromUrl(srcDataUrl, {
                            maxWidth: opt.maxWidthForSavedImages,
                            maxHeigh: opt.maxHeightForSavedImages
                        }, (Base64FromUrl) => {
                            imgs[i].setAttribute("src", Base64FromUrl.base64);
                            imgNum = imgNum - 1;
                        });
                    }
                });
            } catch (e) {
                console.error(e);
            }
        }

        let saveImageIntervl = setInterval(function () {
            let edate = new Date();
            let etime = edate.getTime();
            if ((etime - stime) > (1000 * opt.timeoutForAllResourceRequest)) {
                imgNum = 0;
            }
            if (imgNum == 0) {


                // get text to save
                let html = htmlZ.outerHTML;

                while (true) {
                    try {
                        let regexp = new RegExp("\<([^\<\>]*)(XMLHttpRequest|window|location)([^\<\>]*)\>", "ig");
                        regexp = eval(regexp);
                        html = html.replace(/\<([^\<\>]*)(XMLHttpRequest|window|location)([^\<\>]*)\>/ig, "<$1>%$2%<$3>");
                        if (!regexp.test(html)) {
                            break
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
                let title = document.title;
                if (isStringEmpty(title)) {
                    title = getSubDomainName(window.location.href)
                }
                exportData(title + ".html", html)
                clearInterval(saveImageIntervl);
            }

        }, 150);
    }
    window.SaveFullHtml = SaveFullHtml;
})();