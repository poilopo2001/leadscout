# Instructions de Déploiement LeadScout sur Digital Ocean

## ✅ Étape 1: Backend Convex - TERMINÉ

Le backend Convex a été déployé avec succès:
- **URL Convex**: https://wry-gnu-485.convex.cloud
- **Status**: ✅ Déployé et fonctionnel
- **Clé de déploiement**: Configurée dans `infrastructure/digital-ocean-app-spec.yaml`

## 🔧 Étape 2: Créer l'Application Digital Ocean - ACTION REQUISE

L'API Digital Ocean nécessite une authentification GitHub via navigateur web. Voici les étapes à suivre:

### Option A: Création Manuelle via Interface Web (Recommandé)

1. **Accédez au Dashboard Digital Ocean**
   - Allez sur: https://cloud.digitalocean.com/apps
   - Cliquez sur "Create App"

2. **Connectez votre Repository GitHub**
   - Sélectionnez "GitHub" comme source
   - Autorisez l'accès à votre compte GitHub (popup OAuth)
   - Sélectionnez le repository: `poilopo2001/leadscout`
   - Branche: `master`
   - Cochez "Autodeploy code changes"

3. **Configurez l'Application**
   - **Name**: `leadscout-production`
   - **Region**: Frankfurt (FRA)
   - **Type**: Static Site
   - **Build Command**: `cd leadscout-web && npm ci && npm run build`
   - **Output Directory**: `leadscout-web/.next`

4. **Variables d'Environnement** (copier depuis le fichier ci-dessous)

   Ajoutez toutes les variables suivantes:

   ```
   NODE_ENV=production

   # Application URL (sera mis à jour après déploiement)
   NEXT_PUBLIC_APP_URL=https://leadscout-production.ondigitalocean.app

   # Clerk Authentication (MODE TEST)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cHVtcGVkLW1vbmtleS0xOS5jbGVyay5hY2NvdW50cy5kZXYk
   CLERK_SECRET_KEY=sk_test_9UlUSn24mZioxeI2edVAyjdpAGW1f18KZa201EORls
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

   # Convex Backend (PRODUCTION)
   NEXT_PUBLIC_CONVEX_URL=https://wry-gnu-485.convex.cloud
   CONVEX_DEPLOY_KEY=prod:wry-gnu-485|eyJ2MiI6ImU3NmRjM2JiOTZiNDQ5MzhhM2MzZTUwZDRkMzYwM2RjIn0=

   # Business Configuration
   PAYOUT_MINIMUM_THRESHOLD=20
   PLATFORM_COMMISSION_RATE=0.5
   STARTER_PLAN_CREDITS=20
   GROWTH_PLAN_CREDITS=60
   SCALE_PLAN_CREDITS=150
   ```

5. **Ressources**
   - **Instance Size**: Basic (512 MB RAM, $5/mois)
   - **Instance Count**: 1

6. **Health Check**
   - **HTTP Path**: `/api/health`
   - **Initial Delay**: 30 seconds
   - **Period**: 10 seconds
   - **Timeout**: 5 seconds

7. **Créer l'Application**
   - Cliquez sur "Create Resources"
   - Le déploiement démarrera automatiquement

### Option B: Utiliser doctl (CLI Digital Ocean)

Si vous préférez utiliser la ligne de commande après avoir connecté GitHub manuellement:

```bash
# 1. Installer doctl si pas déjà fait
# Télécharger depuis: https://github.com/digitalocean/doctl/releases

# 2. Authentifier doctl
doctl auth init

# 3. Créer l'app depuis le spec YAML
doctl apps create --spec infrastructure/digital-ocean-app-spec.yaml
```

**Note**: Même avec doctl, vous devrez d'abord autoriser GitHub via l'interface web.

## 📋 Étape 3: Après Déploiement

Une fois l'application créée:

1. **Récupérez l'URL de déploiement**
   - Format: `https://leadscout-production-xxxxx.ondigitalocean.app`

2. **Mettez à jour Clerk**
   - Allez sur https://dashboard.clerk.com
   - Ajoutez l'URL de production dans "Allowed origins"
   - Ajoutez les URLs de callback

3. **Configurez Stripe** (quand prêt pour la production)
   - Créez un compte Stripe
   - Obtenez les clés LIVE (pas TEST)
   - Créez les Price IDs pour les plans
   - Mettez à jour les variables d'environnement dans Digital Ocean

4. **Configurez Resend** (pour les emails)
   - Créez un compte sur https://resend.com
   - Vérifiez votre domaine
   - Obtenez la clé API
   - Ajoutez `RESEND_API_KEY` dans Digital Ocean

## 🔍 Vérification du Déploiement

Une fois déployé, testez:

1. **Health Check**: `https://votre-app.ondigitalocean.app/api/health`
2. **Page d'accueil**: `https://votre-app.ondigitalocean.app`
3. **Authentification**: Testez sign-in/sign-up
4. **Dashboard**: Vérifiez que les données Convex s'affichent

## ⚠️ Notes Importantes

### Sécurité
- ✅ Les clés Clerk actuelles sont en mode **TEST** - OK pour développement
- ⚠️ Avant production réelle, passez à des clés Clerk PRODUCTION
- ⚠️ Les clés Stripe sont des placeholders - remplacez avant d'accepter des paiements
- ✅ Toutes les variables sensibles sont marquées comme SECRET dans Digital Ocean

### Crons Convex
Les tâches planifiées Convex sont actuellement **désactivées** dans `leadscout-web/convex/convex.config.ts`:
- Weekly Payouts (tous les vendredis à 9h UTC)
- Monthly Credit Renewal (1er du mois à minuit)
- Low Credits Reminders (quotidien à 10h)
- Renewal Reminders (quotidien à 10h)

Pour les réactiver une fois le déploiement stable, décommentez les sections dans le fichier.

### Prochaines Étapes

1. **Domaine personnalisé** (optionnel)
   - Configurez un domaine dans Digital Ocean
   - Ajoutez les enregistrements DNS
   - Activez SSL automatique

2. **CI/CD**
   - Le déploiement automatique est activé sur push vers `master`
   - Chaque commit déclenche un nouveau build

3. **Monitoring**
   - Activez les alertes Digital Ocean
   - Surveillez les logs de l'application
   - Configurez les métriques Convex

## 📞 Support

Si vous rencontrez des problèmes:
- **Digital Ocean**: https://cloud.digitalocean.com/support
- **Convex**: https://dashboard.convex.dev
- **Clerk**: https://dashboard.clerk.com

## 📁 Fichiers de Configuration

- **Spec Digital Ocean**: `infrastructure/digital-ocean-app-spec.yaml`
- **Config Convex**: `leadscout-web/convex/convex.config.ts`
- **Schema Convex**: `leadscout-web/convex/schema.ts`
- **Next.js Config**: `leadscout-web/next.config.ts`

---

**Status Actuel**:
- ✅ Repository GitHub créé et à jour
- ✅ Backend Convex déployé en production
- ⏳ Application Digital Ocean - création requise via interface web
- ⏳ Configuration finale Clerk - après obtention URL
