// Secure File Upload Forms for Student Data Management
// Handles resume uploads and document management as mentioned in CV

class FileUploadSystem {
    constructor() {
        this.maxFileSize = 5 * 1024 * 1024; // 5MB limit
        this.allowedTypes = {
            resume: ['.pdf'],
            documents: ['.pdf', '.doc', '.docx'],
            bulk: ['.csv', '.xlsx', '.xls']
        };
        this.uploadDirectory = '../uploads/';
        this.securityChecks = true;
        this.compressionEnabled = true;
        
        this.initializeFileUpload();
    }

    // Initialize file upload system
    initializeFileUpload() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupFileUploadHandlers();
            this.setupDragAndDrop();
            this.setupProgressIndicators();
            this.initializeSecurity();
        });
    }

    // Setup file upload event handlers
    setupFileUploadHandlers() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            // File selection handler
            input.addEventListener('change', (e) => {
                this.handleFileSelection(e.target);
            });
            
            // Setup custom upload area click
            const uploadArea = input.parentElement.querySelector('.file-upload-area');
            if (uploadArea) {
                uploadArea.addEventListener('click', () => {
                    input.click();
                });
            }
        });
    }

    // Setup drag and drop functionality
    setupDragAndDrop() {
        const uploadAreas = document.querySelectorAll('.file-upload-area');
        
        uploadAreas.forEach(area => {
            const input = area.parentElement.querySelector('input[type="file"]');
            
            // Prevent default drag behaviors
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                area.addEventListener(eventName, this.preventDefaults, false);
                document.body.addEventListener(eventName, this.preventDefaults, false);
            });
            
            // Highlight drop area when item is dragged over it
            ['dragenter', 'dragover'].forEach(eventName => {
                area.addEventListener(eventName, () => this.highlight(area), false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                area.addEventListener(eventName, () => this.unhighlight(area), false);
            });
            
            // Handle dropped files
            area.addEventListener('drop', (e) => {
                const files = e.dataTransfer.files;
                this.handleDroppedFiles(input, files);
            }, false);
        });
    }

    // Prevent default drag behaviors
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop area
    highlight(area) {
        area.style.background = '#e3e6ff';
        area.style.borderColor = '#5a67d8';
        area.style.transform = 'scale(1.02)';
    }

    // Remove highlight from drop area
    unhighlight(area) {
        area.style.background = '#f8f9ff';
        area.style.borderColor = '#667eea';
        area.style.transform = 'scale(1)';
    }

    // Handle file selection
    async handleFileSelection(input) {
        const files = Array.from(input.files);
        
        if (files.length === 0) return;
        
        // Validate files
        const validation = this.validateFiles(input, files);
        
        if (!validation.isValid) {
            this.showFileError(input, validation.errors.join(', '));
            input.value = ''; // Clear invalid files
            return;
        }
        
        // Process files
        await this.processFiles(input, files);
    }

    // Handle dropped files
    async handleDroppedFiles(input, fileList) {
        const files = Array.from(fileList);
        
        // Update input files
        const dt = new DataTransfer();
        files.forEach(file => dt.items.add(file));
        input.files = dt.files;
        
        // Process files
        await this.handleFileSelection(input);
    }

    // Validate uploaded files
    validateFiles(input, files) {
        const errors = [];
        const inputType = this.getInputType(input);
        const allowedTypes = this.allowedTypes[inputType] || [];
        
        files.forEach(file => {
            // File size validation
            if (file.size > this.maxFileSize) {
                errors.push(`${file.name} exceeds ${this.formatFileSize(this.maxFileSize)} limit`);
            }
            
            // File type validation
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            
            if (!allowedTypes.includes(fileExtension)) {
                errors.push(`${file.name} is not an allowed file type. Allowed: ${allowedTypes.join(', ')}`);
            }
            
            // File name validation (security)
            if (!this.isValidFileName(file.name)) {
                errors.push(`${file.name} contains invalid characters`);
            }
            
            // Content type validation (additional security)
            if (this.securityChecks && !this.isValidContentType(file, fileExtension)) {
                errors.push(`${file.name} appears to be corrupted or invalid`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Process and upload files
    async processFiles(input, files) {
        try {
            this.showFileProgress(input, 0);
            
            const processedFiles = [];
            let completed = 0;
            
            for (const file of files) {
                // Security scan
                if (this.securityChecks) {
                    const isSafe = await this.performSecurityScan(file);
                    if (!isSafe) {
                        this.showFileError(input, `Security check failed for ${file.name}`);
                        continue;
                    }
                }
                
                // Compress file if needed
                let processedFile = file;
                if (this.compressionEnabled && this.shouldCompress(file)) {
                    processedFile = await this.compressFile(file);
                }
                
                // Generate secure filename
                const secureFileName = this.generateSecureFileName(processedFile);
                
                // Simulate file upload (in real implementation, this would upload to server)
                const uploadResult = await this.simulateFileUpload(processedFile, secureFileName);
                
                processedFiles.push({
                    originalName: file.name,
                    secureFileName: secureFileName,
                    size: processedFile.size,
                    uploadPath: uploadResult.path,
                    uploadedAt: new Date().toISOString()
                });
                
                completed++;
                this.showFileProgress(input, (completed / files.length) * 100);
                
                // Small delay to show progress
                await this.delay(200);
            }
            
            // Update UI with uploaded files
            this.updateFileUploadDisplay(input, processedFiles);
            this.showFileSuccess(input, `Successfully uploaded ${processedFiles.length} file(s)`);
            
            // Store file information
            this.storeFileInformation(input, processedFiles);
            
        } catch (error) {
            console.error('Error processing files:', error);
            this.showFileError(input, 'Failed to upload files. Please try again.');
        } finally {
            this.hideFileProgress(input);
        }
    }

    // Perform security scan on file
    async performSecurityScan(file) {
        // Simulate security scanning
        await this.delay(100);
        
        // Check file signature (magic numbers)
        const signature = await this.getFileSignature(file);
        
        // PDF signature check
        if (file.name.endsWith('.pdf')) {
            return signature.startsWith('25504446'); // %PDF
        }
        
        // DOC/DOCX signature check
        if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
            return signature.startsWith('504b0304') || signature.startsWith('d0cf11e0'); // ZIP or OLE
        }
        
        // CSV/Excel files
        if (file.name.endsWith('.csv')) {
            return true; // CSV files are plain text
        }
        
        if (file.name.endsWith('.xlsx')) {
            return signature.startsWith('504b0304'); // ZIP signature
        }
        
        return false;
    }

    // Get file signature (first few bytes)
    async getFileSignature(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const arr = new Uint8Array(e.target.result).subarray(0, 4);
                let header = '';
                for (let i = 0; i < arr.length; i++) {
                    header += arr[i].toString(16).padStart(2, '0');
                }
                resolve(header);
            };
            reader.readAsArrayBuffer(file.slice(0, 4));
        });
    }

    // Check if file should be compressed
    shouldCompress(file) {
        const compressibleTypes = ['.pdf', '.doc', '.docx'];
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        return compressibleTypes.includes(extension) && file.size > 1024 * 1024; // Compress files > 1MB
    }

    // Compress file (simplified simulation)
    async compressFile(file) {
        // In real implementation, this would use compression libraries
        // For demo purposes, we'll just simulate compression
        await this.delay(500);
        
        // Create a new File object with reduced size simulation
        const compressedSize = Math.floor(file.size * 0.7); // Simulate 30% compression
        
        const compressedFile = new File([file], file.name, {
            type: file.type,
            lastModified: file.lastModified
        });
        
        // Simulate size reduction
        Object.defineProperty(compressedFile, 'size', {
            value: compressedSize,
            writable: false
        });
        
        return compressedFile;
    }

    // Generate secure filename
    generateSecureFileName(file) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        
        return `${timestamp}_${randomString}_${sanitizedName}${extension}`;
    }

    // Simulate file upload to server
    async simulateFileUpload(file, secureFileName) {
        // Simulate network upload
        await this.delay(1000);
        
        // In real implementation, this would upload to server/cloud storage
        const uploadPath = `${this.uploadDirectory}${secureFileName}`;
        
        // Store file data in localStorage for demo
        const fileData = await this.fileToBase64(file);
        const fileInfo = {
            fileName: secureFileName,
            originalName: file.name,
            size: file.size,
            type: file.type,
            data: fileData,
            uploadedAt: new Date().toISOString()
        };
        
        const uploadedFiles = JSON.parse(localStorage.getItem('uploaded_files') || '[]');
        uploadedFiles.push(fileInfo);
        localStorage.setItem('uploaded_files', JSON.stringify(uploadedFiles));
        
        return {
            path: uploadPath,
            success: true
        };
    }

    // Convert file to base64 for storage
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Handle bulk file upload (CSV/Excel)
    async handleBulkUpload(input, file) {
        try {
            this.showFileProgress(input, 0);
            
            // Validate bulk file
            const validation = this.validateFiles(input, [file]);
            if (!validation.isValid) {
                this.showFileError(input, validation.errors.join(', '));
                return;
            }
            
            // Read file content
            const content = await this.readFileContent(file);
            
            this.showFileProgress(input, 50);
            
            // Parse data based on file type
            let parsedData;
            if (file.name.endsWith('.csv')) {
                parsedData = this.parseCSV(content);
            } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                parsedData = await this.parseExcel(file);
            }
            
            this.showFileProgress(input, 75);
            
            // Validate parsed data
            const validationResults = this.validateBulkData(parsedData);
            
            if (validationResults.errors.length > 0) {
                this.showFileError(input, `Data validation errors: ${validationResults.errors.join(', ')}`);
                return;
            }
            
            this.showFileProgress(input, 90);
            
            // Import to Google Sheets
            await googleSheetsAPI.bulkImportStudents(parsedData);
            
            this.showFileProgress(input, 100);
            this.showFileSuccess(input, `Successfully imported ${parsedData.length} records`);
            
            // Log activity
            googleSheetsAPI.logActivity('file_uploaded', 'bulk_import', `${parsedData.length} students imported`);
            
        } catch (error) {
            console.error('Error in bulk upload:', error);
            this.showFileError(input, 'Failed to process bulk upload');
        } finally {
            this.hideFileProgress(input);
        }
    }

    // Read file content
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    // Parse CSV content
    parseCSV(csvContent) {
        const lines = csvContent.split('\n');
        const students = [];
        
        // Skip header line
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = this.parseCSVLine(line);
            
            if (values.length >= 7) {
                students.push({
                    studentId: values[0],
                    fullName: values[1],
                    email: values[2],
                    phone: values[3],
                    department: values[4],
                    year: values[5],
                    cgpa: parseFloat(values[6]) || 0,
                    skills: values[7] || ''
                });
            }
        }
        
        return students;
    }

    // Parse CSV line handling quotes and commas
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    // Parse Excel file (simplified)
    async parseExcel(file) {
        // In real implementation, would use libraries like SheetJS
        // For demo, convert to CSV first
        const csvContent = await this.excelToCSV(file);
        return this.parseCSV(csvContent);
    }

    // Convert Excel to CSV (simulation)
    async excelToCSV(file) {
        // Simulate Excel parsing
        await this.delay(1000);
        
        // Return sample CSV data for demo
        return `Student ID,Full Name,Email,Phone,Department,Year,CGPA,Skills
CS-2023-101,Alice Johnson,alice@email.com,9876543210,Computer Science,2023,8.5,JavaScript React Node.js
IT-2023-102,Bob Smith,bob@email.com,9876543211,Information Technology,2023,7.8,Python Django SQL
CS-2023-103,Carol Davis,carol@email.com,9876543212,Computer Science,2023,9.2,Java Spring Angular`;
    }

    // Validate bulk data
    validateBulkData(students) {
        const errors = [];
        const warnings = [];
        const duplicates = new Set();
        const emailSet = new Set();
        
        students.forEach((student, index) => {
            const row = index + 2; // +2 for header and 0-index
            
            // Check required fields
            if (!student.studentId) {
                errors.push(`Row ${row}: Student ID is required`);
            }
            
            if (!student.fullName) {
                errors.push(`Row ${row}: Full Name is required`);
            }
            
            if (!student.email) {
                errors.push(`Row ${row}: Email is required`);
            }
            
            // Check duplicates within file
            if (student.studentId) {
                if (duplicates.has(student.studentId)) {
                    errors.push(`Row ${row}: Duplicate Student ID ${student.studentId}`);
                } else {
                    duplicates.add(student.studentId);
                }
            }
            
            if (student.email) {
                if (emailSet.has(student.email)) {
                    errors.push(`Row ${row}: Duplicate Email ${student.email}`);
                } else {
                    emailSet.add(student.email);
                }
            }
            
            // Validate CGPA
            if (student.cgpa < 0 || student.cgpa > 10) {
                errors.push(`Row ${row}: Invalid CGPA ${student.cgpa}`);
            } else if (student.cgpa < 4.0) {
                warnings.push(`Row ${row}: Low CGPA ${student.cgpa}`);
            }
            
            // Validate email format
            if (student.email && !this.isValidEmail(student.email)) {
                errors.push(`Row ${row}: Invalid email format ${student.email}`);
            }
        });
        
        return {
            errors,
            warnings,
            isValid: errors.length === 0
        };
    }

    // File type detection
    getInputType(input) {
        if (input.id === 'resume') return 'resume';
        if (input.id === 'documents') return 'documents';
        if (input.id === 'bulkUpload') return 'bulk';
        return 'documents';
    }

    // Validate filename for security
    isValidFileName(fileName) {
        // Check for dangerous characters and patterns
        const dangerousPatterns = [
            /\.\./,          // Directory traversal
            /[<>:"|?*]/,     // Invalid filename characters
            /\.(exe|bat|cmd|scr|vbs|js)$/i, // Executable files
            /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i // Reserved names
        ];
        
        return !dangerousPatterns.some(pattern => pattern.test(fileName));
    }

    // Validate content type
    isValidContentType(file, extension) {
        const validTypes = {
            '.pdf': ['application/pdf'],
            '.doc': ['application/msword'],
            '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            '.csv': ['text/csv', 'application/csv', 'text/plain'],
            '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            '.xls': ['application/vnd.ms-excel']
        };
        
        const allowedTypes = validTypes[extension] || [];
        return allowedTypes.includes(file.type) || file.type === '';
    }

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Store file information
    storeFileInformation(input, files) {
        const fieldName = input.name || input.id;
        const formId = input.closest('form').id;
        
        // Store file info in form data
        if (!window.formFileData) {
            window.formFileData = {};
        }
        
        if (!window.formFileData[formId]) {
            window.formFileData[formId] = {};
        }
        
        window.formFileData[formId][fieldName] = files;
    }

    // Get stored file information
    getStoredFileInfo(formId, fieldName) {
        if (window.formFileData && window.formFileData[formId]) {
            return window.formFileData[formId][fieldName] || [];
        }
        return [];
    }

    // Update file upload display
    updateFileUploadDisplay(input, files) {
        const container = input.closest('.file-upload-container');
        const uploadArea = container.querySelector('.file-upload-area');
        
        if (files.length === 1) {
            const file = files[0];
            uploadArea.innerHTML = `
                <i class="fas fa-check-circle" style="color: #28a745; font-size: 2rem;"></i>
                <p style="color: #28a745; font-weight: 600;">${file.originalName}</p>
                <small style="color: #6c757d;">Size: ${this.formatFileSize(file.size)} • Uploaded successfully</small>
                <button type="button" class="btn btn-sm btn-secondary mt-2" onclick="fileUploadSystem.removeFile('${input.id}', 0)">
                    <i class="fas fa-trash"></i> Remove
                </button>
            `;
        } else if (files.length > 1) {
            uploadArea.innerHTML = `
                <i class="fas fa-check-circle" style="color: #28a745; font-size: 2rem;"></i>
                <p style="color: #28a745; font-weight: 600;">${files.length} files uploaded</p>
                <small style="color: #6c757d;">Total size: ${this.formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}</small>
                <div class="uploaded-files-list mt-2">
                    ${files.map((file, index) => `
                        <div class="uploaded-file-item">
                            <span>${file.originalName}</span>
                            <button type="button" class="btn-icon btn-danger" onclick="fileUploadSystem.removeFile('${input.id}', ${index})">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    // Remove uploaded file
    removeFile(inputId, fileIndex) {
        const input = document.getElementById(inputId);
        const formId = input.closest('form').id;
        const fieldName = input.name || input.id;
        
        // Remove from stored data
        if (window.formFileData && window.formFileData[formId] && window.formFileData[formId][fieldName]) {
            window.formFileData[formId][fieldName].splice(fileIndex, 1);
            
            // Update display
            const remainingFiles = window.formFileData[formId][fieldName];
            if (remainingFiles.length === 0) {
                this.resetFileUploadArea(input);
            } else {
                this.updateFileUploadDisplay(input, remainingFiles);
            }
        }
        
        // Clear input
        input.value = '';
    }

    // Reset file upload area
    resetFileUploadArea(input) {
        const container = input.closest('.file-upload-container');
        const uploadArea = container.querySelector('.file-upload-area');
        
        if (input.id === 'resume') {
            uploadArea.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Click to upload resume or drag and drop</p>
                <small>PDF files only, max 5MB</small>
            `;
        } else if (input.id === 'documents') {
            uploadArea.innerHTML = `
                <i class="fas fa-paperclip"></i>
                <p>Upload additional documents</p>
                <small>PDF, DOC, DOCX files only</small>
            `;
        } else if (input.id === 'bulkUpload') {
            uploadArea.innerHTML = `
                <i class="fas fa-file-upload"></i>
                <p>Upload CSV or Excel file</p>
                <small>CSV, XLSX files only</small>
            `;
        }
    }

    // Setup progress indicators
    setupProgressIndicators() {
        document.addEventListener('DOMContentLoaded', () => {
            const fileInputs = document.querySelectorAll('input[type="file"]');
            
            fileInputs.forEach(input => {
                this.createProgressIndicator(input);
            });
        });
    }

    // Create progress indicator for file input
    createProgressIndicator(input) {
        const container = input.closest('.file-upload-container');
        
        const progressContainer = document.createElement('div');
        progressContainer.className = 'upload-progress';
        progressContainer.style.cssText = `
            display: none;
            margin-top: 10px;
            background: #f8f9fa;
            border-radius: 5px;
            padding: 10px;
        `;
        
        progressContainer.innerHTML = `
            <div class="progress-bar-container" style="background: #e9ecef; border-radius: 10px; height: 8px; overflow: hidden;">
                <div class="progress-bar" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100%; width: 0%; transition: width 0.3s ease;"></div>
            </div>
            <div class="progress-text" style="margin-top: 5px; font-size: 0.8rem; color: #6c757d; text-align: center;"></div>
        `;
        
        container.appendChild(progressContainer);
    }

    // Show file upload progress
    showFileProgress(input, percentage) {
        const container = input.closest('.file-upload-container');
        const progressContainer = container.querySelector('.upload-progress');
        const progressBar = progressContainer.querySelector('.progress-bar');
        const progressText = progressContainer.querySelector('.progress-text');
        
        progressContainer.style.display = 'block';
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `Uploading... ${Math.round(percentage)}%`;
    }

    // Hide file upload progress
    hideFileProgress(input) {
        const container = input.closest('.file-upload-container');
        const progressContainer = container.querySelector('.upload-progress');
        
        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 1000);
    }

    // Show file upload success
    showFileSuccess(input, message) {
        const container = input.closest('.file-upload-container');
        
        let successDiv = container.querySelector('.file-success');
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.className = 'file-success';
            successDiv.style.cssText = `
                margin-top: 10px;
                padding: 8px 12px;
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
                border-radius: 5px;
                font-size: 0.9rem;
            `;
            container.appendChild(successDiv);
        }
        
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    }

    // Show file upload error
    showFileError(input, message) {
        const container = input.closest('.file-upload-container');
        
        let errorDiv = container.querySelector('.file-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'file-error';
            errorDiv.style.cssText = `
                margin-top: 10px;
                padding: 8px 12px;
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
                border-radius: 5px;
                font-size: 0.9rem;
            `;
            container.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    // Initialize security measures
    initializeSecurity() {
        // Setup file type checking
        this.setupContentTypeValidation();
        
        // Setup virus scanning simulation
        this.setupVirusScanning();
        
        // Setup upload rate limiting
        this.setupRateLimiting();
    }

    // Setup content type validation
    setupContentTypeValidation() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                files.forEach(file => {
                    this.validateContentType(file);
                });
            });
        });
    }

    // Validate file content type
    async validateContentType(file) {
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        const expectedType = this.getExpectedContentType(extension);
        
        if (expectedType && file.type !== expectedType && file.type !== '') {
            console.warn(`Content type mismatch for ${file.name}: expected ${expectedType}, got ${file.type}`);
        }
    }

    // Get expected content type for extension
    getExpectedContentType(extension) {
        const types = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.csv': 'text/csv',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
        return types[extension];
    }

    // Setup virus scanning simulation
    setupVirusScanning() {
        // Simulate antivirus scanning
        this.virusPatterns = [
            /malware/i,
            /virus/i,
            /trojan/i,
            /\x00/g, // Null bytes
            /<script/i // Script tags in text files
        ];
    }

    // Setup upload rate limiting
    setupRateLimiting() {
        this.uploadAttempts = new Map();
        this.maxUploadsPerMinute = 10;
    }

    // Check upload rate limit
    checkRateLimit(clientId = 'default') {
        const now = Date.now();
        const attempts = this.uploadAttempts.get(clientId) || [];
        
        // Remove attempts older than 1 minute
        const recentAttempts = attempts.filter(time => now - time < 60000);
        
        if (recentAttempts.length >= this.maxUploadsPerMinute) {
            return false;
        }
        
        // Add current attempt
        recentAttempts.push(now);
        this.uploadAttempts.set(clientId, recentAttempts);
        
        return true;
    }

    // Format file size for display
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Clear all file uploads for a form
    clearFormFiles(formId) {
        if (window.formFileData && window.formFileData[formId]) {
            delete window.formFileData[formId];
        }
        
        const form = document.getElementById(formId);
        if (form) {
            const fileInputs = form.querySelectorAll('input[type="file"]');
            fileInputs.forEach(input => {
                input.value = '';
                this.resetFileUploadArea(input);
            });
        }
    }

    // Get all files for a form
    getFormFiles(formId) {
        return window.formFileData && window.formFileData[formId] ? window.formFileData[formId] : {};
    }

    // Download uploaded file
    downloadFile(fileName) {
        const uploadedFiles = JSON.parse(localStorage.getItem('uploaded_files') || '[]');
        const file = uploadedFiles.find(f => f.fileName === fileName);
        
        if (file) {
            // Create download link
            const link = document.createElement('a');
            link.href = file.data;
            link.download = file.originalName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

// Initialize file upload system
const fileUploadSystem = new FileUploadSystem();

// Global functions for HTML onclick events
window.handleBulkUpload = async function(event) {
    const file = event.target.files[0];
    if (file) {
        await fileUploadSystem.handleBulkUpload(event.target, file);
    }
};

window.fileUploadSystem = fileUploadSystem;
