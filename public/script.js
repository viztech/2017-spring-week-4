console.log(d3);

d3.queue()
	.defer(d3.csv,'./data/hubway_trips_reduced.csv',parseTrips)
	.defer(d3.csv,'./data/hubway_stations.csv',parseStations)
	.await(dataLoaded);

function dataLoaded(err,trips,stations){

	var cf = crossfilter(trips);
	var tripsByType = cf.dimension(function(d){return d.userType});

	var allTrips = tripsByType.filter(null).top(Infinity),
		registeredTrips = tripsByType.filter('Registered').top(Infinity),
		casualTrips = tripsByType.filter('Casual').top(Infinity);

/*	Convert Timeseries to a reusable module
	Desired API
		var timeseries = Timeseries() //create a module generator function
		timeseries.domainX([extent])
		timeseries.value([accessor])
		timeseries.interval([timeInterval])
		timeseries.margin([object])
		timeseries.domainY([extent])
*/
	var timeseriesAll = Timeseries();

	d3.select('#plot-1').datum(allTrips).call(timeseriesAll);
	d3.select('#plot-2').datum(allTrips).call(
		timeseriesAll
			.interval(d3.timeWeek)
			.domainY([0,3000])
	);
	d3.select('#plot-3').datum(allTrips).call(
		timeseriesAll
			.value(function(d){return d.endTime})
	);

	d3.select('#plot-4').datum(allTrips).call(
		Timeseries()
			.domainX([new Date(2011,0,1), new Date(2011,11,31)])
	);
	d3.select('#plot-5').datum(allTrips).call(
		Timeseries()
			.domainX([new Date(2012,0,1), new Date(2012,11,31)])
	);
	d3.select('#plot-6').datum(allTrips).call(
		Timeseries()
			.domainX([new Date(2013,0,1), new Date(2013,11,31)])
	);

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