import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user, token } = useAuth();

    const connectSocket = useCallback(() => {
        if (!token) return;

        // Use the same base URL as API but with websocket protocol if needed
        // Since we use Vite proxy, we can connect to the current origin /api
        const newSocket = io(window.location.origin, {
            path: '/socket.io',
            auth: {
                token: token
            },
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('[SOCKET] Connected to server');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('[SOCKET] Disconnected from server');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('[SOCKET] Connection error:', err.message);
            setIsConnected(false);
        });

        setSocket(newSocket);

        return newSocket;
    }, [token]);

    useEffect(() => {
        let activeSocket;
        if (user && token) {
            activeSocket = connectSocket();
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        }

        return () => {
            if (activeSocket) {
                activeSocket.disconnect();
            }
        };
    }, [user, token, connectSocket]);

    const value = {
        socket,
        isConnected
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
