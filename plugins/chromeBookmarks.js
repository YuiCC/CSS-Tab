;
(function () {
    /*
       opt.data   must be Array


  */
    let opt = {};
    let ChromeBookmarks = function (options) {
        this.hideBookMarks = hideBookMarks;
        this.showBookMarks = showBookMarks;

        opt = options || {};
        opt.data = opt.data ? opt.data : null;
        opt.mountId = opt.mountId ? opt.mountId : null;
        opt.autoShrink = opt.autoShrink == false ? false : true;
        opt.mainBookNum = opt.mainBookNum ? opt.mainBookNum : (opt.mainBookNum == 0 ? 1 : 10);
        opt.onlyMainBooksButton = opt.onlyMainBooksButton != undefined ? opt.onlyMainBooksButton : false;
        opt.booksColor = opt.booksColor ? opt.booksColor : "font-yellow-dark";
        opt.ifBookClicked = true;
        opt.ToggleBooks = opt.ToggleBooks ? opt.ToggleBooks : false;
        opt.TabsSessionUrl = opt.TabsSessionUrl ? opt.TabsSessionUrl : 'newTab/C.C.Chrome.TabsSession.html'
        opt.showBookmarks = opt.showBookmarks ? opt.showBookmarks : false
        

        if (opt.showBookmarks==true) {
            createMainEle(opt);
            if (opt.ToggleBooks) {
                mainBooksToggle();
            }
            addTabSessionButton();
        }
        options = null;

    }
    function addTabSessionButton() {
        let addToBook = document.getElementById('mainBooksButton')
        if (addToBook) {
            let goTabs = createBookmarkEle('Tabs Session', 'button', 'SavedTabs', opt.TabsSessionUrl, null)
            goTabs.classList.remove(opt.booksColor)
            goTabs.classList.add('font-white-red')
            goTabs.onclick = function () {
                let TabsSessionUrl = chrome.extension.getURL(opt.TabsSessionUrl)
                chrome.runtime.sendMessage({
                    info: 'openUrl',
                    url: TabsSessionUrl,
                    active: true
                });
            }
            addToBook.parentNode.insertBefore(goTabs, addToBook.parentNode.children[2])
        }
    }
    function createMainEle(opt) {

        let bookMarkContainerCheck = document.getElementById('bookMarkContainerId');
        if (bookMarkContainerCheck != undefined && bookMarkContainerCheck != null) {
            return;
        }

        let pluginsContainersIdly = document.getElementById("pluginsContainersIdly");
        if (pluginsContainersIdly == null || pluginsContainersIdly == undefined) {
            pluginsContainersIdly = document.createElement("div");
            pluginsContainersIdly.id = "pluginsContainersIdly";
            document.documentElement.appendChild(pluginsContainersIdly);

        };
        let bookMarkContainer = document.createElement("div");
        bookMarkContainer.id = "bookMarkContainerId";
        bookMarkContainer.className = 'ccTreeFlexContainer cc-topLayer-2nd ccTreeContainer-h10'; //  
        bookMarkContainer.onclick = shrinkBookmarks;
        //bookMarkContainer.dir = "rtl";

        let treeContainer = document.createElement("div");
        treeContainer.id = "ccTreeFlexContainerId";
        treeContainer.className = 'ccTreeFlexContainer '; //  
        treeContainer.onclick = shrinkBookmarks;


        let treeItem1 = document.createElement("div"); // mountId Element
        treeItem1.id = 'ccTreeFlexItem1';
        treeItem1.className = 'ccTreeFlexItem cc-topLayer-2nd';


        let dl = document.createElement('dl');
        //dl.className = 'zeroMargin';
        dl.id = "bookMainButtonDl";
        dl.className = 'zeroMargin cc-top';

        let dt = document.createElement('dt');
        dt.id = "bookMainButtonDt"
        dt.dir = 'rtl';
        dt.className = 'cc-width-auto';

        let book = createBookmarkEle("Books", 'folder', '0', clickBook);
        book.classList.add('transparent');
        book.classList.add('mainBooks');
        book.id = 'mainBooksButton';
        book.dir = 'ltr';
        book.onclick = showAllBookMarks;

        let bookToggle = createBookmarkEle("ToggleBooks", 'folder', '0', clickBook);
        bookToggle.classList.add('transparent');
        bookToggle.classList.add('mainBooks');
        bookToggle.id = 'mainBooksToggle';
        bookToggle.dir = 'ltr';
        bookToggle.onclick = mainBooksToggle;

        dt.appendChild(bookToggle);
        dt.appendChild(book);

        let bookMain = opt.data[0].children[0].children;
        // let lTT = bookMain.length > 9 ? (bookMain.length > opt.mainBookNum ? opt.mainBookNum : bookMain.length) : bookMain.length;
        let lTT = bookMain.length > opt.mainBookNum ? opt.mainBookNum : bookMain.length
        if (!opt.onlyMainBooksButton) {
            for (let i = 0; i < lTT; i++) {
                let bookTT = createBookmarkEle(bookMain[i].title, bookMain[i].url == undefined ? 'folder' : '', bookMain[i].id, bookMain[i].url, clickBook);
                //bookTT.classList.add("hide");
                bookTT.dir = 'ltr';
                //bookTT.classList.add('transparent');
                bookTT.classList.add('mainBooks');
                bookTT.setAttribute('data-bookIndex', i);

                dt.appendChild(bookTT);
            }
        } else {
            bookToggle.classList.add('hide');
        }

        treeItem1.appendChild(dl).appendChild(dt);

        let treeItem2 = document.createElement("div"); // mountId Element
        treeItem2.id = 'ccTreeFlexItem2';
        treeItem2.className = 'ccTreeFlexItem2 cc-topLayer-2nd';

        bookMarkContainer.appendChild(treeItem1);
        bookMarkContainer.appendChild(treeItem2);

        pluginsContainersIdly.appendChild(bookMarkContainer);
        pluginsContainersIdly = null;
        bookMain = null;

    }
    function mainBooksToggle() {
        opt.ifBookClicked = true;

        ///////////////////////////////////  
        // remove mainBooksButtonChild content
        let treeItem2 = document.getElementById('ccTreeFlexItem2');
        treeItem2.classList.remove('cc-background-dark-5');
        let mainBooksButton = document.getElementById('mainBooksButton');
        mainBooksButton.setAttribute('data-ifShowAll', 'false');
        let tct = treeItem2.childNodes;
        for (let tctt of tct) {
            treeItem2.removeChild(tctt);
        }
        let bookMarkContainer = document.getElementById('bookMarkContainerId');
        bookMarkContainer.classList.remove('ccTreeContainer-h90');
        bookMarkContainer.classList.add('ccTreeContainer-h10');
        bookMarkContainer = null;
        //////////////////////////////
        //  remove mainBooksChild previous content
        let preMainBooksChild = document.getElementById('mainBooksChildId');
        if (preMainBooksChild != undefined || preMainBooksChild != null) {
            if (this.getAttribute('data-bookid') !== preMainBooksChild.getAttribute('data-bookid')) {
                this.setAttribute('data-ifShowAll', 'false');
            }
        }
        if (preMainBooksChild != undefined && preMainBooksChild != null && preMainBooksChild.parentNode != null && preMainBooksChild.parentNode != undefined) {
            preMainBooksChild.parentNode.removeChild(preMainBooksChild);
        }
        ////////////////////////


        let ToggleEle = null;
        let ifToggle = null;
        if (this == window) {
            ToggleEle = document.getElementById("mainBooksToggle");
            ifToggle = ToggleEle.getAttribute('data-ifToggle');
        } else {
            ToggleEle = this;
            ifToggle = ToggleEle.getAttribute('data-ifToggle');
        }

        let booksArr = document.querySelectorAll(".mainBooks");
        if (ifToggle == 'true') {
            booksArr.forEach(function (ele) {
                ele.classList.remove('hide');
            });
            document.getElementById('bookMarkContainerId').classList.add('ccTreeContainer-h10');
            ToggleEle.setAttribute('data-ifToggle', 'false');
        } else {
            booksArr.forEach(function (ele) {
                if (ele.id != 'mainBooksToggle') {//&&ele.id!='mainBooksButton'
                    ele.classList.add('hide');
                }
            });
            document.getElementById('bookMarkContainerId').classList.remove('ccTreeContainer-h10');
            ToggleEle.setAttribute('data-ifToggle', 'true');
        }
        booksArr = null;
        ToggleEle = null;
        delaySetIfBookClicked();
    }
    function showAllBookMarks() {
        //ifShowAll=this.getAttribute('data-ifShowAll');
        opt.ifBookClicked = true;
        let preMainBooksChild = document.getElementById('mainBooksChildId');
        if (preMainBooksChild != undefined) {
            if (this.getAttribute('data-bookid') !== preMainBooksChild.getAttribute('data-bookid')) {
                this.setAttribute('data-ifShowAll', 'false');
            }
            preMainBooksChild.parentNode.removeChild(preMainBooksChild);

        }

        let treeItem2 = document.getElementById('ccTreeFlexItem2');

        if (this.getAttribute('data-ifShowAll') == undefined || this.getAttribute('data-ifShowAll') == 'false') {
            this.setAttribute('data-ifShowAll', 'true');
            treeItem2.classList.add('cc-background-dark-5');

            let bookMain = opt.data[0];
            let ln = bookMain.length;
            readAllBookMarks(bookMain, treeItem2);
            let bookMarkContainer = document.getElementById('bookMarkContainerId');
            bookMarkContainer.classList.remove('ccTreeContainer-h10');
            bookMarkContainer.classList.add('ccTreeContainer-h90');
            bookMarkContainer = null;

            documentHideEvent(this);

        } else {
            treeItem2.classList.remove('cc-background-dark-5');
            this.setAttribute('data-ifShowAll', 'false');
            let tct = treeItem2.childNodes;
            for (let tctt of tct) {
                treeItem2.removeChild(tctt);
            }
            let bookMarkContainer = document.getElementById('bookMarkContainerId');
            bookMarkContainer.classList.remove('ccTreeContainer-h90');
            bookMarkContainer.classList.add('ccTreeContainer-h10');
            bookMarkContainer = null;

        }
        delaySetIfBookClicked();
    }


    function readAllBookMarks(obj, parentEle, info) {
        info = info || '';



        if (obj.url == undefined) {
            let dl = document.createElement('dl');
            dl.className = 'zeroMargin';
            let dt = document.createElement('dt');
            dt.className = 'zeroMargin';

            let dd = document.createElement('dd');

            let parentBookIdT = parentEle.getAttribute('data-bookId');
            if (obj.id != '0' && obj.parentId != '0' && obj.parentId != '1' && obj.parentId != '2') {
                dl.className = 'zeroMargin hide';
            }
            if (obj.id == '0') {
                dd.className = 'zeroMargin';
            } else { //   if()  obj.id =='1'||obj.id =='2'||obj.parentId == '0' || obj.parentId == '1' || obj.parentId == '2'
                dd.className = 'cc-marginWidth-middle';
            }
            //if(info=='fromMainBooks'){
            //	dd.className = 'cc-marginWidth-middle';  
            //}

            let bookTT = createBookmarkEle(obj.title, 'folder', obj.id, obj.url, clickBook);

            parentEle.appendChild(dl).appendChild(dt).appendChild(dd).appendChild(bookTT);

            if (obj.title == '' || obj.id == '1' || obj.id == '2') {
                bookTT.setAttribute('data-ifShowAll', 'true');
            }

            for (let childObj of obj.children) {
                readAllBookMarks(childObj, dd, info);
            }

        } else {
            let bookTT = createBookmarkEle(obj.title, '', obj.id, obj.url, clickBook);
            let dd = document.createElement('dd');
            let parentBookIdT = parentEle.getAttribute('data-bookId');
            if (obj.id != '0' && obj.parentId != '0' && obj.parentId != '1' && obj.parentId != '2') {
                dd.className = 'hide cc-marginWidth-middle';
            }
            if (obj.parentId == '0' || obj.parentId == '1' || obj.parentId == '2') {
                dd.className = 'cc-marginWidth-middle';
            }
            ////dd.className = 'zeroMargin'; 

            parentEle.appendChild(dd).appendChild(bookTT);
        }
    }
    /**
     * 
     * @param {string} title 
     * @param {string} type 
     * @param {string} bookId 
     * @param {string} bookURL 
     * @param {function} onclick 
     */
    function createBookmarkEle(title, type, bookId, bookURL, onclick) {
        let book = document.createElement('input');

        book.type = 'button';
        if(bookURL!=undefined&&bookURL.constructor==String){
            book.setAttribute('title', bookURL);
        } 
        book.setAttribute('data-bookId', bookId);
        if (type == 'folder') {
            book.value = (title != '' ? title : 'Books') + " >";
            book.setAttribute('data-bookType', 'folder');
            book.className = opt.booksColor + ' cc-circle-25 pointer cc-background-dark-3 fontSize-small cc-bookBtn eleWidth-small eleHeight-small';
        } else {
            book.value = title;
            book.setAttribute('data-bookurl', bookURL); // font-green-dark
            book.className = opt.booksColor + ' cc-circle-25 pointer cc-background-dark-3 fontSize-small cc-bookBtn eleWidth-small eleHeight-small';
        }
        onclick ? (book.onclick = onclick) : null;

        return book;
    }

    function clickBook() {

        opt.ifBookClicked = true;

        let url = this.getAttribute('data-bookurl');
        let type = this.getAttribute('data-bookType');


        if (type == 'folder') {
            if (this.classList.contains('mainBooks')) {
                ///////////////////////////////////  
                // remove mainBooksButtonChild content
                let treeItem2 = document.getElementById('ccTreeFlexItem2');
                treeItem2.classList.remove('cc-background-dark-5');
                let mainBooksButton = document.getElementById('mainBooksButton');
                mainBooksButton.setAttribute('data-ifShowAll', 'false');
                let tct = treeItem2.childNodes;
                for (let tctt of tct) {
                    treeItem2.removeChild(tctt);
                }
                let bookMarkContainer = document.getElementById('bookMarkContainerId');
                bookMarkContainer.classList.remove('ccTreeContainer-h90');
                bookMarkContainer.classList.add('ccTreeContainer-h10');
                bookMarkContainer = null;
                //////////////////////////////
                //  remove mainBooksChild previous content
                let preMainBooksChild = document.getElementById('mainBooksChildId');
                if (preMainBooksChild != undefined || preMainBooksChild != null) {
                    if (this.getAttribute('data-bookid') !== preMainBooksChild.getAttribute('data-bookid')) {
                        this.setAttribute('data-ifShowAll', 'false');
                    }
                }
                if (preMainBooksChild != undefined && preMainBooksChild != null && preMainBooksChild.parentNode != null && preMainBooksChild.parentNode != undefined) {
                    preMainBooksChild.parentNode.removeChild(preMainBooksChild);
                }
                ////////////////////////
                if (preMainBooksChild == null || this.getAttribute('data-ifShowAll') == undefined || this.getAttribute('data-ifShowAll') == 'false') {
                    this.setAttribute('data-ifShowAll', 'true');

                    let dt = document.createElement('dt');
                    dt.className = 'cc-width-auto mainBooksChild mainButtonSub cc-background-dark-5';
                    dt.id = 'mainBooksChildId';
                    dt.setAttribute('data-bookid', this.getAttribute('data-bookid'));
                    let dtLeft = elementOffset(this).left;
                    let bodyWidth = document.body.offsetWidth != 0 ? document.body.offsetWidth : document.documentElement.offsetWidth;
                    //let bodyWidth=document.body.offsetWidth;

                    dtLeft = (dtLeft > bodyWidth * 0.4) ? (bodyWidth * 0.4) : dtLeft;
                    dt.style.marginLeft = dtLeft + 'px';


                    let bookMainTT = opt.data[0].children[0].children;

                    let indexTT03 = this.getAttribute('data-bookIndex');

                    for (let bmTTcT of bookMainTT[indexTT03].children) {
                        readAllBookMarks(bmTTcT, dt, 'fromMainBooks');
                    }
                    for (let tctt05 of dt.childNodes) {
                        tctt05.classList.remove('hide');
                    }
                    this.parentNode.parentNode.appendChild(dt);
                    /////////////////////
                    let bookMarkContainer = document.getElementById('bookMarkContainerId');
                    bookMarkContainer.classList.remove('ccTreeContainer-h10');
                    bookMarkContainer.classList.add('ccTreeContainer-h90');
                    bookMarkContainer = null;
                    documentHideEvent();
                } else {
                    this.setAttribute('data-ifShowAll', 'false');
                    let mainBooksChild = this.parentNode.parentNode.childNodes;
                    for (let mainBooksChildTT of mainBooksChild) {
                        if (mainBooksChildTT.classList.contains('mainBooksChild')) {
                            this.parentNode.parentNode.removeChild(mainBooksChildTT);
                        }
                    }
                }
                delaySetIfBookClicked();
                return;
            }

            let tct = this.parentNode.childNodes;

            if (this.getAttribute('data-ifShowAll') == undefined || this.getAttribute('data-ifShowAll') == 'false') {
                this.setAttribute('data-ifShowAll', 'true');

                for (let tctt of tct) {
                    tctt.classList.remove('hide');
                }
            } else {
                this.setAttribute('data-ifShowAll', 'false');
                for (let tctt of tct) {
                    if (tctt.type != 'button') {
                        tctt.classList.add('hide');
                    }
                }
            }
        } else {
            if (url == undefined || url == '') {
                let id = this.getAttribute('data-bookId');
            } else {
                chrome.runtime.sendMessage({
                    info: 'openUrl',
                    url: url

                });
            }
        }
        delaySetIfBookClicked();
    }

    function hideBookMarks() {
        document.getElementById('ccTreeFlexItem1').classList.add('hide');
        document.getElementById('ccTreeFlexItem2').classList.add('hide');

    }

    function showBookMarks() {
        document.getElementById('ccTreeFlexItem1').classList.remove('hide');
        document.getElementById('ccTreeFlexItem2').classList.remove('hide');

    }

    function onlyBooksButton() {
        let mainButton = document.getElementById('bookMainButtonDt');
        let mainButtons = mainButton.childNodes;
        for (let tt of mainButtons) {
            if (tt.value != 'Books') {
                mainButton.removechild(tt);
            }
        }
    }

    function elementOffset(element) {

        let pos = {
            left: 0,
            top: 0
        };
        let parent = element.offsetParent;

        pos.left += element.offsetLeft;
        pos.top += element.offsetTop;

        while (parent && !/html|body/i.test(parent.tagName)) {
            pos.left += parent.offsetLeft;
            pos.top += parent.offsetTop;

            parent = parent.offsetParent;
        }
        return pos;
    }
    function delaySetIfBookClicked() {
        let shrinkBookmarksTimer = setTimeout(function () {
            opt.ifBookClicked = false;
            clearTimeout(shrinkBookmarksTimer);
        }, 100);
    }
    function shrinkBookmarks() {
        if (!opt.ifBookClicked) {
            let treeItem2 = document.getElementById('ccTreeFlexItem2');

            document.getElementById('mainBooksButton').setAttribute('data-ifShowAll', 'false');
            let tct = treeItem2.childNodes;
            let treeItem2Length = tct.length;
            if (treeItem2Length > 0) {
                treeItem2.classList.remove('cc-background-dark-5');
                for (let tctt of tct) {
                    treeItem2.removeChild(tctt);
                }
            }

            ///////////////////////
            let preMainBooksChild = document.getElementById('mainBooksChildId');
            if (preMainBooksChild != undefined && preMainBooksChild != null && preMainBooksChild.parentNode != null && preMainBooksChild.parentNode != undefined) {
                preMainBooksChild.parentNode.removeChild(preMainBooksChild);
            }
            /////////////////////////////
            if (preMainBooksChild != undefined || treeItem2Length > 0) {
                let bookMarkContainer = document.getElementById('bookMarkContainerId');
                bookMarkContainer.classList.remove('ccTreeContainer-h90');
                bookMarkContainer.classList.add('ccTreeContainer-h10');
                bookMarkContainer = null;
            }
            opt.ifBookClicked = true;
        }
    }

    function documentHideEvent(Element) {
        Element = Element || null;
        let hiddenPropertyInClock = 'hidden' in document ? 'hidden' :
            'webkitHidden' in document ? 'webkitHidden' :
                'mozHidden' in document ? 'mozHidden' :
                    null;
        let visibilityChangeEventInClock = hiddenPropertyInClock.replace(/hidden/i, 'visibilitychange');
        let onVisibilityChangeInClock = function () {
            if (document[hiddenPropertyInClock] && opt.autoShrink) {

                //////////////////////////
                if (Element != null) {
                    let treeItem2 = document.getElementById('ccTreeFlexItem2');
                    treeItem2.classList.remove('cc-background-dark-5');
                    Element.setAttribute('data-ifShowAll', 'false');
                    let tct = treeItem2.childNodes;
                    for (let tctt of tct) {
                        treeItem2.removeChild(tctt);
                    }

                }

                ////////////////////////////
                let preMainBooksChild = document.getElementById('mainBooksChildId');
                if (preMainBooksChild != undefined && preMainBooksChild != null && preMainBooksChild.parentNode != null && preMainBooksChild.parentNode != undefined) {
                    preMainBooksChild.parentNode.removeChild(preMainBooksChild);
                }
                /////////////////////////////
                let bookMarkContainer = document.getElementById('bookMarkContainerId');
                bookMarkContainer.classList.remove('ccTreeContainer-h90');
                bookMarkContainer.classList.add('ccTreeContainer-h10');
                bookMarkContainer = null;
                document.removeEventListener(visibilityChangeEventInClock, onVisibilityChangeInClock);
            } else {


            }
        }
        document.addEventListener(visibilityChangeEventInClock, onVisibilityChangeInClock);
    }

    function fakeClick(obj) {
        let ev = document.createEvent("MouseEvents");
        ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        obj.dispatchEvent(ev);
    }

    window.ChromeBookmarks = ChromeBookmarks;
})();