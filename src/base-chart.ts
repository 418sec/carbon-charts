import * as d3 from "d3";
import { Configuration } from "./configuration";
import { Tools } from "./tools";
import { local } from "d3";

export class BaseChart {
	static chartCount = 1;

	//#region
	id = "";
	container: any;
	holder: Element;
	svg: any;
	resizeTimers = [];
	options: any = Object.assign({}, Configuration.options.BASE);
	data: any;

	constructor(holder: Element, options?: any, data?: any) {
		this.id = `chart-${BaseChart.chartCount++}`;

		this.holder = holder;

		const {chartId, container} = this.setChartIDContainer();
		this.container = container;


		if (options) {
			this.options = Object.assign(this.options, options);
		}

		if (data) {
			this.data = data;
		}
	}

	getActualChartSize(container = this.container) {
		const noAxis = this.options.type === "pie" || this.options.type === "donut";

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
		const marginsToExclude = noAxis ? 0 : (Configuration.charts.margin.left + Configuration.charts.margin.right);
		const computedActualSize = {
			height: container.node().clientHeight - marginForLegendTop,
			width: (container.node().clientWidth - marginsToExclude - moreForY2Axis) * ratio
		};

		// If chart is of type pie or donut, width and height should equal to the min of the width and height computed
		if (noAxis) {
			let maxSizePossible = Math.min(computedActualSize.height, computedActualSize.width);
			maxSizePossible = Math.max(maxSizePossible, 100);

			return {
				height: maxSizePossible,
				width: maxSizePossible
			};
		}

		return computedActualSize;
	}


	/*
	 * removes the chart and any tooltips
	 */
	removeChart() {
		this.container.select("svg").remove();
		this.container.selectAll(".chart-tooltip").remove();
		this.container.selectAll(".label-tooltip").remove();
	}

	/*
	 * either creates or updates the chart
	 */
	redrawChart(data?: any) {
		if (!data) {
			this.updateChart();
		} else {
			this.removeChart();
			this.drawChart(data);
		}
	}

	setSVG(): any {
		const chartSize = this.getActualChartSize();
		this.svg = this.container.append("svg")
			.classed("chart-svg", true)
			.append("g")
			.classed("inner-wrap", true);

		return this.svg;
	}

	updateSVG() {
		const chartSize = this.getActualChartSize();
		this.svg.select(".x.axis")
			.attr("transform", `translate(0, ${chartSize.height})`);
		const grid = this.svg.select(".grid")
			.attr("clip-path", `url(${window.location.origin}${window.location.pathname}#clip)`);
		grid.select(".x.grid")
			.attr("transform", `translate(0, ${chartSize.width})`);
		grid.select(".y.grid")
			.attr("transform", `translate(0, 0)`);
	}

	repositionSVG() {
		const yAxisWidth = (this.container.select(".y.axis").node() as SVGGElement).getBBox().width;
		this.container.style("padding-left", `${yAxisWidth}px`);
	}

	/*
	 * creates the chart from scratch
	 * should only be called once (or removeChart should be called before)
	 */
	drawChart(data?: any) {
		if (data) {
			this.data = data;
		}

		console.warn("You should implement your own `drawChart()` function.");
	}

	/*
	 * called when the chart needs to be updated visually
	 * similar to drawChart but it should work from the existing chart
	 */
	updateChart() {
		console.warn("You should implement your own `updateChart() function.");
	}

	resizeChart() {
		console.warn("You should implement your own `resizeChart() function.");
	}

	resizeWhenContainerChange() {
		let containerWidth = this.holder.clientWidth;
		let containerHeight = this.holder.clientHeight;
		const frame = () => {
			if (Math.abs(containerWidth - this.holder.clientWidth) > 1
				|| Math.abs(containerHeight - this.holder.clientHeight) > 1) {
				containerWidth = this.holder.clientWidth;
				containerHeight = this.holder.clientHeight;
				d3.selectAll(".legend-tooltip").style("display", "none");

				// Hide tooltips
				this.hideTooltip();

				// TODO - Remove updateChart
				// this.updateChart();
				this.resizeChart();
			}
			requestAnimationFrame(frame);
		};
		requestAnimationFrame(frame);
	}

	setClickableLegend() {
		const self = this;
		const c = d3.select(this.holder);
		c.selectAll(".legend-btn").each(function() {
			d3.select(this).on("click", function() {
				c.selectAll(".chart-tooltip").remove();
				c.selectAll(".label-tooltip").remove();

				// Only apply legend filters if there are more than 1 active legend items
				const activeLegendItems = self.getActiveLegendItems();
				const legendButton = d3.select(this);
				const enabling = !legendButton.classed("active");

				// If there are more than 1 active legend items & one is getting toggled on
				if (activeLegendItems.length > 1 || enabling) {
					self.updateLegend(this);
					self.applyLegendFilter(legendButton.select("text").text());
				}
				// If there are 2 active legend items & one is getting toggled off
				if (activeLegendItems.length === 2 && !enabling) {
					c.selectAll(".legend-btn.active").classed("not-allowed", true);
				}

				if (activeLegendItems.length === 1 && enabling) {
					c.selectAll(".legend-btn.not-allowed").classed("not-allowed", false);
				}
			});
		});
	}

	applyLegendFilter(changedLabel: string) {
		console.warn("You should implement your own `applyLegendFilter() function.");
	}

	setClickableLegendInTooltip() {
		const self = this;
		const c = d3.select(this.container);
		const tooltip = c.select(".legend-tooltip-content");
		tooltip.selectAll(".legend-btn").each(function() {
			d3.select(this).on("click", function() {
				self.updateLegend(this);
				self.redrawChart();
			});
		});
	}

	getActiveLegendItems() {
		const activeSeries = [];
		let c = this.container;
		if (c.selectAll(".legend-tooltip").nodes().length > 0) {
			c = c.select(".legend-tooltip");
		}
		c.selectAll(".legend-btn").filter(".active").each(function() {
			activeSeries.push(d3.select(this).select("text").text());
		});

		return activeSeries;
	}

	setChartIDContainer() {
		const parent = d3.select(this.holder);
		let chartId, container;
		if (parent.select(".chart-wrapper").nodes().length > 0) {
			container = parent.select(".chart-wrapper");
			chartId = container.attr("chart-id");
			container.selectAll(".chart-svg").remove();
		} else {
			chartId = this.id;
			container = parent.append("div");
			container.attr("chart-id", chartId)
				.classed("chart-wrapper", true);
			if (container.select(".legend-wrapper").nodes().length === 0) {
				const legendWrapper = container.append("div").attr("class", "legend-wrapper");
				legendWrapper.append("ul").attr("class", "legend");
			}
		}
		return {chartId, container};
	}

	resetOpacity() {
		const svg = d3.selectAll("svg");
		svg.selectAll("path").attr("stroke-opacity", Configuration.charts.resetOpacity.opacity);
		svg.selectAll("path").attr("fill-opacity", Configuration.charts.resetOpacity.opacity);
		svg.selectAll("circle").attr("stroke-opacity", Configuration.charts.resetOpacity.opacity)
			.attr("fill", Configuration.charts.resetOpacity.circle.fill);
		svg.selectAll("rect").attr("fill-opacity", Configuration.charts.resetOpacity.opacity);
	}

	reduceOpacity(exception) {
		this.svg.selectAll("rect").attr("fill-opacity", Configuration.charts.reduceOpacity.opacity);
		this.svg.selectAll("path").attr("stroke-opacity", Configuration.charts.reduceOpacity.opacity);
		this.svg.selectAll("path").attr("fill-opacity", Configuration.charts.reduceOpacity.opacity);
		this.svg.selectAll("circle").attr("stroke-opacity", Configuration.charts.reduceOpacity.opacity);

		d3.select(exception).attr("fill-opacity", false);
		d3.select(exception.parentNode).selectAll("circle").attr("stroke-opacity", Configuration.charts.resetOpacity.opacity);
		d3.select(exception).attr("stroke-opacity", Configuration.charts.resetOpacity.opacity);
		d3.select(exception).attr("fill", d3.select(exception).attr("stroke"));
	}

	// Legend
	getLegendItems() {
		let legendItems = {};

		if (this.options.keys) {
			legendItems = this.options.keys;
		}

		return legendItems;
	}

	getLegendItemsArray() {
		const legendItems = this.getLegendItems();

		return Object.keys(legendItems);
	}

	updateLegend(legend) {
		const thisLegend = d3.select(legend);
		const circle = d3.select(legend).select(".legend-circle");

		thisLegend.classed("active", !thisLegend.classed("active"));
		if (thisLegend.classed("active")) {
			circle.style("background-color", circle.style("border-color"))
				.style("border-color", Configuration.legend.active.borderColor)
				.style("border-style", Configuration.legend.active.borderStyle)
				.style("border-width", Configuration.legend.active.borderWidth);
		} else {
			circle.style("border-color", circle.style("background-color"))
				.style("background-color", Configuration.legend.inactive.backgroundColor)
				.style("border-style", Configuration.legend.inactive.borderStyle)
				.style("border-width", Configuration.legend.inactive.borderWidth);
		}
	}

	addLegend() {
		if (this.container.select(".legend-tooltip").nodes().length > 0) {
			return;
		}

		const legendItems = this.getLegendItems();
		const legend = this.container.select(".legend")
			.attr("font-size", Configuration.legend.fontSize)
			.selectAll("div")
			.data(legendItems)
			.enter().append("li")
				.attr("class", "legend-btn active");

		legend.append("div")
			.attr("class", "legend-circle")
			.style("background-color", (d, i) => this.options.colors[i]);

		legend.append("text")
			.text(d => d);

		this.addLegendCircleHoverEffect();
	}

	positionLegend() {
		if (this.container.select(".legend-tooltip").nodes().length > 0
			&& this.container.select(".legend-tooltip").node().style.display === "block") { return; }

		this.container.selectAll(".legend-btn").style("display", "inline-block");
		const svgWidth = this.container.select("g.inner-wrap").node().getBBox().width;
		if (this.isLegendOnRight()) {
			this.container.selectAll(".expand-btn").remove();
			this.container.select(".legend-wrapper").style("height", 0);
			const containerWidth = this.container.node().clientWidth;
			const legendWidth = containerWidth - svgWidth;
			this.container.select(".legend").classed("right-legend", true)
				.style("width", legendWidth + "px");
		} else {
			this.container.select(".legend-wrapper").style("height", Configuration.legend.wrapperHeight);
		}

		if (this.hasLegendExpandBtn()) {
			this.container.select(".legend").classed("right-legend", false)
				.style("width", null);
			const btns = this.container.selectAll(".legend-btn").nodes();
			let btnsWidth = 0;
			btns.forEach(btn => {
				if ((btnsWidth + btn.clientWidth + Configuration.legend.widthTolerance) > svgWidth) {
					d3.select(btn).style("display", "none");
				} else {
					btnsWidth += btn.clientWidth;
				}
			});
			if (this.container.select(".expand-btn").nodes().length === 0) {
				this.addTooltipOpenButtonToLegend();
			}
		}
	}

	addOrUpdateLegend() {
		this.addLegend();
		if (this.options.legendClickable) {
			this.setClickableLegend();
		}

		this.positionLegend();
	}

	addLegendCircleHoverEffect() {
		d3.selectAll(".legend-circle")
			.on("mouseover", function() {
				const color = (this as HTMLElement).style.backgroundColor.substring(4, (this as HTMLElement).style.backgroundColor.length - 1);
				d3.select(this).style(
					"box-shadow",
					`0 0 0 ${Configuration.legend.hoverShadowSize} rgba(${color}, ${Configuration.legend.hoverShadowTransparency})`
				);
			})
			.on("mouseout", function() {
				d3.select(this).style("box-shadow", "none");
			});
	}

	hasLegendExpandBtn() {
		return (
			this.container.node().clientWidth < Configuration.charts.widthBreak ||
				this.container.node().clientHeight < this.container.select("ul.legend").node().clientHeight

			// && this.getLegendItems().length > Configuration.legend.countBreak
		);
	}

	isLegendOnRight() {
		return (
			this.container.node().clientWidth > Configuration.charts.widthBreak &&
				this.container.node().clientHeight > this.container.select("ul.legend").node().clientHeight

			// && this.getLegendItems().length > Configuration.legend.countBreak
		);
	}

	addTooltipOpenButtonToLegend() {
		const self = this;
		const thisLegend = this.container.select(".legend");
		thisLegend.append("div")
			.attr("class", "expand-btn")
			.style("cursor", "pointer")
			.on("click", function() {
				self.openLegendTooltip(this);
			});
	}

	openLegendTooltip(target) {
		d3.selectAll(".legend-tooltip").remove();
		const mouseXPoint = d3.mouse(this.container.node())[0];
		const windowXPoint = d3.event.x;
		let tooltip;
		if (this.container.select(".legend-tooltip").nodes().length > 0) {
			tooltip = d3.selectAll(".legend-tooltip").style("display", "block");
			tooltip.select("arrow").remove();
		} else {
			tooltip = this.container.append("div")
				.attr("class", "tooltip legend-tooltip")
				.style("display", "block")
				.style("top", (d3.mouse(this.container.node())[1] - Configuration.legend.margin.top) + "px");
			tooltip.append("p").text("Legend")
				.attr("class", "legend-tooltip-header");
			tooltip.append("ul")
				.attr("class", "legend-tooltip-content")
				.attr("font-size", Configuration.legend.fontSize);
			Tools.addCloseBtn(tooltip, "md", "white")
				.on("click", () => {
					d3.selectAll(".legend-tooltip").style("display", "none");
				});

			const legendContent = d3.select(".legend-tooltip-content")
				.attr("font-size", Configuration.legend.fontSize)
				.selectAll("div")
				.data(this.getLegendItemsArray())
				.enter().append("li")
				.attr("class", "legend-btn active")
				.on("click", (clickedItem) => {
					this.updateLegend(d3.event.currentTarget);
					this.redrawChart();
				});

			legendContent.append("div")
				.attr("class", "legend-circle")
				.style("background-color", (d, i) => this.options.colors[i]);
			this.addLegendCircleHoverEffect();

			legendContent.append("text")
				.text(d => "" + d);
		}

		if (window.innerWidth - (windowXPoint + Configuration.tooltip.width) < 0) {
			tooltip.classed("arrow-right", true);
			tooltip.append("div").attr("class", "arrow");
			tooltip.style("left", `${mouseXPoint - Configuration.tooltip.width - Configuration.tooltip.arrowWidth}px`);
		} else {
			tooltip.classed("arrow-left", true);
			tooltip.append("div").attr("class", "arrow");
			tooltip.style("left", `${mouseXPoint + Configuration.tooltip.arrowWidth}px`);
		}
	}

	showLabelTooltip(d, leftSide) {
		d3.selectAll(".label-tooltip").remove();
		const mouseXPoint = d3.mouse(this.holder as SVGSVGElement)[0] + Configuration.tooltip.arrowWidth;
		const tooltip = this.container.append("div")
			.attr("class", "tooltip label-tooltip")
			.style("top", d3.mouse(this.holder as SVGSVGElement)[1] - Configuration.tooltip.magicTop1 + "px");
		Tools.addCloseBtn(tooltip, "xs")
			.on("click", () => {
				this.resetOpacity();
				d3.selectAll(".tooltip").remove();
			});
		tooltip.append("p").text(d);

		if (leftSide) {
			tooltip.classed("arrow-left", true)
					.style("left", mouseXPoint + "px")
					.append("div").attr("class", "arrow");
		} else {
			tooltip.classed("arrow-right", true);

			const xPoint = mouseXPoint - (tooltip.node() as Element).clientWidth - Configuration.tooltip.magicXPoint2;
			tooltip.style("left", xPoint + "px")
					.append("div").attr("class", "arrow");
		}
	}

	hideTooltip() {
		this.resetOpacity();
		d3.selectAll(".tooltip").remove();

		this.removeTooltipEventListeners();
	}

	addTooltipEventListeners(tooltip: any) {
		// Apply the event listeners to close the tooltip
		// setTimeout is there to avoid catching the click event that opened the tooltip
		setTimeout(() => {
			// When ESC is pressed
			window.onkeydown = (evt: KeyboardEvent) => {
				if ("key" in evt && evt.key === "Escape" || evt.key === "Esc") {
					this.hideTooltip();
				}
			};

			// If clicked outside
			window.onclick = (evt: MouseEvent) => {
				const targetTagName = evt.target["tagName"];
				const targetsToBeSkipped = ["rect", "circle", "path"];

				if (targetsToBeSkipped.indexOf(targetTagName) === -1) {
					this.hideTooltip();
				}
			};

			// Stop clicking inside tooltip from bubbling up to window
			tooltip.on("click", () => {
				d3.event.stopPropagation();
			});
		}, 0);
	}

	removeTooltipEventListeners() {
		// Remove eventlistener to close tooltip when ESC is pressed
		window.onkeydown = null;

		// Remove eventlistener to close tooltip when clicked outside
		window.onclick = null;
	}

	showTooltip(d) {
		let tooltipHTML = "";
		this.resetOpacity();
		d3.selectAll(".tooltip").remove();
		const tooltip = d3.select(this.holder).append("div")
			.attr("class", "tooltip chart-tooltip")
			.style("top", d3.mouse(this.holder as SVGSVGElement)[1] - Configuration.tooltip.magicTop2 + "px")
			.style("border-color", d.color);
		Tools.addCloseBtn(tooltip, "xs")
			.on("click", () => {
				this.hideTooltip();
			});
		const dVal = d.formatter && d.formatter[d.series] ? d.formatter[d.series](d.value.toLocaleString()) : d.value.toLocaleString();
		if (d.xAxis && d.xAxis.length > 0) {
			tooltipHTML += "<b>" + d.xAxis + ": </b>" + d.key + "<br/>";
		}
		if (d.series && !d.dimension) {
			tooltipHTML += "<b>" + d.series + ": </b>" + dVal + "<br/>";
		}
		if (d.dimension) {
			tooltipHTML += "<b>" + d.dimension + ": </b>" + d.dimVal + "<br/><b>" + d.valueName + ": </b>" + d.value;
		}
		tooltip.append("div").attr("class", "text-box").html(tooltipHTML);
		if (d3.mouse(this.holder as SVGSVGElement)[0] + (tooltip.node() as Element).clientWidth > this.holder.clientWidth) {
			tooltip.classed("arrow-right", true);
			tooltip.style(
				"left",
				d3.mouse(this.holder as SVGSVGElement)[0] - (tooltip.node() as Element).clientWidth - Configuration.tooltip.magicLeft1 + "px"
			);
			tooltip.append("div").attr("class", "arrow");
		} else {
			tooltip.classed("arrow-left", true);
			tooltip.style("left", d3.mouse(this.holder as SVGSVGElement)[0] + Configuration.tooltip.magicLeft2 + "px");
			tooltip.append("div").attr("class", "arrow");
		}

		this.addTooltipEventListeners(tooltip);
	}

	// https://github.com/wbkd/d3-extended
	moveToBack(element) {
		return element.each(function() {
			const firstChild = this.parentNode.firstChild;
			if (firstChild) {
				this.parentNode.insertBefore(this, firstChild);
			}
		});
	}

	moveToFront(element) {
		return element.each(function() {
			this.parentNode.appendChild(this);
		});
	}
}
