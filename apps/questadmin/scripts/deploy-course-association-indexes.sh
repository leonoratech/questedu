#!/bin/bash

# Script to deploy Firestore indexes for course associations

set -e

echo "🔥 Deploying Firestore indexes for course associations..."

# Navigate to the questadmin directory
cd "$(dirname "$0")/.."

# Check if Firebase CLI is available
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔑 Please login to Firebase:"
    firebase login
fi

# Set the project if not already set
if ! firebase use --current &> /dev/null; then
    echo "🎯 Setting Firebase project..."
    firebase use questedu-cb2a4
fi

# Deploy only the Firestore indexes
echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

echo "✅ Course association indexes deployed successfully!"
echo ""
echo "📝 New indexes deployed for QuestEdu React Native App:"
echo "   • courses/association.collegeId + createdAt"
echo "   • courses/association.programId + createdAt"
echo "   • courses/association.yearOrSemester + createdAt"
echo "   • courses/association.subjectId + createdAt"
echo "   • courses/association.collegeId + association.programId + createdAt"
echo "   • courses/association.collegeId + association.yearOrSemester + createdAt"
echo "   • courses/association.collegeId + association.subjectId + createdAt"
echo "   • courses/association.programId + association.subjectId + createdAt"
echo "   • courses/association.programId + association.yearOrSemester + association.subjectId + createdAt"
echo "   • courses/association.collegeId + association.programId + association.yearOrSemester + createdAt"
echo "   • courses/association.collegeId + association.programId + association.subjectId + createdAt"
echo "   • courses/association.collegeId + association.programId + association.yearOrSemester + association.subjectId + createdAt"
echo "   • courses/category + createdAt"
echo "   • courses/featured + createdAt"
echo "   • courses/level + createdAt"
echo ""
echo "🎉 Course association feature is now ready for both QuestAdmin and QuestEdu apps!"
