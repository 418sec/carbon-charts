import * as d3 from "d3";
import { Axis } from "./axis";
import { Grid } from "./grid";
import { Legend } from "./legend";
import { Tooltip } from "./tooltip";
import { Configuration } from "../configuration";
import { Charts } from "../index";

import "../style.scss";

export namespace Bars {
	export function drawChart(data, parent, options) {
		options.type = "bar";
		const parentSelection = d3.select(parent);
		const {chartID, container} = Charts.setChartIDContainer(parentSelection);
		options.chartSize = Charts.getActualChartSize(data, container, options);
		const svg = Charts.setSVG(data, container, options);
		Legend.addLegend(container, data, options);
		if (options.legendClickable) {
			Charts.setClickableLegend(data, parentSelection, options);
		}
		const activeDataSeries = Charts.getActiveDataSeries(container);

		const xScale = Charts.setXScale(data, options);
		Axis.drawXAxis(svg, xScale, options);
		const yScale = Charts.setYScale(svg, data, options, activeDataSeries);
		Axis.drawYAxis(svg, yScale, options);
		Grid.drawXGrid(svg, xScale, options, data);
		Grid.drawYGrid(svg, yScale, options, data);
		draw(svg, xScale, yScale, options, data, activeDataSeries);
		Charts.repositionSVG(container);
		addDataPointEventListener(parent, svg);
		Legend.positionLegend(container, data, options);
		if (options.containerResizable) {
			Charts.setResizeWhenContainerChange(data, parent, options);
		}
	}

	export function draw(svg, xScale, yScale, options, data, activeSeries) {
		xScale.padding(0.1);
		const yHeight = options.chartSize.height - svg.select(".x.axis").node().getBBox().height;
		const keys = activeSeries ? activeSeries : options.yDomain;
		const x1 = d3.scaleBand();
		x1.domain(keys).rangeRound([0, xScale.bandwidth()]);
		const color = d3.scaleOrdinal().range(options.colors).domain(options.yDomain);
		svg.append("g")
			.attr("class", "bars")
			.selectAll("g")
			.data(data)
			.enter().append("g")
				.attr("transform", d => `translate(${xScale(d[options.xDomain])},0)`)
			.selectAll("rect")
			.data(d => keys.map(key => ({
				xAxis: options.xDomain,
				series: key,
				key: d[options.xDomain],
				value: d[key],
				formatter: options.yFormatter,
				color: color(key)
			})))
			.enter().append("rect")
				.attr("x", d => x1(d.series))
				.attr("y", d => yHeight)
				.attr("width", x1.bandwidth())
				.attr("height", 0)
				.attr("fill", d => d.color)
				.transition()
				.duration(1000)
				.ease(d3.easePolyOut, 0.5)
				.attr("y", d => yScale(d.value))
				.attr("height", d => yHeight - yScale(d.value));
	}

	export function addDataPointEventListener(parent, svg) {
		svg.selectAll("rect")
			.on("mouseover", function(d) {
				d3.select(this)
					.attr("stroke-width", Configuration.bars.mouseover.strokeWidth)
					.attr("stroke", d.color)
					.attr("stroke-opacity", Configuration.bars.mouseover.strokeOpacity);
			})
			.on("mouseout", function() {
				d3.select(this)
					.attr("stroke-width", Configuration.bars.mouseout.strokeWidth)
					.attr("stroke", "none")
					.attr("stroke-opacity", Configuration.bars.mouseout.strokeOpacity);
			})
			.on("click", function(d) {
				Tooltip.showTooltip(parent, d);
				Charts.reduceOpacity(svg, this);
			});
	}
}
