function createGraph() {
    // Our data we're working with
    let line = [
        { x: 100, y: 150 },
        { x: 110, y: 140 },
        { x: 120, y: 120 },
        { x: 150, y: 80 },
        { x: 90, y: 70 },
        { x: 40, y: 60 },
        { x: 10, y: 50 }
    ]

    let linePairs = line.reduce(function (result, value, index, array) {
        if (index < line.length - 1)
            result.push([value, array[index + 1]]);
        return result;
    }, []);

    // Draw it. 
    let width = 1000; // outer width; in pixels
    let height = 680; // outer height; in pixels
    const svg = d3.select('#svg_container').append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    svg.append("g")
        .attr("transform", "translate(-200,0)")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .selectAll("line")
        .data(linePairs)
        .join("line")
        .attr("x1", d => d[0].x)
        .attr("y1", d => d[0].y)
        .attr("x2", d => d[1].x)
        .attr("y2", d => d[1].y);

    svg.append("g")
        .attr("transform", "translate(-200,0)")
        .attr("fill", "blue")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .selectAll("circle")
        .data(line)
        .join("circle")
        .attr("r", 3)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    // Replace the input nodes and links with mutable objects for the simulation.
    let nodes = line.map((p, index) => {
        return {
            x: p.x,
            y: p.y,
            id: index,
        }
    });

    nodes = nodes.concat(line.map((p, index) => {
        return {
            fx: p.x,
            fy: p.y,
            id: index + line.length,
            isFixed: true,
        }
    }))

    let links = line.map((item, index) => {
        return {
            source: index,
            target: index + 1,
        };
    });
    links.pop();
    links.push(...line.map((item, index) => {
        return {
            source: index,
            target: index + line.length,
        };
    }));

    // default node repulsion
    const forceNode = d3.forceManyBody().strength(-30);

    const forceLink = d3.forceLink(links).id(({ index: i }) => nodes[i].id);
    forceLink.strength(1);

    const simulation = d3.forceSimulation(nodes)
        .force("link", forceLink)
        .force("charge", forceNode)
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .on("tick", ticked);

    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", "#999")
        .attr("stroke-width", 1.5);

    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("fill", "green")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .attr("r", 5)
        .call(getD3Drag(simulation));

    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

    function getD3Drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
}

document.addEventListener('DOMContentLoaded', function (e) {
    createGraph();
});