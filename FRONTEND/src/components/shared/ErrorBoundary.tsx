import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm text-center animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Cluster Execution Halted</h2>
          <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">
            An unexpected runtime error occurred in this module. Enterprise state isolation is active.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-slate-900 hover:bg-black text-white px-8 h-12 rounded-xl font-bold flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" /> Restart Cluster
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
