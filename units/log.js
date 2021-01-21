class logAll {
    // ifPrintLog=false;
    /**
     * error=1 < warn=2 < info=3 < debug=4
     */
    // logLevel = 1;

    /**
     * @param {Number} logLevel error=1 < warn=2 < info=3 < debug=4
     * @param {boolean} ifPrintLog 
     */
    constructor(opt={logLevel : 1, filterStringArray : [] }) {
        // logLevel : error=1 < warn=2 < info=3 < debug=4 
        this.logLevel = opt.logLevel
        this.filterStringArray = opt.filterStringArray 
    }
    /**
     * 
     * @param {Number} logLevel  error=1 < warn=2 < info=3 < debug=4 
     */
    setLog(logLevel = 1, filterStringArray = []) {
        this.logLevel = logLevel
        this.filterStringArray = filterStringArray
    }
    outputLog(logType,objectLog){
        if (this.ifFilter(objectLog) == true) {
            return
        }
        let date=(new Date()).toLocaleString()
        switch (logType) {
            case 1:
                console.error(objectLog,date, this.getLogLocation())
                break;
            case 2:
                console.warn(objectLog,date,  this.getLogLocation())
            break;
            case 3:
                console.info(objectLog, date, this.getLogLocation())
            break;
            case 4:
                console.debug(objectLog, date, this.getLogLocation())
            break;
            default:
                break;
        }
    }
    error(objectLog) {
        if (this.logLevel >= 1) {
            this.outputLog(1,objectLog) 
        }
    }
    warn(objectLog) {
        if (this.logLevel >= 2) {
            this.outputLog(2,objectLog)  
        }
    }
    info(objectLog) {
        if (this.logLevel >= 3) { 
            this.outputLog(3,objectLog)   
        }
    }
    debug(objectLog) {
        if (this.logLevel >= 4) {
            this.outputLog(4,objectLog)    
        }
    }
    /**
     * 
     *  
     * @returns {String} Log Location  
     */
    getLogLocation() {
        return " (" + (new Error()).stack.split("\n")[3].replace(/ *at([^\/\\\(\)]*).*\/([^\/\\].*)$/, "$1 $2")
    }
    ifFilter(logString) {
        try {
            for (let ltr of this.filterStringArray) {
                if(typeof(logString)!="string"){
                    logString=JSON.stringify(logString)
                }
                if (logString.indexOf(ltr) >= 0) {
                    return true
                }
            }
        } catch (e) {
            
        }
        return false
    }
}
let log = new logAll({logLevel : 2})
// log.setLog(3,["data:image/","getStore","setStore"])
// let log = new logAll()
// log.getFileName()
// log.info("ssssssssssss")