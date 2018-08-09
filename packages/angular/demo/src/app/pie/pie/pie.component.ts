import { Component, OnInit, ViewChild } from "@angular/core";

import { colors, randomizeValue } from "../../../helpers/commons";
import { Input } from "@angular/core";

@Component({
	selector: "app-pie-donut",
	templateUrl: "./pie.component.html"
})
export class PieComponent implements OnInit {
	@ViewChild("pieChart") pieChart;

	pieOptions = {
		accessibility: false,
		legendClickable: true,
		containerResizable: true,
		colors
	};

  @Input() pieData = {};

	constructor() { }

	ngOnInit() { }

	changeDemoData() {
		const oldData = this.pieChart.data;

		// Randomize old data values
		const newData = Object.assign({}, oldData);
		newData.datasets = oldData.datasets.map(dataset => {
			const datasetNewData = dataset.data.map(dataPoint => randomizeValue(dataPoint));

			const newDataset = Object.assign({}, dataset, { data: datasetNewData });

			return newDataset;
		});

		this.pieData = newData;
	}
}
