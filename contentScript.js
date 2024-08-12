(function() {
    console.log(1)
    // Function to check if the first nav link is active
    function convertToKathmanduTime(utcDateString) {
        const utcDate = new Date(utcDateString);
        return utcDate.toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' });
    }

    function checkNavLink() {
        // Select the first nav-link element
        const firstNavLink = document.querySelector('.nav-item:first-child .nav-link');

        // Select the content container
        const existingContainer = document.querySelector('.issue-container');


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
            alert('Failed to retrieve KPI data.');
        });
    }

    // Function to create and insert content
    function createAndInsertContent() {
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
                const container = document.createElement('div');
                container.className = 'issue-container';
                kpicards(container);
    
                const tableContainer = document.createElement('div');
                tableContainer.className = 'table-container';  // New container for the table
    
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
                    </tr>
                `;
                table.appendChild(thead);
    
                const tbody = document.createElement('tbody');
                data.object.forEach(issue => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${issue.companyName}</td>
                        <td>${issue.reservationTypeName}</td>
                        <td>${issue.issueCloseDate}</td>
                    `;
                    tbody.appendChild(row);
                });

                table.appendChild(tbody);
    
                tableContainer.appendChild(table);
                container.appendChild(tableContainer);
    
                const fallbackView = document.querySelector('.fallback-view');
                document.body.insertBefore(container, fallbackView);
                // Initialize the DataTable after the table is fully constructed
                if ($.fn.DataTable.isDataTable('.issue-table')) {
                    $('.issue-table').DataTable().destroy();
                }

                $('.issue-table').DataTable({
                    'searching': false,
                    'paging': false,
                    'info': false,
                    // Add any DataTable options you need here
                });
    
                // Now, fetch and populate the ipo_status table
                fetchAndPopulateIpoStatusTable(container);
    
            } else {
                alert('No current issues found.');
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Failed to retrieve data.');
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
                        <th scope="col">Scrip</th>
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
                        const rowColor = detail.statusName === 'Alloted' ? 'bg-success' : 'bg-danger'
                        const rowColorStatus = icon === 'No' ? 'bg-success' : 'bg-danger'

                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td class = ${rowColor}>${scripName}</td>
                            <td class = ${rowColor}>${companyName}</td>
                            <td class = ${rowColor}>${detail.statusName}</td>
                            <td class = ${rowColor}>${extractedText}</td>
                            <td class = ${rowColor} style="display:none;">${originalDate}</td>
                            <td class = ${rowColor} style="text-align:left;">${dateOnly}</td>
                            <td class = ${rowColorStatus}>${icon}</td>
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
                            $('.ipo_status_table').DataTable({
                                "pageLength": 5,
                                "lengthMenu": [5, 10, 15, 20],
                                "order": [[4, "desc"]], // Sort by the hidden column (index 3) containing the original date
                                "columnDefs": [
                                    { "targets": [4], "visible": false } // Hide the original date column
                                ]
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
            // alert('Failed to retrieve IPO status data.');
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
