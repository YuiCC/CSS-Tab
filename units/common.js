/**
 * @description mergeValueWithSameKeyFunction :  merge value to the same key,need retrun the merge value of two object value
 * @description processValueWithNewKeyFunction : process value while put the 2nd object value  into new key 
 * @returns new Object (not modify the input Object)
 * @param {*} obj1 
 * @param {*} obj2 
 * @param {{boolean,Function,Function,Function}} param2 
 */
function mergeObject(obj1, obj2, {ifNewRandomKeyWithSameKey=false, RandomKeyFunction=null, mergeValueWithSameKeyFunction=null,processValueWithNewKeyFunction=null}) {
    let obj = {}
    if(Object.keys(obj1).length==0){
        let temp=obj1
        obj1=obj2
        obj2=temp
    }
    Object.entries(obj1).forEach(([k, v]) => {
        mergeObjectInsideCycle(k,v,obj,obj2,ifNewRandomKeyWithSameKey,RandomKeyFunction,mergeValueWithSameKeyFunction,processValueWithNewKeyFunction)
    });
    Object.entries(obj2).forEach(([k, v]) => {
        mergeObjectInsideCycle(k,v,obj,obj1,ifNewRandomKeyWithSameKey,RandomKeyFunction,mergeValueWithSameKeyFunction,processValueWithNewKeyFunction)
    });
    return obj;
}
/**
 * @description not use this directly use mergeObject(...)
 */
function mergeObjectInsideCycle(kOfObj1,vOfObj1,obj,obj2,ifNewRandomKeyWithSameKey,RandomKeyFunction,mergeValueWithSameKeyFunction,processValueWithNewKeyFunction){
    k=kOfObj1
    v=vOfObj1
    if (obj2[k] == undefined) {
        obj[k] = v
    } else {
        if (!ifNewRandomKeyWithSameKey&&mergeValueWithSameKeyFunction) {
            obj[k] = mergeValueWithSameKeyFunction(v, obj2[k])
        } else {
            if (ifNewRandomKeyWithSameKey) {
                if(processValueWithNewKeyFunction){
                    obj[k] = v
                    let newKey = RandomKeyFunction(k) 
                    let newValue=processValueWithNewKeyFunction(newKey,obj2[k])
                    obj[newKey] = newValue
                }else{
                    obj[k] = v
                    let newKey = RandomKeyFunction(k) 
                    obj[newKey] = obj2[k]
                }
                
            } else {
                obj[k] = v
            }
        }
    }
}
function getVariableType(value) {
    return Object.prototype.toString.call(value)
}


/**
 * @summary this  only support select one file each time
 * @param {string} readDataAsType  ArrayBuffer , DataURL , Text
 * @param {function} callback callback(data)
 * @param {string} MIME
 * 
 */
function importData(readDataAsType,MIME=undefined, callback) {
    callback = callback || String
    let inputFile = document.createElementNS("http://www.w3.org/1999/xhtml", "input");
    inputFile.type = 'file';
    if(MIME){
        inputFile.accept=MIME
    }
    //   inputFile.setAttribute("multiple", "multiple");

    inputFile.onchange = function (event) {
        let files = inputFile.files;
        let fileReader = new FileReader();
        if (readDataAsType == 'ArrayBuffer') {
            fileReader.readAsArrayBuffer(files[0])
        } else if (readDataAsType == 'DataURL') {
            fileReader.readAsDataURL(files[0])
        } else if (readDataAsType == 'Text') {
            fileReader.readAsText(files[0], 'utf-8');
        }

        fileReader.onloadend = function (re) {
            if (re.target.result == '' || re.target.result == undefined) {
                alert("no data, import again ")
                return
            }
            callback(re.target.result)
        }
    }
    fakeClick(inputFile);
}


/**
 * 
 * @param {Function} callback 
 */
function getPromise(callback) {
    return new Promise(function (resolve, reject) {
        let result = callback()
        resolve(result);
    })
}
/**
 * delay exec Function
 * @param {int} delayTime 
 * @param {Function} callback 
 */
function delayFunction(delayTime, callback, args = {}) {
    let delayFunctionTimeout = setTimeout(() => {
        clearTimeout(delayFunctionTimeout)
        return callback(args)
    }, delayTime)
}

/**
 * @param {Time} time  millisecond
 * @example
        async function test() {
            console.log('before')
            await sleep(5000) 
            console.log('after') // code after sleep
        }
        test() 
        out: before   -> after (code after sleep) 
 *@example
        console.log('before')
        sleep(5000).then(() => {
            console.log('in') // code after sleep
        })
        console.log('after') 
        out: before -> after -> in(code after sleep) 
 */
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

