import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Papa from 'papaparse';

const InvestmentCalculator = () => {
    const [birthDate, setBirthDate] = useState({
        day: '',
        month: '',
        year: ''
    });
    const [spData, setSpData] = useState([]);
    const [results, setResults] = useState(null);
    const [retirementAge, setRetirementAge] = useState(67);

    useEffect(() => {
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
