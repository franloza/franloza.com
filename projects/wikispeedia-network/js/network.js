//Global variables
var allNodes;
var allEdges;
var terms;
var nodesLoaded = false;
var edgesLoaded = false;

function createNetwork (term) {
    var container = $('#network')[0]

    if(terms.indexOf(term) != -1) {
        //Activate loader
        $('#loader').show();   
        $('#search').hide();

        //Select the first node if there is in the id list
        var firstNode = allNodes.get({
        filter: function (item) {
            return item.label == term;
        }
        });

        //Get all the edges related to this node
        var firstEdges = allEdges.get({
        filter: function (item) {
            return item.from == firstNode[0].id;
        }
        });

        var edges = new vis.DataSet(firstEdges)
        var ids = edges.distinct("to");

        //Add the edges of the related nodes
        try {
            edges.add(allEdges.get({
            filter: function (item) {
                return ids.indexOf(item.from) != -1;
            }
        }));
        } catch (err) {
            console.error(err)
        }
    
        //Get all the nodes that are related to the first node
        var firstNodes = allNodes.get({
        filter: function (item) {
            return ids.indexOf(item.id) != -1;
        }
        });
        var nodes = new vis.DataSet(firstNodes);

        //Add the first node to the dataset of nodes
        try {
            nodes.add(firstNode[0]);
        } catch (err) {
            console.error(err)
        }

        // Set the data model
        var data = {
            nodes: nodes,
            edges: edges
        };

        //Set the options
        var options = {
            autoResize: true,
            height: '100%',
            width: '100%',
            locale: 'en',
            configure: {
                enabled:false,
                filter:false,
                showButton:true
            },    
            edges: {
            },        
            nodes: {
                color: '#DB8433',
                fixed: false,
                font: '12px sans white',
                shadow: true,
                scaling: {
                    min: 10,
                    max: 100,
                    label: {
                        enabled: true,
                        min: 14,
                        max: 100,
                        maxVisible: 80,
                        drawThreshold: 5
                    },
                },
                shape:"ellipse"
            },        
            groups: {},       
            layout: {},       
            interaction: {},  
            manipulation: {
                enabled:false,
                initiallyActive:false
            }, 
            physics: {
                repulsion: {
                    centralGravity: 0.2,
                    springLength: 200,
                    springConstant: 0.05,
                    nodeDistance: 100,
                    damping: 0.09
                },
                stabilization: true,
                solver: 'repulsion',
            }     
        };
                
        // Initialize the network
        var network = new vis.Network(container, data, options);
        network.disableEditMode();
        network.focus(firstNode[0].id.toString());
        network.selectNodes([firstNode[0].id.toString()])

        //Hide the loader and show the network after loading
        network.on("afterDrawing", function(canvas,context) {
            $('#loader').hide();   
            $('#search').show();        
        });
    } 
    else {
        //The term does not exists
        $('#dialog-error').modal('show');
    }
}

function loadData() {
    //Load nodes
    $.ajax({
        url: 'data/Nodes.json',
        mimeType: "application/json",
        dataType: 'json',
        success: function (json) {
            allNodes = new vis.DataSet(json);
            //Load term list
            terms = allNodes.get({fields: ['label']})
                .map(function(item) {
                    return item['label'];
            });
            //Autocomplete 
            $('#termBox').autocomplete({
                source: terms,
                minLength: 3,
                delay: 0,
                autoFocus: true
            });
            nodesLoaded = true;
            if (edgesLoaded) {
                $('#loader').hide();   
                $('#search').show();
            }
        }
    });

    //Load edges
    $.ajax({
        url: 'data/Edges.json',
        mimeType: "application/json",
        dataType: 'json',
        success: function (json) {
        allEdges = new vis.DataSet(json);
        edgesLoaded = true;
        if (nodesLoaded) {
                $('#loader').hide();   
                $('#search').show();
            }
        }
    });
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



