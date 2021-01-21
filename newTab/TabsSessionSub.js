
function NotifySavedTabsSession(options={callback:null}) {
    if((Object.keys(cache.TabsSession.manualSavedTabsSessionObjects)).length==0){
        return
    }
    getStore(['otherOptions']).then((re) => { 
        let div=createTransparentDarkDivBox("NotifySavedTabsSession",document.documentElement)
        let manualSavedTabsSessionObjectsLength=(Object.keys(cache.TabsSession.manualSavedTabsSessionObjects)).length
        if (!re.otherOptions||re.otherOptions.notifyBackupTabSessionIntervalDay == 0 || manualSavedTabsSessionObjectsLength == 0) {

        } else {
            let now = new Date();
            let isNotifyTabSession = false
            if (re.otherOptions.notifyBackupTabSessionIntervalDay == undefined || re.otherOptions.BackupTabSessionLastTime == undefined) {
                isNotifyTabSession = true
            } else if ((now.getTime() - (new Date(re.otherOptions.BackupTabSessionLastTime)).getTime()) > re.otherOptions.notifyBackupTabSessionIntervalDay * 24 * 60 * 60 * 1000) {
                isNotifyTabSession = true
            }
            if (isNotifyTabSession) {
                let msgIdEleStr = `
                <div id="msgInfoDiv_03" class=" cc-background-dark-5 "> 
                    <pre id="msgInfo_03" class="cc-wrap cc-background-dark-8  cc-border-r font-green-dark" style="line-height: 90px;text-align: center;">Plase Export/Backup TabSession And Bookmarks !</pre>
                </div>
                `
                let msgInfoEle = htmlStringToElement(msgIdEleStr)
                msgInfoEle.onclick=function(){
                    if (cache.name == "TabsSession") {
                        // fakeClick(document.getElementById("session_popup_info_close_id"))
                        fakeClick(document.getElementById("TabsSessionExport"))
                    }else if(cache.name=="NewTab"){
                        window.open(chrome.extension.getURL('newTab/C.C.Chrome.TabsSession.html')+"?action=backupTabsSession")
                    }
                }
                div.append(msgInfoEle)

            }else{
                
            }
        }


        let Close = document.createElement("button")
        Close.id="session_popup_info_close_id"
        Close.className = "pointer cc-marginHeight-middle-30 cc-circle-30  configButton transparent font-green-dark"
        Close.style = "position: relative; left: 50px !important;"
        Close.innerHTML = "<b>Close</b>"
        Close.onclick = function () {
            div.parentNode.removeChild(div)
        }
        div.appendChild(Close)

        let toClick = null
        let tsKeys=Object.keys(cache.TabsSession.manualSavedTabsSessionObjects)
        for(let i=tsKeys.length-1;i>=0;i--){
            let k=tsKeys[i]
            let v=cache.TabsSession.manualSavedTabsSessionObjects[k]
            let ele = createTabInfoElement(v,k,"popup",v.time)
            ele.onclick = ckTabsSession
            if (i == tsKeys.length-1) {
                toClick = ele
            }
            div.appendChild(ele)
        } 
        if (cache.name == "TabsSession") {
            if (toClick != null) {
                fakeClick(toClick)
            } else {
                fakeClick(Close)
            }
        }
       
    })
}


/**
 * 
 * @param {object} st   {tabs: Array(9), name: 1544691657645, time: 1544691657645,type:'manualSavedTabsSession',id:'id'}
 * @param {string} id 
 * @param {string} idPostfix 
 * @param {Number} sortNumber 
 */
function createTabInfoElement(st, id,idPostfix,sortNumber) {

    let time = timeDistanceToNow(new Date(st.time))
    let name = st.name ? st.name : time;
    let info = parseTabs(st.tabs)

    let divC = document.createElement('div');
    let cl = document.createElement('p');
    let s1 = document.createElement('p')
    let s2 = document.createElement('p')
    let s3 = document.createElement('p')

    divC.className = 'font-green-dark cc-background-dark-3 pointer tabsInfo cc-marginHeight-small-10'
    divC.setAttribute("data-savedTime", st.time)
    divC.setAttribute("data-type", st.type)
    divC.setAttribute("data-sortNumber", sortNumber)
    divC.setAttribute("data-name", name)
    divC.setAttribute("data-id", id)
    divC.id=id+"_"+idPostfix

    cl.className = 'cc-oneline zeroMargin'
    cl.style = 'width:10px;left:200px !important;position: relative;'

    s1.className = "cc-oneline fontSize-small zeroMargin font-white-red"
    s2.className = "cc-nowrap zeroMargin"
    s3.className = "cc-nowrap zeroMargin"

    cl.innerText = 'X'
    s2.innerHTML = "&emsp;&emsp;  " + time
    s3.innerHTML = "&emsp;&emsp;  windows:" + info.windowsNum + '&emsp; tabs:' + info.TabsNum

    s1b = document.createElement('b')
    s1b.innerHTML = "&emsp;" + name

    s1.appendChild(s1b)


    divC.appendChild(s1)
    // divC.appendChild(cl)
    divC.appendChild(s2)
    divC.appendChild(s3)

    return divC

}


/**
 * show tabs details
 */
function ckTabsSession() {
    if(cache.name=="NewTab"){
        window.open(chrome.extension.getURL('newTab/C.C.Chrome.TabsSession.html')+"?action=click_session_preview&id="+this.id.split("_")[0])
    }
    if (cache.name == "TabsSession") {
        document.getElementById('UndoDeleteSavedTab').classList.add(['hide'])
        document.getElementById('UndoDeleteSavedTabTxt').innerText = 'Undo Delete Saved Tab: '

        let time = Number(this.getAttribute('data-savedtime'))
        let date = (new Date(time)).toLocaleString()
        let type = this.getAttribute('data-type')
        let serial = Number(this.getAttribute('data-sortNumber'))
        let name = this.getAttribute('data-name')
        let id=this.getAttribute('data-id')


        let addto = document.getElementById('TabsSessionDetail')
        let showtime = Number(addto.getAttribute('data-savedtime'))
        if (addto.getAttribute('data-id') != id) {
            addto.setAttribute('data-id', id)
            addto.setAttribute('data-savedtime', time)
            addto.innerHTML = ''
        } else {
            return
        } 
        let divName = document.createElement('div')
        let divTime = document.createElement('div')
        let divTabs = document.createElement('div')

        divName.className = 'fontSize-middle font-white-red'
        divTime.className = 'font-green-dark'
        divTabs.className = 'font-green-dark cc-marginBottom-small'

        //addto.appendChild(divName).appendChild(document.createElement('b')).appendChild(document.createTextNode(name))
        //addto.appendChild(divTime).appendChild(document.createTextNode(date))
        document.getElementById('TabsSessionNameRightSide').innerText = name
        document.getElementById('TabsSessionNameRightSide').setAttribute('data-type', 'manualSavedTabsSession')
        document.getElementById('TabsSessionTime').innerText = date

        //addto.appendChild(divTabs)

        if (type == 'manualSavedTabsSession' || type == 'AutoSaved') {
            let cTabs = null;
            if (type == 'manualSavedTabsSession') { 
                cTabs = cache.TabsSession.manualSavedTabsSessionObjects[id].tabs 
            } else if (type == 'AutoSaved' && time == cache.TabsSession.AutoSaved.time) {
                cTabs = cache.TabsSession.AutoSaved.tabs
            }

            if (cTabs == null) {
                return
            }
            let cutTab = parseTabs(cTabs) 
            let winNumT = 0;
            for (k in cutTab.windowsTabs) {
                winNumT++
                let divD = document.createElement('div')
                divD.className = 'font-white-red cc-marginHeight-small-10 '
                divD.style = "margin-left: 22px !important;"
                let bd = document.createElement('b')
                bd.innerHTML = 'window ' + winNumT
                addto.appendChild(divD).appendChild(bd)

                for (let i = 0; i < cutTab.windowsTabs[k].length; i++) {
                    let tabD = createTabDetail(cutTab.windowsTabs[k][i], {
                        time: time,
                        id:id
                    })
                    addto.appendChild(tabD)
                }
            }
        }
    }
}