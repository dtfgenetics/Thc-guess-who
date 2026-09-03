import { Component } from 'react';
import { clearSavedGame } from '../engine/storage.js';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || 'Unknown game error.'
    };
  }

  componentDidCatch(error, info) {
    console.error('Who Took It? crashed.', error, info);
  }

  clearAndReload = () => {
    clearSavedGame();
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="error-screen">
        <p className="kicker">WHO TOOK IT?</p>
        <h1>The case file jammed.</h1>
        <p>Something went wrong while loading the game. Clear the saved case and reload to start fresh.</p>
        <code>{this.state.message}</code>
        <button type="button" onClick={this.clearAndReload}>Clear saved case and reload</button>
      </main>
    );
  }
}
