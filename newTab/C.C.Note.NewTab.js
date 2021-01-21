/**

    
   2018.
   
*/
let defaultPicture = '../image/default.jpg';
let blackPicture = "../image/Black Dark Picture.png"
document.body.style.backgroundImage = "url(" + defaultPicture + ")";
let BackgroundPage = chrome.extension.getBackgroundPage();

main();


let close = null;
let saveConfigTextarea = null;
let saveIntervalTimeToChange = null;

let configButton = null;
let cache = {
    name: "NewTab",
    ifFilterChromeUrl: true,
    currentCSSPicture: '',
    pinThisPictureInNewTab: false,
    config: {},
    intervals: [],
    blockLeave: false,
    loadImageDataToMemoryIntervalMillisecondAvoidOccupyTooLargeMemory: 300,
    cssBackgroundPlace: /url *\( *\" *\" *\)/,
    picturesCategories: null,
    pCat: { // picturesCategories
        pictureOnlySavedPathName: null,
        pictureSavedAsBase64Name: null
    }
};


let pageNum = null; //   no  delete this ! !
let DecoratePluginsCache = {
    clockWidget: null
};



/**
  the main function
*/
function main() {

    getStore(['picturesCategories', 'resizeCssPicture', 'pictureSavedAsBase64Name', 'pictureOnlySavedPathName', 'otherOptions', 'IntervalShowPicInNewTab', 'pinThisPictureInNewTab', 'pinNewTabPicture', 'oldSetPicTime', 'intervalTime', 'currentPicture', 'useCurrentPicture', 'setPictureAsCssEternal']).then((result) => {

        let date = new Date();
        let time = date.getTime();
        try {
            cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer = result.otherOptions.ConfigPicturesPathType_SavePictureBase64DataToBroswer
            let oldSetPicTime = result.oldSetPicTime;
            let intervalTime = result.intervalTime;
            let currentPicture = result.currentPicture;

            cache.currentCSSPicture = result.currentPicture;


            let IntervalShowPicInNewTab = result.IntervalShowPicInNewTab;
            cache.resizeCssPicture = result.resizeCssPicture
            if (result.pinThisPictureInNewTab) {
                cache.pinThisPictureInNewTab = true
                setPicture(result.pinNewTabPicture, true);
                return;
            }

            let useCurrentPicture = window.sessionStorage.getItem('useCurrentPicture');
            let setPictureAsCssEternal = result.setPictureAsCssEternal;
            if (useCurrentPicture == null ? true : useCurrentPicture == undefined ? true : false && setPictureAsCssEternal != true) {
                setPicture(currentPicture, true);
                window.sessionStorage.setItem('useCurrentPicture', false);
                return
            }

            if (intervalTime == undefined) {
                intervalTime = 0;
                setStore({
                    intervalTime: 0,
                    showMsgOnTitleTime: 2
                });
            }
            if (oldSetPicTime == undefined || oldSetPicTime == '') {
                setPicture(defaultPicture, true);
                return;
            } else if ((time - oldSetPicTime) > (1000 * intervalTime)) {

                let pospn = new stringLinesCategories()
                let psabn = new stringLinesCategories()
                pospn.config = result.picturesCategories.pictureOnlySavedPathName.config
                psabn.config = result.picturesCategories.pictureSavedAsBase64Name.config

                cache.pCat = {
                    pictureOnlySavedPathName: pospn,
                    pictureSavedAsBase64Name: psabn
                }
                if (IntervalShowPicInNewTab.paths != null) {
                    if (IntervalShowPicInNewTab.IntervalTimesNow == undefined) {
                        IntervalShowPicInNewTab.IntervalTimesNow = 0;
                        IntervalShowPicInNewTab.IntervalPathsAryNow = 0;
                        if (cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer == false) {
                            pickAndSelectRoundPicture({
                                'pictureOnlySavedPathName': result.pictureOnlySavedPathName
                            }, currentPicture);
                        } else {
                            pickAndSelectRoundPicture({
                                'pictureSavedAsBase64Name': result.pictureSavedAsBase64Name
                            }, currentPicture);
                        }
                        setStore({
                            IntervalShowPicInNewTab: IntervalShowPicInNewTab
                        });

                    } else {
                        IntervalShowPicInNewTab.IntervalTimesNow = 1 + IntervalShowPicInNewTab.IntervalTimesNow;
                        if (IntervalShowPicInNewTab.IntervalTimesNow == IntervalShowPicInNewTab.times + 1) {
                            setPicture(IntervalShowPicInNewTab.paths[IntervalShowPicInNewTab.IntervalPathsAryNow], true);
                            IntervalShowPicInNewTab.IntervalTimesNow = 0;
                            IntervalShowPicInNewTab.IntervalPathsAryNow = 1 + IntervalShowPicInNewTab.IntervalPathsAryNow >= IntervalShowPicInNewTab.paths.length ? 0 : 1 + IntervalShowPicInNewTab.IntervalPathsAryNow;
                            setStore({
                                IntervalShowPicInNewTab: IntervalShowPicInNewTab
                            });

                        } else {
                            if (cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer == false) {
                                pickAndSelectRoundPicture({
                                    'pictureOnlySavedPathName': result.pictureOnlySavedPathName
                                }, currentPicture);
                            } else {
                                pickAndSelectRoundPicture({
                                    'pictureSavedAsBase64Name': result.pictureSavedAsBase64Name
                                }, currentPicture);
                            }
                            setStore({
                                IntervalShowPicInNewTab: IntervalShowPicInNewTab
                            });
                        }
                    }
                } else {
                    if (cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer == false) {
                        pickAndSelectRoundPicture({
                            'pictureOnlySavedPathName': result.pictureOnlySavedPathName
                        }, currentPicture);
                    } else {
                        pickAndSelectRoundPicture({
                            'pictureSavedAsBase64Name': result.pictureSavedAsBase64Name
                        }, currentPicture);
                    }
                }


                return
            } else {
                setPicture(currentPicture, false);
            }

        } catch (e) {
            pushAndStoreErrorLogArray({
                error: e
            })
            console.error(e);
            showMsgInfo(e)
        }
    });
}





function setPicture(picturePath, ifBase64AndSave, picturePathSequence) {

    if (cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer == false) {
        setPictureFromPath(picturePath, ifBase64AndSave, picturePathSequence)
    } else {
        setPictureFromBase64Data(picturePath, ifBase64AndSave, picturePathSequence)
    }

    let pickNextPictureForPinPicInSitesTime = setTimeout(function () {
        pickNextPictureForPinPicInSites()
        clearTimeout(pickNextPictureForPinPicInSitesTime)
    }, 300)
};

function setPictureFromBase64Data(picturePath, ifBase64AndSave, picturePathSequence) {

    try {
        if (picturePath == null || picturePath == undefined || picturePath == "" || picturePath == defaultPicture) {

            document.body.style.backgroundImage = "url(\"" + defaultPicture + "\")";
            if (!picturePath == defaultPicture) {
                console.error('pictureName Not Exists In config: ' + picturePath);
                showMsgInfo('pictureName Not Exists In config: ' + picturePath)
            }
            picturePath = defaultPicture;

            msgToBackground({
                info: 'defaultPictureToNextPictureBase64'
            });

        } else {
            getStore(picturePath).then(function (result) {
                if (result[picturePath]) {
                    document.body.style.backgroundImage = "url(\"" + result[picturePath] + "\")";
                    setStore({
                        nextPictureBase64: result[picturePath],
                        nextPicture: picturePath,
                        currentPicture: picturePath,
                        oldSetPicTime: getCurrentTime()
                    });

                    msgToBackground({
                        picturePath: picturePath,
                        info: 'recentlyUsedPictures'
                    })
                } else {
                    document.body.style.backgroundImage = "url(\"" + defaultPicture + "\")";
                    window.sessionStorage.setItem('currentNewTabPicture', defaultPicture);
                    setStore({
                        nextPicture: defaultPicture,
                        currentPicture: defaultPicture,
                        oldSetPicTime: getCurrentTime()
                    });
                    msgToBackground({
                        info: 'defaultPictureToNextPictureBase64'
                    });
                    console.error('pictureName   Exists, But pictureBase64 Not Exists: ' + picturePath);
                    showMsgInfo('pictureName   Exists, But pictureBase64 Not Exists: ' + picturePath + "\n May Not Check \"Pin This BackgroundImage In NewTab\" ")
                }
            });
        }
        document.body.style.backgroundPosition = "center !important";
        document.body.style.backgroundAttachment = "fixed !important";
        document.body.style.backgroundSize = "contain !important";
        document.body.style.backgroundRepeat = "repeat !important";

        window.sessionStorage.setItem('currentNewTabPicture', picturePath);
        setStore({
            nextPicture: picturePath,
            currentPicture: picturePath,
            oldSetPicTime: getCurrentTime()
        });
    } catch (e) {
        document.body.style.backgroundImage = "url(" + defaultPicture + ")";
        document.body.style.backgroundPosition = "center !important";
        document.body.style.backgroundAttachment = "fixed !important";
        document.body.style.backgroundSize = "contain !important";
        document.body.style.backgroundRepeat = "repeat !important";
        window.sessionStorage.setItem('currentNewTabPicture', defaultPicture);
        setStore({
            nextPicture: defaultPicture,
            currentPicture: defaultPicture,
            oldSetPicTime: getCurrentTime()
        });
        msgToBackground({
            info: 'defaultPictureToNextPictureBase64'
        });
        console.error(e);
        showMsgInfo(e)
        pushAndStoreErrorLogArray({
            error: e
        })
    }
}

function setPictureFromPath(picturePath, ifBase64AndSave, picturePathSequence) {

    if (picturePath == null || picturePath == undefined || picturePath == "") {
        picturePath = defaultPicture;
    };
    picturePath = dealPath(picturePath);
    let exists = picturePath == defaultPicture ? true : checkExists(picturePath);
    if (exists) {
        // try{ 
        document.body.style.backgroundImage = "url(\"" + encodeStringPathInOS(picturePath) + "\")";
        document.body.style.backgroundPosition = "center !important";
        document.body.style.backgroundAttachment = "fixed !important";
        document.body.style.backgroundSize = "contain !important";
        document.body.style.backgroundRepeat = "repeat !important";


        window.sessionStorage.setItem('currentNewTabPicture', picturePath);

        if (ifBase64AndSave) {
            msgToBackground({
                picturePath: picturePath,
                info: 'getPictureBase64',
                PictureBase64Name: 'nextPictureBase64',
                picturePathSequence: picturePathSequence
            });
        };
        if (!cache.pinThisPictureInNewTab) {
            setStore({
                currentPicture: picturePath,
                oldSetPicTime: getCurrentTime()
            })
        }

    } else { //             catch(e){
        document.body.style.backgroundImage = "url(" + defaultPicture + ")";
        msgToBackground({
            picturePath: picturePath,
            info: 'removePicturesThatNotExists'
        });
        if (!cache.pinThisPictureInNewTab) {
            setStore({
                currentPicture: picturePath,
                oldSetPicTime: getCurrentTime()
            })
        }

    };
}


function PicSettingsFunc() {
    document.getElementById('NewTabSetting').classList.remove('hide');

    getStore(['picturesCategories', 'pinThisPictureInNewTab', 'ifPictureBackground', 'currentPicture', 'intervalTime', 'showMsgOnTitleTime', 'setPictureAsCssEternal', 'PictureAsCssEternal', 'nextPicture', 'previousPicture']).then(function (object) {

        document.querySelector('#ifPictureBackground').checked = object.ifPictureBackground;
        document.querySelector('#picturesCategoriesFilter').checked = object.picturesCategories.pictureOnlySavedPathName.config.ifFilter;
        document.querySelector('#interval_time_to_change').value = object.intervalTime;
        document.querySelector('#showMsgOnTitleTime').value = object.showMsgOnTitleTime;
        document.querySelector('#setPictureAsCssEternal').checked = object.setPictureAsCssEternal;
        document.querySelector('#pinThisPictureInNewTab').checked = object.pinThisPictureInNewTab;

        if (object.setPictureAsCssEternal) {
            document.querySelector('#showCurrentCSSPicturePath').innerText = object.PictureAsCssEternal == undefined ? '' : dealPathToWin(object.PictureAsCssEternal);

            // document.querySelector('#showPictureAsCssEternal').value = object.PictureAsCssEternal == undefined ? '' : dealPathToWin(object.PictureAsCssEternal);
        } else {
            document.querySelector('#showCurrentCSSPicturePath').innerText = object.currentPicture == undefined ? '' : dealPathToWin(object.currentPicture);
            // document.querySelector('#showPictureAsCssEternal').value = ''
        }

        document.querySelector('#showPreviousPicture').value = object.previousPicture == undefined ? '' : dealPathToWin(object.previousPicture);
        document.querySelector('#showNextPicture').value = object.nextPicture == undefined ? '' : dealPathToWin(object.nextPicture);
        document.querySelector('#showCurrentNewTabPicture').value = window.sessionStorage.getItem('currentNewTabPicture') == undefined ? '' : dealPathToWin(window.sessionStorage.getItem('currentNewTabPicture'));

    });

    ////////////

    /////////////
}

/**
 * 
 * @param {Element} ele 
 */
function customFunctionsConf(ele) {
    let div = `
        <div class="cc-centerFloat cc-background-dark-8" id="csFunctionsConfDiv">
            <dl id="csFunctionsConfDl">
                <dt>
                    <button class="cc-background-dark-8 font-white-red  cc-border-color-Aquamarine">Delay Load  Custom Functions  Time(millisecond): </button>
                    <input id="csFunctionsConfDivTime" class="cc-background-dark-8 font-white-red  cc-border-color-Aquamarine">
                    <button id="csFunctionsConfDivAdd" class="pointer cc-button-padding cc-circle-30  cc-background-dark-8 font-white-red cc-border-color-Aquamarine"> Add </button>
                    <button id="csFunctionsConfDivSave" class="pointer cc-button-padding cc-circle-30  cc-background-dark-8 font-white-red cc-border-color-Aquamarine"> Save </button>
                    <button class="pointer cc-button-padding cc-circle-30  cc-background-dark-8 font-white-red cc-border-color-Aquamarine">Count:<b id="csFunctionsConfNum">0</b> </button>
                    <button id="csFunctionsConfDivClose" class="pointer cc-button-padding cc-circle-30  cc-background-dark-8 font-white-red cc-border-color-Aquamarine">Close </button>
                </dt>
                <dt class="cc-background-dark-8 font-white-red  cc-border-color-Aquamarine">
                    <pre class="cc-wrap"><b> functions running in background with params(params.background_cache & params.background_Request & params.background_Headers) must contain 'chrome-extension://' in url setting and no Delay Load Functions Time. functins in other url have param: params.NewTab_cache in NewTab / params.TabsSession_cache in TabsSession / params.content_cache in content \n use console.log(params) to see the content of "params" with url "chrome-extension://.*" or ".*"</b></pre>
                </dt>
            </dl>
        </div>
    `
    let siteFunc = ` 
            <dt class=" cc-marginHeight-small-10 csFunctionsConfDt">
                <button id="csFunctionsConfDtDelete" class="pointer cc-circle-30 cc-background-dark font-white-red  cc-border-color-Aquamarine"><b> - </b></button>
                <button class="cc-background-dark font-white-red  cc-border-color-Aquamarine">URL (Regular Expression): </button>
                <input id="csFunctionsConfSite" style="width: 666px;" class="cc-background-dark font-white-red  cc-border-color-Aquamarine">
                <button class="cc-background-dark font-white-red  cc-border-color-Aquamarine">Function: </button>
                <textarea id="csFunctionsConfDetail" name="csFunctionsConfDetail" style="vertical-align: top;width:90%;height:200px;" class="cc-background-dark font-white-red  cc-border-color-Aquamarine" spellcheck="false"></textarea>
            </dt>
        `
    let divEle = htmlStringToElement(div)
    let updateCSFunctionsConfNum = function () {
        divEle.querySelector("#csFunctionsConfNum").innerText = divEle.querySelectorAll(".csFunctionsConfDt").length
    }
    getStore(['csFunctions', 'csFunctionsDelayTime']).then((re) => {

        if (re.csFunctionsDelayTime) {
            divEle.querySelector("#csFunctionsConfDivTime").value = re.csFunctionsDelayTime
        } else {
            divEle.querySelector("#csFunctionsConfDivTime").value = 1600
        }
        if (re.csFunctions) {
            for (let key of Object.keys(re.csFunctions)) {
                let siteFuncEle = htmlStringToElement(siteFunc)
                siteFuncEle.querySelector("#csFunctionsConfSite").value = key
                siteFuncEle.querySelector("#csFunctionsConfDetail").value = re.csFunctions[key]
                siteFuncEle.querySelector("#csFunctionsConfDtDelete").onclick = () => {
                    siteFuncEle.parentNode.removeChild(siteFuncEle)
                    updateCSFunctionsConfNum()
                }
                document.querySelector("#csFunctionsConfDl").appendChild(siteFuncEle)
            }
        }

        updateCSFunctionsConfNum()
    })
    let csFunctionsConfSave = function () {
        let nodeDts = divEle.querySelectorAll(".csFunctionsConfDt")
        let csFunctions = {}

        siteArr = []
        for (node of nodeDts) {
            siteArr.push(node.querySelector("#csFunctionsConfSite").value)
        }
        if (hasDoubleInArray(siteArr)) {
            showMsgInfo("there are double site name !", 5000)
            return
        }
        for (node of nodeDts) {
            let site = node.querySelector("#csFunctionsConfSite").value
            try {
                let regexp = new RegExp(site);
                eval(regexp);
            } catch (e) {
                showMsgInfo("Regular Expression Of Site Domain Error In : " + site, 15000)
                return
            }
            let fd = node.querySelector("#csFunctionsConfDetail").value
            if (fd != "" && site != "") {
                csFunctions[site] = fd
            } else {
                showMsgInfo("one of the site or function is empty !", 5000)
                return
            }
        }
        setStore({
            csFunctions: csFunctions,
            csFunctionsDelayTime: divEle.querySelector("#csFunctionsConfDivTime").value
        })
        getStore(['hiddenValues']).then((re) => {
            // to trigger Backup
            re.hiddenValues.notifyBackupSettings.previousBackupTime = (new Date("Mon Aug 11 2000")).getTime()
            setStore({
                hiddenValues: re.hiddenValues
            })
        })
        msgToBackground({
            info: "csFunctionSettingTakeEffect"
        })
    }
    divEle.querySelector("#csFunctionsConfDivClose").onclick = () => {
        csFunctionsConfSave()
        let csFunctionsConfDiv = document.getElementById("csFunctionsConfDiv")
        csFunctionsConfDiv.parentNode.removeChild(csFunctionsConfDiv)
        msgToBackground({
            info: "csFunctionSettingTakeEffect"
        })
    }
    divEle.querySelector("#csFunctionsConfDivSave").onclick = () => {
        csFunctionsConfSave()
    }
    divEle.querySelector("#csFunctionsConfDivAdd").onclick = () => {
        let siteFuncEle = htmlStringToElement(siteFunc)
        siteFuncEle.querySelector("#csFunctionsConfDtDelete").onclick = () => {
            siteFuncEle.parentNode.removeChild(siteFuncEle)
            updateCSFunctionsConfNum()
        }
        document.querySelector("#csFunctionsConfDl").appendChild(siteFuncEle)
        updateCSFunctionsConfNum()
    }
    document.getElementsByTagName("body")[0].appendChild(divEle)
}

function config_getPictureFromNet() {

    // document.getElementById('config_textarea_div').classList.remove('hide');
    // let configTextarea = document.getElementById('config_textarea');
    // configTextarea.setAttribute('data-config', 'getFromNet');
    // configTextarea.setAttribute('placeholder', "input the css,not contain picture \n must contain: url(\"\")");

    // configTextarea.value = "";

    let getFromNetDivTxt = `
            <div class="cc-border-c cc-topLayer cc-background-dark-8 cc-centerFloat cc-oneline-wrap cc-vertical-align-center">
                <dl style="width:100%;height:100%" class="zeroMargin">
                    <dt style="width:100%;height:100%" class="zeroMargin">
                    <button id="getFromNetStart" class="pointer  cc-circle-30  configButton transparent font-green-dark ">
                        <b>Ok,Get From Net Start</b>
                    </button>
        <textarea  style="width:98%;height:90%" id="getFromNet_textarea" class="cc-border-c cc-background-dark-8 font-white-dark"  data-config="getFromNet"  autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>

                    </dt>
                </dl>
           
            </div>
        `
    let getFromNetDiv = htmlStringToElement(getFromNetDivTxt)
    let info = `
                if you have much pictures to add,like:
                    http://example.com/picture/img1.jpg
                    http://example.com/picture/img2.jpg
                    http://example.com/picture/imgdir/img4.jpg

                input example:

                    http://example.com/picture/  # end with "/"
                    img1.jpg
                    img2.jpg
                    -img3.jpg                    # skip this , if start with "-"
                    imgdir/img4.jpg              # 
                
        `
    getFromNetDiv.querySelector("#getFromNetStart").onclick = async function () {

        let content = getFromNetDiv.querySelector("#getFromNet_textarea").value

        if (content.trim() == "") {
            getFromNetDiv.parentNode.removeChild(getFromNetDiv)
            return
        }
        let contents = content.split("\n")

        let reg = new RegExp("^(https?|ftps?):///?.*\/$")
        if (!reg.test(contents[0].trim())) {
            showMsgInfo("the first line must start with http or ftp and end with /")
            return
        }

        let urlPrefix = contents[0].trim()
        let allCount = contents.length - 1
        let loadCount = 0

        getFromNetDiv.parentNode.removeChild(getFromNetDiv)

        for (let indexC = 1; indexC < contents.length; indexC++) {
            await sleep(cache.loadImageDataToMemoryIntervalMillisecondAvoidOccupyTooLargeMemory)
            try {

                if (contents[indexC].trim() == "") {
                    continue
                }
                if (contents[indexC].indexOf("_") == 0 || contents[indexC].indexOf("-") == 0) {
                    continue
                }
                let url = urlPrefix + contents[indexC]

                url = dealPath(url)
                url = encodeStringPathInOS(url)

                httpRequest(url, "GET", {
                    async: true,
                    responeType: 'blob',
                    callback: function (srcData) {
                        if (getVariableType(srcData).indexOf("XMLHttpRequest") > 0) {
                            showMsgInfo(contents[indexC] + " : " + srcData.statusText)
                            return
                        }
                        if (srcData.type.indexOf("image") != 0) {
                            return
                        }
                        let urlObject = window.URL || window.webkitURL || window;
                        let srcDataUrl = urlObject.createObjectURL(srcData);

                        let pictureName = ""
                        if (contents[indexC].indexOf("/") >= 0) {
                            let tempA = contents[indexC].split("/")
                            pictureName = tempA[tempA.length - 1]
                        }
                        if (contents[indexC].indexOf("\\") >= 0) {
                            let tempA = contents[indexC].split("\\")
                            pictureName = tempA[tempA.length - 1]
                        }
                        getBase64FromUrl(srcDataUrl, {
                            name: pictureName,
                            maxWidth: cache.resizeCssPicture.width,
                            maxHeigh: cache.resizeCssPicture.height
                        }, function (Base64FromUrl) {
                            let dl = createElement("dl");
                            cache.cfgpp.appendChild(dl);
                            config_save_picture_base64(Base64FromUrl.name, dl, Base64FromUrl.base64, function () {
                                loadCount++
                                cache.config_save_data["SelectFromLocalTotal"].innerText = "Total: " + cache.ToSaveAllPicturesBase64.pictureSavedAsBase64Name.length
                                if (loadCount == allCount) {
                                    cache.config_save_data["dtSearchInput"].value = "    Load  Complete  " + loadCount + "/" + allCount;
                                } else {
                                    cache.config_save_data["dtSearchInput"].value = "    Load  " + loadCount + "/" + allCount;
                                }

                            })
                        });


                    }
                })

            } catch (e) {
                showMsgInfo(e)
                pushAndStoreErrorLogArray({
                    error: e
                })
                log.error(e)
            }
        }


    }
    getFromNetDiv.querySelector("#getFromNet_textarea").placeholder = info
    document.body.appendChild(getFromNetDiv)

}
/**
 * 
 * @param {*} pictureName 
 * @param {Element} parentElement 
 * @param {*} originalImageBase64 
 * @param {Function} callback 
 */
function config_save_picture_base64(pictureName, parentElement, originalImageBase64, callback) {
    previewPictureBase64(originalImageBase64).then(function (pre) {
        if (cache.ToSaveAllPicturesBase64.pictureSavedAsBase64Name.includes(pictureName)) {
            showMsgInfo(" This Name Already Exists : " + pictureName);
            return;
        }
        if (cache.thisExtionsionKeys.includes(pictureName)) {
            showMsgInfo(" : This Name  Need To  Change : " + pictureName);
            return;
        }

        let HtmlInConfigPicturePath = createHtmlInConfigPicturePath(pictureName, pre.PictureBase64);
        cache.ConfigPictureBase64NameArray.push(HtmlInConfigPicturePath);
        parentElement.appendChild(HtmlInConfigPicturePath);

        cache.ToSaveAllPicturesBase64.pictureSavedAsBase64Name.push(pictureName);
        cache.thisExtionsionKeys.push(pictureName);

        // cache.ToSaveAllPicturesBase64[files[xx].name] = res.PictureBase64;

        let savePictureBase64One = {};
        savePictureBase64One[pictureName] = originalImageBase64;
        savePictureBase64One[pictureName + ".preview"] = pre.PictureBase64;
        savePictureBase64One.pictureSavedAsBase64Name = cache.ToSaveAllPicturesBase64.pictureSavedAsBase64Name
        savePictureBase64One.thisExtionsionKeys = cache.thisExtionsionKeys

        pre.PictureBase64 = null;
        pre = null;
        originalImageBase64 = null;

        setStore(savePictureBase64One, {
            setNullAfterStore: true
        });
        if (callback) {
            callback()
        }
    })
}

function config_pinSpecifyPictureInSomeSites() {
    let textareaSearchBox = document.getElementById("textareaSearch");
    textareaSearchBox.setAttribute("placeholder", "");
    textareaSearchBox.value = " ";

    document.getElementById('config_textarea_div').classList.remove('hide');

    document.getElementById('ifPinPicInSites').classList.remove('hide');
    document.getElementById('ifPinPicInSitesLabel').classList.remove('hide');



    let configTextarea = document.getElementById('config_textarea');
    // 
    let ifPinPicInSitesEle = document.getElementById('ifPinPicInSites');

    configTextarea.setAttribute('data-config', 'pinSpecifyPictureInSomeSites');
    configTextarea.setAttribute('placeholder', 'format: pin-pic-in-sites-(positive integer)===picture-path===sites(regex) \n eg:pin-pic-in-sites-1===D:\\111.png===(?:^https?|ftps?|file):///?(?:www.example1.com|example2.com).* \n eg:pin-pic-in-sites-2===D:\\img1.jpg | D:\\img2.jpg===(?:^https?|ftps?|file):///?(?:www.example33.com|eg.com).*');
    configTextarea.value = "";
    textareaSearchBox.value = "eg:pin-pic-in-sites-1===D:\\img1.jpg | D:\\img2.jpg===(?:^https?|ftps?|file):///?(?:www.example11.com|eg.com).*";
    getStore(['pinPicInSites', 'ifPinPicInSites']).then(function (object) {
        let pinPicInSites = object.pinPicInSites;

        if (pinPicInSites == undefined) {
            return;
        } else {
            let disTxt = null;

            for (dis in pinPicInSites) {
                if (disTxt == null) {
                    disTxt = dis + '===' + pinPicInSites[dis].path + '===' + pinPicInSites[dis].sites;
                } else {
                    disTxt = disTxt + '\n' + dis + '===' + pinPicInSites[dis].path + '===' + pinPicInSites[dis].sites;
                }
            }
            configTextarea.value = disTxt;
        }
        if (object.ifPinPicInSites) {
            ifPinPicInSitesEle.checked = true;
        }
    });

    ifPinPicInSitesEle.onclick = ifPinPicInSitesFunc;
}

function config_save_pinSpecifyPictureInSomeSites() {
    try {
        let configTextarea = document.getElementById('config_textarea');

        let configTextareaValue = configTextarea.value.trim().split('\n');

        let pinPicInSites = {};

        for (let ps = 0; ps < configTextareaValue.length; ps++) {
            if (configTextareaValue[ps].trim() == "") {
                continue
            }
            let psT = configTextareaValue[ps].trim().split('===');
            if (psT.length != 3) {
                ps++;
                showMsgInfo('error occurred in line ' + ps, 10000);
                return;
            }
            let psName = psT[0];
            let path = psT[1];
            let sites = psT[2];

            if (!/^pin\-pic\-in\-sites\-[0-9]{1,}$/.test(psName) || path == '' || sites == '') {
                ps++;
                showMsgInfo('error occurred in line ' + ps, 10000);
                return;
            }
            new RegExp(sites)
            let pathPPIS = dealPath(path).trim();
            let imgsInPathPPIS = pathPPIS.split("|")

            for (let img of imgsInPathPPIS) {
                if (!checkExists(img.trim())) {
                    showMsgInfo('picture not Exists in line ' + ps, 10000);
                    return;
                }
            }

            pinPicInSites[psName] = {
                path: path,
                sites: sites
            };
        }

        setStore({
            pinPicInSites: pinPicInSites
        }).then(() => {
            pickNextPictureForPinPicInSites()
        })

        document.getElementById('config_textarea_div').classList.add('hide');
        document.getElementById('ifPinPicInSites').classList.add('hide');
        document.getElementById('ifPinPicInSitesLabel').classList.add('hide');


        clearIntervalTextareaSearchTimer(textareaSearchTimer);

    } catch (e) {
        showMsgInfo('Error :   ' + e, 60000);
        return
    }
}
/**
 * save picture path data to broswer
 * @param {Element} element 
 */
function config_picture_save_path(element) {
    let textareaSearchBox = document.getElementById("textareaSearch");
    textareaSearchBox.setAttribute("placeholder", "");
    textareaSearchBox.value = " ";

    let id = element.id;

    document.getElementById('config_textarea_div').classList.remove('hide');
    let configTextarea = document.getElementById('config_textarea');
    configTextarea.setAttribute('data-config', 'config_picture_path');
    configTextarea.setAttribute('placeholder', 'input the full path  of the  picture files ...');

    configTextarea.value = "Loading Pictures Path ...... wait please";

    chrome.storage.local.get('pictureOnlySavedPathName', function (pf) {
        if (pf.pictureOnlySavedPathName == undefined) {
            configTextarea.value = '';
            return
        }

        let picturePathsLength = pf.pictureOnlySavedPathName.length;
        let pages = Math.ceil(picturePathsLength / 5000);

        cache.pictureOnlySavedPathName = pf.pictureOnlySavedPathName;
        cache.picturePathsLength = picturePathsLength;
        cache.pages = pages;
        cache.currentPages = 1;

        let endPoint = picturePathsLength > 5000 ? 5000 : picturePathsLength;

        let input = null;
        for (let ele of pf.pictureOnlySavedPathName.slice(0, endPoint)) {
            if (input == null) {
                input = ele;
            } else {
                input = input + '\n' + ele;
            }
        }
        configTextarea.value = input;
        document.getElementById("allPicturePage").innerText = pages;
        document.getElementById("currentPicturePage").value = 1;
        document.getElementById("textareaSearch").setAttribute("placeholder", "Search In All " + picturePathsLength + " Pictures");
        textareaSearchFunc(element);

        pageNum = document.querySelectorAll('[data-type=pageNum]');
        pageNum.forEach(function (elem) {
            elem.onclick = pageNumFunc;
        });

        pf = null;
    });
}

function config_picture_save_base64_data_close() {
    if (cache.inDeleteSelectedImages === true) {
        showMsgInfo("Delete Not Complete ...", 30000)
        return
    }
    if (cache.cfgpp == null || cache.cfgpp == undefined) {
        return
    }
    cache.cfgpp.parentNode.removeChild(cache.cfgpp);
    cache.cfgpp = null;
    cache.ConfigPictureBase64NameArray = [];

    let saveObject = cache.ToSaveAllPicturesBase64
    saveObject.thisExtionsionKeys = cache.thisExtionsionKeys
    setStore(saveObject, {
        setNullAfterStore: true
    });


    let temp = cache.ToSaveAllPicturesBase64.pictureSavedAsBase64Name;
    cache.ToSaveAllPicturesBase64 = {
        pictureSavedAsBase64Name: temp
    };
    cache.showStoreMsg = true;

    loadPicturesCategoriesToCache(cache, {
        newSave: true
    })
}

/**
 * save picture base64 data to broswer
 * @param {Element} element 
 */
function config_picture_save_base64_data(element) {
    let textareaSearchBox = document.getElementById("textareaSearch");
    textareaSearchBox.setAttribute("placeholder", "");
    textareaSearchBox.value = " ";

    let id = element.id;

    cache.ConfigPictureBase64NameArray = [];
    //  Picture Preview Name: Picture Name.preview
    cache.ToSaveAllPicturesBase64 = {
        pictureSavedAsBase64Name: []
    };

    cache.thisExtionsionKeys = [];
    chrome.storage.local.get("thisExtionsionKeys", function (re) {
        if (re.thisExtionsionKeys) {
            cache.thisExtionsionKeys = re.thisExtionsionKeys;
        } else {
            chrome.storage.local.get(null, function (re) {
                cache.thisExtionsionKeys = Object.keys(re);
            });
        }

    });

    cache.cfgpp = createElement("div");
    document.getElementById("bodyBackground").appendChild(cache.cfgpp);
    cache.cfgpp.className = "cc-centerFloat cc-background-dark-8";
    cache.cfgpp.id = "config_picture_path_div";

    let dl = createElement("dl");
    cache.cfgpp.appendChild(dl);

    let dtitle = createElement("dt");

    let tBnt = createElement("button");
    tBnt.className = "pointer  cc-circle-30  cc-background-dark-8 font-white-red cc-border-color-Aquamarine";
    let tBntxt = createTextNode("SelectPictureFromLocal");

    let getFromNetBnt = createElement("button");
    getFromNetBnt.className = "pointer  cc-circle-30  cc-background-dark-8 font-white-red cc-border-color-Aquamarine";
    let getFromNetTxt = createTextNode("SelectPictureFromNet");

    let SelectAll = createElement("button");
    SelectAll.className = "pointer  cc-circle-30  cc-background-dark-8 font-white-red cc-border-color-Aquamarine";
    let SelectAllTxt = createTextNode("SelectAll");
    SelectAll.onclick = function () {
        for (let xx = 0; xx < cache.ConfigPictureBase64NameArray.length; xx++) {
            cache.ConfigPictureBase64NameArray[xx].firstChild.nextElementSibling.checked = true;
        }
    }

    let NotSelectAll = createElement("button");
    NotSelectAll.className = "pointer  cc-circle-30  cc-background-dark-8 font-white-red cc-border-color-Aquamarine";
    let NotSelectAllTxt = createTextNode("Not SelectAll");
    NotSelectAll.onclick = function () {
        for (let xx = 0; xx < cache.ConfigPictureBase64NameArray.length; xx++) {
            cache.ConfigPictureBase64NameArray[xx].querySelector("input").checked = false;
        }
    }

    let DeleteSelected = createElement("button");
    DeleteSelected.className = "pointer  cc-circle-30  cc-background-dark-8 font-white-red cc-border-color-Aquamarine";
    let DeleteSelectedTxt = createTextNode("Delete Selected");
    DeleteSelected.onclick = function () {
        cache.blockLeave = true
        let tempArray = [];
        let deleteCount = 0
        let allCount = cache.ToSaveAllPicturesBase64.pictureSavedAsBase64Name.length
        let toDeleteCount = 0;
        cache.inDeleteSelectedImages = true
        showMsgInfo("Delete  Start ... Not Complete ... ", 30000)
        for (let xx = 0; xx < cache.ConfigPictureBase64NameArray.length; xx++) {
            if (cache.ConfigPictureBase64NameArray[xx].children[1].checked) {
                let nameTT = cache.ConfigPictureBase64NameArray[xx].children[3].innerText;
                let index = cache.ToSaveAllPicturesBase64.pictureSavedAsBase64Name.indexOf(nameTT);
                if (index < 0) {
                    continue;
                }
                cache.ToSaveAllPicturesBase64.pictureSavedAsBase64Name.splice(index, 1);
                toDeleteCount++;
                // delete cache.ToSaveAllPicturesBase64[nameTT];

                cache.ConfigPictureBase64NameArray[xx].parentNode.removeChild(cache.ConfigPictureBase64NameArray[xx]);
                cache.ConfigPictureBase64NameArray[xx].lastChild.checked = false;

                chrome.storage.local.remove([nameTT, nameTT + ".preview"], function (re) {
                    deleteCount++
                    if (toDeleteCount == deleteCount) {
                        cache.inDeleteSelectedImages = false
                        cache.blockLeave = false

                        loadPicturesCategoriesToCache(cache, {
                            newSave: true,
                            pictureSavedAsBase64Name: cache.ConfigPictureBase64NameArray
                        })

                        showMsgInfo("Delete Complete ...", 30000)
                    }
                });
                let indexExtionsionKeys = cache.thisExtionsionKeys.indexOf(nameTT);
                cache.thisExtionsionKeys.splice(indexExtionsionKeys, 1);
                tempArray.push(cache.ConfigPictureBase64NameArray[xx]);
            }
        }
        for (let xx = 0; xx < tempArray.length; xx++) {
            if (cache.ConfigPictureBase64NameArray.includes(tempArray[xx])) {
                let index = cache.ConfigPictureBase64NameArray.indexOf(tempArray[xx]);
                cache.ConfigPictureBase64NameArray.splice(index, 1);
            }
        }
        SelectFromLocalTotal.innerText = "Total: " + cache.ToSaveAllPicturesBase64.pictureSavedAsBase64Name.length;
        let saveObject = cache.ToSaveAllPicturesBase64
        saveObject.thisExtionsionKeys = cache.thisExtionsionKeys
        setStore(saveObject, {
            setNullAfterStore: true
        });
        // setStore({
        //     "thisExtionsionKeys": cache.thisExtionsionKeys
        // });
    }

    let save = createElement("button");
    save.className = "pointer  cc-circle-30  cc-background-dark-8 font-white-red cc-border-color-Aquamarine";
    let saveTXT = createTextNode("  Save  Pictures");
    save.onclick = function () {
        cache.showStoreMsg = true;
        let saveObject = cache.ToSaveAllPicturesBase64
        saveObject.thisExtionsionKeys = cache.thisExtionsionKeys
        setStore(saveObject, {
            setNullAfterStore: true
        })
    }

    let close = createElement("button");
    close.className = "pointer  cc-circle-30  cc-background-dark-8 font-white-red cc-border-color-Aquamarine";
    let closeTXT = createTextNode("  Close");

    close.onclick = config_picture_save_base64_data_close

    dtitle.appendChild(tBnt).appendChild(tBntxt);
    dtitle.appendChild(getFromNetBnt).appendChild(getFromNetTxt);
    // dtitle.appendChild(save).appendChild(saveTXT);
    dtitle.appendChild(SelectAll).appendChild(SelectAllTxt);
    dtitle.appendChild(NotSelectAll).appendChild(NotSelectAllTxt);
    dtitle.appendChild(DeleteSelected).appendChild(DeleteSelectedTxt);
    dtitle.appendChild(close).appendChild(closeTXT);

    let dtSearch = createElement("dt");

    let dtSearchInput = createElement("input");
    dtSearchInput.className = "cc-background-dark-8 font-white-red  cc-centerFloat-search cc-border-color-Aquamarine";
    let SelectFromLocalTotal = createElement("button");
    SelectFromLocalTotal.className = " cc-circle-30 cc-background-dark-8 font-white-red  cc-border-color-Aquamarine";
    let SelectFromLocalTotalTXT = createTextNode("Total: ");

    cache.config_save_data = {}
    cache.config_save_data["dtSearchInput"] = dtSearchInput
    cache.config_save_data["SelectFromLocalTotal"] = SelectFromLocalTotal

    dtSearch.appendChild(SelectFromLocalTotal).appendChild(SelectFromLocalTotalTXT);
    dtSearch.appendChild(dtSearchInput);

    dl.appendChild(dtitle); //
    dl.appendChild(dtSearch); // 

    let inputFile = document.createElementNS("http://www.w3.org/1999/xhtml", "input");
    let fileReaderArray = [];

    inputFile.onchange = async function (event) {

        let files = inputFile.files;
        let filesLength = files.length;
        let loadedNum = 0;
        let fileNumTemp = 0;
        dtSearchInput.value = "            Loading......  " + loadedNum + "/" + filesLength;
        let fileTotalSize = 0; // kB  
        for (let xx = 0; xx < files.length; xx++) {
            dtSearchInput.value = "            Loading......  " + loadedNum + "/" + filesLength;
            fileTotalSize = fileTotalSize + (files[xx].size / 1024);
            // if (fileTotalSize > 71680) {
            //     showMsgInfo("  ERROR : Total size bigger than 75MB may crash browser tab when save");
            //     filesLength = fileNumTemp;
            //     break;
            // } else {
            fileNumTemp++;
            // }

            if (files[xx].type.indexOf("image") < 0) {
                filesLength--;
                continue;
            }
            if (cache.ToSaveAllPicturesBase64.pictureSavedAsBase64Name.includes(files[xx].name)) {
                showMsgInfo("  This Name Already Exists : " + files[xx].name);
                filesLength--;
                continue;
            }
            if (cache.thisExtionsionKeys.includes(files[xx].name)) {
                showMsgInfo(" This Name  Need To  Change : " + files[xx].name);
                filesLength--;
                continue;
            }
            // sync sleep to wait for previous image data loaded to be recycle to avoid too large memory using
            await sleep(cache.loadImageDataToMemoryIntervalMillisecondAvoidOccupyTooLargeMemory)
            let fileReader = new FileReader();
            fileReader.readAsDataURL(files[xx]);
            fileReader.onloadend = function (re) {
                zoomPictureBase64(re.target.result).then(function (res) {
                    config_save_picture_base64(files[xx].name, dl, res.PictureBase64, () => {
                        re = null;
                        fileReader = null
                        loadedNum++;
                    })
                })
            }
        }
        let selectPictureInternal = setInterval(function () {
            dtSearchInput.value = "            Loading......  " + loadedNum + "/" + filesLength;

            if (filesLength == loadedNum) {
                inputFile.value = null;

                let saveObject = cache.ToSaveAllPicturesBase64
                saveObject.thisExtionsionKeys = cache.thisExtionsionKeys
                setStore(saveObject, {
                    setNullAfterStore: true
                })

                SelectFromLocalTotal.innerText = "Total: " + cache.ToSaveAllPicturesBase64.pictureSavedAsBase64Name.length;
                dtSearchInput.value = "   Load  Complete  " + loadedNum + "/" + filesLength;

                loadPicturesCategoriesToCache(cache, {
                    newSave: true,
                    pictureSavedAsBase64Name: cache.ToSaveAllPicturesBase64.pictureSavedAsBase64Name
                })
                clearInterval(selectPictureInternal);
            }
        }, 500);
    }
    tBnt.onclick = function () {
        inputFile.type = 'file';
        inputFile.setAttribute("multiple", "multiple");
        fakeClick(inputFile);
    }
    getFromNetBnt.onclick = config_getPictureFromNet
    dtSearchInput.value = "            Loading......";

    chrome.storage.local.get(["thisExtionsionKeys", "pictureSavedAsBase64Name"], async function (re) {

        // cache.thisExtionsionKeys = Object.keys(re);
        if (re.thisExtionsionKeys) {
            cache.thisExtionsionKeys = re.thisExtionsionKeys;
        } else {
            chrome.storage.local.get(null, function (re) {
                cache.thisExtionsionKeys = Object.keys(re);
            });
        }

        // cache.thisExtionsionKeys = re.thisExtionsionKeys;
        if (re.pictureSavedAsBase64Name) {
            let keyNum = re.pictureSavedAsBase64Name.length;
            let loadedNum = 0;

            for (let xx = 0; xx < re.pictureSavedAsBase64Name.length; xx++) {
                // sync sleep to wait for previous image data loaded to be recycle to avoid too large memory using
                // await sleep(cache.loadImageDataToMemoryIntervalMillisecondAvoidOccupyTooLargeMemory)
                chrome.storage.local.get(re.pictureSavedAsBase64Name[xx] + ".preview", function (re3) {
                    // previewPictureBase64(re3[re.pictureSavedAsBase64Name[xx]+".preview"]).then(function (pre) {
                    // let HtmlInConfigPicturePath = createHtmlInConfigPicturePath(re.pictureSavedAsBase64Name[xx], pre.PictureBase64);
                    let HtmlInConfigPicturePath = createHtmlInConfigPicturePath(re.pictureSavedAsBase64Name[xx], re3[re.pictureSavedAsBase64Name[xx] + ".preview"]);
                    cache.ConfigPictureBase64NameArray.push(HtmlInConfigPicturePath);
                    dl.appendChild(HtmlInConfigPicturePath);
                    cache.ToSaveAllPicturesBase64.pictureSavedAsBase64Name.push(re.pictureSavedAsBase64Name[xx]);
                    //cache.ToSaveAllPicturesBase64[pictureKeys[xx]] = re2[pictureKeys[xx]];

                    loadedNum++;

                    // pre = null;
                    re3 = null;

                    dtSearchInput.value = "            Loading......  " + loadedNum + "/" + keyNum;
                    // })
                });
            }
            let loadStoreCIntervl = setInterval(function () {
                // dtSearchInput.value = "            Loading......  " + loadedNum + "/" + keyNum;
                if (loadedNum == keyNum) {  
                    SelectFromLocalTotal.innerText = "Total: " + keyNum
                    // dtSearchInput.value = " Not Recommend Bigger Than 75M ,Normally 175 Pictures Each 438KB";
                    dtSearchInput.value = "   Load  Complete  " + loadedNum + "/" + keyNum;
                    clearInterval(loadStoreCIntervl);
                    loadPicturesCategoriesToCache(cache, {
                        newSave: true,
                        pictureSavedAsBase64Name: re.pictureSavedAsBase64Name,
                        callback:function(){
                            re = null;
                        }
                    }) 
                    
                }
            }, 500);
        } else {
            dtSearchInput.value = "";
            re = null;
        }
    });
}


function configButtonFunc() {

    if (this.id != "config_picture_path") {
        clearIntervalTextareaSearchTimer(textareaSearchTimer);
    }


    let textareaSearchBox = document.getElementById("textareaSearch");
    textareaSearchBox.setAttribute("placeholder", "");
    textareaSearchBox.value = " ";

    let id = this.id;
    if (id == "csFunctions") {
        customFunctionsConf(this)
    } else if (id == 'config_picture_path') {
        getStore("otherOptions").then((re) => {
            if (re.otherOptions.ConfigPicturesPathType_SavePictureBase64DataToBroswer == false) {
                config_picture_save_path(this)
            } else {
                config_picture_save_base64_data(this)
            }
        })

    } else if (id == 'config_css') {
        document.getElementById('config_textarea_div').classList.remove('hide');
        // 
        textareaSearchBox.setAttribute("placeholder", "");
        textareaSearchBox.value = "  Write Your Owner CSS Style OR Modify This Default CSS Style, background: url('') fixed !important; is need in html{ } To use picture as background";
        let configTextarea = document.getElementById('config_textarea');
        configTextarea.setAttribute('data-config', 'config_css');
        configTextarea.setAttribute('placeholder', "input the css,not contain picture \n must contain: url(\"\")");

        configTextarea.value = "Loading CSS  Config...... wait please";


        getStore('config_css').then(function (object) {
            if (object.config_css == undefined) {
                configTextarea.value = '';
                return
            } else {
                configTextarea.value = object.config_css;
            }
        });

    } else if (id == 'config_css_match_sites') {
        document.getElementById('config_textarea_div').classList.remove('hide');
        // 
        textareaSearchBox.setAttribute("placeholder", "");
        textareaSearchBox.value = "";
        let configTextarea = document.getElementById('config_textarea');
        configTextarea.setAttribute('data-config', 'config_css_match_sites');
        configTextarea.setAttribute('placeholder', ' create new RegEx to  exclude sites not to apply css ...' +
            "\n Example: (?:^https?|file|ftps?about|javascript):\/\/(?!(www.your-sites-here.com|forum.example.com)).* ");

        getStore('config_css_match_sites').then(function (object) {
            if (object.config_css_match_sites == undefined) {
                configTextarea.value = "(?:^https?|file|ftps?about|javascript):\/\/(?!(www.your-sites-here.com|forum.example.com)).*";
            } else {
                configTextarea.value = object.config_css_match_sites;
            }
        });

    } else if (id == 'save_showMsgOnTitleTime') {
        let showMsgOnTitleTime = document.getElementById('showMsgOnTitleTime').value;
        if (!/^[0123456789]+$/ig.test(showMsgOnTitleTime)) {
            showMsgInfo('input one number at least !!!', 15000);

            return;
        }
        setStore({
            showMsgOnTitleTime: showMsgOnTitleTime
        });
    } else if (id == 'ifPictureBackground') {
        if (this.checked) {
            setStore({
                ifPictureBackground: true
            })
        } else {
            setStore({
                ifPictureBackground: false
            })
        }
    } else if (id == 'picturesCategoriesFilter') {
        if (this.checked) {
            loadPicturesCategoriesToCache(cache, opt = {
                newSave: true,
                ifFilter: true,
                callback:msgToBackground, 
                callbackParameters:{ info: 'picturesCategoriesFilterReload#true' }
            }) 
        } else {
            loadPicturesCategoriesToCache(cache, opt = {
                newSave: true,
                ifFilter: false,
                callback:msgToBackground,
                callbackParameters:{ info: 'picturesCategoriesFilterReload#false'  }
            }) 
        }

    } else if (id === 'previous_picture') {
        getStore('previousPicture').then(function (object) {
            if (object.previousPicture == undefined) {
                return
            } else {
                setPicture(object.previousPicture, true);
            }
        });
    } else if (id == 'setPictureAsCssEternal') {
        if (this.checked) {
            getStore('currentPicture').then(function (object) {
                /**
                     
                        setStore(object);
                    }); backgroundJS.getPictureBase64(object.currentPicture,'PictureAsCssEternalBase64').then(function(object) {
                    */
                msgToBackground({
                    picturePath: object.currentPicture,
                    info: 'getPictureBase64',
                    PictureBase64Name: 'PictureAsCssEternalBase64'
                });
                setStore({
                    setPictureAsCssEternal: true,
                    PictureAsCssEternal: object.currentPicture
                })
            })

        } else {
            setStore({
                setPictureAsCssEternal: false,
                useDarkBackground: false
            })
        }
    } else if (id == 'pinThisPictureInNewTab') {
        if (this.checked) {

            getStore('currentPicture').then(function (object) {

                setStore({
                    pinThisPictureInNewTab: true,
                    pinNewTabPicture: object.currentPicture
                })
            })

        } else {
            setStore({
                pinThisPictureInNewTab: false
            })
        }
    } else if (id === 'recentlyUsedPictures') {
        document.getElementById('config_textarea_div').classList.remove('hide');
        // 
        textareaSearchBox.setAttribute("placeholder", "");
        textareaSearchBox.value = "";
        let configTextarea = document.getElementById('config_textarea');
        configTextarea.setAttribute('data-config', 'recentlyUsedPictures');
        configTextarea.setAttribute('placeholder', "");
        configTextarea.value = "Loading Recently Used Pictures ...... wait please";
        getStore('recentlyUsedPictures').then(function (object) {
            if (object.recentlyUsedPictures == undefined) {
                configTextarea.value = "";
                return;
            } else {

                let input = null;
                for (let ele of object.recentlyUsedPictures) {
                    if (input == null) {
                        input = dealPathToWin(ele);
                    } else {
                        input = input + '\n' + dealPathToWin(ele);
                    }
                }
                configTextarea.value = input;
                textareaSearchBox.value = "Total: " + object.recentlyUsedPictures.length;

            }
        });
    } else if (id == 'showPicturesThatNotExists') {
        document.getElementById('config_textarea_div').classList.remove('hide');
        // 
        textareaSearchBox.setAttribute("placeholder", " Save Empty Content To Clear PicturesThatNotExists");
        textareaSearchBox.value = "  Save Empty Content  To Clear  Pictures That Not Exists";
        let configTextarea = document.getElementById('config_textarea');
        configTextarea.setAttribute('data-config', 'showPicturesThatNotExists');
        configTextarea.setAttribute('placeholder', "");
        configTextarea.value = "Loading Pictures That Not Exists ...... wait please";

        getStore('picturesThatNotExists').then(function (object) {
            if (object.picturesThatNotExists == undefined) {
                configTextarea.value = "";
                return;
            } else {

                let input = null;
                for (let ele of object.picturesThatNotExists) {
                    if (input == null) {
                        input = dealPathToWin(ele);
                    } else {
                        input = input + '\n' + dealPathToWin(ele);
                    }
                }
                configTextarea.value = input;
                textareaSearchBox.value = " Save Empty Content To Clear " + object.picturesThatNotExists.length + " Pictures That Not Exists ";
            }
        });
    } else if (id == 'showLogs') {
        document.getElementById('config_textarea_div').classList.remove('hide');
        // 
        textareaSearchBox.setAttribute("placeholder", "Use Clear Button To Clear ");
        textareaSearchBox.value = "  Use Clear Button To Clear  Logs";
        let configTextarea = document.getElementById('config_textarea');
        configTextarea.setAttribute('data-config', 'showLogs');
        configTextarea.setAttribute('placeholder', "");
        configTextarea.value = "";

        getStore('errorLogArray').then(function (object) {
            if (object.errorLogArray == undefined) {

                return;
            } else {

                let input = null;
                for (let ele of object.errorLogArray) {
                    if (input == null) {
                        input = JSON.stringify(ele) + "\n"
                    } else {
                        input = input + '\n' + JSON.stringify(ele) + "\n"
                    }
                }
                configTextarea.value = input;
                textareaSearchBox.value = " Use Clear Button To Clear " + object.errorLogArray.length + " Logs ";
            }
        });
    } else if (id == 'resizeCssPicture') {
        document.getElementById('config_textarea_div').classList.remove('hide');
        // 
        textareaSearchBox.setAttribute("placeholder", "");
        textareaSearchBox.value = "set css picture max width or height, not recommend changing: use default 4096";
        textareaSearchBox.style.fontWeight = "bold";
        let configTextarea = document.getElementById('config_textarea');
        configTextarea.setAttribute('data-config', 'resizeCssPicture');
        configTextarea.setAttribute('placeholder', " set css picture max width or height : \n default max: width=4096 height=4096\n input  example: 4096x4096=quality , meaning width<=4096 and height<=4096 after reSize \n min set : 1920x1080 \n recommend default:4096x4096\n quality:zoom quality, range 0 - 1 \n eg:4096x4096=0.9\n\nthe purpose of this set is to reduce memory used by chrome");
        configTextarea.value = "";

        getStore('resizeCssPicture').then(function (object) {
            if (object.resizeCssPicture == undefined) {
                return;
            } else {
                configTextarea.value = object.resizeCssPicture.width + "x" + object.resizeCssPicture.height + "=" + object.resizeCssPicture.quality;
            }
        });
    } else if (id == 'pinSpecifyPictureInSomeSites') {

        config_pinSpecifyPictureInSomeSites()

    } else if (id == 'blockItems') {
        document.getElementById('config_textarea_div').classList.remove('hide');
        // let textareaSearchBox = document.getElementById("textareaSearch");
        textareaSearchBox.setAttribute("placeholder", "");
        textareaSearchBox.value = " Main Purpose of This Is To Block ThirdParty SubFrame Which May Forcibly Occupy Large Memory Or Crash Browser Tab";

        let configTextarea = document.getElementById('config_textarea');
        configTextarea.setAttribute('data-config', 'blockItems');
        configTextarea.value = "";
        configTextarea.setAttribute('placeholder', "");

        let importTrackerData = document.getElementById('importTrackerData');
        let editAdFilterRule = document.getElementById('editAdFilterRule');
        //importTrackerData.classList.remove('hide');
        // editAdFilterRule.classList.remove('hide');
        importTrackerData.onclick = function () {
            let inputFile = document.createElementNS("http://www.w3.org/1999/xhtml", "input")
            inputFile.type = 'file';


            let fileReader = new FileReader();
            fakeClick(inputFile);

            //cache.intervals;

            setTimeout(function () {
                let importTrackerInterval = setInterval(function () {

                    let file = inputFile.files[0];
                    if (file) {

                        if (fileReader.readyState == 0) {
                            fileReader.readAsText(file);
                        } else if (fileReader.readyState == 2) {


                            parseGhosteryTrackerDatabase(fileReader.result);

                            clearInterval(importTrackerInterval);
                        }
                    } else {

                    }
                }, 1000);
            }, 1000);
        }

        getStore(['blockItems'])
            .then(function (reAdvance) {

                cache.blockItems = {};
                cache.blockScriptOptions = {}

                cache.blockTrackerAndAdItemsLong = reAdvance.blockItems.indexOf('blockException') >= 0 ? reAdvance.blockItems.length - 1 : reAdvance.blockItems.length;
                return getStore(reAdvance.blockItems);
            })
            .then(function (re) {
                let blockTrackerAndAdValue = "";
                let splitCode = "\n====================================================================================================================================================\n";
                cache.blockItems.keys = Object.keys(re.blockTrackerAndAdOptions);
                cache.blockItems.blockTrackerAndAdOptionsLong = cache.blockItems.keys.length;

                cache.blockScriptOptions.keys = Object.keys(re.blockScriptOptions)
                cache.blockScriptOptions.blockScriptOptionsLong = cache.blockScriptOptions.keys.length;



                for (vv in re) {
                    blockTrackerAndAdValue = splitCode + "\n\n" + blockTrackerAndAdValue;
                    if (vv == 'blockTrackerAndAdOptions') {
                        let blockTrackerAndAdOptions = "blockTrackerAndAdOptions::" + JSON.stringify(re[vv]) + "\n\n Tips: blockSubFrameType:redirectUrl/blockRequest \n       sites in subFrameExcludeSites will not block any subFrame \n       URL in subFrameNotBlockURL will not be blocked In any Sites, it's for inPageSearch\n       recommend set ifBlockThirdPartySubFrame to be true\n       site:www.baidu.com Permit the tracker:'bdstatic.com'  : \"sitePermitTracker\":{\"www.baidu.com\":[\"bdstatic.com\"]} \n eg: \"subFrameExcludeSites\":[\"google.com\"\,\"chrome.com\"]";

                        if (blockTrackerAndAdValue == null) {
                            blockTrackerAndAdValue = blockTrackerAndAdOptions;
                        } else {
                            blockTrackerAndAdValue = blockTrackerAndAdOptions + "\n\n" + blockTrackerAndAdValue;
                        }
                    } else if (vv == 'blockScriptOptions') {
                        let blockScriptOptions = "blockScriptOptions::" + JSON.stringify(re[vv]) + "\n\n Tips: if url domain Name end With Country Code,  set like this: \"domainNameWithCountryCode\":[\".co.uk\",\".com.cn\"]";

                        if (blockTrackerAndAdValue == null) {
                            blockTrackerAndAdValue = blockScriptOptions;
                        } else {
                            blockTrackerAndAdValue = blockScriptOptions + "\n\n" + blockTrackerAndAdValue;
                        }
                    } else if (vv == 'blockTrackerUrl') { // toString()  JSON.stringify(re[vv])
                        let blockTrackerUrl = "blockTrackerUrl::" + JSON.stringify(re[vv]) + "\n\nExample 1:\[\"doubleclick.net\"\,\"baidustatic.com\"\]";

                        if (blockTrackerAndAdValue == null) {
                            blockTrackerAndAdValue = blockTrackerUrl;
                        } else {
                            blockTrackerAndAdValue = blockTrackerUrl + "\n\n" + blockTrackerAndAdValue;
                        }
                    } else if (vv == 'blockAdSite') {
                        let blockAdSite = "blockAdSite::" + JSON.stringify(re[vv]) + "\n\nExample 1:\[\"doubleclick.net\"\,\"baidustatic.com\"\]";

                        if (blockTrackerAndAdValue == null) {
                            blockTrackerAndAdValue = blockAdSite;
                        } else {
                            blockTrackerAndAdValue = blockAdSite + "\n\n" + blockTrackerAndAdValue;
                        }
                    }

                }
                configTextarea.value = blockTrackerAndAdValue;
            });

    } else if (id == 'advance') {
        config_advance(this)
    } else if (id == "ExportSettings") {
        chrome.storage.local.get(null, function (re) {
            let data = JSON.stringify(re)
            let time = (new Date()).toLocaleString()
            exportData('C.C.CSS.Tab  Settings_Backup ' + time + '.json', data)

            re.hiddenValues.notifyBackupSettings.previousBackupTime = (new Date()).getTime()
            setStore({
                hiddenValues: re.hiddenValues
            })
        })
    } else if (id == 'ImportSettings') {

        importData('Text', "application/json", importSettings)

    }




    actionsAfterClickConfigButton()

}

/**
 * 
 * @param {Element} element 
 */
function config_advance(element) {
    let textareaSearchBox = document.getElementById("textareaSearch");
    textareaSearchBox.setAttribute("placeholder", "");
    textareaSearchBox.value = " ";

    let id = this.id;

    document.getElementById('config_textarea_div').classList.remove('hide');
    // let textareaSearchBox = document.getElementById("textareaSearch");
    textareaSearchBox.setAttribute("placeholder", "");
    textareaSearchBox.value = "Not Delete Any Of The Setting Items !";

    let configTextarea = document.getElementById('config_textarea');
    configTextarea.setAttribute('data-config', 'advance');
    configTextarea.value = "";
    configTextarea.setAttribute('placeholder', "IntervalShowPicInNewTab::(Times==path1;path2;)\nIntervalShowPicInCSS::(Times==path1;path2;)");


    getStore(['advanceItems'])
        .then(function (reAdvance) {
            cache.advanceItemsLong = reAdvance.advanceItems.length;
            cache.advanceItems = reAdvance.advanceItems
            return getStore(reAdvance.advanceItems);
        })
        .then(function (re) {
            cache.config.advance = re
            let advanceValue = "";
            let splitCode = "\n=============================================================================================================================================\n";
            cache.UserAgentOptionsCacheInSaveAdvance = re.UserAgentOptions;

            for (vv in re) {

                advanceValue = splitCode + "\n\n" + advanceValue;
                if (vv == "picturesCategories") {
                    let picturesCategories = "picturesCategories::{\"categoryRulesAndCategoryWeight\":" + JSON.stringify(re[vv].pictureOnlySavedPathName.config.categoryRulesAndCategoryWeight) + ",\"singleStringMatchMultiRule\":" + JSON.stringify(re[vv].pictureOnlySavedPathName.config.singleStringMatchMultiRule) + "}\n                eg: {\"categoryRulesAndCategoryWeight\":{\"springPicture\":3,\"summerPicture\":5},\"singleStringMatchMultiRule\":true}";

                    if (advanceValue == null) {
                        advanceValue = picturesCategories;
                    } else {
                        advanceValue = picturesCategories + "\n\n" + advanceValue;
                    }
                } else if (vv == 'IntervalShowPicInNewTab') {
                    let pathShowInText = re[vv].paths == null ? null + ";" : re[vv].paths.join(";") + ";";
                    let IntervalShowPicInNewTab = "IntervalShowPicInNewTab::" + re[vv].times + "==" + pathShowInText + "\neg: 1==path1;path2;";

                    if (advanceValue == null) {
                        advanceValue = IntervalShowPicInNewTab;
                    } else {
                        advanceValue = IntervalShowPicInNewTab + "\n\n" + advanceValue;
                    }
                } else if (vv == 'IntervalShowPicInCSS') {
                    let pathShowInText = re[vv].paths == null ? null + ";" : re[vv].paths.join(";") + ";";
                    let IntervalShowPicInCSS = "IntervalShowPicInCSS::" + re[vv].times + "==" + pathShowInText + "\neg: 1==path1;path2;";

                    if (advanceValue == null) {
                        advanceValue = IntervalShowPicInCSS;
                    } else {
                        advanceValue = IntervalShowPicInCSS + "\n\n" + advanceValue;
                    }
                } else if (vv == 'DecoratePluginsUrlRegex') {
                    let pathShowInText = re[vv] == null ? null : re[vv];
                    let DecoratePluginsUrlRegex = "DecoratePluginsUrlRegex::" + pathShowInText;

                    if (advanceValue == null) {
                        advanceValue = DecoratePluginsUrlRegex;
                    } else {
                        advanceValue = DecoratePluginsUrlRegex + "\n\n" + advanceValue;
                    }
                } else if (vv == 'ClockInCSS') {
                    let pathShowInText = re[vv] == null ? null : re[vv];
                    let ClockInCSS = "ClockInCSS::" + pathShowInText;

                    if (advanceValue == null) {
                        advanceValue = ClockInCSS;
                    } else {
                        advanceValue = ClockInCSS + "\n\n" + advanceValue;
                    }
                } else if (vv == 'ClockInNewTab') {
                    let pathShowInText = re[vv] == null ? null : re[vv];
                    let ClockInNewTab = "ClockInNewTab::" + pathShowInText;

                    if (advanceValue == null) {
                        advanceValue = ClockInNewTab;
                    } else {
                        advanceValue = ClockInNewTab + "\n\n" + advanceValue;
                    }
                } else if (vv == 'remindTime') {

                    let remindTime = "remindTime::" + toSingleOblique(JSON.stringify(re[vv])) + "\n     Example 1:\{\"ringtone\"\:\"default\"\}\nExample 2:\{\"ringtone\"\:\"C:\\ring\.mp3\"\,\"desktopNotify\"\:true\,\"soundLoop\"\:false\,\"enableSound\"\:false\}";

                    if (advanceValue == null) {
                        advanceValue = remindTime;
                    } else {
                        advanceValue = remindTime + "\n\n" + advanceValue;
                    }
                } else if (vv == 'UserAgentOptions') {
                    let toShow = {
                        UserAgent: re[vv].UserAgent,
                        UserAgents: re[vv].UserAgents
                    };
                    let UserAgentOptions = "UserAgentOptions::" + toSingleOblique(JSON.stringify(toShow)) + "\n     Example 1:\{\"UserAgent\":\"customAgentName\",\"UserAgents\":[\"chromeMac\",\"chromeIphone\",\"chromeIpad\",\"safariMac\",\"KW\",\"customAgentName\"],\"customAgentName\":\"customAgent\"\} \n     Tips: those cannot be delete in UserAgents : \"chromeMac\",\"chromeIphone\",\"chromeIpad\",\"safariMac\",\"KW\"";

                    if (advanceValue == null) {
                        advanceValue = UserAgentOptions;
                    } else {
                        advanceValue = UserAgentOptions + "\n\n" + advanceValue;
                    }
                } else if (vv == 'inPageSearchOptions') {
                    let inPageSearchOptions = "inPageSearchOptions::" + toSingleOblique(JSON.stringify(re[vv])) + "\n\n      Tip:  config searchEngine need to set subFrameNotBlockedFromURL in \"Block ThirdParty SubFrame, Tracker, Ad\"\n\n      Example:   \{\"searchEngine\"\:\"https\:\/\/cn.bing.com\/images\/search\?q\=\"\,\"searchEngineParams\"\: \"\&FORM\=BESBTB\&first\=1&cw\=1562\&ch=909&ensearch=1\"\,\"closeInPageSearchByClickOutsideSearchPage\"\:true\}";

                    if (advanceValue == null) {
                        advanceValue = inPageSearchOptions;
                    } else {
                        advanceValue = inPageSearchOptions + "\n\n" + advanceValue;
                    }
                } else if (vv == 'recentlyUsedPicturesOpt') {

                    let recentlyUsedPicturesOpt = "recentlyUsedPicturesOpt::" + JSON.stringify(re[vv]) + "\nExample 1:\{\"recentlyUsedPicturesNum\"\:30\}";

                    if (advanceValue == null) {
                        advanceValue = recentlyUsedPicturesOpt;
                    } else {
                        advanceValue = recentlyUsedPicturesOpt + "\n\n" + advanceValue;
                    }
                } else if (vv == 'saveFullHtmlOptions') {
                    cache.saveFullHtmlOptions = {
                        keys: Object.keys(re[vv])
                    }

                    let saveFullHtmlOptions = "saveFullHtmlOptions::" + JSON.stringify(re[vv]) + "\n\n   Tips: timeout unit:second ; Width/Height unit:px";

                    if (advanceValue == null) {
                        advanceValue = saveFullHtmlOptions;
                    } else {
                        advanceValue = saveFullHtmlOptions + "\n\n" + advanceValue;
                    }
                } else if (vv == 'otherOptions') {
                    let otherOptions = "otherOptions::" + JSON.stringify(re[vv]) + "\n\n      Tips:\n      1.intervalOpenSpecificURL must start with a scheme,eg:[\"https://www.google.com\",\"file:///C:/eg.png\"]\n      2.notifyBackupTabSessionIntervalDay: set 0 will never notify Backup TabSession\n      3.background_Refresh_Notify_Task_Preferences_IntervalSecond must between [5,300]"

                    if (advanceValue == null) {
                        advanceValue = otherOptions;
                    } else {
                        advanceValue = otherOptions + "\n\n" + advanceValue;
                    }
                } else if (vv == 'ClockOptions') {
                    let ClockOptions = "ClockOptions::" + JSON.stringify(re[vv]) + "\nExample 1:   \{\"opacity\"\:0\.4\,\"canvasWidth\"\:140\}\nExample 2:   \{\}";

                    if (advanceValue == null) {
                        advanceValue = ClockOptions;
                    } else {
                        advanceValue = ClockOptions + "\n\n" + advanceValue;
                    }
                } else if (vv == 'bookmarksOptions') {
                    let bookmarksOptions = "bookmarksOptions::" + JSON.stringify(re[vv]) + "\nExample 1:   \{\"showBookmarks\"\:true\,\"bookmarksAutoShrink\"\:true\,\"ToggleBooks\"\:false\,\"\mainBookNum\"\:12\,\"onlyMainBooksButton\"\:false}";

                    if (advanceValue == null) {
                        advanceValue = bookmarksOptions;
                    } else {
                        advanceValue = bookmarksOptions + "\n\n" + advanceValue;
                    }
                }
            }
            configTextarea.value = advanceValue;
        });

}

function refreshPage() {
    location.reload(false)
}
/**
 * 
 * @param data 
 */
function importSettings(data) {

    let temp = JSON.parse(data)
    let settings = {}

    getStore('TabsSession').then(function (reTab) {

        //let imkeys = Object.keys(temp)

        let resultEle = createCheckboxElements(['Custom Functions', 'Picture Configs', 'CSS And MatchSites Configs', 'Others'])
        cache.importInterTimer = setInterval(function () {

            if (cache.msgCheck.confirm) {

                for (i = 0; i < cache.msgCheck.msgCheckboxElements.length; i++) {
                    if (cache.msgCheck.msgCheckboxElements[i].getAttribute('data-item') == 'Custom Functions') {
                        if (cache.msgCheck.msgCheckboxElements[i].checked) {
                            settings.csFunctionsDelayTime = temp.csFunctionsDelayTime
                            settings.csFunctions = temp.csFunctions

                        }
                        delete temp.csFunctionsDelayTime
                        delete temp.csFunctions

                    } else if (cache.msgCheck.msgCheckboxElements[i].getAttribute('data-item') == 'Picture Configs') {
                        if (cache.msgCheck.msgCheckboxElements[i].checked) {

                            settings.IntervalShowPicInCSS = temp.IntervalShowPicInCSS
                            settings.IntervalShowPicInNewTab = temp.IntervalShowPicInNewTab

                            settings.pinPicInSites = temp.pinPicInSites

                            settings.pictureSavedAsBase64Name = temp.pictureSavedAsBase64Name
                            settings.PictureAsCssEternal = temp.PictureAsCssEternal
                            settings.PictureAsCssEternalBase64 = temp.PictureAsCssEternalBase64
                            settings.currentPicture = temp.currentPicture
                            settings.ifPictureBackground = temp.ifPictureBackground
                            settings.nextPicture = temp.nextPicture
                            settings.nextPictureBase64 = temp.nextPictureBase64
                            settings.pictureOnlySavedPathName = temp.pictureOnlySavedPathName
                            settings.picturePathsNumber = temp.picturePathsNumber
                            settings.picturesThatNotExists = temp.picturesThatNotExists
                            settings.previousPicture = temp.previousPicture
                            settings.recentlyUsedPictures = temp.recentlyUsedPictures
                            settings.recentlyUsedPicturesOpt = temp.recentlyUsedPicturesOpt
                            settings.resizeCssPicture = temp.resizeCssPicture
                            settings.setPictureAsCssEternal = temp.setPictureAsCssEternal

                        }

                        delete temp.IntervalShowPicInCSS
                        delete temp.IntervalShowPicInNewTab

                        delete temp.pinPicInSites

                        delete temp.pictureSavedAsBase64Name
                        delete temp.PictureAsCssEternal
                        delete temp.PictureAsCssEternalBase64
                        delete temp.currentPicture
                        delete temp.ifPictureBackground
                        delete temp.nextPicture
                        delete temp.nextPictureBase64
                        delete temp.pictureOnlySavedPathName
                        delete temp.picturePathsNumber
                        delete temp.picturesThatNotExists
                        delete temp.previousPicture
                        delete temp.recentlyUsedPictures
                        delete temp.recentlyUsedPicturesOpt
                        delete temp.resizeCssPicture
                        delete temp.setPictureAsCssEternal

                    } else if (cache.msgCheck.msgCheckboxElements[i].getAttribute('data-item') == 'CSS And MatchSites Configs') {
                        if (cache.msgCheck.msgCheckboxElements[i].checked) {
                            settings.useDefaultCSS = temp.useDefaultCSS
                            settings.config_default_css_first = temp.config_default_css_first
                            settings.config_css = temp.config_css
                            settings.config_css_match_sites = temp.config_css_match_sites

                        }
                        delete temp.useDefaultCSS
                        delete temp.config_default_css_first
                        delete temp.config_css
                        delete temp.config_css_match_sites


                    } else if (cache.msgCheck.msgCheckboxElements[i].getAttribute('data-item') == 'Others') {
                        if (cache.msgCheck.msgCheckboxElements[i].checked) {
                            for (let key of Object.keys(temp)) {
                                if (temp[key] == "TabsSession") {
                                    continue
                                }
                                settings[key] = temp[key]
                            }

                            // cache.msgCheck.confirm = false
                        }
                    }
                }

                if (reTab.TabsSession && (temp.TabsSession || temp.manualSavedTabsSessionObjects)) {
                    temp.manualSavedTabsSession ? cache.TabsSession.manualSavedTabsSession = temp.manualSavedTabsSession.concat(cache.TabsSession.manualSavedTabsSession) : false

                    temp.manualSavedTabsSessionObjects ? mergeObject(cache.TabsSession.manualSavedTabsSessionObjects, temp.manualSavedTabsSessionObjects, {
                        ifNewRandomKeyWithSameKey: true,
                        RandomKeyFunction: newTabsSessionId
                    }) : false
                } else if (reTab.TabsSession && !temp.TabsSession) {
                    temp.TabsSession = reTab.TabsSession
                }
                let sure = confirm("All Selected Settings Will Be Overwrited ! ")
                if (!sure) {
                    resultEle.parentNode.removeChild(resultEle)
                    clearInterval(cache.importInterTimer)
                    return
                }
                setStore(settings).then(function (re) {
                    fakeClick(document.getElementById('PicSettings'));
                    showMsgInfo('Import Settings Successful', 5000);
                    resultEle.parentNode.removeChild(resultEle)
                });
                clearInterval(cache.importInterTimer)
            } else if (cache.msgCheck.close) {
                clearInterval(cache.importInterTimer)
            }
        }, 1000)
    })

}


function ifPinPicInSitesFunc() {
    if (this.checked) {
        setStore({
            ifPinPicInSites: true
        });
    } else {
        setStore({
            ifPinPicInSites: false
        });
    }
}

function clearConfigTextareaFunc() {


    let type = document.getElementById('config_textarea').getAttribute('data-config');



    if (!window.confirm("Sure   To   Clear   " + type + "  ? ")) {
        return;
    }


    if (type == 'config_picture_path') {
        document.getElementById('config_textarea').value = "";
        cache.pictureOnlySavedPathName = null;
        cache.picturePathsLength = null;
        cache.pages = null;
        cache.currentPages = null;

        document.getElementById("allPicturePage").innerText = 0;
        document.getElementById("currentPicturePage").value = 1;

        document.getElementById("textareaSearch").setAttribute("placeholder", "Search In All " + 0 + " Pictures");

        pictureOnlySavedPathName = [];
        setStore({
            pictureOnlySavedPathName: pictureOnlySavedPathName
        })
    } else if (type == 'pinSpecifyPictureInSomeSites') {
        document.getElementById('config_textarea').value = "";
        setStore({
            pinPicInSites: {},
            pinPicInSitesBase64: {},
            ifPinPicInSites: false
        });
    } else if (type == 'showLogs') {
        document.getElementById('config_textarea').value = "";
        setStore({
            errorLogArray: []
        });
    } else if (type == "showPicturesThatNotExists") {
        document.getElementById('config_textarea').value = "";
        setStore({
            picturesThatNotExists: []
        });
    }

}

function pageNumFunc() {

    let id = this.id;
    if (id == 'previousPicturePage') {
        let cp = cache.currentPages;
        if (cp != 1) {
            cp = cp - 1;
            let startIndex = cp * 5000 - 5000;
            let endIndex = cp * 5000 - 1;
            let cc = cache.pictureOnlySavedPathName.slice(startIndex, endIndex + 1)
            let input = null;
            for (let ele of cc) {
                if (input == null) {
                    input = ele;
                } else {
                    input = input + '\n' + ele;
                }
            }
            document.getElementById('config_textarea').value = input;
            document.getElementById("currentPicturePage").value = cp;
            cache.currentPages = Number(cp);
        }
    } else if (id == "nextPicturePage") {
        let cp = cache.currentPages;
        if (cp != cache.pages) {
            cp = cp + 1;
            let startIndex = cp * 5000 - 5000;
            let endIndex = cp == cache.pages ? (cache.picturePathsLength - 1) : (cp * 5000 - 1);
            let cc = cache.pictureOnlySavedPathName.slice(startIndex, endIndex + 1)
            let input = null;
            for (let ele of cc) {
                if (input == null) {
                    input = ele;
                } else {
                    input = input + '\n' + ele;
                }
            }
            document.getElementById('config_textarea').value = input;
            document.getElementById("currentPicturePage").value = cp;
            cache.currentPages = Number(cp);
        }
    } else if (id == 'allPicturePage') {
        let cp = cache.pages;
        let startIndex = cp * 5000 - 5000;
        let endIndex = cache.picturePathsLength - 1;
        let cc = cache.pictureOnlySavedPathName.slice(startIndex, endIndex + 1)
        let input = null;
        for (let ele of cc) {
            if (input == null) {
                input = ele;
            } else {
                input = input + '\n' + ele;
            }
        }
        document.getElementById('config_textarea').value = input;
        document.getElementById("currentPicturePage").value = cp;
        cache.currentPages = Number(cp);
    } else if (id == 'currentPicturePage') {
        let cp = this.value < cache.pages ? (this.value > 0 ? this.value : 0) : cache.pages;
        if (cp == cache.currentPages) {
            return;
        }
        let startIndex = cp * 5000 - 5000;
        let endIndex = cp == cache.pages ? (cache.picturePathsLength - 1) : (cp * 5000 - 1);
        let cc = cache.pictureOnlySavedPathName.slice(startIndex, endIndex + 1)
        let input = null;
        for (let ele of cc) {
            if (input == null) {
                input = ele;
            } else {
                input = input + '\n' + ele;
            }
        }
        document.getElementById('config_textarea').value = input;
        document.getElementById("currentPicturePage").value = cp;
        cache.currentPages = Number(cp);
    }
}

function saveConfigTextareaFunc_picture_path() {

    let paths = document.getElementById('config_textarea').value.split('\n');

    if (paths.length == 0 || paths[0] == '') {
        showMsgInfo('no empty to save  !!!', 7000);
        return;
    }

    if (cache.pages != null && cache.pages != undefined && cache.pages != 1) {
        if (cache.currentPages != cache.pages) {
            let startIndex = cache.currentPages * 5000 - 5000;
            let endIndex = cache.currentPages * 5000 - 1;

            if (startIndex == 0) {
                let ac = cache.pictureOnlySavedPathName.slice(endIndex + 1, cache.picturePathsLength);
                cache.pictureOnlySavedPathName = paths.concat(ac);

                paths = cache.pictureOnlySavedPathName;
            } else {
                let aa = cache.pictureOnlySavedPathName.slice(0, startIndex);
                let ac = cache.pictureOnlySavedPathName.slice(endIndex + 1, cache.picturePathsLength);
                cache.pictureOnlySavedPathName = aa.concat(paths).concat(ac);

                paths = cache.pictureOnlySavedPathName;
            }

        } else {
            let endIndex = (cache.currentPages - 1) * 5000 - 1;

            let aa = cache.pictureOnlySavedPathName.slice(0, endIndex + 1);
            cache.pictureOnlySavedPathName = aa.concat(paths);
            paths = cache.pictureOnlySavedPathName;

        }
    }
    let pathsNumber = paths.length;

    setStore({
        picturePathsNumber: pathsNumber,
        pictureOnlySavedPathName: paths
    }, {
        callback: loadPicturesCategoriesToCache(cache, {
            newSave: true,
            pictureOnlySavedPathName: paths
        })
    });
    //chrome.runtime.sendMessage({  info: 'cacheCSS',setting:'pictureOnlySavedPathName'  });
    //msgToBackground({  info: 'cacheCSS',setting:'pictureOnlySavedPathName'  });
    document.getElementById('config_textarea_div').classList.add('hide');

    cache.pictureOnlySavedPathName = null;

    clearIntervalTextareaSearchTimer(textareaSearchTimer);
}

function saveConfigTextareaFunc_config_css() {
    let content = document.getElementById('config_textarea').value;

    content = "" + content;
    if (!cache.cssBackgroundPlace.test(content)) {
        showMsgInfo("This Is Needed In CSS:  url(\"\") ", 30000);
        return;
    }
    if (content == null || content == '') {
        showMsgInfo('no empty to save  !!!', 7000);
        return;
    }

    setStore({
        config_css: content,
        config_default_css_first: false,
        useDefaultCSS: false
    });
    //chrome.runtime.sendMessage({  info: 'cacheCSS',setting:'config_css'  });
    //msgToBackground({  info: 'cacheCSS',setting:'config_css'  });
    document.getElementById('config_textarea_div').classList.add('hide');


    clearIntervalTextareaSearchTimer(textareaSearchTimer);
}

function saveConfigTextareaFunc_css_match_sites() {
    try {
        let content = document.getElementById('config_textarea').value.trim();
        content = "" + content;
        if (content == null || content == '') {
            showMsgInfo('no empty to save  !!!', 7000);
            return;
        }
        let regexp = new RegExp(content);
        eval(regexp);

        setStore({
            config_css_match_sites: content
        });
        document.getElementById('config_textarea_div').classList.add('hide');
        clearIntervalTextareaSearchTimer(textareaSearchTimer);

    } catch (e) {
        showMsgInfo('Error : ' + e, 60000);
        return
    }
}

function saveConfigTextareaFunc_blockItems() {

    let configTextarea = document.getElementById('config_textarea');

    let configTextareaValue = configTextarea.value.trim().split('\n');

    //let advance = {};
    let itemsToSave = {};
    let configTextareaValueLong = 0;
    for (let ps = 0; ps < configTextareaValue.length; ps++) {

        if (configTextareaValue[ps].trim().search(/blockTrackerAndAdOptions\:\:/) == 0) {
            configTextareaValueLong++;


            let vT = configTextareaValue[ps].trim().split("\:\:")[1];

            try {
                let blockTrackerAndAdOptionsJson = JSON.parse(vT);
                let toSaveKeys = Object.keys(blockTrackerAndAdOptionsJson);

                let ifSave = true;
                for (key in cache.blockItems.keys) {
                    if (!toSaveKeys.includes(cache.blockItems.keys[key])) {
                        ifSave = false;
                    }
                }

                if (ifSave && toSaveKeys.length == cache.blockItems.blockTrackerAndAdOptionsLong) {
                    itemsToSave.blockTrackerAndAdOptions = blockTrackerAndAdOptionsJson
                } else {
                    showMsgInfo('error item in blockTrackerAndAdOptions ', 16000);
                    return;
                }
            } catch (e) {
                showMsgInfo('wrong   in  blockTrackerAndAdOptions \n' + e, 15000);
                return;
            }

        } else if (configTextareaValue[ps].trim().search(/blockScriptOptions\:\:/) == 0) {
            configTextareaValueLong++;

            let vT = configTextareaValue[ps].trim().split("\:\:")[1];

            try {
                let blockScriptOptionsJson = JSON.parse(vT);
                let toSaveKeys = Object.keys(blockScriptOptionsJson);

                let ifSave = true;
                for (key in cache.blockScriptOptions.keys) {
                    if (!toSaveKeys.includes(cache.blockScriptOptions.keys[key])) {
                        ifSave = false;
                    }
                }

                if (ifSave && toSaveKeys.length == cache.blockScriptOptions.blockScriptOptionsLong) {
                    itemsToSave.blockScriptOptions = blockScriptOptionsJson
                } else {
                    showMsgInfo('error item in blockScriptOptions ', 16000);
                    return;
                }
            } catch (e) {
                showMsgInfo('wrong   in  blockScriptOptions \n' + e, 15000);
                return;
            }

        } else if (configTextareaValue[ps].trim().search(/blockTrackerUrl\:\:/) == 0) {
            configTextareaValueLong++;

            let vT = configTextareaValue[ps].trim().split("\:\:")[1];

            try {
                let blockTrackerUrlJson = JSON.parse(vT);
                itemsToSave.blockTrackerUrl = blockTrackerUrlJson
            } catch (e) {
                showMsgInfo('wrong   in  blockTrackerUrl \n' + e, 15000);
                return;
            }

        } else if (configTextareaValue[ps].trim().search(/blockAdSite\:\:/) == 0) {
            configTextareaValueLong++;
            let vT = configTextareaValue[ps].trim().split("\:\:")[1];

            try {
                let blockAdSiteJson = JSON.parse(vT);
                itemsToSave.blockAdSite = blockAdSiteJson
            } catch (e) {
                showMsgInfo('wrong   in  blockAdSite \n' + e, 15000);
                return;
            }

        }
    }
    if (configTextareaValueLong != cache.blockTrackerAndAdItemsLong) {
        showMsgInfo('something wrong setting items? occur  ! \n may close  and reopen it and rewrite', 30000);
        return;
    }
    setStore(itemsToSave);

    document.getElementById('config_textarea_div').classList.add('hide');
    msgToBackground({
        info: 'blockItemsSettingTakeEffect'
    });
    document.getElementById('importTrackerData').classList.add('hide');
    document.getElementById('editAdFilterRule').classList.add('hide');
}
/**
 * 
 * @param {object} options 
 * @returns {boolean}
 * @example  let checkItem=checkSaveConfigItems({checkItem:"otherOptions.intervalOpenSpecificURL",itemValue=otherOptions.intervalOpenSpecificURL})
 *           if(!checkItem){
                return
            }
 */
function checkSaveConfigItems({
    checkItem = null,
    itemValue = null
}) {
    let result = true
    if (checkItem == "otherOptions.background_Refresh_Notify_Task_Preferences_IntervalSecond") {
        if (itemValue > 600 || itemValue < 5) {
            showMsgInfo("otherOptions: background_Refresh_Notify_Task_Preferences_IntervalSecond must between [5,300]")
            result = false
        }
    }
    return result
}

function saveConfigTextareaFunc() {
    try {
        getStore(['hiddenValues']).then(function (re) {
            if (re.hiddenValues) {
                // to trigger Backup
                re.hiddenValues.notifyBackupSettings.previousBackupTime = (new Date("Mon Aug 11 2000")).getTime()
                setStore({
                    hiddenValues: re.hiddenValues
                })
            }
        })
        let type = document.getElementById('config_textarea').getAttribute('data-config');

        if (type == 'config_picture_path') {
            saveConfigTextareaFunc_picture_path()

        } else if (type == 'config_css') {

            saveConfigTextareaFunc_config_css()

        } else if (type == 'config_css_match_sites') {
            saveConfigTextareaFunc_css_match_sites()

        } else if (type == 'showPicturesThatNotExists') {
            let NotExists = document.getElementById('config_textarea').value;
            let paths = null;
            if (NotExists == '') {
                paths = [];
            } else {
                paths = NotExists.split('\n');
            }
            setStore({
                picturesThatNotExists: paths
            });
            document.getElementById('config_textarea_div').classList.add('hide');
            clearIntervalTextareaSearchTimer(textareaSearchTimer);

        } else if (type == 'showLogs') {
            let showLogs = document.getElementById('config_textarea').value;
            let paths = null;
            if (showLogs.trim() == '') {
                paths = [];
            } else {
                paths = showLogs.split('\n');
            }
            setStore({
                errorLogArray: paths
            });
            document.getElementById('config_textarea_div').classList.add('hide');
            clearIntervalTextareaSearchTimer(textareaSearchTimer);

        } else if (type == 'resizeCssPicture') {
            let configTextarea = document.getElementById('config_textarea');
            let resizeCssPicture = configTextarea.value.trim();

            if (!/^\d{4,}x\d{4,}\=(?:0|1|0\.\d{1,})$/.test(resizeCssPicture)) {
                configTextarea.value = '';
                return;
            }
            let resizeCssPictureArray = resizeCssPicture.split('=');
            let quality = resizeCssPictureArray[1];
            let resize = resizeCssPictureArray[0].split('x');
            if (resize[0] < 1920 || resize[1] < 1080) {
                configTextarea.value = '';
                return;
            }
            setStore({
                resizeCssPicture: {
                    width: resize[0],
                    height: resize[1],
                    quality: Number(quality)
                }
            });
            document.getElementById('config_textarea_div').classList.add('hide');
            clearIntervalTextareaSearchTimer(textareaSearchTimer);

        } else if (type == 'pinSpecifyPictureInSomeSites') {
            config_save_pinSpecifyPictureInSomeSites()

        } else if (type == 'blockItems') {
            saveConfigTextareaFunc_blockItems()
        } else if (type == 'advance') {
            saveConfigTextareaFunc_advance(this)
        }
        //////////////////

    } catch (e) {
        showMsgInfo('wrong   in  config \n' + e, 15000);
        return;
    }
}
/**
 * 
 * @param {Element} element 
 */
function saveConfigTextareaFunc_advance(element) {

    let configTextarea = document.getElementById('config_textarea');

    let configTextareaValue = configTextarea.value.trim().split('\n');

    //let advance = {};
    let itemsToSave = {};
    let configTextareaValueLong = 0;
    for (let ps = 0; ps < configTextareaValue.length; ps++) {

        if (configTextareaValue[ps].trim().search(/IntervalShowPicInNewTab\:\:/) == 0) {
            configTextareaValueLong++;
            let regT = /^IntervalShowPicInNewTab\:\:([0-9]*)[\=]{2}([A-Za-z\\\/].*\;)$/;

            if (regT.test(configTextareaValue[ps].trim())) {
                let timesT = Number(RegExp.$1);
                let pathsT = RegExp.$2;

                let pathsArray = null;
                if (pathsT != 'null;') {
                    pathsArray = pathsT.split(";");
                    pathsArray = pathsArray.slice(0, pathsArray.length - 1);

                    for (let pInAyT of pathsArray) {
                        if (!checkExists(dealPath(pInAyT))) {
                            showMsgInfo('IntervalShowPicInNewTab Error :  Some Pictures Not Exist ', 60000);
                            return;
                        }
                    }
                }
                let IntervalShowPicInNewTab = {
                    times: timesT,
                    paths: pathsArray
                };

                itemsToSave.IntervalShowPicInNewTab = IntervalShowPicInNewTab
            } else {
                showMsgInfo('input not accord with format in IntervalShowPicInNewTab ', 60000);
                return;
            }
        } else if (configTextareaValue[ps].trim().search(/IntervalShowPicInCSS\:\:/) == 0) {
            configTextareaValueLong++;
            let regT = /^IntervalShowPicInCSS\:\:([0-9]*)[\=]{2}([A-Za-z\\\/].*\;)$/;

            if (regT.test(configTextareaValue[ps].trim())) {
                let timesT = Number(RegExp.$1);
                let pathsT = RegExp.$2;

                let pathsArray = null;
                if (pathsT != 'null;') {
                    pathsArray = pathsT.split(";");
                    pathsArray = pathsArray.slice(0, pathsArray.length - 1);

                    for (let pInAyT of pathsArray) {
                        if (!checkExists(dealPath(pInAyT))) {
                            showMsgInfo('IntervalShowPicInNewTab Error :  Some Pictures Not Exist ', 60000);
                            return;
                        }
                    }
                }
                let IntervalShowPicInCSS = {
                    times: timesT,
                    paths: pathsArray
                };
                itemsToSave.IntervalShowPicInCSS = IntervalShowPicInCSS

            } else {
                showMsgInfo('input not accord with format in IntervalShowPicInCSS ', 16000);
                return;
            }
        } else if (configTextareaValue[ps].trim().search(/DecoratePluginsUrlRegex\:\:/) == 0) {
            configTextareaValueLong++;
            try {
                let regT = configTextareaValue[ps].trim().split("\:\:")[1];
                if (regT != 'null' && regT != '' && regT != null) {

                    let regexp = new RegExp(regT);
                    eval(regexp);
                } else {
                    regT = null;
                }
                itemsToSave.DecoratePluginsUrlRegex = regT

            } catch (e) {
                showMsgInfo('wrong regex string in DecoratePluginsUrlRegex: \n' + e, 30000);
                return;
            }

        } else if (configTextareaValue[ps].trim().search(/ClockInCSS\:\:/) == 0) {
            configTextareaValueLong++;
            let vT = configTextareaValue[ps].trim().split("\:\:")[1];
            if (vT == 'true' || vT == 'false') {
                itemsToSave.ClockInCSS = vT == 'true' ? true : false
            } else {
                showMsgInfo('error in ClockInCSS , Input:true / false ', 16000);
                return;
            }
        } else if (configTextareaValue[ps].trim().search(/ClockInNewTab\:\:/) == 0) {
            configTextareaValueLong++;
            let vT = configTextareaValue[ps].trim().split("\:\:")[1];
            if (vT == 'true' || vT == 'false') {
                itemsToSave.ClockInNewTab = vT == 'true' ? true : false
            } else {
                showMsgInfo('error  in ClockInNewTab , Input :true / false', 16000);
                return;
            }
        } else if (configTextareaValue[ps].trim().search(/remindTime\:\:/) == 0) {
            configTextareaValueLong++;

            let vT = configTextareaValue[ps].trim().split("\:\:")[1];

            try {
                vT = toDoubleOblique(vT);
                let remindTimeJson = JSON.parse(vT);
                if (remindTimeJson.ringtone == 'default' || checkExists(dealPath(remindTimeJson.ringtone))) {
                    itemsToSave.remindTime = remindTimeJson
                } else {
                    showMsgInfo('error  in remindTime , remindTime file not find', 16000);
                    return;
                }
            } catch (e) {
                showMsgInfo('wrong   in  remindTime \n' + e, 15000);
                return;
            }
        } else if (configTextareaValue[ps].trim().search(/picturesCategories\:\:/) == 0) {
            configTextareaValueLong++;

            let vT = configTextareaValue[ps].trim().split("\:\:")[1];

            try {
                itemsToSave.picturesCategories = JSON.parse(vT)
            } catch (e) {
                showMsgInfo('wrong   in  picturesCategories \n' + e, 15000);
                return;
            }
        } else if (configTextareaValue[ps].trim().search(/UserAgentOptions\:\:/) == 0) {
            configTextareaValueLong++;

            let vT = configTextareaValue[ps].trim().split("\:\:")[1];

            try {

                vT = toDoubleOblique(vT);
                let UserAgentOptions = JSON.parse(vT);

                if (!UserAgentOptions.UserAgent) {
                    showMsgInfo('wrong   in  UserAgentOptions : UserAgent cannot be deleted\n', 15000);
                    return;
                }
                let needUA = ["chromeMac", "chromeIphone", "chromeIpad", "safariMac", "KW"];
                for (let ag of needUA) {
                    if (!UserAgentOptions.UserAgents.includes(ag)) {
                        showMsgInfo('wrong   in  UserAgentOptions :  those cannot be delete in UserAgents : \"chromeMac\",\"chromeIphone\",\"chromeIpad\",\"safariMac\",\"KW\" \n', 15000);
                        return;
                    }
                }

                if (!UserAgentOptions.UserAgents.includes(UserAgentOptions.UserAgent)) {
                    showMsgInfo('wrong   in  UserAgentOptions:  UserAgent ' + UserAgentOptions.UserAgent + "  not included in UserAgents", 15000);
                    return;
                }
                for (let ag in UserAgentOptions) {
                    if (ag == "UserAgent" || ag == "UserAgents") continue;
                    if (!UserAgentOptions.UserAgents.includes(ag)) {
                        showMsgInfo('wrong   in  UserAgentOptions: ' + ag + "  not included in UserAgents", 15000);
                        return;
                    }
                }
                for (let ag in cache.UserAgentOptionsCacheInSaveAdvance) {
                    if (ag == "UserAgent" || ag == "UserAgents") continue;
                    UserAgentOptions[ag] = cache.UserAgentOptionsCacheInSaveAdvance[ag];
                }
                for (let ag in UserAgentOptions) {
                    if (ag == "UserAgent" || ag == "UserAgents") continue;
                    if (!UserAgentOptions.UserAgents.includes(ag)) {
                        delete UserAgentOptions[ag];
                    }
                }
                for (let ag of UserAgentOptions.UserAgents) {
                    if (!UserAgentOptions[ag]) {
                        showMsgInfo('wrong   in  UserAgentOptions: customAgent  ' + ag + "  not exist ", 15000);
                        return;
                    }
                }
                cache.UserAgentOptionsCacheInSaveAdvance;
                itemsToSave.UserAgentOptions = UserAgentOptions
            } catch (e) {
                showMsgInfo('wrong   in  UserAgentOptions \n' + e, 15000);
                return;
            }
        } else if (configTextareaValue[ps].trim().search(/inPageSearchOptions\:\:/) == 0) {
            configTextareaValueLong++;

            let vT = configTextareaValue[ps].trim().split("\:\:")[1];

            try {
                itemsToSave.inPageSearchOptions = JSON.parse(vT)
            } catch (e) {
                showMsgInfo('wrong   in  inPageSearchOptions \n' + e, 15000);
                return;
            }
        } else if (configTextareaValue[ps].trim().search(/recentlyUsedPicturesOpt\:\:/) == 0) {
            configTextareaValueLong++;

            let vT = configTextareaValue[ps].trim().split("\:\:")[1];

            try {
                itemsToSave.recentlyUsedPicturesOpt = JSON.parse(vT)
            } catch (e) {
                showMsgInfo('wrong   in  recentlyUsedPicturesOpt \n' + e, 15000);
                return;
            }
        } else if (configTextareaValue[ps].trim().search(/saveFullHtmlOptions\:\:/) == 0) {
            configTextareaValueLong++;

            let vT = configTextareaValue[ps].trim().split("\:\:")[1];

            try {
                let saveFullHtmlOptions = JSON.parse(vT)
                if (Object.keys(saveFullHtmlOptions).length != cache.saveFullHtmlOptions.keys.length) {
                    showMsgInfo('wrong  options items number in  saveFullHtmlOptions \n', 15000);
                    return;
                }
                for (key in saveFullHtmlOptions) {
                    if (!cache.saveFullHtmlOptions.keys.includes(key)) {
                        showMsgInfo('wrong  options items in  saveFullHtmlOptions \n', 15000);
                        return;
                    }
                }
                itemsToSave.saveFullHtmlOptions = saveFullHtmlOptions
            } catch (e) {
                showMsgInfo('wrong   in  saveFullHtmlOptions \n' + e, 15000);
                return;
            }
        } else if (configTextareaValue[ps].trim().search(/otherOptions\:\:/) == 0) {
            configTextareaValueLong++;

            let vT = configTextareaValue[ps].trim().split("\:\:")[1];

            try {
                let otherOptions = JSON.parse(vT)
                let otherOptionsSaveKeys = Object.keys(otherOptions)
                let otherOptionsOriginKeys = Object.keys(cache.config.advance.otherOptions)
                for (key in otherOptionsOriginKeys) {
                    if (!otherOptionsSaveKeys.includes(otherOptionsOriginKeys[key])) {
                        showMsgInfo('wrong  options items in  otherOptions , close and reopen the advance setting\n', 15000);
                        return;
                    }
                }
                if (otherOptions.pickNextPictureInBackground != true && otherOptions.ConfigPicturesPathType_SavePictureBase64DataToBroswer == false) {
                    showMsgInfo("pickNextPictureInBackground must be true when ConfigPicturesPathType_SavePictureBase64DataToBroswer:false ")
                    return
                }
                let checkItem = checkSaveConfigItems({
                    checkItem: "otherOptions.background_Refresh_Notify_Task_Preferences_IntervalSecond",
                    itemValue: otherOptions.background_Refresh_Notify_Task_Preferences_IntervalSecond
                })
                if (!checkItem) {
                    return
                }
                itemsToSave.otherOptions = otherOptions
            } catch (e) {
                showMsgInfo('wrong   in  otherOptions \n' + e, 15000);
                return;
            }
        } else if (configTextareaValue[ps].trim().search(/ClockOptions\:\:/) == 0) {
            configTextareaValueLong++;

            let vT = configTextareaValue[ps].trim().split("\:\:")[1];

            try {
                itemsToSave.ClockOptions = JSON.parse(vT)
            } catch (e) {
                showMsgInfo('wrong   in ClockOptions \n' + e, 15000);
                return;
            }
        } else if (configTextareaValue[ps].trim().search(/bookmarksOptions\:\:/) == 0) {
            configTextareaValueLong++;

            let vT = configTextareaValue[ps].trim().split("\:\:")[1];

            try {
                itemsToSave.bookmarksOptions = JSON.parse(vT)
            } catch (e) {
                showMsgInfo('wrong   in bookmarksOptions \n' + e, 15000);
                return;
            }
        }

        /////////////////
    }
    if (configTextareaValueLong != cache.advanceItemsLong) {
        showMsgInfo('some setting items lost  ! \n may close Advance and reopen it and rewrite', 30000);
        return;
    }
    loadPicturesCategoriesToCache(cache, {
        picturesCategories: itemsToSave.picturesCategories,
        callback: function () {
            delete itemsToSave['picturesCategories'];
            setStore(itemsToSave).then(function (re) {
                msgToBackground({
                    info: 'advanceSettingTakeEffect'
                });
            })
        }
    })
    document.getElementById('config_textarea_div').classList.add('hide');
}
let textareaSearchTimer = null;
let textareaSearchFunc = function (element) {
    document.getElementById('textareaSearch').value = '';
    document.getElementById('textareaSearchResult').innerHTML = "";
    //let reg=/^[A-Za-z]{1,2}\:\\.*\.[A-Za-z]{2,5}$/;
    let reg = /^.*\.[A-Za-z]{2,5}$/;
    if (cache.pictureOnlySavedPathName == null) {
        cache.pictureOnlySavedPathName = document.getElementById('config_textarea').value.split('\n');
    }


    let textareaSearchB = null;
    textareaSearchTimer = setInterval(function () {
        let textareaSearchBox = document.getElementById('textareaSearch');
        let textareaSearch = textareaSearchBox.value.trim();

        if (textareaSearch != null && textareaSearch != '' && textareaSearch != textareaSearchB && textareaSearch.length > 1 && textareaSearch != undefined) {
            textareaSearchB = textareaSearch;
            document.getElementById('textareaSearchResult').classList.remove('hide');
            let searchPiClasBefore = document.querySelectorAll('.searchPiClas');
            searchPiClasBefore.forEach(function (elem) {
                elem.onclick = ''

            });
            searchPiClasBefore = null;
            document.getElementById('textareaSearchResult').innerHTML = "";

            let replaceREG = ['\\', '(', ')', '-', '_', '+', '?', '[', ']', '=', '^', '$', '*', '{', '}', '|'];
            for (let i = 0; i < replaceREG.length; i++) {
                textareaSearch = textareaSearch.replace(eval('/\\' + replaceREG[i] + '/g'), '\\' + replaceREG[i]);
            }
            let textareaSearchREG = textareaSearch;

            let regE = eval('/^.*' + textareaSearchREG + '.*/i');

            let addNode = document.getElementById('textareaSearchResult');

            let textnodes = [];

            for (let i = 0; i < cache.pictureOnlySavedPathName.length; i++) {

                if (regE.test(cache.pictureOnlySavedPathName[i])) {

                    let textnode = document.createTextNode(cache.pictureOnlySavedPathName[i]);
                    textnodes.push(textnode);

                }
            }
            let textnodeInfo = document.createTextNode("Results Number: " + textnodes.length);
            let htmlNodeInfo = document.createElement('p');
            htmlNodeInfo.id = "searchPictureResNum";
            addNode.appendChild(htmlNodeInfo).appendChild(textnodeInfo);
            for (let i = 0; i < textnodes.length; i++) {

                let preNode = document.createElement('pre');
                let pNode = document.createElement('p');

                pNode.setAttribute("class", "zeroMargin");

                let buttonNode1 = document.createElement('button');
                let buttonNode2 = document.createElement('button');
                let buttonNode3 = document.createElement('button');

                buttonNode1.setAttribute("class", "searchPiClas");
                buttonNode2.setAttribute("class", "searchPiClas");
                buttonNode3.setAttribute("class", "searchPiClas");

                buttonNode1.classList.add("pointer");
                buttonNode2.classList.add("pointer");
                buttonNode3.classList.add("pointer");

                buttonNode1.setAttribute("data-set", "SetToNewTab");
                buttonNode2.setAttribute("data-set", "SetToCSS");
                buttonNode3.setAttribute("data-set", "SetToBoth");

                let buttonText1 = document.createTextNode('SetToNewTab');
                let buttonText2 = document.createTextNode('SetToCSS');
                let buttonText3 = document.createTextNode('SetToBoth');

                addNode.appendChild(pNode).appendChild(preNode).appendChild(textnodes[i]);
                addNode.appendChild(pNode).appendChild(buttonNode1).appendChild(buttonText1);
                addNode.appendChild(pNode).appendChild(buttonNode2).appendChild(buttonText2);
                addNode.appendChild(pNode).appendChild(buttonNode3).appendChild(buttonText3);

            }
            let searchPiClas = document.querySelectorAll('.searchPiClas');
            searchPiClas.forEach(function (elem) {
                elem.onclick = function SetAsLandscapeInSearch() {
                    let pathT = this.parentNode.innerText;

                    let dataSet = this.getAttribute('data-set');


                    if (dataSet == 'SetToNewTab') {
                        pathT = pathT.replace(/SetToNewTabSetToCSSSetToBoth$/, '');

                        let pathTD = dealPath(pathT);
                        pathTD = pathTD.trim();
                        if (checkExists(pathTD)) {
                            setStore({
                                currentPicture: pathTD,
                                pinNewTabPicture: pathTD,
                                pinThisPictureInNewTab: true
                            });
                        } else {
                            let ctvIndex = cache.pictureOnlySavedPathName.indexOf(pathT);
                            cache.pictureOnlySavedPathName.splice(ctvIndex, 1);
                            getStore(['picturesThatNotExists']).then(function (result) {
                                result.picturesThatNotExists.push(pathT);
                                setStore({
                                    picturesThatNotExists: result.picturesThatNotExists,
                                    pictureOnlySavedPathName: cache.pictureOnlySavedPathName
                                });

                            });
                            this.parentNode.remove();
                            showMsgInfo("This Is Not Exists : " + pathT);
                            textnodes.length = textnodes.length - 1;
                            document.getElementById("searchPictureResNum").innerText = "Results Number: " + textnodes.length;

                        }
                    } else if (dataSet == 'SetToCSS') {
                        pathT = pathT.replace(/SetToNewTabSetToCSSSetToBoth$/, '');

                        let pathTD = dealPath(pathT);
                        pathTD = pathTD.trim();
                        if (checkExists(pathTD)) {
                            msgToBackground({
                                picturePath: pathTD,
                                info: 'getPictureBase64',
                                PictureBase64Name: 'PictureAsCssEternalBase64'
                            });
                            setStore({
                                setPictureAsCssEternal: true,
                                PictureAsCssEternal: pathTD,
                                ifPictureBackground: true
                            });
                        } else {
                            let ctvIndex = cache.pictureOnlySavedPathName.indexOf(pathT);
                            cache.pictureOnlySavedPathName.splice(ctvIndex, 1);
                            getStore(['picturesThatNotExists']).then(function (result) {
                                result.picturesThatNotExists.push(pathT);
                                setStore({
                                    picturesThatNotExists: result.picturesThatNotExists,
                                    pictureOnlySavedPathName: cache.pictureOnlySavedPathName
                                });
                            });
                            this.parentNode.remove();
                            showMsgInfo("This Is Not Exists : " + pathT);
                            textnodes.length = textnodes.length - 1;
                            document.getElementById("searchPictureResNum").innerText = "Results Number: " + textnodes.length;
                        }
                    } else if (dataSet == 'SetToBoth') {
                        pathT = pathT.replace(/SetToNewTabSetToCSSSetToBoth$/, '');

                        let pathTD = dealPath(pathT);
                        pathTD = pathTD.trim();
                        if (checkExists(pathTD)) {
                            msgToBackground({
                                picturePath: pathTD,
                                info: 'getPictureBase64',
                                PictureBase64Name: 'PictureAsCssEternalBase64'
                            });
                            setStore({
                                setPictureAsCssEternal: true,
                                PictureAsCssEternal: pathTD,
                                currentPicture: pathTD,
                                pinNewTabPicture: pathTD,
                                pinThisPictureInNewTab: true,
                                ifPictureBackground: true
                            });
                        } else {
                            let ctvIndex = cache.pictureOnlySavedPathName.indexOf(pathT);
                            cache.pictureOnlySavedPathName.splice(ctvIndex, 1);
                            getStore(['picturesThatNotExists']).then(function (result) {
                                result.picturesThatNotExists.push(pathT);
                                setStore({
                                    picturesThatNotExists: result.picturesThatNotExists,
                                    pictureOnlySavedPathName: cache.pictureOnlySavedPathName
                                });
                            });
                            this.parentNode.remove();
                            showMsgInfo("This Is Not Exists : " + pathT);
                            textnodes.length = textnodes.length - 1;
                            document.getElementById("searchPictureResNum").innerText = "Results Number: " + textnodes.length;
                        }
                    }
                };


            });
        }

    }, 500);

    // clearInterval(textareaSearchTimer);
}

function clearIntervalTextareaSearchTimer(timer) {
    clearInterval(timer);
    document.getElementById('textareaSearchResult').classList.add('hide');

}

function closeButtonFunc() {
    let closeId = this.getAttribute('data-closeId');
    let type = document.getElementById('config_textarea').getAttribute('data-config');

    document.getElementById(closeId).classList.add('hide');
    if (closeId == 'config_textarea_div') {
        cache.pictureOnlySavedPathName = null;
        clearIntervalTextareaSearchTimer(textareaSearchTimer);
    } else if (closeId == 'NewTabSetting') {
        clearIntervalTextareaSearchTimer(textareaSearchTimer);
        config_picture_save_base64_data_close()
        document.getElementById('config_textarea_div').classList.add('hide');

    }
    if (type == 'pinSpecifyPictureInSomeSites') {
        document.getElementById('ifPinPicInSites').classList.add('hide');
        document.getElementById('ifPinPicInSitesLabel').classList.add('hide');
    }
    if (type == 'blockItems') {
        document.getElementById('importTrackerData').classList.add('hide');
        document.getElementById('editAdFilterRule').classList.add('hide');
    }



    if (pageNum != null) {
        pageNum.forEach(function (elem) {
            elem.onclick = null;
        });

        pageNum = null;
    }
    cache.pictureOnlySavedPathName = null;
    cache.picturePathsLength = null;
    cache.pages = null;
    cache.currentPages = null;


}

/**
 * 
 */
function saveIntervalTimeToChangeFunc() {
    let intervalTime = document.getElementById('interval_time_to_change').value;

    if (!/^[0123456789]+$/ig.test(intervalTime)) {
        showMsgInfo('only number ! input one number at least !!!', 17000);
        return;
    }
    setStore({
        intervalTime: intervalTime
    });

}


/**
 * 
 * @param {Array} arr
 * @summary use cache:  cache.msgCheck.msgCheckboxElements ,that is Array
 * @field {boolean} cache.msgCheck.confirm
 * @returns {Element} resultEle
 */
function createCheckboxElements(arr) {

    if (cache) {
        cache.msgCheck = {
            msgCheckboxElements: [],
            confirm: false,
            close: false
        }
    } else {
        cache = {
            msgCheck: {
                msgCheckboxElements: [],
                confirm: false,
                close: false
            }
        }
    }

    let div = document.createElement('div')

    let dl = document.createElement('dl')
    let dtm = document.createElement('dt')
    dtm.className = 'cc-nowrap font-green-dark'

    let btn1 = document.createElement('button')
    //let btn2=document.createElement('button')
    //let btn3=document.createElement('button') 

    btn1.className = 'pointer  cc-circle-30  configButton transparent font-green-dark'
    // btn2.className='pointer  cc-circle-30  configButton transparent font-green-dark'
    // btn3.className='pointer  cc-circle-30  configButton transparent font-green-dark'

    btn1.innerHTML = '<b>Confirm Import</b>'
    btn1.onclick = function () {

        cache.msgCheck.confirm = true
    }

    dtm.appendChild(btn1)
    dl.appendChild(dtm)

    for (i = 0; i < arr.length; i++) {
        let dt = document.createElement('dt')
        dt.className = 'cc-nowrap font-green-dark'
        let tempID = UUID(36, 34)
        let input = document.createElement('input')
        input.id = tempID
        input.type = 'checkbox'
        input.className = 'pointer  configButton cc-circle-checkbox'
        input.checked = true
        input.setAttribute('data-item', arr[i])

        let label = document.createElement('label')
        label.setAttribute("for", tempID)
        label.className = 'pointer cc-label-for  cc-circle  font-green-dark'
        let b = document.createElement('b')
        b.innerText = arr[i]
        dt.appendChild(input)
        dt.appendChild(label).appendChild(b)

        dl.appendChild(dt)
        cache.msgCheck.msgCheckboxElements.push(input)

    }
    div.appendChild(dl)
    let resultEle = showMsgDivBox(div, function () {

        cache.msgCheck.close = true
    })
    return resultEle
}

function createHtmlInConfigPicturePath(fileName, PictureBase64) {
    let dt = createElement("dt");
    dt.className = "cc-marginHeight-small-10 cc-nowrap";

    let img = createElement("img");
    img.className = "cc-vertical-align-center";
    img.width = "80";
    img.src = PictureBase64;


    let name = createElement("pre");
    name.className = "  cc-oneline";
    let nameTxt = createTextNode(" ");

    let name2 = createElement("pre");
    name2.className = "font-white-red cc-oneline";
    let name2Txt = createTextNode(fileName); /////     fileName

    let name3 = createElement("pre");
    name3.className = "  cc-oneline";
    let name3Txt = createTextNode("      ");

    let buttonNode1 = document.createElement('button');
    buttonNode1.className = "pointer  cc-circle-30 cc-oneline cc-background-dark-8 font-white-red  ";
    let buttonText1 = document.createTextNode('SetToNewTab');
    buttonNode1.onclick = function () {
        setStore({
            pinThisPictureInNewTab: true,
            pinNewTabPicture: fileName
        })
    }

    let buttonNode2 = document.createElement('button');
    buttonNode2.className = "pointer  cc-circle-30 cc-oneline cc-background-dark-8 font-white-red  ";
    let buttonText2 = document.createTextNode('SetToCSS');
    buttonNode2.onclick = function () {
        getStore(fileName).then(function (ob) {
            setStore({
                ifPictureBackground: true,
                setPictureAsCssEternal: true,
                PictureAsCssEternal: fileName,
                PictureAsCssEternalBase64: ob[fileName]
            })
        });
    }

    let buttonNode3 = document.createElement('button');
    buttonNode3.className = "pointer  cc-circle-30 cc-oneline cc-background-dark-8 font-white-red  ";
    let buttonText3 = document.createTextNode('SetToBoth');
    buttonNode3.onclick = function () {
        setStore({
            pinThisPictureInNewTab: true,
            pinNewTabPicture: fileName
        })
        getStore(fileName).then(function (ob) {
            setStore({
                ifPictureBackground: true,
                setPictureAsCssEternal: true,
                PictureAsCssEternal: fileName,
                PictureAsCssEternalBase64: ob[fileName]
            })
        });


    }

    let input = createElement("input");
    input.type = "checkbox";
    input.className = "pointer  configButton cc-circle-checkbox  ";


    dt.appendChild(img);
    dt.appendChild(input);
    dt.appendChild(name).appendChild(nameTxt);
    dt.appendChild(name2).appendChild(name2Txt);
    dt.appendChild(name3).appendChild(name3Txt);
    dt.appendChild(buttonNode1).appendChild(buttonText1);
    dt.appendChild(buttonNode2).appendChild(buttonText2);
    dt.appendChild(buttonNode3).appendChild(buttonText3);


    return dt;
};

/**
 * 
 * @param {boolean} globalParam  use  one  global Param
 */

function applyOnMessage(request, sender, sendResponse) {
    if (sender.url != undefined) {
        return;
    }
    if (typeof (request) == 'object') {
        return
    }


    if (request.trim() == 'ShowOrHideBookmarks') {
        if (DecoratePluginsCache.showBookmarks == false) {

            DecoratePluginsCache.bookmarks.showBookMarks();
            DecoratePluginsCache.showBookmarks = true;
        } else if (DecoratePluginsCache.showBookmarks == true) {
            DecoratePluginsCache.bookmarks.hideBookMarks();
            DecoratePluginsCache.showBookmarks = false;
        }
    } else if (request.trim() == 'disableClockInCSSOnly' && document.getElementById('clockWidgetId') != null) { // 
        if (DecoratePluginsCache.clockWidget != null) {

            DecoratePluginsCache.clockWidget.stop();
            DecoratePluginsCache.clockWidget = null;
        }
        let clockWidgetEle = document.getElementById('clockWidgetId');
        clockWidgetEle.parentNode.removeChild(clockWidgetEle);
        clockWidgetEle = null;
    } else if (request.trim() == 'enableClockInCSSOnly' && document.getElementById('clockWidgetId') == null) {
        DecoratePluginsCache.clockWidget = new ClockWidget();
    }
}








function usageTipsNotifyShow(showTime) {
    showMsgInfo(" \n \"Use Default CSS Config\" : check in popup menu   ", showTime)
    showMsgInfo(" \n \"Options panel\" : Click The Flower Icon On Right Top Corner   ", showTime)
    showMsgInfo("\n \"ifBlockTracker\":true ,  This Can Be Set In: Options panel > \"Block  Items\" > \"blockTrackerAndAdOptions::\" ", showTime)
    showMsgInfo("\n  Block Script Settings:  Options panel > \"Block  Items\" > \"blockScriptOptions::\" ", showTime)
    showMsgInfo("\n  Each O'Clock Notify On Desktop :  Options panel > \"Advance\" > \"remindTime::\" ", showTime)

}


function usageTipsNotify() {
    cache.usageTips = {}
    let showTime = 3600000
    getStore('usageTips').then(function (re) {
        if (!re.usageTips) {
            usageTipsNotifyShow(showTime)
            cache.usageTips.ifBlockTracker = {
                notifyNum: 1,
                type: 'blockWebRequest'
            }
            cache.usageTips.remindTime = {
                notifyNum: 1,
                type: 'remindTime'
            }

            setStore({
                usageTips: cache.usageTips
            })
        } else {
            cache.usageTips = re.usageTips
            for (pp in cache.usageTips) {
                if (cache.usageTips[pp].type == 'blockWebRequest') {
                    if (cache.usageTips[pp].notifyNum < 2) {
                        usageTipsNotifyShow(showTime)
                        cache.usageTips[pp].notifyNum++
                    }
                } else {
                    if (cache.usageTips[pp].notifyNum < 2) {
                        showMsgInfo("\n Each O'Clock Notify On Desktop :  Options panel > \"Advance\" > \"remindTime::\" ", showTime)
                        cache.usageTips[pp].notifyNum++
                    }
                }
            }
            setStore({
                usageTips: cache.usageTips
            })
        }
    })
}




//   window.onunload=function(e){ console.log(e);};


window.addEventListener("beforeunload", function (e) {

    if (cache.blockLeave == true) {
        let confirmationMessage = "go on?";
        (e || window.event).returnValue = confirmationMessage; //Gecko + IE 
        return confirmationMessage; //Webkit, Safari, Chrome etc.
    }
});


function actionsAfterClickConfigButton() {

    let type = document.getElementById('config_textarea').getAttribute('data-config');
    if (type != null && type != undefined) {
        let clearConfigType = ["config_picture_path", "pinSpecifyPictureInSomeSites", "showLogs", "showPicturesThatNotExists"]

        if (clearConfigType.indexOf(type.trim()) >= 0) {
            document.getElementById("clearConfigTextarea").classList.remove("hide")
        } else {
            document.getElementById("clearConfigTextarea").classList.add("hide")

        }
    }

}


window.onload = function () {
    ///////////////////
    getStore(['otherOptions', 'ClockInNewTab', 'ClockOptions', 'chromeBookmarks', 'bookmarksOptions', 'TabsSession', 'hiddenValues']).then(function (re) {

        cache.TabsSession = re.TabsSession;

        cache.loadImageDataToMemoryIntervalMillisecondAvoidOccupyTooLargeMemory = re.otherOptions.loadImageDataToMemoryIntervalMillisecondAvoidOccupyTooLargeMemory
        if (re.ClockInNewTab == true) {
            DecoratePluginsCache.clockWidget = new ClockWidget(re.ClockOptions);
        };

        try {
            if (re.bookmarksOptions.showBookmarks) {
                re.bookmarksOptions.data = re.chromeBookmarks;
                DecoratePluginsCache.bookmarks = new ChromeBookmarks(re.bookmarksOptions);
                DecoratePluginsCache.showBookmarks = true;
            }
        } catch (e) {
            pushAndStoreErrorLogArray({
                error: e
            })
        }

        if (re.otherOptions.notify_SavedTabsSession_OnNewTab_Interval_Minutes == undefined) {
            re.otherOptions.notify_SavedTabsSession_OnNewTab_Interval_Minutes = 180
            setTimeout(function () {
                setStore({
                    otherOptions: re.otherOptions
                })
            }, 1500)
        }

        if (localStorage.previousNotifySavedTabsSessiontime == undefined || ((new Date()).getTime() - localStorage.previousNotifySavedTabsSessiontime) > 1000 * 60 * re.otherOptions.notify_SavedTabsSession_OnNewTab_Interval_Minutes) { // 
            localStorage.previousNotifySavedTabsSessiontime = (new Date()).getTime()
            NotifySavedTabsSession()
        }
        if (re.hiddenValues.notifyBackupSettings) {
            let nbs = re.hiddenValues.notifyBackupSettings
            if (((new Date()).getTime() - nbs.previousBackupTime) > 24 * 60 * 60 * 1000 * nbs.notifyBackupSettings_Interval_Days) {
                showMsgInfo("Notify : Backup Or Export Settings , Especially Contain Custom Functions", 120000, "line-height:66px")
                setStore({
                    hiddenValues: re.hiddenValues
                })
            }
        } else {
            showMsgInfo("Notify : Backup Or Export Settings , Especially Contain Custom Functions", 120000, "line-height:66px")
            re.hiddenValues.notifyBackupSettings = {
                previousBackupTime: (new Date()).getTime(),
                notifyBackupSettings_Interval_Days: 7
            }
            setStore({
                hiddenValues: re.hiddenValues
            })
        }

    })
    ////////////////  
    close = document.querySelectorAll('.cc-close');
    close.forEach(function (elem) {
        elem.onclick = closeButtonFunc;
    });
    saveConfigTextarea = document.querySelector('#save_config_textarea');
    saveConfigTextarea.onclick = saveConfigTextareaFunc;

    let clearConfigTextarea = document.querySelector('#clearConfigTextarea');
    clearConfigTextarea.onclick = clearConfigTextareaFunc;

    saveIntervalTimeToChange = document.querySelector('#save_interval_time_to_change');
    saveIntervalTimeToChange.onclick = saveIntervalTimeToChangeFunc;

    let PicSettings = document.querySelector('#PicSettings');
    PicSettings.onclick = PicSettingsFunc;
    let quickSetDiv = document.querySelector('#quickSetDiv');
    //let quickSetTimer=null;
    quickSetDiv.onmouseover = function () {

        document.querySelector('#quickSet').classList.remove("hide");
        document.querySelector('#nextPicture').onclick = function () {
            main();
        };
        document.querySelector('#prePicture').onclick = function () {
            getStore('previousPicture').then(function (object) {
                if (object.previousPicture == undefined) {
                    return
                } else {
                    setPicture(object.previousPicture, true);
                }
            });
        };

    };
    quickSetDiv.onmouseout = function () {
        document.querySelector('#quickSet').classList.add("hide");
    }

    let urlParam = parseURLGetParam(location.search);

    if (urlParam.id == 'NewTabSetting') {
        fakeClick(document.getElementById('PicSettings'));
        // document.getElementById('NewTabSetting').classList.remove('hide');
    }
    ///////////////////////////////////////////////////////////////////////////////
    chrome.runtime.onMessage.addListener(applyOnMessage);
    ///////////////////////////////////////////////////////////////////////////////
    usageTipsNotify()
    msgToBackground({
        info: 'taskFromNewTab'
    });
    ///////////////////////////////////////////////////////////////////////////////


    defaultCssFunction();

    //  
    configButton = document.querySelectorAll('.configButton'); //document.querySelector('.configButton');
    configButton.forEach(function (elem) {

        elem.onclick = configButtonFunc;
    });

    getStore(['csFunctions', 'csFunctionsDelayTime']).then((re) => {
        cache.csFunction = {
            csFunctions: re.csFunctions,
            csFunctionsDelayTime: re.csFunctionsDelayTime
        }
        customFunctions({
            NewTab_cache: cache
        })
    })


}