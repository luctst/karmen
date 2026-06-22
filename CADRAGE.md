# Cadrage Produit — De 2h à 30min par dossier

> **Thèse.** Les 2h ne reflètent pas une limite de compétence analyste, mais une **architecture produit dysfonctionnelle** : l'analyste est forcé d'être à la fois le contrôle qualité manuel de la complétude *et* la couche d'intégration entre des modules déconnectés.
> **On automatise le déterministe, on préserve le jugement.** Cible : **30min en moyenne** — pas un plafond. On passe en **revue par exception** : les dossiers propres sont validés en quelques secondes, le temps analyste se concentre sur les cas complexes.

---

## En un coup d'œil

| Étape | Aujourd'hui | Solution | Investissement | Gain |
|---|:---:|---|:---:|:---:|
| **1 · Complétude** | 35min | Connecter, ne pas collecter | 🔴 Lourd | **−35min** |
| **2 · Scoring** | 10min | Score auto-explicatif | 🟢 Léger | **−5min** |
| **3 · Données financières** | 55min | Éval. auto + revue par exception | 🔴 Lourd | **−40min** |
| **4 · Recommandation** | 40min | Template pré-rempli | 🟡 Moyen | **−30min** |
| | **~140min** | | | **→ ~30min** |

*Toutes les étapes ne méritent pas le même effort : on investit lourd sur la complétude (1) et l'analyse (3), léger sur le reste.*

---

## Les solutions en détail

### 1 · Complétude · 🔴 Lourd · −35min
**Solution —** *Connecter, ne pas collecter.* Le client connecte ses données à la source — banque (DSP2 / agrégateur) et données fiscales (registre). La plateforme vérifie automatiquement la **profondeur** (12 mois/compte, ≥2 liasses), la **largeur** (tous les comptes déclarés présents) et **détecte les comptes cachés** (virements récurrents vers un IBAN au même nom non connecté). Données authentifiées, non falsifiables. L'analyste consulte les pièces pour audit — il n'envoie plus jamais de relance manuelle.

**Pourquoi —** Un dossier incomplet ne devrait coûter **0min** d'analyste. On supprime 35min de comptage + relances, et on déplace la charge côté client, dès l'onboarding. **C'est l'étape fondatrice : tant que les pièces manquent, le dossier n'est pas analysable — la complétude conditionne donc tout l'aval.**

**Alternative —** Un **point de contrôle bloquant** (« gate ») : le dossier ne peut pas passer au statut « à analyser » tant que les pièces requises ne sont pas réunies ; le client téléverse lui-même et un email de relance est généré automatiquement. C'est aussi le **repli légal** quand la connexion est impossible (pas de consentement, banque non supportée).

### 2 · Scoring · 🟢 Léger · −5min
**Solution —** Un score qui **s'explique**, inline : score + catégorie + **3 à 5 facteurs déterminants** + une checklist « quoi vérifier » + un signal de confiance — nourri par l'historique des décisions.

**Pourquoi —** Un score nu (« 34 / élevé ») est une boîte noire : l'analyste reconstruit le « pourquoi » à la main, ce qui **déclenche l'étape 3 coûteuse**. Un score expliqué = une carte de *où regarder*.

**Alternative —** Afficher le score brut, sans explicabilité — moins cher, mais l'étape 3 reste entière.

### 3 · Données financières · 🔴 Lourd · −40min *(plus gros levier)*
**Solution —** **Moteur d'évaluation automatisée + revue par exception.** Le système confronte les indicateurs à la politique crédit et ne fait remonter que les **anomalies et les mitigants**, avec une pré-évaluation rédigée. Dossier conforme → validé en secondes. **Repli :** une vue détaillée simplifiée (indicateurs calculés, seuils en couleur, accès à l'évidence) à la demande.

**Pourquoi —** 55min de va-et-vient entre modules : l'analyste sert de couche d'intégration et fait les calculs de tête. Un simple tableau de bord unifié ne ferait que **déplacer** la charge — il faut que le système *fasse* l'analyse, pas qu'il la présente.

**Alternative —** Panneau financier unifié en lecture seule — meilleure UX, mais l'analyste analyse toujours tout lui-même.

### 4 · Recommandation · 🟡 Moyen · −30min
**Solution —** Template pré-rempli : décision conditionnelle (approuver / refuser / demander des pièces), motif auto-complété depuis les anomalies de l'étape 3 + les facteurs du score. **La pré-évaluation de l'étape 3 est le premier jet de la note.**

**Pourquoi —** Rédiger à partir de zéro = 40min, alors que l'essentiel est structurel. Template = on passe de la rédaction à la **relecture**.

**Alternative —** Note libre avec brouillon assisté par IA — plus tard, une fois la confiance établie.

---

## Roadmap vers 30min

| Phase | Chantier | Gain | Durée cible |
|:---:|---|:---:|:---:|
| **v0** | Complétude par connexion *(étape 1)* | −35min | **~105min** |
| **v1** | Score explicable + éval. auto *(étapes 2–3)* | −45min | **~60min** |
| **v2** | Template de recommandation *(étape 4)* | −20min | **~40min** |
| **v2.5** | Brouillon assisté par IA | −10min | **~30min** |

*Séquencement : la complétude est fondatrice, et la même connexion de données alimente ensuite les étapes 2 et 3.*

---

## Questions aux analystes

- **Complétude —** À quelle fréquence les dossiers arrivent-ils incomplets, et que manque-t-il (pièces, comptes, profondeur) ? Découvrez-vous l'incomplétude *avant* ou *après* avoir commencé ? Quelle part des clients pourrait connecter banque / données fiscales ?
- **Score —** Lui faites-vous confiance ? Quand le surchargez-vous ? Quels motifs de refus reviennent (pour structurer les templates) ?
- **Automatisation (étape 3) —** Quelle part de votre jugement relève d'une politique fixe vs du cas-par-cas ? Quels indicateurs par catégorie de risque ?
- **Limites —** Quand un historique court (8 mois) reste-t-il acceptable ? Qu'est-ce qui fait qu'un dossier dépasse 2h ?

---

## Par où commencer : la complétude par connexion

| | |
|---|---|
| 🎯 **Gain sûr** | ~35min, déterministe (zéro jugement) |
| 🧱 **Fondateur** | conditionne tout l'aval — rien à analyser sans données |
| 🔗 **Colonne vertébrale** | la même connexion alimente ensuite le score (2) et l'éval. auto (3) |

