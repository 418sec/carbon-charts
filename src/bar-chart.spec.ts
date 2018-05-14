import { BarChart } from "./index";
import { createClassyContainer, grabClassyContainer, mainSVGSelector, colors } from "./test-tools";

const chartType = "bar";
describe("Bar Chart", () => {
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
		const classyBarChart = new BarChart(
			classyContainer,
			Object.assign({}, options, {type: chartType}),
			data
		);
		classyBarChart.drawChart();
	});

	it("Should work", () => {
		// Grab chart container in DOM
		const classyContainer = grabClassyContainer(chartType);

		// Expect chart container to contain the main chart SVG element
		expect(classyContainer.querySelector(mainSVGSelector)).toBeTruthy();
	});
});
