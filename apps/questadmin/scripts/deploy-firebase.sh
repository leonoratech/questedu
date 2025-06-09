#!/bin/bash

# Firebase Deployment Script for QuestAdmin
# This script helps deploy Firestore indexes and rules

set -e

echo "🔥 Firebase Deployment Script for QuestAdmin"
echo "============================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

echo "📋 Checking Firebase login status..."
if ! firebase projects:list &> /dev/null; then
    echo "🔑 Please login to Firebase:"
    firebase login
fi

echo "🏗️  Available deployment options:"
echo "1. Deploy Firestore indexes only"
echo "2. Deploy Firestore rules only"
echo "3. Deploy both indexes and rules"
echo "4. Initialize Firebase project (first time setup)"

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo "📊 Deploying Firestore indexes..."
        firebase deploy --only firestore:indexes
        ;;
    2)
        echo "🔒 Deploying Firestore rules..."
        firebase deploy --only firestore:rules
        ;;
    3)
        echo "📊🔒 Deploying Firestore indexes and rules..."
        firebase deploy --only firestore
        ;;
    4)
        echo "🚀 Initializing Firebase project..."
        firebase init firestore
        echo "✅ Initialization complete. Run this script again to deploy."
        ;;
    *)
        echo "❌ Invalid option. Please choose 1-4."
        exit 1
        ;;
esac

echo "✅ Deployment completed successfully!"
echo ""
echo "📝 Next steps:"
echo "   • Check Firebase Console to verify deployment"
echo "   • Test your application with the new configuration"
echo "   • Monitor Firestore usage and performance"
