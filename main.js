var inputTxt, consCnt, vowelCnt, puncCnt, mapCnt;
const consonants = ['b','c','d','f','g','h','j','k','l','m','n','p','q','r','s','t','v','w','x','z'],
vowels = ['a','e','i','o','u','y'], punc = ['.',',','?','!',':',';']

function submitText() {
    console.log('Text Submitted');
    inputTxt = document.getElementById('wordbox').value;

    consCnt = 0, vowelCnt = 0, puncCnt = 0, mapCnt = new Map();

    var i = inputTxt.length;
    while (i--) {
        ch = inputTxt.charAt(i).toLowerCase();

        if(mapCnt.has(ch))
            mapCnt.set(ch, mapCnt.get(ch)+1);
        else
            mapCnt.set(ch, 1);

        if(vowels.indexOf(ch) != -1)
            vowelCnt++;
        else if(punc.indexOf(ch) != -1)
            puncCnt++;
        else if(consonants.indexOf(ch) != -1)
            consCnt++;
    }

    console.log('consonants: '+consCnt);
    console.log('vowels: '+vowelCnt);
    console.log('punctuations: '+puncCnt);

    d3.select('#bar_svg').selectAll("*").remove();
    drawDonutChart();
}

function drawDonutChart() {
    var svg = d3.select('#pie_svg')
    width = parseInt(svg.style('width')),
    height = parseInt(svg.style('height')),
    radius = Math.min(width, height) / 2 - 20;
    var g = svg.append('g').attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    var data = [{label:'consonants', count:consCnt}, {label:'vowels', count:vowelCnt}, {label:'punctuations', count:puncCnt}];

    var pie = d3.pie().sort(null)
    var color = d3.scaleOrdinal(d3.schemePastel1);

    var arc = d3.arc()
        .innerRadius(100)
        .outerRadius(radius);

    var arcs = g.selectAll('arc')
        .data(pie(data.map(x=>x.count)))
        .enter()
        .append('g')
        .attr('class', 'arc')

    arcs.append('path')
        .style('fill', function(d, i) {
            return color(i);
        })
        .attr('d', arc)
        .attr('stroke', 'black')
        .attr('stroke-width', '1px')
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
            .attr('stroke-width', '4px');

            svg.append('text').attr('x', width/2).attr('y', height/2)
                .attr('text-anchor', 'middle').attr('alignment-baseline', 'central')
                .attr('font-size', '25px')
                .text(data[i.index].label+': '+i.value);
            })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
            .attr('stroke-width', '1px');

            d3.select('text').remove();
            })
        .on('click', function (d, i) {
                drawBarChart(data[i.index].label, d3.select(this).style('fill'));
            })
}

function drawBarChart(charType, barColor) {
    var svg = d3.select('#bar_svg'),
    margin = 10,
    width = parseInt(svg.style('width')),
    height = parseInt(svg.style('height'));
    svg.selectAll("*").remove();

    x = d3.scalePoint()
        .range([margin*4, width-margin*4])
        .domain((charType=='consonants')?consonants:(charType=='vowels')?vowels:punc)
        .padding(0.5);
    xx = svg.append("g")
         .attr("transform", "translate(0," + (height-margin*4) + ")")
         .transition()
         .duration(2000)
         .call(d3.axisBottom(x))


    y = d3.scaleLinear()
        .range([height-margin*4, margin*2])
        .domain([0, getDomain((charType=='consonants')?consonants:(charType=='vowels')?vowels:punc)])

    const yAxisTicks = y.ticks()
    .filter(tick => Number.isInteger(tick));

    yy = svg.append("g")
         .attr("transform", "translate("+(margin*4)+", 0)")
         .transition()
         .duration(2000)
         .call(d3.axisLeft(y).tickValues(yAxisTicks).tickFormat(d3.format('d')))

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var mouseover = function(event, d) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html("Character: " + d.Character + "<br>" + "Count: " + d.Count);
        d3.select("#character-name").text("The count for ["+d.Character+"] is "+d.Count);
    }

    var mousemove = function(event) {
    tooltip
      .style("left", (d3.pointer(event)[0]+830) + "px")
      .style("top", (d3.pointer(event)[1]+430) + "px")
    }

    var mouseout = function() {
        tooltip.transition().duration(100).style("opacity", 0);
        d3.select("#character-name").text("Count for selected character is NONE");
    }

    svg.selectAll("bars")
    .data(getData((charType=='consonants')?consonants:(charType=='vowels')?vowels:punc))
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.Character) - 10; })
    .attr("y", function(d) { return y(d.Count); })
    .attr("width",  20)
    .attr("height", function(d) { return height - y(d.Count) - margin*4; })
    .attr("fill", barColor)
    .attr("stroke", "black")
    .style("stroke-width", 1)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout)
}

function getDomain(charArr) {
    var max = 0;
    charArr.forEach(i => {
    max = (mapCnt.get(i) ?? 0) > max ? mapCnt.get(i) : max
    });
    return max;
}

function getData(charArr) {
    var dataMap = charArr.map(i =>
        ({"Character": i, "Count": (mapCnt.get(i) ?? 0)}));
    console.log(dataMap);
    return dataMap;
}