#!/bin/bash

#############################################
# LeadScout Production Deployment Script
#############################################
#
# This script automates the deployment process to Digital Ocean App Platform.
# It handles both initial deployment and updates.
#
# Prerequisites:
# - doctl CLI installed and authenticated
# - GitHub repository set up
# - All environment variables ready
#
# Usage:
#   ./infrastructure/deploy.sh
#

set -e  # Exit on any error

echo "==============================================="
echo "LeadScout Production Deployment"
echo "==============================================="
echo ""

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "Error: doctl CLI not found. Please install it first:"
    echo "https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

# Check if authenticated
if ! doctl auth list &> /dev/null; then
    echo "Error: Not authenticated with Digital Ocean."
    echo "Please run: doctl auth init"
    exit 1
fi

echo "✓ Digital Ocean CLI authenticated"
echo ""

# Check if app already exists
APP_NAME="leadscout-production"
APP_ID=$(doctl apps list --format ID,Spec.Name --no-header | grep "$APP_NAME" | awk '{print $1}' || echo "")

if [ -z "$APP_ID" ]; then
    echo "Creating new Digital Ocean app..."
    echo ""

    # Create app from spec
    doctl apps create --spec infrastructure/digital-ocean-app-spec.yaml

    echo ""
    echo "✓ App created successfully!"
    echo ""
    echo "IMPORTANT: Update environment variables in the Digital Ocean dashboard:"
    echo "1. Go to: https://cloud.digitalocean.com/apps"
    echo "2. Click on 'leadscout-production'"
    echo "3. Go to Settings > App-Level Environment Variables"
    echo "4. Replace all REPLACE_WITH_* placeholder values"
    echo ""
else
    echo "App already exists (ID: $APP_ID)"
    echo "Updating app configuration..."
    echo ""

    # Update app spec
    doctl apps update "$APP_ID" --spec infrastructure/digital-ocean-app-spec.yaml

    echo ""
    echo "✓ App updated successfully!"
    echo ""
fi

# Get app info
echo "==============================================="
echo "Application Information"
echo "==============================================="
doctl apps get "$APP_ID" --format ID,Spec.Name,DefaultIngress,ActiveDeployment.Phase

echo ""
echo "==============================================="
echo "Next Steps"
echo "==============================================="
echo ""
echo "1. Deploy Convex to production:"
echo "   cd convex"
echo "   npx convex deploy --prod"
echo ""
echo "2. Update NEXT_PUBLIC_CONVEX_URL in Digital Ocean with production URL"
echo ""
echo "3. Set up Stripe webhook:"
echo "   - Endpoint URL: https://leadscout-production.ondigitalocean.app/api/webhooks/stripe"
echo "   - Events to send: checkout.session.completed, customer.subscription.*, invoice.*, account.updated, transfer.*"
echo "   - Copy webhook secret and update STRIPE_WEBHOOK_SECRET"
echo ""
echo "4. Configure Resend domain:"
echo "   - Add and verify your domain in Resend dashboard"
echo "   - Update RESEND_FROM_EMAIL with verified email"
echo ""
echo "5. Monitor deployment:"
echo "   doctl apps logs $APP_ID --type run --follow"
echo ""
echo "6. View app in browser:"
APP_URL=$(doctl apps get "$APP_ID" --format DefaultIngress --no-header)
echo "   https://$APP_URL"
echo ""
echo "==============================================="
