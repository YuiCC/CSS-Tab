function newTabsSessionId(oldId = 1) {
    let TabsSessionId = getCurrentTime() + "" + UUID(32, 34)
    return TabsSessionId
}


/**
 * 
 * @param {object} params  eg: {param1:details}
 */
function customFunctions(params = {}) {

    if (cache.csFunction == undefined) {
        return
    } else {
        if (!cache.csFunction.csFunctions) {
            return
        } else if (Object.keys(cache.csFunction.csFunctions).length == 0) {
            return
        }
        for (let key of Object.keys(cache.csFunction.csFunctions)) {
            try {
                let regexp = new RegExp(key, "ig");
                regexp = eval(regexp);
                if (regexp.test(window.location.href)) {
                    let csFunction = new Function("params", cache.csFunction.csFunctions[key])
                    if (cache.name == "background" && window.location.href.indexOf("chrome-extension://") == 0 && key.indexOf("chrome-extension://") >= 0) {
                        csFunction(params)
                    } else if (cache.name != "background" && key.indexOf("chrome-extension://") == -1) {
                        let delayLoadCSFunctionTimeout = setTimeout(function () {
                            csFunction(params)
                            clearTimeout(delayLoadCSFunctionTimeout)
                        }, cache.csFunction.csFunctionsDelayTime)
                    }
                }
            } catch (e) {
                console.error(e);
                pushAndStoreErrorLogArray({
                    error: e
                })
            }

        }
    }

}

function defaultCssFunction() {
    getStore(['config_default_css_first', 'config_css']).then(function (ob) {
        if (ob.config_css != undefined) {
            return
        }
        if (ob.config_default_css_first == undefined || ob.config_default_css_first == null || ob.config_default_css_first == true) {
            setStore({
                config_default_css_first: true,
                config_css: cssExample,
                ifPictureBackground: true,
                oldSetPicTime: 00000000
            }, true);

            let defaultPictureBase64Timeout = setTimeout(function () {
                getPictureBase64(defaultPicture, 'nextPictureBase64').then(function (object) {

                    setStore({
                        currentPicture: defaultPicture,
                        oldSetPicTime: 000000000,
                        nextPicture: defaultPicture,
                        nextPictureBase64: object.nextPictureBase64
                    });
                    object = null;
                });
                clearTimeout(defaultPictureBase64Timeout);
            }, 500);
        }
    });


};

function picturesCategoriesGetNextCallback() {
    getStore(['picturesCategories']).then((re) => {
        re.picturesCategories  = cache.pCat 
        setStore({
            picturesCategories: re.picturesCategories
        })
    })
}

function pickAndSelectRoundPicture(picturePathsNumberArrayObject, currentPicture) {
    try {

        let picturePathsNumberArray = null
        if (cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer == false) {
            picturePathsNumberArray = picturePathsNumberArrayObject.pictureOnlySavedPathName;
        } else {
            picturePathsNumberArray = picturePathsNumberArrayObject.pictureSavedAsBase64Name;
        }

        let picturePathsNumber = 0;
        if (picturePathsNumberArray != undefined) {
            picturePathsNumber = picturePathsNumberArray.length;
        } else {
            setPicture(defaultPicture, true);
            return
        }
        if (picturePathsNumber == 0) {
            setPicture(defaultPicture, true);
            return
        }
        let selectedPicture = null
        let selectPictureIndex = null

        if (cache.pCat.pictureOnlySavedPathName.config.categoriesNameRandomArray.length > 0 && cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer == false) {
            selectedPicture = cache.pCat.pictureOnlySavedPathName.getNext(picturesCategoriesGetNextCallback)
        } else if (cache.pCat.pictureSavedAsBase64Name && cache.pCat.pictureSavedAsBase64Name.config.categoriesNameRandomArray.length > 0 && cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer == true) {
            selectedPicture = cache.pCat.pictureSavedAsBase64Name.getNext(picturesCategoriesGetNextCallback)
        } else {
            selectPictureIndex = getRandomNum(min = 0, max = (picturePathsNumber - 1))

            if (selectPictureIndex == picturePathsNumber) {
                selectPictureIndex = selectPictureIndex - 1;
            }
            selectedPicture = picturePathsNumberArray[selectPictureIndex].trim();
        }

        //let selectedPictureTemp = selectedPicture;
        selectedPicture = dealPath(selectedPicture);

        setPicture(selectedPicture, true, selectPictureIndex);
        setStore({
            previousPicture: currentPicture
        })

    } catch (e) {
        setPicture(defaultPicture, true);
        pushAndStoreErrorLogArray({
            error: e
        })
        console.error(e);
        showMsgInfo(e)
    }

};


/**
 * 
 * @param {object} request  {currentPicture:"currentPictureName",ifPickNextPicture:true/false}
 */
function pickNextPicture(request) {

    pickNextPictureForPinPicInSites()
 
    let currentPicture = request.currentPicture;
    if (currentPicture == undefined) {
        return;
    } 
    let ifPickNextPicture = request.ifPickNextPicture;
    //  sendResponse({farewell: "goodbye"}); 

    getStore(['otherOptions', 'pictureSavedAsBase64Name', 'recentlyUsedPictures', 'IntervalShowPicInCSS', 'pictureOnlySavedPathName', 'oldSetPicTime', 'intervalTime', 'setPictureAsCssEternal', 'currentPicture', 'picturesThatNotExists']).then(function (result) {
        let date = new Date();
        let time = date.getTime();
        if (!result.otherOptions.pickNextPictureInBackground == true && result.otherOptions.ConfigPicturesPathType_SavePictureBase64DataToBroswer == false) {
            pushAndStoreErrorLogArray({
                error: "pickNextPictureInBackground must be true when ConfigPicturesPathType_SavePictureBase64DataToBroswer:false "
            })
            console.error("pickNextPictureInBackground must be true when ConfigPicturesPathType_SavePictureBase64DataToBroswer:false ");
            return
        }
        let oldSetPicTime = result.oldSetPicTime;
        let intervalTime = result.intervalTime;
        let setPictureAsCssEternal = result.setPictureAsCssEternal;
        let IntervalShowPicInCSS = result.IntervalShowPicInCSS;
        let recentlyUsedPictures = result.recentlyUsedPictures;

        cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer = result.otherOptions.ConfigPicturesPathType_SavePictureBase64DataToBroswer

        if (currentPicture == blackPicture) {
            currentPicture = defaultPicture;
        }
        let cutNum = result.pictureOnlySavedPathName.indexOf(dealPathToWin(currentPicture))
        recentlyUsedPicturesFunc(recentlyUsedPictures, currentPicture, cutNum != -1 ? cutNum : "");

        setStore({
            currentPicture: dealPath(currentPicture),
            previousPicture: dealPath(result.currentPicture)
        });

        if ((time - oldSetPicTime) > (1000 * intervalTime) && !setPictureAsCssEternal && ifPickNextPicture) {

            let nextPicture = null;

            if (IntervalShowPicInCSS.paths != null) {
                if (IntervalShowPicInCSS.IntervalTimesNow == undefined) {
                    IntervalShowPicInCSS.IntervalTimesNow = 0;
                    IntervalShowPicInCSS.IntervalPathsAryNow = 0;

                    nextPicture = pickAndSelectRoundPictureInBackground(result, currentPicture, 0, result.picturesThatNotExists);

                    setStore({
                        IntervalShowPicInCSS: IntervalShowPicInCSS
                    });

                } else {
                    IntervalShowPicInCSS.IntervalTimesNow = 1 + IntervalShowPicInCSS.IntervalTimesNow;
                    if (IntervalShowPicInCSS.IntervalTimesNow == IntervalShowPicInCSS.times + 1) {

                        nextPicture = IntervalShowPicInCSS.paths[IntervalShowPicInCSS.IntervalPathsAryNow];
                        if (cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer == false) {
                            if (!checkExists(nextPicture)) {
                                nextPicture = pickAndSelectRoundPictureInBackground(result, currentPicture, 0, result.picturesThatNotExists);
                            }
                        } else {
                            if (!result.pictureSavedAsBase64Name.includes(nextPicture)) {
                                nextPicture = pickAndSelectRoundPictureInBackground(result, currentPicture, 0, result.picturesThatNotExists);
                            }
                        }

                        IntervalShowPicInCSS.IntervalTimesNow = 0;
                        IntervalShowPicInCSS.IntervalPathsAryNow = 1 + IntervalShowPicInCSS.IntervalPathsAryNow >= IntervalShowPicInCSS.paths.length ? 0 : 1 + IntervalShowPicInCSS.IntervalPathsAryNow;
                        setStore({
                            IntervalShowPicInCSS: IntervalShowPicInCSS
                        });

                    } else {
                        nextPicture = pickAndSelectRoundPictureInBackground(result, currentPicture, 0, result.picturesThatNotExists);
                        setStore({
                            IntervalShowPicInCSS: IntervalShowPicInCSS
                        });
                    }
                }
            } else {
                nextPicture = pickAndSelectRoundPictureInBackground(result, currentPicture, 0, result.picturesThatNotExists);
            }
            if (nextPicture == undefined || nextPicture == null) {
                nextPicture = pickAndSelectRoundPictureInBackground(result, currentPicture, 0, result.picturesThatNotExists)
            }
            if (cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer == false) {
                getPictureBase64(nextPicture, 'nextPictureBase64').then(function (object) {
                    setStore(object);
                    let date = new Date();
                    let timePic = date.getTime();
                    setStore({
                        oldSetPicTime: timePic
                    });
                });
            } else {
                let date = new Date();
                let timePic = date.getTime();
                if (nextPicture != defaultPicture) {
                    getStore([nextPicture]).then(function (re) {
                        setStore({
                            oldSetPicTime: timePic,
                            nextPictureBase64: re[nextPicture]
                        });
                    })
                } else {
                    getStore(['defaultPictureBase64']).then(function (re) {
                        setStore({
                            oldSetPicTime: timePic,
                            nextPicture: defaultPicture,
                            nextPictureBase64: re.defaultPictureBase64
                        });
                    })
                }
            }


        }
    });


}



/**
 * @description pick Next Picture For Pin Specify Pictures In Some Sites
 *  paths  "D:\img1.jpg | D:\img2.jpg"
 */
function pickNextPictureForPinPicInSites() {
    getStore(['pinPicInSites']).then(function (object) {
        let pinPicInSites = object.pinPicInSites;

        if (pinPicInSites == undefined) {
            return;
        } else {

            for (let dis in pinPicInSites) {
                let paths = pinPicInSites[dis].path.trim().split("|")
                let random = getRandomNum(min = 0, max = paths.length - 1)
                getPictureBase64(paths[random].trim(), dis).then(function (object) {
                    let toSave = {}
                    toSave[dis + "-base64"] = object.tempBase64
                    setStore(toSave)
                })
            }

        }
    });
}


//  recentlyUsedPictures: Array type.
async function recentlyUsedPicturesFunc(recentlyUsedPictures, currentPicture, picturePathSequence, selectedPictureInfo = {}) {
    let picturePathSequenceStr = ""
    if (!isStringEmpty(picturePathSequence)) {
        if (typeof (picturePathSequence) == "number") {
            picturePathSequenceStr = picturePathSequence + ""
        }
        picturePathSequenceStr = picturePathSequenceStr.padStart(9, " ")
    } else {
        picturePathSequenceStr = picturePathSequenceStr.padStart(9, " ")
    }
    currentPicture = picturePathSequenceStr + "  " + currentPicture
    if (recentlyUsedPictures == null || recentlyUsedPictures == undefined) {
        recentlyUsedPictures = [];
    }
    if (recentlyUsedPictures.length >= cache.recentlyUsedPicturesNum) {

        for (let i = 0; i <= (recentlyUsedPictures.length - cache.recentlyUsedPicturesNum + 1); i++) {
            recentlyUsedPictures.pop();
        }

    }
    recentlyUsedPictures.unshift(currentPicture);
    setStore({
        recentlyUsedPictures: recentlyUsedPictures
    });
}

/**
 * 
 * @param {{pictureOnlySavedPathName:Array}} picturePathsNumberArrayObject 
 * @param {string} currentPicture 
 * @param {Number} recursionCount 
 * @param {Array} picturesThatNotExists 
 * @returns {String}
 */
//  recursionCount 、picturesThatNotExists  : can be null
function pickAndSelectRoundPictureInBackground(picturePathsNumberArrayObject, currentPicture, recursionCount, picturesThatNotExists) {
    let selectedPicture = null;
    try {
        if (recursionCount != null) {
            recursionCount++;
        } else {
            recursionCount = 0;
        }
        if (picturesThatNotExists == null || picturesThatNotExists == undefined) {
            picturesThatNotExists = [];
        }

        let picturePathsNumberArray = null
        if (cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer == false) {
            picturePathsNumberArray = picturePathsNumberArrayObject.pictureOnlySavedPathName
        } else {
            picturePathsNumberArray = picturePathsNumberArrayObject.pictureSavedAsBase64Name
        }
        let picturePathsNumber = 0;
        let selectPictureIndex = null;

        if (picturePathsNumberArray != undefined) {

            if (cache.pCat.pictureOnlySavedPathName && cache.pCat.pictureOnlySavedPathName.config.categoriesNameRandomArray.length > 0 && cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer == false) {
                selectedPicture = cache.pCat.pictureOnlySavedPathName.getNext(picturesCategoriesGetNextCallback)

            } else if (cache.pCat.pictureSavedAsBase64Name && cache.pCat.pictureSavedAsBase64Name.config.categoriesNameRandomArray.length > 0 && cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer == true) {
                selectedPicture = cache.pCat.pictureSavedAsBase64Name.getNext(picturesCategoriesGetNextCallback)

            } else {
                picturePathsNumber = picturePathsNumberArray.length;
                if (picturePathsNumber == 0) {
                    if (cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer == false) {
                        setStore({
                            pictureOnlySavedPathName: picturePathsNumberArray,
                            picturesThatNotExists: picturesThatNotExists
                        });
                    } else {
                        setStore({
                            pictureSavedAsBase64Name: picturePathsNumberArray,
                            picturesThatNotExists: picturesThatNotExists
                        });
                    }
                    // return defaultPicture;
                    selectedPicture = defaultPicture
                } else {
                    selectPictureIndex = getRandomNum(min = 0, max = (picturePathsNumber - 1))
                    if (selectPictureIndex == picturePathsNumber) {
                        selectPictureIndex = selectPictureIndex - 1;
                    }
                    selectedPicture = picturePathsNumberArray[selectPictureIndex].trim();
                }

            }

        } else {
            selectedPicture = defaultPicture;
        }

        let selectedPictureTemp = selectedPicture;
        selectedPicture = dealPath(selectedPicture);
        let exists = null

        if (cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer == false) {
            exists = checkExists(selectedPicture)
        } else {
            exists = picturePathsNumberArrayObject.pictureSavedAsBase64Name.includes(selectedPicture) >= 0 ? true : false
        }
        if (exists) {
            if (cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer == false) {
                setStore({
                    nextPicture: selectedPicture,
                    pictureOnlySavedPathName: picturePathsNumberArray,
                    picturesThatNotExists: picturesThatNotExists
                })
            } else {
                setStore({
                    nextPicture: selectedPicture,
                    pictureSavedAsBase64Name: picturePathsNumberArray,
                    picturesThatNotExists: picturesThatNotExists
                })
            }
            // return selectedPicture;
        } else {
            picturesThatNotExists.push(selectedPictureTemp);
            picturePathsNumberArrayObject.pictureOnlySavedPathName.splice(selectPictureIndex, 1);
            if (recursionCount % 50 == 0) {
                desktopNotify('waring !!!', 'There are over ' + recursionCount + ' pictures not exists !');
            }
            if (recursionCount == 500) {
                if (cache.ConfigPicturesPathType_SavePictureBase64DataToBroswer == false) {
                    setStore({
                        pictureOnlySavedPathName: picturePathsNumberArray,
                        picturesThatNotExists: picturesThatNotExists
                    })
                } else {
                    setStore({
                        pictureSavedAsBase64Name: picturePathsNumberArray,
                        picturesThatNotExists: picturesThatNotExists
                    })
                }
                // return defaultPicture;
                selectedPicture = defaultPicture
            } else {
                selectedPicture = pickAndSelectRoundPictureInBackground(picturePathsNumberArrayObject, currentPicture, recursionCount, picturesThatNotExists)
            }

        }
    } catch (e) {
        pushAndStoreErrorLogArray({
            error: e
        })
        console.error("error", e);
    }
    return selectedPicture
};
/**
 * @description load picturesCategories to cache
 * @param {*} storageCache 
 */
function loadPicturesCategoriesToCache(storageCache, opt = {
    picturesCategories: undefined,
    callback: undefined,
    callbackParameters:undefined,
    newSave: false,
    pictureOnlySavedPathName:undefined,
    pictureSavedAsBase64Name:undefined,
    ifFilter:undefined
}) {
    getStore(['picturesCategories', 'pictureOnlySavedPathName', 'pictureSavedAsBase64Name'])
        .then(function (re) {
            let wet, mtru;

            if (opt.picturesCategories && opt.picturesCategories.categoryRulesAndCategoryWeight) {
                wet = opt.picturesCategories.categoryRulesAndCategoryWeight;
                mtru = opt.picturesCategories.singleStringMatchMultiRule;
                opt.newSave = true
            } else {
                wet = re.picturesCategories.pictureOnlySavedPathName.config.categoryRulesAndCategoryWeight;
                mtru = re.picturesCategories.pictureOnlySavedPathName.config.singleStringMatchMultiRule;
            }
            let pictureOnlySavedPathName=opt.pictureOnlySavedPathName!=undefined?opt.pictureOnlySavedPathName:re.pictureOnlySavedPathName
            let pictureSavedAsBase64Name=opt.pictureSavedAsBase64Name!=undefined?opt.pictureSavedAsBase64Name:re.pictureSavedAsBase64Name
            let config=re.picturesCategories.pictureOnlySavedPathName.config
            config.ifFilter=opt.ifFilter!=undefined?opt.ifFilter:re.picturesCategories.pictureOnlySavedPathName.config.ifFilter

            let pospn = new stringLinesCategories(wet, pictureOnlySavedPathName, mtru, useOldInstance = opt.newSave==true ? undefined : {
                config: config
            },config.ifFilter)
            let psabn = new stringLinesCategories(wet, pictureSavedAsBase64Name, mtru, useOldInstance = opt.newSave==true ? undefined : {
                config: config
            },config.ifFilter)

            storageCache.pCat = {
                pictureOnlySavedPathName: pospn,
                pictureSavedAsBase64Name: psabn
            }
            if (opt.newSave) {
                re.picturesCategories.pictureOnlySavedPathName.config = pospn.config
                re.picturesCategories.pictureSavedAsBase64Name.config = psabn.config
                setStore({
                    picturesCategories: re.picturesCategories
                }).then(function (re) {
                    if (opt.callback) {
                        if(opt.callbackParameters){
                            opt.callback(opt.callbackParameters)
                        }else{
                            opt.callback()
                        } 
                    }
                })
            } else {
                if (opt.callback) {
                    if(opt.callbackParameters){
                        opt.callback(opt.callbackParameters)
                    }else{
                        opt.callback()
                    } 
                }
            }
        })
}


/**
 * 
 * @param {String} imgPath 
 * @param {String} PictureBase64Name 
 * @returns {object} {nextPictureBase64:dataURL} or {PictureAsCssEternalBase64:dataURL} or {tempBase64: dataURL}
 */
function getPictureBase64(imgPath, PictureBase64Name) {
    return new Promise(function (resolve, reject) {
        getStore('resizeCssPicture').then(function (object) {
            let dw = null;
            let dh = null;
            let dq = null;
            if (object.resizeCssPicture == undefined) {
                dw = 4096;
                dh = 4096;
                dq = 0.9;
            } else {
                ////////////////
                dw = object.resizeCssPicture.width;
                dh = object.resizeCssPicture.height;
                dq = object.resizeCssPicture.quality;
                if (imgPath == defaultPicture || imgPath == blackPicture) {

                } else {
                    imgPath = imgPath.trim();
                    imgPath = "file:///" + imgPath;
                }

                let img = new Image();
                let w, h;

                // let dataURL = null;
                img.onload = function () {
                    w = this.width; // here we can extract image size
                    h = this.height;

                    let sw = window.screen.width;
                    let sh = window.screen.height;

                    if (w >= dw || h >= dh) {
                        if (h >= dh && w >= dw) {
                            if (h / dh > w / dw) {

                                w = (dh / h) * w;
                                h = dh;
                            } else {

                                h = (dw / w) * h;
                                w = dw;
                            }
                        } else if (h >= dh) {

                            w = (dh / h) * w;
                            h = dh;
                        } else if (w >= dw) {

                            h = (dw / w) * h;
                            w = dw;
                        }
                    }


                    let canvas = document.createElement("canvas");
                    //canvas.width = img.width;
                    //canvas.height = img.height;
                    canvas.width = w;
                    canvas.height = h;
                    let ctx = canvas.getContext("2d");
                    //ctx.webkitImageSmoothingEnabled=true;  
                    //ctx.mozImageSmoothingEnabled = false; 
                    //ctx.msImageSmoothingEnabled = false;
                    //ctx.imageSmoothingEnabled = false;
                    //ctx.imageSmoothingQuality = "low|medium|high";
                    //ctx.imageSmoothingQuality = "low";

                    ctx.drawImage(img, 0, 0, w, h);
                    let ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();

                    //dataURL = canvas.toDataURL("image/"+ext, 1);
                    //dataURL = canvas.toDataURL("image/png");
                    let dataURL = canvas.toDataURL("image/jpeg", dq);

                    // doing something others action in here when img load complete ... 
                    let object = null;
                    // nextPictureBase64  PictureAsCssEternalBase64
                    if (PictureBase64Name == 'nextPictureBase64') {
                        object = {
                            nextPictureBase64: dataURL
                        };
                    } else if (PictureBase64Name == 'PictureAsCssEternalBase64') {
                        object = {
                            PictureAsCssEternalBase64: dataURL
                        };
                    } else {
                        object = {
                            tempBase64: dataURL
                        };
                    }
                    resolve(object);
                };
                imgPath = encodeStringPathInOS(imgPath);
                img.src = imgPath; // set src last 

                ////////////////	  
            }
        });
    });

    // return 'dataURL'; //  the dataURL is still null in here !!!
}