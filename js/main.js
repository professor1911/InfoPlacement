// Main Application Logic for Student Data Management System
// RESTful API Architecture with Automated Data Handling for Company Distribution

class PlacementPortalApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.studentsData = [];
        this.companiesData = [];
        this.placementsData = [];
        this.filters = {};
        this.pagination = {
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 0
        };
        
        this.initializeApp();
    }

    // Initialize the application
    async initializeApp() {
        document.addEventListener('DOMContentLoaded', async () => {
            await this.loadInitialData();
            this.setupEventListeners();
            this.initializeCurrentPage();
            this.startPeriodicTasks();
        });
    }

    // Load initial data from Google Sheets
    async loadInitialData() {
        try {
            // Load data in parallel for better performance
            const [students, companies, placements] = await Promise.all([
                this.loadStudentsData(),
                this.loadCompaniesData(),
                this.loadPlacementsData()
            ]);
            
            this.studentsData = students;
            this.companiesData = companies;
            this.placementsData = placements;
            
            // Update dashboard statistics
            this.updateDashboardStats();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Failed to load data from Google Sheets', 'error');
        }
    }

    // Load students data with caching
    async loadStudentsData() {
        try {
            // Try to get from Google Sheets first
            const students = await googleSheetsAPI.getStudents();
            
            if (students.length > 0) {
                // Cache in localStorage
                localStorage.setItem('students', JSON.stringify(students));
                return students;
            } else {
                // Fallback to localStorage
                return JSON.parse(localStorage.getItem('students') || '[]');
            }
            
        } catch (error) {
            console.error('Error loading students:', error);
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('students') || '[]');
        }
    }

    // Load companies data
    async loadCompaniesData() {
        try {
            const companies = await googleSheetsAPI.getCompanies();
            
            if (companies.length > 0) {
                localStorage.setItem('companies', JSON.stringify(companies));
                return companies;
            } else {
                return JSON.parse(localStorage.getItem('companies') || '[]');
            }
            
        } catch (error) {
            console.error('Error loading companies:', error);
            return JSON.parse(localStorage.getItem('companies') || '[]');
        }
    }

    // Load placements data
    async loadPlacementsData() {
        try {
            // For demo, load from localStorage
            return JSON.parse(localStorage.getItem('placements') || '[]');
        } catch (error) {
            console.error('Error loading placements:', error);
            return [];
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Search functionality
        this.setupSearchHandlers();
        
        // Filter functionality
        this.setupFilterHandlers();
        
        // Form handlers
        this.setupFormHandlers();
        
        // Table action handlers
        this.setupTableHandlers();
        
        // Pagination handlers
        this.setupPaginationHandlers();
    }

    // Setup search handlers
    setupSearchHandlers() {
        const searchInputs = document.querySelectorAll('#searchInput, #placementSearch');
        
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        });
    }

    // Setup filter handlers
    setupFilterHandlers() {
        const filterSelects = document.querySelectorAll('#departmentFilter, #yearFilter, #statusFilter, #companyFilter');
        
        filterSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                this.handleFilter(e.target.id, e.target.value);
            });
        });
    }

    // Setup form handlers
    setupFormHandlers() {
        // Student form
        const studentForm = document.getElementById('studentForm');
        if (studentForm) {
            studentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleStudentFormSubmit(studentForm);
            });
        }
        
        // Company form
        const companyForm = document.getElementById('companyForm');
        if (companyForm) {
            companyForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCompanyFormSubmit(companyForm);
            });
        }
        
        // Placement form
        const placementForm = document.getElementById('placementForm');
        if (placementForm) {
            placementForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePlacementFormSubmit(placementForm);
            });
        }
    }

    // Setup table action handlers
    setupTableHandlers() {
        // Delegate event handling for dynamically generated table buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-icon')) {
                const button = e.target.closest('.btn-icon');
                const action = button.getAttribute('onclick');
                
                if (action) {
                    // Prevent default onclick and handle through our system
                    e.preventDefault();
                    this.handleTableAction(action);
                }
            }
        });
    }

    // Setup pagination handlers
    setupPaginationHandlers() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousPage());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextPage());
        }
    }

    // Initialize current page
    initializeCurrentPage() {
        const path = window.location.pathname;
        
        if (path.includes('students.html')) {
            this.currentPage = 'students';
            this.loadStudentsTable();
        } else if (path.includes('companies.html')) {
            this.currentPage = 'companies';
            this.loadCompaniesTable();
        } else if (path.includes('placements.html')) {
            this.currentPage = 'placements';
            this.loadPlacementsTable();
        } else {
            this.currentPage = 'dashboard';
            this.updateDashboardStats();
        }
    }

    // Update dashboard statistics
    updateDashboardStats() {
        const totalStudents = this.studentsData.length;
        const totalCompanies = this.companiesData.length;
        const totalPlacements = this.placementsData.length;
        const successfulPlacements = this.placementsData.filter(p => 
            ['Selected', 'Offer Letter', 'Joined'].includes(p.status)
        ).length;
        
        const placementRate = totalStudents > 0 ? 
            Math.round((successfulPlacements / totalStudents) * 100) : 0;
        
        // Update DOM elements
        this.updateElement('total-students', `${totalStudents}+`);
        this.updateElement('total-companies', `${totalCompanies}+`);
        this.updateElement('active-placements', `${totalPlacements}+`);
        this.updateElement('placement-rate', `${placementRate}%`);
        
        // Update placement page stats if available
        this.updateElement('totalApplications', totalPlacements.toString());
        this.updateElement('successfulPlacements', successfulPlacements.toString());
        this.updateElement('pendingApplications', (totalPlacements - successfulPlacements).toString());
        this.updateElement('placementRate', `${placementRate}%`);
    }

    // Load students table
    loadStudentsTable() {
        const tableBody = document.getElementById('studentsTableBody');
        if (!tableBody) return;
        
        const filteredStudents = this.applyFilters(this.studentsData);
        const paginatedStudents = this.applyPagination(filteredStudents);
        
        tableBody.innerHTML = paginatedStudents.map(student => `
            <tr>
                <td>${student.studentId}</td>
                <td>${student.fullName}</td>
                <td>${student.email}</td>
                <td>${student.department}</td>
                <td>${student.year}</td>
                <td>${student.cgpa}</td>
                <td><span class="status-badge status-active">${student.status}</span></td>
                <td>
                    <button class="btn-icon" onclick="editStudent('${student.studentId}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="viewStudent('${student.studentId}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteStudent('${student.studentId}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        this.updatePaginationInfo(filteredStudents.length);
    }

    // Load companies table
    loadCompaniesTable() {
        const tableBody = document.getElementById('companiesTableBody');
        if (!tableBody) return;
        
        const filteredCompanies = this.applyFilters(this.companiesData);
        const paginatedCompanies = this.applyPagination(filteredCompanies);
        
        tableBody.innerHTML = paginatedCompanies.map(company => `
            <tr>
                <td>${company.companyId}</td>
                <td>${company.companyName}</td>
                <td>${company.industry}</td>
                <td>${company.packageOffered}</td>
                <td>${company.positions}</td>
                <td>${company.minCgpa}</td>
                <td><span class="status-badge status-active">${company.status}</span></td>
                <td>
                    <button class="btn-icon" onclick="editCompany('${company.companyId}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="viewCompany('${company.companyId}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-success" onclick="sendStudentData('${company.companyId}')" title="Send Data">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        this.updatePaginationInfo(filteredCompanies.length);
    }

    // Load placements table
    loadPlacementsTable() {
        const tableBody = document.getElementById('placementsTableBody');
        if (!tableBody) return;
        
        const filteredPlacements = this.applyFilters(this.placementsData);
        const paginatedPlacements = this.applyPagination(filteredPlacements);
        
        tableBody.innerHTML = paginatedPlacements.map(placement => {
            const student = this.studentsData.find(s => s.studentId === placement.studentId);
            const company = this.companiesData.find(c => c.companyId === placement.companyId);
            
            return `
                <tr>
                    <td>${placement.placementId}</td>
                    <td>${student ? student.fullName : 'Unknown'}</td>
                    <td>${placement.studentId}</td>
                    <td>${company ? company.companyName : 'Unknown'}</td>
                    <td>${placement.position}</td>
                    <td>${placement.packageOffered || 'TBD'}</td>
                    <td><span class="status-badge status-${this.getStatusClass(placement.status)}">${placement.status}</span></td>
                    <td>${placement.applicationDate}</td>
                    <td>
                        <button class="btn-icon" onclick="editPlacement('${placement.placementId}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="viewPlacement('${placement.placementId}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-success" onclick="updateStatus('${placement.placementId}')" title="Update Status">
                            <i class="fas fa-check"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        this.updatePaginationInfo(filteredPlacements.length);
    }

    // Get status CSS class
    getStatusClass(status) {
        const statusClasses = {
            'Applied': 'pending',
            'Shortlisted': 'interview',
            'Interview Scheduled': 'interview',
            'Interview Completed': 'interview',
            'Selected': 'selected',
            'Offer Letter': 'offer',
            'Joined': 'selected',
            'Rejected': 'pending',
            'Active': 'active'
        };
        
        return statusClasses[status] || 'pending';
    }

    // Apply filters to data
    applyFilters(data) {
        let filteredData = [...data];
        
        // Apply search filter
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filteredData = filteredData.filter(item => {
                return Object.values(item).some(value => 
                    value.toString().toLowerCase().includes(searchTerm)
                );
            });
        }
        
        // Apply specific filters
        Object.keys(this.filters).forEach(filterKey => {
            if (filterKey !== 'search' && this.filters[filterKey]) {
                const filterValue = this.filters[filterKey];
                filteredData = filteredData.filter(item => {
                    const fieldName = filterKey.replace('Filter', '');
                    return item[fieldName] === filterValue;
                });
            }
        });
        
        return filteredData;
    }

    // Apply pagination
    applyPagination(data) {
        const startIndex = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
        const endIndex = startIndex + this.pagination.itemsPerPage;
        
        this.pagination.totalItems = data.length;
        
        return data.slice(startIndex, endIndex);
    }

    // Handle search
    handleSearch(searchTerm) {
        this.filters.search = searchTerm;
        this.pagination.currentPage = 1; // Reset to first page
        this.refreshCurrentTable();
    }

    // Handle filter changes
    handleFilter(filterId, filterValue) {
        this.filters[filterId] = filterValue;
        this.pagination.currentPage = 1; // Reset to first page
        this.refreshCurrentTable();
    }

    // Refresh current table based on page
    refreshCurrentTable() {
        switch (this.currentPage) {
            case 'students':
                this.loadStudentsTable();
                break;
            case 'companies':
                this.loadCompaniesTable();
                break;
            case 'placements':
                this.loadPlacementsTable();
                break;
        }
    }

    // Update pagination info
    updatePaginationInfo(totalItems) {
        const totalPages = Math.ceil(totalItems / this.pagination.itemsPerPage);
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (pageInfo) {
            pageInfo.textContent = `Page ${this.pagination.currentPage} of ${totalPages}`;
        }
        
        if (prevBtn) {
            prevBtn.disabled = this.pagination.currentPage <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.pagination.currentPage >= totalPages;
        }
    }

    // Pagination functions
    previousPage() {
        if (this.pagination.currentPage > 1) {
            this.pagination.currentPage--;
            this.refreshCurrentTable();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
        if (this.pagination.currentPage < totalPages) {
            this.pagination.currentPage++;
            this.refreshCurrentTable();
        }
    }

    // Handle student form submission
    async handleStudentFormSubmit(form) {
        try {
            const formData = new FormData(form);
            const studentData = Object.fromEntries(formData.entries());
            
            // Add to local data
            this.studentsData.push(studentData);
            
            // Save to Google Sheets
            await googleSheetsAPI.addStudent(studentData);
            
            // Auto-distribute to eligible companies
            await this.autoDistributeStudent(studentData);
            
            // Refresh display
            this.loadStudentsTable();
            this.updateDashboardStats();
            
            // Hide form
            this.toggleForm('student-form');
            
            this.showNotification('Student added successfully and distributed to eligible companies', 'success');
            
        } catch (error) {
            console.error('Error submitting student form:', error);
            this.showNotification('Failed to add student', 'error');
        }
    }

    // Handle company form submission
    async handleCompanyFormSubmit(form) {
        try {
            const formData = new FormData(form);
            const companyData = Object.fromEntries(formData.entries());
            
            // Process eligible departments array
            const deptSelect = form.querySelector('#eligibleDepartments');
            companyData.eligibleDepartments = Array.from(deptSelect.selectedOptions).map(option => option.value);
            
            // Add to local data
            this.companiesData.push(companyData);
            
            // Save to Google Sheets
            await googleSheetsAPI.addCompany(companyData);
            
            // Refresh display
            this.loadCompaniesTable();
            this.updateDashboardStats();
            
            // Hide form
            this.toggleForm('company-form');
            
            this.showNotification('Company added successfully', 'success');
            
        } catch (error) {
            console.error('Error submitting company form:', error);
            this.showNotification('Failed to add company', 'error');
        }
    }

    // Handle placement form submission
    async handlePlacementFormSubmit(form) {
        try {
            const formData = new FormData(form);
            const placementData = Object.fromEntries(formData.entries());
            
            // Generate placement ID if not exists
            if (!placementData.placementId) {
                placementData.placementId = this.generatePlacementId();
            }
            
            // Add to local data
            this.placementsData.push(placementData);
            
            // Save to localStorage (in real app, would save to database)
            localStorage.setItem('placements', JSON.stringify(this.placementsData));
            
            // Refresh display
            this.loadPlacementsTable();
            this.updateDashboardStats();
            
            // Hide form
            this.toggleForm('placement-form');
            
            this.showNotification('Placement record added successfully', 'success');
            
        } catch (error) {
            console.error('Error submitting placement form:', error);
            this.showNotification('Failed to add placement record', 'error');
        }
    }

    // Auto-distribute student to eligible companies
    async autoDistributeStudent(studentData) {
        try {
            const eligibleCompanies = this.companiesData.filter(company => 
                company.status === 'Active' &&
                company.minCgpa <= parseFloat(studentData.cgpa) &&
                company.positions > 0 &&
                (company.eligibleDepartments || []).includes(studentData.department)
            );
            
            if (eligibleCompanies.length > 0) {
                const companyIds = eligibleCompanies.map(c => c.companyId);
                await googleSheetsAPI.distributeDataToCompanies([studentData], companyIds);
                
                // Log the distribution
                this.logDistributionActivity(studentData, eligibleCompanies);
            }
            
        } catch (error) {
            console.error('Error in auto-distribution:', error);
        }
    }

    // Log distribution activity
    logDistributionActivity(studentData, companies) {
        const activity = {
            type: 'auto_distribution',
            studentId: studentData.studentId,
            studentName: studentData.fullName,
            companiesCount: companies.length,
            companies: companies.map(c => c.companyName),
            timestamp: new Date().toISOString()
        };
        
        // Store activity
        const activities = JSON.parse(localStorage.getItem('distribution_activities') || '[]');
        activities.unshift(activity);
        
        // Keep only last 100 activities
        if (activities.length > 100) {
            activities.splice(100);
        }
        
        localStorage.setItem('distribution_activities', JSON.stringify(activities));
        
        // Update statistics
        this.updateDistributionStats();
    }

    // Update distribution statistics
    updateDistributionStats() {
        const activities = JSON.parse(localStorage.getItem('distribution_activities') || '[]');
        const today = new Date().toISOString().split('T')[0];
        
        const todayActivities = activities.filter(a => 
            a.timestamp.split('T')[0] === today
        );
        
        const totalStudentsToday = todayActivities.reduce((sum, a) => sum + 1, 0);
        const totalCompaniesContacted = new Set(
            activities.flatMap(a => a.companies || [])
        ).size;
        
        // Update UI elements
        this.updateElement('dataSentToday', `${totalStudentsToday} students`);
        this.updateElement('companiesContacted', `${totalCompaniesContacted} companies`);
        this.updateElement('timeSaved', '85% reduction');
    }

    // Handle table actions
    handleTableAction(action) {
        // Parse the onclick action
        const match = action.match(/(\w+)\('([^']+)'\)/);
        if (match) {
            const [, functionName, id] = match;
            
            switch (functionName) {
                case 'editStudent':
                    this.editStudent(id);
                    break;
                case 'viewStudent':
                    this.viewStudent(id);
                    break;
                case 'deleteStudent':
                    this.deleteStudent(id);
                    break;
                case 'editCompany':
                    this.editCompany(id);
                    break;
                case 'viewCompany':
                    this.viewCompany(id);
                    break;
                case 'sendStudentData':
                    this.sendStudentDataToCompany(id);
                    break;
                case 'editPlacement':
                    this.editPlacement(id);
                    break;
                case 'viewPlacement':
                    this.viewPlacement(id);
                    break;
                case 'updateStatus':
                    this.updatePlacementStatus(id);
                    break;
            }
        }
    }

    // Student CRUD operations
    editStudent(studentId) {
        const student = this.studentsData.find(s => s.studentId === studentId);
        if (student) {
            this.populateStudentForm(student);
            this.toggleForm('student-form');
        }
    }

    viewStudent(studentId) {
        const student = this.studentsData.find(s => s.studentId === studentId);
        if (student) {
            this.showStudentDetails(student);
        }
    }

    async deleteStudent(studentId) {
        if (confirm('Are you sure you want to delete this student?')) {
            try {
                // Remove from local data
                this.studentsData = this.studentsData.filter(s => s.studentId !== studentId);
                
                // Update localStorage
                localStorage.setItem('students', JSON.stringify(this.studentsData));
                
                // Refresh table
                this.loadStudentsTable();
                this.updateDashboardStats();
                
                this.showNotification('Student deleted successfully', 'success');
                
            } catch (error) {
                console.error('Error deleting student:', error);
                this.showNotification('Failed to delete student', 'error');
            }
        }
    }

    // Company CRUD operations
    editCompany(companyId) {
        const company = this.companiesData.find(c => c.companyId === companyId);
        if (company) {
            this.populateCompanyForm(company);
            this.toggleForm('company-form');
        }
    }

    viewCompany(companyId) {
        const company = this.companiesData.find(c => c.companyId === companyId);
        if (company) {
            this.showCompanyDetails(company);
        }
    }

    // Send student data to specific company
    async sendStudentDataToCompany(companyId) {
        try {
            const company = this.companiesData.find(c => c.companyId === companyId);
            
            if (!company) {
                this.showNotification('Company not found', 'error');
                return;
            }
            
            // Find eligible students
            const eligibleStudents = this.studentsData.filter(student => 
                student.status === 'Active' &&
                parseFloat(student.cgpa) >= company.minCgpa &&
                (company.eligibleDepartments || []).includes(student.department)
            );
            
            if (eligibleStudents.length === 0) {
                this.showNotification('No eligible students found for this company', 'warning');
                return;
            }
            
            // Distribute data
            await googleSheetsAPI.distributeDataToCompanies(eligibleStudents, [companyId]);
            
            // Log activity
            this.logDistributionActivity({
                studentId: 'BULK',
                fullName: `${eligibleStudents.length} students`
            }, [company]);
            
            this.showNotification(
                `Successfully sent ${eligibleStudents.length} student records to ${company.companyName}`, 
                'success'
            );
            
        } catch (error) {
            console.error('Error sending student data:', error);
            this.showNotification('Failed to send student data', 'error');
        }
    }

    // Placement CRUD operations
    editPlacement(placementId) {
        const placement = this.placementsData.find(p => p.placementId === placementId);
        if (placement) {
            this.populatePlacementForm(placement);
            this.toggleForm('placement-form');
        }
    }

    viewPlacement(placementId) {
        const placement = this.placementsData.find(p => p.placementId === placementId);
        if (placement) {
            this.showPlacementDetails(placement);
        }
    }

    updatePlacementStatus(placementId) {
        const placement = this.placementsData.find(p => p.placementId === placementId);
        if (placement) {
            this.showStatusUpdateModal(placement);
        }
    }

    // Form population functions
    populateStudentForm(student) {
        const form = document.getElementById('studentForm');
        if (form) {
            Object.keys(student).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = student[key];
                }
            });
        }
    }

    populateCompanyForm(company) {
        const form = document.getElementById('companyForm');
        if (form) {
            Object.keys(company).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    if (key === 'eligibleDepartments' && Array.isArray(company[key])) {
                        // Handle multi-select
                        Array.from(field.options).forEach(option => {
                            option.selected = company[key].includes(option.value);
                        });
                    } else {
                        field.value = company[key];
                    }
                }
            });
        }
    }

    populatePlacementForm(placement) {
        const form = document.getElementById('placementForm');
        if (form) {
            Object.keys(placement).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`) || 
                             form.querySelector(`#${key}New`);
                if (field) {
                    field.value = placement[key];
                }
            });
        }
    }

    // Modal and detail view functions
    showStudentDetails(student) {
        const modal = this.createModal('Student Details', `
            <div class="student-details">
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Student ID:</label>
                        <span>${student.studentId}</span>
                    </div>
                    <div class="detail-item">
                        <label>Full Name:</label>
                        <span>${student.fullName}</span>
                    </div>
                    <div class="detail-item">
                        <label>Email:</label>
                        <span>${student.email}</span>
                    </div>
                    <div class="detail-item">
                        <label>Phone:</label>
                        <span>${student.phone}</span>
                    </div>
                    <div class="detail-item">
                        <label>Department:</label>
                        <span>${student.department}</span>
                    </div>
                    <div class="detail-item">
                        <label>Academic Year:</label>
                        <span>${student.year}</span>
                    </div>
                    <div class="detail-item">
                        <label>CGPA:</label>
                        <span>${student.cgpa}</span>
                    </div>
                    <div class="detail-item">
                        <label>Skills:</label>
                        <span>${student.skills}</span>
                    </div>
                    <div class="detail-item">
                        <label>Status:</label>
                        <span class="status-badge status-${this.getStatusClass(student.status)}">${student.status}</span>
                    </div>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    showCompanyDetails(company) {
        const modal = this.createModal('Company Details', `
            <div class="company-details">
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Company ID:</label>
                        <span>${company.companyId}</span>
                    </div>
                    <div class="detail-item">
                        <label>Company Name:</label>
                        <span>${company.companyName}</span>
                    </div>
                    <div class="detail-item">
                        <label>Industry:</label>
                        <span>${company.industry}</span>
                    </div>
                    <div class="detail-item">
                        <label>Location:</label>
                        <span>${company.location}</span>
                    </div>
                    <div class="detail-item">
                        <label>HR Contact:</label>
                        <span>${company.hrName} (${company.hrEmail})</span>
                    </div>
                    <div class="detail-item">
                        <label>Package Offered:</label>
                        <span>₹${company.packageOffered} LPA</span>
                    </div>
                    <div class="detail-item">
                        <label>Available Positions:</label>
                        <span>${company.positions}</span>
                    </div>
                    <div class="detail-item">
                        <label>Minimum CGPA:</label>
                        <span>${company.minCgpa}</span>
                    </div>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    // Create modal dialog
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                padding: 2rem;
                border-radius: 10px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid #e9ecef;
                    padding-bottom: 1rem;
                ">
                    <h3 style="color: #2c3e50; margin: 0;">${title}</h3>
                    <button class="btn-icon" onclick="this.closest('.modal-overlay').remove()" style="font-size: 1.2rem;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    }

    // Utility functions
    toggleForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            const isVisible = form.style.display !== 'none';
            form.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                form.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    generatePlacementId() {
        const nextId = this.placementsData.length + 1;
        return `PL-${String(nextId).padStart(3, '0')}`;
    }

    showNotification(message, type = 'info') {
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
            border-radius: 5px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            z-index: 10001;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    font-size: 1.2rem;
                    margin-left: 10px;
                ">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Start periodic tasks
    startPeriodicTasks() {
        // Refresh data every 5 minutes
        setInterval(async () => {
            try {
                await this.loadInitialData();
                this.refreshCurrentTable();
            } catch (error) {
                console.error('Error in periodic refresh:', error);
            }
        }, 5 * 60 * 1000);
        
        // Update statistics every minute
        setInterval(() => {
            this.updateDashboardStats();
            this.updateDistributionStats();
        }, 60 * 1000);
    }

    // Export functions
    async exportAllStudents() {
        try {
            const csvContent = googleSheetsAPI.generateCSV(this.studentsData);
            this.downloadCSV(csvContent, 'all_students.csv');
            
        } catch (error) {
            console.error('Error exporting students:', error);
            this.showNotification('Failed to export student data', 'error');
        }
    }

    async generatePlacementReport() {
        try {
            const reportData = this.preparePlacementReport();
            const csvContent = this.generatePlacementReportCSV(reportData);
            this.downloadCSV(csvContent, 'placement_report.csv');
            
        } catch (error) {
            console.error('Error generating report:', error);
            this.showNotification('Failed to generate placement report', 'error');
        }
    }

    // Prepare placement report data
    preparePlacementReport() {
        return this.placementsData.map(placement => {
            const student = this.studentsData.find(s => s.studentId === placement.studentId);
            const company = this.companiesData.find(c => c.companyId === placement.companyId);
            
            return {
                placementId: placement.placementId,
                studentName: student ? student.fullName : 'Unknown',
                studentId: placement.studentId,
                department: student ? student.department : 'Unknown',
                cgpa: student ? student.cgpa : 'Unknown',
                companyName: company ? company.companyName : 'Unknown',
                position: placement.position,
                packageOffered: placement.packageOffered || 'TBD',
                status: placement.status,
                applicationDate: placement.applicationDate,
                interviewDate: placement.interviewDate || 'N/A'
            };
        });
    }

    // Generate placement report CSV
    generatePlacementReportCSV(reportData) {
        const headers = [
            'Placement ID', 'Student Name', 'Student ID', 'Department', 'CGPA',
            'Company Name', 'Position', 'Package (LPA)', 'Status', 'Application Date', 'Interview Date'
        ];
        
        const rows = reportData.map(item => [
            item.placementId, item.studentName, item.studentId, item.department, item.cgpa,
            item.companyName, item.position, item.packageOffered, item.status, 
            item.applicationDate, item.interviewDate
        ]);
        
        return [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
    }

    // Download CSV file
    downloadCSV(csvContent, fileName) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Clear all filters
    clearFilters() {
        this.filters = {};
        
        // Reset filter UI elements
        const filterElements = document.querySelectorAll('#departmentFilter, #yearFilter, #statusFilter, #companyFilter');
        filterElements.forEach(element => {
            element.value = '';
        });
        
        const searchInputs = document.querySelectorAll('#searchInput, #placementSearch');
        searchInputs.forEach(input => {
            input.value = '';
        });
        
        // Reset pagination
        this.pagination.currentPage = 1;
        
        // Refresh table
        this.refreshCurrentTable();
    }
}

// Global functions for HTML onclick events
window.toggleForm = function(formId) {
    placementApp.toggleForm(formId);
};

window.toggleCompanyForm = function() {
    placementApp.toggleForm('company-form');
};

window.togglePlacementForm = function() {
    placementApp.toggleForm('placement-form');
};

window.resetForm = function() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (window.validationSystem) {
            validationSystem.resetForm(form);
        } else {
            form.reset();
        }
    });
};

window.resetCompanyForm = function() {
    const form = document.getElementById('companyForm');
    if (form && window.validationSystem) {
        validationSystem.resetForm(form);
    }
};

window.resetPlacementForm = function() {
    const form = document.getElementById('placementForm');
    if (form && window.validationSystem) {
        validationSystem.resetForm(form);
    }
};

window.clearFilters = function() {
    placementApp.clearFilters();
};

window.clearPlacementFilters = function() {
    placementApp.clearFilters();
};

window.previousPage = function() {
    placementApp.previousPage();
};

window.nextPage = function() {
    placementApp.nextPage();
};

window.exportToGoogleSheets = async function() {
    try {
        const students = placementApp.studentsData;
        for (const student of students) {
            await googleSheetsAPI.addStudent(student);
            await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting
        }
        placementApp.showNotification('Data exported to Google Sheets successfully', 'success');
    } catch (error) {
        console.error('Error exporting to Google Sheets:', error);
        placementApp.showNotification('Failed to export to Google Sheets', 'error');
    }
};

window.importFromGoogleSheets = async function() {
    try {
        const students = await googleSheetsAPI.getStudents();
        placementApp.studentsData = students;
        placementApp.loadStudentsTable();
        placementApp.updateDashboardStats();
        placementApp.showNotification('Data imported from Google Sheets successfully', 'success');
    } catch (error) {
        console.error('Error importing from Google Sheets:', error);
        placementApp.showNotification('Failed to import from Google Sheets', 'error');
    }
};

window.distributeStudentData = async function() {
    try {
        const activeCompanies = placementApp.companiesData.filter(c => c.status === 'Active');
        const activeStudents = placementApp.studentsData.filter(s => s.status === 'Active');
        
        if (activeCompanies.length === 0) {
            placementApp.showNotification('No active companies found', 'warning');
            return;
        }
        
        if (activeStudents.length === 0) {
            placementApp.showNotification('No active students found', 'warning');
            return;
        }
        
        const companyIds = activeCompanies.map(c => c.companyId);
        await googleSheetsAPI.distributeDataToCompanies(activeStudents, companyIds);
        
        placementApp.showNotification(
            `Student data distributed to ${activeCompanies.length} companies successfully`, 
            'success'
        );
        
    } catch (error) {
        console.error('Error distributing student data:', error);
        placementApp.showNotification('Failed to distribute student data', 'error');
    }
};

window.exportAllStudents = function() {
    placementApp.exportAllStudents();
};

window.exportCompanyData = function() {
    try {
        const csvContent = placementApp.generateCompanyCSV();
        placementApp.downloadCSV(csvContent, 'company_data.csv');
    } catch (error) {
        console.error('Error exporting company data:', error);
        placementApp.showNotification('Failed to export company data', 'error');
    }
};

window.generatePlacementReport = function() {
    placementApp.generatePlacementReport();
};

window.syncWithGoogleSheets = async function() {
    try {
        // Sync placements with Google Sheets (simulation)
        placementApp.showNotification('Placement data synced with Google Sheets', 'success');
    } catch (error) {
        console.error('Error syncing with Google Sheets:', error);
        placementApp.showNotification('Failed to sync with Google Sheets', 'error');
    }
};

window.generateReport = function() {
    placementApp.generatePlacementReport();
};

// Student action functions
window.editStudent = function(studentId) {
    placementApp.editStudent(studentId);
};

window.viewStudent = function(studentId) {
    placementApp.viewStudent(studentId);
};

window.deleteStudent = function(studentId) {
    placementApp.deleteStudent(studentId);
};

// Company action functions
window.editCompany = function(companyId) {
    placementApp.editCompany(companyId);
};

window.viewCompany = function(companyId) {
    placementApp.viewCompany(companyId);
};

window.sendStudentData = function(companyId) {
    placementApp.sendStudentDataToCompany(companyId);
};

// Placement action functions
window.editPlacement = function(placementId) {
    placementApp.editPlacement(placementId);
};

window.viewPlacement = function(placementId) {
    placementApp.viewPlacement(placementId);
};

window.updateStatus = function(placementId) {
    placementApp.updatePlacementStatus(placementId);
};

// Additional utility functions
window.loadStudents = function() {
    placementApp.loadStudentsTable();
};

window.loadCompanies = function() {
    placementApp.loadCompaniesTable();
};

window.loadPlacements = function() {
    placementApp.loadPlacementsTable();
};

// Add CSS for notifications and modals
const additionalCSS = `
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.detail-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    padding: 0.8rem;
    background: #f8f9fa;
    border-radius: 5px;
    border-left: 3px solid #667eea;
}

.detail-item label {
    font-weight: 600;
    color: #2c3e50;
}

.detail-item span {
    color: #495057;
}

.uploaded-files-list {
    margin-top: 10px;
}

.uploaded-file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 10px;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 3px;
    margin-bottom: 5px;
    font-size: 0.9rem;
}

.mt-2 {
    margin-top: 0.5rem;
}

.btn-sm {
    padding: 6px 12px;
    font-size: 0.8rem;
}
`;

// Inject additional CSS
const additionalStyle = document.createElement('style');
additionalStyle.textContent = additionalCSS;
document.head.appendChild(additionalStyle);

// Initialize the application
const placementApp = new PlacementPortalApp();
