

class stringLinesCategories {
    config = {
        categoryRulesAndCategoryWeight: {},
        singleStringMatchMultiRule: true,
        totalNumber: 0,
        categoriesNameRandomArray: [],
        currentCategoryIndex: -1,

        ifFilter:true,

        categories : {

        },
        stringLines : [] 
    }
    
    
    /**
     * @description category string lines with categoryRulesAndCategoryWeight name
     * @param {Object} categoryRulesAndCategoryWeight  eg: {springPicture:3,summerPicture:5}  
     * @param {Array} stringLines 
     * @param {boolean} singleStringMatchMultiRule
     */
    constructor(categoryRulesAndCategoryWeight = {}, stringLines = [], singleStringMatchMultiRule = true, useOldInstance = {},ifFilter=true) {
        if (useOldInstance&&useOldInstance.config) {
            this.config = useOldInstance.config 
        } else {
            this.config.ifFilter=ifFilter
            this.config.stringLines=stringLines
            this.config.categoryRulesAndCategoryWeight = categoryRulesAndCategoryWeight 
            this.config.singleStringMatchMultiRule = singleStringMatchMultiRule 

            this.category()
            this.categoriesNameRandom()
        } 
    }
    /**
     * 
     * @param {String} str 
     */
    includeInZeroCategory(str){
        let rst={zeroCat:undefined,ifInZero:false} 
        Object.entries(this.config.categoryRulesAndCategoryWeight).forEach(([key, value]) => {
           if(value==0&&str.toLowerCase().indexOf(key.toLowerCase())>=0){
            rst.ifInZero= true;
            rst.zeroCat=key; 
           } 
        })
        return rst;
    }
    category() { // categories中存储stringline位于stringLines中的index
        let rus = Object.keys(this.config.categoryRulesAndCategoryWeight) 
        let sls = this.config.stringLines
        this.config.categories = {}
        this.config.categories.notMatchCategoryRules = []
        for (let i=0;i<sls.length;i++) { 
            let matchCategoryRulesNum = 0
            if(this.config.ifFilter){
                let iizc=this.includeInZeroCategory(sls[i]) 
                if(iizc.ifInZero){
                    if (!this.config.categories[iizc.zeroCat]) {
                        this.config.categories[iizc.zeroCat] = []
                    }
                    this.config.categories[iizc.zeroCat].push(i)
                    matchCategoryRulesNum += 1
                    continue
                }
            } 
            for (let ru of rus) {
                if (!this.config.categories[ru]) {
                    this.config.categories[ru] = []
                }
                if (sls[i].toLowerCase().indexOf(ru.toLowerCase()) >= 0) {
                    this.config.categories[ru].push(i)
                    matchCategoryRulesNum += 1
                    if (!this.config.singleStringMatchMultiRule) {
                        break
                    }
                }
            }
            if (matchCategoryRulesNum == 0) {
                this.config.categories.notMatchCategoryRules.push(i)
            }
        }
        if (this.config.categories.notMatchCategoryRules.length > 0 && this.config.categoryRulesAndCategoryWeight.notMatchCategoryRules == undefined) {
            this.config.categoryRulesAndCategoryWeight.notMatchCategoryRules = 1
        } 
    }

    categoriesNameRandom() {
        let categoriesName = []
        let ZeroCategoryWeight=1
        let sumW,maxW=0
        if(!this.config.ifFilter){
            Object.entries(this.config.categoryRulesAndCategoryWeight).forEach(([key, value]) => {
                sumW+=value
                if(maxW<value){
                    maxW=value
                }
            })
        }
        ZeroCategoryWeight=Math.round(sumW/38*2)>Math.round(maxW/3*2)?Math.round(sumW/38*2):Math.round(maxW/3*2)
        Object.entries(this.config.categoryRulesAndCategoryWeight).forEach(([key, value]) => {
            if(this.config.categories[key]&&this.config.categories[key].length>0){
                if(!this.config.ifFilter&&value==0){
                    value=ZeroCategoryWeight
                }
                for (let i = 1; i <= value; i++) {
                    categoriesName.push(key);
                }
            } 
        })
        this.config.categoriesNameRandomArray = randomStringArray(categoriesName)
    }
    /**
     * get string from next category 
     */
    getNext(callback = null) {
        let result = null
        if (this.config.currentCategoryIndex == (this.config.categoriesNameRandomArray.length - 1)) {
            this.config.currentCategoryIndex = -1
            this.categoriesNameRandom()
        }
        this.config.currentCategoryIndex += 1
        let currentCategory = this.config.categoriesNameRandomArray[this.config.currentCategoryIndex]

        let rn = getRandomNum(0, this.config.categories[currentCategory].length - 1)
        let resultIndexInAll = this.config.categories[currentCategory][rn]
        result=this.config.stringLines[resultIndexInAll]
        if (result == undefined) {
            result = this.getNext()
        } 
        if (callback != null) {
            callback()
        }
        return result
    }
}


function encodeStringPathInOS(str) {
    if (str.indexOf("#") >= 0) {
        str = str.replace(/#/g, "%23")
    }
    return str;
}
/**
 * 
 * @param {string} str 
 * @description return true if the string is empty
 */
function isStringEmpty(str) {
    return (str == undefined || str == null || (typeof (str) == "string" ? str.trim() == "" : true)) ? true : false
}

function dealPath(path) {
    return path.replace(/\\/g, '/');
}


function dealPathToWin(path) {
    return path.replace(/\//g, '\\');
}


function toDoubleOblique(string) {
    return string.replace(/\\/g, '\\\\');
}

function toSingleOblique(string) {
    return string.replace(/\\\\/g, '\\');
}

/**
 * @summary if str startsWith string in array
 * @param {String} str 
 * @param {Array} array 
 */
function isElementStartsWithStringInArray(str, array) {
    for (ar of array) {
        if (str.startsWith(ar)) {
            return true
        }
    }
    return false
}






function checkExists(url) {
    let re = false
    try {
        re = checkExistsWithHttp(url)
    } catch (e) {
        pushAndStoreErrorLogArray({
            error: e
        })
        re = false;
    }
    if (!re) {
        try {
            showMsgInfo("!!! This Picture Is Not Exists : " + dealPathToWin(url) + " !!! \n!!! Or !!!\n  !!! 'Allow access to file URLs' Is Not Enabled In Extensions Details Settings !!!", 60000);
        } catch (e) {
            pushAndStoreErrorLogArray({
                error: e
            })
        }

    }
    return re
};

function checkExistsWithHttp(url) {

    if (url == "" || url == undefined || url == null) {
        return false;
    };
    url = dealPath(url);

    url = encodeStringPathInOS(url);

    let http = new XMLHttpRequest();
    let re = false;
    try {

        http.open('HEAD', url, false);
        /**
          http.onerror = function () { 
       console.error("** An error occurred during the transaction");
          };
         */
        http.send();
        if (http.responseURL != '' || http.response != '') {
            re = true;
        } else {
            re = false;
        }

        //re= true;
    } catch (e) {
        pushAndStoreErrorLogArray({
            error: e
        })
        console.error('checkExistsWithHttp Error : ' + e);
        //showMsgInfo("!!! This Picture Is Not Exists : " + dealPathToWin(url) + " !!! \n!!! Or !!!\n  !!! 'Allow access to file URLs' Is Not Enabled In Extensions Details Settings !!!", 30000);
        re = false;
    };
    http = null;

    return re;
}
// function checkExists(url) {
//     if (url == "" || url == undefined || url == null) {
//         return false;
//     };
//     url = dealPath(url);

//     url=encodeStringPathInOS(url);

//     let http = new XMLHttpRequest();
//     let re = false;
//     try {
//         http.open('HEAD', url, false);
//         /**
//          http.onerror = function () { 
//       console.error("** An error occurred during the transaction");
//          };
//         */
//         http.send();
//         if (http.responseURL != '' || http.response != '') {
//             re = true;
//         } else {
//             re = false;
//         }
//
//         //re= true;
//     } catch (e) {
//         console.error(e);
//         re = false;
//     };
//     http = null;
//     return re;
// };



/*
 * GB2312转UTF8
 * 例：
 * let xx=new GB2312UTF8();
 * let Utf8=xx.Gb2312ToUtf8("你aaa好aaaaa");
 * let Gb2312=xx.Utf8ToGb2312(Utf8);
 * alert(Gb2312);
 */

function GB2312UTF8() {
    this.Dig2Dec = function (s) {
        let retV = 0;
        if (s.length == 4) {
            for (let i = 0; i < 4; i++) {
                retV += eval(s.charAt(i)) * Math.pow(2, 3 - i);
            }
            return retV;
        }
        return -1;
    }
    this.Hex2Utf8 = function (s) {
        let retS = "";
        let tempS = "";
        let ss = "";
        if (s.length == 16) {
            tempS = "1110" + s.substring(0, 4);
            tempS += "10" + s.substring(4, 10);
            tempS += "10" + s.substring(10, 16);
            let sss = "0123456789ABCDEF";
            for (let i = 0; i < 3; i++) {
                retS += "%";
                ss = tempS.substring(i * 8, (eval(i) + 1) * 8);
                retS += sss.charAt(this.Dig2Dec(ss.substring(0, 4)));
                retS += sss.charAt(this.Dig2Dec(ss.substring(4, 8)));
            }
            return retS;
        }
        return "";
    }
    this.Dec2Dig = function (n1) {
        let s = "";
        let n2 = 0;
        for (let i = 0; i < 4; i++) {
            n2 = Math.pow(2, 3 - i);
            if (n1 >= n2) {
                s += '1';
                n1 = n1 - n2;
            } else
                s += '0';
        }
        return s;
    }

    this.Str2Hex = function (s) {
        let c = "";
        let n;
        let ss = "0123456789ABCDEF";
        let digS = "";
        for (let i = 0; i < s.length; i++) {
            c = s.charAt(i);
            n = ss.indexOf(c);
            digS += this.Dec2Dig(eval(n));
        }
        return digS;
    }
    this.Gb2312ToUtf8 = function (s1) {
        let s = escape(s1);
        let sa = s.split("%");
        let retV = "";
        if (sa[0] != "") {
            retV = sa[0];
        }
        for (let i = 1; i < sa.length; i++) {
            if (sa[i].substring(0, 1) == "u") {
                retV += this.Hex2Utf8(this.Str2Hex(sa[i].substring(1, 5)));
                if (sa[i].length) {
                    retV += sa[i].substring(5);
                }
            } else {
                retV += unescape("%" + sa[i]);
                if (sa[i].length) {
                    retV += sa[i].substring(5);
                }
            }
        }
        return retV;
    }
    this.Utf8ToGb2312 = function (str1) {
        let substr = "";
        let a = "";
        let b = "";
        let c = "";
        let i = -1;
        i = str1.indexOf("%");
        if (i == -1) {
            return str1;
        }
        while (i != -1) {
            if (i < 3) {
                substr = substr + str1.substr(0, i - 1);
                str1 = str1.substr(i + 1, str1.length - i);
                a = str1.substr(0, 2);
                str1 = str1.substr(2, str1.length - 2);
                if (parseInt("0x" + a) & 0x80 == 0) {
                    substr = substr + String.fromCharCode(parseInt("0x" + a));
                } else if (parseInt("0x" + a) & 0xE0 == 0xC0) { //two byte
                    b = str1.substr(1, 2);
                    str1 = str1.substr(3, str1.length - 3);
                    let widechar = (parseInt("0x" + a) & 0x1F) << 6;
                    widechar = widechar | (parseInt("0x" + b) & 0x3F);
                    substr = substr + String.fromCharCode(widechar);
                } else {
                    b = str1.substr(1, 2);
                    str1 = str1.substr(3, str1.length - 3);
                    c = str1.substr(1, 2);
                    str1 = str1.substr(3, str1.length - 3);
                    let widechar = (parseInt("0x" + a) & 0x0F) << 12;
                    widechar = widechar | ((parseInt("0x" + b) & 0x3F) << 6);
                    widechar = widechar | (parseInt("0x" + c) & 0x3F);
                    substr = substr + String.fromCharCode(widechar);
                }
            } else {
                substr = substr + str1.substring(0, i);
                str1 = str1.substring(i);
            }
            i = str1.indexOf("%");
        }

        return substr + str1;
    }
}

function zoomPictureBase64(PictureBase64) { //  return  object = {  PictureBase64: dataURL  }
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
                dw = object.resizeCssPicture.width;
                dh = object.resizeCssPicture.height;
                dq = object.resizeCssPicture.quality;
                ////////////////	  

                let img = new Image();
                let w, h;

                // let dataURL = null;
                img.onload = function () {
                    w = this.width; // here we can extract image size // img.width
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
                    } else {
                        let object = {
                            PictureBase64: PictureBase64
                        };
                        resolve(object);
                    }


                    let canvas = document.createElement("canvas");
                    //canvas.width = img.width;
                    //canvas.height = img.height;
                    canvas.width = w;
                    canvas.height = h;
                    let ctx = canvas.getContext("2d");
                    ctx.imageSmoothingEnabled = true
                    ctx.imageSmoothingQuality = "high"

                    //ctx.webkitImageSmoothingEnabled=true;  
                    //ctx.mozImageSmoothingEnabled = false; 
                    //ctx.msImageSmoothingEnabled = false;
                    //ctx.imageSmoothingEnabled = false;
                    //ctx.imageSmoothingQuality = "low|medium|high";
                    //ctx.imageSmoothingQuality = "low";

                    ctx.drawImage(img, 0, 0, w, h);
                    // let ext = PictureBase64.substring(PictureBase64.indexOf('data:image/')+11,PictureBase64.indexOf(';')).toLowerCase();


                    // dataURL = canvas.toDataURL("image/"+ext);

                    let dataURL = canvas.toDataURL("image/jpeg", dq);
                    // dataURL = canvas.toDataURL("image/jpg",0.9);
                    //
                    // doing something others action in here when img load complete ...  


                    let object = {
                        PictureBase64: dataURL
                    };

                    resolve(object);
                };

                img.src = PictureBase64; // set src last 

                ////////////////	  
            }
        });
    });

    // return 'dataURL'; //  the dataURL is still null in here !!!
}


function previewPictureBase64(PictureBase64) { //  return  object = {  PictureBase64: dataURL  }



    return new Promise(function (resolve, reject) {
        let img = new Image();
        let w = 120;

        // let dataURL = null;
        img.src = PictureBase64;
        img.onload = function () {
            let canvas = document.createElement("canvas");

            let scale = this.width / this.height;
            let h = w / scale;

            canvas.width = w;
            canvas.height = h;
            let ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, w, h);

            let dataURL = canvas.toDataURL("image/jpeg", 0.9);
            if (dataURL.length < 50) {
                console.error('previewPictureBase64  problem', dataURL, w, h, scale);
            }
            let object = {
                PictureBase64: dataURL
            };
            resolve(object);
        };

    });

    // return 'dataURL'; //  the dataURL is still null in here !!!
}