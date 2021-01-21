// class ClockWidget {
//     intervalTimer = null
//     options = {}
//     clockCanvas = null
//     pause = null
//     ctx = null;

//     constructor(options = {
//         timeout: 5 * 60000,
//         canvasWidth: '140',
//         clockContainerClass: "cc-clockWidget   cc-circle",
//         canvasId: "clockCanvasId",
//         clockContainerId: "clockWidgetId",
//         opacity: 0.4
//     }) {

//         this.options.timeout = this.options.timeout ? this.options.timeout : 5 * 60000;
//         this.options.canvasWidth = this.options.canvasWidth ? this.options.canvasWidth : '140';
//         this.options.clockContainerClass = this.options.clockContainerClass ? this.options.clockContainerClass : "cc-clockWidget   cc-circle"; //  
//         this.options.canvasId = this.options.canvasId ? this.options.canvasId : "clockCanvasId";
//         this.options.clockContainerId = this.options.clockContainerId ? this.options.clockContainerId : "clockWidgetId";
//         this.options.opacity = this.options.opacity ? this.options.opacity : 0.4;

//         this.options.clockSize = 0.5 * this.options.canvasWidth;

//         this.stop = function () {
//             clearInterval(this.intervalTimer);
//             this.intervalTimer = null;
//             this.clockCanvas = null
//         };
//         ///////////////////////////////
//         this.createClock(this.options);
//     }

//     // let hourNums = ['III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'I', 'II'];

//     createClock(options) {
//         this.createElement(options);
//         //获取到canvas元素 
//         this.clockCanvas = document.getElementById(options.canvasId);
//         //获取canvas中的画图环境  
//         this.ctx = this.clockCanvas.getContext("2d");

//         ///////////////////////////////
//         let hiddenPropertyInClock = 'hidden' in document ? 'hidden' :
//             'webkitHidden' in document ? 'webkitHidden' :
//             'mozHidden' in document ? 'mozHidden' :
//             null;
//         let visibilityChangeEventInClock = hiddenPropertyInClock.replace(/hidden/i, 'visibilitychange');
//         let onVisibilityChangeInClock = function () {
//             if (!document[hiddenPropertyInClock]) {
//                 this.pause = false
//             } else {
//                 this.pause = true
//             }
//         }
//         document.addEventListener(visibilityChangeEventInClock, onVisibilityChangeInClock);
//         //////////////////////////////////
//         this.intervalTimer = setInterval(this.intervalEvent.bind(this), 1000);
//     }
//     /**
//      * 
//      * @param {boolean} pause 
//      */
//      intervalEvent() {
//         if (!this.pause) {
//             this.drowClockLayout(this.options, this.ctx);
//             this.drawClockPoints(this.options, this.ctx);
//         }
//     }
//     createElement(options) {
//         let pluginsContainersIdly = document.getElementById("pluginsContainersIdly");
//         if (pluginsContainersIdly == null || pluginsContainersIdly == undefined) {
//             pluginsContainersIdly = document.createElement("div");
//             pluginsContainersIdly.id = "pluginsContainersIdly";
//             document.documentElement.appendChild(pluginsContainersIdly);

//         };
//         let clockContainer = document.createElement("div");
//         //clockContainer.className = options.clockContainerClass;
//         clockContainer.id = options.clockContainerId;

//         let canvasEle = document.createElement("canvas");
//         canvasEle.id = options.canvasId;
//         canvasEle.width = options.canvasWidth;
//         canvasEle.height = options.canvasWidth;
//         canvasEle.className = options.clockContainerClass;

//         pluginsContainersIdly.appendChild(clockContainer).appendChild(canvasEle);
//         pluginsContainersIdly = null;
//     }

//     drowClockLayout(options, ctx) { // ctx :canvas.getContext
//         //钟表的大小：初始值设置 
//         let clockSize = options.clockSize;

//         //清理当前画布，以便后期绘制 
//         ctx.clearRect(0, 0, options.canvasWidth, options.canvasWidth);

//         // draw clock panel
//         ctx.beginPath(); //开启新路径 
//         ctx.lineWidth = clockSize / 13;
//         ctx.fillStyle = "rgba(0,0, 0," + options.opacity + ")";
//         ctx.strokeStyle = "#60D9F8";
//         //绘制表盘圆圈 
//         ctx.arc(options.canvasWidth / 2, options.canvasWidth / 2, clockSize, 0, Math.PI * 2, false);
//         ctx.clip();
//         ctx.fill();
//         ctx.stroke(); //描边绘制  
//         // ctx.closePath();

//         //绘制表盘的刻度线 
//         for (let i = 1; i <= 60; i++) {
//             if (i % 5 == 0) {
//                 ctx.save(); //保存当前绘制环境 
//                 ctx.beginPath();
//                 ctx.lineWidth = clockSize / 30;
//                 ctx.strokeStyle = "#FEF319";
//                 //重置坐标原点（0,0） 
//                 ctx.translate(options.canvasWidth / 2, options.canvasWidth / 2);
//                 //绘制环境旋转方法,以（0,0）为参考点进行旋转 
//                 ctx.rotate(Math.PI * 2 / 60 * i);
//                 ctx.moveTo(0, clockSize - clockSize / 30);
//                 ctx.lineTo(0, clockSize - clockSize / 8);
//                 ctx.stroke();

//                 //  写时钟数字
//                 ctx.beginPath();
//                 ctx.textAlign = 'center';
//                 ctx.textBaseline = 'middle';
//                 ctx.font = 'bold ' + Math.floor(clockSize / 6) + 'px Tahoma';
//                 ctx.shadowColor = "purple";
//                 ctx.shadowBlur = 5;
//                 ctx.fillStyle = "#00FFFF";
//                 ctx.fillText(this.getAlphabetHour(i / 5), 0, 0 - (clockSize - clockSize / 5));
//                 ctx.fill();
//                 ctx.restore(); //恢复当前保存的绘制环境 
//             } else {
//                 ctx.save();
//                 ctx.beginPath();
//                 ctx.lineWidth = Math.floor(clockSize / 20);
//                 ctx.strokeStyle = "#00BFFF";
//                 //重置坐标原点（0,0） 
//                 ctx.translate(options.canvasWidth / 2, options.canvasWidth / 2);
//                 //绘制环境旋转方法,以（0,0）为参考点进行旋转 
//                 ctx.rotate(Math.PI * 2 / 60 * i);
//                 ctx.moveTo(0, clockSize - clockSize / 20);
//                 ctx.lineTo(0, clockSize - clockSize / 10);
//                 ctx.stroke();
//                 ctx.restore();
//             }
//         }
//         return ctx;
//     }

//     drawClockPoints(options, ctx) { // ctx :canvas.getContext
//         let clockSize = options.clockSize;
//         //获取当前windows的时间 
//         let now = new Date();
//         let sec = now.getSeconds();
//         let min = now.getMinutes();
//         let hour = now.getHours();

//         //获取精准的小时数 
//         hour = hour + min / 60 + sec / 3600;
//         //转换为12进制 
//         hour = hour > 12 ? (hour - 12) : hour;
//         //获取精准的分钟数 
//         min = min + sec / 60;
//         /////////////////////////////////////////

//         // 填充日期
//         ctx.save();
//         //重置坐标原点（0,0） 
//         //ctx.translate(options.canvasWidth/2, options.canvasWidth / 1.6);
//         ctx.beginPath();
//         ctx.lineWidth = clockSize / 70;
//         ctx.textAlign = 'center';

//         ctx.shadowColor = "Indigo"; //  BlueViolet   Indigo  
//         ctx.shadowBlur = 7;

//         ctx.textBaseline = 'middle';
//         ctx.font = 'bold ' + Math.floor(clockSize / 6) + 'px Tahoma';

//         //ctx.font = Math.floor(clockSize / 6) + 'px Tahoma'; 
//         ctx.fillStyle = "#FFD700"; //     #FFD700   #FF69B4     #DA70D6
//         ctx.fillText(now.toDateString(), clockSize / 1, clockSize / 0.8);
//         ctx.fill();
//         /**
    
//         */

//         /**
//         ctx.font= Math.floor(clockSize / 6) + 'px Tahoma';   //"13px Tahoma";
        
//         // Create gradient 
//          let gradient=ctx.createLinearGradient(-clockSize+20,0,clockSize-20,0); // context.createLinearGradient(xStart,yStart,xEnd,yEnd);
//           gradient.addColorStop("0","red");
//           gradient.addColorStop("0.2","purple");
//           gradient.addColorStop("0.3","yellow");
//           gradient.addColorStop("0.5","purple");
//          // gradient.addColorStop("0.3","blue");
//          gradient.addColorStop("0.6","yellow");
//          // gradient.addColorStop("0.5","green");
//            gradient.addColorStop("0.8","purple");
//            gradient.addColorStop("1.0","red");
//          // Fill with gradient
//          ctx.strokeStyle=gradient;
//          ctx.strokeText(now.toDateString(),0,  clockSize*0.05 );  //    context.strokeText(text,xStart,yStart,maxWidth);
//           */
//         ctx.restore();

//         /////////////////////////////////////////
//         //绘制时针 
//         ctx.save();
//         ctx.beginPath();
//         ctx.lineWidth = clockSize / 30;
//         ctx.strokeStyle = "#60D9F8";
//         //重置坐标原点（0,0） 
//         ctx.translate(options.canvasWidth / 2, options.canvasWidth / 2);
//         //绘制环境旋转方法,以（0,0）为参考点进行旋转 
//         ctx.rotate(Math.PI * 2 / 12 * hour);
//         ctx.moveTo(0, clockSize / 10);
//         ctx.lineTo(0, 0 - clockSize / 2);
//         ctx.stroke();
//         ctx.restore();

//         //绘制分针 
//         ctx.save();
//         ctx.beginPath();
//         ctx.lineWidth = clockSize / 40;
//         ctx.strokeStyle = "#FEF319";
//         //重置坐标原点（0,0） 
//         ctx.translate(options.canvasWidth / 2, options.canvasWidth / 2);
//         //绘制环境旋转方法,以（0,0）为参考点进行旋转 
//         ctx.rotate(Math.PI * 2 / 60 * min);
//         ctx.moveTo(0, clockSize / 8);
//         ctx.lineTo(0, 0 - (clockSize - clockSize / 3.5));
//         ctx.stroke();
//         ctx.restore();

//         //绘制秒针 
//         ctx.save();
//         //重置坐标原点（0,0） 
//         ctx.translate(options.canvasWidth / 2, options.canvasWidth / 2);
//         ctx.beginPath();
//         ctx.lineWidth = clockSize / 50;
//         ctx.strokeStyle = "#FB1F11";
//         //绘制环境旋转方法,以（0,0）为参考点进行旋转 
//         ctx.rotate(Math.PI * 2 / 60 * sec);
//         ctx.moveTo(0, clockSize / 6);
//         ctx.lineTo(0, 0 - (clockSize - clockSize / 10));
//         ctx.stroke();
//         //修饰秒针 
//         ctx.beginPath();
//         ctx.arc(0, 0 - (clockSize - clockSize / 3), clockSize / 20, 0, Math.PI * 2, true);
//         ctx.fillStyle = "#2FFC14";
//         ctx.fill();
//         ctx.lineWidth = clockSize / 50;
//         ctx.stroke();
//         //修饰圆心 
//         ctx.beginPath();
//         ctx.fillStyle = "#FB1F11";
//         ctx.arc(0, 0, clockSize / 20, 0, Math.PI * 2, true);
//         ctx.fill();
//         ctx.restore();
//     }

//     getAlphabetHour(num) {
//         switch (num) {
//             case 1:
//                 return 'I';
//             case 2:
//                 return 'II';
//             case 3:
//                 return 'III';
//             case 4:
//                 return 'IV';
//             case 5:
//                 return 'V';
//             case 6:
//                 return 'VI';
//             case 7:
//                 return 'VII';
//             case 8:
//                 return 'VIII';
//             case 9:
//                 return 'IX';
//             case 10:
//                 return 'X';
//             case 11:
//                 return 'XI';
//             case 12:
//                 return 'XII';
//         }
//     }

//     timeFormat(time, hour) {
//         hour = hour || false;
//         let str = "";
//         str += time.getYear() + (time.getYear() > 1900 ? 0 : 1900) + "-";
//         str += time.getMonth() + 1 + "-";
//         str += time.getDate() + "";
//         if (hour) {
//             str += time.getHours() + ":";
//             str += time.getMinutes() + ":";
//             str += time.getSeconds();
//         }

//         return str;
//     }



// }
