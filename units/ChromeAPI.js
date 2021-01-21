/**
 * 
 * @param {object} object 
 * @param {object} options {setNullAfterStore:false,callback:null}   setNullAfterStore:false/true:set object Null After Store  callback:function
 * @returns {Promise<boolean>} Promise<boolean>  success to true
 */
function setStore(object,options={setNullAfterStore:false,callback:null}) {
    return new Promise(function (resolve, reject) {
        let setStoreTimeout = setTimeout(function () {
            clearTimeout(setStoreTimeout); 
            chrome.storage.local.set(object, function () {

                if(options.setNullAfterStore==true){
                    object=null
                }
                if(options.callback!=null){
                    options.callback()
                }
                resolve(true);
            });
        }, 100);
    })
}

function getStore(key) {  
    return new Promise(function (resolve, reject) {
        chrome.storage.local.get(key, function (result) {

            resolve(result);
        });
    });
}

function msgToBackground(object={"info":"example"}) {
    let msgToBackgroundTimeout = setTimeout(function () {
        chrome.runtime.sendMessage(object);
        clearTimeout(msgToBackgroundTimeout);
    }, 500);
}
