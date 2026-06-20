'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Database, TerminalSquare, AlertCircle } from 'lucide-react';

interface SqlScript {
  filename: string;
  title: string;
  description: string;
}

export default function SqlInsightsPage() {
  const { getToken } = useAuth();
  const [scripts, setScripts] = useState<SqlScript[]>([]);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, unknown>[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchScripts() {
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sql/scripts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch SQL scripts');
        const data = await res.json();
        setScripts(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    fetchScripts();
  }, [getToken]);

  const executeScript = async (filename: string) => {
    setExecuting(true);
    setError('');
    setResults(null);
    setSelectedScript(filename);

    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sql/execute/${filename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to execute SQL script');
      const data = await res.json();
      setResults(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Database className="h-6 w-6 text-indigo-600" />
            Advanced SQL Insights
          </h1>
          <p className="text-zinc-500 mt-1">
            Execute raw SQL scripts directly against the database to showcase complex aggregations, window functions, and CTEs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Script Selection Sidebar */}
        <div className="col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4">Available Scripts</h2>
          {scripts.map((script) => (
            <button
              key={script.filename}
              onClick={() => executeScript(script.filename)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedScript === script.filename 
                  ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                  : 'bg-white border-zinc-200 hover:border-indigo-300 hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`font-medium ${selectedScript === script.filename ? 'text-indigo-900' : 'text-zinc-900'}`}>
                    {script.title}
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{script.description}</p>
                </div>
                <TerminalSquare className={`h-5 w-5 flex-shrink-0 ${selectedScript === script.filename ? 'text-indigo-600' : 'text-zinc-400'}`} />
              </div>
              <div className="mt-3 text-xs font-mono text-zinc-400">
                {script.filename}
              </div>
            </button>
          ))}
        </div>

        {/* Results Viewer */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4">
              <h2 className="text-sm font-medium text-zinc-700">Query Results</h2>
            </div>
            
            <div className="p-6 flex-1 overflow-auto bg-zinc-50/50">
              {executing ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  <p>Executing raw SQL...</p>
                </div>
              ) : error ? (
                <div className="h-full flex flex-col items-center justify-center text-red-500 space-y-2">
                  <AlertCircle className="h-8 w-8" />
                  <p className="text-sm text-center max-w-md">{error}</p>
                </div>
              ) : results ? (
                results.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-200">
                      <thead>
                        <tr>
                          {Object.keys(results[0]).map(key => (
                            <th key={key} className="px-4 py-3 bg-zinc-100 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-zinc-200">
                        {results.map((row, i) => (
                          <tr key={i} className="hover:bg-zinc-50">
                            {Object.values(row).map((val: unknown, j) => (
                              <td key={j} className="px-4 py-3 text-sm text-zinc-900 whitespace-nowrap">
                                {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-400">
                    <p>Query executed successfully, but returned 0 rows.</p>
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
                  <Database className="h-12 w-12 opacity-20" />
                  <p>Select a script from the left to execute it.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
