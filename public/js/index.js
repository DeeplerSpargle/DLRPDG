$(function () {
    function DemoItem(url, name, picture, passivebuildingurl, passiveDetailUrl) {
        var self = this;
        self.Url = ko.observable(url);
        self.Name = ko.observable(name);
        self.Picture = ko.observable(picture);
        self.passivePicture = ko.observable(passivebuildingurl);
        self.passiveDetail = ko.observable(passiveDetailUrl);
        self.Selected = ko.observable(false);
    }

    function BuildingItem(initmname, buildingurl, jason) {
        var self = this;
        self.Burl = ko.observable(buildingurl);
        self.Bname = ko.observable(initmname);
        self.Jason = ko.observable(jason);
    }

    function LoadItem(loadname, loadurl, loadjason) {
        var self = this;
        self.Lurl = ko.observable(loadurl);
        self.Lname = ko.observable(loadname);
        self.LaverageNum = ko.observable(loadjason);
    }

    function WeatherItem(weathername, weatherurl, weatherjason) {
        var self = this;
        self.Wurl = ko.observable(weatherurl);
        self.Wname = ko.observable(weathername);
        self.WJason = ko.observable(weatherjason);
    }

    function ViewModel() {
        var self = this;
        self.availableItems = ko.observableArray();
        self.associatedItem = ko.observable();
        self.availableBuildings = ko.observableArray();
        self.associatedBuilding = ko.observable();
        self.availableLoads = ko.observableArray();
        self.associatedLoad = ko.observable();
        self.availableWeatherfiles = ko.observableArray();
        self.associatedWeatherFile = ko.observable();
        self.selectedChoice = ko.observable();
        self.selectedChoiceWeather = ko.observable();
        self.selectedChoiceLoad = ko.observable();
        self.selectedPassiveIcon = ko.observable("base.jpg");


        self.setAccessory = function setAccessory(selectedPassive, data, event) {
            self.selectedPassiveIcon(selectedPassive);
        };

        self.passiveFlow = ko.computed(function () {
            var something = self.selectedPassiveIcon();
            //use selected passive icon to drive this
            if (self.associatedItem() !== undefined && self.associatedItem() !== null) {
                return self.associatedItem().passivePicture() + something;
            }
        }, self);

        self.passiveFlowDetail = ko.computed(function () {
            // var something = self.selectedPassiveIcon();
            //use selected passive icon to drive this
            if (self.associatedItem() !== undefined && self.associatedItem() !== null) {
                return self.associatedItem().passiveDetail() + 'SUN.jpg';
            }
        }, self);

        self.passiveFlowDetail2 = ko.computed(function () {
            // var something = self.selectedPassiveIcon();
            //use selected passive icon to drive this
            if (self.associatedItem() !== undefined && self.associatedItem() !== null) {
                return self.associatedItem().passiveDetail() + 'SHADE.jpg';
            }
        }, self);

        self.passiveFlowDetail3 = ko.computed(function () {
            //var something = self.selectedPassiveIcon();
            //use selected passive icon to drive this
            if (self.associatedItem() !== undefined && self.associatedItem() !== null) {
                return self.associatedItem().passiveDetail() + 'FLOW.jpg';
            }
        }, self);

        self.passiveFlowDetail4 = ko.computed(function () {
            //var something = self.selectedPassiveIcon();
            //use selected passive icon to drive this
            if (self.associatedItem() !== undefined && self.associatedItem() !== null) {
                return self.associatedItem().passiveDetail() + 'GAIN.jpg';
            }
        }, self);

        self.fullName = ko.pureComputed(function () {
            return self.associatedItem().Picture();
        }, self);


        var update = function () {
            //put code here. each time a checkbox is marked, this is run.
            //With each run _associatedItemIds contains the ID of each DemoItem that has been checked
            if (self.associatedItem() && self.associatedBuilding() && self.associatedWeatherFile() && self.associatedLoad()) {
                self.selectedPassiveIcon('base.jpg');
                self.getChartData('datafiles' + self.associatedItem().Url() + self.associatedBuilding().Jason(), self.renderChart);
                self.getChartData2('datafiles' + self.associatedBuilding().Burl() + self.associatedLoad().Lurl() + self.associatedItem().Url() + self.associatedWeatherFile().Wurl(), self.renderChart2);

            }
        };
        self.associatedItem.subscribe(update);
        self.associatedBuilding.subscribe(update);
        self.associatedWeatherFile.subscribe(update);
        self.associatedLoad.subscribe(update);

        self.getChartData = function (url, callback) {
            $.get(url, null, callback, "json");
        };

        self.getChartData2 = function (url, callback) {
            $.get(url, null, callback, "json");
        };

        self.renderChart = function (chartData) {
            var ENERGYRingChart = dc.pieChart("#chart-ring-ENERGY"),
                ENERGY2RingChart = dc.pieChart("#chart-ring-ENERGY2"),
                WeatherFileRowChart = dc.rowChart("#chart-row-CZ");
            var dataTable = dc.dataTable("#dc-table-graph");

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

            ENERGYRingChart
                .width(1000).height(375)
                .dimension(LabelDim)
                .renderLabel(false)
                .title(function (d) {
                    return d.key + " : " + d.value.toString();
                })
                .legend(dc.legend().x(10).y(50).itemHeight(16))

                .group(EnergyPerYear)
                .innerRadius(150)

                .on("filtered", function (chart) {
                    dc.events.trigger(function () {
                        if (chart.filter()) {
                            console.log(chart.filter());
                        }
                        else WeatherFileRowChart.filterAll();
                    });

                })
                .ordinalColors(['aqua', 'blue', 'purple', 'green', '#001f3f', '#FF851B', 'red', '#3D9970', '#FFDC00', 'maroon', 'grey']);

            ENERGY2RingChart
                .width(200).height(200)
                .dimension(HeatingDim)
                .group(HeatingPerYear)
                .innerRadius(50);

            WeatherFileRowChart
                .width(500).height(300)
                .dimension(WFDim)
                .title(function (d) {
                    return d.key + " : " + d.value + "kBtu";
                })
                .renderLabel(true)
                .group(PerZone)
                .elasticX(true)
            WeatherFileRowChart.on("renderlet", (function (chart) {
                ENERGYRingChart.filter(chart.filter());
            }))
                .on("postRedraw", function (chart) {
                    dc.events.trigger(function () {
                        ENERGYRingChart.filter(chart.filter());
                    });
                })
                .xAxis().ticks(5);

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

        };

        self.renderChart2 = function (chartData) {
            var DisRowChart = dc.rowChart("#chart-row-1");
            var peakcLoadChart = dc.barChart('#peakcooling-chart');
            var peakhLoadChart = dc.barChart('#peakheating-chart');
            var DisDisplay = dc.numberDisplay('#Dis-chart');
            var EUIDisplay = dc.numberDisplay('#EUI-chart');
            var UHCDisplay = dc.numberDisplay('#UHC-chart');
            //var UHHDisplay = dc.numberDisplay('#UHH-chart');
            // use static or load via d3.csv
            // set crossfilter
            var ndx = crossfilter(chartData);
            EUIDim = ndx.dimension(function (d) {
                return d.EUI;
            });

            LocationDim = ndx.dimension(function (d) {
                return d.Location;
            });

            PerLocation = LocationDim.group().reduceSum(function (d) {
                return +d.DIS;
            });

            peakcDim = ndx.dimension(function (d) {
                return d.PeakcLabel;
            });

            peakcGroup = peakcDim.group().reduceSum(function (d) {
                return d.PeakCoolingLoad /self.associatedLoad().LaverageNum();
            });
            peakhDim = ndx.dimension(function (d) {
                return d.PeakhLabel;
            });

            peakhGroup = peakhDim.group().reduceSum(function (d) {
                return d.PeakHeatingLoad/self.associatedLoad().LaverageNum() ;
            });

            EUIGroup = LocationDim.group().reduceSum(function (d) {
                return +d.EUI;
            });

            UnmetHoursCoolingDim = ndx.dimension(function (d) {
                return d.UnmetHoursCooling;
            });

            UnmetHoursCoolingGroup = LocationDim.group().reduceSum(function (d) {
                return +d.UnmetHoursCooling;
            });




            d3.selectAll("#version").text(dc.version);

            EUIDisplay.group(EUIGroup)
                .formatNumber(d3.format(".g"))
                .valueAccessor(function (d) {
                    return d.value
                });
            UHCDisplay.group(UnmetHoursCoolingGroup)
                .formatNumber(d3.format(".g"))
                .valueAccessor(function (d) {
                    return d.value
                });


            DisDisplay.group(PerLocation)
                .formatNumber(d3.format(".g"))
                .valueAccessor(function (d) {
                    return d.value
                });


            peakcLoadChart/* dc.barChart('#volume-month-chart', 'chartGroup') */
                .width(200)
                .height(300)
                .x(d3.scale.ordinal())
                .xUnits(dc.units.ordinal)
                //.xUnits(function(){return 1;})
                .brushOn(true)
                .dimension(peakcDim)
                .barPadding(0.5)
                .outerPadding(0.3)
                .group(peakcGroup)
                .renderHorizontalGridLines(true)
                .margins({top: 15, right: 0, bottom: 80, left: 60})
                .y(d3.scale.linear().domain([0, 5000000]))
                .yAxisLabel("kBtu")
                .yAxis().ticks(8);
            //peakLoadChart.on("renderlet",(function(peakLoadChart){
            //    var colors =d3.scale.ordinal().domain(["PeakHeatingLoad", "PeakCoolingLoad"])
            //        .range(["orange", "red"]);
            //    peakLoadChart.selectAll('rect.bar').each(function(d){
            //        d3.select(this).attr("style", "fill: " + colors(d.key)); // use key accessor if you are using a custom accessor
            //    });
            //}));
            peakcLoadChart.on("renderlet", (function (peakcLoadChart) {
                peakcLoadChart.selectAll("rect.bar").attr("fill", function (d) {
                    if (d.key == "red")
                        return "green";
                    else
                        return "blue";

                });
            }));
            peakhLoadChart/* dc.barChart('#volume-month-chart', 'chartGroup') */
                .width(200)
                .height(300)
                .x(d3.scale.ordinal())
                .xUnits(dc.units.ordinal)
                .y(d3.scale.linear().domain([0, 5000000]))
                //.xUnits(function(){return 1;})
                .brushOn(true)
                .dimension(peakhDim)
                .barPadding(0.1)
                .outerPadding(0.3)
                .group(peakhGroup)
                .margins({top: 15, right: 0, bottom: 80, left: 60})
                .yAxisLabel("kBtu")
                .renderHorizontalGridLines(true)

                .yAxis().ticks(8);
            //peakhLoadChart.ordinalColors(["#6a51a3", "#2171b5", "#238b45", "#d94801", "#cb181d"]);


            DisRowChart
                .width(500).height(300)
                .dimension(LocationDim)
                .title(function (d) {
                    return d.key + " : " + d.value + "% Dissatisfied";
                })
                .renderLabel(true)
                .group(PerLocation)
                .elasticX(false)
                .margins({top: 15, right: 20, bottom: 80, left: 20})
                .xAxis().ticks(10);
            DisRowChart.x(d3.scale.linear().range([0,(DisRowChart.width()-50)]).domain([0,100]));
            DisRowChart.xAxis().scale(DisRowChart.x());

            dc.renderAll();
            d3.selectAll("g.x text")
                .attr("class", "campusLabel")
                .style("text-anchor", "end")
                .attr("transform", "translate(-10,0)rotate(310)");


        };

        self.init = function init() {
            self.availableItems.push(
                new DemoItem("/1a", 'Miami', 'images/3C SAN FRANCISCO/3C_Band.png', 'images/Passive/Dickinson/', 'images/Passive/Dickinson/detail/'));
            self.availableItems.push(
                new DemoItem("/2a", 'Houston', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("/2b", 'Phoenix', "images/2B PHOENIX/2B_Band.png", 'images/Passive/Phoenix/', 'images/Passive/Phoenix/detail/'));
            self.availableItems.push(
                new DemoItem("/3a", 'Atlanta', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("/3b", 'Las Vegas', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("/3c", 'San Francisco', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("/4a", 'Baltimore', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("/4b", 'Albuquerque', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("/4c", 'Portland', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("/5a", 'Chicago', "images/5A CHICAGO/5A_Band.png", 'images/Passive/Dickinson/', 'images/Passive/Dickinson/detail/'));
            self.availableItems.push(
                new DemoItem("/5b", 'Boulder', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("/5c", 'Vancouver', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("/6a", 'Minneapolis', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("/6b", 'Helena', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("/7", 'Duluth', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));
            self.availableItems.push(
                new DemoItem("/8", 'Fairbanks', "images/3C SAN FRANCISCO/3C_Band.png", 'images/Passive/Stickney/', 'images/Passive/Stickney/detail/'));

            self.availableBuildings.push(
                new BuildingItem("Primary", "/Secondary", ".json"));
            self.availableBuildings.push(
                new BuildingItem("Secondary", "/Secondary", ".json"));

            self.availableWeatherfiles.push(
                new WeatherItem("TMY2 DOE", "/tmy2.json", "on"));
            self.availableWeatherfiles.push(
                new WeatherItem("TMY3 DOE", "/tmy3.json", "on"));
            self.availableWeatherfiles.push(
                new WeatherItem("TMY3 WA", "/tmy3wa.json", "on"));
            self.availableWeatherfiles.push(
                new WeatherItem("TMY7 WA", "/tmy7wa.json", "on"));
            self.availableWeatherfiles.push(
                new WeatherItem("TMY15 WA", "/tmy15wa.json", "on"));
            self.availableWeatherfiles.push(
                new WeatherItem("XMY MIN WA", "/min.json", "on"));
            self.availableWeatherfiles.push(
                new WeatherItem("XMY MAX WA", "/max.json", "on"));


            self.availableLoads.push(
                new LoadItem("BASELINE", "/BASE", "6"));
            self.availableLoads.push(
                new LoadItem("2010 Lighting Power Density", "/2010LPD", "6"));
            self.availableLoads.push(
                new LoadItem("Internal Lighting Reduction", "/2010LPD", "6"));
            self.availableLoads.push(
                new LoadItem("21st Century Classroom", "/21C", "8"));

            self.associatedWeatherFile(self.availableWeatherfiles()[0]);
            self.associatedBuilding(self.availableBuildings()[0]);
            self.associatedItem(self.availableItems()[0]);
            self.associatedLoad(self.availableLoads()[0]);
        };
    }

    var viewModel = new ViewModel();
    viewModel.init();
    ko.applyBindings(viewModel);
    window.viewModel = viewModel;
});
