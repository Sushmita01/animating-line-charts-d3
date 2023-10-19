# Animating Line Charts with D3: Global Developments dataset

We apply knowledge about D3 animations and joins to create a multi-line chart (i.e., a line chart with multiple lines) that interactively updates as countries and attributes for the dataset are changed. 

It includes the following aspects:

- Used the Global Development dataset (`global_development.csv`) from the CORGIS website for use in your visualization. Selected ten attributes of interest that you want to visualize.
- Displayed a line chart that shows a user-selected set of countries (one country per line) over the dataset's time range of 1980-2013.
- Using HTML controls, the user can change (1) which countries are shown in the line chart, and (2) which global development attribute is being visualized. When countries are added/removed, or when the attribute is changed, the line chart animates from the "previous state" to the updated one.
- Additionally, the user should be able to invoke a "playback" option, which will re-draw the line chart, drawing the lines from left-to-right using animations.
- The line chart shows several countries across a time range (one country per line). You can select a development indicator you want to visualize on the y-axis. When you do this, the chart will update to plot the new attribute's data. 
- You can also add and remove countries from the chart. 
- When you hover over a country's line, all of the other lines on the chart are de-emphasized by making them semi-transparent. 
- Clicking the play button animates the lines across the x-axis's time range. 
