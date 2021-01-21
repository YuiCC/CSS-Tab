;
(function () {
	let opt = null;
	let InPageSearch = function (option) {

		opt = option || {
			searchEngine: 'https://cn.bing.com/images/search?q=',
			searchEngineParams: '&FORM=BESBTB&first=1&cw=1562&ch=909&ensearch=1',
			closeInPageSearchByClickOutsideSearchPage:true
		};
		createContextMenus()
	};

	function createContextMenus() {
		chrome.runtime.onMessage.addListener(function(msg,sender){
			
			contextMenusOnClicked(msg.info, opt)
		});
	}

	 
	function contextMenusOnClicked(info, opt) {
		if(!info||!info.selectionText){
			return;
		}
		let preInPageSearch= document.getElementById('inPageSearchIframeId');
		if(preInPageSearch){
			preInPageSearch.parentNode.removeChild(preInPageSearch);
		}
		url =  opt.searchEngine+info.selectionText+opt.searchEngineParams;
		 
		let iframeDiv =document.createElement('div');
		let dl=document.createElement('dl');
		let dt1=document.createElement('dt');
		let dt2=document.createElement('dt');
		let iframe =document.createElement('iframe'); 
		iframe.width='600';
		iframe.height='500';
		iframe.className = "cc-inPageSearch cc-topLayer";

		//let blob=new Blob(re, { "type" : "text/html" });
		iframe.src=url;
		
		iframeDiv.id="inPageSearchIframeId";
		
		
		 
		let btn=document.createElement('button');
		let btntxt=document.createTextNode("Close inPageSearch");
		btn.className="cc-inPageSearch-close cc-background-dark-8 font-green-dark pointer"

        if(opt.closeInPageSearchByClickOutsideSearchPage){
			iframeDiv.className = "cc-inPageSearchDiv cc-topLayer-2nd cc-border-c"; 
			iframeDiv.onclick=function(){
				
				iframe=null;
				iframeDiv.parentNode.removeChild(iframeDiv);
				iframeDiv=null;
	
			};
		}else{
			iframeDiv.className = " "; 
			btn.onclick=function(){
				iframe=null;
				iframeDiv.parentNode.removeChild(iframeDiv);
				iframeDiv=null;
			}
			dl.appendChild(dt1).appendChild(btn).appendChild(btntxt);
		}
		
		dl.appendChild(dt2).appendChild(iframe);
		document.getElementsByTagName('body')[0].appendChild(iframeDiv).appendChild(dl);
	
	}
	function http(url) { 
		let http = new XMLHttpRequest();
		let re = null;
		try {
			http.open('GET', url,  false); 
			/**
			  http.onerror = function () { 
		   console.error("** An error occurred during the transaction");
			  };
			 */
			http.send();
			 re=http.response;
			
		} catch (e) {
			console.error(e);  
		};
		http = null;
		return re;
	};
	

	
	// InPageSearch.prototype = {};
	window.InPageSearch = InPageSearch;
})();