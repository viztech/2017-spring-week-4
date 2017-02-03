console.log(d3);

d3.queue()
	.defer(d3.csv,'./data/hubway_trips_reduced.csv',parseTrips)
	.defer(d3.csv,'./data/hubway_stations.csv',parseStations)
	.await(dataLoaded);

function dataLoaded(err,trips,stations){

	var cf = crossfilter(trips);
	var tripsByDay = cf.dimension(function(d){return d.startTime.getDay()});

	//Timeseries module
	var t = Timeseries()
		.scaleX(d3.scaleLinear().domain([0,24]))
		.domainY([0,400])
		.thresholds(d3.range(0,24,1/12))
		.value(function(d){return d.startTime.getHours() + d.startTime.getMinutes()/60; });

	[0,1,2,3,4,5,6].forEach(function(day){
		d3.select('.container')
			.append('div')
			.attr('class','plot plot-col-4')
			.datum(tripsByDay.filter(day).top(Infinity))
			.call(t);
	});
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