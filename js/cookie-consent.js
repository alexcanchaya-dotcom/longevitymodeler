// Cookie Consent Manager for Longevity Modeler
// Add this to your website to enable GDPR-compliant cookie consent

class CookieConsentManager {
  constructor() {
    this.consentKey = 'longevity_cookie_consent';
    this.consentVersion = '1.0';
    this.languages = {
      en: {
        title: 'Cookie Preferences',
        description: 'We use cookies to improve your experience and analyze site usage. Your privacy is important to us.',
        acceptAll: 'Accept All',
        rejectAll: 'Reject All',
        settings: 'Preferences',
        save: 'Save Preferences',
        essential: 'Essential Cookies',
        essentialDesc: 'Required for basic site functionality (always enabled)',
        analytics: 'Analytics Cookies',
        analyticsDesc: 'Help us understand how you use our site',
        marketing: 'Marketing Cookies',
        marketingDesc: 'Used for advertising and tracking',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service'
      },
      es: {
        title: 'Preferencias de Cookies',
        description: 'Utilizamos cookies para mejorar tu experiencia y analizar el uso del sitio. Tu privacidad es importante para nosotros.',
        acceptAll: 'Aceptar Todo',
        rejectAll: 'Rechazar Todo',
        settings: 'Preferencias',
        save: 'Guardar Preferencias',
        essential: 'Cookies Esenciales',
        essentialDesc: 'Necesarias para la funcionalidad básica del sitio (siempre habilitadas)',
        analytics: 'Cookies de Análisis',
        analyticsDesc: 'Nos ayudan a entender cómo usas nuestro sitio',
        marketing: 'Cookies de Marketing',
        marketingDesc: 'Utilizadas para publicidad y seguimiento',
        privacy: 'Política de Privacidad',
        terms: 'Términos de Servicio'
      },
      de: {
        title: 'Cookie-Einstellungen',
        description: 'Wir verwenden Cookies, um Ihr Erlebnis zu verbessern und die Nutzung der Website zu analysieren. Ihre Privatsphäre ist uns wichtig.',
        acceptAll: '
