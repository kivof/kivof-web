import type { Locale } from "@/lib/i18n";

export const chatCopy: Record<Locale, Record<string, string>> = {
  en: {
    loading: "Loading available models…",
    models: "Models could not be loaded. Retry to enable sending.",
    history:
      "Saved conversation could not be restored. You can still send a new message.",
    retry: "Retry loading chat",
    session: "Your session has expired. Sign in again to continue.",
    signIn: "Sign in again",
    origin:
      "This address is not enabled for sending messages. Open the configured workspace address and try again.",
    provider:
      "The assistant service is temporarily unavailable. Your message is kept below; retry shortly.",
    rejected:
      "The answer did not pass review. Your message is kept below; try rephrasing it.",
  },
  es: {
    loading: "Cargando modelos disponibles…",
    models: "No se pudieron cargar los modelos. Reintenta para poder enviar.",
    history:
      "No se pudo recuperar la conversación guardada. Puedes enviar un mensaje nuevo.",
    retry: "Reintentar la carga del chat",
    session: "Tu sesión ha caducado. Inicia sesión de nuevo para continuar.",
    signIn: "Iniciar sesión de nuevo",
    origin:
      "Esta dirección no está habilitada para enviar mensajes. Abre la dirección configurada del espacio de trabajo y reintenta.",
    provider:
      "El asistente no está disponible temporalmente. Tu mensaje se conserva abajo; reintenta en breve.",
    rejected:
      "La respuesta no superó la revisión. Tu mensaje se conserva abajo; intenta reformularlo.",
  },
  de: {
    loading: "Verfügbare Modelle werden geladen…",
    models:
      "Modelle konnten nicht geladen werden. Erneut versuchen, um Nachrichten senden zu können.",
    history:
      "Das gespeicherte Gespräch konnte nicht wiederhergestellt werden. Du kannst trotzdem eine neue Nachricht senden.",
    retry: "Chat erneut laden",
    session:
      "Deine Sitzung ist abgelaufen. Melde dich erneut an, um fortzufahren.",
    signIn: "Erneut anmelden",
    origin:
      "Diese Adresse ist nicht zum Senden von Nachrichten freigegeben. Öffne die konfigurierte Workspace-Adresse und versuche es erneut.",
    provider:
      "Der Assistent ist vorübergehend nicht verfügbar. Deine Nachricht bleibt unten erhalten; versuche es gleich erneut.",
    rejected:
      "Die Antwort hat die Prüfung nicht bestanden. Deine Nachricht bleibt unten erhalten; formuliere sie bitte um.",
  },
  fr: {
    loading: "Chargement des modèles disponibles…",
    models:
      "Impossible de charger les modèles. Réessayez pour activer l’envoi.",
    history:
      "Impossible de restaurer la conversation enregistrée. Vous pouvez quand même envoyer un nouveau message.",
    retry: "Recharger le chat",
    session: "Votre session a expiré. Reconnectez-vous pour continuer.",
    signIn: "Se reconnecter",
    origin:
      "Cette adresse n’est pas autorisée à envoyer des messages. Ouvrez l’adresse configurée de l’espace de travail et réessayez.",
    provider:
      "L’assistant est temporairement indisponible. Votre message est conservé ci-dessous ; réessayez sous peu.",
    rejected:
      "La réponse n’a pas passé la vérification. Votre message est conservé ci-dessous ; essayez de le reformuler.",
  },
};
