import React from 'react';
import './ErrorBoundary.scss';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError() {
    // Aggiorna lo stato per mostrare l'UI di errore
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Puoi registrare l'errore in un servizio di logging
    console.error('ErrorBoundary ha catturato un errore:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log dell'errore per debugging in sviluppo
    if (import.meta.env.DEV) {
      console.group('🚨 Errore catturato da ErrorBoundary');
      console.error('Errore:', error);
      console.error('Info errore:', errorInfo);
      console.error('Stack trace:', error.stack);
      console.groupEnd();
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isNetworkError = this.state.error?.message?.includes('fetch') || 
                            this.state.error?.message?.includes('Network');
      
      return (
        <div className="error-boundary">
          <div className="error-boundary__container">
            <div className="error-boundary__icon">
              {isNetworkError ? '🌐' : '🚨'}
            </div>
            
            <div className="error-boundary__content">
              <h1 className="error-boundary__title">
                {isNetworkError ? 'Problemi di Connessione' : 'Qualcosa è andato storto'}
              </h1>
              
              <p className="error-boundary__message">
                {isNetworkError 
                  ? 'Sembra che ci siano problemi di connessione. Verifica la tua connessione internet e riprova.'
                  : 'Si è verificato un errore inaspettato. Il nostro team è stato notificato del problema.'
                }
              </p>

              {this.props.showDetails && import.meta.env.DEV && (
                <details className="error-boundary__details">
                  <summary>Dettagli tecnici (solo sviluppo)</summary>
                  <div className="error-boundary__error-info">
                    <h3>Errore:</h3>
                    <pre>{this.state.error && this.state.error.toString()}</pre>
                    
                    <h3>Stack trace:</h3>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </div>
                </details>
              )}

              <div className="error-boundary__actions">
                {this.state.retryCount < 3 && (
                  <button 
                    className="error-boundary__button error-boundary__button--primary"
                    onClick={this.handleRetry}
                  >
                    <i className="fas fa-redo"></i>
                    Riprova ({3 - this.state.retryCount} tentativi rimasti)
                  </button>
                )}
                
                <button 
                  className="error-boundary__button error-boundary__button--secondary"
                  onClick={this.handleReload}
                >
                  <i className="fas fa-refresh"></i>
                  Ricarica Pagina
                </button>
                
                <button 
                  className="error-boundary__button error-boundary__button--tertiary"
                  onClick={() => window.history.back()}
                >
                  <i className="fas fa-arrow-left"></i>
                  Torna Indietro
                </button>
              </div>

              <div className="error-boundary__help">
                <p>
                  Se il problema persiste, contatta il nostro supporto:
                </p>
                <a 
                  href="mailto:supporto@rusticocalabria.it" 
                  className="error-boundary__contact"
                >
                  <i className="fas fa-envelope"></i>
                  supporto@rusticocalabria.it
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 