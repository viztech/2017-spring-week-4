console.log('Timeseries');

function Timeseries(selection){
	//Set initial internal values
	//Some of these will be based on the incoming selection argument
	var M = {t:30,r:40,b:30,l:40},
		W = selection.node().clientWidth - M.l - M.r,
		H = selection.node().clientHeight - M.t - M.b;
	var arr = selection.datum()?selection.datum():[];

	//Histogram layout
	//The value, domain and threshold properties are internal to this function
	var T0 = new Date(2011,0,1), T1 = new Date(2013,11,31);
	var histogram = d3.histogram()
		.value(function(d){return d.startTime})
		.domain([T0,T1])
		.thresholds(d3.timeDay.range(T0,T1,1));

	var dayBins = histogram(arr);

	var maxY = d3.max(dayBins,function(d){return d.length});
	var scaleX = d3.scaleTime().domain([T0,T1]).range([0,W]),
		scaleY = d3.scaleLinear().domain([0,maxY]).range([H,0]);

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