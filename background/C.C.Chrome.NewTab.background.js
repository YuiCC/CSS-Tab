// let cacheCSS=null;

var cache = {
    name: "background",
    BroswerType: "chrome",
    skipSchemeHeaders: ["moz", "chrome", "about"],

    pauseBlockCycleTimes: 5, // each times for backgroundRefreshPreferencesIntervalMinutes second
    TabsSessionUrl: 'newTab/C.C.Chrome.TabsSession.html',
    allTabsId: {},
    remindTime: {},
    notification: [],
    blockTrackerAndAdOptions: {
        ifBlockAds: false,
        ifBlockTracker: true,
        ifBlockThirdPartySubFrame: true,
        blockSubFrameType: 'redirectUrl',
        subFrameRedirectUrl: 'blockItems:',
        subFrameExcludeSites: [],
        subFrameNotBlockWithString: [],
        subFrameNotBlockedFromURL: ["www4.bing.com", "www.bing.com", "cn.bing.com", "www.google.com"],
        sitePermitTracker: {
            "baijiahao.baidu.com": ["bdstatic.com"],
            "baike.baidu.com": ["bdstatic.com"],
            "graph.baidu.com": ["bdstatic.com"],
            "image.baidu.com": ["bdstatic.com"],
            "jingyan.baidu.com": ["bdstatic.com"],
            "sv.baidu.com": ["bdstatic.com"],
            "tieba.baidu.com": ["bdstatic.com"],
            "www.baidu.com": ["bdstatic.com"],
            "google.com": ["gstatic.com"],
            "www.google.com": ["gstatic.com"],
            "accounts.google.com": ["gstatic.com"],
            "youtube.com": ["gstatic.com"]
        }
    },
    blockScriptOptions: {
        isBlockScriptFile: false,
        isBlockScriptInline: false,
        notBlockSites: [],
        domainNameWithCountryCode: [".com.cn"]
    },
    blockedScriptTabs: {},
    blockException: {},
    otherOptions: {
        notifyUndoneTabSessionOnlyOnNewtab: false,
        background_Refresh_Notify_Task_Preferences_IntervalSecond: 120,
        BackupTabSessionLastTime: "Mon Aug 11 2000"
    },
    pCat: { // picturesCategories
        pictureOnlySavedPathName: null,
        pictureSavedAsBase64Name: null
    },
    UserAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15"
};

let defaultPicture = '../image/default.jpg';
let blackPicture = '../image/Black Dark Picture.png';
let notifyIcon = '../image/logo-128.png';

initializeExtension();
intervalEvents();

chrome.runtime.onMessage.addListener(
    // function (request, sender, sendResponse) {

    function (request, sender) {
        try {
            // sendResponse({result: "recived"});

            if (request.info == "pickNextPicture") {
                pickNextPicture(request)
            } else if (request.info == 'getPictureBase64') {
                getStore(['recentlyUsedPictures']).then(function (result) {
                    recentlyUsedPicturesFunc(result.recentlyUsedPictures, request.picturePath, request.picturePathSequence);
                })
                getPictureBase64(request.picturePath, request.PictureBase64Name).then(function (object) {
                    setStore(object);
                    let date = new Date();
                    let timePic = date.getTime();
                    setStore({
                        oldSetPicTime: timePic,
                        nextPicture: request.picturePath
                    });
                })
            } else if (request.info == "removePicturesThatNotExists") {
                getStore(['picturesThatNotExists', 'pictureOnlySavedPathName']).then(function (result) {
                    if (result.picturesThatNotExists == undefined || result.picturesThatNotExists == null) {
                        result.picturesThatNotExists = [];
                    }
                    let pictureOnlySavedPathName = result.pictureOnlySavedPathName;
                    if (pictureOnlySavedPathName != undefined && pictureOnlySavedPathName != null) {
                        for (let p = 0; p < pictureOnlySavedPathName.length; p++) {
                            try {
                                if (dealPath(pictureOnlySavedPathName[p].trim()) == request.picturePath.trim()) {
                                    pictureOnlySavedPathName.splice(p, 1);
                                    setStore({
                                        pictureOnlySavedPathName: pictureOnlySavedPathName
                                    });
                                    break;
                                }
                            } catch (error) {

                            }
                        }
                    }
                    result.picturesThatNotExists.push(request.picturePath.trim());
                    setStore({
                        picturesThatNotExists: result.picturesThatNotExists
                    });
                })

            } else if (request.info == 'openUrl') {
                chrome.windows.getCurrent({
                    populate: false
                }, function (window) {
                    if (request.active) {
                        chrome.tabs.create({
                            windowId: window.id,

                            url: request.url,
                            active: true
                        });
                    } else {
                        chrome.tabs.create({
                            windowId: window.id,

                            url: request.url,
                            active: false
                        });
                    }

                });

            } else if (request.info == 'advanceSettingTakeEffect') {
                advanceSettingTakeEffect();
            } else if (request.info.indexOf('picturesCategoriesFilterReload') >= 0) {
                if (request.info.indexOf("true") > 0) {
                    loadPicturesCategoriesToCacheInBackground(true, false)
                } else {
                    loadPicturesCategoriesToCacheInBackground(false, false)
                }

            } else if (request.info == 'blockItemsSettingTakeEffect') {
                blockItemsSettingTakeEffect('manual');
            } else if (request.info == 'csFunctionSettingTakeEffect') {
                csFunctionSettingTakeEffect('manual');
            } else if (request.info == 'taskFromNewTab') {
                intervalOpenSpecificURL()

            } else if (request.info == 'defaultPictureToNextPictureBase64') {
                let date = new Date();
                let timePic = date.getTime();
                getPictureBase64(defaultPicture, 'nextPictureBase64').then(function (object) {
                    setStore({
                        oldSetPicTime: timePic,
                        nextPicture: defaultPicture,
                        nextPictureBase64: object.nextPictureBase64
                    });
                });
            } else if (request.info == 'recentlyUsedPictures') {
                getStore(['recentlyUsedPictures']).then(function (result) {
                    recentlyUsedPicturesFunc(result.recentlyUsedPictures, request.picturePath);
                })

            }
            /**
         else if(request.info=='cacheCSS'){
             if(request.setting=='pictureOnlySavedPathName'){
                    getStore(['config_css']).then(function(reT) {
                       if(reT.config_css!=undefined&&reT.config_css!=null&&reT.config_css!=''){
                           chrome.storage.local.get(['ifPinPicInSites', 'pinPicInSites', 'ifPictureBackground', 'config_css_match_sites', 'setPictureAsCssEternal', 'PictureAsCssEternalBase64', 'config_css', 'nextPicture', 'nextPictureBase64'], function(resultCSS) {
                               cacheCSS=resultCSS;
                               reT=null;
                               resultCSS=null;
                           });    
                       }
                    });
             }else if(request.setting=='config_css'){
                    getStore(['picturePathsNumber']).then(function(reT) {
                       if(reT.picturePathsNumber>0){
                           chrome.storage.local.get(['ifPinPicInSites', 'pinPicInSites', 'ifPictureBackground', 'config_css_match_sites', 'setPictureAsCssEternal', 'PictureAsCssEternalBase64', 'config_css', 'nextPicture', 'nextPictureBase64'], function(resultCSS) {
                               cacheCSS=resultCSS;
                               reT=null;
                               resultCSS=null;
                           });    
                       }
                    });
             }
    
       }
       */
            //   sendResponse  will be async when return true
            //  return true; 
        } catch (e) {
            pushAndStoreErrorLogArray({
                error: e
            })
            log.error(e)
        }
    }); /////


function loadPicturesCategoriesToCacheInBackground(ifFilter = true, newSave = false) {
    loadPicturesCategoriesToCache(cache, opt = {
        ifFilter: ifFilter,
        newSave: newSave
    });
}


/**
function desktopNotify(typeT,titleT,messageT,iconUrlT,imageUrlT,itemsT,progressT){
     let opt=null;
     switch(typeT){  //   type:  basic 、image、list、progress
           case 'basic':
               opt= {
               type: typeT,
               title: titleT,
               message: messageT,
               iconUrl: iconUrlT
             };
               break;
           case 'image':
               opt= {
               type:  typeT,
               title: titleT,
               message: messageT,
               iconUrl: iconUrlT,
               imageUrl:imageUrlT
             };
           break;
           case 'list':
               opt= {
               type:  typeT,
               title: titleT,
               message:messageT,
               iconUrl: iconUrlT,
               items:itemsT //  Array type
             };
           break;
           case 'progress':
               opt= {
               type:  typeT,
               title: titleT,
               message: messageT,
               iconUrl: iconUrlT,			
               progress:progressT // int  type
               };
           break;
           };
     	
        chrome.notifications.create('',opt,function(id){
             let timer = setTimeout(function(){chrome.notifications.clear(id);}, 20000); // set notifications display time maybe not useful
            });
}

*/


async function onBeforeSendHeaders() {
    chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
            //browser.webRequest.onBeforeSendHeaders.addListener(function (details) {

            let reqh = details.requestHeaders;


            for (let i = 0; i < reqh.length; i++) {

                try {
                    if (reqh[i].name.toLowerCase() == "user-agent") {
                        reqh[i].value = cache.UserAgent;
                    }
                } catch (error) {

                }

            }
            return {
                requestHeaders: reqh
            };

        }, {
            "urls": ["<all_urls>"]
        },
        ["requestHeaders", "blocking"]);
}


function initializeExtension() {

    onBeforeSendHeaders();
    cache.BroswerType = getBroswerType()
    getStore(['pictureSavedAsBase64Name', 'pictureOnlySavedPathName', 'resizeCssPicture', 'showMsgOnTitleTime', 'intervalTime', 'ifPinPicInSites', 'TabsSession']).then(function (object) {
        if (object.TabsSession == undefined) {
            setStore({
                TabsSession: {
                    manualSavedTabsSession: [],
                    previousTabsSession: [],
                    manualSavedTabsSessionObjects: {}
                }
            });
        }
        if (object.resizeCssPicture == undefined) {
            setStore({
                resizeCssPicture: {
                    width: 4096,
                    height: 4096,
                    quality: 0.9
                }
            });
        }
        if (object.showMsgOnTitleTime == undefined) {
            setStore({
                showMsgOnTitleTime: 2
            });
        }
        if (object.intervalTime == undefined) {
            setStore({
                intervalTime: 0
            });
        }
        if (object.ifPinPicInSites == undefined) {
            setStore({
                ifPinPicInSites: false
            });
        }
        if (object.pictureOnlySavedPathName == undefined) {
            setStore({
                pictureOnlySavedPathName: []
            });
        }
        if (object.pictureOnlySavedPathName == undefined) {
            setStore({
                pictureSavedAsBase64Name: []
            });
        }

    });
    ///////////////////////////////////////////
    let advanceItems = ["picturesCategories", "saveFullHtmlOptions", 'UserAgentOptions', 'otherOptions', 'inPageSearchOptions', 'recentlyUsedPicturesOpt', 'remindTime', 'bookmarksOptions', 'IntervalShowPicInNewTab', 'IntervalShowPicInCSS', 'DecoratePluginsUrlRegex', 'ClockInCSS', 'ClockInNewTab', 'ClockOptions'];

    cache.advanceItems = advanceItems

    getStore(advanceItems).then(function (re) {
        let ts = {};
        ts.advanceItems = advanceItems;

        let picturesCategories = {
            config: {
                categoryRulesAndCategoryWeight: {},
                singleStringMatchMultiRule: true,
                totalNumber: 0,
                categoriesNameRandomArray: [],
                currentCategoryIndex: -1, 
                ifFilter: true, 
                categories: {},
                stringLines: [] 
            }
        }
        ts.picturesCategories = re.picturesCategories ? re.picturesCategories : {
            pictureOnlySavedPathName: picturesCategories,
            pictureSavedAsBase64Name: picturesCategories
        }
        ts.IntervalShowPicInNewTab = re.IntervalShowPicInNewTab == undefined ? {
            times: 1,
            paths: null
        } : re.IntervalShowPicInNewTab;
        ts.IntervalShowPicInCSS = re.IntervalShowPicInCSS == undefined ? {
            times: 1,
            paths: null
        } : re.IntervalShowPicInCSS;
        ts.DecoratePluginsUrlRegex = re.DecoratePluginsUrlRegex == undefined ? "\.\*" : re.DecoratePluginsUrlRegex;
        ts.ClockInCSS = re.ClockInCSS == undefined ? false : re.ClockInCSS;
        ts.ClockInNewTab = re.ClockInNewTab == undefined ? false : re.ClockInNewTab;
        ts.ClockOptions = re.ClockOptions == undefined ? {} : re.ClockOptions;
        ts.bookmarksOptions = re.bookmarksOptions ? re.bookmarksOptions : {
            showBookmarks: true,
            bookmarksAutoShrink: true,
            mainBookNum: 10
        };
        ts.remindTime = re.remindTime ? re.remindTime : {
            remindInterval: 30,
            ringtone: 'default',
            desktopNotify: false,
            enableSound: false,
            soundLoop: false
        };
        ts.recentlyUsedPicturesOpt = re.recentlyUsedPicturesOpt ? re.recentlyUsedPicturesOpt : {
            recentlyUsedPicturesNum: 9999
        };
        ts.inPageSearchOptions = re.inPageSearchOptions ? re.inPageSearchOptions : {
            searchEngine: 'https://cn.bing.com/images/search?q=',
            searchEngineParams: '&FORM=BESBTB&first=1&cw=1562&ch=909&ensearch=1',
            closeInPageSearchByClickOutsideSearchPage: true
        }

        ts.otherOptions = re.otherOptions ? re.otherOptions : { // first time install extension   
            notifyUndoneTabSessionOnlyOnNewtab: false,
            intervalOpenSpecificURL: [],
            intervalOpenSpecificURLTimeMinutes: 180,
            ConfigPicturesPathType_SavePictureBase64DataToBroswer: getBroswerType() == "firefox" ? true : false,
            loadImageDataToMemoryIntervalMillisecondAvoidOccupyTooLargeMemory: 200,
            pickNextPictureInBackground: true,
            notifyBackupTabSessionIntervalDay: 3,
            notify_UndoneTabSession_InBackground_IntervalMinutes: 180,
            background_Refresh_Notify_Task_Preferences_IntervalSecond: 120,
            BackupTabSessionLastTime: "Mon Aug 11 2000",
            is_ScrollTopOrBottom_Bar_RightTop: true
        }
        cache.otherOptions = ts.otherOptions

        if (navigator.userAgent.toLowerCase().indexOf("android") >= 0 || navigator.userAgent.toLowerCase().indexOf("mobile") >= 0) {
            ts.otherOptions.pickNextPictureInBackground = false
        }


        ts.UserAgentOptions = re.UserAgentOptions ? re.UserAgentOptions : {
            UserAgent: "chromeMac",
            UserAgents: ["chromeMac", "chromeIphone", "chromeIpad", "safariMac", "KW"],
            chromeMac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36",
            chromeIphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/84.0.4147.105 Mobile/15E148 Safari/604.1",
            chromeIpad: "Mozilla/5.0 (iPad; CPU OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/84.0.4147.105 Mobile/15E148 Safari/604.1",
            safariMac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15",
            KW: "Mozilla/5.0 (KW) AppleWebKit/605.1.15 (KHTML, like Gecko)"

        }
        cache.UserAgent = ts.UserAgentOptions[ts.UserAgentOptions.UserAgent];
        if (cache.UserAgent == undefined) {
            cache.UserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15";
        }
        ts.saveFullHtmlOptions = re.saveFullHtmlOptions ? re.saveFullHtmlOptions : {
            timeoutForEachResourceRequest: 8,
            timeoutForAllResourceRequest: 18,
            maxWidthForSavedImages: 800,
            maxHeightForSavedImages: 800

        }
        if (re.remindTime) {
            cache.remindTime = re.remindTime;
            cache.remindTime.ringtone = dealPath(re.remindTime.ringtone);
        } else {
            cache.remindTime = {
                remindInterval: 30,
                ringtone: 'default',
                desktopNotify: false,
                enableSound: false,
                soundLoop: false
            }
        }
        if (re.recentlyUsedPicturesOpt) {
            cache.recentlyUsedPicturesNum = re.recentlyUsedPicturesOpt.recentlyUsedPicturesNum;
        } else {
            cache.recentlyUsedPicturesNum = 9999;
        }
        setStore(ts);
    });
    /////////////////////////////////////////////////////////////////
    let blockItems = ['blockException', 'blockTrackerAndAdOptions', 'blockTrackerUrl', 'blockAdSite', "blockScriptOptions"];
    getStore(blockItems).then(function (re) {
        let ts = {};
        ts.blockItems = blockItems;
        //  ['sub_frame', 'script', 'image', 'object', 'xmlhttprequest', 'other', 'stylesheet', 'ping']
        //  blockTypes: ['thirdPartySubFrame','tracker','ads']
        ts.blockTrackerAndAdOptions = re.blockTrackerAndAdOptions ? re.blockTrackerAndAdOptions : { // 
            ifBlockAds: false,
            ifBlockTracker: false,
            ifBlockThirdPartySubFrame: true,
            blockSubFrameType: 'redirectUrl',
            subFrameRedirectUrl: 'blockItems:',
            subFrameExcludeSites: [],
            subFrameNotBlockWithString: ["&ccFrom=ccGetCSS"],
            subFrameNotBlockedFromURL: ["www4.bing.com", "www.bing.com", "cn.bing.com", "www.google.com"],
            sitePermitTracker: {
                "baijiahao.baidu.com": ["bdstatic.com"],
                "baike.baidu.com": ["bdstatic.com"],
                "graph.baidu.com": ["bdstatic.com"],
                "image.baidu.com": ["bdstatic.com"],
                "jingyan.baidu.com": ["bdstatic.com"],
                "sv.baidu.com": ["bdstatic.com"],
                "tieba.baidu.com": ["bdstatic.com"],
                "www.baidu.com": ["bdstatic.com"],
                "google.com": ["gstatic.com"],
                "www.google.com": ["gstatic.com"],
                "accounts.google.com": ["gstatic.com"],
                "youtube.com": ["gstatic.com"]
            }
        };
        cache.blockTrackerAndAdOptions = ts.blockTrackerAndAdOptions;
        ts.blockTrackerAndAdOptions.subFrameNotBlockWithString = re.blockTrackerAndAdOptions ? re.blockTrackerAndAdOptions.subFrameNotBlockWithString : ["&ccFrom=ccGetCSS"]
        //
        ts.blockTrackerUrl = re.blockTrackerUrl ? re.blockTrackerUrl : ['4paradigm.com', 'pos.baidu.com', 'eclick.baidu.com', 'crs.baidu.com', 'miaozhen.com', 'hm.baidu.com', 'baidustatic.com', 'google-analytics.com', 'doubleclick.net', 'bdstatic.com', 'googlesyndication.com', 'adservice.google.com', 'cnzz.com'];
        cache.blockTrackerUrl = ts.blockTrackerUrl;

        ts.blockAdSite = re.blockAdSite ? re.blockAdSite : [];
        cache.blockAdSite = ts.blockAdSite;

        ts.blockScriptOptions = re.blockScriptOptions ? re.blockScriptOptions : {
            isBlockScriptFile: false,
            isBlockScriptInline: false,
            notBlockSites: [],
            domainNameWithCountryCode: [".com.cn"],
            NotBlockSubDomain: []
        }
        if (ts.blockScriptOptions.domainNameWithCountryCode == undefined) {
            ts.blockScriptOptions.domainNameWithCountryCode = [".com.cn"]
        }
        cache.blockScriptOptions = ts.blockScriptOptions

        cache.blockException = re.blockException ? re.blockException : {}
        cache.pauseBlockTrackerCount = undefined


        cache.BlockedTrackerTabs = {};
        cache.BlockedThirdPartySubFrameTabs = {};

        setStore(ts, {
            setNullAfterStore: true
        })
        re = null;

    });


    getStore(['hiddenValues']).then(function (re) {
        if (!re.hiddenValues) {
            setStore({
                hiddenValues: {}
            })
        }
    })
    chrome.bookmarks.getTree(function (re) {
        setStore({
            chromeBookmarks: re
        });
    })

    defaultCssFunction();

    getStore(['csFunctions', 'csFunctionsDelayTime']).then((re) => {
        cache.csFunction = {
            csFunctions: re.csFunctions,
            csFunctionsDelayTime: re.csFunctionsDelayTime
        }
        customFunctions({
            background_cache: cache
        })
    })
    //////////////////// 

    loadPicturesCategoriesToCache(cache);
}

function intervalEvents() {

    let soundPlaying = false;
    let soundReloaded = false;
    let night = false;
    let sound = document.createElement('audio');
    sound.loop = false;

    let cycleNum = 0;

    setInterval(function () {
        try {

            cycleNum++;
            ///////////////////////// 
            advanceSettingTakeEffect();
            blockItemsSettingTakeEffect();

            chrome.idle.queryState(15, function (IdleState) {
                if ("locked" != IdleState) {
                    notifyUndoneTabSession()
                    intervalOpenSpecificURL()
                    notifyBackupTabSession()
                }
            })
            //////////////////////////

            if (cache.pauseBlockAllCount >= 0 && cache.pauseBlockAllCount <= cache.pauseBlockCycleTimes) {
                cache.pauseBlockAllCount = cache.pauseBlockAllCount + 1
            } else {
                cache.pauseBlockAllCount = undefined
            }

            if (cache.pauseBlockAnyThisTabTemporaryCount >= 0 && cache.pauseBlockAnyThisTabTemporaryCount <= cache.pauseBlockCycleTimes) {
                cache.pauseBlockAnyThisTabTemporaryCount = cache.pauseBlockAnyThisTabTemporaryCount + 1
            } else {
                cache.pauseBlockAnyThisTabTemporaryCount = undefined
                cache.pauseBlockAnyThisTabTemporaryTabId = undefined
            }

            if (cache.pauseBlockTrackerCount >= 0 && cache.pauseBlockTrackerCount <= cache.pauseBlockCycleTimes) {
                cache.pauseBlockTrackerCount = cache.pauseBlockTrackerCount + 1
            } else {
                cache.pauseBlockTrackerCount = undefined
                cache.pauseBlockTrackerTabId = undefined
            }
            if (cache.pauseBlockThirdPartySubFrameCount >= 0 && cache.pauseBlockThirdPartySubFrameCount <= cache.pauseBlockCycleTimes) {
                cache.pauseBlockThirdPartySubFrameCount = cache.pauseBlockThirdPartySubFrameCount + 1
            } else {
                cache.pauseBlockThirdPartySubFrameCount = undefined
                cache.pauseBlockThirdPartySubFrameTabId = undefined
            }
            /////////////////////////
            sound.loop = cache.remindTime.soundLoop ? true : false;
            cache.remindTime.sound = sound;

            if (!soundPlaying && cache.remindTime.ringtone && cache.remindTime.ringtone != 'default' && checkExists(cache.remindTime.ringtone)) {
                sound.src = cache.remindTime.ringtone;
            } else {
                if (!soundPlaying) {
                    sound.src = "../Ringtones/clockDingDing.mp3";
                }
            }
            let now = new Date();
            let sec = now.getSeconds();
            let min = now.getMinutes();
            let hour = now.getHours();

            if (hour >= 7 && hour < 23) {
                night = false;
            } else {
                if (cycleNum >= 5) {
                    cycleNum = 0;
                    night = true;
                } else {
                    night = false;
                }
            }


            if ((60 - min) <= 5 || (60 - min) >= 55 || night) {
                let title = (60 - min) >= 55 ? ("Time  Be:  " + hour + "  O'Clock !") : ("Time Will Be:  " + (hour + 1) + "  O'Clock !");
                let body = 'Now Time:  ' + now.toDateString() + '  ' + hour + ':' + min + ":" + sec;

                if (cache.remindTime.desktopNotify) {
                    desktopNotify(title, body, {
                        hideTime: 300 * 1000
                    });
                }
                if (!soundPlaying && cache.remindTime.enableSound && hour >= 8 && hour < 23) {
                    sound.play();
                    soundPlaying = true;
                    soundReloaded = false;

                }
            } else {
                sound.pause();
                if (!soundReloaded) {
                    sound.load();
                    soundReloaded = true;
                }
                soundPlaying = false;

            }
            ///////////////////////////
        } catch (e) {
            pushAndStoreErrorLogArray({
                error: e
            })
            log.error(e)
        }
    }, 1000 * cache.otherOptions.background_Refresh_Notify_Task_Preferences_IntervalSecond);
};


function csFunctionSettingTakeEffect(param = "") {
    getStore(['csFunctions', 'csFunctionsDelayTime']).then((re) => {
        cache.csFunction = {
            csFunctions: re.csFunctions,
            csFunctionsDelayTime: re.csFunctionsDelayTime
        }
    })
}
/**
 * 
 * @param {string} from   manual or auto
 */
function blockItemsSettingTakeEffect(from) {
    try {

        from = from || 'auto'
        getStore(['blockTrackerAndAdOptions', 'blockTrackerUrl', 'blockAdSite', 'blockScriptOptions']).then(function (re) {

            cache.blockTrackerAndAdOptions = re.blockTrackerAndAdOptions ? re.blockTrackerAndAdOptions : {
                ifBlockAds: true,
                ifBlockTracker: false,
                ifBlockThirdPartySubFrame: true,
                ifBlockAds: true,
                ifBlockThirdPartySubFrame: true,
                blockSubFrameType: 'redirectUrl',
                subFrameRedirectUrl: 'blockItems:',
                subFrameExcludeSites: [],
                subFrameNotBlockWithString: [],
                subFrameNotBlockedFromURL: ["www4.bing.com", "www.bing.com", "cn.bing.com", "www.google.com"],
                sitePermitTracker: {
                    "baijiahao.baidu.com": ["bdstatic.com"],
                    "baike.baidu.com": ["bdstatic.com"],
                    "graph.baidu.com": ["bdstatic.com"],
                    "image.baidu.com": ["bdstatic.com"],
                    "jingyan.baidu.com": ["bdstatic.com"],
                    "sv.baidu.com": ["bdstatic.com"],
                    "tieba.baidu.com": ["bdstatic.com"],
                    "www.baidu.com": ["bdstatic.com"],
                    "google.com": ["gstatic.com"],
                    "www.google.com": ["gstatic.com"],
                    "accounts.google.com": ["gstatic.com"],
                    "youtube.com": ["gstatic.com"]
                }
            };
            cache.blockTrackerUrl = re.blockTrackerUrl ? re.blockTrackerUrl : ['4paradigm.com', 'miaozhen.com', 'hm.baidu.com', 'baidustatic.com', 'google-analytics.com', 'doubleclick.net', 'bdstatic.com', 'googlesyndication.com', 'adservice.google.com', 'cnzz.com'];
            cache.blockAdSite = re.blockAdSite ? re.blockAdSite : [];

            cache.blockScriptOptions = re.blockScriptOptions ? re.blockScriptOptions : {
                isBlockScriptFile: false,
                isBlockScriptInline: false,
                notBlockSites: [],
                domainNameWithCountryCode: [".com.cn", ".co.uk"],
                NotBlockSubDomain: []
            }

        });


    } catch (e) {
        pushAndStoreErrorLogArray({
            error: e
        })
        log.error(e)
    }
}

function advanceSettingTakeEffect() {
    try {
        getStore(cache.advanceItems).then(function (re) {
            cache.remindTime = re.remindTime
            cache.remindTime.ringtone = dealPath(re.remindTime.ringtone);

            cache.otherOptions = re.otherOptions

            cache.UserAgent = re.UserAgentOptions[re.UserAgentOptions.UserAgent];
            if (cache.UserAgent == undefined) {
                cache.UserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15";
            }

            let recentlyUsedPicturesNum = re.recentlyUsedPicturesOpt

            if (cache.recentlyUsedPicturesNum > recentlyUsedPicturesNum) {
                getStore(['recentlyUsedPictures']).then(function (re2) {
                    if ((re2.recentlyUsedPictures.length - recentlyUsedPicturesNum) > 0) {
                        for (let i = 0; i <= (re2.recentlyUsedPictures.length - recentlyUsedPicturesNum); i++) {
                            try {
                                re2.recentlyUsedPictures.pop();
                            } catch (error) {

                            }
                        }
                        setStore({
                            recentlyUsedPictures: re2.recentlyUsedPictures
                        });
                    }
                    cache.recentlyUsedPicturesNum = recentlyUsedPicturesNum;
                });
            } else {
                cache.recentlyUsedPicturesNum = recentlyUsedPicturesNum;
            }
            loadPicturesCategoriesToCache(cache)
        });

        chrome.bookmarks.getTree(function (re) {
            setStore({
                chromeBookmarks: re
            });
            re = null;
        })
    } catch (e) {
        pushAndStoreErrorLogArray({
            error: e
        })
        log.error(e)
    }
}
/**
 * 
 * 
 */
function notifyBackupTabSession() {

    try {
        getStore(["TabsSession"]).then((re) => {
            let now = new Date();
            let notify = false
            if (!re.TabsSession || !re.TabsSession.manualSavedTabsSessionObjects || (Object.keys(re.TabsSession.manualSavedTabsSessionObjects)).length == 0) {
                return
            }
            if (cache.otherOptions.notifyBackupTabSessionIntervalDay == 0) {
                return
            }
            if (cache.otherOptions.notifyBackupTabSessionIntervalDay == undefined || cache.otherOptions.BackupTabSessionLastTime == undefined) {
                notify = true
            } else if ((now.getTime() - (new Date(cache.otherOptions.BackupTabSessionLastTime)).getTime()) > cache.otherOptions.notifyBackupTabSessionIntervalDay * 24 * 60 * 60 * 1000) {
                notify = true
            }
            if (notify) {
                desktopNotify(" Backup TabSession Notify", "    Plase Export/Backup TabSession And Bookmarks !\n    set notifyBackupTabSessionIntervalDay:0 of otherOptions in Advance to disable notify")
            }
        })
    } catch (e) {
        pushAndStoreErrorLogArray({
            error: e
        })
        log.error(e)
    }
}




function StopRemindTimeSound() {
    cache.remindTime.sound.pause();
}

function intervalOpenSpecificURL() {
    try {
        if (cache.lock_intervalOpenSpecificURL) {
            if (cache.lock_intervalOpenSpecificURL_count) {
                cache.lock_intervalOpenSpecificURL_count++
                if (cache.lock_intervalOpenSpecificURL_count >= 5) {
                    cache.lock_intervalOpenSpecificURL = false
                    cache.lock_intervalOpenSpecificURL_count = 0
                }
            } else {
                cache.lock_intervalOpenSpecificURL_count = 1
            }
            return
        }
        cache.lock_intervalOpenSpecificURL = true

        let notify = false
        if (cache.otherOptions.intervalOpenSpecificURLTimeMinutes == undefined || cache.previous_OpenSpecificURL_time == undefined) {
            notify = true
        } else if (((new Date()).getTime() - cache.previous_OpenSpecificURL_time) > cache.otherOptions.intervalOpenSpecificURLTimeMinutes * 1000 * 60) {
            notify = true
        }
        if (notify) {
            if (cache.otherOptions.intervalOpenSpecificURL.length > 0) {
                cache.previous_OpenSpecificURL_time = (new Date()).getTime()
                chrome.windows.create({
                    url: cache.otherOptions.intervalOpenSpecificURL,
                    focused: true
                }, () => {
                    let unlock_intervalOpenSpecificURL_timeout = setTimeout(() => {
                        cache.lock_intervalOpenSpecificURL = false
                        setStore({
                            otherOptions: cache.otherOptions
                        })
                        clearTimeout(unlock_intervalOpenSpecificURL_timeout)
                    }, 15000)
                })
            } else {
                cache.lock_intervalOpenSpecificURL = false
            }
        } else {
            let unlock_intervalOpenSpecificURL_timeout = setTimeout(() => {
                cache.lock_intervalOpenSpecificURL = false
                clearTimeout(unlock_intervalOpenSpecificURL_timeout)
            }, 15000)
        }

    } catch (e) {
        pushAndStoreErrorLogArray({
            error: e
        })
        log.error(e)
    }
}
/**
 * 
 * @param {string} info  this value may be : 'fromNewtab'
 */
function notifyUndoneTabSession(info) {
    info = info || null
    let notifyUndoneTabSessionTimeout = setTimeout(function () {
        clearTimeout(notifyUndoneTabSessionTimeout)

        if (!cache.otherOptions.notifyUndoneTabSessionOnlyOnNewtab || info == 'fromNewtab') {

            let notify = false

            if (cache.otherOptions.notify_UndoneTabSession_InBackground_IntervalMinutes == undefined || cache.previous_notify_UndoneTabSession_InBackground_time == undefined) {
                notify = true
                if (cache.otherOptions.notify_UndoneTabSession_InBackground_IntervalMinutes == undefined) {
                    cache.otherOptions.notify_UndoneTabSession_InBackground_IntervalMinutes = 180
                }
            } else if (((new Date()).getTime() - cache.previous_notify_UndoneTabSession_InBackground_time) > 1000 * 60 * cache.otherOptions.notify_UndoneTabSession_InBackground_IntervalMinutes) {
                notify = true
            }
            if (notify) {
                getStore('TabsSession').then(re => {
                    if (re.TabsSession != undefined && (Object.keys(re.TabsSession.manualSavedTabsSessionObjects)).length > 0) {
                        cache.previous_notify_UndoneTabSession_InBackground_time = (new Date()).getTime()
                        chrome.windows.create({
                            url: [cache.TabsSessionUrl + "?from=notify"],
                            focused: true
                        }, null);
                    }
                    setStore({
                        otherOptions: cache.otherOptions
                    })
                })

            }
        }
    }, 300)
}





function chromeTabsOnRemoved() {};

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) { // removeInfo : windowId,isWindowClosing	

    try {
        if (cache.allTabsId[tabId] && isElementStartsWithStringInArray(cache.allTabsId[tabId].urlGoDomain, cache.skipSchemeHeaders)) {

        } else {
            autoSaveTabsInfo()
        }
        delete cache.BlockedTrackerTabs[tabId];
        delete cache.BlockedThirdPartySubFrameTabs[tabId];
        delete cache.allTabsId[tabId]
        delete cache.blockedScriptTabs[tabId]
        // console.log("onRemoved",removeInfo);
    } catch (e) {
        pushAndStoreErrorLogArray({
            error: e
        })
        log.error(e)
    }
});

// chrome.tabs.onCreated.addListener(function (tab) { // removeInfo : windowId,isWindowClosing	
//     autoSaveTabsInfo();
//     console.log("onCreated");
// });

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) { // removeInfo : windowId,isWindowClosing	 
    if (changeInfo.status != "loading") {
        return
    }

    if (isElementStartsWithStringInArray(tab.url, cache.skipSchemeHeaders)) {
        return
    } else {
        autoSaveTabsInfo();
    }



    // console.log("onUpdated",changeInfo);
});

function autoSaveTabsInfo() {
    let autoSaveTabsInfoTimeOut = setTimeout(() => {
        chrome.tabs.query({}, (arr) => {
            let time = getCurrentTime()
            let cu = {};
            cu.tabs = arr;
            cu.name = "AutoSaved"
            cu.time = time
            cu.type = 'AutoSaved'
            // cu.id=newTabsSessionId()
            setStore({
                TabsSessionAutoSaved: cu
            }, {
                setNullAfterStore: true
            });
        })
        clearTimeout(autoSaveTabsInfoTimeOut)
    }, 3500);

}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
chrome.contextMenus.removeAll();
chrome.contextMenus.create({
    contexts: ["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio", "browser_action", "page_action"],
    title: 'InPageSearch: \"%s\"'
});


// contextMenusInternal.OnClickData	info,tabs.Tab	tab
chrome.contextMenus.onClicked.addListener(function (info, tab) {

    chrome.tabs.sendMessage(tab.id, {
        'contextMenuId': info.menuItemId,
        'info': info
    }, function (response) {});
});

/**
 * 
 * @param    details : webRequest
 */
function reZeroSomeCount(details) {
    try {

        let initiatorReg = /^(https?\:\/\/[^\/]+).*/
        let initiatorUrl = details.url.replace(initiatorReg, "$1")

        if (cache.BlockedTrackerTabs[details.tabId]) {
            cache.BlockedTrackerTabs[details.tabId] = {
                trackerCount: 0,
                trackersURL: [],
                TabURL: initiatorUrl
            }
        }
        if (cache.BlockedThirdPartySubFrameTabs[details.tabId]) {
            cache.BlockedThirdPartySubFrameTabs[details.tabId] = {
                ThirdPartySubFrameCount: 0,
                ThirdPartySubFrameURL: [],
                TabURL: initiatorUrl
            }
        }
        if (cache.blockedScriptTabs[details.tabId]) {
            cache.blockedScriptTabs[details.tabId] = {
                ScriptCount: 0,
                ScriptURLs: [],
                TabURL: initiatorUrl
            }
        }
        return {
            cancel: false
        }

    } catch (e) {
        pushAndStoreErrorLogArray({
            error: e
        })
        log.error(e)
    }
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function chromeWebRequestOnBeforeRequest() {};

chrome.webRequest.onHeadersReceived.addListener(info => {
    try {
        customFunctions({
            background_Headers: info
        })

        const headers = info.responseHeaders; // original headers

        let srcGo = "";
        for (let srcT = 0; srcT < cache.blockTrackerAndAdOptions.subFrameNotBlockedFromURL.length; srcT++) {
            try {
                srcGo = srcGo + " " + cache.blockTrackerAndAdOptions.subFrameNotBlockedFromURL[srcT] + " "
            } catch (error) {

            }
        }

        for (let i = headers.length - 1; i >= 0; --i) {
            try {
                let header = headers[i].name.toLowerCase();
                if (header === "content-security-policy") { // csp header is found

                    // modify frame-src here
                    headers[i].value = headers[i].value.replace("frame-src", "frame-src" + srcGo);
                    headers[i].value = headers[i].value.replace("child-src", "child-src" + srcGo);
                    headers[i].value = headers[i].value.replace("default-src", "default-src" + srcGo);
                    headers[i].value = headers[i].value.replace("img-src", " img-src  data: file: https: ");
                }
            } catch (error) {

            }
        }
        // return modified headers
        return {
            responseHeaders: headers
        }
    } catch (e) {
        pushAndStoreErrorLogArray({
            error: e
        })
        log.error(e)
    }
}, {
    urls: ["<all_urls>"] //, // match all pages
    //types: [ "sub_frame" ] // for framing only
}, ["blocking", "responseHeaders"]);

chrome.webRequest.onBeforeRequest.addListener(
    function (details) {

        try {
            customFunctions({
                background_Request: details
            })
            if (cache.BroswerType == "firefox") {
                details.initiator = details.documentUrl
            }


            let returnObj = {};


            if (cache.pauseBlockAllCount >= 0) {
                reZeroSomeCount(details)
                return {
                    cancel: false
                }
            }
            if (details.tabId == cache.pauseBlockAnyThisTabTemporaryTabId) {
                reZeroSomeCount(details)
                return {
                    cancel: false
                }
            }
            if (details.initiator != undefined && cache.blockException[details.initiator] != undefined) {
                if (cache.blockException[details.initiator].indexOf(details.url) >= 0) {
                    return {
                        cancel: false
                    }
                }
            }
            // change the cache,when the url change in same tab
            if (details.type == "main_frame") {
                reZeroSomeCount(details)
                let urlGoDomain = getMainDomainName(details.url, cache.blockScriptOptions)
                cache.allTabsId[details.tabId] = {
                    urlGoDomain: urlGoDomain
                }
            }
            // if Block Third Party Sub Frame
            if (details.parentFrameId >= 0) {
                if (details.type == "sub_frame" && cache.blockTrackerAndAdOptions.ifBlockThirdPartySubFrame && cache.pauseBlockThirdPartySubFrameTabId != details.tabId) {

                    let initiatorUrl = details.initiator ? getMainDomainName(details.initiator, cache.blockScriptOptions) : null;
                    let urlGo = getMainDomainName(details.url, cache.blockScriptOptions)

                    let urlReg = /^https?\:\/\/((?:[^\/\.]+\.){1,}\w+)\/?.*/i
                    let urlPre = details.url.replace(urlReg, "$1");

                    if (cache.blockTrackerAndAdOptions.subFrameExcludeSites.includes(initiatorUrl) || cache.blockTrackerAndAdOptions.subFrameNotBlockedFromURL.includes(urlPre) || isContainStringOfArray(cache.blockTrackerAndAdOptions.subFrameNotBlockWithString, details.url)) {
                        return {
                            cancel: false
                        };
                    }
                    if (initiatorUrl != null) {
                        if (urlGo.indexOf(initiatorUrl) == 0) {

                            return {
                                cancel: false
                            };
                        }
                    }

                    let urlGoDomain = getMainDomainName(details.url, cache.blockScriptOptions)
                    if (cache.allTabsId[details.tabId].urlGoDomain == urlGoDomain) {
                        return {
                            cancel: false
                        };
                    }
                    if (cache.BlockedThirdPartySubFrameTabs[details.tabId]) {
                        if (!cache.BlockedThirdPartySubFrameTabs[details.tabId].ThirdPartySubFrameURL.includes(urlPre)) {
                            cache.BlockedThirdPartySubFrameTabs[details.tabId].ThirdPartySubFrameURL.push(urlPre);
                            cache.BlockedThirdPartySubFrameTabs[details.tabId].ThirdPartySubFrameCount = cache.BlockedThirdPartySubFrameTabs[details.tabId].ThirdPartySubFrameURL.length
                        }
                    } else {
                        cache.BlockedThirdPartySubFrameTabs[details.tabId] = {
                            ThirdPartySubFrameCount: 1,
                            ThirdPartySubFrameURL: [urlPre],
                            TabURL: details.initiator
                        };
                    }

                    if (cache.blockTrackerAndAdOptions.blockSubFrameType == 'redirectUrl') { //  redirectUrl  blockRequest

                        return {
                            redirectUrl: cache.blockTrackerAndAdOptions.subFrameRedirectUrl
                        }; //  blockItems:  data:
                    } else {

                        return {
                            cancel: true
                        };
                    }

                }

            }

            // if Block Tracker
            if (cache.blockTrackerAndAdOptions.ifBlockTracker && cache.pauseBlockTrackerTabId != details.tabId) {

                let urlRootReg = /^https?\:\/\/((?:[^\/\.]+\.){1,}\w+)\/?.*/i;
                let urlGo = details.url.replace(urlRootReg, "$1");
                let initiatorUrl = details.initiator ? details.initiator.replace(urlRootReg, "$1") : null;

                let urlGoDomain = getMainDomainName(details.url, cache.blockScriptOptions)

                let resultOfCheck = checkBlockTrackerUrl(cache.blockTrackerUrl, initiatorUrl, urlGo, urlGoDomain, details.url)

                if (resultOfCheck.ifBlock) {

                    if (cache.BlockedTrackerTabs[details.tabId]) {
                        if (!cache.BlockedTrackerTabs[details.tabId].trackersURL.includes(resultOfCheck.tracker)) {
                            cache.BlockedTrackerTabs[details.tabId].trackersURL.push(resultOfCheck.tracker)
                            cache.BlockedTrackerTabs[details.tabId].trackerCount = cache.BlockedTrackerTabs[details.tabId].trackersURL.length
                        }
                    } else {
                        cache.BlockedTrackerTabs[details.tabId] = {
                            trackerCount: 1,
                            trackersURL: [resultOfCheck.tracker],
                            TabURL: details.initiator
                        };
                    }

                    if (cache.blockTrackerAndAdOptions.blockSubFrameType == 'redirectUrl') { //  redirectUrl  blockRequest

                        return {
                            redirectUrl: cache.blockTrackerAndAdOptions.subFrameRedirectUrl
                        }; //  blockItems:  data:
                    } else {

                        return {
                            cancel: true
                        };
                    }
                }

            }
            // if Block Ads
            if (cache.blockTrackerAndAdOptions.ifBlockAds) {
                let urlRootReg = /^https?\:\/\/((?:[^\/\.]+\.){1,}\w+)\/?.*/i;
                let urlGo = details.url.replace(urlRootReg, "$1");
                let initiatorUrl = details.initiator ? details.initiator.replace(urlRootReg, "$1") : null;

                let urlGoDomain = getMainDomainName(details.url, cache.blockScriptOptions)

                let resultOfCheck = checkBlockTrackerUrl(cache.blockTrackerUrl, initiatorUrl, urlGo, urlGoDomain, details.url)
                if (resultOfCheck.ifBlock) {

                    if (cache.blockTrackerAndAdOptions.blockSubFrameType == 'redirectUrl') { //  redirectUrl  blockRequest

                        return {
                            redirectUrl: cache.blockTrackerAndAdOptions.subFrameRedirectUrl
                        }; //  blockItems:  data:
                    } else {

                        return {
                            cancel: true
                        };
                    }
                }

            }
            // Block Script
            if (details.type == "script" && checkBlockScript(details)) {
                return {
                    redirectUrl: cache.blockTrackerAndAdOptions.subFrameRedirectUrl
                };
            }

            return returnObj;
        } catch (e) {
            pushAndStoreErrorLogArray({
                error: e
            })
            log.error(e)
        }
    },

    {
        urls: ["<all_urls>"]
    }, //监听页面请求,也可以通过*来匹配
    ["blocking"]
);


function checkBlockScript(details) {
    if (cache.BroswerType == "firefox") {
        details.initiator = details.documentUrl
    }

    if (cache.blockScriptOptions.isBlockScriptFile == false) {
        return false
    }

    let urlHead_initiator = null
    if (details.url.indexOf("file:///") == 0) {
        urlHead_initiator = "file:///"
    } else {
        urlHead_initiator = getMainDomainName(details.initiator, cache.blockScriptOptions)
    }

    let mainDomainName = null
    if (details.url.indexOf("file:///") == 0) {
        mainDomainName = "file:///"
    } else {
        mainDomainName = getMainDomainName(details.url, cache.blockScriptOptions)
    }

    if (cache.blockScriptOptions.notBlockSites.includes(mainDomainName) || cache.blockScriptOptions.notBlockSites.includes(urlHead_initiator)) {
        return false
    }

    let subDomainName = getSubDomainName(details.url)
    let subDomainName2 = getSubDomainName(details.initiator)
    if (cache.blockScriptOptions.NotBlockSubDomain != undefined && (cache.blockScriptOptions.NotBlockSubDomain.includes(subDomainName) || cache.blockScriptOptions.NotBlockSubDomain.includes(subDomainName2))) {
        return false
    }

    if (details.type == 'script' && cache.blockScriptOptions.isBlockScriptFile && !isElementStartsWithStringInArray(details.url, cache.skipSchemeHeaders)) {
        if (cache.blockedScriptTabs[details.tabId]) {

            if (cache.blockedScriptTabs[details.tabId].ScriptURLs.indexOf(details.url) < 0) {
                cache.blockedScriptTabs[details.tabId].ScriptURLs.push(details.url)
                cache.blockedScriptTabs[details.tabId].ScriptCount = cache.blockedScriptTabs[details.tabId].ScriptURLs.length
            }
        } else {
            cache.blockedScriptTabs[details.tabId] = {
                ScriptCount: 1,
                ScriptURLs: [details.url],
                TabURL: details.initiator
            };
        }

        return true
    } else {
        return false
    }
}

function checkBlockTrackerUrl(urlArray, initiatorUrl, urlGo, urlGoDomain, url) {
    //ss1.bdstatic.com https://www.baidu.com
    //  sitePermitTracker:{"www.baidu.com":["bdstatic.com"]}

    if (cache.blockTrackerAndAdOptions.sitePermitTracker[initiatorUrl]) {
        if (cache.blockTrackerAndAdOptions.sitePermitTracker[initiatorUrl].includes(urlGoDomain)) {
            return {
                ifBlock: false,
                tracker: ''
            }
        }
    }
    let re = {
        ifBlock: false,
        tracker: ''
    }
    urlArray.some(function (currentValue) {
        if (currentValue == urlGo) {
            re.ifBlock = true
            re.tracker = currentValue
            return true
        } else if (urlGo.indexOf(currentValue) >= 0) {
            re.ifBlock = true
            re.tracker = currentValue
            return true
        } else if (url.indexOf(currentValue) >= 0) {
            re.ifBlock = true
            re.tracker = currentValue
            return true
        } else {
            re.ifBlock = false
            re.tracker = ''
            return false
        }
    });
    // if(re.ifBlock){
    //
    // }
    return re
}

function pauseBlockTrackerTemporary() {

    cache.pauseBlockTrackerCount = 0;

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        cache.pauseBlockTrackerTabId = (tabs.length ? tabs[0].id : null);
    });


}

function unPauseBlockTrackerTemporary() {

    cache.pauseBlockTrackerCount = undefined
    cache.pauseBlockTrackerTabId = undefined


}

function pauseBlockThirdPartySubFrameTemporary() {
    cache.pauseBlockThirdPartySubFrameCount = 0;
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        cache.pauseBlockThirdPartySubFrameTabId = (tabs.length ? tabs[0].id : null);
    });

}

function unPauseBlockThirdPartySubFrameTemporary() {

    cache.pauseBlockThirdPartySubFrameCount = undefined
    cache.pauseBlockThirdPartySubFrameTabId = undefined

}

function pauseBlockAnyThisTabTemporary() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        cache.pauseBlockAnyThisTabTemporaryTabId = (tabs.length ? tabs[0].id : null);
        cache.pauseBlockAnyThisTabTemporaryCount = 0
    });
}

function unpauseBlockAnyThisTabTemporary() {
    cache.pauseBlockAnyThisTabTemporaryTabId = undefined
    cache.pauseBlockAnyThisTabTemporaryCount = undefined
}

function pauseBlockAllTemporary() {

    cache.pauseBlockAllCount = 0;


}

function unPauseBlockAllTemporary() {
    cache.pauseBlockAllCount = undefined

}
///////////////////////////////////////////////////////////////////////////////////