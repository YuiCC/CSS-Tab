;
(function() {

    //  C.C.Treee.js

    /*   
    opt.data must be JsonObject or JsonArray


    */
    let opt = {};
    let ccTree = function(options) {
        opt = options || {};
        opt.data = opt.data ? opt.data : null;
        opt.mountId = opt.mountId ? opt.mountId : null;

        checkDataType();
       // createMainEle(opt);
    }

    function checkDataType() {
        if (opt.data instanceof Array) {
            opt.dataType = 'array';
            console.debug("opt.dataType = 'array'");
        } else if (opt.data instanceof Object) {
            opt.dataType = 'object';
            console.debug("opt.dataType = 'object'");
        }
    }

    function createMainEle(opt) {

        let treeContainer = document.createElement("div");
        treeContainer.id = "ccTreeFlexContainerId";
        treeContainer.className = 'ccTreeFlexContainer';


        let treeItem1 = document.createElement("div");
        treeItem1.id = 'ccTreeFlexItem1';
        treeItem1.className = 'ccTreeFlexItem';

        if (opt.dataType = 'array') {
            let dl = document.createElement('dl');
            dl.className = 'zeroMargin';

            let dt = document.createElement('dt');
            dt.className = 'cc-width-auto';


        }


        document.getElementById(opt.mountId).appendChild(treeContainer).appendChild(treeItem1);


    }
     function createBookmarkEle(title, type, bookId, bookURL) {
        let book = document.createElement('input');

        book.type = 'button';
        book.setAttribute('data-bookId', bookId);
        if (type == 'folder') {
            book.value = title + " >";
            book.className = ' cc-circle font-white-red  pointer transparent';
        } else {
            book.value = title;
            book.setAttribute('data-bookURL', bookURL);
            book.className = ' cc-circle font-green-dark  pointer transparent';
        }
        book.onclick = clickBook;

        return book;
    }

    window.ccTree = ccTree;
})();