import * as d3 from 'd3'
import {Axis} from './axis.ts'
import {Grid} from './grid.ts'
import {Legend} from './legend.ts'
import {Tooltip} from './tooltip.ts'
import '../style.scss'
import {Charts} from '../index.ts'

export namespace Bars {
	export function drawChart(data, parent, options) {
		let {chartID, container} = Charts.setChartIDContainer(parent)
		Charts.setResizable();
		options.chartSize = Charts.getActualChartSize(data, container, options);
		let svg = Charts.setSVG(data, container, options);
		let xScale = Charts.setXScale(data, options);
		const activeDataSeries = Charts.getActiveDataSeries(container)
		let yScale = Charts.setYScale(data, options, Charts.getActiveDataSeries(container));

		Axis.drawXAxis(svg, xScale, options, data);
		Axis.drawYAxis(svg, yScale, options, data);
		Grid.drawXGrid(svg, xScale, options, data);
		Grid.drawYGrid(svg, yScale, options, data);
		Legend.addLegend(container, data, options);
		if (options.legendClickable) {
			Charts.setClickableLegend(data, parent, options)
		}
		Charts.redrawFunctions[chartID] = {
			self: this,
			data, parent, options
		}

		draw(svg, xScale, yScale, options, data, Charts.getActiveDataSeries(container));
		setTooltip(chartID, svg)
	}

	export function setTooltip(chartID, svg) {
		Charts.setTooltip(chartID);
		Charts.setTooltipCloseEventListener(chartID, resetBarOpacity);
		Charts.addTooltipEventListener(chartID, svg, svg.selectAll("rect"), reduceOpacity);
	}

	export function draw(svg, xScale, yScale, options, data, activeSeries) {
		xScale.padding(0.1)
		const keys = activeSeries ? activeSeries : options.yDomain;
		const x1 = d3.scaleBand();
		x1.domain(keys).rangeRound([0, xScale.bandwidth()]);
		const color = d3.scaleOrdinal().range(options.colors).domain(options.yDomain);
		svg.append("g")
			.attr("class", "bars")
			.selectAll("g")
			.data(data)
			.enter().append("g")
				.attr("transform", d => "translate(" + xScale(d[options.xDomain]) + ",0)")
			.selectAll("rect")
			.data(d => keys.map(key => ({xAxis: options.xDomain, series: key, key: d[options.xDomain], value: d[key]})))
			.enter().append("rect")
				.attr("x", d => x1(d.series))
				.attr("y", d => options.chartSize.height)
				.attr("width", x1.bandwidth())
				.attr("height", 0)
				.attr("fill", d => color(d.series))
				.transition()
				.duration(500)
				.ease(d3.easeExp)
				.attr("y", d => yScale(d.value))
				.attr("height", d => options.chartSize.height - yScale(d.value))
	}

}

function reduceOpacity(svg, exceptionRect) {
	svg.selectAll("rect").attr("fill-opacity", 0.25)
	d3.select(exceptionRect).attr("fill-opacity", false)
}

function resetBarOpacity() {
	d3.selectAll("svg").selectAll("rect").attr("fill-opacity", 1)
}

