import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Papa from 'papaparse';

// פונקציה לעדכון מונה שימוש
const updateUsageCounter = () => {
    try {
        // בדיקה אם קיים מונה בלוקל סטורג'
        let counter = localStorage.getItem('appUsageCounter');
        
        // אם המונה לא קיים, יוצרים אותו
        if (!counter) {
            counter = 0;
        } else {
            counter = parseInt(counter);
        }
        
        // מגדילים את המונה ב-1
        counter++;
        
        // שומרים את המונה המעודכן
        localStorage.setItem('appUsageCounter', counter);
        
        // הדפסה לקונסול לצורך מעקב
        console.log('מספר שימושים באפליקציה:', counter);
        
        return counter;
    } catch (error) {
        console.error('שגיאה בעדכון המונה:', error);
        return 0;
    }
};

const InvestmentCalculator = () => {
    const [birthDate, setBirthDate] = useState({
        day: '',
        month: '',
        year: ''
    });
    const [spData, setSpData] = useState([]);
    const [results, setResults] = useState(null);
    const [retirementAge, setRetirementAge] = useState(67);
    const [usageCount, setUsageCount] = useState(0);

    useEffect(() => {
        // עדכון מונה בעת טעינת הקומפוננטה
        const count = updateUsageCounter();
        setUsageCount(count);
        
        const loadData = async () => {
            try {
                const response = await fetch('uploaded_file.csv');
                const csvData = await response.text();
                
                Papa.parse(csvData, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        setSpData(results.data);
                    }
                });
            } catch (error) {
                console.error('שגיאה בטעינת הנתונים:', error);
            }
        };

        loadData();
    }, []);

    const calculateInvestment = () => {
        // עדכון מונה בעת ביצוע חישוב
        const count = updateUsageCounter();
        setUsageCount(count);
        
        if (!birthDate.year || !birthDate.month || !spData.length === 0) return;

        const startDate = `${birthDate.year}-${birthDate.month.padStart(2, '0')}`;
        const retirementYear = parseInt(birthDate.year) + retirementAge;
        const endDate = `${retirementYear}-${birthDate.month.padStart(2, '0')}`;

        const relevantData = spData.filter(entry => {
            const entryDate = entry.Date;
            return entryDate >= startDate && entryDate <= endDate;
        });

        if (relevantData.length === 0) {
            setResults({
                error: 'לא נמצאו נתונים לטווח התאריכים שנבחר'
            });
            return;
        }

        let investment = 1000;
        const monthlyData = [];
        let previousMonth = null;

        relevantData.forEach(entry => {
            const currentDate = entry.Date;
            
            if (currentDate !== previousMonth) {
                monthlyData.push({
                    date: currentDate,
                    value: investment,
                    monthlyReturn: entry.MonthlyReturn
                });

                investment *= (1 + (entry.MonthlyReturn / 100));
                previousMonth = currentDate;
            }
        });

        setResults({
            finalAmount: investment.toFixed(2),
            monthlyData: monthlyData,
            totalReturn: ((investment - 1000) / 1000 * 100).toFixed(2)
        });
    };

    const handleDateChange = (event) => {
        const { name, value } = event.target;
        setBirthDate(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRetirementAgeChange = (event) => {
        setRetirementAge(parseInt(event.target.value));
    };

    return (
        <div className="container max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">מחשבון השקעות מיום הלידה</h1>
            
            {/* מונה שימושים */}
            <div className="text-center mb-4">
                <p className="text-sm text-gray-500">מספר שימושים באפליקציה: <span className="font-bold">{usageCount}</span></p>
            </div>
            
            {/* קישור לקבוצת וואטסאפ */}
            <div className="text-center mb-6">
                <a 
                    href="https://chat.whatsapp.com/KPhdGsFcR9Q6jYcgmeYckM" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                >
                    <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    הצטרף לקבוצת הווטסאפ
                </a>
            </div>
            
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>הזן את תאריך הלידה שלך</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">יום</label>
                            <input
                                type="text"
                                name="day"
                                value={birthDate.day}
                                onChange={handleDateChange}
                                className="w-full p-2 border rounded"
                                placeholder="DD"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">חודש</label>
                            <input
                                type="text"
                                name="month"
                                value={birthDate.month}
                                onChange={handleDateChange}
                                className="w-full p-2 border rounded"
                                placeholder="MM"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">שנה</label>
                            <input
                                type="text"
                                name="year"
                                value={birthDate.year}
                                onChange={handleDateChange}
                                className="w-full p-2 border rounded"
                                placeholder="YYYY"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">גיל פרישה</label>
                        <input
                            type="number"
                            value={retirementAge}
                            onChange={handleRetirementAgeChange}
                            className="w-full p-2 border rounded"
                            min="0"
                            max="120"
                        />
                    </div>

                    <button
                        onClick={calculateInvestment}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        חשב
                    </button>
                </CardContent>
            </Card>

            {results && !results.error && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>תוצאות</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg mb-4">
                            <p>השקעה התחלתית: ₪1,000</p>
                            <p>סכום סופי: ₪{parseInt(results.finalAmount).toLocaleString()}</p>
                            <p>תשואה כוללת: {results.totalReturn}%</p>
                        </div>

                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={results.monthlyData}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        name="ערך ההשקעה"
                                        stroke="#8884d8"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {results && results.error && (
                <Card className="mb-6 bg-red-50">
                    <CardContent>
                        <p className="text-red-500">{results.error}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default InvestmentCalculator;
