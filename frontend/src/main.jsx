import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

// Check if we have the key before initializing
if (import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // Prevent duplicate pageviews on initial load
    // Privacy and Security settings to mask sensitive data
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "*", // masks all text in recordings
    },
    sanitize_properties: (properties, event_name) => {
      // Redact tokens from URLs
      if (properties.$current_url) {
        properties.$current_url = properties.$current_url.replace(/token=[^&]*/g, 'token=***');
      }
      if (properties.$pathname) {
        properties.$pathname = properties.$pathname.replace(/token=[^&]*/g, 'token=***');
      }
      return properties;
    }
  })
} else {
  console.warn("PostHog Key not found. Analytics are disabled.");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </StrictMode>,
)
