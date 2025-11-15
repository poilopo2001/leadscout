# 🎉 LeadScout - Déploiement en Production

## ✅ Déploiement Réussi

**Date**: 15 novembre 2025
**Statut**: Build en cours - Déploiement automatique activé

---

## 📦 Composants Déployés

### 1. Backend Convex ✅
- **URL**: https://wry-gnu-485.convex.cloud
- **Status**: ✅ Déployé et fonctionnel
- **Clé de déploiement**: Configurée (prod:wry-gnu-485)
- **Base de données**: 48 index créés automatiquement

### 2. Application Next.js ⏳
- **ID App**: 360c508b-b68a-4d7c-9148-1154f5070db9
- **Nom**: leadscout-production
- **Région**: Frankfurt (FRA)
- **Status**: Build en cours
- **URL de suivi**: [Voir les logs en temps réel](https://cloud.digitalocean.com/apps/360c508b-b68a-4d7c-9148-1154f5070db9)

### 3. Repository GitHub ✅
- **URL**: https://github.com/poilopo2001/leadscout
- **Branche**: master
- **Auto-deploy**: ✅ Activé (chaque push déclenche un nouveau déploiement)

---

## 🔧 Configuration

### Variables d'Environnement Configurées

**Authentification (Clerk - MODE TEST)**
```
✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
✅ CLERK_SECRET_KEY
✅ NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
✅ NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
✅ NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
✅ NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

**Backend Convex**
```
✅ NEXT_PUBLIC_CONVEX_URL=https://wry-gnu-485.convex.cloud
✅ CONVEX_DEPLOY_KEY (configuré)
```

**Configuration Business**
```
✅ PAYOUT_MINIMUM_THRESHOLD=20
✅ PLATFORM_COMMISSION_RATE=0.5
✅ STARTER_PLAN_CREDITS=20
✅ GROWTH_PLAN_CREDITS=60
✅ SCALE_PLAN_CREDITS=150
```

### Variables à Configurer Plus Tard

**Stripe (pour les paiements)**
```
⚠️ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (à ajouter)
⚠️ STRIPE_SECRET_KEY (à ajouter)
⚠️ STRIPE_WEBHOOK_SECRET (à ajouter)
⚠️ Price IDs (STARTER, GROWTH, SCALE, CREDIT) (à créer)
```

**Resend (pour les emails)**
```
⚠️ RESEND_API_KEY (à ajouter)
⚠️ RESEND_FROM_EMAIL=noreply@leadscout.app (à vérifier le domaine)
```

---

## 🚀 Prochaines Étapes

### 1. Attendre la fin du build (5-10 minutes)
Le build Next.js est en cours. Vous pouvez:
- Suivre les logs en temps réel via l'URL fournie
- Ou attendre la notification de déploiement réussi

### 2. Obtenir l'URL de production
Une fois le déploiement terminé, l'URL sera:
```
https://leadscout-production-xxxxx.ondigitalocean.app
```

Vous pouvez la trouver sur:
- Dashboard Digital Ocean: https://cloud.digitalocean.com/apps/360c508b-b68a-4d7c-9148-1154f5070db9
- Ou je peux la récupérer via API une fois le build terminé

### 3. Configurer Clerk avec l'URL de production
Allez sur https://dashboard.clerk.com et ajoutez:
- **Allowed origins**: L'URL de production
- **Authorized redirect URLs**:
  - `https://votre-url/sign-in`
  - `https://votre-url/sign-up`
  - `https://votre-url/dashboard`
  - `https://votre-url/onboarding`

### 4. Tester l'application
Une fois déployée:
1. Ouvrez l'URL de production
2. Testez la page d'accueil
3. Testez l'inscription/connexion (Clerk)
4. Vérifiez que les données Convex s'affichent

### 5. Configurer Stripe (avant d'accepter des paiements)
1. Créez un compte Stripe: https://dashboard.stripe.com
2. Passez en mode LIVE (pas TEST)
3. Créez les produits et prix dans Stripe Dashboard
4. Ajoutez les clés et Price IDs dans Digital Ocean
5. Configurez le webhook Stripe pour recevoir les événements

### 6. Configurer Resend (pour les emails)
1. Créez un compte: https://resend.com
2. Vérifiez votre domaine (ou utilisez leur domaine partagé)
3. Obtenez la clé API
4. Ajoutez `RESEND_API_KEY` dans Digital Ocean

---

## 🔍 Surveillance et Maintenance

### Logs et Monitoring
- **Logs de l'application**: https://cloud.digitalocean.com/apps/360c508b-b68a-4d7c-9148-1154f5070db9/logs
- **Métriques Convex**: https://dashboard.convex.dev
- **Analytics Clerk**: https://dashboard.clerk.com

### Déploiements Automatiques
Chaque `git push` sur la branche `master` déclenche automatiquement:
1. Build Next.js sur Digital Ocean
2. Déploiement automatique
3. Health check avant mise en production

### Mise à Jour du Code
```bash
# Faire vos modifications
git add .
git commit -m "Description des changements"
git push origin master

# Digital Ocean déploie automatiquement
```

---

## 📋 Cron Jobs Convex (Actuellement Désactivés)

Les tâches planifiées suivantes sont commentées dans `leadscout-web/convex/convex.config.ts`:

1. **Weekly Payouts** (Vendredis à 9h UTC)
   - Traite les paiements des scouts
   - Vérifie le seuil minimum (20€)

2. **Monthly Credit Renewal** (1er du mois à minuit)
   - Ajoute les crédits mensuels aux abonnements actifs
   - Selon le plan: 20, 60 ou 150 crédits

3. **Low Credits Reminders** (Quotidien à 10h)
   - Alerte les entreprises avec peu de crédits

4. **Renewal Reminders** (Quotidien à 10h)
   - Rappel 3 jours avant renouvellement d'abonnement

Pour les réactiver une fois stable, décommentez les sections dans le fichier.

---

## ⚠️ Notes de Sécurité

### Mode TEST vs PRODUCTION

**Actuellement en TEST:**
- ✅ Clerk: Clés TEST (pk_test_ et sk_test_)
- ✅ Convex: Production (wry-gnu-485)
- ⚠️ Stripe: Placeholders (à remplacer par clés LIVE)

**Avant production réelle:**
1. Passez Clerk en mode PRODUCTION
2. Obtenez les clés Stripe LIVE
3. Configurez tous les webhooks
4. Testez tous les flux de paiement

### Données Sensibles
Toutes les clés API sont stockées comme **SECRET** dans Digital Ocean:
- Chiffrement au repos
- Non exposées dans les logs
- Injectées uniquement au build time

---

## 🆘 Support et Dépannage

### En cas d'erreur de build
1. Consultez les logs: Digital Ocean → Apps → Logs
2. Vérifiez les variables d'environnement
3. Testez le build localement: `cd leadscout-web && npm run build`

### En cas d'erreur Convex
1. Dashboard: https://dashboard.convex.dev
2. Vérifiez les fonctions déployées
3. Consultez les logs des requêtes

### En cas d'erreur Clerk
1. Dashboard: https://dashboard.clerk.com
2. Vérifiez les URLs autorisées
3. Testez en mode développement d'abord

---

## 📊 Coûts Estimés

**Digital Ocean App Platform:**
- Instance: Basic XXS (512 MB) = $5/mois
- Bandwidth: Inclus jusqu'à 100 GB/mois
- Build time: Inclus (400 minutes/mois)

**Convex:**
- Plan gratuit: 1M reads + 100k writes/mois
- Si dépassement: Plan payant à partir de $25/mois

**Clerk:**
- Plan gratuit: 10,000 MAU (Monthly Active Users)
- Si dépassement: Plan payant à partir de $25/mois

**Total estimé en phase de test:** ~$5-10/mois

---

**Créé automatiquement le 15 novembre 2025**
