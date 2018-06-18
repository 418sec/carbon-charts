import * as d3 from "d3";

import { BaseChart } from "./base-chart";

import { Configuration } from "./configuration";
import { Tools } from "./tools";

export class BaseAxisChart extends BaseChart {
	x: any;
	y: any;

	constructor(holder: Element, options?: any, data?: any) {
		super(holder, options, data);
	}

	setSVG(): any {
		super.setSVG();

		const chartSize = this.getChartSize();
		this.container.classed("chart-axis", true);
		this.innerWrap.append("g")
			.attr("class", "x grid");
		this.innerWrap.append("g")
			.attr("class", "y grid");

		return this.svg;
	}

	getKeysFromData() {
		const keys: any = {};
		// Build out the keys array of objects to represent the legend items
		// If yDomain does not exist & xDomain does
		if (!this.options.yDomain && this.options.xDomain) {
			this.displayData.forEach(entry => {
				const entryLabel = entry[this.options.xDomain];
				keys[entryLabel] = Configuration.legend.items.status.ACTIVE;
			});
		} else {
			this.options.yDomain.forEach(item => {
				keys[item] = Configuration.legend.items.status.ACTIVE;
			});
		}

		return keys;
	}

	initialDraw(data?: any) {
		if (data) {
			this.displayData = data;
		}

		this.setSVG();

		// Set the color scale based on the keys present in the data
		this.setColorScale();

		// Scale out the domains
		// Set the x & y axis as well as their labels
		this.setXScale();
		this.setXAxis();
		this.setYScale();
		this.setYAxis();

		// Draw the x & y grid
		this.drawXGrid();
		this.drawYGrid();

		this.draw();

		this.addOrUpdateLegend();
		this.addDataPointEventListener();
	}

	update() {
		const newDisplayData = this.updateData();
		this.displayData = newDisplayData;

		this.updateXandYGrid();
		this.setXScale();
		this.setXAxis();
		this.setYScale();
		this.setYAxis();
		this.interpolateValues(newDisplayData);
	}

	updateData() {
		const oldData = this.data;
		const activeLegendItems = this.getActiveLegendItems();

		// Get new data by filtering the data based off of the legend
		const newDisplayData = oldData.filter(dataPoint => {
			// If this datapoint is active on the legend
			const activeSeriesItemIndex = activeLegendItems.indexOf(dataPoint.label);

			return activeSeriesItemIndex > -1;
		});

		return newDisplayData;
	}

	draw() {
		console.warn("You should implement your own `draw() function.");
	}

	interpolateValues(newData: any) {
		console.warn("You should implement your own `interpolateValues() function.");
	}

	/**************************************
	 *  Computations/Calculations         *
	 *************************************/

	getChartSize(container = this.container) {
		let ratio, marginForLegendTop;
		let moreForY2Axis = 0;
		if (container.node().clientWidth > Configuration.charts.widthBreak) {
			ratio = Configuration.charts.magicRatio;
			marginForLegendTop = 0;
		} else {
			marginForLegendTop = Configuration.charts.marginForLegendTop;
			ratio = 1;
		}

		if (this.options.type === "double-axis-line" || this.options.type === "combo") {
			moreForY2Axis = Configuration.charts.magicMoreForY2Axis;
		}

		// Store computed actual size, to be considered for change if chart does not support axis
		const marginsToExclude = Configuration.charts.margin.left + Configuration.charts.margin.right;
		const computedChartSize = {
			height: container.node().clientHeight - marginForLegendTop,
			width: (container.node().clientWidth - marginsToExclude - moreForY2Axis) * ratio
		};

		return computedChartSize;
	}

	setColorScale() {
		this.colorScale = d3.scaleOrdinal().range(this.options.colors).domain(this.getLegendItemKeys());
	}

	/**************************************
	 *  Axis & Grids                      *
	 *************************************/

	setXScale(noAnimation?: boolean) {
		const { bar: margins } = Configuration.charts.margin;
		const chartSize = this.getChartSize();
		const width = chartSize.width - margins.left - margins.right;

		this.x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
		this.x.domain(this.displayData.map(d => d.label));
	}

	setXAxis(noAnimation?: boolean) {
		const { bar: margins } = Configuration.charts.margin;
		const chartSize = this.getChartSize();
		const height = chartSize.height - margins.top - margins.bottom;
		const t = d3.transition().duration(noAnimation ? 0 : 750);

		const xAxis = d3.axisBottom(this.x).tickSize(0);
		let xAxisRef = this.svg.select("g.x.axis");

		// If the <g class="x axis"> exists in the chart SVG, just update it
		if (xAxisRef.nodes().length > 0) {
			xAxisRef = this.svg.select("g.x.axis")
				// .transition(t)
				.attr("transform", "translate(0," + height + ")")
				// Being cast to any because d3 does not offer appropriate typings for the .call() function
				.call(d3.axisBottom(this.x).tickSize(0) as any);
		} else {
			xAxisRef = this.innerWrap.append("g")
				.attr("class", "x axis")
				.call(xAxis);
		}

		// Update the position of the pieces of text inside x-axis
		xAxisRef.selectAll("g.tick text")
			.attr("y", Configuration.axis.magicY1)
			.attr("x", Configuration.axis.magicX1)
			.attr("dy", ".35em")
			.attr("transform", `rotate(${Configuration.axis.xAxisAngle})`)
			.style("text-anchor", "end")
			.call(text => this.wrapTick(text));

		// get the tickHeight after the ticks have been wrapped
		const tickHeight = this.getLargestTickHeight(xAxisRef.selectAll(".tick")) + Configuration.axis.tick.heightAddition;
		xAxisRef.select(".domain")
			.attr("stroke", Configuration.axis.domain.color)
			.attr("fill", Configuration.axis.domain.color)
			.attr("stroke-width", Configuration.axis.domain.strokeWidth);

		if (this.innerWrap.select(".axis-label.x").nodes().length === 0) {
			xAxisRef.append("text")
			.attr("class", "x axis-label")
			.attr("text-anchor", "middle")
			.attr("transform", "translate(" + (xAxisRef.node().getBBox().width / 2) + "," + tickHeight + ")")
			.text(this.options.xDomain);
		}

		// get the yHeight after the height of the axis has settled
		const yHeight = this.getChartSize().height - this.svg.select(".x.axis").node().getBBox().height;
		xAxisRef.attr("transform", `translate(0, ${yHeight})`);
	}

	setYScale() {
		const { bar: margins } = Configuration.charts.margin;
		const chartSize = this.getChartSize();
		const height = chartSize.height - margins.top - margins.bottom - this.innerWrap.select(".x.axis").node().getBBox().height;
		const yEnd = d3.max(this.displayData, (d: any) => d.value);

		this.y = d3.scaleLinear().rangeRound([height, 0]);
		this.y.domain([0, yEnd]);
	}

	setYAxis(noAnimation?: boolean) {
		const t = d3.transition().duration(noAnimation ? 0 : 750);

		const yAxis = d3.axisLeft(this.y).ticks(5).tickSize(0);
		const yAxisRef = this.svg.select("g.y.axis");
		// If the <g class="y axis"> exists in the chart SVG, just update it
		if (yAxisRef.nodes().length > 0) {
			yAxisRef.transition(t)
				// Being cast to any because d3 does not offer appropriate typings for the .call() function
				.call(yAxis as any);
		} else {
			this.innerWrap.append("g")
				.attr("class", "y axis")
				.call(yAxis);
		}
	}

	drawXGrid() {
		const yHeight = this.getChartSize().height - this.getBBox(".x.axis").height;
		const xGrid = d3.axisBottom(this.x)
			.tickSizeInner(-yHeight)
			.tickSizeOuter(0);

		const g = this.innerWrap.select(".x.grid")
			.attr("transform", `translate(0, ${yHeight})`)
			.call(xGrid);

		this.cleanGrid(g);
	}

	drawYGrid() {
		const yHeight = this.getChartSize().height - this.getBBox(".x.axis").height;
		const yGrid = d3.axisLeft(this.y)
			.tickSizeInner(-(this.getChartSize().width))
			.tickSizeOuter(0)
			.ticks(10);
		const g = this.innerWrap.select(".y.grid")
			.attr("transform", `translate(0, 0)`)
			.call(yGrid);

		this.cleanGrid(g);
	}

	updateXandYGrid(noAnimation?: boolean) {
		// setTimeout is needed here, to take into account the new position of bars
		// Right after transitions are initiated for the
		setTimeout(() => {
			const t = d3.transition().duration(noAnimation ? 0 : 750);

			// Update X Grid
			const chartSize = this.getChartSize();
			const yHeight = chartSize.height - this.getBBox(".x.axis").height;
			const xGrid = d3.axisBottom(this.x)
				.tickSizeInner(-yHeight)
				.tickSizeOuter(0);

			const g_xGrid = this.innerWrap.select(".x.grid")
				.transition(t)
				.attr("transform", `translate(0, ${yHeight})`)
				.call(xGrid);

			this.cleanGrid(g_xGrid);

			// Update Y Grid
			const yGrid = d3.axisLeft(this.y)
				.tickSizeInner(-(chartSize.width))
				.tickSizeOuter(0)
				.tickFormat("" as any)
				.ticks(10);
			const g_yGrid = this.innerWrap.select(".y.grid")
				.transition(t)
				.attr("transform", `translate(0, 0)`)
				.call(yGrid);

			this.cleanGrid(g_yGrid);
		}, 0);
	}

	cleanGrid (g) {
		g.selectAll("line")
			.attr("stroke", Configuration.grid.strokeColor);
		g.selectAll("text").style("display", "none").remove();
		g.select(".domain").style("stroke", "none");
		g.select(".tick").remove();
	}

	// TODO - Refactor
	wrapTick(ticks) {
		const self = this;
		const letNum = Configuration.axis.tick.maxLetNum;
		ticks.each(function(t) {
			if (t && t.length > letNum / 2) {
				const tick = d3.select(this);
				const y = tick.attr("y");
				tick.text("");
				const tspan1 = tick.append("tspan")
					.attr("x", 0).attr("y", y).attr("dx", Configuration.axis.dx).attr("dy", `-${Configuration.axis.tick.dy}`);
				const tspan2 = tick.append("tspan")
					.attr("x", 0).attr("y", y).attr("dx", Configuration.axis.dx).attr("dy", Configuration.axis.tick.dy);
				if (t.length < letNum - 3) {
					tspan1.text(t.substring(0, t.length / 2));
					tspan2.text(t.substring(t.length / 2 + 1, t.length));
				} else {
					tspan1.text(t.substring(0, letNum / 2));
					tspan2.text(t.substring(letNum / 2, letNum - 3) + "...");
					tick.on("click", dd => {
						self.showLabelTooltip(dd, true);
					});
				}
			}
		});
	}

	// TODO - Refactor
	getLargestTickHeight(ticks) {
		let largestHeight = 0;
		ticks.each(function() {
			let tickLength = 0;
			try {
				tickLength = this.getBBox().height;
			} catch (e) {
				console.log(e);
			}
			if (tickLength > largestHeight) {
				largestHeight = tickLength;
			}

		});
		return largestHeight;
	}

	/**************************************
	 *  Events & User interactions        *
	 *************************************/

	addDataPointEventListener() {
		const self = this;
		const { accessibility } = this.options;

		this.svg.selectAll("rect")
			.on("mouseover", function(d) {
				d3.select(this)
					.attr("stroke-width", Configuration.bars.mouseover.strokeWidth)
					.attr("stroke", self.colorScale(d.label))
					.attr("stroke-opacity", Configuration.bars.mouseover.strokeOpacity);
			})
			.on("mouseout", function(d) {
				d3.select(this)
					.attr("stroke-width", accessibility ? 2 : Configuration.bars.mouseout.strokeWidth)
					.attr("stroke", accessibility ? self.colorScale(d.label) : "none")
					.attr("stroke-opacity", Configuration.bars.mouseout.strokeOpacity);
			})
			.on("click", function(d) {
				self.showTooltip(d);
				self.reduceOpacity(this);
			});
	}
}
