#!/usr/bin/env ts-node

/**
 * Data Schema Validation Script for QuestEdu Admin
 * 
 * This script validates the existing Firebase data against our TypeScript schemas
 * and provides a report of any data inconsistencies
 */

import { getApps, initializeApp } from 'firebase/app'
import { collection, getDocs, getFirestore } from 'firebase/firestore'
import {
    ValidationError,
    ValidationFactory
} from '../lib/data-validation'
import { COLLECTIONS } from './setup-firebase-collections'

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyALWHvJopjpZ9amcpV74jrBlYqEZzeWaTI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "questedu-cb2a4.firebaseapp.com", 
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "questedu-cb2a4",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "questedu-cb2a4.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "247130380208",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:247130380208:web:dfe0053ff32ae3194a6875"
}

// Initialize Firebase
let app
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

const db = getFirestore(app)

/**
 * Validation report interface
 */
interface ValidationReport {
  collection: string
  totalDocuments: number
  validDocuments: number
  invalidDocuments: number
  errors: {
    documentId: string
    errors: ValidationError[]
  }[]
  warnings: string[]
}

/**
 * Data schema validator class
 */
class DataSchemaValidator {
  
  private reports: ValidationReport[] = []
  
  /**
   * Validate all collections
   */
  async validateAllCollections(): Promise<ValidationReport[]> {
    console.log('🔍 Starting data schema validation...')
    console.log('=' .repeat(60))
    
    const validations = [
      { collection: COLLECTIONS.USERS, type: 'user' },
      { collection: COLLECTIONS.COURSES, type: 'course' },
      { collection: COLLECTIONS.COURSE_TOPICS, type: 'courseTopic' }
    ]
    
    for (const validation of validations) {
      await this.validateCollection(validation.collection, validation.type)
    }
    
    return this.reports
  }
  
  /**
   * Validate a specific collection
   */
  async validateCollection(collectionName: string, type: string): Promise<ValidationReport> {
    console.log(`🔄 Validating ${collectionName} collection...`)
    
    const report: ValidationReport = {
      collection: collectionName,
      totalDocuments: 0,
      validDocuments: 0,
      invalidDocuments: 0,
      errors: [],
      warnings: []
    }
    
    try {
      const snapshot = await getDocs(collection(db, collectionName))
      report.totalDocuments = snapshot.size
      
      if (report.totalDocuments === 0) {
        report.warnings.push(`Collection ${collectionName} is empty`)
        console.log(`⚠️  Collection ${collectionName} is empty`)
        this.reports.push(report)
        return report
      }
      
      for (const doc of snapshot.docs) {
        const data = { id: doc.id, ...doc.data() }
        
        try {
          const validationResult = ValidationFactory.validateData(type, data)
          
          if (validationResult.isValid) {
            report.validDocuments++
          } else {
            report.invalidDocuments++
            report.errors.push({
              documentId: doc.id,
              errors: validationResult.errors
            })
          }
          
        } catch (error) {
          report.invalidDocuments++
          const errorMessage = error instanceof Error ? error.message : String(error)
          report.errors.push({
            documentId: doc.id,
            errors: [new ValidationError('validation', data, `Validation error: ${errorMessage}`)]
          })
        }
      }
      
      const successRate = ((report.validDocuments / report.totalDocuments) * 100).toFixed(1)
      
      if (report.invalidDocuments === 0) {
        console.log(`✅ ${collectionName}: ${report.validDocuments}/${report.totalDocuments} valid (${successRate}%)`)
      } else {
        console.log(`❌ ${collectionName}: ${report.validDocuments}/${report.totalDocuments} valid (${successRate}%) - ${report.invalidDocuments} errors`)
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`❌ Error validating ${collectionName}:`, errorMessage)
      report.warnings.push(`Failed to validate collection: ${errorMessage}`)
    }
    
    this.reports.push(report)
    return report
  }
  
  /**
   * Generate detailed validation report
   */
  generateReport(): string {
    const totalDocuments = this.reports.reduce((sum, report) => sum + report.totalDocuments, 0)
    const totalValid = this.reports.reduce((sum, report) => sum + report.validDocuments, 0)
    const totalInvalid = this.reports.reduce((sum, report) => sum + report.invalidDocuments, 0)
    const overallSuccessRate = totalDocuments > 0 ? ((totalValid / totalDocuments) * 100).toFixed(1) : '0'
    
    let report = `
# Data Schema Validation Report
Generated: ${new Date().toISOString()}

## Summary
- **Total Documents**: ${totalDocuments}
- **Valid Documents**: ${totalValid}
- **Invalid Documents**: ${totalInvalid}
- **Overall Success Rate**: ${overallSuccessRate}%

## Collection Details
`
    
    for (const collectionReport of this.reports) {
      const successRate = collectionReport.totalDocuments > 0 
        ? ((collectionReport.validDocuments / collectionReport.totalDocuments) * 100).toFixed(1)
        : '0'
      
      report += `
### ${collectionReport.collection}
- **Total**: ${collectionReport.totalDocuments}
- **Valid**: ${collectionReport.validDocuments}
- **Invalid**: ${collectionReport.invalidDocuments}
- **Success Rate**: ${successRate}%
`
      
      if (collectionReport.warnings.length > 0) {
        report += `
**Warnings:**
${collectionReport.warnings.map(w => `- ${w}`).join('\n')}
`
      }
      
      if (collectionReport.errors.length > 0) {
        report += `
**Validation Errors:**
`
        
        collectionReport.errors.forEach(error => {
          report += `
**Document ID**: \`${error.documentId}\`
${error.errors.map(e => `- **${e.field}**: ${e.message}`).join('\n')}
`
        })
      }
    }
    
    if (totalInvalid > 0) {
      report += `
## Recommendations

### Data Cleanup
1. Review invalid documents and fix data inconsistencies
2. Update validation rules if needed
3. Consider data migration scripts for bulk fixes

### Prevention
1. Implement server-side validation in API endpoints
2. Add client-side validation in forms
3. Use TypeScript interfaces consistently
4. Set up automated validation tests
`
    }
    
    return report
  }
  
  /**
   * Save report to file
   */
  async saveReport(filename: string = 'validation-report.md'): Promise<void> {
    const fs = await import('fs')
    const path = await import('path')
    
    const reportContent = this.generateReport()
    const filepath = path.join(process.cwd(), filename)
    
    fs.writeFileSync(filepath, reportContent)
    console.log(`📄 Validation report saved to: ${filepath}`)
  }
  
  /**
   * Fix common data issues
   */
  async suggestFixes(): Promise<string[]> {
    const suggestions: string[] = []
    
    for (const report of this.reports) {
      for (const error of report.errors) {
        for (const validationError of error.errors) {
          if (validationError.field === 'email' && validationError.message.includes('Invalid email format')) {
            suggestions.push(`Fix email format for document ${error.documentId} in ${report.collection}`)
          }
          
          if (validationError.field === 'rating' && validationError.message.includes('must be between')) {
            suggestions.push(`Normalize rating value for document ${error.documentId} in ${report.collection}`)
          }
          
          if (validationError.message.includes('required')) {
            suggestions.push(`Add missing required field '${validationError.field}' for document ${error.documentId} in ${report.collection}`)
          }
        }
      }
    }
    
    return suggestions
  }
}

/**
 * Main validation function
 */
async function validateDataSchema() {
  const validator = new DataSchemaValidator()
  
  try {
    const reports = await validator.validateAllCollections()
    
    console.log('\n' + '=' .repeat(60))
    console.log('📊 Validation Summary')
    console.log('=' .repeat(60))
    
    const totalDocuments = reports.reduce((sum, report) => sum + report.totalDocuments, 0)
    const totalValid = reports.reduce((sum, report) => sum + report.validDocuments, 0)
    const totalInvalid = reports.reduce((sum, report) => sum + report.invalidDocuments, 0)
    
    console.log(`Total Documents: ${totalDocuments}`)
    console.log(`Valid Documents: ${totalValid}`)
    console.log(`Invalid Documents: ${totalInvalid}`)
    
    if (totalInvalid > 0) {
      console.log('\n❌ Data validation issues found!')
      console.log('📄 Generating detailed report...')
      await validator.saveReport()
      
      const suggestions = await validator.suggestFixes()
      if (suggestions.length > 0) {
        console.log('\n💡 Suggested fixes:')
        suggestions.slice(0, 10).forEach((suggestion, index) => {
          console.log(`${index + 1}. ${suggestion}`)
        })
        
        if (suggestions.length > 10) {
          console.log(`... and ${suggestions.length - 10} more (see full report)`)
        }
      }
    } else {
      console.log('\n✅ All data validates successfully!')
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error)
    process.exit(1)
  }
}

/**
 * CLI interface
 */
if (require.main === module) {
  const args = process.argv.slice(2)
  const command = args[0] || 'validate'
  
  switch (command) {
    case 'validate':
      validateDataSchema()
      break
    case 'help':
      console.log('Data Schema Validation Script')
      console.log('')
      console.log('Usage:')
      console.log('  npm run validate:data           # Validate all collections')
      console.log('  ts-node scripts/validate-data-schema.ts validate')
      console.log('  ts-node scripts/validate-data-schema.ts help')
      break
    default:
      console.log('Unknown command. Use "help" for usage information.')
      break
  }
}

export { DataSchemaValidator }
