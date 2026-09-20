export type Locale = "en" | "es" | "de" | "fr";
const rows = `
language|Language|Idioma|Sprache|Langue
light|Light mode|Modo claro|Heller Modus|Mode clair
dark|Dark mode|Modo oscuro|Dunkler Modus|Mode sombre
workspace|Workspace|Espacio de trabajo|Arbeitsbereich|Espace de travail
openDemo|Open workspace|Abrir espacio|Arbeitsbereich öffnen|Ouvrir l’espace
deck|View pitch deck|Ver presentación|Präsentation ansehen|Voir la présentation
eyebrow|PHYSICAL AI, WITH EVIDENCE|IA FÍSICA, CON EVIDENCIAS|PHYSISCHE KI MIT NACHWEISEN|IA PHYSIQUE, AVEC PREUVES
hero1|Every robot run.|Cada ejecución.|Jeder Roboterlauf.|Chaque exécution.
hero2|A smarter next step.|Un siguiente paso mejor.|Ein besserer nächster Schritt.|Une meilleure prochaine étape.
heroBody|Connect operations, sensor evidence and learning. Understand what happened, test an improvement, and keep physical authority where it belongs.|Conecta operaciones, evidencias y aprendizaje. Comprende lo ocurrido, prueba mejoras y conserva la autoridad física en el controlador.|Betrieb, Sensordaten und Lernen verbinden. Abläufe verstehen, Verbesserungen testen und die Bewegungsfreigabe lokal behalten.|Reliez opérations, preuves et apprentissage. Comprenez les faits, testez une amélioration et conservez l’autorité physique au contrôleur.
simulationBadge|SIMULATION WORKSPACE|ESPACIO DE SIMULACIÓN|SIMULATIONSUMGEBUNG|ESPACE DE SIMULATION
sceneTitle|Harness Forge · cable assembly cell|Harness Forge · célula de cableado|Harness Forge · Kabelmontagezelle|Harness Forge · cellule de câblage
sceneCaption|Conceptual cell view · inspect recorded evidence below|Vista conceptual · inspecciona las evidencias registradas|Konzeptionelle Zelle · aufgezeichnete Nachweise prüfen|Vue conceptuelle · consultez les preuves enregistrées
localAuthority|Local controller retains motion authority|El controlador local mantiene la autoridad de movimiento|Bewegungsfreigabe bleibt beim lokalen Controller|Le contrôleur local conserve l’autorité de mouvement
flow1|Observe|Observar|Beobachten|Observer
flow2|Understand|Comprender|Verstehen|Comprendre
flow3|Evaluate|Evaluar|Evaluieren|Évaluer
flow4|Improve|Mejorar|Verbessern|Améliorer
feature1|Operations, in context|Operaciones, en contexto|Betrieb im Kontext|Les opérations, en contexte
feature1Body|Inspect run history, synchronized sensor observations and independent completion checks.|Inspecciona ejecuciones, sensores sincronizados y verificaciones independientes.|Laufhistorie, synchronisierte Beobachtungen und unabhängige Abschlussprüfungen einsehen.|Consultez les exécutions, observations synchronisées et vérifications indépendantes.
feature2|From failure to evidence|Del fallo a la evidencia|Vom Fehler zum Nachweis|De l’échec à la preuve
feature2Body|Review force spikes and occlusions. Attach labels to immutable run identities.|Revisa picos de fuerza y oclusiones. Etiqueta ejecuciones identificadas de forma inmutable.|Kraftspitzen und Verdeckungen prüfen. Unveränderliche Lauf-IDs annotieren.|Examinez pics de force et occlusions. Annotez des identifiants immuables.
feature3|Test before the next step|Prueba antes del siguiente paso|Vor dem nächsten Schritt testen|Tester avant la prochaine étape
feature3Body|Compare declared simulation scenarios and inspect what the verifier actually observed.|Compara escenarios de simulación e inspecciona lo que observó el verificador.|Deklarierte Simulationsszenarien vergleichen und Prüferbeobachtungen einsehen.|Comparez les scénarios déclarés et les observations du vérificateur.
signIn|Sign in|Iniciar sesión|Anmelden|Se connecter
signInTitle|Your next run starts here.|Tu próxima ejecución empieza aquí.|Der nächste Lauf beginnt hier.|Votre prochaine exécution commence ici.
signInBody|Enter the demo operator credentials to inspect the simulation workspace.|Introduce las credenciales de demo para inspeccionar la simulación.|Mit den Demo-Zugangsdaten die Simulation untersuchen.|Saisissez les identifiants de démonstration pour inspecter la simulation.
email|Email|Correo electrónico|E-Mail|E-mail
password|Password|Contraseña|Passwort|Mot de passe
signOut|Sign out|Cerrar sesión|Abmelden|Se déconnecter
back|Back|Volver|Zurück|Retour
loading|Loading evidence…|Cargando evidencias…|Nachweise werden geladen…|Chargement des preuves…
error|The service could not complete this request. Check the connection and retry.|El servicio no pudo completar la solicitud. Comprueba la conexión y reintenta.|Anfrage fehlgeschlagen. Verbindung prüfen und erneut versuchen.|La requête a échoué. Vérifiez la connexion et réessayez.
authError|Sign-in failed. Check your credentials and retry.|Error de acceso. Comprueba tus credenciales.|Anmeldung fehlgeschlagen. Zugangsdaten prüfen.|Connexion refusée. Vérifiez vos identifiants.
retry|Retry|Reintentar|Erneut versuchen|Réessayer
overview|Overview|Resumen|Übersicht|Vue d’ensemble
runs|Run history|Ejecuciones|Laufhistorie|Historique
sensors|Sensors & quality|Sensores y calidad|Sensoren & Qualität|Capteurs et qualité
ontology|Knowledge graph|Grafo de conocimiento|Wissensgraph|Graphe de connaissances
labels|Data labeling|Etiquetado|Datenannotation|Annotation
simulation|Simulation lab|Laboratorio de simulación|Simulationslabor|Laboratoire de simulation
chat|Assistant|Asistente|Assistent|Assistant
overviewTitle|The cell. The evidence. The next step.|La célula. La evidencia. El siguiente paso.|Die Zelle. Der Nachweis. Der nächste Schritt.|La cellule. La preuve. La suite.
overviewBody|A shared view of the Harness Forge evaluation loop.|Una vista compartida del ciclo de evaluación de Harness Forge.|Gemeinsame Sicht auf die Harness-Forge-Evaluation.|Une vue partagée de l’évaluation Harness Forge.
totalRuns|Recorded runs|Ejecuciones registradas|Aufgezeichnete Läufe|Exécutions enregistrées
successRuns|Verified successes|Éxitos verificados|Verifizierte Erfolge|Succès vérifiés
failedRuns|Failed runs|Ejecuciones fallidas|Fehlgeschlagene Läufe|Échecs
successRate|Verification rate|Tasa de verificación|Verifizierungsrate|Taux de vérification
latestRun|Latest evidence|Última evidencia|Neuester Nachweis|Dernière preuve
noRuns|No runs recorded yet. Start a simulation to create evidence.|Aún no hay ejecuciones. Inicia una simulación para crear evidencias.|Noch keine Läufe. Eine Simulation erzeugt Nachweise.|Aucune exécution. Lancez une simulation pour créer des preuves.
noData|No evidence available|Sin evidencias disponibles|Keine Nachweise verfügbar|Aucune preuve disponible
inspect|Inspect evidence|Inspeccionar evidencias|Nachweise prüfen|Inspecter les preuves
status|Status|Estado|Status|État
source|Source|Origen|Quelle|Source
origin|Data origin|Origen de datos|Datenherkunft|Origine des données
playback|Presentation|Presentación|Darstellung|Présentation
time|Observed time|Hora observada|Beobachtungszeit|Heure observée
runId|Run ID|ID de ejecución|Lauf-ID|ID d’exécution
scenario|Scenario|Escenario|Szenario|Scénario
nominal|Nominal assembly|Ensamblaje nominal|Nominale Montage|Assemblage nominal
occlusion|Camera occlusion|Oclusión de cámara|Kameraverdeckung|Occlusion caméra
force_spike|Force spike|Pico de fuerza|Kraftspitze|Pic de force
succeeded|Verified success|Éxito verificado|Verifizierter Erfolg|Succès vérifié
failed|Failed|Fallido|Fehlgeschlagen|Échec
running|Running|En ejecución|Läuft|En cours
unknown|Unknown|Desconocido|Unbekannt|Inconnu
simulated|Simulated|Simulado|Simuliert|Simulé
replay|Replay|Reproducción|Wiedergabe|Relecture
disconnected|Disconnected|Desconectado|Getrennt|Déconnecté
connected|Connected|Conectado|Verbunden|Connecté
quality|Quality|Calidad|Qualität|Qualité
value|Value|Valor|Wert|Valeur
name|Name|Nombre|Name|Nom
kind|Type|Tipo|Typ|Type
sensorBody|Source, freshness and availability are separate. Missing values remain unknown.|Origen, actualidad y disponibilidad son independientes. Los valores ausentes siguen desconocidos.|Quelle, Aktualität und Verfügbarkeit sind getrennt. Fehlende Werte bleiben unbekannt.|Source, fraîcheur et disponibilité sont distinctes. Les valeurs absentes restent inconnues.
graphBody|Trace the cell entities and their relationships. This diagram does not command motion.|Explora entidades y relaciones. Este diagrama no ordena movimientos.|Zellentitäten und Beziehungen erkunden. Dieses Diagramm steuert keine Bewegung.|Explorez les entités et relations. Ce diagramme ne commande aucun mouvement.
labelBody|Add a reviewed annotation to a recorded run. Labels preserve source identity.|Añade una anotación revisada a una ejecución. Las etiquetas conservan su origen.|Einen aufgezeichneten Lauf annotieren. Die Quellidentität bleibt erhalten.|Annotez une exécution enregistrée en préservant l’identité source.
label|Label|Etiqueta|Annotation|Annotation
note|Review note|Nota de revisión|Prüfnotiz|Note de revue
save|Save annotation|Guardar anotación|Annotation speichern|Enregistrer l’annotation
saved|Saved|Guardado|Gespeichert|Enregistré
simulate|Run simulation|Ejecutar simulación|Simulation starten|Lancer la simulation
simBody|Choose a controlled variation, then inspect the complete outcome, including failures.|Elige una variación controlada e inspecciona el resultado completo, incluidos los fallos.|Kontrollierte Variante wählen und das gesamte Ergebnis einschließlich Fehlern prüfen.|Choisissez une variation contrôlée et inspectez le résultat complet, échecs compris.
simNote|This action runs a software simulation. Hardware movement requires a commissioned local controller.|Esta acción ejecuta una simulación. El movimiento físico requiere un controlador local validado.|Diese Aktion startet eine Software-Simulation. Hardwarebewegung benötigt einen eingerichteten lokalen Controller.|Cette action lance une simulation logicielle. Le mouvement matériel exige un contrôleur local validé.
verification|Independent verification|Verificación independiente|Unabhängige Verifizierung|Vérification indépendante
observations|Observations|Observaciones|Beobachtungen|Observations
steps|Execution trace|Traza de ejecución|Ausführungsspur|Trace d’exécution
metrics|Measurements|Mediciones|Messwerte|Mesures
evidence|Evidence|Evidencias|Nachweise|Preuves
capabilities|Runtime capabilities|Capacidades del entorno|Laufzeitfähigkeiten|Capacités d’exécution
assistantTitle|What would you like to understand?|¿Qué quieres comprender?|Was möchten Sie verstehen?|Que souhaitez-vous comprendre ?
assistantBody|Ask about a run, explore sensor evidence, or generate a visual explanation.|Pregunta sobre una ejecución, explora sensores o genera una explicación visual.|Nach Läufen fragen, Sensordaten erkunden oder visuelle Erklärungen erzeugen.|Interrogez une exécution, explorez les capteurs ou générez une explication visuelle.
suggest1|Explain the latest run and its verification.|Explica la última ejecución y su verificación.|Erkläre den neuesten Lauf und seine Verifizierung.|Explique la dernière exécution et sa vérification.
suggest2|Show the sensor quality as a table.|Muestra la calidad de sensores en una tabla.|Zeige die Sensorqualität als Tabelle.|Présente la qualité des capteurs dans un tableau.
suggest3|Draw a diagram of the cable routing workflow.|Dibuja el flujo de guiado del cable.|Zeichne den Ablauf der Kabelführung.|Dessine le processus de guidage du câble.
message|Message|Mensaje|Nachricht|Message
placeholder|Ask Kivof. Type /image for an illustration…|Pregunta a Kivof. Usa /image para ilustrar…|Kivof fragen. /image für eine Illustration…|Interrogez Kivof. /image pour une illustration…
send|Send message|Enviar mensaje|Nachricht senden|Envoyer
stop|Stop response|Detener respuesta|Antwort stoppen|Arrêter la réponse
voice|Start voice conversation|Iniciar conversación de voz|Sprachgespräch starten|Démarrer la conversation vocale
endVoice|End voice conversation|Terminar conversación de voz|Sprachgespräch beenden|Terminer la conversation vocale
listening|Voice connected · microphone active|Voz conectada · micrófono activo|Sprache verbunden · Mikrofon aktiv|Voix connectée · micro actif
connecting|Connecting voice…|Conectando voz…|Sprache verbinden…|Connexion vocale…
voiceError|Voice unavailable. Check microphone access and provider configuration.|Voz no disponible. Comprueba el micrófono y la configuración.|Sprache nicht verfügbar. Mikrofon und Anbieter prüfen.|Voix indisponible. Vérifiez le micro et le fournisseur.
working|Reviewing evidence…|Revisando evidencias…|Nachweise prüfen…|Examen des preuves…
reasoning|Approach & checks|Enfoque y comprobaciones|Vorgehen & Prüfungen|Approche et vérifications
generated|Generated illustration · not sensor evidence|Ilustración generada · no es evidencia de sensores|Generierte Illustration · kein Sensornachweis|Illustration générée · pas une preuve capteur
model|Model|Modelo|Modell|Modèle
modelsUnavailable|Model catalogue unavailable|Catálogo de modelos no disponible|Modellkatalog nicht verfügbar|Catalogue de modèles indisponible
clear|New conversation|Nueva conversación|Neues Gespräch|Nouvelle conversation
image|Generate an image|Generar imagen|Bild generieren|Générer une image
export|Download image|Descargar imagen|Bild herunterladen|Télécharger l’image
sources|Sources|Fuentes|Quellen|Sources
illustrative|Illustrative projection|Proyección ilustrativa|Illustrative Projektion|Projection illustrative
assumptions|Assumptions|Supuestos|Annahmen|Hypothèses
previous|Previous slide|Diapositiva anterior|Vorherige Folie|Diapositive précédente
next|Next slide|Siguiente diapositiva|Nächste Folie|Diapositive suivante
fullscreen|Fullscreen|Pantalla completa|Vollbild|Plein écran
print|Print deck|Imprimir presentación|Präsentation drucken|Imprimer
slide|Slide|Diapositiva|Folie|Diapositive
footer|Built for the THEKER challenge · HackSpain 2026|Para el reto THEKER · HackSpain 2026|Für die THEKER-Challenge · HackSpain 2026|Pour le défi THEKER · HackSpain 2026
proof|Harness Forge|Harness Forge|Harness Forge|Harness Forge
sessionOnly|Conversation is kept for this open workspace session.|La conversación se conserva durante esta sesión abierta.|Das Gespräch bleibt für diese geöffnete Sitzung erhalten.|La conversation reste disponible pendant cette session ouverte.
operator|Demo operator|Operador de demo|Demo-Bediener|Opérateur démo
readOnly|Inspection view|Vista de inspección|Inspektionsansicht|Vue d’inspection
refresh|Refresh evidence|Actualizar evidencias|Nachweise aktualisieren|Actualiser les preuves
selectRun|Select a run|Selecciona una ejecución|Lauf auswählen|Choisir une exécution
emptyLabels|No annotations yet|Aún no hay anotaciones|Noch keine Annotationen|Aucune annotation
controlTitle|Evidence before autonomy.|Evidencia antes de autonomía.|Nachweise vor Autonomie.|La preuve avant l’autonomie.
controlBody|A model can propose. A controller authorizes. A verifier checks the result.|Un modelo propone. Un controlador autoriza. Un verificador comprueba.|Ein Modell schlägt vor. Ein Controller autorisiert. Ein Prüfer verifiziert.|Un modèle propose. Un contrôleur autorise. Un vérificateur contrôle.
`
  .trim()
  .split("\n")
  .map((row) => row.split("|"));
export const dictionaries = Object.fromEntries(
  (["en", "es", "de", "fr"] as Locale[]).map((locale, index) => [
    locale,
    Object.fromEntries(rows.map((row) => [row[0], row[index + 1]])),
  ]),
) as Record<Locale, Record<string, string>>;
