import type { Locale } from "@/lib/i18n";

const labels = {
  en: {
    monitor: "Training monitor",
    source: "Source robot rollout",
    native:
      "This training updates a joint-state predictor from the selected robot rollout. The recorded robot frames show the source data; training progress and loss show the actual weight updates.",
    synthetic:
      "This adapter trains from a synthetic dataset. Follow measured steps and loss below; this recipe does not generate robot movement.",
    ready: "Ready to start training",
    waiting: "Waiting for the next reported training step",
    progress: "Reported training steps",
    noSource:
      "Record an Isaac Sim rollout first to train from measured robot joints.",
    simulation: "Open robot simulation",
    inspection: "Inspect source rollout",
  },
  es: {
    monitor: "Monitor de entrenamiento",
    source: "Ejecución robótica de origen",
    native:
      "Este entrenamiento actualiza un predictor articular con la ejecución seleccionada. Los fotogramas grabados muestran los datos de origen; el progreso y la pérdida muestran las actualizaciones reales de pesos.",
    synthetic:
      "Este adaptador se entrena con datos sintéticos. Consulta los pasos y la pérdida medidos; esta receta no genera movimiento robótico.",
    ready: "Preparado para iniciar el entrenamiento",
    waiting: "Esperando el siguiente paso de entrenamiento informado",
    progress: "Pasos de entrenamiento informados",
    noSource:
      "Graba primero una ejecución de Isaac Sim para entrenar con articulaciones medidas.",
    simulation: "Abrir simulación robótica",
    inspection: "Inspeccionar ejecución de origen",
  },
  de: {
    monitor: "Trainingsmonitor",
    source: "Roboterlauf als Datenquelle",
    native:
      "Dieses Training aktualisiert einen Gelenkzustandsprädiktor mit dem ausgewählten Roboterlauf. Aufgezeichnete Roboterbilder zeigen die Quelldaten; Fortschritt und Verlust zeigen die tatsächlichen Gewichtsaktualisierungen.",
    synthetic:
      "Dieser Adapter trainiert mit synthetischen Daten. Gemessene Schritte und Verlust stehen unten; dieses Verfahren erzeugt keine Roboterbewegung.",
    ready: "Bereit zum Trainingsstart",
    waiting: "Warten auf den nächsten gemeldeten Trainingsschritt",
    progress: "Gemeldete Trainingsschritte",
    noSource:
      "Zuerst einen Isaac-Sim-Lauf aufzeichnen, um mit gemessenen Robotergelenken zu trainieren.",
    simulation: "Robotersimulation öffnen",
    inspection: "Quelldatenlauf prüfen",
  },
  fr: {
    monitor: "Suivi de l’entraînement",
    source: "Exécution robotique source",
    native:
      "Cet entraînement met à jour un prédicteur articulaire à partir de l’exécution choisie. Les images enregistrées montrent les données sources ; la progression et la perte montrent les mises à jour réelles des poids.",
    synthetic:
      "Cet adaptateur utilise des données synthétiques. Suivez les étapes et la perte mesurées ci-dessous ; cette recette ne produit pas de mouvement robotique.",
    ready: "Prêt à démarrer l’entraînement",
    waiting: "En attente de la prochaine étape d’entraînement mesurée",
    progress: "Étapes d’entraînement mesurées",
    noSource:
      "Enregistrez d’abord une exécution Isaac Sim pour entraîner à partir des articulations mesurées.",
    simulation: "Ouvrir la simulation robotique",
    inspection: "Inspecter l’exécution source",
  },
};

export const trainingLabels = (locale: Locale) => labels[locale];
