function DemoItem(id, name) {
    var self = this;

    self.id = ko.observable(id);
    self.Name = ko.observable(name);
    self.Selected = ko.observable(false);
}

self.toggleAssociation = function(item) {
    if (item.Selected() === true) htmlString = "https://rawgit.com/DeeplerSpargle/b531d2790bac3bc4c397/raw/4a255040c002392cb256730578681f7176536c35/Json2.json";
    else htmlString = "https://rawgit.com/DeeplerSpargle/b531d2790bac3bc4c397/raw/4a255040c002392cb256730578681f7176536c35/Json2.json";
    item.Selected(!(item.Selected()));
    return true;
};

function ViewModel() {
    var self = this;
    var htmlString = "https://rawgit.com/DeeplerSpargle/b531d2790bac3bc4c397/raw/dbf7f1bf5e9d48e3f5f0e60012c4ccbb36f9fcd8/JSONEXAM.json";
    self.availableItems = ko.observableArray();
    self.associatedItemIds = ko.observableArray();

    self.init = function() {
        self.availableItems.push(new DemoItem("https://rawgit.com/DeeplerSpargle/b531d2790bac3bc4c397/raw/dbf7f1bf5e9d48e3f5f0e60012c4ccbb36f9fcd8/JSONEXAM.json", 'Miami'));

        self.availableItems.push(new DemoItem("https://rawgit.com/DeeplerSpargle/b531d2790bac3bc4c397/raw/4a255040c002392cb256730578681f7176536c35/Json2.json", 'Dallas'));
        self.availableItems.push(new DemoItem("URL HERE", 'Chicago'));
        self.availableItems.push(new DemoItem("URL HERE", 'Denver'));
        self.availableItems.push(new DemoItem("URL HERE", 'SanteFe'));

    };

    $.get(htmlString, null,

        function(MiamiData2) {

            var ENERGYRingChart = dc.pieChart("#chart-ring-ENERGY"),
                ENERGY2RingChart = dc.pieChart("#chart-ring-ENERGY2"),
                CZRowChart = dc.rowChart("#chart-row-CZ");

            // use static or load via d3.csv

            //var _data = nul

            var MiamiData = MiamiData2;

            // set crossfilter
            var ndx = crossfilter(MiamiData);

            LabelDim = ndx.dimension(function(d) {

                return d.Label;
            }),
                HeatingDim = ndx.dimension(function(d) {
                    return +d.Heat;
                }),

                WFDim = ndx.dimension(function(d) {
                    return d.WF;
                }),
                EnergyPerYear = LabelDim.group().reduceSum(function(d) {
                    return +d.Heat;

                }),
                HeatingPerYear = HeatingDim.group().reduceSum(function(d) {
                    return +d.Heat;

                }),

                PerZone = WFDim.group().reduceSum(function(d) {
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

        }, "json");

}

var viewModel = new ViewModel();
ko.applyBindings(viewModel);
viewModel.init();