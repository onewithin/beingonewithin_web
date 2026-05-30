"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3010";

export type SSEEvent = {
  type: string;
  data: any;
};

export function useSubscriptionSSE(enabled: boolean = true) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!enabled) {
      console.log("SSE disabled, skipping connection");
      return;
    }

    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // EventSource will automatically send cookies with withCredentials
    const url = `${BACKEND_URL}/api/subscription/sse/subscribe`;
    
    console.log("Connecting to SSE:", url);
    
    try {
      const eventSource = new EventSource(url, {
        withCredentials: true, // Send cookies for authentication
      });

      eventSource.onopen = () => {
        console.log("✅ SSE connection opened");
        setIsConnected(true);
        reconnectAttempts.current = 0; // Reset on successful connection
      };

      // Listen for payment_success event
      eventSource.addEventListener("payment_success", (e) => {
        console.log("📩 Received payment_success event:", e.data);
        try {
          const data = JSON.parse(e.data);
          const event: SSEEvent = {
            type: "payment_success",
            data,
          };
          
          setLastEvent(event);
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      });

      eventSource.onerror = (error) => {
        console.error("❌ SSE error:", error);
        setIsConnected(false);
        eventSource.close();

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts && !reconnectTimeoutRef.current) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`⏳ Reconnecting SSE in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            reconnectTimeoutRef.current = null;
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.log("❌ Max reconnection attempts reached. Stopping SSE reconnection.");
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error("Failed to create EventSource:", error);
    }
  }, [enabled]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        console.log("Closing SSE connection");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  return {
    isConnected,
    lastEvent,
    disconnect,
  };
}
