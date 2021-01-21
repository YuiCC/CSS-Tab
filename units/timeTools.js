function getCurrentTime() {
    let date = new Date();
    return date.getTime();
}

/**
 * 
 * @param {Date} date 
 */
function timeDistanceToNow(date) {
    let re = null;
    let now = new Date();

    let year = date.getFullYear();
    let month = date.getMonth()
    let day = date.getDate()

    if (year < now.getFullYear()) {
        let y1 = now.getFullYear() - year
        re = y1 + ' years ago'
    } else if (year == now.getFullYear() && (now.getMonth() - month) != 0) {
        let m1 = now.getMonth() - month
        re = m1 + ' months ago'
    } else if (year == now.getFullYear() && (now.getMonth() - month) == 0) {
        let d1 = now.getDate() - day
        if (d1 == 0) {
            re = 'today'
        } else {
            re = d1 + ' days ago'
        }

    }
    return re;
}
/**
 * 
 * @param {Date} date1 
 * @param {Date} date2 
 * @param {String} unit        year/month/day/hour/minute
 */
function timeDistance(date1,date2,unit){
        
}