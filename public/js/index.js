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
                WeatherFileRowChart = dc.rowChart("#chart-row-CZ");

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
                    return d.name + " : " + d.value + "KW";
                })
                .legend(dc.legend().x(250).y(200))
                .group(EnergyPerYear)
                .innerRadius(150)
                .on("filtered", function (chart) {
                    dc.events.trigger(function () {
                        if(chart.filter()) {
                            console.log(chart.filter());

                        }
                        else WeatherFileRowChart.filterAll();
                    });
                });


            ENERGY2RingChart
                .width(200).height(200)
                .dimension(HeatingDim)
                .group(HeatingPerYear)
                .innerRadius(50);

            WeatherFileRowChart
                .width(280).height(200)
                .dimension(WFDim)
                .group(PerZone)
                .elasticX(true)
                .renderlet(function (chart) {
                    ENERGYRingChart.filter(chart.filter());
                })
                .on("postRedraw", function (chart) {
                    dc.events.trigger(function () {
                        ENERGYRingChart.filter(chart.filter());
                    });
                });


            dc.renderAll();
        };

        self.init = function init() {
            self.availableItems.push(new DemoItem("datafiles/1a.json", 'Miami',     'images/1A MIAMI/Climate Files.jpg'));
            self.availableItems.push(new DemoItem("datafiles/2a.json", 'Houston',    "images/2A HOUSTON/Climate Files2.jpg"));
            self.availableItems.push(new DemoItem("datafiles/5a.json", 'Phoenix',   "images/2B PHOENIX/Climate Files3.jpg"));
            self.availableItems.push(new DemoItem("datafiles/2b.json", 'Atlanta',    "images/3A ATLANTA/Climate Files4.jpg"));
            self.availableItems.push(new DemoItem("datafiles/2b.json", 'Las Vegas',   "images/3B LAS VEGAS/Climate Files5.jpg"));
            self.availableItems.push(new DemoItem("datafiles/2a.json", 'San Francisco',    "images/3C SAN FRANCISCO/Climate Files6.jpg"));
            self.availableItems.push(new DemoItem("datafiles/5a.json", 'Baltimore',   "images/4A BALTIMORE/Climate Files7.jpg"));
            self.availableItems.push(new DemoItem("datafiles/2b.json", 'Albuquerque',    "images/4B ALBUQUERQUE/Climate Files8.jpg"));
            self.availableItems.push(new DemoItem("datafiles/2b.json", 'Portland',   "images/4C PORTLAND/Climate Files9.jpg"));



            self.availableBuildings.push(new BuildingItem("BUILDING TYPE I","images/1A MIAMI/1A_MAX_WR.png"));
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