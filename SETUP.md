# Guide de démarrage — InvoiceSignal

Ce guide explique comment lancer l'application pour la première fois, étape par étape.

---

## 1. Installer Node.js (si ce n'est pas déjà fait)

Ouvrez un terminal et tapez :

```bash
node --version
```

Si vous voyez un numéro de version (ex : `v20.20.2`), Node.js est déjà installé — passez à l'étape 2.

Sinon, installez Node.js via **nvm** :

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Fermez et réouvrez votre terminal, puis :

```bash
nvm install 20
nvm use 20
```

---

## 2. Installer les dépendances

Dans le dossier du projet :

```bash
npm install
```

---

## 3. Configurer le fichier .env

Copiez le fichier d'exemple :

```bash
cp .env.example .env
```

Par défaut le fichier `.env` est déjà configuré pour fonctionner en local sans aucune modification.

---

## 4. Créer la base de données

```bash
npx prisma migrate dev --name init
```

Ce que vous devriez voir : `Your database is now in sync with your schema.`

---

## 5. Lancer l'application

```bash
npm run dev
```

Ouvrez votre navigateur sur **http://localhost:3000**

Vous arrivez sur la **page d'accueil publique** d'InvoiceSignal.

---

## 6. Créer votre premier compte

1. Cliquez sur **"Essayer gratuitement"**
2. Remplissez : nom de l'entreprise, email, mot de passe (8 caractères minimum)
3. Vous êtes automatiquement connecté et redirigé vers votre dashboard

---

## 7. Importer le fichier CSV de test

1. Cliquez sur **"Importer un CSV"** dans le menu
2. Sélectionnez le fichier `factures_test.csv` qui se trouve dans le dossier du projet
3. 6 factures apparaissent dans votre dashboard

---

## 8. Tester une relance

1. Cliquez sur **"Relancer"** à côté d'une facture
2. Cliquez sur **"Boîte simulée"** dans le menu pour voir l'email simulé

---

## 9. Tester un paiement simulé

1. Dans la boîte simulée, ouvrez un email et copiez le lien de paiement
2. Ouvrez ce lien dans votre navigateur
3. Cliquez sur **"Simuler le paiement réussi"** → facture marquée payée ✅

---

## 10. Tester l'isolation des comptes (multi-tenant)

Pour vérifier que deux clients ont bien des données séparées :

1. **Déconnectez-vous** (bouton en bas du menu)
2. Cliquez sur **"Créer un compte"** sur la page de connexion
3. Inscrivez un **deuxième compte** avec un email différent
4. Importez le même CSV — ce compte a ses propres factures, séparées du premier

Pour revenir au premier compte : déconnectez-vous, allez sur `/connexion`, et reconnectez-vous avec le premier email.

---

## 11. Tester le score de risque client, la détection précoce et la dégradation (Plan Pro)

### Prérequis

Assurez-vous d'être en **plan Pro** : allez dans Paramètres → section "Plan" → cliquez sur "Pro".

### Scénario A — Score client Jaune puis Rouge

1. Importez un CSV avec plusieurs factures pour le **même client** (même email). Exemple :
   - 4 factures dont 2 ont une date d'échéance dépassée de 30+ jours.
2. Dans le dashboard, cliquez **"Relancer"** sur ces 2 factures (elles passeront en `reminded`).
3. Allez dans **Paramètres → Prisma Studio** (`npx prisma studio`) et marquez ces 2 factures comme `paid` — le `updatedAt` sera alors bien après la `dueDate`.
4. Allez dans **Fiches clients** → ce client devrait afficher le badge **"À surveiller"** (Jaune) ou **"À risque"** (Rouge) selon le taux de retard.

### Scénario B — Badge "À surveiller" sur nouvelle facture

1. Partez du scénario A avec un client en score Rouge.
2. Importez une **nouvelle facture pour ce même client** avec une date d'échéance future (ex: dans 30 jours).
3. Dans le dashboard, cette facture affiche le badge orange **"À surveiller"** au lieu du vert habituel — la facture n'est pas encore due, mais le client est à risque.
4. Pour un client Jaune : la facture affiche le badge vert normal + la mention grise **"Client à surveiller"** en dessous.

### Scénario C — Badge "Comportement en dégradation"

1. Partez d'un client avec **4 factures ou plus au total** et **au moins 3 payées**.
2. Les 3 dernières factures payées doivent avoir été marquées `paid` **au moins 10 jours plus tard** que la moyenne historique.
3. Dans **Fiches clients**, ce client affiche le badge orange **"Comportement en dégradation · paie Xj plus lentement que d'habitude"**.
4. Dans le dashboard (section risque), le compteur **"En dégradation"** monte à 1.

---

## Résumé des commandes utiles

| Commande | À quoi ça sert |
|----------|----------------|
| `npm run dev` | Lancer l'application |
| `npx prisma studio` | Voir la base de données en visuel |
| `npx prisma migrate reset` | Réinitialiser la base de données |
