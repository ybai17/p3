// hexmap.js: p3 hexagonal map of the US
// Copyright (C)  2022 University of Chicago. All rights reserved.
/*
This is only for students and instructors in the 2022 CMSC 23900 ("DataVis") class, for use in that
class. It is not licensed for open-source or any other kind of re-distribution. Do not allow this
file to be copied or downloaded by anyone outside the 2022 DataVis class.
*/
'use strict';
import { d3 } from './common.js';

// mapResize: set size of SVG to contain US map, based on size of single hex
export const mapResize = function (id, width) {
  d3.select('#' + id)
    .attr('width', 12 * width)
    .attr('height', (8 + 1 / 3) * (Math.sqrt(3) / 2) * width);
};

// gen: generates description of one hexagon in US hexmap, according to passed parameters
export const gen = function (width, scale, abbr, row, col) {
  // variables to simplify tracing hexagon corners
  const dx = (scale * width) / 2;
  const HY = (scale * width) / Math.sqrt(3);
  const dy = HY / 2;
  return ({
    // copy two-letter state abbreviation
    StateAbbr: abbr,
    xy: [ // x,y center of hexagon
      width * (-2 + col + 0.5 * row),
      1 + width * (-0.3 + 0.5 * Math.sqrt(3) * row),
    ],
    // hexagon SVG pathdata
    path: `M${-dx},${dy} l${dx},${dy} l${dx},${-dy} l0,${-HY} l${-dx},${-dy} l${-dx},${dy} Z`,
  });
};

/* mapFill: given the array "data" of per-state hexagons generated by "gen" above, create a "g"
inside element with id "id", within which all the per-state hexagons, and text labels, are added */
export const mapFill = function (id, data) {
  // container for everything in the map
  const themap = d3.select('#' + id);
  // Create one g per state, containing visible hexagon, and two-letter abbreviation text
  let perStateG = themap
    .selectAll('g.state') // select all the (sub)g's with class "state"
    .data(data)
    .join('g')
    .attr('class', 'state') // to satisfy the correspondence created with .selectAll above
    .attr('transform', (d) => `translate(${d.xy[0]},${d.xy[1]})`);
  // append the hexagonal path
  perStateG
    .append('path')
    .attr('class', 'stateHex')
    // note that every hex path gets its own id, eg. 'stateHex_IL'
    .attr('id', d => `stateHex_${d.StateAbbr}`)
    .attr('d', (d) => d.path)
    .style('fill', '#888'); // initialize to gray
  // append the two-letter abbreviation text
  perStateG
    .append('text')
    .attr('class', 'stateID')
    .text((d) => d.StateAbbr);
  // Now, second time through: create another g per state, but just for state outline
  perStateG = themap
    .selectAll('g.stateOutline')
    .data(data)
    .join('g')
    .attr('class', 'stateOutline')
    .attr('transform', (d) => `translate(${d.xy[0]},${d.xy[1]})`);
  perStateG
    .append('path')
    .attr('class', 'stateHexOutline')
    .attr('id', d => `stateHexOutline_${d.StateAbbr}`)
    .attr('d', (d) => d.path)
    .style('fill', 'none');
};
