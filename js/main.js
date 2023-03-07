var worldBankRegionMap = new Map();
var parseDate = d3.timeParse("%Y");
var color = d3.scaleOrdinal(d3.schemeCategory10);
var globalDevelopmentData;
var worldBankRegionMap;
var southAsiaData = [];
var euCentralAsiaData = [];
var midEastData = [];
var africaData = [];
var caribbeanData = [];
var eastAsiaData = [];
var northAmericaData = [];
var lineChartData = [];
var lineOpacity = "0.6";
var lineOpacityHover = "0.8";
var otherLinesOpacityHover = "0.3";
var lineStroke = "2px";

var circleRadius = 3;
var circleRadiusHover = 6;
var duration = 250;
var axisTransitionDuration = 600;
var dataEntryExitTransitionDuration = 600;
var yLabelOffset = 50;
var xLabelOffset = 65;

// defining color scheme
// var res = ["South Asia", "Europe & Central Asia", "Middle East & North Africa", "Sub-Saharan Africa", "Latin America & Caribbean",
// "East Asia & Pacific", "North America"] 

document.addEventListener('DOMContentLoaded', function () {
    // Hint: create or set your svg element inside this function
     
    // Loading two CSV files and store them into two arrays.
    Promise.all([d3.csv('data/countries_regions.csv'),d3.csv('data/global_development.csv')])
         .then(function (values) {
            let countriesRegions = values[0];
            let globalDevelopment = values[1];

            
            //Wrangling the data
            countriesRegions.forEach(d => {
                if (!worldBankRegionMap.has(d["name"])) {
                    worldBankRegionMap.set(d["name"], d["World bank region"]);
                }
            })

            globalDevelopmentData = globalDevelopment.map(function(d) {
             return {
                country: d.Country,
                year: parseDate(+d["Year"]),
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
             opacityChangeRedraw();
             drawLineChart(false);
         });
 });

 function drawLineChart(play) {
    getDataToDisplay();

    const svg = d3.select('svg');
    // get the width and height of the SVG
    const width = +svg.style('width').replace('px','');
    const height = +svg.style('height').replace('px','');
    // adding padding around the chart
    const margin = { top:50, bottom: 50, right: 100, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const selectedAttribute = document.getElementById('attribute-select').value;

    let grouped_by_country = d3.group(lineChartData, d => d.country); // nest function allows to group the calculation per level of a factor
    let sumstat = Array.from(grouped_by_country, ([name, values]) => ({ name, values }));

    var xScale = d3.scaleTime()
    .domain([parseDate("1980"), parseDate("2013")])
    .range([0, innerWidth]);

    let yScaleMaxValue = 0;
    sumstat.forEach((countryMap) => {
        let countryMax = d3.max(countryMap.values, d => d[selectedAttribute]);
        if (countryMax > yScaleMaxValue) {
            yScaleMaxValue = countryMax;
        }
    }) 

    let yScaleMinValue;
    sumstat.forEach((countryMap) => {
        let countryMin = d3.min(countryMap.values, d => d[selectedAttribute]);
        if (!yScaleMinValue || countryMin < yScaleMinValue) {
            yScaleMinValue = countryMin;
        }
    }) 

    yScaleMinValue = d3.min([yScaleMinValue, 0])

    var yScale = d3.scaleLinear()
    .domain([yScaleMinValue, yScaleMaxValue])
    .range([innerHeight, 0]);


    const g = svg.append('g')
    .attr('transform', 'translate('+margin.left+', '+margin.top+')');;

    var xAxis = d3.axisBottom(xScale).ticks(10);
    var yAxis = d3.axisLeft(yScale).ticks(10);

    g.append("g")
    .attr("class", "xaxis")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(xAxis);

    // defining the x-axis and y-axis
    g.append('g').attr("class", "yaxis").call(yAxis).append('text')
    .attr("y", -30)
    .attr("x", -innerHeight/2)
    .attr("transform", "rotate(-90)")
    .attr("fill", "#000")
    .text("Attribute value");


    var defs = svg.append("svg:defs");

    // adding circle markers which will be used in line ends
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
            .style("stroke-width", 1)
            .attr("markerUnits", "userSpaceOnUse")
            .style("fill", color);


        return "url(" + color + ")";
    };



    /* Add line into SVG */
    var line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d[selectedAttribute]))
            .curve(d3.curveCatmullRom);

  
    let lines = svg.append('g')
        .attr('class', 'lines');

    let lineGroup =  d3.select('svg').selectAll('.lines').selectAll('.line-group')
    .data(sumstat, d => {
        return d['name'].hashCode()
    })


    lineGroup.join(
        enter => {
         enter.append('g')
        .attr('class', 'line-group') 
        .append('path')
        .attr('class', 'line')
        .style('opacity', () => {
            if (play) {
                return lineOpacity;
            }
            return 0;
        })
        .style("stroke-width", lineStroke)
        .style("fill", "none")
        .attr('marker-end',  (d, i) => {
            return marker(color(d.values[0].region))
        })
        .attr('d', d => line(d.values))
        .style('stroke', (d, i) => {
                return color(d.values[0].region);
            })
        .attr('transform', 'translate('+margin.left+', '+margin.top+')')

        enter.call(enter => {

            if (play) {
                transitionThroughYears(enter.selectAll("path"));
            } else {
                // fade in effect for new data lines
                enter.selectAll('path')
                        .transition()
                        .delay(axisTransitionDuration)
                        .duration(dataEntryExitTransitionDuration)
                        .style('opacity', lineOpacity)
            }


        }
        )
        },
        update => {    
            
        //rescales y axis on data update
        svg.selectAll(".yaxis")
        .transition().duration(axisTransitionDuration)
        .call(yAxis);

        update.call(update => {

            //moves lines to correct position depending on new y axis
            update.selectAll('path')
                    .transition()
                    .duration(axisTransitionDuration)
                    .attr('d', d => line(d.values))
        }
        )
        },
        exit => {

        lineGroup.selectAll('path')
        .transition()
        .duration(axisTransitionDuration)
        .attr('d', d => line(d.values))
    
        exit.call(exit => {

        //fade out effect for removed data lines
        exit.selectAll('path')
                .transition()
                .duration(dataEntryExitTransitionDuration)
                .style('opacity', 0)
                .end()                  // after the transition ends,
                .then(() => {           // remove the elements in the
                    exit.remove();      // exit selection
                });

        //rescales y axis on data update
        svg.selectAll(".yaxis")
        .transition()
        .delay(dataEntryExitTransitionDuration)
        .duration(axisTransitionDuration)
        .call(yAxis);   
        })
    });

    d3.selectAll('path')
    .on("mouseover", function(event, d, i) {
        d3.selectAll('.line')
					.style('opacity', otherLinesOpacityHover);
        d3.selectAll('.circle')
					.style('opacity', otherLinesOpacityHover);
        d3.selectAll(".data-labels")
					.style('fill-opacity', otherLinesOpacityHover);
      
        d3.select(this)
        .style('opacity', lineOpacityHover)
        .style("cursor", "pointer");

        d3.selectAll('.line-text-' + d.name.hashCode())
        .style('fill-opacity', lineOpacityHover) //TO-DO
    })
  .on("mouseout", function(event, d, i) {
        d3.selectAll(".line")
					.style('opacity', lineOpacity);
        d3.selectAll('.circle')
					.style('opacity', lineOpacity);
        d3.selectAll(".data-labels")
					.style('fill-opacity', lineOpacity);
        d3.select(this)
        .style("cursor", "none");

    });

    // Adding country labels to lines
    let labelsData = getFilteredData(lineChartData)
    let labelsGroup = d3.group(labelsData, d => d.country); 
    let labelsByCountry = Array.from(labelsGroup, ([name, values]) => ({ name, values }));
    
    let linesText =  d3.select('svg').selectAll('.lines')
    .selectAll('.data-labels')
    .data(labelsByCountry, d => d['name'].hashCode())

    linesText
      .join(
        enter => {
        enter.append('g')
        .attr('class', "data-labels")    
        .append("text")
        .attr('class', (d,i) => {
            return "data-labels line-text-" +  d.name.hashCode()})    
        .attr("x", d => xScale(d.values[0].year) + xLabelOffset)
        .attr("y", d => yScale(d.values[0][selectedAttribute]) + yLabelOffset)
        .style('fill', (d) => color(d.values[0].region))
        .attr("font-size", "12")
        .attr("font-weight", "900")
        .style('fill-opacity', () => {
            if (play) {
                return lineOpacity;
            }
            return 0;
        })
        .text((d)=>d.values[0].country)

        enter.call(enter => {
            //fade in effect for new data lines

            if (play) {
                transitionThroughYears(enter.selectAll("path"));
            } else {
                enter.selectAll('text')
                        .transition()
                        .delay(axisTransitionDuration)
                        .duration(dataEntryExitTransitionDuration)
                        .style('fill-opacity', lineOpacity)
            }
        }
        )
        },
        update => {    

            update.call(update => {
                //moves lines to correct position depending on new y axis
                update.selectAll(".data-labels")
                        .transition()
                        .duration(axisTransitionDuration)
                        .attr("x", d => xScale(d.values[0].year) + xLabelOffset)
                        .attr("y", d => yScale(d.values[0][selectedAttribute]) + yLabelOffset)
            }
            )
            },
        exit => {
            exit.call(exit => {
            //fade out effect for removed data labels
            exit.selectAll(".data-labels")
            .transition()
            .duration(dataEntryExitTransitionDuration)
            .style('fill-opacity', 0)
            .end()                  // after the transition ends,
            .then(() => {           // remove the elements in the
                exit.remove();      // exit selection
            });

            })
        }
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
    drawLineChart(false);
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
    drawLineChart(false);
 }

 function splitGlobalDataIntoRegions() {
    globalDevelopmentData.forEach(function (item) {
        let country = item["country"];
        if (item["year"] >= parseDate("1980") && item["year"] <= parseDate("2013")) {
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
    lineChartData = []
    // initialise data
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

String.prototype.hashCode = function() {
    var hash = "";
    var chr, i;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr = this.charAt(i);
      if (chr == " " || chr== "." || chr == "," || chr == "'") {
        chr = "-"
      }
      hash = hash + chr; // Convert to 32bit integer
    }
    return hash;
  }

  //redraw when opacity changes
  function opacityChangeRedraw(e) {
    var slider = document.getElementById("opacity-control");
    lineOpacity = parseFloat(slider.value);
    lineOpacityHover = (lineOpacity + 0.2).toFixed(2);
    otherLinesOpacityHover = (lineOpacity - 0.3).toFixed(2);
    if (lineOpacityHover > 1) {
        lineOpacityHover = 1;
    } 
    if (otherLinesOpacityHover < 0.1) {
        otherLinesOpacityHover = 0.1;
    }
    d3.selectAll(".line")
				.style('opacity', lineOpacity);
    d3.selectAll('.circle')
				.style('opacity', lineOpacity);
    d3.selectAll(".data-labels")
					.style('fill-opacity', lineOpacity);

    console.log("lineOpacityHover", lineOpacityHover);
    console.log("otherLinesOpacityHover", otherLinesOpacityHover)

  }

  function animateThroughYears() {
    d3.select('svg').selectAll('.lines').remove();
    drawLineChart(true);

  }

  function tweenDash() {
    var l = this.getTotalLength(),
        i = d3.interpolateString("0," + l, l + "," + l);
    return function (t) { return i(t); };
}

function transitionThroughYears(selection) {
    selection.each(function() {
        d3.select(this).transition()
            .duration(1500)
            .attrTween("stroke-dasharray", tweenDash);
    })
};


