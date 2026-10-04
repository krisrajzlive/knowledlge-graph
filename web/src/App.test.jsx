import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('react-force-graph-2d', () => ({ default: () => <div data-testid="force-graph" /> }));

const graph = {
  nodeCount: 2, linkCount: 1,
  communities: [{ id: 0, name: 'auth', size: 2 }],
  nodes: [
    { id: 'a', label: 'AuthService', community: 0, communityName: 'auth' },
    { id: 'b', label: 'hashPassword()', community: 0, communityName: 'auth' },
  ],
  links: [{ source: 'a', target: 'b', relation: 'calls' }],
};
const nodeDetail = {
  node: graph.nodes[0], degree: 1,
  neighbors: [{ id: 'b', relation: 'calls', direction: 'out', node: graph.nodes[1] }],
};

const json = (body) => Promise.resolve({ ok: true, json: () => Promise.resolve(body), text: () => Promise.resolve('# Report') });

beforeEach(() => {
  global.fetch = vi.fn((url) => {
    if (url.startsWith('/api/graph')) return json(graph);
    if (url.startsWith('/api/god-nodes')) return json([{ ...graph.nodes[0], degree: 1 }]);
    if (url.startsWith('/api/node')) return json(nodeDetail);
    if (url.startsWith('/api/report')) return json('');
    return json([]);
  });
});

describe('App', () => {
  it('renders graph stats and god nodes', async () => {
    const { default: App } = await import('./App.jsx');
    render(<App />);
    expect(await screen.findByTestId('stats')).toHaveTextContent('2 nodes · 1 edges · 1 communities');
    expect(screen.getByTestId('force-graph')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'God nodes' })).toHaveTextContent('AuthService');
  });

  it('shows node details when a god node is selected', async () => {
    const { default: App } = await import('./App.jsx');
    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'AuthService' }));
    const details = await screen.findByTestId('details');
    await waitFor(() => expect(details).toHaveTextContent('hashPassword()'));
  });

  it('shows an error when no graph exists', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({ error: 'No graph found' }) }));
    const { default: App } = await import('./App.jsx');
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent('No graph found');
  });
});
