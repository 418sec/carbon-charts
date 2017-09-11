import '@peretz/matter/matter.css'
import './index.scss'
import * as d3 from 'd3'
import {Charts} from '../src/charts/index.ts'
import {Combo} from '../src/charts/types/combo.ts'
import {DoubleAxis} from '../src/charts/types/doubleAxis.ts'
import {Bars} from '../src/charts/parts/bars.ts'
import {Lines} from '../src/charts/parts/lines.ts'
import {StackedBars} from '../src/charts/parts/stackedBars.ts'

let colors = [
	"#009BEF",
	"#95D13C",
	"#785EF0",
	"#F87EAC",
	"#FFB000",
	"#00B6CB",
	"#FF5C49",
	"#047CC0",
	"#FE8500",
	"#5A3EC8",
	"#40D5BB",
	"#FF509E"
]


let longDataOptions = {
	xDomain: "Part number",
	yDomain: ["Total quantity", "Returned", "Defects", "This is an extra long long long legend", "Number of sold products"],
	yTicks: 5,
	legendClickable: true,
	colors
}

let doubleYAxisOptions = {
	xDomain: "Part number",
	yDomain: ["Qty"],
	y2Domain: ["Sold", "More"],
	yTicks: 5,
	y2Ticks: 10,
	legendClickable: true,
	colors
}

let options = {
	xDomain: "Part number",
	yDomain: ["Sold", "More", "Qty"],
	yTicks: 5,
	legendClickable: true,
	colors
}

let optionsWithFormatter = {
	xDomain: "Day",
	yDomain: ["Clicks"],
	y2Domain: ["Click rate"],
	yFormatter: {
		"Click rate"(value) {
			return value + "%"
		}
	},
	yTicks: 5,
	legendClickable: true,
	colors
}

const data = [
	{
		"Part number": "2V2N-9KYPM version 1",
		"Qty": 100000,
		"More": 60000,
		"Sold": 90000
	},
	{
		"Part number": "L22I-P66EP-L22I-P66EP-L22I-P66EP",
		"Qty": 200000,
		"More": 50000,
		"Sold": 70000
	},
	{
		"Part number": "JQAI-2M4L1",
		"Qty": 600000,
		"More": 9000,
		"Sold": 6000
	},
	{
		"Part number": "J9DZ-F37AP",
		"Qty": 100000,
		"More": 8000,
		"Sold": 11000
	},
	{
		"Part number": "Q6XK-YEL48",
		"Qty": 400000,
		"More": 4000,
		"Sold": 300000
	},
	{
		"Part number": "773C-XKB5L",
		"Qty": 800000,
		"More": 35000,
		"Sold": 390000
	}
];

const doubleAxisData = [
	{
		"Day": "Monday",
		"Clicks": 60000,
		"Click rate": 9
	},
	{
		"Day": "Tuesday",
		"Clicks": 50000,
		"Click rate": 76
	},
	{
		"Day": "Wednesday",
		"Clicks": 9000,
		"Click rate": 80
	},
	{
		"Day": "Thursday",
		"Clicks": 8000,
		"Click rate": 1
	},
	{
		"Day": "Friday",
		"Clicks": 4000,
		"Click rate": 30
	},
	{
		"Day": "Saturday",
		"Clicks": 35000,
		"Click rate": 59
	},
		{
			"Day": "Sunday",
			"Clicks": 35000,
			"Click rate": 38
		}
];


const longData = [
	{
		"Part number": "2V2N-9KYPM",
		"Total quantity": 100000,
		"Returned": 60000,
		"Defects": 9230,
		"This is an extra long long long legend": 12345,
		"Number of sold products": 90000
	},
	{
		"Part number": "L22I-P66EP",
		"Total quantity": 200000,
		"Returned": 50000,
		"Defects": 9230,
		"This is an extra long long long legend": 12345,
		"Number of sold products": 70000
	},
	{
		"Part number": "JQAI-2M4L1",
		"Total quantity": 100000,
		"Returned": 9000,
		"Defects": 2980,
		"This is an extra long long long legend": 12345,
		"Number of sold products": 6000
	},
	{
		"Part number": "J9DZ-F37AP",
		"Total quantity": 150000,
		"Returned": 8000,
		"Defects": 12230,
		"This is an extra long long long legend": 12345,
		"Number of sold products": 11000
	},
	{
		"Part number": "Q6XK-YEL48",
		"Total quantity": 230000,
		"Returned": 4000,
		"Defects": 8230,
		"This is an extra long long long legend": 12345,
		"Number of sold products": 300000
	},
	{
		"Part number": "773C-XKB5L",
		"Total quantity": 390000,
		"Returned": 35000,
		"Defects": 5230,
		"This is an extra long long long legend": 12345,
		"Number of sold products": 190000
	}
];


const chartTypes = [
	{
		id: 'bar',
		name: 'Bar',
		avail: true,
		options: longDataOptions,
		data: longData
	},
	{
		id: 'line',
		name: 'Line',
		avail: true,
		options,
		data
	},
	{
		id: 'stackedBar',
		name: 'Stacked Bar',
		avail: true,
		options,
		data
	},
	{
		id: 'doubleAxis',
		name: 'Double Axis',
		avail: true,
		options: optionsWithFormatter,
		data: doubleAxisData
	},
	{
		id: 'combo',
		name: 'Combo',
		avail: true,
		options: doubleYAxisOptions,
		data
	}
];

// let typeSelections = d3.select('body').insert('ul', 'div').classed('chart-type-selection', true);
// chartTypes.forEach(type => {
// 	d3.select('.chart-type-selection').append('li').attr('id', type.id).text(type.name)

// 	d3.select("#" + type.id)
// 		.classed("disabled", !type.avail)
// 		.on('click', () => {
// 			let btn = d3.select("#" + type.id)
// 			if (!btn.classed("disabled")) {
// 				d3.selectAll(".chart-type-selection li")
// 				  .classed("active", false);
// 				btn.classed("active", !btn.classed("active"));
// 			}
// 			if (btn.classed('active')) {
// 				Charts.removeChart(container)
// 				options.type = d3.select(".chart-type-selection .active").attr("id");
// 				// Charts.renderChart(data, container, options)
// 				switch (type.id) {
// 					case "bar":
// 						Bars.drawChart(data, container, options);
// 						break;
// 					case "stackedBar":
// 						StackedBars.drawChart(data, container, options);
// 						break;
// 					case "line":
// 						Lines.drawChart(data, container, options);
// 						break;
// 					case "doubleAxis":
// 						renderDoubleAxis(data, container, doubleYAxisOptions, "line");
// 						break;
// 					case "combo":
// 						renderCombo(data, container, doubleYAxisOptions);
// 						break;
// 					default:
// 						Bars.drawChart(data, container, options);
// 						break;
// 				}
// 			}
// 		})
// })Object.assign({}, options, {yDomain: [options.yDomain[0]]});

chartTypes.forEach(type => {
	let container = d3.select('#' + type.id + '-chart-holder');
	container.append('h3').text(type.name)

	switch (type.id) {
		case "bar":
			Bars.drawChart(type.data, container, Object.assign({}, type.options, {type: type.id}));
			break;
		case "stackedBar":
			StackedBars.drawChart(type.data, container, Object.assign({}, type.options, {type: type.id}));
			break;
		case "line":
			Lines.drawChart(type.data, container, Object.assign({}, type.options, {type: type.id}));
			break;
		case "doubleAxis":
			DoubleAxis.drawChart(type.data, container, Object.assign({}, type.options, {type: type.id}));
			break;
		case "combo":
			Combo.drawChart(type.data, container, Object.assign({}, type.options, {type: type.id}));
			break;
		default:
			Bars.drawChart(type.data, container, Object.assign({}, type.options, {type: type.id}));
			break;
	}
})
