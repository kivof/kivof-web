export type Locale = "en" | "es" | "de" | "fr";
const rows = `
webLayer|Web interface|Interfaz web|Weboberfläche|Interface web
backendLayer|Rust backend|Servidor Rust|Rust-Backend|Serveur Rust
inferenceLayer|Rust inference core|Núcleo de inferencia Rust|Rust-Inferenzkern|Noyau d’inférence Rust
controllerLayer|Local controller|Controlador local|Lokaler Controller|Contrôleur local
trainable_parameters|Trainable parameters|Parámetros entrenables|Trainierbare Parameter|Paramètres entraînables
recordedPreview|Recorded factory preview|Vista previa de fábrica registrada|Aufgezeichnete Fabrikvorschau|Aperçu d’usine enregistré
recordedPreviewBody|Shared recorded Isaac scene with eight Franka robots. This preview is separate from the selected run; it is not a live camera or a qualified autonomous task.|Escena Isaac compartida con ocho robots Franka. Esta vista previa es independiente de la ejecución seleccionada; no es una cámara en vivo ni una tarea autónoma cualificada.|Gemeinsame aufgezeichnete Isaac-Szene mit acht Franka-Robotern. Diese Vorschau gehört nicht zum ausgewählten Lauf; keine Live-Kamera und keine qualifizierte autonome Aufgabe.|Scène Isaac enregistrée partagée avec huit robots Franka. Cet aperçu est distinct de l’exécution sélectionnée ; ni caméra en direct ni tâche autonome qualifiée.
recordedFrameBody|Recorded renderer output from this run. Simulated scene; inspect the independent task result separately.|Salida del renderizador registrada en esta ejecución. Escena simulada; revisa por separado el resultado independiente de la tarea.|Aufgezeichnete Renderer-Ausgabe dieses Laufs. Simulierte Szene; unabhängiges Aufgabenergebnis getrennt prüfen.|Sortie du moteur de rendu enregistrée pour cette exécution. Scène simulée ; consultez séparément le résultat indépendant de la tâche.
jointState|Joint state|Estado articular|Gelenkzustand|État articulaire
nativeCell|Isaac factory scene|Escena de fábrica Isaac|Isaac-Fabrikszene|Scène d’usine Isaac
assemblyCell|Cable assembly cell|Célula de montaje de cables|Kabelmontagezelle|Cellule d’assemblage de câbles
renderedCamera|Isaac rendered camera|Cámara renderizada de Isaac|Gerenderte Isaac-Kamera|Caméra rendue par Isaac
nativeGraphBody|Scene entities and the eight recorded robot states come from the latest native run. Relationships describe the scene; they do not qualify an autonomous task or prove a physical installation.|Las entidades y los ocho estados de robot proceden de la última ejecución nativa. Las relaciones describen la escena; no cualifican tareas autónomas ni demuestran una instalación física.|Szenenobjekte und acht aufgezeichnete Roboterzustände stammen aus dem letzten nativen Lauf. Beziehungen beschreiben die Szene; sie qualifizieren keine autonome Aufgabe und belegen keine physische Anlage.|Les entités et les huit états de robots proviennent de la dernière exécution native. Les relations décrivent la scène ; elles ne qualifient aucune tâche autonome et ne prouvent aucune installation physique.
entity_robot|Simulation arm|Brazo simulado|Simulationsarm|Bras simulé
entity_plug|Keyed plug|Conector con guía|Kodierter Stecker|Connecteur détrompé
entityType_site|Factory site|Instalación|Werksstandort|Site industriel
entityType_cell|Assembly cell|Célula de montaje|Montagezelle|Cellule d’assemblage
entityType_robot|Robot|Robot|Roboter|Robot
entityType_sensor|Recorded sensor|Sensor registrado|Aufgezeichneter Sensor|Capteur enregistré
entityType_material|Material|Material|Material|Matériau
entityType_fixture|Fixture|Elemento de fijación|Vorrichtung|Dispositif de fixation
entityType_part|Part|Pieza|Bauteil|Pièce
relation_contains|Contains|Contiene|Enthält|Contient
relation_hosts|Hosts|Aloja|Beherbergt|Héberge
relation_observed_by|Observed by|Observado por|Beobachtet durch|Observé par
relation_routes|Routes|Enruta|Führt|Achemine
relation_passes_through|Passes through|Pasa por|Verläuft durch|Traverse
relation_terminates_in|Terminates in|Termina en|Endet in|Se termine par
relation_mates_with|Mates with|Se acopla con|Passt zu|S’accouple avec
jointSpeed|Joint speed|Velocidad articular|Gelenkgeschwindigkeit|Vitesse articulaire
isaac-joint-velocity|Maximum recorded joint speed|Velocidad articular máxima registrada|Maximale aufgezeichnete Gelenkgeschwindigkeit|Vitesse articulaire maximale enregistrée
nativeSensorBody|Maximum absolute speed across seven recorded joints for each Franka robot. Values come from Isaac Sim articulation states. Observation age is unknown; these are recorded samples, not live physical sensors.|Velocidad absoluta máxima de siete articulaciones registradas por robot Franka. Valores del estado articular de Isaac Sim. Antigüedad desconocida; son muestras registradas, no sensores físicos en vivo.|Maximale absolute Geschwindigkeit aus sieben aufgezeichneten Gelenken je Franka-Roboter. Werte stammen aus Isaac-Sim-Gelenkzuständen. Beobachtungsalter unbekannt; aufgezeichnete Stichproben, keine physischen Live-Sensoren.|Vitesse absolue maximale sur sept articulations enregistrées par robot Franka. Valeurs issues des états articulaires Isaac Sim. Âge inconnu ; échantillons enregistrés, pas de capteurs physiques en direct.
trainingRecipe|Training recipe|Receta de entrenamiento|Trainingsrezept|Recette d’entraînement
smolTrainingRecipe|SmolVLA output head|Cabeza de salida SmolVLA|SmolVLA-Ausgabekopf|Tête de sortie SmolVLA
nativeTrainingRecipe|Franka joint transition predictor|Predictor de transición articular Franka|Franka-Gelenkübergangsmodell|Prédicteur de transitions articulaires Franka
nativeTrainingBody|Train a small 967-parameter predictor from recorded Isaac Sim joint transitions. Seven joint dimensions, simulated diagnostic motion, separate validation data. This does not train a grasp policy, qualify task performance or promote a model automatically.|Entrena un predictor de 967 parámetros con transiciones articulares registradas en Isaac Sim. Siete dimensiones, movimiento diagnóstico simulado y datos de validación separados. No entrena una política de agarre, cualifica tareas ni promueve modelos automáticamente.|Kleinen Prädiktor mit 967 Parametern aus aufgezeichneten Isaac-Sim-Gelenkübergängen trainieren. Sieben Gelenkdimensionen, simulierte Diagnosebewegung und getrennte Validierungsdaten. Kein Training einer Greif-Policy, keine Aufgabenqualifikation und keine automatische Modellfreigabe.|Entraînez un petit prédicteur de 967 paramètres sur des transitions articulaires enregistrées dans Isaac Sim. Sept dimensions, mouvement diagnostique simulé et validation séparée. Aucune politique de préhension, qualification de tâche ou promotion automatique.
nativeTrainingOrigin|Recorded Isaac Sim transitions · diagnostic predictor only|Transiciones registradas en Isaac Sim · solo predictor diagnóstico|Aufgezeichnete Isaac-Sim-Übergänge · nur Diagnoseprädiktor|Transitions Isaac Sim enregistrées · prédicteur diagnostique uniquement
sourceRun|Source run|Ejecución de origen|Quelllauf|Exécution source
noTrainingRollouts|No owned run has an available Isaac training rollout yet.|Ninguna ejecución propia tiene aún un registro Isaac disponible para entrenar.|Noch kein eigener Lauf mit verfügbarem Isaac-Trainingsdatensatz.|Aucune exécution détenue ne possède encore de données Isaac pour l’entraînement.
training_scope|Training scope|Alcance del entrenamiento|Trainingsumfang|Périmètre d’entraînement
joint_state_transition_predictor|Joint state transition prediction|Predicción de transiciones articulares|Vorhersage von Gelenkzustandsübergängen|Prédiction des transitions d’état articulaire
rollout_id|Recorded trajectory ID|ID de trayectoria registrada|ID der aufgezeichneten Trajektorie|ID de trajectoire enregistrée
rollout_sha256|Trajectory SHA-256|SHA-256 de la trayectoria|Trajektorie SHA-256|SHA-256 de trajectoire
robot_model|Robot model|Modelo de robot|Robotermodell|Modèle de robot
joint_dimensions|Joint dimensions|Dimensiones articulares|Gelenkdimensionen|Dimensions articulaires
robot_count|Recorded robots|Robots registrados|Aufgezeichnete Roboter|Robots enregistrés
samples|Recorded samples|Muestras registradas|Aufgezeichnete Stichproben|Échantillons enregistrés
transitions|Recorded transitions|Transiciones registradas|Aufgezeichnete Übergänge|Transitions enregistrées
training_transitions|Training transitions|Transiciones de entrenamiento|Trainingsübergänge|Transitions d’entraînement
validation_transitions|Validation transitions|Transiciones de validación|Validierungsübergänge|Transitions de validation
validation_loss|Validation loss|Pérdida de validación|Validierungsverlust|Perte de validation
nativeTaskUnqualified|Native scene verified · task unqualified|Escena nativa verificada · tarea no cualificada|Native Szene verifiziert · Aufgabe nicht qualifiziert|Scène native vérifiée · tâche non qualifiée
AUTONOMOUS_TASK_NOT_QUALIFIED|Autonomous cable task is not qualified|Tarea autónoma de cableado no cualificada|Autonome Kabelaufgabe nicht qualifiziert|Tâche autonome de câblage non qualifiée
reportedValues|Reported sensor values|Valores de sensores disponibles|Gemeldete Sensorwerte|Valeurs de capteurs disponibles
validQuality|Records with valid quality|Registros con calidad válida|Datensätze mit gültiger Qualität|Enregistrements de qualité valide
derivedTelemetry|Derived from these records|Derivado de estos registros|Aus diesen Datensätzen abgeleitet|Calculé à partir de ces enregistrements
recordedAge|Recorded age|Antigüedad registrada|Aufgezeichnetes Alter|Ancienneté enregistrée
notAdvertised|Not advertised by controller|No anunciado por el controlador|Vom Controller nicht gemeldet|Non annoncé par le contrôleur
recordedStep|Recorded step|Paso registrado|Aufgezeichneter Schritt|Étape enregistrée
sourceRecord|Full source record|Registro fuente completo|Vollständiger Quelldatensatz|Enregistrement source complet
sourceMetadata|Technical source metadata|Metadatos técnicos de origen|Technische Quellmetadaten|Métadonnées techniques de source
finalResult|Final result|Resultado final|Endergebnis|Résultat final
passed|Checks passed|Comprobaciones superadas|Prüfungen bestanden|Contrôles réussis
independent|Independent result check|Comprobación independiente|Unabhängige Ergebnisprüfung|Contrôle indépendant du résultat
guide_occupancy|Occupied guides|Guías ocupadas|Belegte Führungen|Guides occupés
position_error_m|Position error|Error de posición|Positionsfehler|Erreur de position
yaw_error_rad|Orientation error|Error de orientación|Orientierungsfehler|Erreur d’orientation
released|Plug released|Conector liberado|Stecker losgelassen|Connecteur relâché
retained_seconds|Retention after release|Retención tras soltar|Haltedauer nach Loslassen|Maintien après relâchement
positionTolerance|Position tolerance|Tolerancia de posición|Positionstoleranz|Tolérance de position
orientationTolerance|Orientation tolerance|Tolerancia de orientación|Orientierungstoleranz|Tolérance d’orientation
retentionRequirement|Required retention|Retención requerida|Erforderliche Haltedauer|Maintien requis
error_code|Diagnostic code|Código de diagnóstico|Diagnosecode|Code de diagnostic
complete_cycles|Completed cycles|Ciclos completados|Abgeschlossene Zyklen|Cycles terminés
started_cycles|Started cycles|Ciclos iniciados|Gestartete Zyklen|Cycles démarrés
human_interventions|Human interventions|Intervenciones humanas|Menschliche Eingriffe|Interventions humaines
recovery_count|Recovery attempts|Intentos de recuperación|Wiederherstellungsversuche|Tentatives de récupération
simulation_duration_s|Simulation duration|Duración simulada|Simulationsdauer|Durée simulée
wall_duration_ms|Processing time|Tiempo de procesamiento|Verarbeitungszeit|Temps de traitement
final_max_link_stretch_error_ratio|Final cable stretch error|Error final de estiramiento|Finaler Kabellängenfehler|Erreur finale d’étirement
peak_link_stretch_error_ratio|Peak cable stretch error|Error máximo de estiramiento|Maximaler Kabellängenfehler|Erreur maximale d’étirement
phase|Phase|Fase|Phase|Phase
simulation_time_s|Simulation time|Tiempo simulado|Simulationszeit|Temps simulé
sensor_time_s|Sensor time|Tiempo del sensor|Sensorzeit|Temps du capteur
grasp|Grasp|Agarrar|Greifen|Saisir
route_guide_1|Guide 1|Guía 1|Führung 1|Guide 1
route_guide_2|Guide 2|Guía 2|Führung 2|Guide 2
route_guide_3|Guide 3|Guía 3|Führung 3|Guide 3
align|Align|Alinear|Ausrichten|Aligner
insert|Insert|Insertar|Einstecken|Insérer
release_and_settle|Release & settle|Soltar y estabilizar|Loslassen und stabilisieren|Relâcher et stabiliser
reobserve|Observe again|Observar de nuevo|Erneut beobachten|Observer à nouveau
controller_completed|Controller step finished|Paso del controlador terminado|Controllerschritt beendet|Étape du contrôleur terminée
stopped|Stopped|Detenido|Gestoppt|Arrêté
recovered|Recovered|Recuperado|Wiederhergestellt|Rétabli
stale_sensor|Stale sensor observation|Observación de sensor caducada|Veraltete Sensorbeobachtung|Observation capteur périmée
valid|Valid|Válido|Gültig|Valide
stale|Stale|Caducado|Veraltet|Périmé
invalid|Invalid|No válido|Ungültig|Invalide
data_origin|Data origin|Origen de datos|Datenherkunft|Origine des données
view_mode|Presentation|Presentación|Darstellung|Présentation
started_at|Started|Inicio|Beginn|Début
finished_at|Finished|Fin|Ende|Fin
received_at|Received|Recepción|Empfangen|Réception
sequence|Sequence|Secuencia|Sequenz|Séquence
age_ms|Recorded age|Antigüedad registrada|Aufgezeichnetes Alter|Ancienneté enregistrée
max_skew_ms|Maximum clock skew|Desfase máximo de reloj|Maximale Zeitabweichung|Décalage temporel maximal
calibration_version|Calibration reference|Referencia de calibración|Kalibrierungsreferenz|Référence de calibration
calibration_valid|Calibration accepted by gate|Calibración aceptada por el control|Kalibrierung von Prüfung akzeptiert|Calibration acceptée par le contrôle
clock_domain|Clock domain|Dominio de reloj|Zeitbasis|Domaine temporel
fusion|Observation alignment|Alineación de observaciones|Beobachtungsabgleich|Alignement des observations
motor_authority|Motor authority|Autoridad motora|Bewegungsfreigabe|Autorité motrice
confidence|Confidence|Confianza|Konfidenz|Confiance
available|Available|Disponible|Verfügbar|Disponible
disabled|Disabled|Desactivado|Deaktiviert|Désactivé
configuredUnverified|Configured · not verified|Configurado · sin verificar|Konfiguriert · nicht verifiziert|Configuré · non vérifié
verified|Verified in this runtime|Verificado en este entorno|In dieser Laufzeit verifiziert|Vérifié dans cet environnement
physicalExecution|Physical execution|Ejecución física|Physische Ausführung|Exécution physique
readinessNote|Configuration describes availability. It does not qualify a model or authorize robot motion.|La configuración describe disponibilidad. No cualifica modelos ni autoriza movimiento.|Konfiguration beschreibt Verfügbarkeit. Sie qualifiziert kein Modell und erlaubt keine Roboterbewegung.|La configuration décrit la disponibilité. Elle ne qualifie aucun modèle et n’autorise aucun mouvement.
cableGeometry|Recorded cable geometry|Geometría registrada del cable|Aufgezeichnete Kabelgeometrie|Géométrie enregistrée du câble
geometryCaption|X/Z projection of recorded simulation coordinates · metres|Proyección X/Z de coordenadas simuladas registradas · metros|X/Z-Projektion aufgezeichneter Simulationskoordinaten · Meter|Projection X/Z des coordonnées simulées enregistrées · mètres
cable|Cable|Cable|Kabel|Câble
guides|Guides|Guías|Führungen|Guides
socket|Socket|Conector hembra|Buchse|Prise
cable_nominal_length_m|Nominal cable length|Longitud nominal del cable|Nennlänge des Kabels|Longueur nominale du câble
fixed_step_s|Simulation step|Paso de simulación|Simulationsschritt|Pas de simulation
recipe|Assembly recipe|Receta de montaje|Montagerezept|Recette d’assemblage
simulator|Simulation implementation|Implementación del simulador|Simulationsimplementierung|Implémentation du simulateur
limits|Declared limitations|Limitaciones declaradas|Deklarierte Grenzen|Limites déclarées
geometryUnavailable|No recorded cable coordinates are available.|No hay coordenadas registradas del cable.|Keine aufgezeichneten Kabelkoordinaten verfügbar.|Aucune coordonnée enregistrée du câble disponible.
cpu-simulation|CPU simulation|Simulación CPU|CPU-Simulation|Simulation CPU
isaac-sim|Isaac Sim|Isaac Sim|Isaac Sim|Isaac Sim
rgb-d-pose-proxy|Simulated camera pose proxy|Proxy simulado de pose de cámara|Simulierter Kameraposen-Proxy|Proxy simulé de pose caméra
synthetic-contact-proxy|Synthetic contact proxy|Proxy de contacto sintético|Synthetischer Kontakt-Proxy|Proxy de contact synthétique
synthetic-vibration|Synthetic vibration|Vibración sintética|Synthetische Vibration|Vibration synthétique
robot-camera|Robot camera|Cámara del robot|Roboterkamera|Caméra du robot
robot-contact|Contact sensor|Sensor de contacto|Kontaktsensor|Capteur de contact
factory-vibration|Factory vibration|Vibración de fábrica|Fabrikvibration|Vibrations de l’usine
training|Training|Entrenamiento|Training|Entraînement
trainingBody|Fine-tune the SmolVLA output head: 23,072 trainable parameters, frozen backbone, approved synthetic fixture data. Checkpoint changes and training loss do not prove improved robot performance. No automatic model promotion.|Ajusta la cabeza de salida de SmolVLA: 23.072 parámetros entrenables, modelo base congelado y datos sintéticos aprobados. Cambiar el punto de control y la pérdida no demuestra una mejora del robot. Sin promoción automática del modelo.|SmolVLA-Ausgabekopf feinabstimmen: 23.072 trainierbare Parameter, eingefrorenes Basismodell und freigegebene synthetische Testdaten. Prüfpunktänderungen und Trainingsverlust belegen keine bessere Roboterleistung. Keine automatische Modellfreigabe.|Ajustez la tête de sortie SmolVLA : 23 072 paramètres entraînables, modèle de base gelé et données synthétiques approuvées. Les changements du point de contrôle et la perte ne prouvent pas une amélioration du robot. Aucune promotion automatique du modèle.
synthetic|Synthetic fixture data|Datos sintéticos de prueba|Synthetische Testdaten|Données synthétiques d’essai
syntheticTraining|Synthetic fixture data · no physical qualification|Datos sintéticos · sin cualificación física|Synthetische Testdaten · keine physische Qualifikation|Données synthétiques · aucune qualification physique
trainingSteps|Training steps|Pasos de entrenamiento|Trainingsschritte|Étapes d’entraînement
startTraining|Start training job|Iniciar entrenamiento|Trainingsauftrag starten|Lancer l’entraînement
cancelTraining|Cancel job|Cancelar tarea|Auftrag abbrechen|Annuler la tâche
trainingJobs|Training jobs|Tareas de entrenamiento|Trainingsaufträge|Tâches d’entraînement
trainingUnavailable|The configured training worker is unavailable.|El trabajador de entrenamiento no está disponible.|Der konfigurierte Trainingsdienst ist nicht verfügbar.|Le service d’entraînement configuré est indisponible.
dataset|Dataset|Conjunto de datos|Datensatz|Jeu de données
loss|Recorded loss|Pérdida registrada|Aufgezeichneter Verlust|Perte enregistrée
jobId|Job ID|ID de tarea|Auftrags-ID|ID de tâche
modelRevision|Model revision|Revisión del modelo|Modellrevision|Révision du modèle
checkpoint|Checkpoint SHA-256|SHA-256 del punto de control|Prüfpunkt SHA-256|SHA-256 du point de contrôle
parametersChanged|Parameters changed|Parámetros modificados|Parameter geändert|Paramètres modifiés
yes|Yes|Sí|Ja|Oui
no|No|No|Nein|Non
queued|Queued|En cola|In Warteschlange|En attente
cancelling|Cancelling|Cancelando|Wird abgebrochen|Annulation en cours
cancelled|Cancelled|Cancelado|Abgebrochen|Annulé
completed|Completed|Completado|Abgeschlossen|Terminé
chatActions|Approved skills|Habilidades aprobadas|Freigegebene Fähigkeiten|Compétences approuvées
explainSkill|Explain evidence|Explicar evidencias|Nachweise erklären|Expliquer les preuves
nativeFrame|Recorded native camera frame|Fotograma nativo registrado|Aufgezeichnetes natives Kamerabild|Image native enregistrée
recordedFrames|Recorded frames|Fotogramas registrados|Aufgezeichnete Bilder|Images enregistrées
engine|Simulation engine|Motor de simulación|Simulationssystem|Moteur de simulation
cpuEngine|CPU cable simulation|Simulación de cable en CPU|CPU-Kabelsimulation|Simulation du câble sur CPU
isaacEngine|Isaac Sim · native factory scene|Isaac Sim · escena nativa de fábrica|Isaac Sim · native Fabrikszene|Isaac Sim · scène native d’usine
isaacUnavailable|Isaac Sim did not return a qualified scene. Check the worker and required license approval.|Isaac Sim no devolvió una escena cualificada. Comprueba el servicio y la aprobación de licencia.|Isaac Sim hat keine qualifizierte Szene geliefert. Dienst und erforderliche Lizenzfreigabe prüfen.|Isaac Sim n’a pas renvoyé de scène qualifiée. Vérifiez le service et l’acceptation de licence.
robotState|Recorded robot state|Estado registrado del robot|Aufgezeichneter Roboterzustand|État enregistré du robot
joint|Joint|Articulación|Gelenk|Articulation
position|Position|Posición|Position|Position
velocity|Velocity|Velocidad|Geschwindigkeit|Vitesse
zoomIn|Zoom in|Acercar|Vergrößern|Agrandir
zoomOut|Zoom out|Alejar|Verkleinern|Réduire
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
sessionOnly|Conversation is saved to this workspace. Voice captions stay in this session.|La conversación se guarda. Los subtítulos de voz quedan en esta sesión.|Gespräche werden gespeichert. Sprachtexte bleiben in dieser Sitzung.|La conversation est enregistrée. Les sous-titres vocaux restent dans cette session.
clearHistory|Clear visible conversation; the audit record is retained.|Borrar conversación visible; se conserva la auditoría.|Sichtbares Gespräch löschen; Prüfprotokoll bleibt erhalten.|Effacer la conversation visible ; l’audit est conservé.
imageLoading|Loading saved image…|Cargando imagen guardada…|Gespeichertes Bild laden…|Chargement de l’image enregistrée…
modelUnavailable|The configured model is unavailable or its output was rejected.|El modelo no está disponible o su respuesta fue rechazada.|Das Modell ist nicht verfügbar oder seine Ausgabe wurde abgelehnt.|Le modèle est indisponible ou sa réponse a été rejetée.
rateLimited|Request limit reached. Please retry later.|Límite de solicitudes. Reintenta más tarde.|Anfragelimit erreicht. Später erneut versuchen.|Limite atteinte. Réessayez plus tard.
reviewed|Consistency reviewed · not physical verification|Coherencia revisada · no verificación física|Konsistenz geprüft · keine physische Verifizierung|Cohérence vérifiée · pas de vérification physique
learning|Model lab|Laboratorio de modelos|Modelllabor|Laboratoire de modèles
learningBody|Submit your own observations to a configured VLA or world model. Predictions carry no motor authority.|Envía tus observaciones a un modelo VLA o de mundo configurado. Las predicciones no autorizan movimiento.|Eigene Beobachtungen an ein VLA- oder Weltmodell senden. Vorhersagen haben keine Bewegungsfreigabe.|Envoyez vos observations à un VLA ou modèle du monde configuré. Les prédictions n’autorisent aucun mouvement.
policy|VLA policy|Política VLA|VLA-Policy|Politique VLA
world|World model|Modelo del mundo|Weltmodell|Modèle du monde
provider|Provider|Proveedor|Anbieter|Fournisseur
instruction|Task instruction|Instrucción de tarea|Aufgabenanweisung|Instruction de tâche
embodiment|Robot embodiment|Configuración robótica|Roboterkonfiguration|Configuration robotique
state|Joint state (comma-separated)|Estado articular (separado por comas)|Gelenkzustand (kommagetrennt)|État articulaire (séparé par virgules)
cameraImages|Camera images (PNG/JPEG, up to 3)|Imágenes de cámara (PNG/JPEG, hasta 3)|Kamerabilder (PNG/JPEG, bis zu 3)|Images caméra (PNG/JPEG, 3 maximum)
imageLimit|Each encoded image must be below 128 KiB. Upload your own observations.|Cada imagen codificada debe ser menor de 128 KiB. Sube tus observaciones.|Jedes codierte Bild muss unter 128 KiB sein. Eigene Beobachtungen hochladen.|Chaque image encodée doit être inférieure à 128 Kio. Importez vos observations.
frame|Reference frame|Marco de referencia|Referenzrahmen|Repère de référence
units|Units|Unidades|Einheiten|Unités
calibration|Calibration version|Versión de calibración|Kalibrierungsversion|Version de calibration
age|Recorded observation age (ms)|Antigüedad registrada (ms)|Aufgezeichnetes Beobachtungsalter (ms)|Ancienneté enregistrée (ms)
recordedInput|Uploaded images are recorded inputs. An age field does not establish live freshness.|Las imágenes son entradas registradas. La edad no demuestra actualidad en vivo.|Hochgeladene Bilder sind Aufzeichnungen. Eine Altersangabe belegt keine Live-Aktualität.|Les images importées sont enregistrées. L’âge saisi ne prouve pas une fraîcheur en direct.
predict|Request prediction|Solicitar predicción|Vorhersage anfordern|Demander une prédiction
prediction|Prediction|Predicción|Vorhersage|Prédiction
hypothesis|Hypothesis|Hipótesis|Hypothese|Hypothèse
unavailable|Unavailable|No disponible|Nicht verfügbar|Indisponible
learningHistory|Model request history|Historial de solicitudes|Modellanfragen|Historique des demandes
actionDimensions|Action dimensions|Dimensiones de acción|Aktionsdimensionen|Dimensions d’action
actions|Action sequence (JSON, optional)|Secuencia de acciones (JSON, opcional)|Aktionsfolge (JSON, optional)|Séquence d’actions (JSON, facultative)
seed|Seed|Semilla|Startwert|Graine
domain|Domain|Dominio|Domäne|Domaine
noMotor|No motor authority · no verified physical outcome|Sin autoridad motora · sin resultado físico verificado|Keine Bewegungsfreigabe · kein verifiziertes physisches Ergebnis|Aucune autorité motrice · aucun résultat physique vérifié
withdraw|Withdraw annotation|Retirar anotación|Annotation zurückziehen|Retirer l’annotation
withdrawn|Withdrawn|Retirada|Zurückgezogen|Retirée
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
