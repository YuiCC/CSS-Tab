let defaultPicture = '../image/default.jpg';


document.body.style.backgroundImage = "url(" + defaultPicture + ")";

let cache = {
    name: "TabsSession",
    TabsInfoEleCache: {},
    ifFilterChromeUrl: true,
    TabsSession: {
        manualSavedTabsSessionObjects: {}, // manualSavedTabsSessionObjects {id=>{id:'',name:'',tabs:'',time:long,type:''}}
        manualSavedTabsSession: [], // manualSavedTabsSession [ {id:'',name:'',tabs:'',time:long,type:''} ]
        previousTabsSession: []
    }
}

let BelowIsDataStruct = null;


let DecoratePluginsCache = {
    clockWidget: null
};



main();


/**
  the main function
*/
function main() {



    getStore(['pictureSavedAsBase64Name', 'pictureOnlySavedPathName', 'otherOptions', 'IntervalShowPicInNewTab', 'pinThisPictureInNewTab', 'pinNewTabPicture', 'oldSetPicTime', 'intervalTime', 'currentPicture', 'useCurrentPicture', 'setPictureAsCssEternal']).then((result) => {

        let date = new Date();
        let time = date.getTime();
        try {
            cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer = result.otherOptions.ConfigPicturesPathType_SavePictureBase64DataToBroswer
            let oldSetPicTime = result.oldSetPicTime;
            let intervalTime = result.intervalTime;
            let currentPicture = result.currentPicture;
            let IntervalShowPicInNewTab = result.IntervalShowPicInNewTab;

            if (result.pinThisPictureInNewTab) {
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
        }

    });
}




function setPicture(picturePath, ifBase64AndSave, picturePathSequence) {

    if (cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer == false) {
        setPictureFromPath(picturePath, ifBase64AndSave, picturePathSequence)
    } else {
        setPictureFromBase64Data(picturePath, ifBase64AndSave, picturePathSequence)
    }


};

function setPictureFromBase64Data(picturePath, ifBase64AndSave, picturePathSequence) {

    try {
        if (picturePath == null || picturePath == undefined || picturePath == "" || picturePath == defaultPicture) {

            document.body.style.backgroundImage = "url(\"" + defaultPicture + "\")";
            if (!picturePath == defaultPicture) {
                console.error('pictureName Not Exists In config: ' + picturePath);
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
        setStore({
            currentPicture: picturePath
        });
    } else { //             catch(e){
        document.body.style.backgroundImage = "url(" + defaultPicture + ")";
        msgToBackground({
            picturePath: picturePath,
            info: 'removePicturesThatNotExists'
        });
        setStore({
            currentPicture: picturePath
        });

    };
}




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






function configButtonFunc() {

    let id = this.id;

    if (id == 'SaveCurrentTabsSession') {

        let name = prompt("Input Name: ")
        if (name == null || name.trim().length < 1) {
            // name = timeDistanceToNow(new Date())
            alert("Input Name ...")
            return

        }
        let time = getCurrentTime()
        let cu = {};
        cu.tabs = cache.CurrentTabsSession;
        cu.name = name
        cu.time = time
        cu.type = 'manualSavedTabsSession'
        let TabsSessionId = newTabsSessionId()
        // cu.id = TabsSessionId
        cache.TabsSession.manualSavedTabsSessionObjects[TabsSessionId] = cu

        setStore({
            TabsSession: cache.TabsSession
        });

        let ele = createTabInfoElement(cu, TabsSessionId, "leftSide", time)
        ele.onclick = ckTabsSession
        cache.TabsInfoEleCache[TabsSessionId] = ele
        let SavedTabsSession = document.getElementById('SavedTabsSession')
        SavedTabsSession.insertBefore(ele, SavedTabsSession.children[1])

        let SavedTabsSessionNum = Number(document.getElementById('SavedTabsSessionNum').innerText)
        document.getElementById('SavedTabsSessionNum').innerText = SavedTabsSessionNum + 1

        // to trigger Backup TabSession Notify
        getStore(["otherOptions"]).then((re) => {
            re.otherOptions.BackupTabSessionLastTime = "Mon Aug 11 2000"
            setStore({
                otherOptions: re.otherOptions
            })
        })
    }

}






/**
 * 
 * @param {object} tab  chrome tab object
 * @param {object} object 
 */
function createTabDetail(tab, object) {
    let div = document.createElement('div')
    let img = document.createElement('img')
    let a = document.createElement('a')
    let btn = document.createElement('button')

    div.className = 'font-green-dark cc-marginBottom-small'
    div.style = 'width:93%;overflow: hidden; margin-left: 44px !important;'
    try {
        img.src = tab.favIconUrl
    } catch (error) {

    }
    img.width = 16
    img.height = 16
    img.className = 'cc-marginWidth-small'
    a.className = 'cc-no-underline font-green-dark '
    a.style = 'text-overflow:ellipsis ;'
    a.href = tab.url
    a.target = 'target'
    a.innerText = tab.title
    btn.className = 'pointer cc-border-btn-a cc-circle-30  transparent font-green-dark'
    btn.style = "height: 19px;width:19px;padding-left: 4px;"
    btn.innerText = 'X'
    btn.onclick = deleteOneTab
    btn.setAttribute('data-tabId', tab.id)
    btn.setAttribute('data-savedtime', Number(object.time))
    btn.setAttribute('data-id', object.id)

    div.appendChild(btn)
    div.appendChild(img)
    div.appendChild(a)


    return div

}

/**
 * 
 *  
 */

function showCurrentTabsSession() {
    document.getElementById('UndoDeleteSavedTab').classList.add(['hide'])
    document.getElementById('UndoDeleteSavedTabTxt').innerText = 'Undo Delete Saved Tab: '
    chrome.tabs.query({}, (arr) => {
        let info = parseTabs(arr)
        let addto = document.getElementById('TabsSessionDetail')
        let time = getCurrentTime();
        let id = newTabsSessionId()
        addto.setAttribute('data-savedtime', 0)
        addto.setAttribute('data-id', id)
        addto.innerHTML = ''

        document.getElementById('TabsSessionNameRightSide').innerText = 'Just Now'
        document.getElementById('TabsSessionNameRightSide').setAttribute('data-type', 'currentTabs')
        document.getElementById('TabsSessionTime').innerText = 'Current Time'

        let cutTab = info
        let winNumT = 0;
        for (k in cutTab.windowsTabs) {
            winNumT++
            let divD = document.createElement('div')
            divD.className = 'font-white-red cc-marginHeight-small-10 '
            divD.style = "margin-left: 22px !important;"
            let bd = document.createElement('b')
            bd.innerHTML = 'window ' + winNumT
            addto.appendChild(divD).appendChild(bd)

            for (let i = 0; i < cutTab.windowsTabs[k].length; i++) {
                let tabD = createTabDetail(cutTab.windowsTabs[k][i], {
                    time: time,
                    id: id
                })
                addto.appendChild(tabD)
            }
        }
    })
}


function deleteTabsSession() {

    let name = document.getElementById('TabsSessionNameRightSide').innerText
    let type = document.getElementById('TabsSessionNameRightSide').getAttribute('data-type')
    if (type == 'currentTabs') {
        return
    }

    let addto = document.getElementById('TabsSessionDetail')
    let time = Number(addto.getAttribute('data-savedtime'))
    let id = addto.getAttribute('data-id')
    addto.setAttribute('data-savedtime', 0)

    let cf = confirm('Delete ' + name + " ?")
    if (!cf) {
        return
    }


    cache.TabsInfoEleCache[id].parentNode.removeChild(cache.TabsInfoEleCache[id])
    addto.innerHTML = ''
    delete cache.TabsInfoEleCache[id]
    delete cache.TabsSession.manualSavedTabsSessionObjects[id]
    let SavedTabsSessionNum = Number(document.getElementById('SavedTabsSessionNum').innerText)
    document.getElementById('SavedTabsSessionNum').innerText = SavedTabsSessionNum - 1
    setStore({
        TabsSession: cache.TabsSession
    })
    showCurrentTabsSession()

    // to trigger Backup TabSession Notify
    getStore(["otherOptions"]).then((re) => {
        re.otherOptions.BackupTabSessionLastTime = "Mon Aug 11 2000"
        setStore({
            otherOptions: re.otherOptions
        })
    })
}


function ImportTabsSession() {

    importData("Text", "application/json", function (re) {
        let temp = JSON.parse(re)
        if (!temp.manualSavedTabsSession && !temp.manualSavedTabsSessionObjects) {
            alert("no Tabs Session data in ")
            return
        }
        temp.manualSavedTabsSession ? cache.TabsSession.manualSavedTabsSession = temp.manualSavedTabsSession.concat(cache.TabsSession.manualSavedTabsSession) : false

        temp.manualSavedTabsSessionObjects ? cache.TabsSession.manualSavedTabsSessionObjects = mergeObject(cache.TabsSession.manualSavedTabsSessionObjects, temp.manualSavedTabsSessionObjects, {
            ifNewRandomKeyWithSameKey: true,
            RandomKeyFunction: newTabsSessionId
        }) : false
        convert_manualSavedTabsSession_to_manualSavedTabsSessionObjects(cache.TabsSession.manualSavedTabsSession, cache.TabsSession.manualSavedTabsSessionObjects)
        setStore({
            TabsSession: cache.TabsSession
        })
        showSavedTabsSession()
    })
}

async function ExportTabsSession() {
    let data = JSON.stringify(cache.TabsSession)
    let name = 'C.C.CSS.Tab  Tabs_Session_Backup ' + (new Date()).toLocaleString() + '.json'
    await exportData(name, data).then((params) => {
        getStore(['otherOptions']).then((re) => {
            re.otherOptions.BackupTabSessionLastTime = (new Date()).toDateString()
            setStore({
                otherOptions: re.otherOptions
            });
        })
    })

}

function showSavedTabsSession() {

    let tsKeys = Object.keys(cache.TabsSession.manualSavedTabsSessionObjects)

    document.getElementById('SavedTabsSessionNum').innerText = tsKeys.length

    let addTo = document.getElementById('SavedTabsSession')
    let savedNumEle = addTo.children[0]
    addTo.innerHTML = ''
    addTo.appendChild(savedNumEle)
    for (let i = tsKeys.length - 1; i >= 0; i--) {
        let k = tsKeys[i]
        let v = cache.TabsSession.manualSavedTabsSessionObjects[k]
        let ele = createTabInfoElement(v, k, "leftSide", v.time)
        ele.onclick = ckTabsSession
        cache.TabsInfoEleCache[k] = ele
        addTo.appendChild(ele)
    }
}

function showAutoSavedTabsSession() {
    let addto = document.getElementById('TabsSessionAutoSaved')
    getStore("TabsSessionAutoSaved").then((arr) => {
        if (arr.TabsSessionAutoSaved == undefined) {
            return
        }
        cache.TabsSession.AutoSaved = arr.TabsSessionAutoSaved

        let ele = createTabInfoElement(arr.TabsSessionAutoSaved, arr.TabsSessionAutoSaved.id, "autoSaved", arr.TabsSessionAutoSaved.time)
        ele.classList.remove("cc-background-dark-3", "cc-marginHeight-small-10")
        ele.removeChild(ele.firstChild)
        ele.onclick = ckTabsSession
        cache.TabsInfoEleCache[arr.TabsSessionAutoSaved.id] = ele

        addto.append(ele)
    })

}



function TabsOpenSetOfWindows() {
    let addto = document.getElementById('TabsSessionDetail')
    let id = addto.getAttribute('data-id')
    if (isStringEmpty(id)) {
        return
    }
    let obj = cache.TabsSession.manualSavedTabsSessionObjects[id]
    let tabs = obj.tabs
    let windowsAndTabs = parseTabs(tabs)
    for (w in windowsAndTabs.windowsTabs) {
        let urls = []
        let parsedTabs = windowsAndTabs.windowsTabs[w]
        for (let t = 0; t < parsedTabs.length; t++) {
            urls.push(parsedTabs[t].url)
        }
        chrome.windows.create({
            url: urls
        })
    }
}

function TabsOpenToOneWindow() {
    let addto = document.getElementById('TabsSessionDetail')
    let id = addto.getAttribute('data-id')
    if (isStringEmpty(id)) {
        return
    }
    let obj = cache.TabsSession.manualSavedTabsSessionObjects[id]
    let tabs = obj.tabs
    let urls = []
    for (let t = 0; t < tabs.length; t++) {
        if (cache.ifFilterChromeUrl && tabs[t].url.indexOf('chrome') == 0) {
            continue
        }
        urls.push(tabs[t].url)
    }
    chrome.windows.create({
        url: urls
    })
}

function ReNameTabsSession() {
    let addto = document.getElementById('TabsSessionDetail')
    let id = addto.getAttribute('data-id')
    if (isStringEmpty(id)) {
        return
    }
    let obj = cache.TabsSession.manualSavedTabsSessionObjects[id]
    let name = 'Rename'
    name = prompt("input new name", obj.name)
    if (name == null || name == '') {
        return
    }
    cache.TabsSession.manualSavedTabsSessionObjects[id].name = name

    cache.TabsInfoEleCache[id].children[0].children[0].innerText = name
    document.getElementById('TabsSessionNameRightSide').innerText = name
    setStore({
        TabsSession: cache.TabsSession
    })
}

function MergeToTabsSession() {
    let addto = document.getElementById('TabsSessionDetail')
    let id = addto.getAttribute('data-id')
    if (isStringEmpty(id)) {
        return
    }
    let obj = cache.TabsSession.manualSavedTabsSessionObjects[id]
    let div = createTransparentDarkDivBox("NotifySavedTabsSession", document.documentElement)
    let blockDiv = createBlockDiv()
    blockDiv.onclick = function () {
        div.parentNode.removeChild(div)
        blockDiv.parentNode.removeChild(blockDiv)
    }
    document.documentElement.appendChild(blockDiv)

    Object.entries(cache.TabsSession.manualSavedTabsSessionObjects).forEach(([k, v]) => {
        if (k == id) {
            return
        }
        let ele = createTabInfoElement(v, k, "popup", obj.time)
        ele.onclick = function () {
            let sure = confirm("sure merge to " + this.getAttribute("data-name") + " ?")
            if (!sure) {
                return
            }
            let targetId = this.getAttribute("data-id")

            cache.TabsSession.manualSavedTabsSessionObjects[targetId] = mergeObject(cache.TabsSession.manualSavedTabsSessionObjects[targetId], cache.TabsSession.manualSavedTabsSessionObjects[id], {
                mergeValueWithSameKeyFunction: (vt, v2) => {
                    if ((vt instanceof Array) && (v2 instanceof Array)) {
                        return vt.concat(v2)
                    } else {
                        return vt
                    }

                }
            })
            delete cache.TabsSession.manualSavedTabsSessionObjects[id]

            deleteDoubleTabInEachSession()

            setStore({
                TabsSession: cache.TabsSession
            })
            div.parentNode.removeChild(div)
            blockDiv.parentNode.removeChild(blockDiv)
            document.getElementById("TabsSessionDetail").innerHTML = ""
            let leftSide = document.getElementById(id + "_leftSide")
            leftSide.parentNode.removeChild(leftSide)
            fakeClick(document.getElementById(k + "_leftSide"))

            let info = parseTabs(cache.TabsSession.manualSavedTabsSessionObjects[targetId].tabs)
            getElementById(targetId + "_leftSide").childNodes[2].innerHTML = "&emsp;&emsp;  windows:" + info.windowsNum + '&emsp; tabs:' + info.TabsNum
        }
        div.appendChild(ele)
    })
}

function deleteDoubleTabInEachSession() {
    Object.entries(cache.TabsSession.manualSavedTabsSessionObjects).forEach(([k, v]) => {

        for (let i = 0; i < v.tabs.length; i++) {
            for (let j = i + 1; j < v.tabs.length; j++) {
                if (v.tabs[i].url == v.tabs[j].url) {
                    v.tabs.splice(j, 1)
                }
            }
        }

        cache.TabsSession.manualSavedTabsSessionObjects[k] = v
        setStore({
            TabsSession: cache.TabsSession
        })
    })
}
// function refreshCacheTabs(){
//     chrome.tabs.query({}, (arr) => { 
//         cache.CurrentTabsSession = arr; 
//     })
// }

function deleteOneTab() {
    let tabId = Number(this.getAttribute('data-tabId'))
    let sessionId = this.getAttribute('data-id')
    let time = Number(this.getAttribute('data-savedtime'))
    let addto = document.getElementById('TabsSessionDetail')
    let info = ''
    let deletedTab = null;

    let type = document.getElementById('TabsSessionNameRightSide').getAttribute('data-type')
    if (type == 'currentTabs') {

        for (let i = 0; i < cache.CurrentTabsSession.length; i++) {
            if (tabId == cache.CurrentTabsSession[i].id) {
                cache.CurrentTabsSession.splice(i, 1)
                break
            }
        }
    } else {
        for (let f = 0; f < cache.TabsSession.manualSavedTabsSessionObjects[sessionId].tabs.length; f++) {
            let v = cache.TabsSession.manualSavedTabsSessionObjects[sessionId]
            if (tabId == v.tabs[f].id) {
                let titleLen = v.tabs[f].title.length > 30 ? 30 : v.tabs[f].title.length
                info = v.name + ' => ' + v.tabs[f].title.substr(0, titleLen)
                deletedTab = cache.TabsSession.manualSavedTabsSessionObjects[sessionId].tabs.splice(f, 1)[0]
                break
            }
        }
        setStore({
            TabsSession: cache.TabsSession
        })
        let undo = document.getElementById('UndoDeleteSavedTab')
        undo.classList.remove(['hide'])
        undo.setAttribute('data-savedtime', time)
        undo.setAttribute('data-id', sessionId)

        document.getElementById('UndoDeleteSavedTabTxt').innerText = 'Undo Delete Saved Tab: ' + info
        cache.DeleteSavedTab = {}
        cache.DeleteSavedTab.time = time
        cache.DeleteSavedTab.deletedTab = deletedTab
        cache.DeleteSavedTab.ele = this.parentNode
        cache.DeleteSavedTab.id = sessionId

        let infoTabCount = getElementById(sessionId + "_leftSide").childNodes[2].innerText
        let oldTabCountStr = infoTabCount.replace(/.*windows:\d{1,}.*tabs:(\d{1,})/, "$1")
        let oldTabCount = Number(oldTabCountStr) - 1
        getElementById(sessionId + "_leftSide").childNodes[2].innerText = infoTabCount.replace(/(.*windows:\d{1,}.*tabs:)(\d{1,})/, "$1" + oldTabCount)
    }

    let pe = this.parentNode
    pe.parentNode.removeChild(pe)

}

function UndoDeleteSavedTab() {
    // cache.DeleteSavedTab={}
    // cache.DeleteSavedTab.time=time
    // cache.DeleteSavedTab.deletedTab=deletedTab
    // cache.DeleteSavedTab.ele=this.parentNode
    let addto = document.getElementById('TabsSessionDetail')

    let undo = document.getElementById('UndoDeleteSavedTab')

    let sessionId = undo.getAttribute('data-id')

    if (sessionId != cache.DeleteSavedTab.id) {
        return
    }
    cache.TabsSession.manualSavedTabsSessionObjects[sessionId].tabs.splice(0, 0, cache.DeleteSavedTab.deletedTab)
    setStore({
        TabsSession: cache.TabsSession
    })
    addto.insertBefore(cache.DeleteSavedTab.ele, addto.children[1])
    document.getElementById('UndoDeleteSavedTab').classList.add(['hide'])
    document.getElementById('UndoDeleteSavedTabTxt').innerText = 'Undo Delete Saved Tab: '

    let infoTabCount = getElementById(sessionId + "_leftSide").childNodes[2].innerText
    let oldTabCountStr = infoTabCount.replace(/.*windows:\d{1,}.*tabs:(\d{1,})/, "$1")
    let oldTabCount = Number(oldTabCountStr) + 1
    getElementById(sessionId + "_leftSide").childNodes[2].innerText = infoTabCount.replace(/(.*windows:\d{1,}.*tabs:)(\d{1,})/, "$1" + oldTabCount)
}



function convert_manualSavedTabsSession_to_manualSavedTabsSessionObjects(manualSavedTabsSession, manualSavedTabsSessionObjects) {
    if (manualSavedTabsSession.length == 0) {
        return
    }
    for (let i = 0; i < manualSavedTabsSession.length; i++) {
        let id = manualSavedTabsSession[i].time + "" + UUID(32, 34)
        manualSavedTabsSessionObjects[id] = manualSavedTabsSession[i]
    }

}


window.onload = function () {
    getStore(['csFunctions', 'csFunctionsDelayTime']).then((re) => {
        cache.csFunction = {
            csFunctions: re.csFunctions,
            csFunctionsDelayTime: re.csFunctionsDelayTime
        }
    })

    configButton = document.querySelectorAll('.configButton'); //document.querySelector('.configButton');
    configButton.forEach(function (elem) {
        elem.onclick = configButtonFunc;
    });
    document.getElementById('TabsSessionImport').onclick = ImportTabsSession
    document.getElementById('TabsSessionExport').onclick = ExportTabsSession
    document.getElementById('TabsSessionDelete').onclick = deleteTabsSession
    document.getElementById('TabsOpenSetOfWindows').onclick = TabsOpenSetOfWindows
    document.getElementById('TabsOpenToOneWindow').onclick = TabsOpenToOneWindow
    document.getElementById('ReNameTabsSession').onclick = ReNameTabsSession
    document.getElementById('UndoDeleteSavedTab').onclick = UndoDeleteSavedTab
    document.getElementById('MergeToTabsSession').onclick = MergeToTabsSession

    document.getElementById('TabsSessionSearch').oninput = function (re) {
        document.getElementById('UndoDeleteSavedTab').classList.add(['hide'])
        document.getElementById('UndoDeleteSavedTabTxt').innerText = 'Undo Delete Saved Tab: '

        let addto = document.getElementById('TabsSessionDetail')
        addto.innerHTML = ''
        addto.setAttribute('data-savedtime', 0)
        document.getElementById('TabsSessionNameRightSide').setAttribute('data-type', 'manualSavedTabsSession')
        // console.log(re.target.value)
        Object.entries(cache.TabsSession.manualSavedTabsSessionObjects).forEach(([k, v]) => {
            let divD = document.createElement('div')
            divD.className = 'font-white-red cc-marginHeight-small-10 '
            divD.style = "margin-left: 22px !important;"
            let bd = document.createElement('b')
            bd.innerHTML = 'manualSavedTabsSession Name:&emsp;&emsp; ' + v.name
            addto.appendChild(divD).appendChild(bd)

            for (let f = 0; f < v.tabs.length; f++) {
                if (v.tabs[f].url.indexOf('chrome') == 0) {
                    continue
                }
                if (v.tabs[f].title.toLowerCase().indexOf(re.target.value.toLowerCase()) >= 0) {
                    let tabD = createTabDetail(v.tabs[f], {
                        time: v.time,
                        id: k
                    })
                    addto.appendChild(tabD)
                }
            }
        })
    }

    getStore(['TabsSession']).then((re) => {
        if (!re.TabsSession) {
            return
        }
        cache.TabsSession = re.TabsSession;

        // convert manualSavedTabsSession to manualSavedTabsSessionObjects
        if (!cache.TabsSession.manualSavedTabsSessionObjects) {
            cache.TabsSession.manualSavedTabsSessionObjects = {}
        }
        convert_manualSavedTabsSession_to_manualSavedTabsSessionObjects(cache.TabsSession.manualSavedTabsSession, cache.TabsSession.manualSavedTabsSessionObjects)
        cache.TabsSession.manualSavedTabsSession = []
        deleteDoubleTabInEachSession()
        setStore({
            TabsSession: cache.TabsSession
        })
        showSavedTabsSession()
    })


    ///////////////////
    getStore(['ClockInNewTab', 'ClockOptions', 'chromeBookmarks', 'bookmarksOptions']).then(function (re) {

        if (re.ClockInNewTab == true) {
            DecoratePluginsCache.clockWidget = new ClockWidget(re.ClockOptions);
        };
        try {
            if (re.bookmarksOptions.showBookmarks) {
                re.bookmarksOptions.data = re.chromeBookmarks;
                DecoratePluginsCache.bookmarks = new ChromeBookmarks(re.bookmarksOptions);
                DecoratePluginsCache.showBookmarks = true;
            } //   
        } catch (e) {
            pushAndStoreErrorLogArray({
                error: e
            })
        }
        re = null;
    });
    chrome.tabs.query({}, (arr) => {

        cache.CurrentTabsSession = arr;
        let info = parseTabs(arr)

        document.getElementById('CurrentTabsSessionInfo').innerHTML = "&emsp;&emsp;  windows:" + info.windowsNum + '&emsp; tabs:' + info.TabsNum
        showCurrentTabsSession()
        document.getElementById('CurrentTabsSessionId').onclick = showCurrentTabsSession
    })
    // let refreshCacheTabsTimer=setInterval(()=>{
    //     refreshCacheTabs() 
    //
    // },3000)
    let urlParam = parseURLGetParam(location.search);
    // if (urlParam.from == 'notify') {
    let NotifySavedTabsSessionTimeOut = setTimeout(function () {
        clearTimeout(NotifySavedTabsSessionTimeOut)
        if (urlParam.action == 'click_session_preview') {

            fakeClick(document.getElementById(urlParam.id + "_leftSide"))
        } else if (urlParam.action == "backupTabsSession") {
            NotifySavedTabsSession()
            fakeClick(document.getElementById("TabsSessionExport"))
        } else {
            NotifySavedTabsSession()
        }
    }, 600)



    showAutoSavedTabsSession()
    // document.getElementById('NewTabSetting').classList.remove('hide');
    // }
    //////////////////////////////////////////////////////////////////////////////////////
    chrome.runtime.onMessage.addListener(applyOnMessage);
    //////////////////////////////////////////////////////////////////////////////////////


    // if(sessionStorage.getItem("tabsSessionReload")==undefined||sessionStorage.getItem("tabsSessionReload")=="false"){
    //     sessionStorage.setItem("tabsSessionReload","true")

    //     let tabsSessionReloadTimeout=setTimeout(function(){
    //         clearTimeout(tabsSessionReloadTimeout)
    //         location.reload()
    //     },1000) 

    // }

    getStore(['csFunctions', 'csFunctionsDelayTime']).then((re) => {
        cache.csFunction = {
            csFunctions: re.csFunctions,
            csFunctionsDelayTime: re.csFunctionsDelayTime
        }
        customFunctions({
            TabsSession_cache: cache
        })
    })
    //////////////////////////////////////////////////////////////////////////////////////
 
}

