import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/socketService';

const useSocket = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (token && user) {
      socketService.connect().then(setConnected);
      const unsub = socketService.on('connection:status', (data) => {
        setConnected(data.connected);
      });
      return () => unsub();
    }
  }, [token, user]);

  return {
    connected,
    socketService,
    on: socketService.on.bind(socketService),
  };
};
export default useSocket;