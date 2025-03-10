<script lang="ts">
	// @ts-nocheck
	import type { ListOfAttestations } from './types';
	import { onMount, tick } from 'svelte';
	import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';

	export let authenticatedRelationships: ListOfAttestations = [];

	// Extract relationships data from authenticatedRelationships
	$: relationshipData =
		authenticatedRelationships.filter((d) => d.key === 'children' || d.key === 'parents')[0]?.value
			?.attestation?.value || {};

	const width = 300;
	const height = 300;

	// Create node and link data structures
	let nodes = [];
	let links = [];
	let simulation;

	// Process relationship data into nodes and links
	$: {
		// Only process if we have valid relationship data
		if (
			relationshipData &&
			typeof relationshipData === 'object' &&
			Object.keys(relationshipData).length > 0
		) {
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

						// Safely extract CID value and create display name
						let cidValue = '';
						let displayName = `${relType}-${i}`;

						try {
							if (item && typeof item === 'object' && '/' in item) {
								cidValue = String(item['/'] || '');

								if (cidValue && cidValue.length > 0) {
									displayName = cidValue.substring(0, 10) + '...';
								}
							}
						} catch (err) {
							console.error('Error processing CID:', err);
						}

						nodes.push({
							id: cidNodeId,
							name: displayName,
							cid: cidValue,
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

			// Set up D3 force simulation
			initializeSimulation();
		}
	}

	// Let D3 force layout handle node positioning
	function initializeSimulation() {
		// Skip initialization if no nodes
		if (nodes.length === 0) return;

		// Set up a more dynamic force simulation
		simulation = forceSimulation(nodes)
			.force(
				'link',
				forceLink(links)
					.id((d) => d.id)
					.distance((node) => {
						// Root to relationship links are longer
						if (node.source.id === 'root' || node.target.id === 'root') {
							return 100;
						}
						// Other links are shorter
						return 60;
					})
			)
			// Stronger charge for more dynamic layout
			.force(
				'charge',
				forceManyBody().strength((d) => {
					// Relationships have stronger repulsion
					if (d.type === 'relationship') return -300;
					// Root has strongest repulsion
					if (d.type === 'root') return -500;
					// CIDs have weaker repulsion
					return -100;
				})
			)
			// Keep everything centered
			.force('center', forceCenter(width / 2, height / 2))
			// Prevent node overlap
			.force(
				'collide',
				forceCollide((d) => {
					// Size based on node type plus padding
					if (d.type === 'root') return 25;
					if (d.type === 'relationship') return 20;
					return 15;
				})
			)
			// Make simulation run more gradually
			.alpha(1)
			.alphaDecay(0.02)
			.velocityDecay(0.3);

		// Run a few ticks to get initial positions
		for (let i = 0; i < 20; i++) {
			simulation.tick();
		}

		// Update reactivity and setup tick handler
		simulation.on('tick', () => {
			nodes = [...nodes];
			links = [...links];
		});

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
