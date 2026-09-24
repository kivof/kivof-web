import type { Locale } from "@/lib/i18n";

const rows = `
factoryEngine|Simulation engine|Motor de simulación|Simulations-Engine|Moteur de simulation
factoryCpu|CPU · discrete state|CPU · estados discretos|CPU · diskrete Zustände|CPU · états discrets
factoryIsaac|Isaac Sim · native physics|Isaac Sim · física nativa|Isaac Sim · native Physik|Isaac Sim · physique native
nativeRequestNote|Request a native Isaac Sim run from the configured GPU worker. It may take several minutes. Availability is confirmed by the result.|Solicita una ejecución nativa de Isaac Sim al trabajador GPU configurado. Puede tardar varios minutos. El resultado confirma la disponibilidad.|Nativen Isaac-Sim-Lauf beim konfigurierten GPU-Dienst anfordern. Dies kann einige Minuten dauern. Verfügbarkeit wird durch das Ergebnis bestätigt.|Demandez une exécution Isaac Sim native au service GPU configuré. Elle peut prendre plusieurs minutes. Le résultat confirme la disponibilité.
nativeResultNote|Recorded Isaac Sim physics with a colored rigid proxy and development color perception. No trained cheese classifier, learned VLA control or physical robot execution.|Física registrada de Isaac Sim con un objeto rígido de color y percepción experimental por color. Sin clasificador entrenado, control VLA aprendido ni robot físico.|Aufgezeichnete Isaac-Sim-Physik mit farbigem starren Ersatzobjekt und Farb-Erkennung im Entwicklungsstand. Kein trainierter Käseklassifikator, keine gelernte VLA-Steuerung und keine physische Ausführung.|Physique Isaac Sim enregistrée avec un objet rigide coloré et une perception expérimentale par couleur. Aucun classificateur entraîné, contrôle VLA appris ou robot physique.
nativeUnavailable|The configured Isaac factory worker could not complete the request. Retry when it is available, or select CPU simulation.|El trabajador Isaac configurado no pudo completar la solicitud. Reintenta cuando esté disponible o selecciona CPU.|Der konfigurierte Isaac-Dienst konnte die Anfrage nicht abschließen. Bei Verfügbarkeit erneut versuchen oder CPU wählen.|Le service Isaac configuré n’a pas pu terminer la requête. Réessayez lorsqu’il est disponible ou choisissez CPU.
nativeFactoryEvidence|Recorded Isaac camera and motion evidence|Evidencias registradas de cámara y movimiento Isaac|Aufgezeichnete Isaac-Kamera- und Bewegungsnachweise|Preuves enregistrées de caméra et mouvement Isaac
factoryCameraFrame|Recorded inspection camera · simulation|Cámara de inspección registrada · simulación|Aufgezeichnete Inspektionskamera · Simulation|Caméra d’inspection enregistrée · simulation
frameChecking|Checking the recorded frame checksum…|Verificando la suma de comprobación…|Prüfsumme des aufgezeichneten Bildes prüfen…|Vérification de l’empreinte de l’image enregistrée…
frameRejected|The recorded frame failed its integrity check and cannot be displayed.|El fotograma no superó la verificación de integridad y no se puede mostrar.|Die Integritätsprüfung des Bildes ist fehlgeschlagen; keine Anzeige möglich.|L’image n’a pas passé le contrôle d’intégrité et ne peut pas être affichée.
distanceToBin|Measured distance to target bin|Distancia medida al contenedor previsto|Gemessener Abstand zum Zielbehälter|Distance mesurée au bac cible
itemSpeed|Measured item speed|Velocidad medida del objeto|Gemessene Objektgeschwindigkeit|Vitesse mesurée de l’objet
liftObserved|Lift observed|Elevación observada|Anheben beobachtet|Levage observé
gripperReleased|Gripper released|Pinza abierta|Greifer geöffnet|Pince ouverte
lastJointSample|Last recorded joint sample|Última muestra articular registrada|Letzte aufgezeichnete Gelenkstichprobe|Dernier échantillon articulaire enregistré
SIMULATED_PLACEMENT_UNVERIFIED|Simulated placement did not pass the measured checks|La colocación simulada no superó las comprobaciones medidas|Simulierte Ablage hat die Messprüfungen nicht bestanden|La dépose simulée n’a pas passé les contrôles mesurés
INJECTED_CONTACT_FORCE_LIMIT|Synthetic contact-force fault injected|Fallo sintético de fuerza de contacto inyectado|Synthetischer Kontaktkraftfehler eingespeist|Défaut synthétique de force de contact injecté
INJECTED_STALE_SENSOR|Synthetic stale-sensor fault injected|Fallo sintético de sensor caducado inyectado|Synthetischer Fehler durch veralteten Sensor eingespeist|Défaut synthétique de capteur périmé injecté
INJECTED_SENSOR_CONFLICT|Synthetic sensor conflict injected|Conflicto sintético de sensores inyectado|Synthetischer Sensorkonflikt eingespeist|Conflit synthétique de capteurs injecté
INJECTED_PERCEPTION_AMBIGUITY|Synthetic perception ambiguity injected|Ambigüedad sintética de percepción inyectada|Synthetische Wahrnehmungsmehrdeutigkeit eingespeist|Ambiguïté synthétique de perception injectée
humanReview|Human label review|Revisión humana de etiquetas|Menschliche Annotationsprüfung|Revue humaine des annotations
reviewBoundary|Confirm or correct the candidate class. Original predictions and source evidence remain unchanged. Training requires a separate dataset approval.|Confirma o corrige la clase candidata. Se conservan las predicciones y evidencias originales. El entrenamiento requiere aprobar el conjunto de datos por separado.|Kandidatenklasse bestätigen oder korrigieren. Ursprüngliche Vorhersagen und Nachweise bleiben erhalten. Training erfordert eine separate Datensatzfreigabe.|Confirmez ou corrigez la classe candidate. Prédictions et preuves originales sont conservées. L’entraînement exige une approbation distincte du jeu de données.
reviewedClass|Reviewed class|Clase revisada|Geprüfte Klasse|Classe vérifiée
reviewNote|Review note|Nota de revisión|Prüfnotiz|Note de revue
saveReview|Save human review|Guardar revisión humana|Menschliche Prüfung speichern|Enregistrer la revue humaine
reviewSaved|Review saved. Original prediction preserved.|Revisión guardada. Predicción original conservada.|Prüfung gespeichert. Ursprüngliche Vorhersage erhalten.|Revue enregistrée. Prédiction originale conservée.
reviewedBy|Reviewed by|Revisado por|Geprüft von|Vérifié par
sourceGroup|Source group|Grupo de origen|Quellgruppe|Groupe source
reviewHistory|Review history|Historial de revisiones|Prüfverlauf|Historique des revues
reviewConflict|This record changed since you started the review. Load the latest record, check your correction and save again.|El registro cambió desde que empezaste. Carga la versión actual, comprueba tu corrección y guarda de nuevo.|Der Datensatz wurde inzwischen geändert. Aktuelle Version laden, Korrektur prüfen und erneut speichern.|Le dossier a changé depuis le début de la revue. Chargez sa version actuelle, vérifiez votre correction et enregistrez à nouveau.
reloadReview|Load latest record|Cargar versión actual|Aktuellen Datensatz laden|Charger la version actuelle
reviewCapacity|This record has reached its review limit.|Este registro alcanzó el límite de revisiones.|Der Datensatz hat sein Prüflimit erreicht.|Ce dossier a atteint sa limite de revues.
reviewError|Review could not be saved. Enter a valid class and a nonempty note of up to 2,000 bytes, then retry.|No se pudo guardar. Selecciona una clase válida y escribe una nota de hasta 2.000 bytes antes de reintentar.|Prüfung konnte nicht gespeichert werden. Gültige Klasse und eine nicht leere Notiz bis 2.000 Byte eingeben und erneut versuchen.|Impossible d’enregistrer la revue. Choisissez une classe valide et une note non vide de 2 000 octets maximum, puis réessayez.
analyzed|Analyzed|Analizado|Analysiert|Analysé
held|Held for review|Retenido para revisión|Zur Prüfung zurückgehalten|Suspendu pour revue
review_required|Review required|Revisión necesaria|Prüfung erforderlich|Revue requise
intro|Follow one item from camera observation to a reviewed sorting decision.|Sigue un producto desde la observación de cámara hasta una decisión de clasificación revisada.|Ein Produkt von der Kamerabeobachtung bis zur geprüften Sortierentscheidung verfolgen.|Suivez un produit depuis l’observation caméra jusqu’à la décision de tri vérifiée.
run|Run sorting simulation|Ejecutar simulación de clasificación|Sortiersimulation starten|Lancer la simulation de tri
nominal|Correct sorting|Clasificación correcta|Korrekte Sortierung|Tri correct
foreign_object|Foreign object|Objeto extraño|Fremdkörper|Corps étranger
empty_belt|Empty conveyor|Cinta vacía|Leeres Förderband|Convoyeur vide
sensor_conflict|Camera / mass conflict|Conflicto cámara / masa|Kamera- / Massenkonflikt|Conflit caméra / masse
misroute|Wrong bin placement|Colocación en contenedor incorrecto|Ablage im falschen Behälter|Dépose dans le mauvais bac
simulationNote|Discrete-state simulation with synthetic classification probabilities. No physics engine, trained classifier or physical robot is used in this workflow.|Simulación de estados discretos con probabilidades sintéticas. Este flujo no utiliza motor físico, clasificador entrenado ni robot físico.|Diskrete Zustandssimulation mit synthetischen Klassifikationswahrscheinlichkeiten. Dieser Ablauf nutzt keine Physik-Engine, keinen trainierten Klassifikator und keinen physischen Roboter.|Simulation à états discrets avec probabilités synthétiques. Ce parcours n’utilise ni moteur physique, ni classificateur entraîné, ni robot physique.
history|Sorting decision history|Historial de decisiones de clasificación|Historie der Sortierentscheidungen|Historique des décisions de tri
noRecords|Run a sorting scenario to inspect its decision, sensors and placement result.|Ejecuta un escenario para inspeccionar decisiones, sensores y colocación.|Ein Sortierszenario starten, um Entscheidung, Sensoren und Ablage zu prüfen.|Lancez un scénario pour inspecter décision, capteurs et dépose.
decision|Sorting decision|Decisión de clasificación|Sortierentscheidung|Décision de tri
sort_candidate|Sorting candidate|Candidato para clasificación|Sortierkandidat|Candidat au tri
review|Review required|Revisión necesaria|Prüfung erforderlich|Revue requise
hold|Held by quality gate|Retenido por control de calidad|Von Qualitätsprüfung zurückgehalten|Suspendu par le contrôle qualité
reject|Foreign object rejected|Objeto extraño rechazado|Fremdkörper abgelehnt|Corps étranger rejeté
skip|Empty belt · skip|Cinta vacía · omitir|Leeres Band · überspringen|Convoyeur vide · ignorer
safely_stopped|Stopped without placement|Detenido sin colocación|Ohne Ablage gestoppt|Arrêté sans dépose
class|Class candidate|Clase candidata|Klassenkandidat|Classe candidate
bin|Target bin|Contenedor previsto|Zielbehälter|Bac cible
bin_hard|Hard cheese|Queso duro|Hartkäse|Pâte dure
bin_semi_hard|Semi-hard cheese|Queso semiduro|Schnittkäse|Pâte mi-dure
bin_soft|Soft cheese|Queso blando|Weichkäse|Pâte molle
bin_fresh|Fresh cheese|Queso fresco|Frischkäse|Fromage frais
bin_blue|Blue cheese|Queso azul|Blauschimmelkäse|Pâte persillée
hard_cheese|Hard cheese|Queso duro|Hartkäse|Fromage à pâte dure
emmental_cheese|Emmental|Emmental|Emmentaler|Emmental
semi_hard_cheese|Semi-hard cheese|Queso semiduro|Schnittkäse|Fromage à pâte mi-dure
raclette_cheese|Raclette|Raclette|Raclette|Raclette
soft_cheese|Soft cheese|Queso blando|Weichkäse|Fromage à pâte molle
goat_cheese_soft|Soft goat cheese|Queso blando de cabra|Ziegenweichkäse|Fromage de chèvre à pâte molle
processed_cheese|Processed cheese|Queso fundido|Schmelzkäse|Fromage fondu
fresh_cheese|Fresh cheese|Queso fresco|Frischkäse|Fromage frais
cottage_cheese|Cottage cheese|Queso cottage|Hüttenkäse|Fromage cottage
cream_cheese|Cream cheese|Queso crema|Frischkäsecreme|Fromage à tartiner
blue_mould_cheese|Blue cheese|Queso azul|Blauschimmelkäse|Fromage à pâte persillée
not_cheese|Not cheese|No es queso|Kein Käse|Autre aliment
empty|Empty|Vacío|Leer|Vide
placement|Placement check|Comprobación de colocación|Ablageprüfung|Vérification de dépose
expectedBin|Expected bin|Contenedor esperado|Erwarteter Behälter|Bac attendu
observedBin|Observed bin|Contenedor observado|Beobachteter Behälter|Bac observé
notPlaced|No placement observed|Sin colocación observada|Keine Ablage beobachtet|Aucune dépose observée
WRONG_BIN|Wrong bin observed|Contenedor incorrecto observado|Falscher Behälter beobachtet|Mauvais bac observé
NO_PLACEMENT|No simulated placement|Sin colocación simulada|Keine simulierte Ablage|Aucune dépose simulée
PLACEMENT_NOT_OBSERVED|Placement not observed|Colocación no observada|Ablage nicht beobachtet|Dépose non observée
qualityPassed|Observation quality gates passed|Controles de calidad de observación superados|Beobachtungsqualität geprüft|Contrôles de qualité des observations réussis
qualityFailed|Observation quality needs attention|La calidad de observación requiere atención|Beobachtungsqualität erfordert Prüfung|La qualité des observations nécessite une revue
SENSORS_MISSING|Required sensors missing|Faltan sensores requeridos|Erforderliche Sensoren fehlen|Capteurs requis manquants
STALE_SENSOR|Stale sensor evidence|Evidencia de sensor caducada|Veralteter Sensornachweis|Preuves capteur périmées
FUTURE_SENSOR_TIMESTAMP|Sensor timestamp is in the future|Marca temporal futura|Sensorzeitstempel liegt in der Zukunft|Horodatage capteur dans le futur
SENSOR_TIME_SKEW|Sensor clocks are misaligned|Relojes de sensores desalineados|Sensorzeiten sind nicht synchron|Horloges capteurs désynchronisées
CALIBRATION_UNVERIFIED|Calibration unverified|Calibración sin verificar|Kalibrierung nicht geprüft|Calibration non vérifiée
BELT_SPEED_LIMIT|Conveyor speed exceeds demo limit|Velocidad supera límite de demo|Förderband überschreitet Demogrenze|Vitesse du convoyeur au-delà de la limite de démo
CONTACT_FORCE_LIMIT|Contact force exceeds demo limit|Fuerza supera límite de demo|Kontaktkraft überschreitet Demogrenze|Force de contact au-delà de la limite de démo
VIBRATION_LIMIT|Vibration exceeds demo limit|Vibración supera límite de demo|Vibration überschreitet Demogrenze|Vibration au-delà de la limite de démo
PAYLOAD_LIMIT|Payload exceeds demo limit|Carga supera límite de demo|Nutzlast überschreitet Demogrenze|Charge au-delà de la limite de démo
CAMERA_MASS_CONFLICT|Camera and mass observations disagree|Cámara y masa no coinciden|Kamera und Masse widersprechen sich|Désaccord entre caméra et masse
belt_speed|Conveyor speed|Velocidad de cinta|Fördergeschwindigkeit|Vitesse du convoyeur
contact_force|Contact force|Fuerza de contacto|Kontaktkraft|Force de contact
vibration|Vibration|Vibración|Vibration|Vibration
object_mass|Object mass|Masa del objeto|Objektmasse|Masse de l’objet
labelReview|Suggested labels · review before training|Etiquetas sugeridas · revisar antes de entrenar|Vorgeschlagene Annotationen · vor Training prüfen|Annotations suggérées · revue avant entraînement
unreviewed|Unreviewed|Sin revisar|Nicht geprüft|Non vérifié
trainingBlocked|Not eligible for training|No apta para entrenamiento|Nicht für Training freigegeben|Non admissible à l’entraînement
submittedOrigin|Provenance declared by submitter · not independently verified|Origen declarado por quien envía · sin verificación independiente|Herkunft vom Absender angegeben · nicht unabhängig geprüft|Provenance déclarée par l’émetteur · non vérifiée indépendamment
recordOrigin|Recorded result origin|Origen del resultado registrado|Herkunft des aufgezeichneten Ergebnisses|Origine du résultat enregistré
observationImport|Analyze observation JSON|Analizar observaciones JSON|JSON-Beobachtungen analysieren|Analyser des observations JSON
observationBody|Import camera probabilities and sensor observations in the published factory contract. Supplied calibration and origin remain unverified.|Importa probabilidades de cámara y sensores con el contrato publicado. La calibración y el origen declarados siguen sin verificar.|Kamerawahrscheinlichkeiten und Sensorbeobachtungen im veröffentlichten Format importieren. Angegebene Kalibrierung und Herkunft bleiben ungeprüft.|Importez probabilités caméra et observations capteurs au format publié. Calibration et provenance déclarées restent non vérifiées.
observationError|Invalid observation JSON or request rejected. Check timestamps, class probabilities and the four required sensor types.|JSON no válido o solicitud rechazada. Revisa fechas, probabilidades y los cuatro tipos de sensor.|Ungültiges JSON oder Anfrage abgelehnt. Zeitstempel, Wahrscheinlichkeiten und vier erforderliche Sensortypen prüfen.|JSON invalide ou requête refusée. Vérifiez horodatages, probabilités et quatre types de capteurs requis.
analyze|Analyze observations|Analizar observaciones|Beobachtungen analysieren|Analyser les observations
member_of|Belongs to batch|Pertenece al lote|Gehört zur Charge|Appartient au lot
has_candidate_class|Has candidate class|Tiene clase candidata|Hat Klassenkandidat|A une classe candidate
evaluates|Evaluates item|Evalúa producto|Bewertet Produkt|Évalue le produit
provides_evidence_for|Provides evidence for|Aporta evidencia a|Liefert Nachweis für|Fournit des preuves pour
maps_to|Maps to bin|Corresponde al contenedor|Gehört zum Behälter|Correspond au bac
`
  .trim()
  .split("\n")
  .map((row) => row.split("|"));
export const factoryCopy = Object.fromEntries(
  (["en", "es", "de", "fr"] as Locale[]).map((locale, index) => [
    locale,
    Object.fromEntries(rows.map((row) => [row[0], row[index + 1]])),
  ]),
) as Record<Locale, Record<string, string>>;
