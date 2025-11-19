'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { mockUsers, mockAbsentions } from '@/lib/mockData';

interface AttendanceRecord {
  userId: string;
  userName: string;
  attend: number;
  alpha: number;
  permission: number;
  sick: number;
  total: number;
}

export default function LaporanAbsensiPage() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) {
      router.push('/login');
      return;
    }

    generateAttendanceData();
  }, [router, selectedMonth, selectedYear]);

  const generateAttendanceData = () => {
    const records: AttendanceRecord[] = mockUsers.map(user => {
      // Filter absentions for this user and selected month/year
      const userAbsentions = mockAbsentions.filter(abs => {
        const absDate = new Date(abs.datetime);
        return abs.userId === user.id && 
               absDate.getMonth() === selectedMonth && 
               absDate.getFullYear() === selectedYear;
      });

      // Count each type based on actual data only
      const attend = userAbsentions.filter(abs => abs.absention === 'attend').length;
      const alpha = userAbsentions.filter(abs => abs.absention === 'alpha').length;
      const permission = userAbsentions.filter(abs => abs.absention === 'permission').length;
      const sick = userAbsentions.filter(abs => abs.absention === 'sick').length;
      const total = attend + alpha + permission + sick;

      return {
        userId: user.id,
        userName: user.name,
        attend,
        alpha,
        permission,
        sick,
        total
      };
    });

    setAttendanceRecords(records);
  };

  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month];
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    if (selectedYear === currentYear && selectedMonth === currentMonth) {
      return; // Don't go beyond current month
    }

    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const isCurrentMonth = () => {
    const currentDate = new Date();
    return selectedMonth === currentDate.getMonth() && selectedYear === currentDate.getFullYear();
  };

  const getAttendancePercentage = (attend: number, total: number) => {
    return total > 0 ? ((attend / total) * 100).toFixed(1) : '0';
  };

  const downloadCSV = () => {
    // Create CSV content with detailed records per person
    const csvRows: string[] = [];
    
    // Add header
    csvRows.push(`Laporan Absensi - ${getMonthName(selectedMonth)} ${selectedYear}`);
    csvRows.push(''); // Empty line
    
    // Add summary section
    csvRows.push('SUMMARY');
    csvRows.push('No.,Name,Attend,Alpha,Permission,Sick,Total Days,Attendance %');
    attendanceRecords.forEach((record, index) => {
      csvRows.push([
        index + 1,
        record.userName,
        record.attend,
        record.alpha,
        record.permission,
        record.sick,
        record.total,
        `${getAttendancePercentage(record.attend, record.total)}%`
      ].join(','));
    });
    
    csvRows.push(''); // Empty line
    csvRows.push(''); // Empty line
    
    // Add detailed records per person
    csvRows.push('DETAILED RECORDS');
    csvRows.push(''); // Empty line
    
    attendanceRecords.forEach((record) => {
      // Get detailed absention records for this user
      const userAbsentions = mockAbsentions.filter(abs => {
        const absDate = new Date(abs.datetime);
        return abs.userId === record.userId && 
               absDate.getMonth() === selectedMonth && 
               absDate.getFullYear() === selectedYear;
      }).sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
      
      // Add user name as section header
      csvRows.push(`"${record.userName}"`);
      csvRows.push('No.,Date,Time,Status');
      
      if (userAbsentions.length === 0) {
        csvRows.push('No records found');
      } else {
        userAbsentions.forEach((abs, idx) => {
          const date = new Date(abs.datetime);
          const dateStr = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
          const timeStr = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
          csvRows.push([
            idx + 1,
            dateStr,
            timeStr,
            abs.absention.charAt(0).toUpperCase() + abs.absention.slice(1)
          ].join(','));
        });
      }
      
      csvRows.push(''); // Empty line between users
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Absensi_Detail_${getMonthName(selectedMonth)}_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Laporan Absensi</h1>
            
            <div className="flex items-center space-x-4">
              {/* Download Button */}
              <button
                onClick={downloadCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download CSV</span>
              </button>

              {/* Month Selector */}
              {/* Month Selector */}
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="text-center min-w-[180px]">
                <p className="text-lg font-semibold text-gray-900">
                  {getMonthName(selectedMonth)} {selectedYear}
                </p>
                {isCurrentMonth() && (
                  <p className="text-xs text-blue-600">Current Month</p>
                )}
              </div>
              
              <button
                onClick={handleNextMonth}
                disabled={isCurrentMonth()}
                className={`p-2 rounded-lg transition ${
                  isCurrentMonth()
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attend</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Alpha</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Permission</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sick</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Days</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map((record, index) => (
                  <tr key={record.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded">
                        {record.attend}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 text-sm font-semibold text-red-800 bg-red-100 rounded">
                        {record.alpha}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 text-sm font-semibold text-yellow-800 bg-yellow-100 rounded">
                        {record.permission}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 text-sm font-semibold text-blue-800 bg-blue-100 rounded">
                        {record.sick}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                      {record.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-bold text-blue-600">
                        {getAttendancePercentage(record.attend, record.total)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => router.push(`/dashboard/absention/${record.userId}`)}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {attendanceRecords.length} {attendanceRecords.length === 1 ? 'entry' : 'entries'}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
