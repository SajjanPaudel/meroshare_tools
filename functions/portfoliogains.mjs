export function portfolio_gains() {
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

            const heading = document.createElement('h4');
            heading.className = 'table_header';
            heading.textContent = "IPO's that are open currently";
            container.appendChild(heading);

            const table = document.createElement('table');
            table.className = 'issue-table';

            const thead = document.createElement('thead');
            thead.innerHTML = `
              <tr>
                <th>Scrip</th>
                <th>Company Name</th>
                <th>Type</th>
                <th>Issue Open Date</th>
                <th>Issue Close Date</th>
              </tr>
            `;
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            data.object.forEach(issue => {
              const row = document.createElement('tr');
              row.innerHTML = `
                <td>${issue.scrip}</td>
                <td>${issue.companyName}</td>
                <td>${issue.reservationTypeName}</td>
                <td>${issue.issueOpenDate}</td>
                <td>${issue.issueCloseDate}</td>
              `;
              tbody.appendChild(row);
            });
            table.appendChild(tbody);
            container.appendChild(table);

            const fallbackView = document.querySelector('.fallback-view');
            document.body.insertBefore(container, fallbackView);
        } else {
            alert('No current issues found.');
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        alert('Failed to retrieve data.');
    });
}