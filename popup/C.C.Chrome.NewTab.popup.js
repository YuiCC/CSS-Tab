/**
 
 */
document.body.style.backgroundImage = "url(../image/popupImage.jpg)";
let darkPicture = '../image/Black Dark Picture.png';
let BackgroundPage = chrome.extension.getBackgroundPage();
let cache = {
    pCat: { // picturesCategories
        pictureOnlySavedPathName: null,
        pictureSavedAsBase64Name: null
    }
};
let settingLogo = "../image/settingLogo.jpg";
main();

function main() {
    getStore(['picturesCategories','useDefaultCSS', 'ClockInNewTab', 'ClockInCSS', 'useDarkBackground', 'ifPictureBackground', 'setPictureAsCssEternal', 'pinThisPictureInNewTab', 'blockScriptOptions']).then(function (re) {

        document.getElementById('useDarkBackground').checked = re.useDarkBackground;
        document.getElementById('ifPictureBackground').checked = re.ifPictureBackground;
        document.getElementById('setPictureAsCssEternal').checked = re.setPictureAsCssEternal;
        document.getElementById('pinThisPictureInNewTab').checked = re.pinThisPictureInNewTab;
        document.getElementById('clockInCSS').checked = re.ClockInCSS;
        document.getElementById('ClockInNewTab').checked = re.ClockInNewTab;
        document.getElementById('useDefaultCSS').checked = re.useDefaultCSS;
        document.getElementById('picturesCategoriesFilter').checked = re.picturesCategories.pictureOnlySavedPathName.config.ifFilter;


        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            let tabId = (tabs.length ? tabs[0].id : null);
            let tabUrl = (tabs.length ? tabs[0].url : null);


            let mainDomainName = null

            if (tabUrl.indexOf("file:///") == 0) {
                mainDomainName = "file:///"
            } else {
                mainDomainName = getMainDomainName(tabUrl, re.blockScriptOptions)
            }

            let subDomainName = getSubDomainName(tabUrl)

            if ((re.blockScriptOptions.isBlockScriptFile || re.blockScriptOptions.isBlockScriptInline) && !re.blockScriptOptions.notBlockSites.includes(mainDomainName)) {
                document.getElementById('BlockScriptOnThisSite').checked = true
                let bolckedScriptNum = BackgroundPage.cache.blockedScriptTabs[tabId] ? BackgroundPage.cache.blockedScriptTabs[tabId].ScriptCount : 0;

                document.getElementById('bolckedScriptNum').innerText = bolckedScriptNum
            }

            if (re.blockScriptOptions.NotBlockSubDomain.includes(subDomainName)) {
                document.getElementById("BlockScriptOnThisSiteNotSubDomain").checked = true
            }

            let bolckedNum = BackgroundPage.cache.BlockedTrackerTabs[tabId] ? BackgroundPage.cache.BlockedTrackerTabs[tabId].trackerCount : 0;

            document.getElementById('BlockedTrackerNum').innerText = 'BlockedTrackerCurrentTab: ' + bolckedNum;

            let BlockedThirdPartySubFrameNum = BackgroundPage.cache.BlockedThirdPartySubFrameTabs[tabId] ? BackgroundPage.cache.BlockedThirdPartySubFrameTabs[tabId].ThirdPartySubFrameCount : 0;

            document.getElementById('BlockedThirdPartySubFrameNum').innerText = 'BlockedThirdPartySubFrameNumCurrentTab: ' + BlockedThirdPartySubFrameNum;


            cache.tabId = tabId;


            if (BackgroundPage.cache.pauseBlockTrackerTabId == tabId) {
                document.getElementById('pauseBlockTrackerTemporary').checked = true;
            }
            if (BackgroundPage.cache.pauseBlockThirdPartySubFrameTabId == tabId) {
                document.getElementById('pauseBlockThirdPartySubFrameTemporary').checked = true;
            }
            if (BackgroundPage.cache.pauseBlockAllCount >= 0) {
                document.getElementById('pauseBlockAllTemporary').checked = true;
            }
            if (BackgroundPage.cache.pauseBlockAnyThisTabTemporaryTabId == tabId) {
                document.getElementById('pauseBlockAnyThisTabTemporary').checked = true;
            }
        });
    });
    // document.getElementById('optionsDT').style.backgroundImage = "url("+settingLogo+")"; 
};

function configButtonFunc() {

    let id = this.id;
    if (id == "bolckedScriptNum") {
        if (cache.clickedBolckedScriptNum) {
            cache.clickedBolckedScriptNumDl.parentNode.removeChild(cache.clickedBolckedScriptNumDl);
            cache.clickedBolckedScriptNum = false;
        } else {

            cache.clickedBolckedScriptNumDl = document.createElement("dl");
            ScriptURLs = null
            if (BackgroundPage.cache.blockedScriptTabs[cache.tabId]) {
                ScriptURLs = BackgroundPage.cache.blockedScriptTabs[cache.tabId].ScriptURLs
            } else {
                return
            }
            excepts = BackgroundPage.cache.blockException[BackgroundPage.cache.blockedScriptTabs[cache.tabId].TabURL]
            for (except in excepts) {
                let dt = `<dt class="font-green-dark zeroMargin cc-oneline-wrap" title="click the '+' button to remove from block exception for this js">
                 <button class="pointer  cc-circle-30  transparent font-green-dark " data-block="false" data-url=${excepts[except]}><b> + </b></button>${excepts[except]} 
                </dt>`
                let ele = htmlStringToElement(dt)
                ele.querySelector("button").onclick = processBlockUrls
                // console.log(ele)
                cache.clickedBolckedScriptNumDl.appendChild(ele)
            }
            for (url in ScriptURLs) {
                let dt = `<dt class="font-green-dark zeroMargin cc-oneline-wrap"  title="click the '-' button to add to block exception for this js">
                 <button class="pointer  cc-circle-30  transparent font-green-dark " data-block="true" data-url=${ScriptURLs[url]}><b> - </b></button>${ScriptURLs[url]} 
                </dt>`
                let ele = htmlStringToElement(dt)
                ele.querySelector("button").onclick = processBlockUrls
                // console.log(ele)
                cache.clickedBolckedScriptNumDl.appendChild(ele)
            }
            this.parentNode.appendChild(cache.clickedBolckedScriptNumDl)
            cache.clickedBolckedScriptNum = true;
        }
    } else if (id == 'BlockScriptOnThisSite') {
        config_BlockScriptOnThisSite(this)

    } else if (id == 'BlockScriptOnThisSiteNotSubDomain') {
        config_BlockScriptOnThisSiteNotSubDomain(this)
    } else if (id == 'useDarkBackground') {
        if (this.checked) {

            chrome.runtime.sendMessage({
                picturePath: darkPicture,
                info: 'getPictureBase64',
                PictureBase64Name: 'PictureAsCssEternalBase64'
            });
            setStore({
                setPictureAsCssEternal: true,
                PictureAsCssEternal: darkPicture,
                ifPictureBackground: true,
                useDarkBackground: true
            });

            document.getElementById('ifPictureBackground').checked = true;
            document.getElementById('setPictureAsCssEternal').checked = true;

        } else {
            setStore({
                setPictureAsCssEternal: false,
                useDarkBackground: false
            });
            document.getElementById('setPictureAsCssEternal').checked = false;

        }
    } else if (id == 'ifPictureBackground') {
        if (this.checked) {
            setStore({
                ifPictureBackground: true
            });

        } else {
            setStore({
                ifPictureBackground: false,
                useDarkBackground: false,
                setPictureAsCssEternal: false
            });
            if (document.getElementById('useDarkBackground').checked) {
                document.getElementById('useDarkBackground').checked = false;
                document.getElementById('setPictureAsCssEternal').checked = false;
            }

        }
    } else if (id == 'setPictureAsCssEternal') {
        if (this.checked) {
            getStore('currentPicture').then(function (object) {
                chrome.runtime.sendMessage({
                    picturePath: object.currentPicture,
                    info: 'getPictureBase64',
                    PictureBase64Name: 'PictureAsCssEternalBase64'
                });
                setStore({
                    setPictureAsCssEternal: true,
                    PictureAsCssEternal: object.currentPicture,
                })
            })

        } else {
            setStore({
                setPictureAsCssEternal: false,
                useDarkBackground: false
            })
            document.getElementById('useDarkBackground').checked = false;
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
    } else if (id == 'regexSearch') {
        sendMessageToCurrentTab('regexSearch', (response) => {
            // if(response) alert('收到来自content-script的回复：'+response);   
        });
    } else if (id == 'saveFullHtml') {
        sendMessageToCurrentTab('saveFullHtml', (response) => {
            // if(response) alert('收到来自content-script的回复：'+response);    
        });
    } else if (id == 'clockInCSS') {
        if (this.checked) {

            setStore({
                ClockInCSS: true
            })

            sendMessageToAllTabs('enableClockInCSS', (response) => {
                // if(response) alert('收到来自content-script的回复：'+response);
            });
        } else {
            setStore({
                ClockInCSS: false
            });
            sendMessageToAllTabs('disableClockInCSS', (response) => {
                // if(response) alert('收到来自content-script的回复：'+response);
            });
        }
    } else if (id == 'ClockInNewTab') {
        let checked = this.checked == true ? true : false;
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            if (tabs[0].url.indexOf('chrome') == 0) {
                if (checked) {
                    setStore({
                        ClockInNewTab: true
                    })
                    sendMessageToCurrentTab('enableClockInCSSOnly', (response) => {
                        // if(response) alert('收到来自content-script的回复：'+response);
                    });
                } else {
                    setStore({
                        ClockInNewTab: false
                    });
                    sendMessageToCurrentTab('disableClockInCSSOnly', (response) => {
                        // if(response) alert('收到来自content-script的回复：'+response);
                    });
                }
            }
        });

    } else if (id == 'picturesCategoriesFilter') {
        if (this.checked) {
            loadPicturesCategoriesToCache(cache, opt = {
                newSave: true,
                ifFilter: true,
                callback:BackgroundPage.loadPicturesCategoriesToCacheInBackground(true,true)
            })
        } else {
            loadPicturesCategoriesToCache(cache, opt = {
                newSave: true,
                ifFilter: false,
                callback:BackgroundPage.loadPicturesCategoriesToCacheInBackground(false,true)
            })
        }
    } else if (id == 'ShowOrHideBookmarks') {
        sendMessageToCurrentTab('ShowOrHideBookmarks', (response) => {
            // if(response) alert('收到来自content-script的回复：'+response);
        });
    } else if (id == 'UpdateBookmarks') {
        chrome.bookmarks.getTree(function (re) {
            setStore({
                chromeBookmarks: re
            });
            re = null;

        })
    } else if (id == 'StopRemindTimeSound') {

        BackgroundPage.StopRemindTimeSound();
    } else if (id == 'pauseBlockTrackerTemporary') {

        if (this.checked) {
            BackgroundPage.pauseBlockTrackerTemporary();
        } else {
            BackgroundPage.unPauseBlockTrackerTemporary();
        }
    } else if (id == 'pauseBlockThirdPartySubFrameTemporary') {

        if (this.checked) {
            BackgroundPage.pauseBlockThirdPartySubFrameTemporary();
        } else {
            BackgroundPage.unPauseBlockThirdPartySubFrameTemporary();
        }
    } else if (id == 'pauseBlockAllTemporary') {

        if (this.checked) {
            BackgroundPage.pauseBlockAllTemporary();
        } else {
            BackgroundPage.unPauseBlockAllTemporary();
        }
    } else if (id == 'pauseBlockAnyThisTabTemporary') {

        if (this.checked) {
            BackgroundPage.pauseBlockAnyThisTabTemporary();
        } else {
            BackgroundPage.unpauseBlockAnyThisTabTemporary();
        }
    } else if (id == 'BlockedTracker') {

        if (cache.clickedTracker) {
            cache.BlockedTrackerEleP.parentNode.removeChild(cache.BlockedTrackerEleP);
            cache.clickedTracker = false;
        } else {
            let eleP = document.createElement("p");
            eleP.className = "cc-wrap font-green-dark zeroMargin";
            eleP.innerText = " BlockedTrackers:  " + JSON.stringify(BackgroundPage.cache.BlockedTrackerTabs[cache.tabId] ? BackgroundPage.cache.BlockedTrackerTabs[cache.tabId].trackersURL : []);
            document.getElementById('BlockedTrackerDt').appendChild(eleP);
            cache.BlockedTrackerEleP = eleP;
            cache.clickedTracker = true;
        }

    } else if (id == 'BlockedThirdPartySubFrame') {

        if (cache.clickedThirdPartySubFrame) {
            cache.BlockedThirdPartySubFrameEleP.parentNode.removeChild(cache.BlockedThirdPartySubFrameEleP);
            cache.clickedThirdPartySubFrame = false;
        } else {
            let eleP = document.createElement("p");
            eleP.className = "cc-wrap font-green-dark zeroMargin";
            eleP.innerText = " BlockedThirdPartySubFrame:  " + JSON.stringify(BackgroundPage.cache.BlockedThirdPartySubFrameTabs[cache.tabId] ? BackgroundPage.cache.BlockedThirdPartySubFrameTabs[cache.tabId].ThirdPartySubFrameURL : []);
            document.getElementById('BlockedThirdPartySubFrameDt').appendChild(eleP);
            cache.BlockedThirdPartySubFrameEleP = eleP;
            cache.clickedThirdPartySubFrame = true;
        }

    } else if (id == 'useDefaultCSS') {
        if (this.checked) {
            setStore({
                useDefaultCSS: true,
                config_css: cssExample,
                ifPictureBackground: true,
                oldSetPicTime: 00000000
            });

        }
    } else if (id == 'options') {

        window.open("../newTab/C.C.Chrome.NewTab.html?id=NewTabSetting")
    } else if (id == 'TabsSession') {
        window.open("../newTab/C.C.Chrome.TabsSession.html")
    } else if (id == 'SaveCurrentTabsSession') {

        getStore(['TabsSession']).then((re) => {
            chrome.tabs.query({}, (arr) => {
                cache.CurrentTabsSession = arr;
                if (!re.TabsSession) {
                    return
                }
                cache.TabsSession = re.TabsSession;
                let name = prompt("Input Name: ")
                if (name == null || name.trim().length < 1) {
                    // name = timeDistanceToNow(new Date())
                    alert("Input Name ...")
                    return

                }
                let time = (new Date()).getTime()
                let cu = {};
                cu.tabs = cache.CurrentTabsSession;
                cu.name = name
                cu.time = time
                cu.type = 'manualSavedTabsSession'
                let id = newTabsSessionId()
                // cu.id=id
                if (!cache.TabsSession) {
                    cache.TabsSession = {
                        manualSavedTabsSession: [],
                        previousTabsSession: [],
                        manualSavedTabsSessionObjects: {}
                    };
                }
                cache.TabsSession.manualSavedTabsSessionObjects[id] = cu // 
                setStore({
                    TabsSession: cache.TabsSession
                });
            })
        })

    }
}


/**
 * 
 * @param {Element} ele 
 */
function config_BlockScriptOnThisSiteNotSubDomain(ele) {

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        getStore(['blockScriptOptions']).then(function (re) {

            let tabId = (tabs.length ? tabs[0].id : null);
            let tabUrl = (tabs.length ? tabs[0].url : null);

            let mainDomainName = null

            if (tabUrl.indexOf("file:///") == 0) {
                mainDomainName = "file:///"
            } else {
                mainDomainName = getMainDomainName(tabUrl, re.blockScriptOptions)
            }

            let subDomainName = getSubDomainName(tabUrl)

            if (ele.checked) {
                let sure = confirm("block Script but no this subDomain ?")

                if (sure) {
                    if (!re.blockScriptOptions.NotBlockSubDomain) {
                        re.blockScriptOptions.NotBlockSubDomain = [subDomainName]
                    } else {
                        re.blockScriptOptions.NotBlockSubDomain.push(subDomainName)
                    }
                } else {
                    ele.checked = false
                }

                document.getElementById("BlockScriptOnThisSite").checked = true;
                deleteElementInArray(re.blockScriptOptions.notBlockSites, mainDomainName)
                re.blockScriptOptions.isBlockScriptFile = true
                re.blockScriptOptions.isBlockScriptInline = true

                setStore(re).then(function () {
                    chrome.runtime.sendMessage({
                        info: 'blockItemsSettingTakeEffect'
                    })
                })
            } else {
                if (re.blockScriptOptions.NotBlockSubDomain) {
                    deleteElementInArray(re.blockScriptOptions.NotBlockSubDomain, subDomainName)

                    setStore(re).then(function () {
                        chrome.runtime.sendMessage({
                            info: 'blockItemsSettingTakeEffect'
                        })
                    })
                }
            }
            //////////////
        })
    })
}

/**
 * 
 * @param {Element} ele 
 */
function config_BlockScriptOnThisSite(ele) {

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        getStore(['blockScriptOptions']).then(function (re) {
            let tabId = (tabs.length ? tabs[0].id : null);
            let tabUrl = (tabs.length ? tabs[0].url : null);

            let mainDomainName = null

            if (tabUrl.indexOf("file:///") == 0) {
                mainDomainName = "file:///"
            } else {
                mainDomainName = getMainDomainName(tabUrl, re.blockScriptOptions)
            }

            if (ele.checked) {
                let nbsi = re.blockScriptOptions.notBlockSites.indexOf(mainDomainName)
                re.blockScriptOptions.notBlockSites.splice(nbsi, 1)
                re.blockScriptOptions.isBlockScriptFile = true
                re.blockScriptOptions.isBlockScriptInline = true
                setStore(re).then(function () {
                    chrome.runtime.sendMessage({
                        info: 'blockItemsSettingTakeEffect'
                    })
                })

            } else {
                let sure = confirm("not Block This Site ?")
                if (!sure) {
                    ele.checked = true
                    return
                }
                document.getElementById("BlockScriptOnThisSiteNotSubDomain").checked = false;
                document.getElementById('bolckedScriptNum').innerText = 0

                delete BackgroundPage.cache.blockedScriptTabs[tabId]

                if (re.blockScriptOptions.notBlockSites.indexOf(mainDomainName) < 0) {
                    re.blockScriptOptions.notBlockSites.push(mainDomainName)

                    if (re.blockScriptOptions.NotBlockSubDomain) {
                        deleteElementInArrayThatIncludeSpecialString(re.blockScriptOptions.NotBlockSubDomain, mainDomainName)
                    }
                    setStore(re).then(function () {
                        chrome.runtime.sendMessage({
                            info: 'blockItemsSettingTakeEffect'
                        })
                    })
                }
            }
            ///////////
        })
    })

}

function processBlockTracker() {
    if (this.getAttribute("data-block") == "true") {
        if (BackgroundPage.cache.blockException[BackgroundPage.cache.blockedScriptTabs[cache.tabId].TabURL]) {
            BackgroundPage.cache.blockException[BackgroundPage.cache.blockedScriptTabs[cache.tabId].TabURL].push(this.getAttribute("data-url"))
        } else {
            BackgroundPage.cache.blockException[BackgroundPage.cache.blockedScriptTabs[cache.tabId].TabURL] = [this.getAttribute("data-url")]
        }
        this.innerHTML = `<b> + </b>`
        this.setAttribute("data-block", "false")
        BackgroundPage.cache.blockedScriptTabs[cache.tabId].ScriptCount = BackgroundPage.cache.blockedScriptTabs[cache.tabId].ScriptCount - 1
        deleteElementInArray(BackgroundPage.cache.blockedScriptTabs[cache.tabId].ScriptURLs, this.getAttribute("data-url"))
        setStore({
            blockException: BackgroundPage.cache.blockException
        })
    } else {
        deleteElementInArray(BackgroundPage.cache.blockException[BackgroundPage.cache.blockedScriptTabs[cache.tabId].TabURL], this.getAttribute("data-url"))
        this.innerHTML = `<b> - </b>`
        this.setAttribute("data-block", "true")
        BackgroundPage.cache.blockedScriptTabs[cache.tabId].ScriptCount = BackgroundPage.cache.blockedScriptTabs[cache.tabId].ScriptCount + 1
        setStore({
            blockException: BackgroundPage.cache.blockException
        })
    }

}

function processBlockUrls() {
    if (this.getAttribute("data-block") == "true") {
        if (BackgroundPage.cache.blockException[BackgroundPage.cache.blockedScriptTabs[cache.tabId].TabURL]) {
            BackgroundPage.cache.blockException[BackgroundPage.cache.blockedScriptTabs[cache.tabId].TabURL].push(this.getAttribute("data-url"))
        } else {
            BackgroundPage.cache.blockException[BackgroundPage.cache.blockedScriptTabs[cache.tabId].TabURL] = [this.getAttribute("data-url")]
        }
        this.innerHTML = `<b> + </b>`
        this.setAttribute("data-block", "false")
        BackgroundPage.cache.blockedScriptTabs[cache.tabId].ScriptCount = BackgroundPage.cache.blockedScriptTabs[cache.tabId].ScriptCount - 1
        deleteElementInArray(BackgroundPage.cache.blockedScriptTabs[cache.tabId].ScriptURLs, this.getAttribute("data-url"))
        setStore({
            blockException: BackgroundPage.cache.blockException
        })
    } else {
        deleteElementInArray(BackgroundPage.cache.blockException[BackgroundPage.cache.blockedScriptTabs[cache.tabId].TabURL], this.getAttribute("data-url"))
        this.innerHTML = `<b> - </b>`
        this.setAttribute("data-block", "true")
        BackgroundPage.cache.blockedScriptTabs[cache.tabId].ScriptCount = BackgroundPage.cache.blockedScriptTabs[cache.tabId].ScriptCount + 1
        setStore({
            blockException: BackgroundPage.cache.blockException
        })
    }

}


function sendMessageToAllTabs(message, callback) {
    getAllTabsId((tabs) => {
        for (tab in tabs) {
            chrome.tabs.sendMessage(tabs[tab].id, message, function (response) {
                if (callback) callback(response);
            });
        }

    })
}

function getAllTabsId(callback) {
    chrome.tabs.query({}, function (tabs) {
        if (callback) callback(tabs.length ? tabs : null);
    });
}

function sendMessageToCurrentTab(message, callback) {
    getCurrentTabId((tabId) => {

        chrome.tabs.sendMessage(tabId, message, function (response) {
            if (callback) callback(response);
        });
    });
}

function getCurrentTabId(callback) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        if (callback) callback(tabs.length ? tabs[0].id : null);
    });
}


window.onload = function () {

    configButton = document.querySelectorAll('.configButton'); //document.querySelector('.configButton');
    configButton.forEach(function (elem) {
        elem.onclick = configButtonFunc;
    });
    chrome.tabs.query({}, (arr) => {
        cache.CurrentTabsSession = arr;
    })

    getStore(['blockScriptOptions']).then(function (re) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, (tabs) => {
            let tabId = (tabs.length ? tabs[0].id : null);
            let tabUrl = (tabs.length ? tabs[0].url : null);

            let mainDomainName = null

            if (tabUrl.indexOf("file:///") == 0) {
                mainDomainName = "file:///"
            } else {
                mainDomainName = getMainDomainName(tabUrl, re.blockScriptOptions)
            }
            document.getElementById("BlockScriptOnThisSite").setAttribute("title", mainDomainName)
            document.getElementById("BlockScriptOnThisSite_label").setAttribute("title", mainDomainName)

            let subDomainName = getSubDomainName(tabUrl)

            document.getElementById("BlockScriptOnThisSiteNotSubDomain").setAttribute("title", subDomainName)
            document.getElementById("BlockScriptOnThisSiteNotSubDomain_label").setAttribute("title", subDomainName)

        })
    })


}