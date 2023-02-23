var worldBankRegionMap = new Map();
var globalDevelopmentData;
var worldBankRegionMap;
var southAsiaData = [];
var euCentralAsiaData = [];
var midEastData = [];
var africaData = [];
var caribbeanData = [];
var eastAsiaData = [];
var northAmericaData = [];
var lineChartData;

document.addEventListener('DOMContentLoaded', function () {
    // Hint: create or set your svg element inside this function
     
    // Loading two CSV files and store them into two arrays.
    Promise.all([d3.csv('data/countries_regions.csv'),d3.csv('data/global_development.csv')])
         .then(function (values) {
            countriesRegions = values[0];
            globalDevelopment = values[1];
            
            //Wrangling the data
            countriesRegions.forEach(d => {
                if (!worldBankRegionMap.has(d["name"])) {
                    worldBankRegionMap.set(d["name"], d["World bank region"]);
                }
            })
                
            globalDevelopmentData = globalDevelopment.map(function(d) {
             return {
                country: d.Country,
                year: +d.Year,
                birth_rate: +d["Data.Health.Birth Rate"],
                death_rate: +d["Data.Health.Death Rate"],
                fertility_rate: +d["Data.Health.Fertility Rate"],
                life_exp_female: +d["Data.Health.Life Expectancy at Birth, Female"],
                life_exp_male: +d["Data.Health.Life Expectancy at Birth, Male"],
                life_exp_total: +d["Data.Health.Life Expectancy at Birth, Total"],
                pop_growth: +d["Data.Health.Population Growth"],
                total_growth: +d["Data.Health.Total Population"],
                cell_subs: +d["Data.Infrastructure.Mobile Cellular Subscriptions"],
                cell_subs_per_100: +d["Data.Infrastructure.Mobile Cellular Subscriptions per 100 People"],

             }
             });
             splitGlobalDataIntoRegions();
             drawLineChart();
         });
 });

 function drawLineChart() {
    getDataToDisplay();
    const svg = d3.select('svg');
    // get the width and height of the SVG
    const width = +svg.style('width').replace('px','');
    const height = +svg.style('height').replace('px','');
    // adding padding around the chart
    const margin = { top:50, bottom: 50, right: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const selectedAttribute = document.getElementById('attribute-select').value;

    var slider = document.getElementById("opacity-control");
    console.log(slider.value);

    // set start and end dates for x axis
    const startYear = new Date(1980, 0, 0, 0, 0, 0, 0);
    const endYear = new Date(2014, 0, 0, 0, 0, 0, 0);
    console.log(lineChartData);
    // get max female employment rate for current country
    var maxAttrValue = d3.max(lineChartData, function(d) { return d[selectedAttribute]})

    const xScale = d3.scaleTime()
                    .domain([startYear, endYear]) // data space
                    .range([0, innerWidth]); // pixel space

    const yScale = d3.scaleLinear()
                    .domain([0, maxAttrValue]) // data space
                    .range([innerHeight, 0 ]); // pixel space
    const g = svg.append('g')
    .attr('transform', 'translate('+margin.left+', '+margin.top+')');;
    const yAxis = d3.axisLeft(yScale);

    // defining the x-axis and y-axis
    g.append('g').call(yAxis);
    const xAxis = d3.axisBottom(xScale);
    g.append('g').call(xAxis)
                    .attr('transform',`translate(0,${innerHeight})`)
    
    g.selectAll("path")
    .datum(lineChartData)
    .join(
        enter => enter.append("path").attr("class", "line"),
        update => update,
        exit => exit.remove()
    )
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
                .x(function(d) { return xScale(new Date(d.year, 0, 0, 0, 0, 0, 0)) })
                .y(function(d) { return yScale(d[selectedAttribute]) })
            )

 }

 function selectAll() {
    if (document.getElementById("check1").checked) {
        document.getElementById("check3").checked = true;
        document.getElementById("check4").checked = true;
        document.getElementById("check5").checked = true;
        document.getElementById("check6").checked = true;
        document.getElementById("check7").checked = true;
        document.getElementById("check8").checked = true;
        document.getElementById("check9").checked = true;
    }
    getDataToDisplay();
 }

 function deselectAll() {
    if (document.getElementById("check2").checked) {
        document.getElementById("check3").checked = false;
        document.getElementById("check4").checked = false;
        document.getElementById("check5").checked = false;
        document.getElementById("check6").checked = false;
        document.getElementById("check7").checked = false;
        document.getElementById("check8").checked = false;
        document.getElementById("check9").checked = false;
    }
    lineChartData = [];
 }

 function splitGlobalDataIntoRegions() {
    globalDevelopmentData.forEach(function (item) {
        let country = item["country"];
        let region = worldBankRegionMap.get(country);
        if (region == "South Asia") {
            southAsiaData.push(item);
        } else if (region == "Europe & Central Asia") {
            euCentralAsiaData.push(item);
        } else if (region == "Middle East & North Africa") {
            midEastData.push(item);
        } else if (region == "Sub-Saharan Africa") {
            africaData.push(item);
        } else if (region == "Latin America & Caribbean") {
            caribbeanData.push(item);
        } else if (region == "East Asia & Pacific") {
            eastAsiaData.push(item);
        } else if (region == "North America") {
            northAmericaData.push(item);
        }    
    });      
}

function getDataToDisplay() {
    // deselect the deselect All button if any other checkbox is clicked
    document.getElementById("check2").checked = false

    // initialise data
    lineChartData = []
    if (document.getElementById("check3").checked) {
        lineChartData = lineChartData.concat(southAsiaData);
    }
    if (document.getElementById("check4").checked) {
        lineChartData = lineChartData.concat(euCentralAsiaData);
    }
    if (document.getElementById("check5").checked) {
        lineChartData = lineChartData.concat(midEastData);
    }
    if (document.getElementById("check6").checked) {
        lineChartData = lineChartData.concat(africaData);
    }
    if (document.getElementById("check7").checked) {
        lineChartData = lineChartData.concat(caribbeanData);
    }
    if (document.getElementById("check8").checked) {
        lineChartData = lineChartData.concat(eastAsiaData);
    }
    if (document.getElementById("check9").checked) {
        lineChartData = lineChartData.concat(northAmericaData);
    }
    console.log(lineChartData.length)
}