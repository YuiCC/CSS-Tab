/**
 * @param {Array}  array
 * @param {Object} ele
 * @return {Array} array include deleted element
 */
function deleteElementInArray(array, ele) {
    let index = array.indexOf(ele)
    return array.splice(index, 1)
}
/**
 * @description detect is str Contain the str of array
 * @param {*} array 
 * @param {*} str 
 */
function isContainStringOfArray(array, str) {
    let re = false
    for (let s of array) {
        if (str.indexOf(s) >= 0) {
            re = true
            break
        }
    }
    return re
}

/**
 * @param {Array}  array
 * @param {string} str Special String
 *  
 * @description delete Element In Array That Include Special String
 */
function deleteElementInArrayThatIncludeSpecialString(array, str) {
    for (let index = 0; index < array.length; index++) {
        if (array[index].indexOf(str) >= 0) {
            array.splice(index, 1)
        }
    }

}

/**
 * @param {Array}  array
 * @param {Object} ele
 * @return {Boolean} true/false
 */
function hasDoubleInArray(array) {
    let ob = {}
    for (ar of array) {
        ob[ar] = 1
    }
    if (Object.keys(ob).length != array.length) {
        return true
    } else {
        return false
    }

}

function hashcode(str) {
    let hash = 0,
        i, chr, len;
    if (str.length === 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer  // hash = hash & hash;
    }
    return hash;
}



/**
 * 生成UUID , 指定长度和基数
 * @param {Number} len 
 * @param {Number} radix   范围 [1,34],指定使用'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'中的哪些字符,34即使用全部字符
 */
function UUID(len, radix) {
    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    let uuid = [],
        i;
    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        // rfc4122, version 4 form
        let r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return uuid.join('');
}


/**
 * 
 * @param {Number} min 
 * @param {Number} max 
 */
function getRandomNum(min = 0, max = 1) {
    let num = Math.round(Math.random() * (max - min) + min)
    if (num % 3 == 0) {

    } else if (num % 3 == 1) {
        num = Math.round(Math.random() * (num - min) + min)
    } else if (num % 3 == 2) {
        num = Math.round(Math.random() * (max - num) + num)
    }
    if (num > max) {
        num = max
    }
    if (num < min) {
        num = min
    }

    return num
}

function getRandomNumWithSeed(seed,max,min){
    Math.seed = 5;

    max = max || 1;
    min = min || 0;
    Math.seed = (Math.seed * 9301 + 49297) % 233280;
    let rnd = Math.seed / 233280.0;
    return min + rnd * (max - min);

}
/**
 * 
 * @param {Array} array 
 */
function getRandomElementFromArray(array){
    let rn = getRandomNum(0, array.length - 1);
    return array[rn]
}

/**
 * 
 * @param {Array} strsArray 
 */
function randomStringArray(strsArray) {
    if (strsArray.length == 0 || strsArray.constructor != Array) {
        return strsArray
    } 
    let strsCategoriesMap = {}
    for (let i = 0; i < strsArray.length; i++) {
        if (!strsCategoriesMap[strsArray[i]]) {
            strsCategoriesMap[strsArray[i]] = 1
        } else {
            strsCategoriesMap[strsArray[i]] += 1
        }
    }
    for (let i = 0; i < strsArray.length; i++) {
        let rn = getRandomNum(0, strsArray.length - 1);
        if (rn == i) { continue  };
        let t = strsArray[i]
        strsArray[i] = strsArray[rn]
        strsArray[rn] = t
    }
    if (Object.keys(strsCategoriesMap).length > 1) { 
        let continueStr=null
        let continueStrNum=0
        for (let i = 0; i <= strsArray.length; i++) {
            if(i == strsArray.length||continueStr!=strsArray[i]){
                if(continueStrNum>1){
                    if(continueStrNum==strsCategoriesMap[continueStr]){
                        let start=i-continueStrNum
                        let csrn = null
                        if(start==0){
                            csrn= getRandomNum(start+1, i-1)
                        }else if(i==strsArray.length){
                            csrn= getRandomNum(start, i-2)
                        }else{
                            csrn= getRandomNum(start, i-1)
                        }
                        let osar=[]
                         
                        if(start!=0){
                            for(let j=0;j<start;j++){
                                osar.push(j)
                            }
                        }
                        if(i!=strsArray.length){
                            for(let j=i;j<strsArray.length;j++){
                                osar.push(j)
                            }
                        }
                        let csrnRp=getRandomElementFromArray(osar)
                        let tpc=strsArray[csrn]
                        strsArray[csrn]=strsArray[csrnRp]
                        strsArray[csrnRp]=tpc
                    }
                }
                if(i != strsArray.length){
                    continueStr=strsArray[i]
                } 
                continueStrNum=1
            }else{
                continueStrNum+=1
            } 
        }
    }
    return strsArray
}

