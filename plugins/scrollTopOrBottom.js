;
(function () {

	let ScrollTopOrBottom = function (options) {
		//this.name="regexSearch";
		this.options = options || {
			is_ScrollTopOrBottom_Bar_RightTop: false
		};
		try {
			document.body.style.overflow = "auto"
		} catch (error) {

		}
		createElement(this.options);
	};

	function createElement(options) {

		let pluginsContainersIdly = document.getElementById("pluginsContainersIdly");
		if (pluginsContainersIdly == null || pluginsContainersIdly == undefined) {
			pluginsContainersIdly = document.createElement("div");
			pluginsContainersIdly.id = "pluginsContainersIdly";
			document.documentElement.appendChild(pluginsContainersIdly);
		};

		let scrollDiv = document.createElement("div");
		//clockContainer.className = options.clockContainerClass;
		scrollDiv.id = "scrollDiv";
		if (options.is_ScrollTopOrBottom_Bar_RightTop) {
			scrollDiv.className = ' cc-circle font-white-red cc-right cc-top-20  cc-float cc-topLayer';
		} else {
			scrollDiv.className = ' cc-circle font-white-red cc-right cc-bottom  cc-float cc-topLayer';
		}


		let dl = document.createElement('dl');

		let topButton = document.createElement('button');
		let bottomButton = document.createElement('button');

		topButton.appendChild(document.createTextNode('Top'));
		bottomButton.appendChild(document.createTextNode('Bottom'));

		if (options.is_ScrollTopOrBottom_Bar_RightTop) {
			// 	let dt = document.createElement('dt');
			// let dt2 = document.createElement('dt'); 
			// 	// dl.appendChild(dt)
			// dl.appendChild(dt2)
			// 	dt.appendChild(topButton);
			// 	dt2.appendChild(bottomButton);
			// let topSpan = document.createElement('span');
			// let bottomSpan = document.createElement('span');
			// topSpan.className = ' cc-circle font-white-red  pointer icono-caretUpCircle cc-background-dark-5';
			// bottomSpan.className = ' cc-circle font-white-red pointer icono-caretDownCircle cc-background-dark-5';
			// topSpan.onclick = scrollTop;
			// bottomSpan.onclick = scrollBottom;
			// dt.appendChild(topSpan);
			// dt2.appendChild(bottomSpan);
			////////////////////////////////////////////////
			let dt21 = document.createElement('dt');
			let dt22 = document.createElement('dt');
			 
			dl.appendChild(dt21)
			dl.appendChild(dt22)
			let topSpan2 = document.createElement('span');
			let bottomSpan2 = document.createElement('span');
			topSpan2.className = ' cc-circle font-white-red  pointer cc-icon-caretUpCircle cc-background-dark';
			bottomSpan2.className = ' cc-circle font-white-red pointer cc-icon-caretDownCircle cc-background-dark';
			topSpan2.onclick = scrollTop;
			bottomSpan2.onclick = scrollBottom;
			dt21.appendChild(topSpan2);
			dt22.appendChild(bottomSpan2);


			///////////////////////////
		} else {
			let dt = document.createElement('dt'); 
			dl.appendChild(dt)
			topButton.className = ' cc-circle font-white-red  pointer cc-background-dark';
			bottomButton.className = ' cc-circle font-white-red pointer cc-background-dark';
			topButton.onclick = scrollTop;
			bottomButton.onclick = scrollBottom;
			dt.appendChild(topButton);
			dt.appendChild(bottomButton);
		}


		pluginsContainersIdly.appendChild(scrollDiv).appendChild(dl);
		pluginsContainersIdly = null;
	}

	function scrollTop() {
		//document.documentElement.scrollTop = 0;
		scrollTo(0, 0);
	}

	function scrollBottom() {
		//document.documentElement.scrollTop = document.body.scrollHeight;
		let high = document.body.scrollHeight;
		high = high != 0 ? high : document.documentElement.scrollHeight;
		scrollTo(0, high);
	}
	// regexSearch.prototype = {};
	window.ScrollTopOrBottom = ScrollTopOrBottom;
})();