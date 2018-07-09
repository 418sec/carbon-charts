import * as d3 from "d3";

import { BaseAxisChart } from "./base-axis-chart";
import { Configuration } from "./configuration";

import PatternsService from "./services/patterns";

export class BarChart extends BaseAxisChart {
	x: any;
	x1: any;
	y: any;
	colorScale: any;

	constructor(holder: Element, configs: any) {
		super(holder, configs);

		this.options.type = "bar";
	}

	setXScale(noAnimation?: boolean) {
		const { bar: margins } = Configuration.charts.margin;
		const { scales } = this.options;

		const chartSize = this.getChartSize();
		const width = chartSize.width - margins.left - margins.right;

		this.x = d3.scaleBand().rangeRound([0, width]).padding(0.25);
		this.x1 = d3.scaleBand().rangeRound([0, width]).padding(0.2);

		const activeLegendItems = this.getActiveLegendItems();
		// Apply legened filters, OLD VERSION axis.y.domain.filter(item => activeLegendItems.indexOf(item) > -1)

		console.log("DATA", this.displayData);
		this.x.domain(this.displayData.labels);
		this.x1.domain(this.displayData.datasets.map(dataset => dataset.label)).rangeRound([0, this.x.bandwidth()]);
	}

	draw() {
		this.innerWrap.style("width", "100%")
			.style("height", "100%");

		const { bar: margins } = Configuration.charts.margin;
		const { scales } = this.options;

		const chartSize = this.getChartSize();
		const width = chartSize.width - margins.left - margins.right;
		const height = chartSize.height - this.getBBox(".x.axis").height;

		const gBars = this.innerWrap
			.attr("transform", "translate(" + margins.left + "," + margins.top + ")")
			.append("g")
			.classed("bars", true)
			.attr("width", width);

		gBars.selectAll("g")
			.data(this.displayData.labels)
			.enter()
				.append("g")
				.attr("transform", d => "translate(" + this.x(d) + ",0)")
				.selectAll("rect.bar")
				.data((d, index) => this.addLabelsToDataPoints(d, index))
					.enter()
						.append("rect")
						.classed("bar", true)
						.attr("x", d => this.x1(d.datasetLabel))
						.attr("y", d => this.y(d.value))
						.attr("width", this.x1.bandwidth())
						.attr("height", d => height - this.y(d.value))
						.attr("fill", d => this.getFillScale()[d.datasetLabel](d.label))
						.attr("stroke", d => this.options.accessibility ? this.colorScale[d.datasetLabel](d.label) : null)
						.attr("stroke-width", Configuration.bars.default.strokeWidth)
						.attr("stroke-opacity", d => this.options.accessibility ? 1 : 0);

		// Hide the overlay
		this.updateOverlay().hide();

		// Dispatch the load event
		this.events.dispatchEvent(new Event("load"));
	}

	interpolateValues(newData: any) {
		const { bar: margins } = Configuration.charts.margin;
		const chartSize = this.getChartSize();
		const width = chartSize.width - margins.left - margins.right;
		const height = chartSize.height - this.getBBox(".x.axis").height;

		// Apply new data to the bars
		const g = this.innerWrap.select("g.bars")
			.attr("width", width)
			.selectAll("g")
			.data(this.displayData.labels);

		const rect = g.selectAll("rect.bar")
				.data((d, index) => this.addLabelsToDataPoints(d, index));

		this.updateElements(true, rect, g);

		// Add bar groups that need to be added now
		const addedBars = g.enter()
			.append("g")
			.classed("bars", true)
			.attr("transform", d => "translate(" + this.x(d) + ",0)");

		// Add bars that need to be added now
		g.selectAll("rect.bar")
			.data((d, index) => this.addLabelsToDataPoints(d, index))
			.enter()
			.append("rect")
			.attr("class", "bar")
			.attr("x", d => this.x1(d.datasetLabel))
			.attr("y", d => this.y(d.value))
			.attr("width", this.x1.bandwidth())
			.attr("height", d => height - this.y(d.value))
			.attr("opacity", 0)
			.transition(this.getFillTransition())
			.attr("fill", d => this.getFillScale()[d.datasetLabel](d.label))
			.attr("opacity", 1)
			.attr("stroke", (d: any) => this.colorScale[d.datasetLabel](d.label))
			.attr("stroke-width", this.options.accessibility ? 2 : 0);

		addedBars.selectAll("rect.bar")
			.data((d, index) => this.addLabelsToDataPoints(d, index))
			.enter()
			.append("rect")
			.attr("class", "bar")
			.attr("x", d => this.x1(d.datasetLabel))
			.attr("y", d => this.y(d.value))
			.attr("width", this.x1.bandwidth())
			.attr("height", d => height - this.y(d.value))
			.attr("opacity", 0)
			.transition(this.getFillTransition())
			.attr("fill", d => this.getFillScale()[d.datasetLabel](d.label))
			.attr("opacity", 1)
			.attr("stroke", (d: any) => this.colorScale[d.datasetLabel](d.label))
			.attr("stroke-width", this.options.accessibility ? 2 : 0);

		// Remove bar groups are no longer needed
		g.exit()
			.transition(this.getDefaultTransition())
			.style("opacity", 0)
			.remove();

		// Remove bars that are no longer needed
		rect.exit()
			.transition(this.getDefaultTransition())
			.style("opacity", 0)
			.remove();

		// Add slice hover actions, and clear any slice borders present
		this.addDataPointEventListener();

		// Hide the overlay
		this.updateOverlay().hide();

		// Dispatch the update event
		this.events.dispatchEvent(new Event("update"));
	}

	updateElements(animate: boolean, rect?: any, g?: any) {
		const { scales } = this.options;

		const chartSize = this.getChartSize();
		const height = chartSize.height - this.getBBox(".x.axis").height;

		if (!rect) {
			rect = this.innerWrap.selectAll("rect.bar");
		}

		if (g) {
			g.transition(animate ? this.getDefaultTransition() : this.getInstantTransition())
				.attr("transform", d => "translate(" + this.x(d) + ",0)");
		}

		// Update existing bars
		rect
			.transition(animate ? this.getFillTransition() : this.getInstantTransition())
			// TODO
			// .ease(d3.easeCircle)
			.attr("x", d => this.x1(d.datasetLabel))
			.attr("y", d => this.y(d.value))
			.attr("width", this.x1.bandwidth())
			.attr("height", d => height - this.y(d.value))
			.attr("fill", d => this.getFillScale()[d.datasetLabel](d.label))
			.attr("stroke", d => this.options.accessibility ? this.colorScale[d.datasetLabel](d.label) : null);
	}

	resizeChart() {
		const actualChartSize: any = this.getChartSize(this.container);
		const dimensionToUseForScale = Math.min(actualChartSize.width, actualChartSize.height);

		// Resize the SVG
		d3.select(this.holder).select("svg")
				.attr("width", `${dimensionToUseForScale}px`)
				.attr("height", `${dimensionToUseForScale}px`);

		this.updateXandYGrid(true);
		// Scale out the domains
		this.setXScale(true);
		this.setYScale();

		// Set the x & y axis as well as their labels
		this.setXAxis(true);
		this.setYAxis(true);

		// Apply new data to the bars
		const g = this.innerWrap.selectAll("g.bars g");
		this.updateElements(false, null, g);

		super.resizeChart();
	}
}
