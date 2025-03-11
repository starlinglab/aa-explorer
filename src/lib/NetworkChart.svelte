<script lang="ts">
	import { onMount } from 'svelte';
	import { shortenCID, navigateToCID } from '$lib/index';
	import type { ListOfAttestations } from './types';

	import * as d3 from 'd3';
	import type { Simulation, SimulationLinkDatum, SimulationNodeDatum } from 'd3';

	export let authenticatedRelationships: ListOfAttestations = [];

	// Define types for our nodes and links
	interface NodeDatum extends SimulationNodeDatum {
		id: string;
		name: string;
		type: 'root' | 'relationship' | 'cid';
		cid?: string;
		fx?: number | null;
		fy?: number | null;
		x?: number;
		y?: number;
	}

	interface LinkDatum extends SimulationLinkDatum<NodeDatum> {
		source: string | NodeDatum;
		target: string | NodeDatum;
	}

	// Extract relationships data from authenticatedRelationships with improved error handling
	$: relationshipData = (() => {
		try {
			const attestation = authenticatedRelationships.find(
				(d) => d.key === 'children' || d.key === 'parents'
			);
			// Safely access the relationship data
			if (attestation?.value?.attestation?.value) {
				return attestation.value.attestation.value;
			}
			return {};
		} catch (err) {
			console.error('Error extracting relationship data:', err);
			return {};
		}
	})();

	// Use reactive variables for responsive sizing
	let containerWidth = 0;
	let containerHeight = 0;

	// Derived values for the SVG dimensions
	$: width = containerWidth || 100;
	// Make height a fraction of width to ensure width > height, but cap at 450px
	$: height = Math.min(Math.max(width * 0.5, 150), 450);

	// Update simulation center when dimensions change
	$: if (simulation && width && height) {
		simulation.force('center', d3.forceCenter<NodeDatum>(width / 2, height / 2));
		simulation.alpha(0.3).restart(); // Gently restart the simulation
	}

	// Create node and link data structures
	let nodes: NodeDatum[] = [];
	let links: LinkDatum[] = [];
	let simulation: Simulation<NodeDatum, LinkDatum>;

	// Process relationship data into nodes and links
	$: {
		// Only process if we have valid relationship data
		if (
			relationshipData &&
			typeof relationshipData === 'object' &&
			Object.keys(relationshipData).length > 0
		) {
			// Reset
			// @prettier-ignore
			nodes = [{ id: 'root', name: 'Current Asset', type: 'root' as const }];
			links = [];

			// Process each relationship type
			Object.entries(relationshipData).forEach(([relType, items]) => {
				if (Array.isArray(items) && items.length > 0) {
					// Add relationship type node
					const relNodeId = relType;
					nodes.push({
						id: relNodeId,
						name: relType,
						type: 'relationship' as const
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
								cidValue = item.toString();
								if (cidValue && cidValue.length > 0) {
									displayName = shortenCID(cidValue);
								}
							}
						} catch (err) {
							console.error('Error processing CID:', err);
						}

						nodes.push({
							id: cidNodeId,
							name: displayName,
							cid: cidValue,
							type: 'cid' as const
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
	function initializeSimulation(): void {
		// Skip initialization if no nodes
		if (nodes.length === 0) return;

		// Set up a more dynamic force simulation
		simulation = d3
			.forceSimulation<NodeDatum, LinkDatum>(nodes)
			.force(
				'link',
				d3
					.forceLink<NodeDatum, LinkDatum>(links)
					.id((d: NodeDatum) => d.id)
					.distance((link: LinkDatum) => {
						const source =
							typeof link.source === 'object'
								? link.source
								: nodes.find((n) => n.id === link.source);
						const target =
							typeof link.target === 'object'
								? link.target
								: nodes.find((n) => n.id === link.target);

						// Root to relationship links are longer
						if (source?.id === 'root' || target?.id === 'root') {
							return 100;
						}
						// Other links are shorter
						return 60;
					})
			)
			// Stronger charge for more dynamic layout
			.force(
				'charge',
				d3.forceManyBody<NodeDatum>().strength((d: NodeDatum) => {
					// Relationships have stronger repulsion
					if (d.type === 'relationship') return -400;
					// Root has strongest repulsion
					if (d.type === 'root') return -600;
					// CIDs have weaker repulsion
					return -150;
				})
			)
			// Add horizontal force to spread nodes more in the x-direction
			.force(
				'x',
				d3
					.forceX()
					.strength(0.2)
					.x((d) => {
						// Spread relationship nodes horizontally
						if ((d as NodeDatum).type === 'relationship') {
							const idx = nodes.findIndex((n) => n.id === (d as NodeDatum).id);
							return width / 2 + (idx % 2 === 0 ? -1 : 1) * width * 0.22;
						}
						return width / 2;
					})
			)
			// Keep everything centered
			.force('center', d3.forceCenter<NodeDatum>(width / 2, height / 2))
			.force(
				'collide',
				d3.forceCollide<NodeDatum>((d: NodeDatum) => {
					if (d.type === 'root') return 25;
					if (d.type === 'relationship') return 20;
					return 15;
				})
			)
			.alpha(1)
			.alphaDecay(0.02)
			.velocityDecay(0.3);

		// Add a y-force that's weaker than the x-force to create an elliptical layout
		simulation.force('y', d3.forceY(height / 2).strength(0.13));

		// Run a few ticks to get initial positions
		for (let i = 0; i < 30; i++) {
			simulation.tick();
		}

		simulation.on('tick', () => {
			nodes = [...nodes];
			links = [...links];
		});

		// Force update arrays to trigger Svelte reactivity
		nodes = [...nodes];
		links = [...links];
	}

	function handleDragStart(event: MouseEvent, node: NodeDatum): void {
		if (!simulation) return;
		simulation.alphaTarget(0.3).restart();
		node.fx = node.x;
		node.fy = node.y;
	}

	function handleDrag(event: MouseEvent, node: NodeDatum): void {
		// Get mouse position relative to SVG
		const svgElement = event.target as SVGElement;
		const ownerSVG = svgElement.ownerSVGElement;
		if (!ownerSVG) return;

		const rect = ownerSVG.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		// Update node position
		node.fx = x;
		node.fy = y;
	}

	function handleDragEnd(event: MouseEvent, node: NodeDatum): void {
		if (!simulation) return;

		// Release node after drag ends
		simulation.alphaTarget(0);
		node.fx = null;
		node.fy = null;
	}

	// Scales
	const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
	const nodeRadiusScale = d3
		.scaleOrdinal<NodeDatum['type'], number>()
		.domain(['root', 'relationship', 'cid'])
		.range([20, 15, 10]);

	function getNodeColor(type: NodeDatum['type']): string {
		return colorScale(type);
	}
	function getNodeRadius(type: NodeDatum['type']): number {
		return nodeRadiusScale(type) || 8;
	}

	onMount(() => {
		// Clean up simulation when component is destroyed
		return () => {
			if (simulation) simulation.stop();
		};
	});
</script>

<div class="chart-container" bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
	<svg {width} {height} class="network-chart">
		{#each links as link}
			<line
				x1={(link.source as NodeDatum).x || 0}
				y1={(link.source as NodeDatum).y || 0}
				x2={(link.target as NodeDatum).x || 0}
				y2={(link.target as NodeDatum).y || 0}
				stroke="#999"
				stroke-opacity="0.8"
				stroke-width="2"
			>
			</line>
		{/each}

		{#each nodes as node}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- Group for positioning and drag events -->
			<g
				transform="translate({node.x || 0},{node.y || 0})"
				on:mousedown={(e) => handleDragStart(e, node)}
				on:mousemove={(e) => handleDrag(e, node)}
				on:mouseup={(e) => handleDragEnd(e, node)}
				on:mouseleave={(e) => handleDragEnd(e, node)}
			>
				{#if node.type === 'cid' && node.cid}
					<!-- Wrap clickable nodes in a11y-friendly group -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<g
						class="clickable"
						on:click={(e) => navigateToCID(e, node.cid)}
						on:keydown={(e) => e.key === 'Enter' && navigateToCID(e, node.cid)}
						tabindex="0"
						role="link"
						aria-label={`Navigate to ${node.name}`}
					>
						<circle
							r={getNodeRadius(node.type)}
							fill={getNodeColor(node.type)}
							stroke="#fff"
							stroke-width="1"
						>
						</circle>

						<text dy="20" text-anchor="middle" font-size="9px" fill="#333">
							{node.name}
						</text>
					</g>
				{:else}
					<circle
						r={getNodeRadius(node.type)}
						fill={getNodeColor(node.type)}
						stroke="#fff"
						stroke-width="1"
					>
					</circle>

					<text
						dy={node.type === 'root' ? 30 : node.type === 'relationship' ? 25 : 20}
						text-anchor="middle"
						font-size="9px"
						fill="#333"
						stroke="#fff"
						stroke-width="2"
						paint-order="stroke"
					>
						{node.name}
					</text>
				{/if}
			</g>
		{/each}
	</svg>
</div>

<style>
	.chart-container {
		width: 100%;
		height: 450px; /* Reduced height to make it wider than tall */
		max-height: 450px;
	}

	.network-chart {
		background-color: #f9f9f9;
		border-radius: 5px;
		width: 100%;
		height: 100%;
	}

	g:hover circle {
		filter: brightness(1.2);
	}

	.clickable {
		cursor: pointer;
	}
</style>
