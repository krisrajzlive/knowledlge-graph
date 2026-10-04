import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { analyze, getGraph, getGodNodes, getNode, getReport, searchNodes } from './api.js';
import { communityColor } from './colors.js';

export default function App() {
  const [graph, setGraph] = useState(null);
  const [godNodes, setGodNodes] = useState([]);
  const [report, setReport] = useState('');
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [tab, setTab] = useState('explore');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const fg = useRef();

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const [g, gods] = await Promise.all([getGraph(), getGodNodes()]);
      setGraph({ nodes: g.nodes.map((n) => ({ ...n })), links: g.links.map((l) => ({ ...l })), meta: g });
      setGodNodes(gods);
      getReport().then(setReport).catch(() => setReport(''));
      setStatus('ready');
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return undefined; }
    const t = setTimeout(() => searchNodes(query).then(setResults).catch(() => setResults([])), 200);
    return () => clearTimeout(t);
  }, [query]);

  const select = useCallback(async (id) => {
    try {
      setSelected(await getNode(id));
      setTab('explore');
      const node = graph?.nodes.find((n) => n.id === id);
      if (node && fg.current && node.x !== undefined) {
        fg.current.centerAt(node.x, node.y, 600);
        fg.current.zoom(3, 600);
      }
    } catch (e) {
      setError(e.message);
    }
  }, [graph]);

  const runAnalysis = async () => {
    setStatus('loading');
    try { await analyze(); await load(); } catch (e) { setError(e.message); setStatus('error'); }
  };

  const highlighted = useMemo(() => {
    if (!selected) return new Set();
    return new Set([selected.node.id, ...selected.neighbors.map((n) => n.id)]);
  }, [selected]);

  return (
    <div className="app">
      <header>
        <h1>Codebase Knowledge Graph</h1>
        {graph && (
          <span className="stats" data-testid="stats">
            {graph.meta.nodeCount} nodes · {graph.meta.linkCount} edges · {graph.meta.communities.length} communities
          </span>
        )}
        <button onClick={runAnalysis} disabled={status === 'loading'}>Re-analyze</button>
      </header>

      <main>
        <section className="canvas">
          {status === 'error' && (
            <div className="notice" role="alert">
              {error} <button onClick={runAnalysis}>Run analysis</button>
            </div>
          )}
          {graph && (
            <ForceGraph2D
              ref={fg}
              graphData={graph}
              nodeLabel={(n) => `${n.label} (${n.communityName})`}
              nodeColor={(n) => (highlighted.size && !highlighted.has(n.id) ? '#3a3f4b' : communityColor(n.community))}
              linkColor={() => '#556'}
              linkDirectionalArrowLength={3}
              backgroundColor="#0f1117"
              onNodeClick={(n) => select(n.id)}
            />
          )}
        </section>

        <aside>
          <nav>
            <button className={tab === 'explore' ? 'on' : ''} onClick={() => setTab('explore')}>Explore</button>
            <button className={tab === 'report' ? 'on' : ''} onClick={() => setTab('report')}>Report</button>
          </nav>

          {tab === 'explore' ? (
            <>
              <input
                aria-label="Search nodes"
                placeholder="Search symbols…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {results.length > 0 && (
                <ul className="list" aria-label="Search results">
                  {results.map((n) => (
                    <li key={n.id}><button onClick={() => select(n.id)}>{n.label}</button></li>
                  ))}
                </ul>
              )}

              {selected ? (
                <div className="details" data-testid="details">
                  <h2>{selected.node.label}</h2>
                  <p className="muted">
                    {selected.node.sourceFile ?? 'no source'} {selected.node.sourceLocation ?? ''} · {selected.degree} connections
                  </p>
                  <ul className="list">
                    {selected.neighbors.map((e, i) => (
                      <li key={`${e.id}-${i}`}>
                        <span className="muted">{e.direction === 'out' ? '→' : '←'} {e.relation}</span>{' '}
                        <button onClick={() => select(e.id)}>{e.node.label}</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <>
                  <h2>God nodes</h2>
                  <p className="muted">Most connected abstractions</p>
                  <ol className="list" aria-label="God nodes">
                    {godNodes.map((n) => (
                      <li key={n.id}>
                        <button onClick={() => select(n.id)}>{n.label}</button>
                        <span className="muted"> {n.degree}</span>
                      </li>
                    ))}
                  </ol>
                </>
              )}

              <h2>Communities</h2>
              <ul className="legend">
                {graph?.meta.communities.map((c) => (
                  <li key={c.id}>
                    <i style={{ background: communityColor(c.id) }} /> {c.name} <span className="muted">({c.size})</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <pre className="report">{report || 'No report available.'}</pre>
          )}
        </aside>
      </main>
    </div>
  );
}
