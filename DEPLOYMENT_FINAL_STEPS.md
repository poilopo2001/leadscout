# LeadScout - Étapes Finales de Déploiement

## ✅ Ce qui est Déjà Fait

1. ✅ **Code poussé sur GitHub** : https://github.com/poilopo2001/leadscout
2. ✅ **Repository Git initialisé** et commité
3. ✅ **Clés Clerk récupérées** (mode TEST pour l'instant)
4. ✅ **Token Digital Ocean configuré**

---

## 🚀 Étapes à Suivre (15-20 minutes)

### Étape 1 : Créer le Projet Convex (5 min)

1. Allez sur **https://dashboard.convex.dev**
2. Cliquez sur "**Create a project**"
3. Nom du projet : `leadscout-production`
4. Copiez l'URL de déploiement (ressemblera à `https://happy-animal-123.convex.cloud`)
5. Allez dans **Settings > Deploy Keys**
6. Créez une nouvelle clé et copiez-la

**Gardez ces deux valeurs** :
```
NEXT_PUBLIC_CONVEX_URL=https://happy-animal-123.convex.cloud
CONVEX_DEPLOY_KEY=prod:happy-animal-123|...
```

### Étape 2 : Déployer le Backend Convex (2 min)

Dans votre terminal :

```bash
cd C:\Users\sebas\saas\saasagentcode\saascontentv2\leadscout-web

# Définir la clé de déploiement
set CONVEX_DEPLOY_KEY=prod:happy-animal-123|...

# Déployer
npx convex deploy --yes
```

Vous verrez :
```
✔ Deployed to https://happy-animal-123.convex.cloud
```

### Étape 3 : Créer l'App Digital Ocean (5 min)

1. Allez sur **https://cloud.digitalocean.com/apps**
2. Cliquez "**Create App**"
3. Source : **GitHub** → Autorisez l'accès à votre compte GitHub
4. Sélectionnez le repository : `poilopo2001/leadscout`
5. Branch : `master`
6. Cliquez "**Next**"

**Configuration de Build** :
- Build Command : `cd leadscout-web && npm ci && npm run build`
- Output Directory : `leadscout-web/.next`
- HTTP Port : `3000`

Cliquez "**Next**"

### Étape 4 : Configurer les Variables d'Environnement (5 min)

Dans la section "Environment Variables", ajoutez :

```bash
# Node.js
NODE_ENV=production

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cHVtcGVkLW1vbmtleS0xOS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_9UlUSn24mZioxeI2edVAyjdpAGW1f18KZa201EORls
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Convex Backend (utilisez l'URL de l'étape 1)
NEXT_PUBLIC_CONVEX_URL=https://happy-animal-123.convex.cloud

# Business Config
PAYOUT_MINIMUM_THRESHOLD=20
PLATFORM_COMMISSION_RATE=0.5
STARTER_PLAN_CREDITS=20
GROWTH_PLAN_CREDITS=60
SCALE_PLAN_CREDITS=150
```

Cliquez "**Next**" puis "**Create Resources**"

### Étape 5 : Obtenir l'URL de l'App Déployée (2 min)

Attendez 5-10 minutes que le déploiement se termine.

Une fois terminé, vous verrez une URL comme :
```
https://leadscout-production-xxxxx.ondigitalocean.app
```

**Copiez cette URL !**

### Étape 6 : Finaliser la Configuration Clerk (3 min)

1. Retournez sur **https://dashboard.clerk.com**
2. Allez dans votre application
3. **Application Domain** : Entrez votre URL Digital Ocean
   ```
   leadscout-production-xxxxx.ondigitalocean.app
   ```
4. Sauvegardez

5. Allez dans **Paths** et mettez à jour :
   - Sign-in URL : `https://leadscout-production-xxxxx.ondigitalocean.app/sign-in`
   - Sign-up URL : `https://leadscout-production-xxxxx.ondigitalocean.app/sign-up`
   - After sign-in : `https://leadscout-production-xxxxx.ondigitalocean.app/dashboard`
   - After sign-up : `https://leadscout-production-xxxxx.ondigitalocean.app/onboarding`

---

## 🎉 Vérification du Déploiement

### 1. Testez l'app

Ouvrez : `https://leadscout-production-xxxxx.ondigitalocean.app`

Vous devriez voir la homepage LeadScout !

### 2. Testez l'authentification

1. Cliquez "Sign Up"
2. Créez un compte test
3. Vérifiez que vous êtes redirigé vers `/onboarding`

### 3. Testez le health check

```bash
curl https://leadscout-production-xxxxx.ondigitalocean.app/api/health
```

Résultat attendu :
```json
{
  "status": "healthy",
  "timestamp": "2025-...",
  "environment": "production",
  "service": "leadscout-web"
}
```

---

## ⚠️ Notes Importantes

### Mode TEST vs PRODUCTION

**Actuellement en mode TEST** :
- Clés Clerk : `pk_test_...` et `sk_test_...`
- Parfait pour tester le déploiement

**Pour passer en PRODUCTION** :
1. Dans Clerk Dashboard, basculez vers "Production"
2. Copiez les clés `pk_live_...` et `sk_live_...`
3. Mettez à jour les variables d'environnement dans Digital Ocean
4. Redéployez

### Stripe (à configurer plus tard)

Pour l'instant, Stripe n'est pas configuré. Quand vous serez prêt :

1. Créez un compte Stripe
2. Obtenez les clés LIVE
3. Créez les 3 produits (Starter €99, Growth €249, Scale €499)
4. Ajoutez les variables d'environnement :
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_...
   NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID=price_...
   NEXT_PUBLIC_STRIPE_SCALE_PRICE_ID=price_...
   ```

### Resend (pour les emails)

Même chose pour Resend :
1. Créez un compte : https://resend.com
2. Vérifiez votre domaine
3. Ajoutez les variables :
   ```
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=noreply@votredomaine.com
   ```

---

## 🐛 Dépannage

### Le build échoue

1. Vérifiez les logs dans Digital Ocean : Apps > leadscout-production > Build Logs
2. Problème fréquent : Variables d'environnement manquantes

### L'authentification ne marche pas

1. Vérifiez que l'URL dans Clerk Dashboard correspond exactement à votre URL Digital Ocean
2. Vérifiez les clés Clerk dans les variables d'environnement

### Convex ne se connecte pas

1. Vérifiez que `NEXT_PUBLIC_CONVEX_URL` est correctement défini
2. Vérifiez que le backend Convex est bien déployé

---

## 📚 Documentation Complète

- **Guide complet** : `DEPLOYMENT.md`
- **Checklist production** : `PRODUCTION_CHECKLIST.md`
- **Guide rapide** : `DEPLOY_NOW.md`

---

## ✅ Résumé des Prochaines Actions

1. [ ] Créer projet Convex
2. [ ] Déployer backend Convex
3. [ ] Créer app Digital Ocean
4. [ ] Configurer variables d'environnement
5. [ ] Obtenir URL de l'app
6. [ ] Finaliser Clerk avec l'URL
7. [ ] Tester l'application

**Temps estimé** : 15-20 minutes

**Besoin d'aide ?** Suivez ce guide étape par étape. Chaque étape est indépendante et peut être faite l'une après l'autre.

---

🚀 **Bon déploiement !**
