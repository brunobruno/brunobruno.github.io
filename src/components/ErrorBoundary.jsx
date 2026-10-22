import { Component } from 'react'

/**
 * Last-resort boundary around a whole view. A WebGL or third-party crash
 * inside one lab should never take down the switcher or the rest of the
 * site. Keyed by view in App so navigating away resets it.
 */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[view crashed]', error, info?.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="view-loading" role="alert">
          <span>This view crashed — pick another lab above.</span>
        </div>
      )
    }
    return this.props.children
  }
}
