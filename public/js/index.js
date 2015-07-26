$(function () {
    function DemoItem(url, name, picture, passivebuildingurl,passiveDetailUrl) {
        var self = this;

        self.Url = ko.observable(url);
        self.Name = ko.observable(name);
        self.Picture = ko.observable(picture);
        self.passivePicture = ko.observable(passivebuildingurl);
        self.passiveDetail = ko.observable(passiveDetailUrl);
        self.Selected = ko.observable(false);

    }

    function BuildingItem(initmname, buildingurl) {
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

        self.selectedPassiveIcon = ko.observable("base.jpg");

        self.setAccessory = function setAccessory(selectedPassive, data, event) {
            self.selectedPassiveIcon(selectedPassive);
        };

        self.passiveFlow = ko.computed(function () {

            var something = self.selectedPassiveIcon();
            //use selected passive icon to drive this
            if(self.associatedItem() !== undefined && self.associatedItem() !== null) {
                return self.associatedItem().passivePicture() + something;
            }
        }, self);

        self.passiveFlowDetail = ko.computed(function () {

            var something = self.selectedPassiveIcon();
            //use selected passive icon to drive this
            if(self.associatedItem() !== undefined && self.associatedItem() !== null) {
                return self.associatedItem().passiveDetail() + something;
            }
        }, self);


        self.fullName = ko.pureComputed(function () {
            return self.associatedItem().Picture();

        }, self);


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
            dataTable = dc.dataTable("#dc-table-graph");
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
                .width(450).height(500)
                .dimension(LabelDim)
                .renderLabel(false)
                .title(function (d) {
                    return d.key + " : " + d.value.toString();
                })
                .legend(dc.legend().x(150).y(150))
                .group(EnergyPerYear)
                .innerRadius(150)
                .on("filtered", function (chart) {
                    dc.events.trigger(function () {
                        if (chart.filter()) {
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
                .width(300).height(200)
                .dimension(WFDim)
                .title(function (d) {
                    return d.key + " : " + d.value + "KW";
                })
                .renderLabel(true)
                .group(PerZone)
                .elasticX(true)
                .renderlet(function (chart) {
                    ENERGYRingChart.filter(chart.filter());
                })
                .on("postRedraw", function (chart) {
                    dc.events.trigger(function () {
                        ENERGYRingChart.filter(chart.filter());
                    });
                })
                .xAxis().ticks(4);

            dataTable
                .width(800)
                .height(800)
                .dimension(HeatingDim)
                .group(function (d) {
                    return "List of all Selected"
                })
                .size(100)
                .columns([
                    function (d) {
                        return d.WF;
                    },
                    function (d) {
                        return d.Label;
                    },
                    function (d) {
                        return d.Heat;
                    }

                ])
                .sortBy(function (d) {
                    return d.WF;
                })
                // (optional) sort order, :default ascending
                .order(d3.ascending);


            dc.renderAll();

        };

        self.init = function init() {
            self.availableItems.push(new DemoItem("datafiles/1a.json", 'Miami', 'images/1A MIAMI/Climate Files.jpg', 'images/Passive/Dickinson/','images/Passive/Dickinson/detail/'));
            self.availableItems.push(new DemoItem("datafiles/2a.json", 'Houston', "images/2A HOUSTON/Climate Files2.jpg", 'images/Passive/Stickney/','images/Passive/Stickney/detail/'));
            self.availableItems.push(new DemoItem("datafiles/2b.json", 'Phoenix', "images/2B PHOENIX/Climate Files3.jpg", 'images/Passive/Phoenix/','images/Passive/Phoenix/detail/'));
            self.availableItems.push(new DemoItem("datafiles/3a.json", 'Atlanta', "images/3A ATLANTA/Climate Files4.jpg", 'images/Passive/'));
            self.availableItems.push(new DemoItem("datafiles/3b.json", 'Las Vegas', "images/3B LAS VEGAS/Climate Files5.jpg", 'images/Passive/'));
            self.availableItems.push(new DemoItem("datafiles/3c.json", 'San Francisco', "images/3C SAN FRANCISCO/Climate Files6.jpg", 'images/Passive/'));
            //self.availableItems.push(new DemoItem("datafiles/4a.json", 'Baltimore',   "images/4A BALTIMORE/Climate Files7.jpg"));
            //self.availableItems.push(new DemoItem("datafiles/4b.json", 'Albuquerque',    "images/4B ALBUQUERQUE/Climate Files8.jpg"));
            //self.availableItems.push(new DemoItem("datafiles/4c.json", 'Portland',   "images/4C PORTLAND/Climate Files9.jpg"));
            //self.availableItems.push(new DemoItem("datafiles/5a.json", 'Chicago',    "images/5A CHICAGO/Climate Files10.jpg"));
            //self.availableItems.push(new DemoItem("datafiles/5b.json", 'Boulder',   "images/5B BOULDER/Climate Files11.jpg"));
            //self.availableItems.push(new DemoItem("datafiles/5c.json", 'Vancouver',    "images/5C VANCOUVER/Climate Files12.jpg"));
            //self.availableItems.push(new DemoItem("datafiles/6a.json", 'Minneapolis',   "images/6A MINNEAPOLIS/Climate Files13.jpg"));
            //self.availableItems.push(new DemoItem("datafiles/6b.json", 'Helena',   "images/6B HELENA/Climate Files14.jpg"));
            //self.availableItems.push(new DemoItem("datafiles/7.json", 'Duluth',    "images/7 DULUTH/Climate Files15.jpg"));
            //self.availableItems.push(new DemoItem("datafiles/8.json", 'Fairbanks',   "images/8 FAIRBANKS/Climate Files16.jpg"));

            self.availableBuildings.push(new BuildingItem("BUILDING TYPE I", "images/1A MIAMI/1A_MAX_WR.png"));
            self.availableBuildings.push(new BuildingItem("BUILDING TYPE II", "images/2A HOUSTON/2A_MAX_WR.png"));
            self.availableBuildings.push(new BuildingItem("BUILDING TYPE III", "images/2B PHOENIX/2B_MAX_WR.png"));

            self.associatedBuilding(self.availableBuildings()[0]);
            self.associatedItem(self.availableItems()[0]);
        };
    }

    var viewModel = new ViewModel();

    viewModel.init();
    ko.applyBindings(viewModel);
    window.viewModel = viewModel;
});