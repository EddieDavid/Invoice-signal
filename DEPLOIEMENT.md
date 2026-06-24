# Guide de déploiement en production

> **Ne faites pas ces étapes maintenant.** Ce guide est pour plus tard, quand vous serez prêt à avoir de vrais clients.

---

## Vue d'ensemble

Pour passer en production, vous aurez besoin de :
1. Un compte **Supabase** (base de données PostgreSQL gratuite)
2. Un compte **Resend** (emails transactionnels)
3. Un compte **Stripe** (paiements en ligne)
4. Un déploiement sur **Vercel** (hébergement Next.js gratuit)

---

## Étape 1 — Créer une base de données Supabase

1. Allez sur [supabase.com](https://supabase.com) et créez un compte gratuit
2. Créez un nouveau projet (choisissez une région proche de la France)
3. Dans **Settings > Database**, copiez l'URL de connexion (format `postgresql://...`)
4. Dans votre `.env`, remplacez `DATABASE_URL` par cette URL

Migrer le schéma vers PostgreSQL :
```bash
# Modifier prisma/schema.prisma : changer "sqlite" par "postgresql"
npx prisma migrate deploy
```

---

## Étape 2 — Configurer Resend pour les vrais emails

1. Allez sur [resend.com](https://resend.com) et créez un compte (gratuit jusqu'à 3 000 emails/mois)
2. Dans **Domains**, ajoutez votre nom de domaine et suivez les instructions DNS
3. Dans **API Keys**, créez une clé et copiez-la
4. Dans `.env` : `RESEND_API_KEY="re_xxxx..."`
5. Dans `src/lib/email.ts`, mettez à jour l'adresse `from` avec votre domaine vérifié

---

## Étape 3 — Configurer Stripe pour les vrais paiements

1. Allez sur [stripe.com](https://stripe.com/fr) et créez un compte
2. Dans **Développeurs > Clés API**, copiez les clés **test** d'abord
3. Dans `.env` :
   ```
   STRIPE_SECRET_KEY="sk_test_xxxx..."
   STRIPE_PUBLISHABLE_KEY="pk_test_xxxx..."
   ```
4. Créez la route `/api/payment/checkout/[id]` avec Stripe Checkout
5. Configurez un webhook Stripe pour recevoir les confirmations de paiement

Pour passer en production (vrais paiements), remplacez les clés `sk_test_` par `sk_live_`.

---

## Étape 4 — Déployer sur Vercel

1. Allez sur [vercel.com](https://vercel.com) et créez un compte (gratuit)
2. Importez votre dépôt GitHub
3. Dans **Settings > Environment Variables**, ajoutez toutes les variables de votre `.env`
4. Mettez `NEXT_PUBLIC_APP_URL` sur votre URL Vercel (ex : `https://invoicesignal.vercel.app`)
5. Vercel déploie automatiquement à chaque `git push`

### Variables d'environnement à configurer sur Vercel

```
DATABASE_URL=postgresql://...
APP_PASSWORD=votre-mot-de-passe-sécurisé
NEXTAUTH_SECRET=une-chaîne-aléatoire-longue
NEXTAUTH_URL=https://votre-app.vercel.app
RESEND_API_KEY=re_xxxx...
STRIPE_SECRET_KEY=sk_live_xxxx...
STRIPE_PUBLISHABLE_KEY=pk_live_xxxx...
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
```

---

## Checklist avant de passer en production

- [ ] Base de données PostgreSQL créée sur Supabase
- [ ] Migrations Prisma appliquées sur la DB de production
- [ ] Domaine vérifié sur Resend
- [ ] Adresse `from` dans `email.ts` mise à jour
- [ ] Clés Stripe en mode live (pas test)
- [ ] Webhook Stripe configuré
- [ ] Variables d'environnement configurées sur Vercel
- [ ] `APP_PASSWORD` changé pour un mot de passe fort
- [ ] `NEXTAUTH_SECRET` changé pour une valeur aléatoire
- [ ] Test du parcours complet en production avant d'envoyer à de vrais clients
