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
var lineOpacity = "0.25";
var lineOpacityHover = "0.85";
var otherLinesOpacityHover = "0.1";
var lineStroke = "2px";

var circleOpacity = '0.85';
var circleOpacityOnLineHover = "0.25"
var circleRadius = 3;
var circleRadiusHover = 6;
var duration = 250;

// defining color scheme
// var res = ["South Asia", "Europe & Central Asia", "Middle East & North Africa", "Sub-Saharan Africa", "Latin America & Caribbean",
// "East Asia & Pacific", "North America"] 

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

    let grouped_by_country = d3.group(lineChartData, d => d.country); // nest function allows to group the calculation per level of a factor
    let sumstat = Array.from(grouped_by_country, ([name, values]) => ({ name, values }));

    console.log(sumstat); 

    // defining color scheme
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    /* Format Data */
    var parseDate = d3.timeParse("%Y");
    sumstat.forEach(function(d) { 
    d.values.forEach(function(d) {
        d.year = parseDate(d.year);
    });
    });

    console.log("sumstat", sumstat);

    var xScale = d3.scaleTime()
    .domain([parseDate(1980), parseDate(2013)])
    .range([0, innerWidth]);

    let yScaleMaxValue = 0;
    sumstat.forEach((countryMap) => {
        let countryMax = d3.max(countryMap.values, d => d[selectedAttribute]);
        if (countryMax > yScaleMaxValue) {
            yScaleMaxValue = countryMax;
        }
    }) 

    var yScale = d3.scaleLinear()
    .domain([0, yScaleMaxValue])
    .range([innerHeight, 0]);


    const g = svg.append('g')
    .attr('transform', 'translate('+margin.left+', '+margin.top+')');;

    var xAxis = d3.axisBottom(xScale).ticks(10);
    var yAxis = d3.axisLeft(yScale).ticks(10);

    g.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(xAxis);

    // defining the x-axis and y-axis
    g.append('g').attr("class", "y axis").call(yAxis).append('text')
    .attr("y", -30)
    .attr("x", -innerHeight/2)
    .attr("transform", "rotate(-90)")
    .attr("fill", "#000")
    .text("Attribute value");


    var defs = svg.append("svg:defs");

    function marker(color) {

        defs.append("svg:marker")
            .attr("id", color.replace("#", ""))
            .attr('viewBox', [0, 0, 20, 20])
            .attr('refX', 10)
            .attr('refY', 10)
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .append('circle')
            .attr('cx', 10)
            .attr('cy', 10)
            .attr('r', 5)
            .style("stroke", "black")
            .style("stroke-width", 2)
            .attr("markerUnits", "userSpaceOnUse")
            .style("fill", color);


        return "url(" + color + ")";
    };


    /* Add line into SVG */
    var line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d[selectedAttribute]))
            .curve(d3.curveMonotoneX);

  
    let lines = svg.append('g')
        .attr('class', 'lines');

    let lineGroup = lines.selectAll('.line-group')
    .data(sumstat, d => d['name'])


    lineGroup.join(
        enter => enter.append('g')
        .attr('class', 'line-group') 
        .append('path')
        .attr('class', 'line'),
        update => update
        .transition()
        .duration(750)
        .attr('fill', "red")
        .style("stroke-width", 5)
        .style('stroke', "pink"),
        exit => exit
        .style('fill','red')
        .call(exit => exit.transition()
                          .remove())
    )
    .attr('d', d => line(d.values))
    .style('stroke', (d, i) => {
        return color(d.values[0].region);
    })
    .style('opacity', lineOpacity)
    .style("stroke-width", lineStroke)
    .style("fill", "none")
    .attr('marker-end',  (d, i) => {
        return marker(color(d.values[0].region))
    })
    .attr('transform', 'translate('+margin.left+', '+margin.top+')')

    .on("mouseover", function(event, d, i) {
      d3.selectAll('.line')
					.style('opacity', otherLinesOpacityHover);
      d3.selectAll('.circle')
					.style('opacity', circleOpacityOnLineHover);
     d3.selectAll('.country-labels')
					.style('opacity', circleOpacityOnLineHover);
      
      d3.select(this)
        .style('opacity', lineOpacityHover)
        .style("cursor", "pointer");

        svg.selectAll('.line-text-' + d.name)
        .style('opacity', lineOpacityHover)


    })
  .on("mouseout", function(event, d, i) {
      d3.selectAll(".line")
					.style('opacity', lineOpacity);
      d3.selectAll('.circle')
					.style('opacity', circleOpacity);
     d3.selectAll('line-text' + i)
					.style('opacity', circleOpacity);
      d3.select(this)
        .style("cursor", "none");

        svg.selectAll('.line-text-' + d.name)
        .style('opacity', lineOpacity)

    });

    let filteredData = getFilteredData(lineChartData)
    console.log("filteredData", filteredData)

    svg.selectAll(".lines")
      .data(filteredData)
      .enter()
      .append("text")
      .attr('class', (d,i) => { 
        return "line-text-" +  d.country})
      .attr("x", d => xScale(d.year))
      .attr("y", d => yScale(d[selectedAttribute]) + 40)
      .style('fill', (d) => color(d.region))
      .attr("font-size", "12")
      .style('opacity', lineOpacity)
      .text((d)=>d.country)

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
    drawLineChart();
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
    drawLineChart();
 }

 function splitGlobalDataIntoRegions() {
    globalDevelopmentData.forEach(function (item) {
        let country = item["country"];
        if (item["year"] >= 1980 && item["year"] <= 2013) {
            let region = worldBankRegionMap.get(country);
            item["region"] = region;
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

function getFilteredData(data) {
    let country_year_map = new Map();
    data.forEach((item => {
        let curr_country = item.country;
        let curr_year = item.year;
        if (!country_year_map.has(curr_country)) {
            country_year_map.set(curr_country, curr_year)
        } else if (country_year_map.get(curr_country) < curr_year) {
            country_year_map.set(curr_country, curr_year)
        }
    }));
    let filteredData = data.filter(item => item.year == country_year_map.get(item.country));
    return filteredData;
}