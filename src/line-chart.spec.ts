import * as d3 from "d3";

import { LineChart } from "./index";
import {
	createClassyContainer,
	grabClassyContainer,
	removeChart,
	selectors,
	colors } from "./test-tools";

const chartType = "line";
describe("Line Chart", () => {
	beforeEach(() => {
		// Append the chart container to DOM
		const classyContainer = createClassyContainer(chartType);
		document.body.appendChild(classyContainer);

		const data = [];
		for (let i = 0; i < 10; i++) {
			data.push({
			"Part number": `773C-${ i * 2 }-L6EP-L22I-${ i * 8 }-L22I`,
			"Qty": i * 10,
			"More": i * 20,
			"Sold": i * 0
			});
		}

		const options = {
			xDomain: "Part number",
			yDomain: ["Sold", "More", "Qty"],
			yTicks: 5,
			legendClickable: true,
			containerResizable: true,
			colors
		};

		// Instantiate chart object & draw on DOM
		const classyLineChart = new LineChart(
			classyContainer,
			Object.assign({}, options, {type: chartType}),
			data
		);
		classyLineChart.drawChart();
	});

	afterEach(() => {
		// Remove the chart resulted from this test case
		removeChart(chartType);
	});

	it("Should work", () => {
		// Grab chart container in DOM
		const classyContainer = grabClassyContainer(chartType);

		// Expect chart container to contain the main chart SVG element
		expect(classyContainer.querySelector(selectors.OUTERSVG)).toBeTruthy();
	});

	it ("Should show tooltips", () => {
		// Grab chart container in DOM
		const classyContainer = grabClassyContainer(chartType);

		// Trigger click on a slice
		d3.select(classyContainer).select(`${selectors.INNERWRAP} circle`).dispatch("click");

		// Make sure the tooltip container exists now
		expect(document.querySelector(selectors.TOOLTIP)).toBeTruthy();
	});
});
