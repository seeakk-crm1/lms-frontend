import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { isChunkLoadError, requestFreshAppReload } from '../utils/chunkLoadRecovery';

type Props = {
  children: ReactNode;
};

type State = {
  error: unknown;
};

export default class ChunkLoadBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    if (isChunkLoadError(error)) {
      requestFreshAppReload();
      return;
    }

    console.error('Unhandled React render error', error, errorInfo);
  }

  render() {
    if (!this.state.error) return this.props.children;

    const isChunkError = isChunkLoadError(this.state.error);

    return (
      <div className="min-h-screen bg-slate-950 px-4 text-white">
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
            <RefreshCw className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            {isChunkError ? 'Updating app' : 'Something went wrong'}
          </h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">
            {isChunkError
              ? 'A newer version is available. Refresh once to load the latest files.'
              : 'Refresh the page and try again.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-600"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>
    );
  }
}
