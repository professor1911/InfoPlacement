// Configuration file for Student Data Management System - InfoPlacement Portal
// Google Sheets API and Application Settings

const config = {
    // Google Sheets API Configuration
    googleSheets: {
        apiKey: 'YOUR_GOOGLE_SHEETS_API_KEY', // Replace with your actual API key
        spreadsheetId: 'YOUR_SPREADSHEET_ID', // Replace with your Google Sheets ID
        
        // Sheet names for different data types
        sheets: {
            students: 'Students',
            companies: 'Companies',
            placements: 'Placements',
            activities: 'Activities'
        },
        
        // API endpoints
        baseUrl: 'https://sheets.googleapis.com/v4/spreadsheets',
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets'
        ]
    },
    
    // Application Settings
    app: {
        name: 'InfoPlacement Portal',
        version: '1.0.0',
        description: 'Student Data Management System with Placement Operations',
        
        // Pagination settings
        pagination: {
            defaultItemsPerPage: 10,
            maxItemsPerPage: 100
        },
        
        // Cache settings
        cache: {
            ttl: 300000, // 5 minutes in milliseconds
            maxSize: 1000 // Maximum number of cached items
        },
        
        // Performance settings
        performance: {
            batchSize: 100, // For bulk operations
            maxRetries: 3,
            retryDelay: 1000, // milliseconds
            requestTimeout: 30000 // 30 seconds
        }
    },
    
    // File Upload Configuration
    fileUpload: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: {
            resume: ['.pdf'],
            documents: ['.pdf', '.doc', '.docx'],
            bulk: ['.csv', '.xlsx', '.xls']
        },
        uploadDirectory: '../uploads/',
        securityChecks: true,
        compressionEnabled: true,
        
        // Rate limiting
        rateLimiting: {
            maxUploadsPerMinute: 10,
            maxUploadsPerHour: 100
        }
    },
    
    // Validation Rules
    validation: {
        studentId: {
            pattern: /^[A-Z]{2}-\d{4}-\d{3}$/,
            example: 'CS-2023-001'
        },
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        phone: {
            pattern: /^[\+]?[1-9][\d]{9,14}$/
        },
        cgpa: {
            min: 0,
            max: 10,
            step: 0.01
        },
        companyId: {
            pattern: /^COMP-\d{3}$/,
            example: 'COMP-001'
        },
        placementId: {
            pattern: /^PL-\d{3}$/,
            example: 'PL-001'
        }
    },
    
    // Department Configuration
    departments: [
        { code: 'CS', name: 'Computer Science' },
        { code: 'IT', name: 'Information Technology' },
        { code: 'EC', name: 'Electronics Engineering' },
        { code: 'ME', name: 'Mechanical Engineering' },
        { code: 'CE', name: 'Civil Engineering' }
    ],
    
    // Academic Years
    academicYears: ['2021', '2022', '2023', '2024', '2025'],
    
    // Industry Types
    industries: [
        'Technology',
        'Finance',
        'Healthcare',
        'Manufacturing',
        'Consulting',
        'Education',
        'Government',
        'Startup',
        'Other'
    ],
    
    // Placement Status Options
    placementStatuses: [
        'Applied',
        'Shortlisted',
        'Interview Scheduled',
        'Interview Completed',
        'Selected',
        'Rejected',
        'Offer Letter',
        'Joined'
    ],
    
    // Notification Settings
    notifications: {
        duration: 5000, // 5 seconds
        maxNotifications: 5,
        position: 'top-right'
    },
    
    // Security Settings
    security: {
        enableFileScanning: true,
        enableRateLimiting: true,
        enableContentTypeValidation: true,
        enableSqlInjectionProtection: true,
        enableXssProtection: true
    },
    
    // Feature Flags
    features: {
        enableGoogleSheetsIntegration: true,
        enableBulkOperations: true,
        enableRealTimeValidation: true,
        enableFileUpload: true,
        enableAutoDistribution: true,
        enableAnalytics: true,
        enableExport: true,
        enableImport: true
    },
    
    // UI Settings
    ui: {
        theme: 'light', // 'light' or 'dark'
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        
        // Animation settings
        animations: {
            enabled: true,
            duration: 300 // milliseconds
        },
        
        // Responsive breakpoints
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        }
    },
    
    // Data Sources
    dataSources: {
        primary: 'googleSheets', // 'googleSheets', 'localStorage', 'database'
        fallback: 'localStorage',
        
        // Sync settings
        autoSync: true,
        syncInterval: 300000, // 5 minutes
        
        // Backup settings
        enableBackup: true,
        backupInterval: 3600000 // 1 hour
    },
    
    // Analytics Configuration
    analytics: {
        trackUserActions: true,
        trackPerformance: true,
        trackErrors: true,
        
        // Metrics to track
        metrics: [
            'students_added',
            'companies_added',
            'placements_created',
            'data_distributions',
            'form_submissions',
            'file_uploads',
            'search_queries'
        ]
    },
    
    // Export/Import Settings
    export: {
        defaultFormat: 'csv',
        supportedFormats: ['csv', 'json', 'xlsx'],
        includeHeaders: true,
        
        // CSV settings
        csv: {
            delimiter: ',',
            encoding: 'utf-8',
            includeTimestamp: true
        }
    },
    
    // Development Settings
    development: {
        enableDebugMode: false,
        enableLogging: true,
        logLevel: 'info', // 'debug', 'info', 'warn', 'error'
        enableMockData: true,
        
        // Sample data settings
        sampleData: {
            studentsCount: 50,
            companiesCount: 10,
            placementsCount: 25
        }
    }
};

// Environment-specific configurations
const environments = {
    development: {
        ...config,
        development: {
            ...config.development,
            enableDebugMode: true,
            enableMockData: true,
            logLevel: 'debug'
        }
    },
    
    production: {
        ...config,
        development: {
            ...config.development,
            enableDebugMode: false,
            enableMockData: false,
            logLevel: 'error'
        }
    }
};

// Auto-detect environment
const currentEnvironment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1' || 
                          window.location.protocol === 'file:' ? 
                          'development' : 'production';

// Export the configuration based on environment
const finalConfig = environments[currentEnvironment];

// Make configuration globally available
window.APP_CONFIG = finalConfig;

// Initialize configuration
document.addEventListener('DOMContentLoaded', () => {
    console.log(`InfoPlacement Portal v${finalConfig.app.version} - ${currentEnvironment} mode`);
    
    // Apply UI theme
    if (finalConfig.ui.theme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    // Setup Google Sheets API configuration
    if (window.googleSheetsAPI) {
        googleSheetsAPI.apiKey = finalConfig.googleSheets.apiKey;
        googleSheetsAPI.spreadsheetId = finalConfig.googleSheets.spreadsheetId;
    }
    
    // Setup file upload configuration
    if (window.fileUploadSystem) {
        fileUploadSystem.maxFileSize = finalConfig.fileUpload.maxFileSize;
        fileUploadSystem.allowedTypes = finalConfig.fileUpload.allowedTypes;
        fileUploadSystem.securityChecks = finalConfig.fileUpload.securityChecks;
    }
    
    // Setup validation system configuration
    if (window.validationSystem) {
        // Apply validation rules from config
        Object.assign(validationSystem.rules, finalConfig.validation);
    }
});

// Utility functions for configuration access
window.getConfig = function(path) {
    const keys = path.split('.');
    let value = finalConfig;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return undefined;
        }
    }
    
    return value;
};

window.setConfig = function(path, newValue) {
    const keys = path.split('.');
    let obj = finalConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in obj) || typeof obj[key] !== 'object') {
            obj[key] = {};
        }
        obj = obj[key];
    }
    
    obj[keys[keys.length - 1]] = newValue;
};

// Export for ES modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = finalConfig;
}

console.log('Configuration loaded successfully');
