import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  mediaType?: 'image' | 'video' | 'audio' | 'general';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: string | null;
  errorDetails: {
    message: string;
    code?: number;
    timestamp: string;
    url?: string;
    mediaType?: string;
    retryCount?: number;
    technical?: string;
  } | null;
}

/**
 * MediaErrorBoundary - A component to catch and handle media-related errors gracefully
 * 
 * This error boundary specifically targets media loading issues and provides
 * detailed diagnostic information and fallback UI for images, videos, and audio.
 */
class MediaErrorBoundary extends Component<Props, State> {
  private retryCount: number = 0;
  private maxRetries: number = 3;
  
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: null,
      errorDetails: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const currentTime = new Date().toISOString();
    
    // Get error type
    let errorType = 'UnknownError';
    if (error instanceof TypeError) errorType = 'TypeError';
    if (error instanceof SyntaxError) errorType = 'SyntaxError';
    if (error instanceof URIError) errorType = 'URIError';
    if (error instanceof RangeError) errorType = 'RangeError';
    if (error instanceof EvalError) errorType = 'EvalError';
    if (error instanceof ReferenceError) errorType = 'ReferenceError';
    
    // Get url from error if possible
    let url = undefined;
    const errorMessage = error.message || '';
    const urlMatch = errorMessage.match(/(?:src|href|url)=['"]([^'"]+)['"]/i);
    if (urlMatch && urlMatch[1]) {
      url = urlMatch[1];
    }
    
    // Analyze error message to determine if it's media-related
    const isMediaError = this.isMediaRelatedError(error, errorInfo);
    const errorDetails = {
      message: this.getHumanReadableError(error, this.props.mediaType),
      code: 'code' in error ? (error as any).code : undefined,
      timestamp: currentTime,
      url: url,
      mediaType: this.props.mediaType || (isMediaError ? this.detectMediaType(error) : 'general'),
      retryCount: this.retryCount,
      technical: `${errorType}: ${error.message}`
    };
    
    this.setState({
      errorInfo,
      errorType,
      errorDetails
    });
    
    // Log the error to console with detailed information
    console.error(
      `Media Error [${errorDetails.mediaType}]:`, 
      errorDetails.message,
      '\nTechnical details:', error, 
      '\nComponent stack:', errorInfo.componentStack
    );
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  
  private isMediaRelatedError(error: Error, errorInfo: ErrorInfo): boolean {
    const errorMessage = error.message.toLowerCase();
    const stackTrace = errorInfo.componentStack?.toLowerCase() || '';
    
    const mediaErrorKeywords = [
      'video', 'image', 'audio', 'media', 'src', 'source', 'load',
      'play', 'playback', 'render', 'decode', 'format', 'stream',
      'frame', 'track', 'canvas', 'picture', 'poster'
    ];
    
    const mediaComponentNames = [
      'img', 'video', 'audio', 'source', 'picture', 'track',
      'media', 'player', 'canvas'
    ];
    
    // Check if error message contains media-related keywords
    const messageHasMediaKeywords = mediaErrorKeywords.some(keyword => 
      errorMessage.includes(keyword)
    );
    
    // Check if component stack contains media-related component names
    const stackHasMediaComponents = mediaComponentNames.some(component => 
      stackTrace.includes(component)
    );
    
    return messageHasMediaKeywords || stackHasMediaComponents || !!this.props.mediaType;
  }
  
  private detectMediaType(error: Error): string {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('video') || errorMessage.includes('playback')) {
      return 'video';
    } else if (errorMessage.includes('image') || errorMessage.includes('img')) {
      return 'image';
    } else if (errorMessage.includes('audio')) {
      return 'audio';
    }
    
    return 'general';
  }
  
  private getHumanReadableError(error: Error, mediaType?: string): string {
    const errorMessage = error.message.toLowerCase();
    
    // Common media error messages mapped to user-friendly explanations
    if (errorMessage.includes('failed to load') || errorMessage.includes('404')) {
      return `The ${mediaType || 'media'} file could not be found or is missing.`;
    } else if (errorMessage.includes('cors') || errorMessage.includes('cross-origin')) {
      return `There was a security restriction loading the ${mediaType || 'media'}.`;
    } else if (errorMessage.includes('aborted') || errorMessage.includes('cancel')) {
      return `The ${mediaType || 'media'} loading was interrupted.`;
    } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return `Network issue prevented the ${mediaType || 'media'} from loading.`;
    } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return `The ${mediaType || 'media'} took too long to load.`;
    } else if (errorMessage.includes('decode') || errorMessage.includes('format')) {
      return `The ${mediaType || 'media'} format is not supported or the file is corrupted.`;
    }
    
    // Specific media type errors
    if (mediaType === 'video') {
      if (errorMessage.includes('play') || errorMessage.includes('playback')) {
        return 'The video couldn\'t be played. It may be in an unsupported format.';
      }
    } else if (mediaType === 'image') {
      if (errorMessage.includes('render')) {
        return 'The image couldn\'t be displayed correctly.';
      }
    } else if (mediaType === 'audio') {
      if (errorMessage.includes('play') || errorMessage.includes('playback')) {
        return 'The audio couldn\'t be played. It may be in an unsupported format.';
      }
    }
    
    // Default generic message
    return `There was a problem loading the ${mediaType || 'media'} content.`;
  }
  
  handleRetry = (): void => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({ 
        hasError: false,
        error: null,
        errorInfo: null,
        errorType: null,
        errorDetails: null
      });
    } else {
      console.error(`Maximum retry attempts (${this.maxRetries}) reached for media component.`);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="media-error-container p-4 border rounded bg-gray-50 text-center">
          <div className="media-error-icon mb-2">
            {this.state.errorDetails?.mediaType === 'video' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
            {this.state.errorDetails?.mediaType === 'image' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            {this.state.errorDetails?.mediaType === 'audio' && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
            {(!this.state.errorDetails?.mediaType || this.state.errorDetails?.mediaType === 'general') && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="media-error-message mb-3">
            <p className="text-gray-700 font-medium">{this.state.errorDetails?.message}</p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2 text-xs text-left text-gray-600">
                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">Technical details</summary>
                <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                  {this.state.errorDetails?.technical || 'Unknown error'}
                  {this.state.errorInfo?.componentStack || ''}
                </pre>
              </details>
            )}
          </div>
          {this.retryCount < this.maxRetries && (
            <button 
              onClick={this.handleRetry}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default MediaErrorBoundary;