## p3: Colormapping US Presidential election data

The purpose of this project is to finish implementing a little visualization tool that allows exploration of US Presidential election data. The colormapping used to display the election data is important for the project, but the project is less about colormapping per se than it is about data wrangling and basic user interaction.

More than in p2, there is a lot of framework code given to you, which you work within and thus need to understand, so start **now** by reading through the given code, and looking at the given index.html with a browser (using the JavaScript Developer tools to go through the various elements), to see how it is all put together.

The EdStem post about p3 will be most up-to-date and authoritative source for information about this project and how to do its work.

### Elements of the visualization

- Two "balance" bars on top show the Democratic (D) and Republican (R) votes, both popular and from the Electoral College (abbreviated for this documentation as EC), visually and textually.
- The US map shows a hexagon for each state (which GLK adapted from [NPR](https://blog.apps.npr.org/2015/05/11/hex-tile-maps.html)), identified by the two-letter abbreviation, and colored by information about the votes in that state, for the currently selected year.
- A two-dimensional scatterplot, which shows circles for all the states, drawn over a canvas in which you draw the colormap
- A timeline slider for going through the years in the data
- Radio buttons for choosing the mode of scatterplot and colormap

As a hack, typing 'd' will toggle whether the state abbreviations are displayed.

### Data files

The visualization is structured and displayed according to information in various CSV data files in the "data" subdirectory.

- votes.csv: There is a row for every state, plus District of Columbia (for p3 we can generically call these entities "states", even though DC is not currently a state). The columns are the two-letter state abbreviation and then information about Democratic ("D") and Republican ("R") votes over a range of years, as described next. Your code should be visualizating this data, and not hardcoding any of the numeric values. Grading may involve alternative votes.csv files, with the same rows and columns, but different numeric values.
- stateNames.csv: the columns are just the two-letter state abbreviation and the full state name.
- hexRC.csv: The hexagonal grid coordinates for every state.
- candidateNames.csv: Names of D and R Presidential candidates for a range of years.

### Terminology of numbers and variables:

Introducing some variable names is useful for describing work to d. The first four of these are consistent with the columns in votes.csv, which you should confirm by reading the first line of votes.csv.

- DN: Number of Democratic popular votes, per-state
- DE: number of Democratic EC votes, per-state
- RN: Number of Republican popular votes, per-state
- RE: number of Republican EC votes, per-state
- TN (total number of votes): TN = DN + RN
- PL (political leaning): PL = 2\*RN/(1 + TN) - 1, which will go from -1 to 1 as the political leaning of a state goes from pure Democratic to pure Republican. The "1 +TN" is to avoid divide-by-zeros even when TN is unexpectedly 0.
- DA (D "voting amount", a term chosen because it has no specific pre-existing meaning): DA = W1(DN), where W1 is some monotonic 'warping' function that **you design**, with the purpose of spreading out states in the scatterplot and in the colormap domain. We are focused on supporting more _ordinal_ judgments about the voting numbers, hence the need of some monotonic function. You could try W1(N) = N, but you'll find that the massive states CA and TX dwarf out all other states.
- RA = W1(RN): same warping function W1 applied to RN
- VA (over-all voting amount) = W2(TN), a potentially different monotonic warping function W2 applied to TN, which you design to spread out states in the vertical axis of mode LVA.

### Colormap and scatterplot modes:

The modes that determine the appearance of the scatterplot, and the colors underneath it, are:

- 'RVD' (republican-vs-democratic): the scatterplot shows R votes increasing left to right (specifically, the X location is determined by RA), D votes increasing bottom to top (as determined by DA), and the colormap is simply either red or blue (use the parm.colorRep and parm.colorDem values defined in common.js) according to whichever one is larger. For nearly all states, which determine the EC votes by popular votes, this shows how the state contributed to the 538 total EC votes, which is what determines the US president. Maine and Nebraska are unfortunately colored in a way that doesn't reflect how their EC votes are allocated differently (and potentially not all for one candidate).
- 'PUR' (shades of purple): the scatterplot is the same as in RVD. The colormap goes between parm.colorDem and parm.colorRep through some purple, in a way that you choose. Despite being drawn in the two-dimensional domain of the scatterplot, this colormap should only be a function of PL (not a function of DN or RN separately), nor a function of RA/(1+DA+RA).
- 'LVA' (lean-vs-amount): X direction of the scatterplot show PL, and Y direction shows VA. Figure out a colormap that increases luminance with increasing VA, while creating a double-ended colormap (with luminance as constant as possible) for PL. As PL goes from -1 to 0 to 1 at the highest possible VA, the color should go from parm.colorDem, to a bright gray, to parm.colorRep. For lesser VA, mimic the hue and saturation of this path, but decrease the luminance.

### Required user interactions

- The radio buttons underneath the scatterplot change the colormap mode. Changing the mode causes the states in the US map to be re-colored to reflect the new mode, and the scatterplot marks to be moved if necessary.
- The timeline slider underneath the US map selects the current year to display. Changing the year causes the states in the US map to be re-colored to reflect the new year, the scatterplot marks to move, and the balance beams to update.
- Changes in the US map state fill color, and the scatterplot mark locations, should transition with duration parm.transDur
- Mousing over one of the US map states, or one of the scatterplot marks, brings up a tooltip showing: the full state name, the current year, and some organized presentation of the numbers for that state in that year (popular and electoral votes, D and R).
- Whether by mousing over the hexagonal state or the scatterplot mark, the state being described by the tooltip is highlighted in both the US map and the scatterplot, so that you can see, for a given state in the map, where exactly is it in the scatterplot, and vice versa.

Optional user interaction (modest extra credit): for the currently highlighted state, a path is drawn in the scatterplot that shows the trajectory of the state over time, through the scatterplot domain. The path thickness should be (slightly) thicker for later years than for earlier years, so that the temporal trend is evident.

## Provenance of the voting data

Election year data was gathered by GLK from the wikipedia pages about each presidential election e.g. https://en.wikipedia.org/wiki/2020_United_States_presidential_election and its links to previous elections. Then https://wikitable2csv.ggor.de/ was used to extract a csv from the "Results by State" section of the page. The sums for popular and Electoral College votes for Maine and Nebraska (the two states that allocate the EC votes differently) were double-checked with the pages for those particular states (e.g. [this](https://en.wikipedia.org/wiki/2020_United_States_presidential_election_in_Maine) and [this](https://en.wikipedia.org/wiki/2020_United_States_presidential_election_in_Nebraska)). It was noted that sometimes the footer row for the per-candidate popular vote totals in the Results by State table (e.g. [in 1992](https://en.wikipedia.org/wiki/1992_United_States_presidential_election#Results_by_state)) did not equal the sum of the popular votes in the states (!).

Election year 1968 was not included since [that year](https://en.wikipedia.org/wiki/1968_United_States_presidential_election) the segregationist George Wallace got 46 Electoral College votes in the "American Independent" party (neither Democratic or Republican), which would complicate the visualization. Our visualization also skips the role of Ross Perot, an independent candidate in 1992 and 1996, who got a significant number of popular votes, but zero Electoral College votes.
