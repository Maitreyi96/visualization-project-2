d3.helper = {};

d3.helper.tooltip = function(accessor){
    return function(selection){
        var tooltipDiv;
        var bodyNode = d3.select('body').node();
        selection.on("mouseover", function(d, i){
            
            d3.select('body').selectAll('div.tooltip').remove();
            
            tooltipDiv = d3.select('body').append('div').attr('class', 'tooltip_graph3');
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
                .style('top', (absoluteMousePos[1] - 15)+'px')
                .style('position', 'absolute')
                .style('z-index', 1001);
            
            var tooltipText = accessor(d, i) || '';
            
        })
        .on('mousemove', function(d, i) {
            
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
                .style('top', (absoluteMousePos[1] - 15)+'px');
            var tooltipText = accessor(d, i) || '';
            tooltipDiv.html(tooltipText);
        })
        .on("mouseout", function(d, i){
        
            tooltipDiv.remove();
        });

    };
};
