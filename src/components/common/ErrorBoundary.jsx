import { Component } from 'react';
import i18n from '../../i18n';

/** Last-resort boundary so a rendering error shows a recoverable screen instead of a blank page. */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const isChunkError = /Loading chunk|dynamically imported module/i.test(this.state.error?.message || '');
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold">{i18n.t('errors.crashTitle')}</h1>
        <p className="max-w-md text-slate-600 dark:text-slate-400">{isChunkError ? i18n.t('errors.newVersion') : i18n.t('errors.crashText')}</p>
        <div className="flex gap-3">
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            {i18n.t('errors.reload')}
          </button>
          <a href="/" className="btn btn-secondary">
            {i18n.t('notFound.home')}
          </a>
        </div>
      </div>
    );
  }
}
