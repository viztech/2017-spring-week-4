console.log(d3);

d3.queue()
	.defer(d3.csv,'./data/hubway_trips_reduced.csv',parseTrips)
	.defer(d3.csv,'./data/hubway_stations.csv',parseStations)
	.await(dataLoaded);

function dataLoaded(err,trips,stations){
	/*
	//First, let's look at an example of what a module needs to do, taking the example of the axis generators
	//You can create a new module generator by calling a function
	var axisX = d3.axisBottom();

	//You can define some custom properties for the module
	axisX
		.ticks(10)
		.scale(someScale)
		.tickSize(10);

	//Finally, you can call this module generator function, passing in a selection
	plot.append('g').attr('class','axis-x')
		.call(axisX);

	//You can modify the properties of this module generator
	axisX
		.ticks(20);

	plot.select('.axis-x')
		.transition()
		.call(axisX);
	*/

	var cf = crossfilter(trips);
	var tripsByType = cf.dimension(function(d){return d.userType});

	var allTrips = tripsByType.filter(null).top(Infinity),
		registeredTrips = tripsByType.filter('Registered').top(Infinity),
		casualTrips = tripsByType.filter('Casual').top(Infinity);

	d3.select('#plot-1').datum(allTrips).call(Timeseries);
	d3.select('#plot-2').datum(registeredTrips).call(Timeseries);
	d3.select('#plot-3').datum(casualTrips).call(Timeseries);
}

function parseTrips(d){
	return {
		bike_nr:d.bike_nr,
		duration:+d.duration,
		startStn:d.strt_statn,
		startTime:parseTime(d.start_date),
		endStn:d.end_statn,
		endTime:parseTime(d.end_date),
		userType:d.subsc_type,
		userGender:d.gender?d.gender:undefined,
		userBirthdate:d.birth_date?+d.birth_date:undefined
	}
}

function parseStations(d){
	return {
		id:d.id,
		lngLat:[+d.lng,+d.lat],
		city:d.municipal,
		name:d.station,
		status:d.status,
		terminal:d.terminal
	}
}

function parseTime(timeStr){
	var time = timeStr.split(' ')[1].split(':'),
		hour = +time[0],
		min = +time[1],
		sec = +time[2];

	var	date = timeStr.split(' ')[0].split('/'),
		year = date[2],
		month = date[0],
		day = date[1];

	return new Date(year,month-1,day,hour,min,sec);
}