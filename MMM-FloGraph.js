/* Module */
/* Magic Mirror
 * Module: MMM-HTTPRequestDisplay
 *
 * By Eunan Camilleri eunancamilleri@gmail.com
 * v1.0 23/06/2016
 *
 * Modified by KAG 19/02/2019
 * Module: MMM-FloGraph
 *
 * MIT Licensed.
 */

Module.register("MMM-FloGraph",{
// Default module config.
	defaults: {
		//updateInterval: 5 * 60 * 1000, // every 5 minutes
		animationSpeed: 1000,
		refreshInterval: 5 * 60 * 1000, // every 5 minutes
		tableLength: 14,
		minTimeDiff:0,
		timeZone: 1,
		daysSpan:2,
		lat:60.260000,
		lon:5.320000,
		datatype:"tab", //all, obs, pre, tab
		//httpRequestURL:"http://api.sehavniva.no/tideapi.php?lat="+this.config.lat+"&lon="+this.config.lon+"&fromtime=2019-04-10T00%3A00"+
		//"&totime=2019-04-11T00%3A00&datatype="+this.config.datatype+"&refcode=cd&place=&file=&lang=en&interval=10&dst=0&tzone=1&tide_request=locationdata",
	},


	// Define required scripts.
	getScripts: function() {
		return ["moment.js", this.file("node_modules/chart.js/dist/Chart.js")];
	},

	// Define required styles.
	getStyles: function() {
		return ["MMM-FloGraph.css"];
	},

	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		this.loaded = false;
		moment.locale(config.language);

		// variables that will be loaded from service
		this.nodeNames = "";
		this.nodes = [];
		this.dataid = 0;
		this.chartData = {
			labels: [],
			datasets: []
		}

		this.sendSocketNotification("CONFIG", this.config);

		var self = this;
		this.refInterval = window.setInterval(function() {
			//var sample;
			/*
			var waterValue = self.data.getElementsByTagName("waterlevel");
			for(var i = 0; i < waterValue.length; i++) {
				self.chartData.labels[i].push(waterValue[i].getAttribute("time"));
				self.chartData.datasets[i].push(waterValue[i].getAttribute("value"));
			}
			
			
			var sample = self.config.samples[self.dataid];

			self.chartData.labels.push(sample[0]);
			for(var i=0; i<sample.length - 1; ++i) {
				if(i >= self.chartData.datasets.length) {
					self.chartData.datasets.push([]);
				}
				self.chartData.datasets[i].push(sample[i + 1]);
			}
			
*/
			self.updateChartData();

			//if(++self.dataid >= self.config.samples.length) {
			//	window.clearInterval(self.refInterval);
			//}
		}, 2000);

		//Log.log("Sending CONFIG to node_helper.js in " + this.name);
		//Log.log("Payload: " + this.config);
		
	},

	updateChartData: function() {
		var waterValue = this.data.getElementsByTagName("waterlevel");
		//Log.log("#DATA:"+waterValue.length);
		//Log.log("#DATA:"+waterValue[0].getAttribute("time"));
		//Log.log("#DATA:"+waterValue[0].getAttribute("value"));
/*
		for(var i = 0; i < waterValue.length; i++) {
			//this.chartData.labels[i].push(waterValue[i].getAttribute("time"));
			this.chartData.datasets[i].push(waterValue[i].getAttribute("value"));
		}
*/
		if(this.myChart !== undefined) {
			//var dateAndTime = waterValue[0].getAttribute("time");
			//var time = dateAndTime.split("T")[1];
			//var hour = time.split(":")[0];
			//var minute = time.split(":")[1];
			//var second = time.split(":")[2];
			//this.myChart.data.labels = [dateAndTime];
			
			for(var i=0; i<waterValue.length; ++i) {
				var dateAndTime = waterValue[i].getAttribute("time");
			/*	var mytime = dateAndTime.split("T")[1];
				var mydate = dateAndTime.split("T")[0];
				var myyear = mydate.split("-")[0];
				var mymonth = mydate.split("-")[1];
				var myday = mydate.split("-")[2];
				var myhour = mytime.split(":")[0];
				var myminute = mytime.split(":")[1];
				var newdateAndTime = new Date(Number(myyear),Number(mymonth),Number(myday),Number(myhour),Number(myminute),0,0);
			*/	this.myChart.data.labels[i] = dateAndTime;
				//this.myChart.data.label=newDateandTime;
				if(waterValue[i].getAttribute("flag")==="pre") {this.myChart.data.datasets[0].data[i] = [waterValue[i].getAttribute("value")];}
				if(waterValue[i].getAttribute("flag")==="obs") {this.myChart.data.datasets[1].data[i] = [waterValue[i].getAttribute("value")];}
				if(waterValue[i].getAttribute("flag")==="forecast") {this.myChart.data.datasets[2].data[i] = [waterValue[i].getAttribute("value")];}
				//Log.log("#DATA:"+newDateandTime);
			}
			this.myChart.update();
		}
	},
	// unload the results from uber services
	processData: function(data) {

		if (!data) {
			// Did not receive usable new data.
			// Maybe this needs a better check?
			Log.log("#No data");
			return;
		}

		this.data = data;
		this.loaded = true;

		this.updateDom(this.config.animationSpeed);
	},

	// Override dom generator.
	getDom: function() {

		this.sendSocketNotification("CONFIG", this.config);


		var wrapper = document.createElement("div");
		wrapper.className = "myChart";
		this.ctx = document.createElement("canvas");

		wrapper.appendChild(this.ctx);

		if (!this.loaded) {
			wrapper.innerHTML = this.translate("LOADING");
			Log.log("#LOADED");
			return wrapper;
		}

		if (!this.data) {
			wrapper.innerHTML = "No data";
			Log.log("#NODATA");
			return wrapper;
		}

		//Log.log(waterValue);

		var tableHeading = document.createElement("div");
		tableHeading.className = "divider";
/*
		var floIcon = document.createElement("img");
		floIcon.className = "icon";
		floIcon.src = "modules/MMM-FloGraph/Kartverket.png";
		//tableHeading.innerHTML = "Tidevann";
		tableHeading.appendChild(floIcon);
		wrapper.appendChild(tableHeading);
*/
		this.myChart = new Chart(this.ctx, {
			type: "line",
			data: {
				labels: [],
				datasets: [{
					label: "Vannstand",
					yAxisID: "y-axis-0",
					borderColor: "rgba(255, 255, 255, 1)",
					backgroundColor: "rgba(255, 255, 255, 1)",
					fill: false,
					data: [],
				},
				{
					label: "Observations",
					yAxisID: "y-axis-0",
					//borderDash: [10,2],
					borderColor: "rgba(231, 149, 35,1)",
					backgroundColor: "rgba(255, 255, 255, 1)",
					fill: false,
					data: [],
				},
				{
					label: "Forecast",
					yAxisID: "y-axis-0",
					borderDash: [10,10],
					borderColor: "rgba(155, 155, 155, 1)",
					backgroundColor: "rgba(255, 255, 255, 1)",
					fill: false,
					data: [],
				},
				]
			},
			options: {
				responsive: true,
				legend: {
					display: false,
					position: "right",
				},
				tooltips: {
					mode: "x",
					callbacks: {
						title: function(ti, data) {
						},
					}
				},
				elements: {
					point: {
						radius: 0,
						hitRadius: 6,
						hoverRadius: 6,
					}
				},
				scales: {
					xAxes: [{
						type: "time",//time,category,linear
						gridLines: {
							color: "rgba(255, 255, 255, 0.1)"
						},
						ticks:{
							fontColor: "rgba(155, 155, 155, 1)",
							autoSkip:true,
							autoSkipPadding:3,
						},
						time: {
							unit: "minute",//hour, minute
							//unit: "quarter",
							displayFormats: {
								minute: "H:mm",
							},
						},
					}],
					yAxes: [{
						position: "left",
						id: "y-axis-0",
						scaleLabel: {
							display: false,
							labelString: "cm"
						},
						gridLines: {
							color: "rgba(255, 255, 255, 0.1)"
						},
						ticks: {
							fontColor: "rgba(255, 255, 255, 1)",
							callback: function(val) {
								return val + " cm";
							}
						}
					}]
				}
			}
		});
		
		this.updateChartData();

		return wrapper;
	},

	socketNotificationReceived: function(notification, payload) {
		var parser, xmlDoc;

		if (notification === "STARTED") {
			this.updateDom();
			Log.log("#STARTED");
		}
		else if (notification === "DATA") {
			this.loaded = true;

			parser = new DOMParser();
			xmlDoc = parser.parseFromString(payload,"text/xml");

			this.processData(xmlDoc);
			this.updateDom();
		}
	},

});
