<script lang="ts">
	// @ts-nocheck
	import type { ListOfAttestations } from './types';
	import { onMount, tick } from 'svelte';
	import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';

	export let authenticatedRelationships: ListOfAttestations = [];

	// Extract relationships data from authenticatedRelationships
	$: relationshipData = 
		authenticatedRelationships.filter((d) => d.key === 'children' || d.key === 'parents')[0]?.value
			?.attestation?.value ||
		{};

	const width = 300;
	const height = 300;

	// Create node and link data structures
	let nodes: any[] = [];
	let links = [];
	let simulation;

	// Process relationship data into nodes and links
	$: {
		// Only process if we have valid relationship data
		if (relationshipData && typeof relationshipData === 'object' && Object.keys(relationshipData).length > 0) {
			// Reset nodes and links
			nodes = [
				{
					id: 'root',
					name: 'Current Asset',
					type: 'root'
				}
			];
			links = [];

			// Process each relationship type
			Object.entries(relationshipData).forEach(([relType, items]) => {
				if (Array.isArray(items) && items.length > 0) {
					// Add relationship type node
					const relNodeId = relType;
					nodes.push({
						id: relNodeId,
						name: relType,
						type: 'relationship'
					});

					// Link from root to relationship type
					links.push({
						source: 'root',
						target: relNodeId
					});

					// Add individual CID nodes
					items.forEach((item, i) => {
						const cidNodeId = `${relType}-${i}`;
						nodes.push({
							id: cidNodeId,
							name:
								item && typeof item === 'object' && '/' in item
									? item['/'].substring(0, 10) + '...'
									: `${relType}-${i}`,
							cid: item && typeof item === 'object' && '/' in item ? item['/'] : '',
							type: 'cid'
						});

						// Link from relationship type to CID
						links.push({
							source: relNodeId,
							target: cidNodeId
						});
					});
				}
			});

			// Position nodes with a static layout (no CPU-intensive simulation)
			initializeSimulation();
		}
	}

	// Position nodes statically without running heavy simulations
	function initializeSimulation() {
		// Skip initialization if no nodes
		if (nodes.length === 0) return;
		
		// Root node at center
		nodes[0].x = width / 2;
		nodes[0].y = height / 2;
		
		// Position relationship nodes in a circle around the root
		const relationshipNodes = nodes.filter(n => n.type === 'relationship');
		const relationshipCount = relationshipNodes.length || 1; // Avoid division by zero
		
		relationshipNodes.forEach((node, i) => {
			const angle = (i / relationshipCount) * 2 * Math.PI;
			const radius = 70;
			node.x = width / 2 + radius * Math.cos(angle);
			node.y = height / 2 + radius * Math.sin(angle);
			
			// Find children IDs for this relationship node
			const childIDs = links
				.filter(link => link.source === node.id || link.source.id === node.id)
				.map(link => link.target);
			
			// Find the actual child nodes
			const childNodes = nodes.filter(n => 
				childIDs.includes(n.id) || childIDs.some(id => id && id.id === n.id)
			);
			
			// Position children in an arc around their parent
			const childCount = childNodes.length || 1;
			childNodes.forEach((childNode, j) => {
				const arcAngle = 0.8; // Arc width in radians
				const childAngle = angle - (arcAngle/2) + (arcAngle * j / childCount);
				const childRadius = 130;
				childNode.x = width / 2 + childRadius * Math.cos(childAngle);
				childNode.y = height / 2 + childRadius * Math.sin(childAngle);
			});
		});
		
		// Set up a very lightweight simulation just for dragging
		// We won't run any ticks on initial load
		simulation = forceSimulation()
			.nodes(nodes)
			.force('link', forceLink(links).id(d => d.id).distance(80))
			.force('charge', forceManyBody().strength(-150))
			.force('center', forceCenter(width / 2, height / 2))
			.alphaTarget(0)
			.alphaDecay(0.1)
			.on('tick', () => {
				// Only called during dragging
				nodes = [...nodes];
				links = [...links];
			});
			
		// Immediately stop the simulation to save CPU
		simulation.stop();
		
		// Force update arrays to trigger Svelte reactivity
		nodes = [...nodes];
		links = [...links];
	}

	function handleDragStart(event, node) {
		if (!simulation) return;

		// Stop simulation during drag
		simulation.alphaTarget(0.3).restart();

		// Store current position
		node.fx = node.x;
		node.fy = node.y;
	}

	function handleDrag(event, node) {
		// Get mouse position relative to SVG
		const svgElement = event.target.ownerSVGElement;
		const rect = svgElement.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		// Update node position
		node.fx = x;
		node.fy = y;
	}

	function handleDragEnd(event, node) {
		if (!simulation) return;

		// Release node after drag ends
		simulation.alphaTarget(0);
		node.fx = null;
		node.fy = null;
	}

	// Define node colors based on type
	function getNodeColor(type) {
		switch (type) {
			case 'root':
				return '#ff7f0e';
			case 'relationship':
				return '#1f77b4';
			case 'cid':
				return '#2ca02c';
			default:
				return '#999';
		}
	}

	// Define node size based on type
	function getNodeRadius(type) {
		switch (type) {
			case 'root':
				return 20;
			case 'relationship':
				return 15;
			case 'cid':
				return 10;
			default:
				return 8;
		}
	}

	onMount(() => {
		return () => {
			// Clean up simulation when component is destroyed
			if (simulation) simulation.stop();
		};
	});
</script>

<svg {width} {height} class="network-chart">
	<!-- Render links -->
	{#each links as link}
		<line
			x1={link.source.x || 0}
			y1={link.source.y || 0}
			x2={link.target.x || 0}
			y2={link.target.y || 0}
			stroke="#999"
			stroke-opacity="0.8"
			stroke-width="2"
		>
		</line>
	{/each}

	<!-- Render nodes -->
	{#each nodes as node}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<g
			transform="translate({node.x || 0},{node.y || 0})"
			on:mousedown={(e) => handleDragStart(e, node)}
			on:mousemove={(e) => handleDrag(e, node)}
			on:mouseup={(e) => handleDragEnd(e, node)}
			on:mouseleave={(e) => handleDragEnd(e, node)}
		>
			<circle
				r={getNodeRadius(node.type)}
				fill={getNodeColor(node.type)}
				stroke="#fff"
				stroke-width="1.5"
			>
			</circle>

			<text
				dy={node.type === 'root' ? 30 : node.type === 'relationship' ? 25 : 20}
				text-anchor="middle"
				font-size="10px"
				fill="#333"
			>
				{node.name}
			</text>
		</g>
	{/each}
</svg>

<style>
	.network-chart {
		background-color: #f9f9f9;
		border-radius: 5px;
		width: 100%;
		height: 100%;
	}

	/* Make nodes interactive */
	g {
		cursor: pointer;
	}

	g:hover circle {
		filter: brightness(1.2);
	}
</style>
