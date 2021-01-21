;
(function () {
    let regexSearchMarks = [];
    let regexSearchCur = 0;
    let opt = {}
    let ifShow=false
    let color = {
        colorMarkFullLineUnselected: ";color:rgb(233, 179, 62) !important;",
        colorMarkFullLineSelected: ";color: rgb(152, 251, 152) !important;"
    }
    let classMatch = {
        classSelected: "font-green-dark fontSize-large font-bold",
        classUnselected: "font-yellow-dark fontSize-large font-bold"
    }
    
    let shiftKeyTime=0
     
    let RegexSearch = function (options) {
        //this.name="regexSearch";
        opt = options || {
            timeout: 5 * 60000
        }; 
        opt.markFullLine = opt.markFullLine ? opt.markFullLine : false
        document.addEventListener("keydown", keyOpenRegexSearch,false) 
        this.clear = function () {
            clearRegexSearch();
        };
        this.clearAndClose = function () {
            clearRegexSearch();
            regexSearch = null;
            let regexSearchBoxDiv = document.getElementById('regexSearchBoxDiv');
            regexSearchBoxDiv.parentNode.removeChild(regexSearchBoxDiv);
        }  
        this.start = () =>  showSearchBox() 
    };
    function showSearchBox(){
        if(ifShow){
            return
        }
        ifShow=true
        regexSearchCreate();

        setTimeout(function () {
            clearRegexSearch();
        }, opt.timeout); 
    }
    let keyOpenRegexSearch=function(event){
             //     if(event.shiftKey) {   
        //         shiftKeyTime=(new Date()).getTime(); 
        //     }else if(event.key =="f"&&((new Date()).getTime()-shiftKeyTime)<3000){ 
        //         showSearchBox()
        //     } 
        if(event.ctrlKey&&event.shiftKey&&event.keyCode ==70){
            event.preventDefault();//取消默认行为
            showSearchBox()
        }
    }
    let queryInputKeyDown = function (event) {
        if (event.keyCode == 13) {
            regexSearchInputClick();
        }  
    };
    let regexSearchResultNumKeyDown=function(event){
        if (event.keyCode == 13) {
            resultNum()
        }
    }
    function regexSearchFunc() {
        let id = this.id;

        if (id == 'regexSearchInput') {
            regexSearchInputClick();
        } else if (id == 'regexSearchPre') {
            regexSearchMarksPre();

        } else if (id == 'regexSearchNext') {
            regexSearchMarksNext();
        } else if (id == 'regexSearchClose') {
            ifShow=false
            clearRegexSearch();
            regexSearch = null;
            let regexSearchBoxDiv = document.getElementById('regexSearchBoxDiv');
            regexSearchBoxDiv.parentNode.removeChild(regexSearchBoxDiv);

        }

    }
    function resultNum(){ 
        let nextCur=document.querySelector("#regexSearchResultNum").value
        if(Number(nextCur)<=regexSearchMarks.length&&Number(nextCur)>=1){
            regexSearchMarksNext(Number(nextCur)-1)
        } 
    }
    function regexSearchCreate() {
        let pluginsContainersIdly = document.getElementById("pluginsContainersIdly");
        if (pluginsContainersIdly == null || pluginsContainersIdly == undefined) {
            pluginsContainersIdly = document.createElement("div");
            pluginsContainersIdly.id = "pluginsContainersIdly";
            document.documentElement.appendChild(pluginsContainersIdly);
        };
        let regexSearchBoxDiv = document.createElement("div");
        regexSearchBoxDiv.setAttribute("class", "cc-centerDiv cc-topLayer cc-top-5 ");
        regexSearchBoxDiv.setAttribute("id", "regexSearchBoxDiv");

        let dl = document.createElement('dl');
        let dt = document.createElement('dt');
        let input = document.createElement('input');
        let preButton = document.createElement('button');
        let nextButton = document.createElement('button');
        let resultNumButton = document.createElement('input');
        let resultNumTotalButton = document.createElement('input');
        let closeButton = document.createElement('button');
        let markFullLineBtn = document.createElement('button');

        //let txt=document.createTextNode("ddddddddddd");

        preButton.appendChild(document.createTextNode('pre'));
        preButton.style="border: solid 3px #04f590 !important;height:33px !important;"
        preButton.setAttribute("class", "cc-border-c pointer cc-background-dark-5 font-green-dark");
        preButton.setAttribute("id", "regexSearchPre");

        nextButton.appendChild(document.createTextNode('next'));
        nextButton.style="border: solid 3px #04f590 !important;height:33px !important;"
        nextButton.setAttribute("class", "cc-border-c pointer cc-background-dark-5 font-green-dark");
        nextButton.setAttribute("id", "regexSearchNext");

        closeButton.appendChild(document.createTextNode('X'));
        closeButton.style="border: solid 3px #04f590 !important;height:33px !important;"
        closeButton.setAttribute("id", "regexSearchClose");
        closeButton.setAttribute("class", "cc-border-c pointer cc-background-dark-5 font-green-dark");
        
        
        resultNumButton.setAttribute("id", "regexSearchResultNum"); 
        resultNumButton.title="input a num and click this will go to it"
        resultNumButton.style = "min-width: 55px;width: 55px;border: solid 3px #04f590 !important;height:25px !important;border-right: none !important; padding-right: 0px !important; border-top-right-radius: 0px !important; border-bottom-right-radius: 0px !important;text-align: right !important;"
        resultNumButton.setAttribute("class", "cc-border-c pointer cc-background-dark-5 font-green-dark");
        resultNumButton.value = 0
        resultNumButton.onclick=resultNum  
        resultNumButton.addEventListener("keydown", regexSearchResultNumKeyDown);

        resultNumTotalButton.setAttribute("id", "regexSearchResultNumTotal");
        resultNumTotalButton.setAttribute("readonly", true);
        resultNumTotalButton.style = "min-width: 45px;width: 45px;border: solid 3px #04f590 !important;height:25px !important;border-left: none !important; padding-left: 0px !important;  border-top-left-radius: 0px !important;  border-bottom-left-radius: 0px !important;"
        resultNumTotalButton.setAttribute("class", "cc-border-c pointer cc-background-dark-5 font-green-dark");
        resultNumTotalButton.value = "/0"
 
        markFullLineBtn.style="border: solid 3px #04f590 !important;height:33px !important;"
        markFullLineBtn.classList = "cc-background-dark-5 font-green-dark cc-border-c pointer"
        markFullLineBtn.setAttribute("data-markFullLine", "false")
        markFullLineBtn.innerHTML = "MarkFullLine: False" 
        markFullLineBtn.onclick = function () {
            let tt = this.getAttribute("data-markFullLine")
            if (tt == "false") {
                this.setAttribute("data-markFullLine", "true")
                this.innerHTML = "MarkFullLine: True"
                opt.markFullLine = true
            } else {
                this.setAttribute("data-markFullLine", "false")
                this.innerHTML = "MarkFullLine: Fale"
                opt.markFullLine = false
            }

        }
        input.style="border: solid 3px #04f590 !important;height:25px !important;"
        input.setAttribute("placeholder", "Regex Search");
        input.setAttribute("id", "regexSearchInput");
        input.setAttribute("class", "cc-border-c cc-background-dark-5 font-green-dark");

        dt.setAttribute("class", "cc-background-dark ");
        dt.appendChild(markFullLineBtn);
        dt.appendChild(input);
        dt.appendChild(resultNumButton);
        dt.appendChild(resultNumTotalButton);
        dt.appendChild(preButton);
        dt.appendChild(nextButton);
        dt.appendChild(closeButton);

        pluginsContainersIdly.appendChild(regexSearchBoxDiv).appendChild(dl).appendChild(dt);
        pluginsContainersIdly = null;

        let regexSearchInputEle = document.getElementById('regexSearchInput');
        regexSearchInputEle.onclick = regexSearchFunc;
        regexSearchInputEle.addEventListener("keydown", queryInputKeyDown);
        document.getElementById('regexSearchPre').onclick = regexSearchFunc;
        document.getElementById('regexSearchNext').onclick = regexSearchFunc;
        document.getElementById('regexSearchClose').onclick = regexSearchFunc;
    }

    function regexSearchInputClick() {
        clearRegexSearch();

        let regexSearchInputBox = document.getElementById('regexSearchInput');
        let regexSearchInput = regexSearchInputBox.value.trim();
        if (regexSearchInput == '') {
            return;
        }

        let html = document.getElementsByTagName('body')[0];
        html.normalize();

        let regText = null;
        try {
            regText = eval('/' + regexSearchInput + '/ig');
        } catch (e) {
            document.getElementById('regexSearchResultNum').value = "Invalid";
            document.getElementById('regexSearchResultNumTotal').value = "Regex";
            document.getElementById('regexSearchInput').title = "InvalidRegex";
            return;
        }

        recurseRegexSearch(html, regText); 
        createScrollbar(regexSearchMarks)
        regexSearchMarksNext(nextCur=0) 
    }

    function changeColorForSearchMatchParent(element, selected = "true") {
        let style = ""
        let isLink = false
        if (element.tagName == "A") {
            isLink = true
        }
        if (selected == "true") {
            if (element.style.innerText) {
                style = element.style.innerText.replace(color.colorMarkFullLineUnselected, "")
            }
            style = style + color.colorMarkFullLineSelected

            element.classList.remove('font-dusk-yellow-dark')
            element.classList.add('font-green-dark')
        } else if (selected == "false") {
            if (element.style.innerText) {
                style = element.style.innerText.replace(color.colorMarkFullLineSelected, "")
            }
            style = style + color.colorMarkFullLineUnselected

            element.classList.add('font-dusk-yellow-dark')
            element.classList.remove('font-green-dark')
        } else if (selected == "none") {
            if (element.style.innerText) {
                style = element.style.innerText.replace(color.colorMarkFullLineSelected, "")
                style = element.style.innerText.replace(color.colorMarkFullLineUnselected, "")
            }

            element.classList.remove('font-green-dark')
            element.classList.remove('font-dusk-yellow-dark')
        }
        if (!isLink) {
            element.style = style
        }
    }

    function changeColorForSearchMatch(direction, param={nextCur:undefined}) {
        if (regexSearchMarks.length == 0) {
            return;
        }
        
        regexSearchMarks[regexSearchCur].className = classMatch.classUnselected;
        regexSearchMarks[regexSearchCur].style = color.colorMarkFullLineUnselected
        if (opt.markFullLine) {
            changeColorForSearchMatchParent(regexSearchMarks[regexSearchCur].parentNode, selected = "false")
        }
        if(param.nextCur!=undefined){
            regexSearchCur=param.nextCur
        }else{
            if (direction == "next") {
                regexSearchCur == (regexSearchMarks.length - 1) ? regexSearchCur=0 : regexSearchCur++;
            } else if (direction == "pre") {
                regexSearchCur == 0 ? regexSearchCur=(regexSearchMarks.length - 1) : regexSearchCur--;
            }
        }
        
        regexSearchMarks[regexSearchCur].className = classMatch.classSelected;
        regexSearchMarks[regexSearchCur].style = color.colorMarkFullLineSelected
        if (opt.markFullLine) {
            changeColorForSearchMatchParent(regexSearchMarks[regexSearchCur].parentNode, selected = "true")
        }

        document.getElementById('regexSearchResultNum').value = (regexSearchCur + 1) ;
        document.getElementById('regexSearchResultNumTotal').value = "/" + regexSearchMarks.length;
        if (opt.markFullLine) {
            regexSearchMarks[regexSearchCur].parentNode.scrollIntoView({
                block: "nearest"
            })
        } else {
            regexSearchMarks[regexSearchCur].scrollIntoView({
                block: "nearest"
            })
        }
        //regexSearchMarks[regexSearchCur].scrollTop=(document.documentElement.clientHeight-20)
    }

    function regexSearchMarksPre() {
        changeColorForSearchMatch("pre")
    }

    function regexSearchMarksNext(nextCur=undefined) { 
        changeColorForSearchMatch("next",{nextCur:nextCur})
    }

    

    function clearRegexSearch() { 
       
        regexSearchCur = 0;
        for (let i = 0; i < regexSearchMarks.length; i++) {
            let mark = regexSearchMarks[i];
            changeColorForSearchMatchParent(mark.parentNode, selected = "none")
            mark.parentNode.replaceChild(mark.firstChild, mark);
            mark = null;
        }
        //regexSearchMarks.length = 0;
        regexSearchMarks = [];
        document.getElementById('regexSearchResultNum').value = 0 ;
        document.getElementById('regexSearchResultNumTotal').value = "/" + String(0);

        removeScrollbar() 
    }

    function recurseRegexSearch(element, regexp) {
        if (element.nodeName == "MARK" || element.nodeName == "SCRIPT" || element.nodeName == "NOSCRIPT" || element.nodeName == "STYLE" || element.nodeType == Node.COMMENT_NODE) {
            return;
        }

        if (element.id == '_regexp_search_count') {
            return;
        }

        if (element.nodeType != Node.TEXT_NODE) {
            let disp = element.style.display;
            if (disp == 'none' || disp == 'hidden') {
                return;
            }
        } 

        if (element.nodeType == Node.TEXT_NODE && element.nodeValue.trim() !== '') {
            let str = element.nodeValue;
            let matches = str.match(regexp);
            let parent = element.parentNode;

            if (matches !== null) {
                let pos = 0;
                let mark;
                for (let i = 0; i < matches.length; i++) {
                    let index = str.indexOf(matches[i], pos);
                    let before = document.createTextNode(str.substring(pos, index));
                    pos = index + matches[i].length;

                    if (element.parentNode == parent) {
                        parent.replaceChild(before, element);
                    } else {
                        parent.insertBefore(before, mark.nextSibling);
                    }

                    mark = document.createElement('mark');
                    mark.appendChild(document.createTextNode(matches[i]));

                    parent.insertBefore(mark, before.nextSibling);
                    mark.className = classMatch.classUnselected;
                    mark.style = color.colorMarkFullLineUnselected

                    regexSearchMarks.push(mark);
                }
                let after = document.createTextNode(str.substring(pos));
                parent.insertBefore(after, mark.nextSibling); 
                if (opt.markFullLine) {
                    changeColorForSearchMatchParent(parent, selected = "false")
                } 
            }
        }
        if (element.childNodes.length > 0) {
            for (let i = 0; i < element.childNodes.length; i++) {
                recurseRegexSearch(element.childNodes[i], regexp);
            }
        }
    }
    // regexSearch.prototype = {};
    window.RegexSearch = RegexSearch;
})();