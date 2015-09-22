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

    function BuildingItem(initmname, buildingurl,jason) {
        var self = this;
        self.Burl = ko.observable(buildingurl);
        self.Bname = ko.observable(initmname);
        self.Jason = ko.observable(jason);
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
           // var something = self.selectedPassiveIcon();
            //use selected passive icon to drive this
            if(self.associatedItem() !== undefined && self.associatedItem() !== null) {
                return self.associatedItem().passiveDetail() + 'SUN.jpg';
            }
        }, self);

        self.passiveFlowDetail2 = ko.computed(function () {
           // var something = self.selectedPassiveIcon();
            //use selected passive icon to drive this
            if(self.associatedItem() !== undefined && self.associatedItem() !== null) {
                return self.associatedItem().passiveDetail() + 'SHADE.jpg';
            }
        }, self);

        self.passiveFlowDetail3 = ko.computed(function () {
            //var something = self.selectedPassiveIcon();
            //use selected passive icon to drive this
            if(self.associatedItem() !== undefined && self.associatedItem() !== null) {
                return self.associatedItem().passiveDetail() + 'FLOW.jpg';
            }
        }, self);

        self.passiveFlowDetail4 = ko.computed(function () {
            //var something = self.selectedPassiveIcon();
            //use selected passive icon to drive this
            if(self.associatedItem() !== undefined && self.associatedItem() !== null) {
                return self.associatedItem().passiveDetail() + 'GAIN.jpg';
            }
        }, self);

        self.fullName = ko.pureComputed(function () {
            return self.associatedItem().Picture();
        }, self);


        var update = function () {
            //put code here. each time a checkbox is marked, this is run.
            //With each run _associatedItemIds contains the ID of each DemoItem that has been checked
            if(self.associatedItem() && self.associatedBuilding()) {
                self.selectedPassiveIcon('base.jpg');
                self.getChartData(self.associatedItem().Url() + self.associatedBuilding().Jason(), self.renderChart);
            }
        };
        self.associatedItem.subscribe(update);
        self.associatedBuilding.subscribe(update);

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
            d3.selectAll("#version").text(dc.version);

            var pieTip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function (d) { return "<span style='color: #f0027f'>" +  d.data.key + "</span> : "  + numberFormat(d.value); });

            ENERGYRingChart
                .width(650).height(650)
                .dimension(LabelDim)
                .renderLabel(false)
                .title(function (d) {
                    return d.key + " : " + d.value.toString();
                })
                .legend(dc.legend().x(200).y(225))
                .group(EnergyPerYear)
                .innerRadius(200)
                .on("filtered", function (chart) {
                    dc.events.trigger(function () {
                        if (chart.filter()) {
                            console.log(chart.filter());
                        }
                        else WeatherFileRowChart.filterAll();
                    });

                })
                .ordinalColors(['aqua','blue','purple','green','#001f3f','#FF851B','red','#3D9970','#FFDC00','maroon','grey']);

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
                d3.selectAll("g.x text")
                    .attr("class", "campusLabel")
                    .style("text-anchor", "end")
                    .attr("transform", "translate(-10,0)rotate(315)");
                d3.selectAll(".pie-slice").call(pieTip);
                d3.selectAll(".pie-slice").on('mouseover', pieTip.show)
                    .on('mouseout', pieTip.hide);

        };

        self.init = function init() {
            self.availableItems.push(
                new DemoItem("datafiles/1a",'Miami','images/3C SAN FRANCISCO/3C_Band.png','images/Passive/Dickinson/','images/Passive/Dickinson/detail/'));
            self.availableItems.push(
                new DemoItem( "datafiles/2a", 'Houston',"images/3C SAN FRANCISCO/3C_Band.png",'images/Passive/Stickney/','images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("datafiles/2b",'Phoenix',"images/2B PHOENIX/2B_Band.png",'images/Passive/Phoenix/','images/Passive/Phoenix/detail/'));
            self.availableItems.push(
                new DemoItem("datafiles/3a", 'Atlanta', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("datafiles/3b", 'Las Vegas', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("datafiles/3c", 'San Francisco', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("datafiles/4a", 'Baltimore', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("datafiles/4b", 'Albuquerque', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("datafiles/4c", 'Portland', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("datafiles/5a", 'Chicago', "images/5A CHICAGO/5A_Band.png", 'images/Passive/Dickinson/', 'images/Passive/Dickinson/detail/'));
            self.availableItems.push(
                new DemoItem("datafiles/5b", 'Boulder', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("datafiles/5c", 'Vancouver', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("datafiles/6a", 'Minneapolis', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("datafiles/6b", 'Helena', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("datafiles/7.json", 'Duluth', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("datafiles/8.json", 'Fairbanks', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));

            self.availableBuildings.push(
                new BuildingItem("BUILDING TYPE I", "images/1A MIAMI/1A_MAX_WR.png",".json"));
            self.availableBuildings.push(
                new BuildingItem("BUILDING TYPE II", "images/2A HOUSTON/2A_MAX_WR.png",".json"));
            self.availableBuildings.push(
                new BuildingItem("BUILDING TYPE III", "images/2B PHOENIX/2B_MAX_WR.png",".json"));

            self.associatedBuilding(self.availableBuildings()[0]);
            self.associatedItem(self.availableItems()[0]);
        };
    }

    var viewModel = new ViewModel();

    viewModel.init();
    ko.applyBindings(viewModel);
    window.viewModel = viewModel;
});
