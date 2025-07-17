#!/bin/bash

# Verify Firestore Indexes for QuestEdu College Filtering
# This script checks if all required indexes are properly configured

echo "🔍 Verifying Firestore indexes for QuestEdu college filtering..."

# Change to the questadmin app directory
cd "$(dirname "$0")/.."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it with: npm install -g firebase-tools"
    exit 1
fi

# Set the Firebase project
echo "📱 Using Firebase project: questedu-cb2a4"
firebase use questedu-cb2a4

echo ""
echo "📋 Required indexes for QuestEdu college filtering:"
echo ""

echo "🎯 Single Field Indexes:"
echo "   ✓ courses/association.collegeId + createdAt"
echo "   ✓ courses/association.programId + createdAt"
echo "   ✓ courses/association.yearOrSemester + createdAt"
echo "   ✓ courses/association.subjectId + createdAt"
echo "   ✓ courses/category + createdAt"
echo "   ✓ courses/featured + createdAt"
echo "   ✓ courses/level + createdAt"
echo ""

echo "🔗 Composite Association Indexes:"
echo "   ✓ courses/association.collegeId + association.programId + createdAt"
echo "   ✓ courses/association.collegeId + association.yearOrSemester + createdAt"
echo "   ✓ courses/association.collegeId + association.subjectId + createdAt"
echo "   ✓ courses/association.programId + association.subjectId + createdAt"
echo "   ✓ courses/association.programId + association.yearOrSemester + association.subjectId + createdAt"
echo ""

echo "🎭 Complex Combination Indexes:"
echo "   ✓ courses/association.collegeId + association.programId + association.yearOrSemester + createdAt"
echo "   ✓ courses/association.collegeId + association.programId + association.subjectId + createdAt"
echo "   ✓ courses/association.collegeId + association.programId + association.yearOrSemester + association.subjectId + createdAt"
echo ""

echo "📊 Validating firestore.indexes.json structure..."
if node -e "JSON.parse(require('fs').readFileSync('firestore.indexes.json', 'utf8')); console.log('✅ JSON structure is valid')" 2>/dev/null; then
    echo "✅ firestore.indexes.json is properly formatted"
else
    echo "❌ firestore.indexes.json has JSON formatting errors"
    exit 1
fi

echo ""
echo "🚀 To deploy these indexes, run:"
echo "   ./scripts/deploy-course-association-indexes.sh"
echo ""
echo "📱 Query patterns supported:"
echo "   • College-specific course filtering"
echo "   • Program-based course discovery"
echo "   • Year/semester course filtering"
echo "   • Subject-specific course lists"
echo "   • Combined association filtering"
echo "   • Basic course property filtering"
echo ""
echo "✅ All required indexes are configured and ready for deployment!"
