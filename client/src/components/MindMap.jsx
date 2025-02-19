import { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, IconButton, Slider } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import * as d3 from 'd3';

const MindMap = ({ data }) => {
    const svgRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [transform, setTransform] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!data || !data.nodes || !data.edges || !svgRef.current) return;

        // Clear previous content
        d3.select(svgRef.current).selectAll("*").remove();

        const width = 800;
        const height = 600;
        const margin = { top: 20, right: 90, bottom: 30, left: 90 };

        // Create the SVG container with zoom support
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        // Add zoom behavior
        const zoomBehavior = d3.zoom()
            .scaleExtent([0.1, 3])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
                setZoom(event.transform.k);
                setTransform({ x: event.transform.x, y: event.transform.y });
            });

        svg.call(zoomBehavior);

        // Create a group for the mind map content
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Add edges
        g.selectAll('.edge')
            .data(data.edges)
            .enter()
            .append('path')
            .attr('class', 'edge')
            .attr('d', d => {
                const source = data.nodes.find(n => n.id === d.source);
                const target = data.nodes.find(n => n.id === d.target);
                return d3.linkHorizontal()({
                    source: [source.position.x, source.position.y],
                    target: [target.position.x, target.position.y]
                });
            })
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('stroke-width', 2);

        // Add nodes
        const nodes = g.selectAll('.node')
            .data(data.nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.position.x},${d.position.y})`);

        // Add node circles with dynamic styling
        nodes.append('circle')
            .attr('r', d => d.type === 'root' ? 30 : d.type === 'main' ? 25 : 20)
            .attr('fill', d => d.data.color || '#fff')
            .attr('stroke', d => d.data.color || '#4CAF50')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .on('mouseover', function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', d => (d.type === 'root' ? 35 : d.type === 'main' ? 30 : 25));
            })
            .on('mouseout', function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', d => d.type === 'root' ? 30 : d.type === 'main' ? 25 : 20);
            });

        // Add labels with dynamic positioning and styling
        nodes.append('text')
            .attr('dy', '.31em')
            .attr('y', d => d.type === 'root' ? 45 : 35)
            .attr('text-anchor', 'middle')
            .text(d => d.data.label)
            .style('font-size', d => d.type === 'root' ? '16px' : d.type === 'main' ? '14px' : '12px')
            .style('font-weight', d => d.type === 'root' ? 'bold' : 'normal')
            .call(wrap, 120); // Wrap text if too long

    }, [data]);

    // Function to wrap text
    const wrap = (text, width) => {
        text.each(function() {
            const text = d3.select(this);
            const words = text.text().split(/\s+/).reverse();
            const lineHeight = 1.1;
            const y = text.attr("y");
            const dy = parseFloat(text.attr("dy"));
            let word;
            let line = [];
            let lineNumber = 0;
            let tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    };

    // Handle zoom controls
    const handleZoomIn = () => {
        const svg = d3.select(svgRef.current);
        const zoomBehavior = d3.zoom().scaleExtent([0.1, 3]);
        svg.transition().call(zoomBehavior.scaleBy, 1.2);
    };

    const handleZoomOut = () => {
        const svg = d3.select(svgRef.current);
        const zoomBehavior = d3.zoom().scaleExtent([0.1, 3]);
        svg.transition().call(zoomBehavior.scaleBy, 0.8);
    };

    const handleReset = () => {
        const svg = d3.select(svgRef.current);
        const zoomBehavior = d3.zoom().scaleExtent([0.1, 3]);
        svg.transition().call(zoomBehavior.transform, d3.zoomIdentity);
    };

    if (!data || !data.nodes || !data.edges) {
        return (
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="body1" color="text.secondary">
                    No mind map data available
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    Mind Map Visualization
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={handleZoomOut} size="small">
                        <ZoomOutIcon />
                    </IconButton>
                    <IconButton onClick={handleReset} size="small">
                        <RestartAltIcon />
                    </IconButton>
                    <IconButton onClick={handleZoomIn} size="small">
                        <ZoomInIcon />
                    </IconButton>
                </Box>
            </Box>
            <Box sx={{ 
                width: '100%', 
                height: '600px', 
                overflow: 'hidden',
                border: '1px solid #eee',
                borderRadius: 1,
                position: 'relative'
            }}>
                <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
            </Box>
        </Paper>
    );
};

export default MindMap;
