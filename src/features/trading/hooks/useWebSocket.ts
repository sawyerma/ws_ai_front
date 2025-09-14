import { useEffect, useRef } from 'react';
import { WebSocketService } from '../../../services/api/websocket';

export const useWebSocket = (event: string, callback: Function, dependencies: any[] = []) => {
  const callbackRef = useRef<Function>(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]); // Only when callback changes

  useEffect(() => {
    const handler = (data: any) => {
      callbackRef.current(data);
    };

    const wsService = WebSocketService.getInstance();
    wsService.subscribe(event, handler);

    return () => {
      wsService.unsubscribe(event, handler);
    };
  }, [event, ...dependencies]); // dependencies as separates array
};
