// Real-time Validation Features for Student Data Management
// As mentioned in CV - provides instant feedback on form inputs

class ValidationSystem {
    constructor() {
        this.rules = {
            studentId: {
                required: true,
                pattern: /^[A-Z]{2}-\d{4}-\d{3}$/,
                message: 'Student ID format: XX-YYYY-XXX (e.g., CS-2023-001)'
            },
            fullName: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-Z\s]+$/,
                message: 'Name should contain only letters and spaces'
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            },
            phone: {
                required: true,
                pattern: /^[\+]?[1-9][\d]{9,14}$/,
                message: 'Please enter a valid phone number'
            },
            cgpa: {
                required: true,
                min: 0,
                max: 10,
                step: 0.01,
                message: 'CGPA must be between 0.00 and 10.00'
            },
            companyId: {
                required: true,
                pattern: /^COMP-\d{3}$/,
                message: 'Company ID format: COMP-XXX (e.g., COMP-001)'
            },
            packageOffered: {
                min: 0,
                max: 100,
                message: 'Package should be between 0 and 100 LPA'
            }
        };
        
        this.initializeValidation();
    }

    // Initialize real-time validation on all forms
    initializeValidation() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupFormValidation();
            this.setupRealTimeValidation();
        });
    }

    // Setup validation for all forms
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.validateForm(form);
            });
        });
    }

    // Setup real-time validation on input events
    setupRealTimeValidation() {
        // Add event listeners for real-time validation
        this.addRealTimeListeners();
        
        // Setup custom validators for specific fields
        this.setupCustomValidators();
        
        // Initialize form state
        this.initializeFormState();
    }

    // Add real-time event listeners
    addRealTimeListeners() {
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // Real-time validation on input
            input.addEventListener('input', (e) => {
                this.validateField(e.target);
            });
            
            // Validation on blur for better UX
            input.addEventListener('blur', (e) => {
                this.validateField(e.target);
            });
            
            // Clear validation on focus
            input.addEventListener('focus', (e) => {
                this.clearFieldError(e.target);
            });
        });
    }

    // Setup custom validators for specific business logic
    setupCustomValidators() {
        // Student ID uniqueness validation
        this.setupStudentIdValidator();
        
        // Email uniqueness validation
        this.setupEmailValidator();
        
        // File validation
        this.setupFileValidators();
        
        // CGPA range validation
        this.setupCgpaValidator();
        
        // Company-specific validation
        this.setupCompanyValidators();
    }

    // Student ID uniqueness validation
    setupStudentIdValidator() {
        const studentIdField = document.getElementById('studentId');
        if (studentIdField) {
            studentIdField.addEventListener('blur', async (e) => {
                const value = e.target.value.trim();
                if (value && this.validateField(e.target)) {
                    await this.checkStudentIdUniqueness(e.target, value);
                }
            });
        }
    }

    // Check if student ID already exists
    async checkStudentIdUniqueness(field, studentId) {
        try {
            // Show checking indicator
            this.showFieldLoading(field, true);
            
            // Simulate API call to check uniqueness
            // In real implementation, this would call Google Sheets API
            const existingStudents = JSON.parse(localStorage.getItem('students') || '[]');
            const exists = existingStudents.some(student => student.studentId === studentId);
            
            await this.delay(500); // Simulate network delay
            
            this.showFieldLoading(field, false);
            
            if (exists) {
                this.showFieldError(field, 'Student ID already exists');
                return false;
            } else {
                this.showFieldSuccess(field);
                return true;
            }
            
        } catch (error) {
            this.showFieldLoading(field, false);
            console.error('Error checking student ID uniqueness:', error);
            return true; // Allow submission if check fails
        }
    }

    // Email validation and uniqueness check
    setupEmailValidator() {
        const emailFields = document.querySelectorAll('input[type="email"]');
        
        emailFields.forEach(field => {
            field.addEventListener('blur', async (e) => {
                const value = e.target.value.trim();
                if (value && this.validateField(e.target)) {
                    await this.checkEmailUniqueness(e.target, value);
                }
            });
        });
    }

    // Check email uniqueness
    async checkEmailUniqueness(field, email) {
        try {
            this.showFieldLoading(field, true);
            
            // Simulate API call
            const existingStudents = JSON.parse(localStorage.getItem('students') || '[]');
            const exists = existingStudents.some(student => student.email === email);
            
            await this.delay(300);
            
            this.showFieldLoading(field, false);
            
            if (exists) {
                this.showFieldError(field, 'Email already registered');
                return false;
            } else {
                this.showFieldSuccess(field);
                return true;
            }
            
        } catch (error) {
            this.showFieldLoading(field, false);
            console.error('Error checking email uniqueness:', error);
            return true;
        }
    }

    // File validation setup
    setupFileValidators() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.validateFiles(e.target);
            });
        });
    }

    // Validate uploaded files
    validateFiles(input) {
        const files = Array.from(input.files);
        const errors = [];
        
        files.forEach(file => {
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                errors.push(`${file.name} exceeds 5MB limit`);
            }
            
            // Check file type
            const allowedTypes = input.accept.split(',').map(type => type.trim());
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            
            if (!allowedTypes.includes(fileExtension) && !allowedTypes.includes(file.type)) {
                errors.push(`${file.name} is not an allowed file type`);
            }
        });
        
        if (errors.length > 0) {
            this.showFieldError(input, errors.join(', '));
            return false;
        } else {
            this.showFieldSuccess(input);
            this.updateFileUploadDisplay(input, files);
            return true;
        }
    }

    // Update file upload display
    updateFileUploadDisplay(input, files) {
        const container = input.closest('.file-upload-container');
        const uploadArea = container.querySelector('.file-upload-area');
        
        if (files.length > 0) {
            const fileNames = files.map(file => file.name).join(', ');
            uploadArea.innerHTML = `
                <i class="fas fa-check-circle" style="color: #28a745;"></i>
                <p style="color: #28a745;">Files selected: ${fileNames}</p>
                <small>Click to change files</small>
            `;
        }
    }

    // CGPA validation
    setupCgpaValidator() {
        const cgpaFields = document.querySelectorAll('input[name="cgpa"], input[name="minCgpa"]');
        
        cgpaFields.forEach(field => {
            field.addEventListener('input', (e) => {
                this.validateCgpa(e.target);
            });
        });
    }

    // Validate CGPA value
    validateCgpa(field) {
        const value = parseFloat(field.value);
        
        if (isNaN(value)) {
            this.showFieldError(field, 'Please enter a valid CGPA');
            return false;
        }
        
        if (value < 0 || value > 10) {
            this.showFieldError(field, 'CGPA must be between 0.00 and 10.00');
            return false;
        }
        
        // Additional validation for realistic CGPA
        if (value < 4.0) {
            this.showFieldWarning(field, 'CGPA seems unusually low');
        } else if (value > 9.5) {
            this.showFieldWarning(field, 'Please verify this high CGPA');
        } else {
            this.showFieldSuccess(field);
        }
        
        return true;
    }

    // Company-specific validators
    setupCompanyValidators() {
        // Package validation
        const packageFields = document.querySelectorAll('input[name="packageOffered"]');
        packageFields.forEach(field => {
            field.addEventListener('input', (e) => {
                this.validatePackage(e.target);
            });
        });
        
        // Positions validation
        const positionFields = document.querySelectorAll('input[name="positions"]');
        positionFields.forEach(field => {
            field.addEventListener('input', (e) => {
                this.validatePositions(e.target);
            });
        });
    }

    // Validate package amount
    validatePackage(field) {
        const value = parseFloat(field.value);
        
        if (isNaN(value) || value < 0) {
            this.showFieldError(field, 'Package must be a positive number');
            return false;
        }
        
        if (value > 100) {
            this.showFieldWarning(field, 'Package amount seems unusually high');
        } else if (value < 2) {
            this.showFieldWarning(field, 'Package amount seems unusually low');
        } else {
            this.showFieldSuccess(field);
        }
        
        return true;
    }

    // Validate number of positions
    validatePositions(field) {
        const value = parseInt(field.value);
        
        if (isNaN(value) || value < 1) {
            this.showFieldError(field, 'Number of positions must be at least 1');
            return false;
        }
        
        if (value > 1000) {
            this.showFieldWarning(field, 'Very large number of positions');
        } else {
            this.showFieldSuccess(field);
        }
        
        return true;
    }

    // Main field validation function
    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        const rule = this.rules[fieldName];
        
        if (!rule) return true; // No validation rule defined
        
        // Required field validation
        if (rule.required && !value) {
            this.showFieldError(field, `${this.getFieldLabel(field)} is required`);
            return false;
        }
        
        if (!value) return true; // Skip other validations if field is empty and not required
        
        // Pattern validation
        if (rule.pattern && !rule.pattern.test(value)) {
            this.showFieldError(field, rule.message);
            return false;
        }
        
        // Length validation
        if (rule.minLength && value.length < rule.minLength) {
            this.showFieldError(field, `Minimum ${rule.minLength} characters required`);
            return false;
        }
        
        if (rule.maxLength && value.length > rule.maxLength) {
            this.showFieldError(field, `Maximum ${rule.maxLength} characters allowed`);
            return false;
        }
        
        // Numeric validation
        if (rule.min !== undefined || rule.max !== undefined) {
            const numValue = parseFloat(value);
            
            if (isNaN(numValue)) {
                this.showFieldError(field, 'Please enter a valid number');
                return false;
            }
            
            if (rule.min !== undefined && numValue < rule.min) {
                this.showFieldError(field, `Minimum value is ${rule.min}`);
                return false;
            }
            
            if (rule.max !== undefined && numValue > rule.max) {
                this.showFieldError(field, `Maximum value is ${rule.max}`);
                return false;
            }
        }
        
        // Field passed validation
        this.showFieldSuccess(field);
        return true;
    }

    // Validate entire form
    validateForm(form) {
        let isValid = true;
        const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        // Clear previous form-level messages
        this.clearFormMessages(form);
        
        // Validate each required field
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        // Additional form-level validations
        if (form.id === 'studentForm') {
            isValid = this.validateStudentForm(form) && isValid;
        } else if (form.id === 'companyForm') {
            isValid = this.validateCompanyForm(form) && isValid;
        } else if (form.id === 'placementForm') {
            isValid = this.validatePlacementForm(form) && isValid;
        }
        
        if (isValid) {
            this.submitForm(form);
        } else {
            this.showFormError(form, 'Please correct the errors above');
            this.focusFirstError(form);
        }
        
        return isValid;
    }

    // Student form specific validation
    validateStudentForm(form) {
        let isValid = true;
        
        // Check if resume is uploaded
        const resumeField = form.querySelector('#resume');
        if (resumeField && resumeField.files.length === 0) {
            this.showFieldError(resumeField, 'Resume is required');
            isValid = false;
        }
        
        // Validate CGPA is realistic
        const cgpaField = form.querySelector('#cgpa');
        if (cgpaField) {
            const cgpa = parseFloat(cgpaField.value);
            if (cgpa < 4.0) {
                this.showFieldWarning(cgpaField, 'Low CGPA may affect placement opportunities');
            }
        }
        
        return isValid;
    }

    // Company form specific validation
    validateCompanyForm(form) {
        let isValid = true;
        
        // Validate minimum CGPA is reasonable
        const minCgpaField = form.querySelector('#minCgpa');
        const packageField = form.querySelector('#packageOffered');
        
        if (minCgpaField && packageField) {
            const minCgpa = parseFloat(minCgpaField.value);
            const packageAmount = parseFloat(packageField.value);
            
            // Higher packages should generally require higher CGPA
            if (packageAmount > 15 && minCgpa < 7.0) {
                this.showFieldWarning(minCgpaField, 'High package typically requires higher CGPA');
            }
        }
        
        // Validate eligible departments selection
        const deptField = form.querySelector('#eligibleDepartments');
        if (deptField && deptField.selectedOptions.length === 0) {
            this.showFieldError(deptField, 'Please select at least one eligible department');
            isValid = false;
        }
        
        return isValid;
    }

    // Placement form specific validation
    validatePlacementForm(form) {
        let isValid = true;
        
        // Validate application date is not in future
        const appDateField = form.querySelector('#applicationDate, #applicationDateNew');
        if (appDateField && appDateField.value) {
            const appDate = new Date(appDateField.value);
            const today = new Date();
            
            if (appDate > today) {
                this.showFieldError(appDateField, 'Application date cannot be in the future');
                isValid = false;
            }
        }
        
        // Validate interview date logic
        const interviewDateField = form.querySelector('#interviewDate, #interviewDateNew');
        const statusField = form.querySelector('#status, #statusNew');
        
        if (interviewDateField && statusField) {
            const interviewDate = interviewDateField.value;
            const status = statusField.value;
            
            if (status === 'Interview Scheduled' && !interviewDate) {
                this.showFieldError(interviewDateField, 'Interview date required for scheduled interviews');
                isValid = false;
            }
            
            if (interviewDate) {
                const intDate = new Date(interviewDate);
                const today = new Date();
                
                if (intDate < today && ['Interview Scheduled', 'Applied'].includes(status)) {
                    this.showFieldWarning(interviewDateField, 'Interview date is in the past - consider updating status');
                }
            }
        }
        
        return isValid;
    }

    // Show field error
    showFieldError(field, message) {
        this.clearFieldFeedback(field);
        
        field.classList.add('error');
        field.style.borderColor = '#dc3545';
        
        const errorElement = document.getElementById(`${field.name}-error`) || 
                           document.getElementById(`${field.id}-error`);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        
        // Add shake animation
        field.classList.add('shake');
        setTimeout(() => field.classList.remove('shake'), 500);
    }

    // Show field success
    showFieldSuccess(field) {
        this.clearFieldFeedback(field);
        
        field.classList.add('success');
        field.style.borderColor = '#28a745';
        
        // Add success icon
        this.addFieldIcon(field, 'fas fa-check-circle', '#28a745');
    }

    // Show field warning
    showFieldWarning(field, message) {
        this.clearFieldFeedback(field);
        
        field.classList.add('warning');
        field.style.borderColor = '#ffc107';
        
        const errorElement = document.getElementById(`${field.name}-error`) || 
                           document.getElementById(`${field.id}-error`);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.color = '#856404';
            errorElement.classList.add('show');
        }
        
        // Add warning icon
        this.addFieldIcon(field, 'fas fa-exclamation-triangle', '#ffc107');
    }

    // Show field loading state
    showFieldLoading(field, show) {
        if (show) {
            this.addFieldIcon(field, 'fas fa-spinner fa-spin', '#667eea');
        } else {
            this.removeFieldIcon(field);
        }
    }

    // Clear field feedback
    clearFieldFeedback(field) {
        field.classList.remove('error', 'success', 'warning');
        field.style.borderColor = '';
        
        const errorElement = document.getElementById(`${field.name}-error`) || 
                           document.getElementById(`${field.id}-error`);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
            errorElement.style.color = '';
        }
        
        this.removeFieldIcon(field);
    }

    // Clear field error on focus
    clearFieldError(field) {
        if (field.classList.contains('error')) {
            this.clearFieldFeedback(field);
        }
    }

    // Add validation icon to field
    addFieldIcon(field, iconClass, color) {
        this.removeFieldIcon(field);
        
        const icon = document.createElement('i');
        icon.className = `validation-icon ${iconClass}`;
        icon.style.cssText = `
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: ${color};
            pointer-events: none;
            z-index: 10;
        `;
        
        const parent = field.parentElement;
        parent.style.position = 'relative';
        parent.appendChild(icon);
    }

    // Remove validation icon
    removeFieldIcon(field) {
        const parent = field.parentElement;
        const existingIcon = parent.querySelector('.validation-icon');
        if (existingIcon) {
            existingIcon.remove();
        }
    }

    // Get field label text
    getFieldLabel(field) {
        const label = field.closest('.form-group').querySelector('label');
        return label ? label.textContent.replace('*', '').trim() : field.name;
    }

    // Show form-level error
    showFormError(form, message) {
        let errorDiv = form.querySelector('.form-error');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'message error form-error';
            form.insertBefore(errorDiv, form.firstChild);
        }
        
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }

    // Clear form messages
    clearFormMessages(form) {
        const messages = form.querySelectorAll('.form-error, .form-success');
        messages.forEach(msg => msg.remove());
    }

    // Focus first error field
    focusFirstError(form) {
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.focus();
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Submit form after validation
    async submitForm(form) {
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Show success message
            this.showFormSuccess(form, 'Form submitted successfully!');
            
            // Handle different form types
            if (form.id === 'studentForm') {
                await this.handleStudentSubmission(data, form);
            } else if (form.id === 'companyForm') {
                await this.handleCompanySubmission(data, form);
            } else if (form.id === 'placementForm') {
                await this.handlePlacementSubmission(data, form);
            }
            
        } catch (error) {
            console.error('Error submitting form:', error);
            this.showFormError(form, 'Failed to submit form. Please try again.');
        }
    }

    // Handle student form submission
    async handleStudentSubmission(data, form) {
        try {
            // Add to Google Sheets
            await googleSheetsAPI.addStudent(data);
            
            // Save to local storage as backup
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            students.push(data);
            localStorage.setItem('students', JSON.stringify(students));
            
            // Auto-distribute to eligible companies
            await googleSheetsAPI.autoDistributeToEligibleCompanies(data);
            
            // Reset form
            this.resetForm(form);
            
            // Hide form
            const formSection = document.getElementById('student-form');
            if (formSection) {
                formSection.style.display = 'none';
            }
            
            // Refresh student table
            this.refreshStudentTable();
            
        } catch (error) {
            console.error('Error handling student submission:', error);
            this.showFormError(form, 'Failed to save student data');
        }
    }

    // Handle company form submission
    async handleCompanySubmission(data, form) {
        try {
            // Add to Google Sheets
            await googleSheetsAPI.addCompany(data);
            
            // Save to local storage as backup
            const companies = JSON.parse(localStorage.getItem('companies') || '[]');
            companies.push(data);
            localStorage.setItem('companies', JSON.stringify(companies));
            
            // Reset form
            this.resetForm(form);
            
            // Hide form
            const formSection = document.getElementById('company-form');
            if (formSection) {
                formSection.style.display = 'none';
            }
            
            // Refresh company table
            this.refreshCompanyTable();
            
        } catch (error) {
            console.error('Error handling company submission:', error);
            this.showFormError(form, 'Failed to save company data');
        }
    }

    // Handle placement form submission
    async handlePlacementSubmission(data, form) {
        try {
            // Generate placement ID
            data.placementId = this.generatePlacementId();
            
            // Save placement data
            const placements = JSON.parse(localStorage.getItem('placements') || '[]');
            placements.push(data);
            localStorage.setItem('placements', JSON.stringify(placements));
            
            // Log activity
            googleSheetsAPI.logActivity('placement_updated', data.placementId, 
                `${data.studentId} applied to ${data.companyId}`);
            
            // Reset form
            this.resetForm(form);
            
            // Hide form
            const formSection = document.getElementById('placement-form');
            if (formSection) {
                formSection.style.display = 'none';
            }
            
            // Refresh placement table
            this.refreshPlacementTable();
            
        } catch (error) {
            console.error('Error handling placement submission:', error);
            this.showFormError(form, 'Failed to save placement data');
        }
    }

    // Show form success message
    showFormSuccess(form, message) {
        let successDiv = form.querySelector('.form-success');
        
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.className = 'message success form-success';
            form.insertBefore(successDiv, form.firstChild);
        }
        
        successDiv.textContent = message;
        successDiv.classList.add('show');
        
        setTimeout(() => {
            successDiv.classList.remove('show');
        }, 3000);
    }

    // Reset form
    resetForm(form) {
        form.reset();
        
        // Clear all validation states
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            this.clearFieldFeedback(field);
        });
        
        // Reset file upload areas
        const fileAreas = form.querySelectorAll('.file-upload-area');
        fileAreas.forEach(area => {
            const input = area.parentElement.querySelector('input[type="file"]');
            if (input && input.id === 'resume') {
                area.innerHTML = `
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Click to upload resume or drag and drop</p>
                    <small>PDF files only, max 5MB</small>
                `;
            } else if (input && input.id === 'documents') {
                area.innerHTML = `
                    <i class="fas fa-paperclip"></i>
                    <p>Upload additional documents</p>
                    <small>PDF, DOC, DOCX files only</small>
                `;
            }
        });
        
        // Clear form messages
        this.clearFormMessages(form);
    }

    // Generate unique placement ID
    generatePlacementId() {
        const placements = JSON.parse(localStorage.getItem('placements') || '[]');
        const nextId = placements.length + 1;
        return `PL-${String(nextId).padStart(3, '0')}`;
    }

    // Refresh data tables
    refreshStudentTable() {
        if (typeof loadStudents === 'function') {
            loadStudents();
        }
    }

    refreshCompanyTable() {
        if (typeof loadCompanies === 'function') {
            loadCompanies();
        }
    }

    refreshPlacementTable() {
        if (typeof loadPlacements === 'function') {
            loadPlacements();
        }
    }

    // Initialize form state
    initializeFormState() {
        // Auto-generate IDs for new records
        this.autoGenerateIds();
        
        // Set current date for date fields
        this.setDefaultDates();
        
        // Initialize dependent field logic
        this.setupDependentFields();
    }

    // Auto-generate IDs
    autoGenerateIds() {
        document.addEventListener('DOMContentLoaded', () => {
            // Generate student ID
            const studentIdField = document.getElementById('studentId');
            if (studentIdField && !studentIdField.value) {
                const deptSelect = document.getElementById('department');
                const yearSelect = document.getElementById('year');
                
                if (deptSelect && yearSelect) {
                    const updateStudentId = () => {
                        const dept = deptSelect.value;
                        const year = yearSelect.value;
                        
                        if (dept && year) {
                            const deptCode = this.getDepartmentCode(dept);
                            const students = JSON.parse(localStorage.getItem('students') || '[]');
                            const existingCount = students.filter(s => 
                                s.studentId.startsWith(`${deptCode}-${year}`)
                            ).length;
                            
                            const newId = `${deptCode}-${year}-${String(existingCount + 1).padStart(3, '0')}`;
                            studentIdField.value = newId;
                            this.validateField(studentIdField);
                        }
                    };
                    
                    deptSelect.addEventListener('change', updateStudentId);
                    yearSelect.addEventListener('change', updateStudentId);
                }
            }
            
            // Generate company ID
            const companyIdField = document.getElementById('companyId');
            if (companyIdField && !companyIdField.value) {
                const companies = JSON.parse(localStorage.getItem('companies') || '[]');
                const nextId = companies.length + 1;
                companyIdField.value = `COMP-${String(nextId).padStart(3, '0')}`;
            }
            
            // Generate placement ID
            const placementIdField = document.getElementById('placementId');
            if (placementIdField && !placementIdField.value) {
                placementIdField.value = this.generatePlacementId();
            }
        });
    }

    // Get department code
    getDepartmentCode(department) {
        const codes = {
            'Computer Science': 'CS',
            'Information Technology': 'IT',
            'Electronics': 'EC',
            'Mechanical': 'ME',
            'Civil': 'CE'
        };
        return codes[department] || 'XX';
    }

    // Set default dates
    setDefaultDates() {
        document.addEventListener('DOMContentLoaded', () => {
            const dateFields = document.querySelectorAll('input[type="date"]');
            const today = new Date().toISOString().split('T')[0];
            
            dateFields.forEach(field => {
                if (field.name === 'applicationDate' || field.name === 'applicationDateNew') {
                    field.value = today;
                }
            });
        });
    }

    // Setup dependent field logic
    setupDependentFields() {
        document.addEventListener('DOMContentLoaded', () => {
            // Status-dependent field visibility
            const statusFields = document.querySelectorAll('select[name="status"]');
            
            statusFields.forEach(statusField => {
                statusField.addEventListener('change', (e) => {
                    this.updateDependentFields(e.target);
                });
            });
        });
    }

    // Update dependent fields based on status
    updateDependentFields(statusField) {
        const status = statusField.value;
        const form = statusField.closest('form');
        
        if (form) {
            const interviewDateField = form.querySelector('input[name="interviewDate"]');
            const packageField = form.querySelector('input[name="packageOffered"]');
            
            // Show/hide fields based on status
            if (interviewDateField) {
                const shouldShow = ['Interview Scheduled', 'Interview Completed'].includes(status);
                interviewDateField.required = shouldShow;
                interviewDateField.closest('.form-group').style.display = shouldShow ? 'flex' : 'none';
            }
            
            if (packageField) {
                const shouldShow = ['Selected', 'Offer Letter', 'Joined'].includes(status);
                packageField.required = shouldShow;
                packageField.closest('.form-group').style.display = shouldShow ? 'flex' : 'none';
            }
        }
    }

    // Utility functions
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// CSS for validation animations
const validationCSS = `
.shake {
    animation: shake 0.5s ease-in-out;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

.form-group {
    position: relative;
}

.validation-icon {
    transition: all 0.3s ease;
}

input.error, select.error, textarea.error {
    border-color: #dc3545 !important;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

input.success, select.success, textarea.success {
    border-color: #28a745 !important;
    box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

input.warning, select.warning, textarea.warning {
    border-color: #ffc107 !important;
    box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.25);
}
`;

// Inject validation CSS
const style = document.createElement('style');
style.textContent = validationCSS;
document.head.appendChild(style);

// Initialize validation system
const validationSystem = new ValidationSystem();

// Export for global access
window.validationSystem = validationSystem;
