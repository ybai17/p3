// common.js: things possibly useful across p3
// Copyright (C)  2022 University of Chicago. All rights reserved.
/*
This is only for students and instructors in the 2022 CMSC 23900 ("DataVis") class, for use in that
class. It is not licensed for open-source or any other kind of re-distribution. Do not allow this
file to be copied or downloaded by anyone outside the 2022 DataVis class.
*/
'use strict';

/* import and then export d3. This does depend on having a network connection.  If that is
  inconvenient to you, please post something on EdStem saying so and GLK will try to fix this for
  future assignments. */
import * as d3 from 'https://cdn.skypack.dev/d3@7';
export { d3 };

// parameters that control geometry and appearance
export const parm = {
  transDur: 300, // duration of all transition()s
  circRad: 6, // size of circle marks in scatterplot
  scatSize: 350, // width and height of scatterplot
  colorDem: d3.rgb(40, 50, 255), // color showing pure democratic vote
  colorRep: d3.rgb(230, 30, 20), // color showing pure democratic vote
  hexWidth: 52, // size of individual hexagons in US map
  hexScale: 1,  // hexagon scaling; 1 = edges touching
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (0L in ref)
};

/* global bag of state; could be called "state" but that could be confusing with a US "state". The
  description "global bag of state" is a hint that this is not the cleanest design :) */
export const glob = {
  csvData: {}, // the results of d3.csv() data reads
  /* how the colormap mode is described in the UI.  NOTE: these identifiers
    'RVD', 'PUR', 'LVA' will not change; feel free to use them as magic constant strings throughout
    your code */
  modeDesc: {
    RVD: 'red/blue',
    PUR: 'purple',
    LVA: 'lean-vs-amount',
  },
  currentMode: null, // colormapping mode currently displayed
  currentYear: null, // election year currently displayed
  currentAbbrHide: false, // whether to hide state abbreviations in US map (toggled by 'd')
  scatContext: null, // "context" of scatterplot image canvas
  scatImage: null,   // underlying RGBA pixel data for scatterplot image canvas
  // v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
  voteCategory : ['DN', 'DE', 'RN', 'RE'], //organizing vote counts into the 4 categories for storing

  //a map of years, with each year storing a list of all states and their 4 vote category counts
  //hierarchy looks like:
  //years -> all 50 states -> DN votes, DE votes, RN votes, RE votes for that state in that year

  //ex: go to year 2020, then go to state IL, then find DN, to see the popular votes for Joe Biden (D) in Illinois in the year 2020.
  yearlyVotesByState: {}, 

  //a map of years, with each year storing the TOTAL 4 vote category counts for that year
  //ex: go to year 2020 to see the total D and R popular + electoral votes for 2020
  yearlyTotalVotes: {}, 
  
  //these will store the drawn canvases once they're drawn the first time
  // for ease of access later
  modeImage : {
	  RVD : '',
	  PUR : '',
	  LVA : '',
  },

  //keeps track of the min/max values that help us find the bounds for the RVD, PUR, and LVA scatterplot color maps
  minVotes : 0,
  maxVotes : 0,

  minTotalVotes: 0,
  maxTotalVotes: 0,
  // ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (0L in ref)
}

// little utility functions, use or not as you see fit
export const lerp3 = function (a, b, w) {
  return (1 - w) * a + w * b;
};
export const lerp5 = function (y0, y1, x0, x, x1) {
  const w = (x - x0) / (x1 - x0);
  return (1 - w) * y0 + w * y1;
};
export const clamp = function (a, v, b) {
  return v < a ? a : v > b ? b : v;
};

// define, and export, anything else here that you want to use in p3
// v.v.v.v.v.v.v.v.v.v.v.v.v.v.v  begin student code
// ^'^'^'^'^'^'^'^'^'^'^'^'^'^'^  end student code (0L in ref)
