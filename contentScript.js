(function() {

    // Function to check if the first nav link is active
    function convertToKathmanduTime(utcDateString) {
        const utcDate = new Date(utcDateString);
        return utcDate.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' });
    }

    function checkNavLink() {
        // Check if we're on the correct URL
        if (window.location.href !== 'https://meroshare.cdsc.com.np/#/dashboard') {
            // If not on dashboard, remove the container if it exists
            const existingContainer = document.querySelector('.main-content-container');
            if (existingContainer) {
                existingContainer.remove();
            }
            return;
        }
    
        // Select the first nav-link element
        const firstNavLink = document.querySelector('.nav-item:first-child .nav-link');
        // Select the content container
        const existingContainer = document.querySelector('.main-content-container');
    
        // Check if the nav-link has the 'active' class
        if (firstNavLink && firstNavLink.classList.contains('active')) {
            // Show content if not already displayed
            if (!existingContainer) {
                createAndInsertContent();
            }
        } else {
            // Hide content if it's displayed and the nav link is not active
            if (existingContainer) {
                existingContainer.remove();
            }
        }
    }
    function kpicards(container) {
        const authToken = sessionStorage.getItem('Authorization');
        
        if (!authToken) {
            console.error('Authorization token not found');
            return;
        }
    
        fetch('https://webbackend.cdsc.com.np/api/meroShare/ownDetail/',{
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${authToken}`
            },
        })
        .then(response => {
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }
            return response.json(); // Parse the JSON response
        })
        .then(data => {
            var demat = data.demat;

            const url = 'https://webbackend.cdsc.com.np/api/meroShareView/myPortfolio/';
            const payload = {
                "sortBy": "script",
                "demat": [demat],
                "clientCode": "14500",
                "page": 1,
                "size": 200,
                "sortAsc": true
            };
        
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${authToken}`
                },
                body: JSON.stringify(payload),
            })
            .then(response => response.json())
            .then(data => {
                if (data) {
                    // console.log(data);
                    var lastDayPrice = data.totalValueAsOfPreviousClosingPrice;
                    var thisDayPrice = data.totalValueAsOfLastTransactionPrice;
                    var gain = (thisDayPrice-lastDayPrice).toFixed(2) ;

                    const colornew = thisDayPrice >= lastDayPrice ? 'bg-success' : 'bg-danger';
                    const gainOrLoss = thisDayPrice >= lastDayPrice ? 'Gain' : 'Loss';

                    const gainLossIcon = thisDayPrice >= lastDayPrice ? '⬆' : '⬇';
                    const priceColor = thisDayPrice >= lastDayPrice ? 'text-success' : 'text-danger';


                    const percentageChange = (((thisDayPrice-lastDayPrice)/lastDayPrice) *100).toFixed(2)

                    const kpiContainer = document.createElement('div');
                    kpiContainer.className = 'kpi-container';
        
                    kpiContainer.innerHTML = `
                        <div class="container-fluid">
                            <div class="row">
                                <div class="col-xl-4 col-lg-6">
                                <div class="card shadow card-stats mb-4 mb-xl-0">
                                    <div class="card-body">
                                    <div class="row">
                                        <div class="col">
                                        <h5 class="card-title   mb-1">Yesterday's price</h5>
                                        <span class="h4 font-weight-bold mb-0">Nrs ${lastDayPrice}</span>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                </div>
                                <div class="col-xl-4 col-lg-6">
                                <div class="card shadow card-stats mb-4 mb-xl-0">
                                    <div class="card-body">
                                    <div class="row">
                                        <div class="col">
                                        <h5 class="card-title  mb-1">Today's Price</h5>
                                        <span class="h4 font-weight-bold mb-0 ${priceColor} ">Nrs ${thisDayPrice}</span>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                </div>
                                <div class="col-xl-4 col-lg-6">
                                <div class="card shadow card-stats mb-4 mb-xl-0 ">
                                    <div class="card-body">
                                    <div class="row">
                                        <div class="col">
                                        <h5 class="card-title mb-1 ${colornew}">Today's ${gainOrLoss}</h5>
                                        <span class="h4 font-weight-bold mb-0 ${priceColor}">Nrs ${gain} (  ${gainLossIcon} ${percentageChange}% from yesterday)</span>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                    `;
        
                    // Insert KPI cards before the existing container
                    container.insertBefore(kpiContainer, container.firstChild);
                } else {
                    alert('No current issues found.');
                }
            })
        })
        .catch(error => {
            console.error('Error fetching KPI data:', error);
            // Remove the alert and replace with an error message in the container
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-warning';
            errorDiv.textContent = 'Portfolio data temporarily unavailable';
            container.insertBefore(errorDiv, container.firstChild);
        });
    }

    // Function to create and insert content
    // In createAndInsertContent function, update the tab switching logic
    function createAndInsertContent() {
        const container = document.createElement('div');
        container.className = 'main-content-container';
        
        // Create tabs container
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'nav nav-tabs';
        tabsContainer.innerHTML = `
            <li class="nav-item">
                <button class="nav-link active" data-bs-target="#dashboard" type="button">Main Dashboard</button>
            </li>
            <li class="nav-item">
                <button class="nav-link" data-bs-target="#additional" type="button">Additional Info</button>
            </li>
        `;
    
        // Create tab content container
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
    
        // Main tab content
        const mainTab = document.createElement('div');
        mainTab.className = 'tab-pane fade show active';
        mainTab.id = 'dashboard';
    
        // Create a separate container for KPI cards
        const kpiSection = document.createElement('div');
        kpiSection.className = 'kpi-section';
        mainTab.appendChild(kpiSection);
        kpicards(kpiSection);
    
        // Additional tab content
        const additionalTab = document.createElement('div');
        additionalTab.className = 'tab-pane fade';
        additionalTab.id = 'additional';
        additionalTab.style.cssText = 'background-color: red; min-height: 100vh; width: 100%;';
    
        // Add tabs and content to container
        container.appendChild(tabsContainer);
        tabContent.appendChild(mainTab);
        tabContent.appendChild(additionalTab);
        container.appendChild(tabContent);

        // Insert container into DOM first
        const fallbackView = document.querySelector('.fallback-view');
        document.body.insertBefore(container, fallbackView);

        // Initialize tab functionality
        const tabs = container.querySelectorAll('.nav-link');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Get target ID and find the pane within our container
                const targetId = tab.getAttribute('data-bs-target');
                const targetPane = container.querySelector(targetId);
                
                // Remove active class from all tabs and panes
                tabs.forEach(t => t.classList.remove('active'));
                container.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('show', 'active');
                });
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Add show and active classes to target pane
                if (targetPane) {
                    targetPane.classList.add('show', 'active');
                }
                
                // Reinitialize DataTables when switching back to main tab
                if (targetId === '#dashboard') {
                    setTimeout(() => {
                        if ($.fn.DataTable.isDataTable('.issue-table')) {
                            $('.issue-table').DataTable().columns.adjust();
                        }
                        if ($.fn.DataTable.isDataTable('.ipo_status_table')) {
                            $('.ipo_status_table').DataTable().columns.adjust();
                        }
                    }, 100);
                }
            });
        });

        const url = 'https://webbackend.cdsc.com.np/api/meroShare/companyShare/currentIssue';
        const payload = {
            "filterFieldParams": [
                { "key": "companyIssue.companyISIN.script", "alias": "Scrip" },
                { "key": "companyIssue.companyISIN.company.name", "alias": "Company Name" },
                { "key": "companyIssue.assignedToClient.name", "value": "", "alias": "Issue Manager" }
            ],
            "page": 1,
            "size": 10,
            "searchRoleViewConstants": "VIEW_OPEN_SHARE",
            "filterDateParams": [
                { "key": "minIssueOpenDate", "condition": "", "alias": "", "value": "" },
                { "key": "maxIssueCloseDate", "condition": "", "alias": "", "value": "" }
            ]
        };
    
        const authToken = sessionStorage.getItem('Authorization');
    
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${authToken}`
            },
            body: JSON.stringify(payload),
        })
        .then(response => response.json())
        .then(data => {
            if (data.object && data.object.length > 0) {
                // Remove duplicate container creation
                const tableContainer = document.createElement('div');
                tableContainer.className = 'table-container';
                
                const heading = document.createElement('h4');
                heading.className = 'table_header mb-0 rounded';
                heading.textContent = "IPO's that are open currently";
                tableContainer.appendChild(heading);
        
                const table = document.createElement('table');
                table.className = 'issue-table table';
        
                const thead = document.createElement('thead');
                thead.innerHTML = `
                    <tr>
                        <th scope="col">Company Name</th>
                        <th scope="col">Type</th>
                        <th scope="col">Issue Close Date</th>
                        <th scope="col">Action Date</th>
                    </tr>
                `;
                table.appendChild(thead);
        
                const tbody = document.createElement('tbody');
                data.object.forEach(issue => {
                    const row = document.createElement('tr');
                    const applyButton = document.createElement('button');
                    applyButton.className = 'btn btn-primary';
                    applyButton.textContent = 'Apply';
                    
                    // Disable button if not Ordinary Shares or if reserved
                    if (issue.shareTypeName !== 'IPO') {
                        applyButton.disabled = true;
                        applyButton.title = 'Not available for this share type';
                        applyButton.style.opacity = '0.5';
                        applyButton.style.cursor = 'not-allowed';
                    }
                    
                    applyButton.addEventListener('click', async () => {
                        try {
                            // Get demat from ownDetail
                            const authToken = sessionStorage.getItem('Authorization');
                            const dematResponse = await fetch('https://webbackend.cdsc.com.np/api/meroShare/ownDetail/', {
                                headers: {
                                    'Authorization': `${authToken}`,
                                    'Content-Type': 'application/json'
                                }
                            });
                            const dematData = await dematResponse.json();
                            const demat = dematData.demat;

                            // Check customer type
                            const customerTypeResponse = await fetch(`https://webbackend.cdsc.com.np/api/meroShare/applicantForm/customerType/${issue.companyShareId}/${demat}`, {
                                headers: {
                                    'Authorization': `${authToken}`,
                                    'Content-Type': 'application/json'
                                }
                            });
                            const customerTypeData = await customerTypeResponse.json();

                            if (customerTypeData.status === 'ACCEPTED') {
                                // Redirect to apply page
                                window.location.href = `https://meroshare.cdsc.com.np/#/asba/apply/${issue.companyShareId}`;
                            } else {
                                alert('You are not eligible to apply for this IPO');
                            }
                        } catch (error) {
                            console.error('Error applying for IPO:', error);
                            alert('An error occurred while trying to apply');
                        }
                    });

                    row.innerHTML = `
                        <td>${issue.companyName}</td>
                        <td>${issue.reservationTypeName ? issue.reservationTypeName : issue.shareGroupName}</td>
                        <td>${issue.issueCloseDate}</td>
                        <td></td>
                    `;
                    row.querySelector('td:last-child').appendChild(applyButton);
                    tbody.appendChild(row);
                });
        
                table.appendChild(tbody);
        
                tableContainer.appendChild(table);
                mainTab.appendChild(tableContainer);  // Changed from container to mainTab
                
                // Initialize DataTable
                $('.issue-table').DataTable({
                    'searching': false,
                    'paging': false,
                    'info': false,
                    'scrollY': '300px',
                    'scrollCollapse': true,
                    'order': []  // Disable initial sorting
                });
                
                // In fetchAndPopulateIpoStatusTable function, update the DataTable initialization:
                $('.ipo_status_table').DataTable({
                    'paging': false,
                    'scrollCollapse': true,
                    'scrollY': '200px',
                    'searching': false
                });
                
                fetchAndPopulateIpoStatusTable(mainTab);  // Changed from container to mainTab
            } 
            else {
                alert('No current issues found.');
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            const container = document.createElement('div');
            container.className = 'main-content-container'; // Changed from issue-container
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-warning';
            errorDiv.textContent = 'Unable to load current IPO data.';
            container.appendChild(errorDiv);
            
            const fallbackView = document.querySelector('.fallback-view');
            document.body.insertBefore(container, fallbackView);
            fetchAndPopulateIpoStatusTable(container);
        });
    }
    
    
    function fetchAndPopulateIpoStatusTable(container) {
        const statusUrl = 'https://webbackend.cdsc.com.np/api/meroShare/applicantForm/active/search/';
        const payload = {
            "filterFieldParams": [
                { "key": "companyIssue.companyISIN.script", "alias": "Scrip" },
                { "key": "companyIssue.companyISIN.company.name", "alias": "Company Name" },
                { "key": "companyIssue.assignedToClient.name", "value": "", "alias": "Issue Manager" }
            ],
            "page": 1,
            "size": 50,
            "searchRoleViewConstants": "VIEW_OPEN_SHARE",
            "filterDateParams": [
                { "key": "minIssueOpenDate", "condition": "", "alias": "", "value": "" },
                { "key": "maxIssueCloseDate", "condition": "", "alias": "", "value": "" }
            ]
        };
        const authToken = sessionStorage.getItem('Authorization');
    
        // // Clear previous table content (if any) before rendering a new one
        // container.innerHTML = '';
    
        fetch(statusUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${authToken}`
            },
            body: JSON.stringify(payload),
        })
        .then(response => response.json())
        .then(data => {
            if (data.object && data.object.length > 0) {
                const ipoStatusContainer = document.createElement('div');
                ipoStatusContainer.className = 'ipo_status_container';
        
                const statusHeading = document.createElement('h4');
                statusHeading.className = 'table_header rounded';
                statusHeading.textContent = "Last Applied IPO Status";
                ipoStatusContainer.appendChild(statusHeading);
        
                const statusTable = document.createElement('table');
                statusTable.className = 'ipo_status_table table';
        
                const statusThead = document.createElement('thead');
                statusThead.innerHTML = `
                    <tr>
                        <th scope="col">Company Name</th>
                        <th scope="col">Status Name</th>
                        <th scope="col">Meroshare Remark</th>
                        <td scope="col">Date</td>
                        <th scope="col">Expiration Date</th>
                        <th scope="col">Expired</th>
                    </tr>
                `;
                statusTable.appendChild(statusThead);
        
                const statusTbody = document.createElement('tbody');
        
                let itemsProcessed = 0;
                const totalItems = data.object.length;
        
                data.object.forEach(item => {
                    fetch(`https://webbackend.cdsc.com.np/api/meroShare/applicantForm/report/detail/${item.applicantFormId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': sessionStorage.getItem('Authorization')
                        }
                    })
                    .then(response => response.json())
                    .then(detail => {
                        const companyName = item.companyName || 'N/A';  // Fallback in case companyName is undefined
                        const scripName = item.scrip || 'N/A';  // Fallback in case companyName is undefined
                        const originalDate = detail.maxIssueCloseDate; // Original date in UTC format (sortable)
                        const convertedDate = convertToKathmanduTime(originalDate); // Converted date for display

                        const convertedDateObj = new Date(convertedDate)
                        const dateOnly = convertedDateObj.toISOString().split('T')[0];
                        const currentDate = new Date();
                
                        // Determine which icon to show
                        const icon = currentDate > convertedDateObj ? 'Yes' : 'No';
                        let remark = detail.meroshareRemark;
                        let extractedText = '';

                        let separator = '- ';
                        let separatorIndex = remark.indexOf(separator);

                        if (separatorIndex !== -1) {
                            extractedText = remark.substring(separatorIndex + separator.length).trim();
                        }
                        // Update the row colors in fetchAndPopulateIpoStatusTable
                        const rowColor = detail.statusName === 'Alloted' ? 'bg-success text-white' : 'bg-danger text-white';
                        const rowColorStatus = icon === 'No' ? 'bg-success text-white' : 'bg-danger text-white';
                        
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td class="${rowColor}">${companyName}</td>
                            <td class="${rowColor}">${detail.statusName}</td>
                            <td class="${rowColor}">${extractedText}</td>
                            <td class="${rowColor}" style="display:none;">${originalDate}</td>
                            <td class="${rowColor}" style="text-align:left;">${dateOnly}</td>
                            <td class="${rowColorStatus}">${icon}</td>
                        `;
                        statusTbody.appendChild(row);
                        itemsProcessed++;
                        if (itemsProcessed === totalItems) {
                            // Initialize DataTables after all rows are added
                            statusTable.appendChild(statusTbody);
                            ipoStatusContainer.appendChild(statusTable);
                            container.appendChild(ipoStatusContainer);

                            if ($.fn.DataTable.isDataTable('.ipo_status_table')) {
                                $('.ipo_status_table').DataTable().destroy();
                            }
                            // Initialize DataTables
                            // Update DataTable initialization with alternating row colors
                            $('.ipo_status_table').DataTable({
                                'paging': false,
                                'scrollCollapse': true,
                                'scrollY': '200px',
                                "order": [[4, "desc"]],
                                "columnDefs": [
                                    { "targets": [3], "visible": false }
                                ],
                                "rowCallback": function(row, data, index) {
                                    if (!$(row).find('td').hasClass('bg-success') && !$(row).find('td').hasClass('bg-danger')) {
                                        $(row).css('background-color', index % 2 === 0 ? '#f8f9fa' : '#e9ecef');
                                    }
                                }
                            });
                        }
                    })
                    .catch(error => {
                        // console.error(`Error fetching details for applicantFormId ${item.applicantFormId}:`, error);
                    });
                });
            } else {
                // alert('No IPO status data found.');
            }
        })
        .catch(error => {
            console.error('Error fetching IPO status data:', error);
            // Add a message to the container instead of an alert
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert alert-warning';
            errorMessage.textContent = 'Unable to load IPO status data.';
            container.appendChild(errorMessage);
        });
    }
    

    // Initial check when the script runs
    checkNavLink();

    // Optional: Add a MutationObserver to handle changes in the navigation state
    const observer = new MutationObserver(() => {
        checkNavLink();
    });

    // Observe changes in the body or specific container where navigation items are located
    observer.observe(document.body, { childList: true, subtree: true });

    // Also handle hash changes if necessary
    window.addEventListener('hashchange', checkNavLink);
})();
