

const urlDemo = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=demo";
const tolerance = 40; // Calculation logic needs to be fixed to bring this down to 2 or less

var dataPoints;
var tickerSymbol = document.getElementById('ticker');

function getLatestData() {
	var url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + tickerSymbol + "&apikey=demo";
	alert("The API used is a dummy API from AlphaVantage for other tickers an API Key is required. For testing data has been defaulted to IBM.")
	tickerSymbol.value = "IBM";
	fetchTickerData(urlDemo);
}

function fetchTickerData(url){
	fetch(url)
		.then((resp) => resp.json())
		.then(function (data) {
			dataPoints = data["Time Series (Daily)"];
			let firstDate = Object.keys(dataPoints)[0];

			updateLatestDetails(data["Time Series (Daily)"][firstDate], firstDate);
			drawPlot(dataPoints);
		});
};



var canvas;
var context;
var val_max;
var val_min;
var sections;
var xScale;
var yScale;

var xAxis = [];
var yAxis = [];
var highAxis = [];
var lowAxis = [];
var openAxis = [];
var xLabels = [];


function drawPlot(dataPoints) {
	// set these values for your data
	var stepSize = 2;
	var columnSize = 50;
	var rowSize = 50;
	var margin = 10;
	canvas = document.getElementsByTagName('canvas')[0];
	canvasId = document.getElementById('canvas');
	canvas.width = screen.availWidth - rowSize - margin;
	canvas.height = 600;

	for (var key in dataPoints) {
		xAxis.push(key.substring(5));
		yAxis.push(dataPoints[key]["4. close"]);

		lowAxis.push(dataPoints[key]["3. low"]);
		highAxis.push(dataPoints[key]["2. high"]);
		openAxis.push(dataPoints[key]["1. open"]);
	}

	xAxis = xAxis.splice(0, 20).reverse();
	yAxis = yAxis.splice(0, 20).reverse();
	sections = xAxis.length;

	console.log(xAxis);
	console.log(yAxis);
	console.log(sections);

	val_max = Math.round(Math.max.apply(Math, yAxis));
	val_min = Math.round(Math.min.apply(Math, yAxis));


	context = canvas.getContext("2d");
	context.fillStyle = "#212121"
	context.font = "10pt Verdana"

	yScale = (canvas.height - columnSize - margin) / (val_max - val_min);
	xScale = (canvas.width - rowSize) / sections;

	context.strokeStyle = "#4CAF50"; // color of grid lines
	context.beginPath();
	// print Parameters on X axis, and grid lines on the graph
	for (i = 0; i < sections; i++) {
		var x = i * xScale;
		context.fillText(xAxis[i], x + rowSize - 2 * margin, canvas.height);
		xLabels.push(x);
		context.moveTo(x + rowSize, columnSize - margin);
		context.lineTo(x + rowSize, canvas.height -  2*margin);
	}
	// print row header and draw horizontal grid lines
	var count = 0;
	for (scale = val_max; scale >= val_min; scale = scale - stepSize) {
		var y = columnSize + (yScale * count * stepSize);
		context.fillText(scale, 0, y - margin);
		context.moveTo(rowSize, y - margin)
		context.lineTo(canvas.width, y - margin)
		count++;
	}
	context.stroke();

	context.translate(rowSize, canvas.height + val_min * yScale);
	context.scale(1, -1 * yScale);

	// Color of each dataplot items

	context.strokeStyle = "#FF0066";
	plotData(yAxis);
}

function plotData(dataSet) {
	context.beginPath();
	context.lineWidth = 0.04;
	context.moveTo(0, dataSet[0]);
	for (i = 1; i < sections; i++) {
		context.lineTo(i * xScale, dataSet[i]);
	}
	context.stroke();
}

var canvasElement = document.getElementById('canvas');
canvasElement.addEventListener('mousemove', function (e) {

	e.preventDefault();
	e.stopPropagation();

	let rect = canvasElement.getBoundingClientRect();
	mouseX = parseInt(e.clientX - rect.left);
	mouseY = parseInt(e.clientY - rect.top);

	var pointName = '';
	for (var i = 0; i < xAxis.length; i++) {
		var y = yAxis[i];
		var x = xLabels[i];
		let tooltip = document.getElementById('tooltip');

		// LOGIC NEEDS REFINEMENT...Works but is erratic.
		if (Math.abs(x - mouseX + 50) <= tolerance && Math.abs(y - mouseY + 50) <= tolerance) {
			pointName = "IBM"; // tickerSymbol;
			let h = highAxis[i];
			let l = lowAxis[i];
			let o = openAxis[i];
			tooltip.style.left = e.clientX + 'px';
			tooltip.style.top = e.clientY + 'px';

			tooltip.innerText = pointName + "\n Close: " + removeLastN(y) + "\n High: " + removeLastN(h) + "\n Low: " + removeLastN(l) + "\n Open: " + removeLastN(o);
			tooltip.style.display = "block";
			break;
		}
		else {
			tooltip.style.display = "none";
		}
	}
});


function updateLatestDetails(item, lastDate) {
	let lastTraded = lastDate;
    let open = item["1. open"];
    let high = item["2. high"];
    let low = item["3. low"];
    let close = item["4. close"];
    let volume = item["5. volume"];

	document.getElementById('stockLast').textContent = lastTraded;
    document.getElementById('stockOpen').textContent = removeLastN(open);
    document.getElementById('stockLow').textContent = removeLastN(low);
    document.getElementById('stockHigh').textContent = removeLastN(high);
    document.getElementById('stockClose').textContent = removeLastN(close);
    document.getElementById('stockVolume').textContent = numberWithCommas(volume);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
}

function removeLastN(text, n = 2) {
    return text.substring(0, text.length - n);
}

getLatestData();