declare global {
    interface Window {
        ReactNativeWebView?: {
            postMessage: (message: string) => void
        }
    }
}

export function postToApp(message: Record<string, unknown>) {
    if (typeof window !== 'undefined' && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(message))
    }
}
