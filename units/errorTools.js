
/**
 * [{errorMessage:errorMessage,scriptURI:scriptURI,lineNo:lineNo,columnNo:columnNo,error:error},{}]
 */
let errorLogArray = []
window.addEventListener("error", function (ErrorEvent) {
    let errorInfo = {
        date:(new Date()).toLocaleString(),
        errorMessage: ErrorEvent.message,
        scriptURI: ErrorEvent.filename,
        lineNo: ErrorEvent.lineno,
        columnNo: ErrorEvent.colno,
        error: ErrorEvent.error
    }
    errorLogArray.unshift(JSON.stringify(errorInfo))
    console.error(errorInfo);
    getStore("errorLogArray").then(function (re) {
        if (re.errorLogArray) {
            re.errorLogArray.unshift(JSON.stringify(errorInfo))
            setStore({
                errorLogArray: re.errorLogArray
            })
        } else {
            setStore({
                errorLogArray: errorLogArray
            })
        }
    })
    return true
})


/**
    pushAndStoreErrorLogArray({ error: e  })
    log.error(e)
 */

/**
 * 
 * @param {object} errorInfo {}
 */
function pushAndStoreErrorLogArray(errorInfo){
    if(errorInfo.error.stack){
        errorInfo={error:errorInfo.error.stack}
    }
    let date = (new Date()).toLocaleString()
    errorInfo.date=date
    errorLogArray.unshift(JSON.stringify(errorInfo))
    getStore("errorLogArray").then(function (re) {
        if (re.errorLogArray) {
            re.errorLogArray.unshift(JSON.stringify(errorInfo))
            setStore({
                errorLogArray: re.errorLogArray
            })
        } else { 
            setStore({
                errorLogArray: errorLogArray
            })
        }
    })
}
// window.onerror = function(errorMessage, scriptURI, lineNo, columnNo, error) {
//     let errorInfo={errorMessage:errorMessage,scriptURI:scriptURI,lineNo:lineNo,columnNo:columnNo,error:error}
//     errorLogArray.unshift(JSON.stringify(errorInfo))
//     console.error(errorInfo);
// };