import { writable } from 'svelte/store';
import type { EndpointConfig } from './index';

// Initial endpoint configs
const defaultEndpoints: EndpointConfig[] = [
  {
    name: 'chris',
    url: 'https://chris.aa.prod.starlinglab.org'
  },
  {
    name: 'kira',
    url: 'https://kira.aa.prod.starlinglab.org'
  }
];

// Load endpoints from localStorage on init
const initEndpoints = (): EndpointConfig[] => {
  if (typeof localStorage !== 'undefined') {
    const storedEndpoints = localStorage.getItem('aa-explorer-endpoints');
    if (storedEndpoints) {
      try {
        const parsedEndpoints = JSON.parse(storedEndpoints) as EndpointConfig[];
        if (parsedEndpoints && parsedEndpoints.length > 0) {
          return parsedEndpoints;
        }
      } catch (e) {
        console.error('Failed to parse stored endpoints:', e);
      }
    }
  }
  return [...defaultEndpoints];
};

// Create a writable store for endpoints
export const endpoints = writable<EndpointConfig[]>(initEndpoints());

// Save endpoints to localStorage whenever they change
endpoints.subscribe(value => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('aa-explorer-endpoints', JSON.stringify(value));
  }
});