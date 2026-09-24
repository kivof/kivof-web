import type { Locale } from "@/lib/i18n";

const rows = `
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
