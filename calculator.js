let globalData = [];
let myChart = null;

// טעינת הנתונים בעת טעינת הדף
window.onload = async function() {
    try {
        const response = await fetch('uploaded_file.csv');
        const csvData = await response.text();
        
        Papa.parse(csvData, {
            header: true,
            dynamicTyping: true,
            complete: function(results) {
                globalData = results.data.map(row => {
                    if (row.Month) {
                        const [day, month, year] = row.Month.split('/');
                        return {
                            ...row,
                            dateFormatted: `${year}-${month.padStart(2, '0')}`
                        };
                    }
                    return row;
                });
                console.log('נטענו הנתונים:', globalData.length);
            }
        });
    } catch (error) {
        console.error('שגיאה בטעינת הנתונים:', error);
    }
}

function calculate() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    const filteredData = globalData.filter(row => 
        row.dateFormatted >= startDate && 
        row.dateFormatted <= endDate
    );

    if (filteredData.length > 0) {
        const startValue = filteredData[0].Closing;
        const endValue = filteredData[filteredData.length - 1].Closing;
        const percentageChange = ((endValue - startValue) / startValue * 100).toFixed(2);

        // הצגת התוצאות
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = `
            <h2>תוצאות:</h2>
            <p>ערך התחלתי: ${startValue.toFixed(2)}</p>
            <p>ערך סופי: ${endValue.toFixed(2)}</p>
            <p>שינוי באחוזים: ${percentageChange}%</p>
            <p>מספר נקודות מידע: ${filteredData.length}</p>
        `;

        // יצירת הגרף
        createChart(filteredData);
    }
}

function createChart(data) {
    const ctx = document.getElementById('myChart').getContext('2d');
    
    // מחיקת גרף קיים אם יש
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(row => row.Month),
            datasets: [{
                label: 'ערכי סגירה',
                data: data.map(row => row.Closing),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}
