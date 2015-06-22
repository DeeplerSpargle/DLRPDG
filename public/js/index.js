$(function () {

    function DemoItem(url, name) {
        var self = this;

        self.Url = ko.observable(url);
        self.Name = ko.observable(name);
        self.Selected = ko.observable(false);

    }

    function ViewModel() {
        var self = this;
        self.availableItems = ko.observableArray();
        self.associatedItem = ko.observable();


        self.associatedItem.subscribe(function (_associatedItem) {
            //put code here. each time a checkbox is marked, this is run.
            //With each run _associatedItemIds contains the ID of each DemoItem that has been checked

            self.getChartData(_associatedItem.Url(), self.renderChart);

        });


        self.getChartData = function (url, callback) {
            $.get(url, null, callback, "json");
        };

        self.renderChart = function (chartData) {
            var ENERGYRingChart = dc.pieChart("#chart-ring-ENERGY"),
                ENERGY2RingChart = dc.pieChart("#chart-ring-ENERGY2"),
                CZRowChart = dc.rowChart("#chart-row-CZ");

            // use static or load via d3.csv

            // set crossfilter
            var ndx = crossfilter(chartData);

            LabelDim = ndx.dimension(function (d) {

                return d.Label;
            }),
                HeatingDim = ndx.dimension(function (d) {
                    return +d.Heat;
                }),

                WFDim = ndx.dimension(function (d) {
                    return d.WF;
                }),
                EnergyPerYear = LabelDim.group().reduceSum(function (d) {
                    return +d.Heat;

                }),
                HeatingPerYear = HeatingDim.group().reduceSum(function (d) {
                    return +d.Heat;

                }),

                PerZone = WFDim.group().reduceSum(function (d) {
                    return +d.Heat;
                }),

                ENERGYRingChart
                    .width(600).height(600)
                    .dimension(LabelDim)
                    .group(EnergyPerYear)
                    .innerRadius(100);

            ENERGY2RingChart
                .width(200).height(200)
                .dimension(HeatingDim)
                .group(HeatingPerYear)
                .innerRadius(50);

            CZRowChart
                .width(300).height(200)
                .dimension(WFDim)
                .group(PerZone)
                .elasticX(true);
            //.renderlet(function(chart) {
            //    ENERGYRingChart.filter(chart.filter());
            //})
            //.on("filtered", function(chart) {
            //    dc.events.trigger(function() {
            //        ENERGYRingChart.filter(chart.filter());
            //    });
            //});

            dc.renderAll();
        };

        self.init = function init() {
            self.availableItems.push(new DemoItem("datafiles/JSONEXAM.json", 'Miami'));
            self.availableItems.push(new DemoItem("https://rawgit.com/DeeplerSpargle/b531d2790bac3bc4c397/raw/4a255040c002392cb256730578681f7176536c35/Json2.json", 'Dallas'));
            self.availableItems.push(new DemoItem("http://www.w3schools.com/html/pic_mountain.jpg", 'Chicago'));
            self.availableItems.push(new DemoItem("URL HERE", 'Denver'));
            self.availableItems.push(new DemoItem("URL HERE", 'SanteFe'));

            self.associatedItem(self.availableItems()[0]);
        };
    }

    var viewModel = new ViewModel();
    ko.applyBindings(viewModel);
    viewModel.init();
    window.viewModel = viewModel;
});