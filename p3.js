// p3.js: p3 student code
// Copyright (C)  2022 University of Chicago. All rights reserved.
/*
This is only for students and instructors in the 2022 CMSC 23900 ("DataVis") class, for use in that
class. It is not licensed for open-source or any other kind of re-distribution. Do not allow this
file to be copied or downloaded by anyone outside the 2022 DataVis class.
*/
/*
NOTE: Document here (after the "begin  student  code" line)
// v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
// ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (0L in ref)
anyone or anything extra you used for this work.  Besides your instructor and TA (and project
partner, if you partnered with someone) who else did you work with?  What other code or web pages
helped you understand what to do and how to do it?  It is not a problem to seek more help to do
this work!  This is just to help the instructor know about other useful resources, and to help the
graders understand sources of code similarities.
*/
'use strict';
import {
  d3, parm, glob,
  // what else do you want to import from common.js?
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (1L in ref)
} from './common.js';

/* create the annotated balance bars for popular and electoral college votes */
export const balanceInit = function (did, sid) {
  const div = document.getElementById(did);
  /* appending elements to the div likely changes clientWidth and clientHeight, hence the need to
  save these values representing the original grid */
  const ww = div.clientWidth;
  let hh = div.clientHeight;
  const svg = d3.select('#' + did).append('svg');
  // make svg fully occupy the (original) containing div
  svg.attr('id', sid).attr('width', ww).attr('height', hh);
  const wee = 2;
  const bal = svg.append('g').attr('transform', `translate(0,${2 * wee})`);
  hh -= 2 * wee;
  /* ascii-hard to help keep coordinates and ids straight
                     L                                                        R
  +                  ----------------------------|-----------------------------
        popular vote | #D-pv-bar,#D-pv-txt       |        #R-pv-bar,#R-pv-txt |
  H                  ----------------------------|-----------------------------
                       #D-name                   |                    #R-name
                     ----------------------------|-----------------------------
   electoral college | #D-ec-bar,#D-ec-txt       |        #R-ec-bar,#R-ec-txt |
                     ----------------------------|-----------------------------
  */
  // some convenience variables for defining geometry
  const L = ww / 7,
    R = (6.5 * ww) / 7,
    H = hh / 3;
  // mapping over an array of adhoc parameter objects to avoid copy-pasta
  [
    // create the left-side labels for the two bars
    { y: 0.5 * H, t: 'Popular Vote' },
    { y: 2.5 * H, t: 'Electoral College' },
  ].map((i) => {
    bal
      .append('text')
      .attr('transform', `translate(${L - wee},${i.y})`)
      .style('text-anchor', 'end')
      .html(i.t);
  });
  const parts = [
    /* the bars and text values for the four counts: {D,R}x{popular vote, electoral college}, and,
    the two candidate names */
    { id: 'D-pv', p: -1, y: 0 },
    { id: 'D-name', p: -1, y: H },
    { id: 'D-ec', p: -1, y: 2 * H },
    { id: 'R-pv', p: 1, y: 0 },
    { id: 'R-name', p: 1, y: H },
    { id: 'R-ec', p: 1, y: 2 * H },
  ];
  parts.map((i) => {
    if (!i.id.includes('name')) {
      bal
        .append('rect')
        .attr(
          /* NOTE how these bars are transformed: your code only needs to set width (even though
          the D bars grow rightward, and the R bars grown leftward), and, your code doesn't need to
          know the width in pixels.  Just set width to 0.5 to make the bar go to the middle */
          'transform',
          i.p < 0 ? `translate(${L},0) scale(${R - L},1)` : `translate(${R},0) scale(${L - R},1)`
        )
        .attr('x', 0)
        .attr('y', i.y)
        .attr('height', H)
        .attr('fill', i.p < 0 ? parm.colorDem : parm.colorRep)
        // NOTE: select the bars with '#D-pv-bar', '#D-ec-bar', '#R-pv-bar', '#R-ec-bar'
        .attr('id', `${i.id}-bar`)
        .attr('width', 0.239); // totally random initial fractional value
    }
  });
  parts.map((i) => {
    const txt = bal
      .append('text')
      .attr('transform', `translate(${i.p < 0 ? L + wee : R - wee},${i.y + 0.5 * H})`)
      .style('text-anchor', i.p < 0 ? 'start' : 'end')
      // NOTE: select the text fields with '#D-pv-txt', '#D-ec-txt', '#R-pv-txt', '#R-ec-txt'
      .attr('id', `${i.id}${i.id.includes('name') ? '' : '-txt'}`);
    txt.html('#' + txt.node().id); // initialize text to show its own CSS selector
  });
  bal
    .append('line')
    .attr('x1', (L + R) / 2)
    .attr('x2', (L + R) / 2)
    .attr('y1', 0)
    .attr('y2', hh)
    .attr('stroke-width', 1)
    .attr('stroke', '#fff');
};

/* canvasInit initializes the HTML canvas that we use to draw a picture of the bivariate colormap
underneath the scatterplot. NOTE THAT AS A SIDE-EFFECT this sets glob.scatContext and
glob.scatImage, which you must use again later when changing the pixel values inside the canvas */
export const canvasInit = function (id) {
  const canvas = document.querySelector('#' + id);
  canvas.width = parm.scatSize;
  canvas.height = parm.scatSize;
  glob.scatContext = canvas.getContext('2d');
  glob.scatImage = glob.scatContext.createImageData(parm.scatSize, parm.scatSize);
  /* set pixels of glob.scatImage to checkerboard pattern with ramps; the only purpose of this is
  to show an example of traversing the scatImage pixel array, in a way that (with thought and
  scrutiny) identifies how i and j are varying over the image as it is seen on the screen. NOTE
  that nested for() loops like this are an idiomatic way of working with pixel data arrays, as
  opposed to functional idioms like .map() that we use for other kinds of data. */
  for (let k = 0, j = 0; j < parm.scatSize; j++) {
    for (let i = 0; i < parm.scatSize; i++) {
      glob.scatImage.data[k++] =
        100 + // RED channel is a constant plus ...
        (120 * i) / parm.scatSize + // ... ramp up along i,
        30 * (Math.floor(i / 40) % 2); // with wide bands
      glob.scatImage.data[k++] =
        100 + // GREEN channel is a constant plus ...
        (120 * j) / parm.scatSize + // ... ramp up along with j,
        30 * (Math.floor(j / 10) % 2); // with narrow bands
      glob.scatImage.data[k++] = 30; // BLUE channel is constant
      glob.scatImage.data[k++] = 255; // 255 = full OPACITY (don't change)
    }
  }
  /* display scatImage inside canvas.
  NOTE that you will need to call this again (exactly this way, with these variable names)
  anytime you change the scatImage.data canvas pixels */
  glob.scatContext.putImageData(glob.scatImage, 0, 0);
};

/* Place the scatterplot axis labels, and finalize the stacking of both the labels and the
scatterplot marks over the canvas. That this assumes many specific element ids in the DOM is likely
evidence of bad design */
export const scatLabelPos = function () {
  // place the scatterplot axis labels.
  const marg = 30; // around the scatterplot domain
  const wee = 7; // extra tweak to text position
  const sz = parm.scatSize;
  /* since these two had style "position: absolute", we have to specify where they will be, and
  this is done relative to the previously placed element, the canvas */
  /* (other functions here in p3.js try to avoid assuming particular element ids, using instead ids
  passed to the function, but that unfortunately became impractical for this function) */
  ['#scat-axes', '#scat-marks-container'].map((pid) =>
    d3
      .select(pid)
      .style('left', -marg)
      .style('top', -marg)
      .attr('width', 2 * marg + sz)
      .attr('height', 2 * marg + sz)
  );
  d3.select('#y-axis').attr('transform', `translate(${marg - wee},${marg + sz / 2}) rotate(-90)`);
  d3.select('#x-axis').attr('transform', `translate(${marg + sz / 2},${marg + sz + wee})`);
  d3.select('#scat-marks')
    .attr('transform', `translate(${marg},${marg})`)
    .attr('width', sz)
    .attr('height', sz);
};

/* scatMarksInit() creates the per-state circles to be drawn over the scatterplot */
export const scatMarksInit = function (id, data) {
  /* maps interval [0,data.length-1] to [0,parm.scatSize-1]; this is NOT an especially informative thing
  to do; it just gives all the tickmarks some well-defined initial location */
  const tscl = d3
    .scaleLinear()
    .domain([0, data.length - 1])
    .range([0, parm.scatSize]);
  /* create the circles */
  d3.select('#' + id)
    .selectAll('circle')
    .data(data)
    .join('circle')
    .attr('class', 'stateScat')
    // note that every scatterplot mark gets its own id, eg. 'stateScat_IL'
    .attr('id', d => `stateScat_${d.StateAbbr}`)
    .attr('r', parm.circRad)
    .attr('cx', (d, ii) => tscl(ii))
    .attr('cy', (d, ii) => parm.scatSize - tscl(ii));
};

export const formsInit = function (tlid, yid, years, mdid) {
  // finish setting up timeline for choosing the year
  const tl = d3.select('#' + tlid);
  tl.attr('min', d3.min(years))
    .attr('max', d3.max(years))
    .attr('step', 4) // presidential elections are every 4 years
    // responding to both input and click facilitates being activated from code
    .on('input click', function () {
      /* This is one of the situations in which you CANNOT use an arrow function; you need a real
      "function" so that "this" is usefully set (here, "this" is this input element) */
      d3.select('#' + yid).html(this.value);
      yearSet(+this.value); // need the + so year is numeric
    });
  // create radio buttons for choosing colormap/scatterplot mode
  const radioModes = Object.keys(glob.modeDesc).map(id => ({
    id,
    str: glob.modeDesc[id]
  }));
  // one span per choice
  const spans = d3
    .select('#' + mdid)
    .selectAll('span')
    .data(radioModes)
    .join('span');
  // inside each span, put a radio button
  spans
    .append('input')
    // add some spacing left of 2nd and 3rd radio button; the 'px' units are in fact needed
    .style('margin-left', (_, i) => `${20 * !!i}px`)
    .attr('type', 'radio')
    .attr('name', 'mode') // any string that all the radiobuttons share
    .attr('id', (d) => d.id) // so label can refer to this, and is thus clickable
    .attr('value', (d) => d.id) // so that form as a whole has a value
    // respond to being selected by calling the modeSet function (in this file).
    .on('input', function (d) {
      modeSet(this.value);
    });
  // also in each span put the choice description
  spans
    .append('label')
    .attr('for', (d) => d.id)
    .html((d) => d.str);
};

/* TODO: finish dataProc, which takes the global state object, and modifies it as needed prior to
interactions starting. You will want to do things with the results of reading all the CSV data,
currently sitting in glob.csvData. */
export const dataProc = function (glob) {
  // some likely useful things are computed for you
  // glob.years: sorted array of all numerical years
  glob.years = glob.csvData.votes.columns // all column headers from voting data CSV
    .filter((c) => c.includes('_')) // select the years (works for given votes.csv)
    .map((c) => c.split('_')[1]) // extract year part (dropping 'DN', 'DE', 'RN', 'RE')
    // select only unique elements (note the use of all 3 args of filter function)
    .filter((d, i, A) => i == A.indexOf(d))
    .map((y) => +y) // and make into numbers
    .sort(); // make sure sorted if not already
  // glob.stateName: maps from two-letter abbreviation to full "state" name.
  glob.stateName = {};
  glob.csvData.stateNames.forEach(s => glob.stateName[s.StateAbbr] = s.StateName);
  // glob.cname: maps from election year to little object with D and R candidate names
  glob.cname = {};
  glob.csvData.candidateNames.forEach(nn => {
    glob.cname[+nn.year] = {
      D: nn.D,
      R: nn.R,
    };
  });
  // what other arrays or objects do you want to set up?
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
  //variables to compare vote numbers to, in order to help us find the min-max range with which to warp the votes for the scatterplot
  var maxVotes = 0, minVotes = Infinity;
  var maxTotalVotes = 0, minTotalVotes = Infinity;
  //console.log('glob.years value = ', glob.years);

  //for each year's data
  glob.years.forEach(year => {
    //create empty list in yearlyVotesByState for this specific year, which will store every state as an object
    glob.yearlyVotesByState[year] = {};

    //at the same time, also set up a list storing tallying counts for this current year's total number of votes for each category,
    //which will be stored into yearlyTotalVotes
    //[DN, DE, RN, RE]
    var yearTotal = {};

    //initialize elements storing the 4 categories of total votes in yearTotal
    glob.voteCategory.forEach( i => yearTotal[i] = 0);
    //console.log('Initialize year total ', yearTotal);

    //initialize the vote categories: DN, DE, RN, RE for both total and votes by state
    var colNames = {};
    glob.voteCategory.forEach(c => colNames[c] = c + '_' + year);

    //console.log(glob.csvData.votes);

    //for each row of data (one state), 
    glob.csvData.votes.forEach(voteRow => {
      var votes = {};
      var state = voteRow['StateAbbr'];
      //for every vote category [DN, DE, RN, RE]
      glob.voteCategory.forEach(c => {
        var val = voteRow[colNames[c]];
        // Convert to number
        val = +val;
        //compare per-party popular votes to the min/max and find the new min/max party votes that will serve as the bounds
        // for the scatterplots in RVD and PUR
        if (c == 'DN' || c == 'RN') {
          if (maxVotes < val)
            maxVotes = val;

          if (minVotes > val)
            minVotes = val;
        }
        votes[c] = val; //store the votes for this category
        yearTotal[c] += val; //accumulate total for this category
      });

      //calculate and store the lean of each state for each year
      //calculate and store the total popular votes of each state for each year
      votes['lean'] = politicalLean(votes.DN, votes.RN);
      votes['total'] = votes.DN + votes.RN;

      //comparison to find the max/min total votes for one state across all years across all states
      // for "voting amount" in LVA
      if (votes.total > maxTotalVotes)
        maxTotalVotes = votes.total;

      if (votes.total < minTotalVotes)
        minTotalVotes = votes.total;

      //store the previously calculated votes, yearly total votes
      glob.yearlyVotesByState[year][state] = votes;
    });
    glob.yearlyTotalVotes[year] = yearTotal;
  });

  //store the max/min values that will help us figure out the bounds for all later scatterplots
  glob.minVotes = minVotes;
  glob.maxVotes = maxVotes;

  glob.minTotalVotes = minTotalVotes;
  glob.maxTotalVotes = maxTotalVotes;

  console.log(glob.yearlyVotesByState);
  console.log(glob.yearlyTotalVotes);
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (39L in ref)
};

/* TODO: finish visInit, which sets up any other state or resources that your visualization code
will use to support fast user interaction */
export const visInit = function (glob) {
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code

  //set up tooltip box div
  var tooltip = d3.select('body').append('div')
  		.attr('id', 'tooltip')
  		.style('visibility', 'hidden')
      .style('background-color', 'black')
      .style('fill-opacity', 0.9)
      .style('position', 'absolute')
  		.attr('width', 100);

  //set up the actual table
  var table = tooltip.append('table');
  table.style('border', '1px solid white');

  //title (state name) row
  table.append('tr')
       .append('td')
       .attr('colspan', 3)
       .style('text-align', 'center')
       .append('text').attr('id', 'tooltip_state');

  //set up the table headers D and R
  table.append('tr')
       .attr('id', 'table-header')
       .append('th');
  d3.select('#table-header')
    .append('th')
    .text('D');
  d3.select('#table-header')
    .append('th')
    .text('R');

  d3.select('th')
    .style('color', 'white');

  //row for popular votes
  var tr = table.append('tr');

  tr.append('td')
    .append('text')
    .text('Popular Vote');

  tr.append('td')
    .style('background-color', parm.colorDem)
    .append('text')
    .attr('id', 'tooltip_pvd');

  tr.append('td')
    .style('background-color', parm.colorRep)
    .append('text')
    .attr('id', 'tooltip_pvr');

  //row for electoral votes
  tr = table.append('tr');

  tr.append('td')
    .append('text')
    .text('Elec. College');

  tr.append('td')
    .style('background-color', parm.colorDem)
    .append('text')
    .attr('id', 'tooltip_ecd');

  tr.append('td')
    .style('background-color', parm.colorRep)
    .append('text')
    .attr('id', 'tooltip_ecr');

  // add mouse events to the US state hexes and state data points on the scatterplot
  Object.keys(glob.stateName).forEach(state => {
    var stateObj = d3.select('#stateHex_' + state);

    stateObj.on('mouseenter', hoverEnter);
    stateObj.on('mouseleave', hoverLeave);

    stateObj = d3.select('#stateScat_' + state);
    stateObj.on('mouseenter', hoverEnter);
    stateObj.on('mouseleave', hoverLeave);
  });
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (75L in ref)
};

const updateAxes = function (mode) {
  if ('PUR' == mode) mode = 'RVD'; // RVD and PUR same; handle RVD
  const label = {
    RVD: ['Republican Votes', 'Democratic Votes'],
    LVA: ['Political Leaning', 'Amount of Votes'],
  }[mode];
  d3.select('#x-axis').html(label[0]);
  d3.select('#y-axis').html(label[1]);
};

/* TODO: here will go the functions that you write, including those called by modeSet and yearSet.
By the magic of hoisting, any functions you add here will also be visible to dataProc and visInit
above. */
// v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
const hoverEnter = function(event, i, node) {
  var state = this.id.substring(this.id.length-2);
  //console.log('Get stateabbr ', state);

  // highlight the state in the US map
  d3.select('#stateHexOutline_' + state)
    .style('z-index', 99)
    .style('stroke', 'rgb(255,255,0')
    .style('stroke-width', 5);

  //#stateHexOutline

  //animate the circle data point on the scatterplot as a flashing circle for ease of viewing
  var animate = d3.select('#stateScat_' + state)
      .append('animate')
      .attr('attributeType', 'XML')
      .attr('attributeName', 'stroke')
      .attr('values', '#FFFFFF;#000000;#FFFFFF;#000000')
      .attr('stroke-width', 5)
      .attr('dur', '0.3s').attr('repeatCount', 'indefinite');
  
  //add the appropriate state's name to the tooltip div
  d3.select('#tooltip_state').text(glob.stateName[state]);

  //change the tooltip's location to hover near the selected state in a nice place
  d3.select('#tooltip')
      .style('top', event.pageY + 100 + 'px')
      .style('left', event.pageX - 50 + 'px');

  //default values for table when not viewing any specific year yet
  if (glob.currentYear == undefined) {
    d3.select('#tooltip_pvd').text('N/A');	
    d3.select('#tooltip_pvr').text('N/A');	
    d3.select('#tooltip_ecd').text('N/A');	
    d3.select('#tooltip_ecr').text('N/A');
    d3.select('#tooltip').style('visibility', 'visible');
    return;	
  } 

  //display popular votes and electoral college points for the state in local format (with commas)
  var stateData = glob.yearlyVotesByState[glob.currentYear][state];
  d3.select('#tooltip_pvd').text(stateData.DN.toLocaleString('en-US'));
  d3.select('#tooltip_pvr').text(stateData.RN.toLocaleString('en-US'));
  d3.select('#tooltip_ecd').text(stateData.DE.toLocaleString('en-US'));
  d3.select('#tooltip_ecr').text(stateData.RE.toLocaleString('en-US'));
  d3.select('#tooltip').style('visibility', 'visible');	
}

//when mouse leaves the state/circle, this is called -> reset the highlights/animations, and hide the table
const hoverLeave = function(event, i, node) {
  var state = this.id.substring(this.id.length-2);
  d3.select('#stateHexOutline_' + state)
    .style('stroke', 'none')
    .style('z-index', 'auto');

  d3.select('#stateScat_' + state)
    .style('stroke', 'white')
    .style('stroke-width', 1);

  d3.select('#stateScat_' + state)
    .select('animate')
    .remove();

  d3.select('#tooltip')
    .style('visibility', 'hidden');
}

//helper function to set the RGBA values of a pixel in the cavas data array
//coordinates start from (0,0) at the top left, increasing from left to right and downwards
//so in this case, height increases from 1 in the first row downwards -> row 1 has a height of 2, row 2 has a height of 3, etc
function setRBGAValues(array, width, x, y, R, G, B, A) {
  let oneD_coord_R = 4 * width * x + 4 * y;
  //set R
  array[oneD_coord_R] = R;
  //set G
  array[oneD_coord_R + 1] = G;
  //set B
  array[oneD_coord_R + 2] = B;
  //set A
  array[oneD_coord_R + 3] = A;
}

//simple helper function to calculate political lean based on the given political lean definition from the readme.md
function politicalLean(dem_votes, rep_votes) {
  let total = dem_votes + rep_votes;

  return 2 * rep_votes / (1 + total) - 1;
}

//helper function to make sure that the US state map updates its colors even if only the mode changes
//calls updateStateColors() again in order to do so when the year is not changed
function updateStateMapColorsByMode(mode) {
  console.log("Setting glob.currentMode = " + mode);
  glob.currentMode = mode;
  updateStateColors(glob.currentYear);
}

//function to update the color map scheme that shows up in the scatterplot background based on the mode selection
function updateColorMapBackground(mode) {
  //console.log("height and width = " + parm.scatSize);

  if (mode == undefined || mode == glob.currentMode) return;
  //keep track of which color background is the current image
	var currentImage;

  //set up the paramters and selectors to change the canvas through
  const canvas = document.querySelector('#scat-canvas');
  canvas.width = parm.scatSize;
  canvas.height = parm.scatSize;
  glob.scatContext = canvas.getContext('2d');
  glob.scatImage = glob.scatContext.createImageData(parm.scatSize, parm.scatSize);

  //console.log("updateColorMapBackground() = " + mode);

  //check which mode it is to update the scatterplot color map accordingly
  switch (mode) {
    case 'RVD':
      console.log("RVD");

      if (glob.modeImage.RVD != '') {
        glob.scatContext.putImageData(glob.modeImage.RVD, 0, 0);
      } else {
        var rvdImage = glob.scatContext.createImageData(parm.scatSize, parm.scatSize);

        //this var will increment as the rows iterate down to keep track of how many pixels will be red starting from the right side
        let r_side_counter = 350;
      
        //loop through all the pixels one by one and update their color
        for (let row = 0; row < parm.scatSize; row++) {
          for (let col = 0; col < r_side_counter; col++) {
            //draw the first section of the row as blue Dem pixels
            setRBGAValues(rvdImage.data, parm.scatSize, row, col, 40, 50, 255, 255);

            //console.log(`At (${row}, ${col}): color = (0, 0, 255)`);
          }
          for (let col = r_side_counter; col < parm.scatSize; col++) {
            //draw the rest of the row as red Rep pixels
            setRBGAValues(rvdImage.data, parm.scatSize, row, col, 230, 30, 20, 255);

            //console.log(`At (${row}, ${col}): color = (255, 0, 0)`);
          }
          //decrement the counter so the next row's blue half will be shorter by one pixel (for the diagonal)
          r_side_counter--;
        }

        //update and output the canvas image
        glob.modeImage.RVD = rvdImage;
			  glob.scatContext.putImageData(rvdImage, 0, 0);
      }
      //console.log(glob.scatImage.data);
      currentImage = glob.modeImage.RVD;

      break;
    case 'PUR':
      console.log("PUR");
      //if PUR image hasn't been created yet, do so and store it in so it can be referenced later without needing to draw it again
      if (glob.modeImage.PUR != '') {
				glob.scatContext.putImageData(glob.modeImage.PUR, 0, 0);
			} else {

        //get the canvas image context
				var purImage = glob.scatContext.createImageData(parm.scatSize, parm.scatSize);

        //scaleLinear function to scale the lean value to a color along the blue-purple-red gradient
				var scale3Colors = d3.scaleLinear()
                            .domain([-1, 0, 1])
									          .range([parm.colorDem, d3.color('purple'), parm.colorRep]);
        
        //inverse function to get the equivalent Dem. vs Rep. vote coordinates at a specific pixels coordinate
        const pixelsToVotes = d3.scaleLinear()
                                .domain([0, parm.scatSize])
                                .range([squashWarp(glob.minVotes, 1), squashWarp(glob.maxVotes, 1)]);

        for (let row = 0; row < parm.scatSize; row++) {
          //find the midpoint, left bound, and right bound of the diagonal that will contain the purple gradient
            // for each row
            let midPoint = parm.scatSize - row;
            let leftBound = Math.round(0.8 * midPoint);
            let rightBound = Math.round(Math.max(1.2 * midPoint, 1));

            //console.log("Midpoint = " + midPoint);
            //console.log("leftBound = " + leftBound);
            //console.log("rightBound = " + rightBound);

            //using the pixel coordinates of the left and right bound for this row,
            // find the equivalent Dem-vs-Rep vote counts for the bound coordinates

            let pixelToDemVotesMidPoint = pixelsToVotes(row);
            let pixelToRepVotesMidPoint = pixelsToVotes(midPoint);
            let pixelToRepVotesLeftBound = pixelsToVotes(leftBound);
            let pixelToRepVotesRightBound = pixelsToVotes(rightBound);

            //find the lean at each point
            let leftBoundLean = politicalLean(pixelToDemVotesMidPoint, pixelToRepVotesLeftBound);
            let midPointLean = politicalLean(pixelToDemVotesMidPoint, pixelToRepVotesMidPoint);
            let rightBoundLean = politicalLean(pixelToDemVotesMidPoint, pixelToRepVotesRightBound);

            //then scale these lean values across [-1, 0, 1] for the purple gradient
            const scaleLeanWithinDiagonalRegion = d3.scaleLinear()
                                                    .domain([leftBoundLean, midPointLean, rightBoundLean])
                                                    .range([-1, 0, 1]);
            
            //draw dem blue until we reach left bound
            for (let col = 0; col < leftBound; col++) {
              let currPixelColor = parm.colorDem;
              setRBGAValues(purImage.data, parm.scatSize, row, col, currPixelColor.r, currPixelColor.g, currPixelColor.b, 255);
            }

            //now start drawing the gradient
            for (let col = leftBound; col < Math.min(rightBound, parm.scatSize); col++) {

              //console.log(`At pixel (${row}, ${col})`);
              //get current pixel's coordinates 
              let currPixelDemVotes = pixelsToVotes(row);
              let currPixelRepVotes = pixelsToVotes(col);

              //calculate lean
              let currPixelLean = politicalLean(currPixelDemVotes, currPixelRepVotes);

              //use lean to get the appropriate purple gradient color to draw
              let currPixelColor = scale3Colors(scaleLeanWithinDiagonalRegion(currPixelLean));
              setRBGAValues(purImage.data, parm.scatSize, row, col, currPixelColor.r, currPixelColor.g, currPixelColor.b, 255);
            }

            //now draw the rest of the Rep. red til the end of the row
            for (let col = rightBound; col < parm.scatSize; col++) {
              let currPixelColor = parm.colorRep;
              setRBGAValues(purImage.data, parm.scatSize, row, col, currPixelColor.r, currPixelColor.g, currPixelColor.b, 255);
            }
        }

        //output canvas image and store it in glob so it can be used again later
				glob.modeImage.PUR = purImage;
				glob.scatContext.putImageData(purImage, 0, 0);
			}
			currentImage = glob.modeImage.PUR;
      
      break;

    case 'LVA':
      console.log("Mode: LVA");

      //if LVA image hasn't been created yet, do so and store it in so it can be referenced later without needing to draw it again
      if (glob.modeImage.LVA != '') {
				glob.scatContext.putImageData(glob.modeImage.LVA, 0, 0);
			} else {
        var lvaImage = glob.scatContext.createImageData(parm.scatSize, parm.scatSize);

        //scale for making the blue-gray-red gradient across the x-axis
				var colorScale = d3.scaleLinear()
                           .domain([0, parm.scatSize/2, parm.scatSize-1])
                           .range([parm.colorDem, d3.color('#d3d3d3'), parm.colorRep]);

        //scaleLinear for scaling luminance up and down the y-axis
				var rgbScaleLE1 = d3.scaleLinear()
                          .domain([0, parm.scatSize])
                          .range([0, 1]);
				
        //scalePow to change how quickly the luminance scales from dark to bright as the graph goes up
				var scalePow  = d3.scalePow()
                          .exponent(2)
                          .domain([0, 1])
                          .range([0, 1]);

        //setting up scale for the brightness level at a specific row
				var rScale = d3.scaleLinear().domain([0, 1]);
				var gScale = d3.scaleLinear().domain([0, 1]);
				var bScale = d3.scaleLinear().domain([0, 1]);

        //loop through the pixels and draw them
				for (var counter = 0, row = 0; row < parm.scatSize; row++) {
				  for (var col = 0; col < parm.scatSize; col++) {
            //first get the base color at this column (blue, gray, red)
            var currentColor = colorScale(col);
            
            //scale the initial luminance
            rScale = rScale.range([currentColor.r, 0]);
            gScale = gScale.range([currentColor.g, 0]);
            bScale = bScale.range([currentColor.b, 0]);

            //set the values for the pixel
            setRBGAValues(lvaImage.data, parm.scatSize, row, col,
                          rScale(scalePow(rgbScaleLE1(row))), 
                          gScale(scalePow(rgbScaleLE1(row))),
                          bScale(scalePow(rgbScaleLE1(row))),
                          255);
				  }
				}

        //output canvas image and store it in glob so it can be used again later
				glob.modeImage.LVA = lvaImage;
				glob.scatContext.putImageData(lvaImage, 0, 0);
			}
			currentImage = glob.modeImage.LVA;
			break;	
  }
  //update mode
  glob.currentMode = mode;
};

//function to update bar widths and text values for votes
function updateVotesAndBars(year) {
  //update popular votes
  //console.log(glob.yearlyTotalVotes[year].DN);
  d3.select("#D-pv-txt").text((+glob.yearlyTotalVotes[year].DN).toLocaleString("en-US"));
  d3.select("#R-pv-txt").text((+glob.yearlyTotalVotes[year].RN).toLocaleString("en-US"));

  //update electoral votes
  d3.select("#D-ec-txt").text(glob.yearlyTotalVotes[year].DE);
  d3.select("#R-ec-txt").text(glob.yearlyTotalVotes[year].RE);

  //update bar widths
  //#D-pv-bar #D-ec-bar

  let total_pv = glob.yearlyTotalVotes[year].DN + glob.yearlyTotalVotes[year].RN;
  let total_ec = glob.yearlyTotalVotes[year].DE + glob.yearlyTotalVotes[year].RE;

  //update popular vote bars
  d3.select("#D-pv-bar")
    .transition()
    .duration(parm.transDur)
    .attr("width", glob.yearlyTotalVotes[year].DN / total_pv);
  d3.select("#R-pv-bar")
    .transition()
    .duration(parm.transDur)
    .attr("width", glob.yearlyTotalVotes[year].RN / total_pv);

  //update electoral vote bars
  d3.select("#D-ec-bar")
    .transition()
    .duration(parm.transDur)
    .attr("width", glob.yearlyTotalVotes[year].DE / total_ec);
  d3.select("#R-ec-bar")
    .transition()
    .duration(parm.transDur)
    .attr("width", glob.yearlyTotalVotes[year].RE / total_ec);

  //update candidate names
  d3.select("#D-name").text(glob.cname[year].D);
  d3.select("#R-name").text(glob.cname[year].R);
};

//helper function for the PUR and LVA modes to get the color of a state's corresponding data point on the scatterplot color map
// since both modes just pull their colors from the colormap
function PUR_LVA_updateStatesColors(year, colorArray) {
  //loop through each state's location on the map and get the color of that pixel
  for (let currState in glob.yearlyVotesByState[year]) {

    //get state's coordinates on graph

    let stateX = Math.round(d3.select("#stateScat_" + currState).attr('cx'));
    let stateY = Math.round(d3.select("#stateScat_" + currState).attr('cy'));

    //make sure the rounded coordinates aren't out of bounds
    if (stateX >= parm.scatSize)
      stateX = parm.scatSize - 1;
    if (stateY >= parm.scatSize)
      stateY = parm.scatSize - 1;

    //get the color of that pixel and assign it to the state on the map
    let location_in_canvasData = stateY * parm.scatSize * 4 + stateX * 4;

    //extract the R, G, B values from the canvas data array
    let new_color_R = colorArray[location_in_canvasData];
    let new_color_G = colorArray[location_in_canvasData + 1];
    let new_color_B = colorArray[location_in_canvasData + 2];

    //console.log(new_color);
    
    //assign the new color
    d3.select("#stateHex_" + currState)
      .transition()
      .duration(parm.transDur)  
      .attr("style", `fill: rgb(${new_color_R}, ${new_color_G}, ${new_color_B})`);
  }
};

//function to update each state's filled in color
function updateStateColors(year) {

  //need to check what mode it is

  console.log("updateStateColors() mode: " + glob.currentMode);

  switch(glob.currentMode) {
    case 'RVD':
      //loop through all the states' data for the currently selected year

      for (let currState in glob.yearlyVotesByState[year]) {
        //console.log("currState = " + currState);

        //get state's electoral votes
        let currState_DE = glob.yearlyVotesByState[year][currState].DE;
        let currState_RE = glob.yearlyVotesByState[year][currState].RE;

        //compare to get the bigger electoral vote count (all or nothing) and color the state accordingly
        d3.select("#stateHex_" + currState)
          .transition()
          .duration(parm.transDur)
          .attr("style", "fill: " + 
            ((currState_DE > currState_RE) ? parm.colorDem : parm.colorRep));
      }
      break;

      case 'PUR':
        //assign the data from the already drawn PUR scatterplot color map
        PUR_LVA_updateStatesColors(year, glob.modeImage.PUR.data);
        break;

      case 'LVA':
        //assign the data from the already drawn LVA scatterplot color map
        PUR_LVA_updateStatesColors(year, glob.modeImage.LVA.data);
        break;
  };
};

//helper function for warping the data points to fit within the canvas better for RVD and PUR
function squashWarp(val) {
  //let ret = return Math.sqrt(val);
  //let ret = Math.log10(val);

  let ret = 1 - Math.pow(val, (1 / 4));
  return ret;
};

//function to update each point's location on the scatterplot
function updateStateLocations(year) {

  //console.log("Entered updateStateLocations()");

  //use regular W1 squashWarp function for the RVD and PUR modes
  if (glob.currentMode == "RVD" || glob.currentMode == "PUR") {
    for (let currState in glob.yearlyVotesByState[year]) {

      const warpToCanvas = d3
        .scaleLinear()
        .domain([squashWarp(glob.minVotes), squashWarp(glob.maxVotes)])
        .range([0, parm.scatSize]);
  
      //warp the coordinates of the point here
      let newX = warpToCanvas(squashWarp(glob.yearlyVotesByState[year][currState].RN)); //R votes
      let newY = warpToCanvas(squashWarp(glob.yearlyVotesByState[year][currState].DN)); //D votes
      
      //place the dots at their new location on the canvas
      d3.select("#stateScat_" + currState)
        .transition()
        .duration(parm.transDur)
        .attr("cx", newX)
        .attr("cy", 350 - newY);
    }
  } else if (glob.currentMode == 'LVA'){
    //mode LVA, must plot y = amount of votes, x = political lean

    //a different warp function to spread the data points out in a nicer way
    function w2Warp(totalVotes) {
      console.log("warping " + totalVotes);

      let ret = Math.pow(totalVotes, (1 / 8));

      console.log("result = " + ret);
      return ret;
    }
    
    //scaleLinear the lean evenly across the x-axis of the canvas color map
    const leanToCanvas = d3.scaleLinear()
                           .domain([-1, 1])
                           .range([0, parm.scatSize]);

    //scaleLinear the "voting amount" evenly across the y-axis of the canvas color map
    const amountToCanvas = d3.scaleLinear()
                           .domain([w2Warp(glob.minTotalVotes), w2Warp(glob.maxTotalVotes)])
                           .range([0, parm.scatSize]);                       

    //loop through each state
    for (let currState in glob.yearlyVotesByState[year]) {

      //get the current state's lean and amount coordinates for the canvas color map
      let newX = leanToCanvas(glob.yearlyVotesByState[year][currState].lean);
      let newY = amountToCanvas(w2Warp(glob.yearlyVotesByState[year][currState].total));

      //console.log(`newX = ${newX} and newY = ${newY}`);

      //place the data point at its new location on the scatterplot
      d3.select("#stateScat_" + currState)
        .transition()
        .duration(parm.transDur)
        .attr("cx", newX)
        .attr("cy", 350 - newY);
    }
  }
};
// ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (91L in ref)

// UI wants to set the new colormapping mode to "mode"
const modeSet = function (mode) {
  console.log(`modeSet(${mode}): hello`);
  if (glob.currentMode == mode) return; // nothing to do
  // else do work to display mode "mode"
  updateAxes(mode);
  /* Your code should:
  update the colormap image underneath the scatterplot,
  the position of the marks in the scatterplot, and
  how the states in the US map are filled */
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
  updateColorMapBackground(mode);
  updateStateLocations(glob.currentYear);
  updateStateMapColorsByMode(mode);

  //need to delay because the states' colors are pulled directly from their corresponding data point's pixel coordinates on the canvas
  // and the animation needs to finish first, or else the states pull incorrect colors
  setTimeout(() => {updateStateColors(glob.currentYear);}, 500);
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (3L in ref)
  glob.currentMode = mode;
};

// UI wants to set the near year to "year"
const yearSet = function (year) {
  console.log(`yearSet(${year}): hello`);
  if (glob.currentYear == year) return; // nothing to do
  /* else do work to display year "year". Your code should:
  update the position of the marks in the scatterplot,
  how the states in the US map are filled,
  and the balance bars */
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
  updateVotesAndBars(year);
  updateStateLocations(year);

  //need to delay because the states' colors are pulled directly from their corresponding data point's pixel coordinates on the canvas
  // and the animation needs to finish first, or else the states pull incorrect colors
  setTimeout(() => {updateStateColors(year);}, 500);
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (3L in ref)
  glob.currentYear = year;
};
