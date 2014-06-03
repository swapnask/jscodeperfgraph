function HashSet(){
	this.keys = {};
	this.length = 0;

	this.add = function(key){

		if(angular.isUndefined(this.keys[key])){
			this.length++;
		}

		this.keys[key] = key;
	};

	this.keySet = function(){
		return this.keys;
	};

	this.size = function(){
		return this.length;
	};

	this.containsKey = function(key){
		return angular.isDefined(this.keys[key]);
	};

	this.remove = function(key){
		if(this.containsKey(key)){
			delete this.keys[key];
			this.length--;
			return true;
		}
		else{
			return false;
		}
	};

	this.clear = function(){
		this.keys = {};
		this.length = 0;
	};
}

function ValuesHashMap(){
	this.keys = new HashSet();
	this.hashMap = {};
	this.length = 0;

	this.emptyIndices = [];
	this.valuesArr = [];

	this.keySet = function(){
		return this.keys.keySet();
	};

	this.size = function(){
		return this.length;
	};

	this.containsKey = function(key){
		return this.keys.containsKey(key);
	};

	this.clear = function(){
		this.emptyIndices.length = 0;
		this.valuesArr.length = 0;
		this.hashMap = {};
		this.length = 0;
		this.keys.clear();
	};

	this.put = function(key, value){
		var newIndex = undefined;
		if(this.containsKey(key)){
			newIndex = this.hashMap[key].index;
		}
		else{
			newIndex = this.emptyIndices.length == 0 ? this.length:this.emptyIndices.pop();
			this.length++;
		}
		this.keys.add(key);
		this.hashMap[key] = {
			"index": newIndex,
			"value": value
		};
		this.valuesArr[newIndex] = value;
	};

	this.getHashMap = function(){
		return this.hashMap;
	};

	this.get = function(key){
		if(this.containsKey(key)){
			return this.hashMap[key].value;
		}
		else{
			return undefined;
		}
	};

	this.remove = function(key){
		if(this.containsKey(key)){
			var retVal = this.hashMap[key];
			this.keys.remove(key);
			delete this.hashMap[key];
			this.length--;
			this.valuesArr[retVal.index] = undefined;
			this.emptyIndices.push(retVal.index);
			return retVal.value;
		}
		return null;
	};

	this.values = function(){

		while(this.emptyIndices.length > 0){
			var emptyIndex = this.emptyIndices.pop();

			while(this.valuesArr[this.valuesArr.length - 1] == undefined){
				this.valuesArr.pop();
			}

			if((this.valuesArr.length - 1) > emptyIndex){
				this.valuesArr[emptyIndex] = this.valuesArr.pop();
			}
		}

		return this.valuesArr;
	};
}

(function($){

	var TimeMeasurer = performance || window.performance || Date;
    var barGraphConfig = {
        seriesDefaults: {
            renderer: $.jqplot.BarRenderer,
            rendererOptions: {fillToZero: true}
        },
        series: [
            {label: 'Duration'}
        ],
        legend: {
            show: true,
            placement: 'outsideGrid'
        },
        axes: {
            xaxis: {
                renderer: $.jqplot.CategoryAxisRenderer,
                ticks: []
            },
            yaxis: {
                pad: 1.05,
                tickOptions: {formatString: '%d'}
            }
        }
    };
    var plot;

	function PerformanceGraph(jquerySelector){
		var markers = new ValuesHashMap();

		return {
			markStartTime: function(markerName){
				var marker = {name: markerName};
				marker['startTime'] = TimeMeasurer.now();
				markers.put(markerName, marker);
			},
			markEndTime: function(markerName){
				if(markers.containsKey(markerName)){
					var marker = markers.get(markerName);
					marker['duration'] = TimeMeasurer.now() - marker['startTime'];
					delete marker['startTime'];
				}
			},
			deleteMarker: function(markerName){
				return markers.remove(markerName);
			},
			getMarker: function(markerName){
				return markers.get(markerName);
			},
			getAllMarkers: function(){
				return markers.values();
			},
            clearMarkers: function() {
                markers.clear();
            },
			updateGraph: function(){
				var markerValues = markers.values();

                var categoryNameArray = [];
                var categoryValueArray = [];
                var index = 0;
                for(var value in markerValues) {
                    categoryNameArray[index] = markerValues[value].name;
                    categoryValueArray[index] = markerValues[value].duration;
                }

                barGraphConfig.axes.xaxis.ticks = categoryNameArray;
                if(plot === undefined) {
                    plot = $.jqplot(jquerySelector, [categoryValueArray], barGraphConfig);
                }
                else {
                    plot.axes.xaxis.ticks = categoryNameArray;
                    plot.series[0].data = categoryValueArray;
                    plot.replot({resetAxes: true});
                }
			}
		};
	};

	window.PerformanceGraph = PerformanceGraph;
}(jQuery));