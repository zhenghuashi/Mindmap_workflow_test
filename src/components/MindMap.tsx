import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Idea, Theme, THEME_HEX_COLORS } from '../types';

interface MindMapProps {
  ideas: Idea[];
  themes: Theme[];
}

export function MindMap({ ideas, themes }: MindMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || themes.length === 0) return;

    const width = 800;
    const height = 600;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])
      .attr('width', '100%')
      .attr('height', '100%');

    // Create hierarchy
    const rootData = {
      name: 'Brainstorm',
      children: themes.map((t, i) => ({
        name: t.label,
        color: THEME_HEX_COLORS[i % THEME_HEX_COLORS.length],
        children: ideas
          .filter(id => id.themeId === t.id)
          .map(id => ({ name: id.text.length > 30 ? id.text.substring(0, 30) + '...' : id.text }))
      }))
    };

    const root = d3.hierarchy(rootData);
    const treeLayout = d3.tree().size([height - 100, width - 200]);
    treeLayout(root);

    const g = svg.append('g').attr('transform', 'translate(100, 50)');

    // Add links
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 2)
      .attr('d', d3.linkHorizontal<any, any>()
        .x(d => d.y)
        .y(d => d.x)
      );

    // Add nodes
    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`);

    node.append('circle')
      .attr('r', d => (d.depth === 0 ? 8 : d.depth === 1 ? 6 : 4))
      .attr('fill', (d: any) => d.data.color || (d.depth === 0 ? '#111827' : '#94a3b8'));

    node.append('text')
      .attr('dy', '0.31em')
      .attr('x', d => (d.children ? -10 : 10))
      .attr('text-anchor', d => (d.children ? 'end' : 'start'))
      .text((d: any) => d.data.name)
      .style('font-size', d => (d.depth === 0 ? '16px' : d.depth === 1 ? '14px' : '11px'))
      .style('font-weight', d => (d.depth === 0 ? '700' : d.depth === 1 ? '600' : '400'))
      .style('fill', '#374151')
      .clone(true).lower()
      .attr('stroke', 'white')
      .attr('stroke-width', 3);

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    svg.call((zoom as any));

  }, [ideas, themes]);

  return (
    <div className="w-full h-[600px] bg-gray-50/50 rounded-3xl border border-gray-100 overflow-hidden cursor-move">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
