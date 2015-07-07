$(function () {
    function DemoItem(url, name, picture) {
        var self = this;

        self.Url = ko.observable(url);
        self.Name = ko.observable(name);
        self.Picture = ko.observable(picture);
        self.Selected = ko.observable(false);

    }
    function BuildingItem(initmname,buildingurl) {
        var self = this;

        self.Burl = ko.observable(buildingurl);
        self.Bname = ko.observable(initmname);


    }



    function ViewModel() {
        var self = this;
        self.availableItems = ko.observableArray();
        self.associatedItem = ko.observable();
        self.availableBuildings = ko.observableArray();
        self.associatedBuilding = ko.observable();
        self.selectedChoice = ko.observable();



        self.fullName = ko.pureComputed(function(){
            return self.associatedItem().Picture();

        },self);


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
            });

            HeatingDim = ndx.dimension(function (d) {
                return +d.Heat;
            });

            WFDim = ndx.dimension(function (d) {
                return d.WF;
            });

            EnergyPerYear = LabelDim.group().reduceSum(function (d) {
                return +d.Heat;
            });
            HeatingPerYear = HeatingDim.group().reduceSum(function (d) {
                return +d.Heat;
            });

            PerZone = WFDim.group().reduceSum(function (d) {
                return +d.Heat;
            });

            ENERGYRingChart
                .width(600).height(600)
                .dimension(LabelDim)
                .title(function (d) {
                    return d.Label + " : " + d.value + "KW";
                })
                .legend(dc.legend().x(250).y(200))
                .group(EnergyPerYear)
                .innerRadius(150);

            ENERGY2RingChart
                .width(200).height(200)
                .dimension(HeatingDim)
                .group(HeatingPerYear)
                .innerRadius(50);

            CZRowChart
                .width(280).height(200)
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
            self.availableItems.push(new DemoItem("datafiles/1a.json", 'Miami', 'images/lamb.jpg'));
            self.availableItems.push(new DemoItem("datafiles/2a.json", 'Daluth', "images/kitten.png"));
            self.availableItems.push(new DemoItem("datafiles/5a.json", 'Chicago', "images/kitten.png"));
            self.availableItems.push(new DemoItem("datafiles/2b.json", 'Denver', "images/kitten.png"));
            self.availableItems.push(new DemoItem("datafiles/2b.json", 'SanteFe', "images/kitten.png"));

            self.availableBuildings.push(new BuildingItem("BUILDING TYPE I","images/lamb.jpg"));
            self.availableBuildings.push(new BuildingItem("BUILDING TYPE II","images/kitten.png"));
            self.availableBuildings.push(new BuildingItem("BUILDING TYPE III","images/lamb.jpg"));

            self.associatedBuilding(self.availableBuildings()[0]);

            self.associatedItem(self.availableItems()[0]);
        };
    }

    var viewModel = new ViewModel();

    viewModel.init();
    ko.applyBindings(viewModel);
    window.viewModel = viewModel;
});