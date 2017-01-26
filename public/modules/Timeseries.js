console.log('Timeseries');

function Timeseries(){
	//Internal variables
	//Some have default values, will be overriden later by getter/setter functions
	var M = {t:30,r:40,b:30,l:40},
		W,
		H,
		arr = [],
		domainX = [new Date(2011,0,1), new Date(2013,11,31)],
		histogram = d3.histogram(),
		domainY = [0,600],
		interval = d3.timeDay,
		valueAccessor = function(d){
			return d.startTime;
		};

	var exports = function(selection){
		//new selection will possibly have different dimensions
		//and new data bound to it
		W = selection.node().clientWidth - M.l - M.r;
		H = selection.node().clientHeight - M.t - M.b;
		arr = selection.datum();

		//Histogram layout
		//The value, domain and threshold properties are internal to this function
		histogram
			.value(valueAccessor)
			.domain(domainX)
			.thresholds(interval.range(domainX[0],domainX[1],1));

		var dayBins = histogram(arr);

		var scaleX = d3.scaleTime().domain(domainX).range([0,W]),
			scaleY = d3.scaleLinear().domain(domainY).range([H,0]);

		//Represent
		//Axis, line and area generators
		var line = d3.line()
			.x(function(d){return scaleX(d.x0)})
			.y(function(d){return scaleY(d.length)});
		var area = d3.area()
			.x(function(d){return scaleX(d.x0)})
			.y0(function(d){return H})
			.y1(function(d){return scaleY(d.length)});
		var axisX = d3.axisBottom()
			.scale(scaleX)
			.ticks(d3.timeMonth.every(6));
		var axisY = d3.axisLeft()
			.tickSize(-W)
			.scale(scaleY)
			.ticks(4);

		//Set up the DOM structure like so:
		/*
		<svg>
			<g class='plot'>
				<path class='area' />
				<g class='axis axis-y' />
				<path class='line' />
				<g class='axis axis-x' />
			</g>
		</svg>
		*/
		var svg = selection.selectAll('svg')
			.data([dayBins])

		var svgEnter = svg.enter()
			.append('svg'); //ENTER
		svgEnter
			.merge(svg) //ENTER + UPDATE
			.attr('width', W + M.l + M.r)
			.attr('height', H + M.t + M.b);

		var plotEnter = svgEnter.append('g').attr('class','plot time-series')
			.attr('transform','translate('+M.l+','+M.t+')');
		plotEnter.append('path').attr('class','area');
		plotEnter.append('g').attr('class','axis axis-y');
		plotEnter.append('path').attr('class','line');
		plotEnter.append('g').attr('class','axis axis-x').attr('transform','translate(0,'+H+')');

		//Update
		var plot = svg.merge(svgEnter)
			.select('.plot')
			.attr('transform','translate('+M.l+','+M.t+')');
		plot.select('.area').transition()
			.attr('d',area);
		plot.select('.line').transition()
			.attr('d',line);
		plot.select('.axis-y').transition()
			.call(axisY);
		plot.select('.axis-x').transition()
			.call(axisX);

	}

	//Getters and setters
	exports.domainX = function(_){
		if(!arguments.length) return domainX;
		domainX = _;
		return this;
	}
	exports.value = function(_){
		if(!arguments.length) return valueAccessor;
		valueAccessor = _;
		return this;
	}
	exports.interval = function(_){
		if(!arguments.length) return interval;
		interval = _;
		return this;
	}
	exports.margin = function(_){
		if(!arguments.length) return M;
		M = _;
		return this;
	}
	exports.domainY = function(_){
		if(!arguments.length) return domainY;
		domainY = _;
		return this;
	}

	return exports;
}