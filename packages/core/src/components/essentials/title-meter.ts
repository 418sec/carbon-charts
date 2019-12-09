// Internal Imports
import { Component } from "../component";
import { Title } from "./title";
import { DOMUtils } from "../../services";
import { TooltipTypes } from "./../../interfaces";
import { selectAll } from "d3-selection";

export class TitleMeter extends Title {
	type = "meter-title";

	/**
	 * Appends the corresponding status based on the value and the peak.
	 */
	displayStatus() {
		const displayData = this.model.getDisplayData();
		const dataset = displayData.datasets[0];
		const svg = this.getContainerSVG();

		// remove any status indicators on the chart to re-render if ranges have been given
		const status = svg.selectAll("circle.status-indicator");
		status.remove();

		// if ranges are provided
		if (dataset.data.status) {
		// size of the status indicator
		const circleSize = this.model.getOptions().meter.status.indicatorSize;

		const self = this;
		svg.append("circle")
			.attr("cx", DOMUtils.getSVGElementSize(this.parent, { useAttrs: true }).width - circleSize)
			.attr("cy", 20 - circleSize)
			.attr("r", circleSize)
			.attr("class", function() {
				return `status-indicator status--${self.getStatus(dataset.data.value, dataset)}`;
			});
		}
	}

	/**
	 * Appends the associated percentage to the end of the title
	 */
	appendPercentage() {
		// meter only deals with 1 dataset (like pie/donut)
		const displayData = this.model.getDisplayData();
		const dataset = displayData.datasets[0];
		// the value of the meter converted to percent
		const value = Math.round(dataset.data.value / dataset.data.max * 100);

		// use the title's position to append the percentage to the end
		const svg = this.getContainerSVG();
		const title = DOMUtils.appendOrSelect(svg, "text.title");
		const percentage = DOMUtils.appendOrSelect(svg, "text.percent-value");

		// the horizontal offset of the percentage value from the title
		const offset = this.model.getOptions().meter.title.paddingRight;

		percentage.text(`${value}%`)
			.attr("x", +title.attr("x") + title.node().getComputedTextLength() + offset) // set the position to after the title
			.attr("y", title.attr("y"));
	}

	truncateTitle() {
		const containerWidth  = DOMUtils.getSVGElementSize(this.parent).width;
		const title =  DOMUtils.appendOrSelect(this.parent, "text.title");
		const percentage =  DOMUtils.appendOrSelect(this.parent, "text.percent-value");

		// the title needs to fit the width of the container without crowding the status, and percentage value
		const offset = this.model.getOptions().meter.title.valueOffset; // horizontal offset of percent from title
		const titleWidth = title.node().getComputedTextLength();
		const percentageWidth = percentage.node().getComputedTextLength();
		const statusWidth = DOMUtils.appendOrSelect(this.parent, "circle.status-indicator").node().getBBox().width +
			this.model.getOptions().meter.status.paddingLeft;

		// check if the title is too big for the containing svg
		if (titleWidth + percentageWidth + offset + statusWidth > containerWidth) {
			// append the ellipses to their own tspan to calculate the text length
			title.append("tspan")
				.text("...");

			// get the bounding width including the elipses '...'
			const tspanLength = Math.ceil(DOMUtils.appendOrSelect(title, "tspan").node().getComputedTextLength());
			const truncatedSize = Math.floor(containerWidth - tspanLength - percentageWidth - statusWidth);
			const titleString = title.text();

			// get the index for creating the max length substring that fits within the svg
			// use one less than the index to avoid crowding (the elipsis)
			const substringIndex = this.getSubstringIndex(title.node(), 0, titleString.length - 1, truncatedSize);

			// use the substring as the title
			title.text(titleString.substring(0, substringIndex - 1))
				.append("tspan")
				.text("...");

			// update the percentage location
			percentage.attr("x", +title.attr("x") + title.node().getComputedTextLength() + tspanLength + offset);

			// add events for displaying the tooltip with the title
			const self = this;
			title.on("mouseenter", function() {
				self.services.events.dispatchEvent("show-tooltip", {
					hoveredElement: title,
					type: TooltipTypes.TITLE
				});
			})
			.on("mouseout", function() {
				self.services.events.dispatchEvent("hide-tooltip", {
					hoveredElement: title,
				});
			});
		}
	}

	render() {
		const displayData = this.model.getDisplayData();
		// meter only deals with 1 dataset (like pie/donut)
		const dataset = displayData.datasets[0];

		const svg = this.getContainerSVG();

		// the title for a meter, is the label for that dataset
		const text = DOMUtils.appendOrSelect(svg, "text.title");
		text.attr("x", 0)
			.attr("y", 20)
			.text(dataset.label);

		// TODO - Replace with layout component margins
		DOMUtils.appendOrSelect(svg, "rect.spacer")
			.attr("x", 0)
			.attr("y", 20)
			.attr("width", 20)
			.attr("height", 20)
			.attr("fill", "none");

		// appends the associated percentage after title
		this.appendPercentage();

		// if status ranges are provided (custom or default), display indicator
		this.displayStatus();

		// title needs to first render so that we can check for overflow
		this.truncateTitle();

	}

	/**
	 * Get the associated status for the data by checking the ranges
	 * @param d
	 * @param dataset
	 */
	protected getStatus(d: any, dataset: any) {
		const allRanges = dataset.data.status;
		const result = allRanges.filter(step => (step.range[0] <= d && d <= step.range[1]) );
		return result[0].status;
	}
}
