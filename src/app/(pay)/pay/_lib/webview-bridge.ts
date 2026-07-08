declare global {
    interface Window {
        // Flutter webview_flutter JavaScriptChannel, registered by the app as "PranaBridge"
        PranaBridge?: {
            postMessage: (message: string) => void
        }
        // Kept as a fallback in case a React Native WebView shell is ever used
        ReactNativeWebView?: {
            postMessage: (message: string) => void
        }
    }
}

export function postToApp(message: Record<string, unknown>) {
    if (typeof window === 'undefined') return

    const payload = JSON.stringify(message)

    if (window.PranaBridge) {
        window.PranaBridge.postMessage(payload)
    } else if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(payload)
    }
}
