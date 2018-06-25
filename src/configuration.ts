const baseOptions: any = {
	legendClickable: true,
	containerResizable: true,
	type: "basic",
	colors: [
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
};

const axisOptions: any = Object.assign({}, baseOptions, {
	series: [],
	axis: {
		x: {
			domain: null,
			ticks: 5
		},
		y: {
			domain: null,
			ticks: 5
		},
		ySecondary: {
			domain: null,
			ticks: 10
		}
	},
	// xDomain: [],
	// yDomain: [],
	// secondaryYDomain: [],
	// yTicks: 5,
	// y2Ticks: 10
});

export namespace Configuration {
	export const options = {
		BASE: baseOptions,
		AXIS: axisOptions
	};

	export const charts = {
		margin: {
			top: 20,
			bottom: 60,
			left: 60,
			right: 20,
			bar: {
				top: 0,
				right: -40,
				bottom: 50,
				left: 40
			}
		},
		resetOpacity: {
			opacity: 1,
			circle: {
				fill: "white"
			},
			outline: "grey"
		},
		reduceOpacity: {
			opacity: 0.25,
			outline: "grey"
		},
		widthBreak: 600,
		marginForLegendTop: 40,
		magicRatio: 0.7,
		magicMoreForY2Axis: 70
	};

	export const axis = {
		maxWidthOfAxisLabel: 175,
		maxNumOfAxisLabelLetters: 60,
		yAxisAngle: -90,
		xAxisAngle: -45,
		domain: {
			color: "#959595",
			strokeWidth: 2
		},
		dx: "-1em",
		label: {
			dy: "1em"
		},
		tick: {
			dy: "0.5em",
			widthAdditionY: 25,
			widthAdditionY2: 15,
			heightAddition: 16,
			maxLetNum: 28
		},
		magicDy1: "0.71em",
		magicY1: 9,
		magicX1: -4
	};

	export const grid = {
		strokeColor: "#ECEEEF"
	};

	export const bars = {
		mouseover: {
			strokeWidth: 4,
			strokeOpacity: 0.5
		},
		mouseout: {
			strokeWidth: 0,
			strokeOpacity: 1
		}
	};

	// export const lines = {
	// 	mouseover: {
	// 		class: "hover-glow",
	// 		r: 5.5,
	// 		fill: "none",
	// 		strokeWidth: 4,
	// 		strokeOpacity: 0.5
	// 	},
	// 	path: {
	// 		fill: "none",
	// 		stroke: "steelblue",
	// 		strokeLinejoin: "round",
	// 		strokeLinecap: "round",
	// 		strokeWidth: 2,
	// 		duration: 700
	// 	},
	// 	dot: {
	// 		r: 3.5,
	// 		fill: "white",
	// 		strokeWidth: 2,
	// 		duration: 500
	// 	}
	// };

	export const pie = {
		maxWidth: 516.6,
		mouseover: {
			strokeWidth: 8,
			strokeOpacity: 0.5
		},
		sliceLimit: 6,
		label: {
			dy: ".32em",
			margin: 15,
			other: "Other"
		}
	};

	export const donut = {
		centerText: {
			title: {
				y: 22
			},
			breakpoint: 175,
			magicScaleRatio: 2.5,
			numberFontSize: 24,
			titleFontSize: 15
		}
	};

	export const legend = {
		countBreak: 4,
		fontSize: 12,
		wrapperHeight: "40px",
		widthTolerance: 15,
		hoverShadowSize: "3px",
		hoverShadowTransparency: 0.2,
		margin: {
			top: 19
		},
		active: {
			borderColor: false,
			borderStyle: false,
			borderWidth: false
		},
		inactive: {
			backgroundColor: "white",
			borderStyle: "solid",
			borderWidth: "2px"
		},
		items: {
			status: {
				ACTIVE: 1,
				DISABLED: 0
			},
		}
	};

	export const tooltip = {
		width: 200,
		arrowWidth: 10,
		magicXPoint2: 20,
		magicTop1: 21,
		magicTop2: 22,
		magicLeft1: 11,
		magicLeft2: 12
	};

	export const selectors = {
		OUTERSVG: "svg.chart-svg",
		INNERWRAP: "g.inner-wrap",
		CHARTWRAPPER: "div.chart-wrapper",
		TOOLTIP: "div.chart-tooltip",
		LEGEND_BTN: "li.legend-btn",
		pie: {
			SLICE: "path"
		}
	};
}
