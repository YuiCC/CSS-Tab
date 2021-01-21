/**
 * 
 * @param {*} url 
 * @param {*} method 
 * @param {*} optionsObject 
 * @returns return http ,if status not 200
 */
function httpRequest(url, method, optionsObject = {
    async: false,
    timeout: null,
    callback: null,
    responeType: null,
    requestData: null,
    headers: {},
    httpToHttps:false,
    mimeType:null
}) {
    if (url == "" || url == undefined || url == null) {
        return false;
    };
    if(optionsObject.async==undefined){
        optionsObject.async=false
    }
    if(optionsObject.httpToHttps==undefined){
        optionsObject.httpToHttps=false
    }
    if(optionsObject.headers==undefined){
        optionsObject.headers={}
    }
    let http = new XMLHttpRequest();

    if (optionsObject.async == true && optionsObject.timeout) {
        http.timeout = optionsObject.timeout;
    }
    if (optionsObject.async == true && optionsObject.responeType) {
        http.responseType = optionsObject.responeType;
    }
    if(optionsObject.mimeType){
        http.overrideMimeType(optionsObject.mimeType);
    }
    let re = false;
    try {

        // let iss = 'https:' == document.location.protocol ? true : false;
        // if (iss) {
        //     url = url.replace("http:", "https:")
        // }
        if(optionsObject.httpToHttps){
            url = url.replace("http:", "https:")
        }
        if (optionsObject.async == true && optionsObject.callback) {
            http.onload = function () {

                // blob = xhr.response;
                // 下面这句可以在浏览器中预览图片
                //window.location = window.URL.createObjectURL(blob);
                // window.URL.createObjectURL(File)
                /**
          let img = document.createElement("img");
          //img.style.width="111px";
          // img.style.height="111px";
                  img.src = window.URL.createObjectURL(blob);
                  document.body.appendChild(img);
           */
                //     let imgFile = new File([blob], imageName, {type: 'image/jpeg'});
                //     resolve(imgFile);
                //   };

                if (http.readyState === 4) {
                    if (http.status === 200) {
                        optionsObject.callback(http.response)
                    } else {
                        optionsObject.callback(http)
                    }
                }

            };

        }
        http.onerror = function () {
            console.error('httpRequest Error : ' + url);
            optionsObject.callback(http.response)
        }
        http.open(method, url, optionsObject.async);
        
        if (Object.keys(optionsObject.headers).length > 0) {
            Object.entries(optionsObject.headers).forEach(([k, v]) => {
                http.setRequestHeader(k, v)
            }) 
        }
        /**
		  http.onerror = function () { 
       console.error("** An error occurred during the transaction");
          };
		 */
        http.send();
        if (!optionsObject.async) {
            if (http.responseURL != '' || http.response != '') {
                re = http.response;
            } else {
                re = false;
            }
        }


        //re= true;
    } catch (e) {
        pushAndStoreErrorLogArray({
            error: e
        })
        console.error('httpRequest Error : ' + e + "\n" + url);
        //showMsgInfo("!!! This Picture Is Not Exists : " + dealPathToWin(url) + " !!! \n!!! Or !!!\n  !!! 'Allow access to file URLs' Is Not Enabled In Extensions Details Settings !!!", 30000);
        re = false;
    };

    return re;
}





/**
 * 
 * @param {*} url 
 * @param {*} args  {maxWidth:700, maxHeigh:700,name:null}
 * @param {*} callback 
 * @return {Object} {base64:base64,name:args.name} or {url:url}
 */
function getBase64FromUrl(url, args = {
    maxWidth: 700,
    maxHeigh: 700,
    name: null
}, callback) {
    try {

        if (typeof (url) == "string") {
            let iss = 'https:' == document.location.protocol ? true : false;
            if (iss) {
                url = url.replace("http:", "https:")
            }
        }


        let dq = 0.9; //quality
        let dw = args.maxWidth;
        let dh = args.maxHeigh;


        let img = new Image();
        // img.setAttribute("crossOrigin",'anonymous');
        img.setAttribute("crossorigin", 'anonymous');

        let w, h;

        let dataURL = null;
        img.onerror = function () {
            callback({
                url: url
            })
        }
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

            base64 = canvas.toDataURL("image/jpeg", dq);
            // dataURL = canvas.toDataURL("image/jpg",0.9);
            //
            // doing something others action in here when img load complete ...  
            callback({
                base64: base64,
                name: args.name
            })
        };

        img.src = url; // set src last  !  !  !
    } catch (e) {
        pushAndStoreErrorLogArray({
            error: e
        })
        console.error(e)
        callback({
            url: url
        })
    }

    // return 'dataURL'; //  the dataURL is still null in here !!!
}


function getBase64FromUrlAndReturnDataURL(url, callback, maxWidth, maxHeigh) {


}

function parseURLGetParam(urlGetParam) {
    let re = {};
    let a1 = urlGetParam.split('?');
    for (xx in a1) {
        if (a1[xx].length > 1) {
            let tt = a1[xx].split('&');
            for (cc in tt) {
                if (tt[cc].length > 1) {
                    tt2 = tt[cc].split('=');
                    re[tt2[0]] = tt2[1];
                }
            }
        }
    }
    return re;
}