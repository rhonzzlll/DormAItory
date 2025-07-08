import React, { useState, useEffect } from 'react';
import { MapPin, Search, Calendar } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const RoomChangeHistory = () => {
  // Get tenantId from URL if present, otherwise from localStorage
  const { tenantId } = useParams();
  const userId = tenantId || localStorage.getItem("_id") || "";

  const [roomChangeHistory, setRoomChangeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRoomChangeHistory = async () => {
      if (!userId) {
        setRoomChangeHistory([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        // Fetch room change history by userId
        const res = await axios.get(`http://localhost:8080/api/tenants/history/${userId}`);
        setRoomChangeHistory(res.data.history || []);
      } catch (err) {
        setError('Failed to fetch room change history');
      } finally {
        setLoading(false);  
      }
    };

    fetchRoomChangeHistory();
  }, [userId]);

  // Only show records with a valid fromRoom and toRoom (indicating a move)
  const movementHistory = roomChangeHistory.filter(
    record => record.fromRoom && record.toRoom && record.fromRoom !== record.toRoom
  );

  const filteredHistory = movementHistory.filter(record => {
    const matchesSearch =
      (record.fromRoom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (record.toRoom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (record.changedBy?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Helper to format date/time
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return (
      <>
        <div className="font-medium">{date.toLocaleDateString()}</div>
        <div className="text-gray-500 text-xs">{date.toLocaleTimeString()}</div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="animate-pulse flex items-center">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Label and Current Room Emphasis */}
      <div className="flex items-center px-6 pt-6 pb-2 justify-between">
        <div className="flex items-center">
          <MapPin className="w-5 h-5 text-gray-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Room Change History</h2>
        </div>
        <div className="flex items-center">
          <span className="text-lg font-bold text-teal-700 bg-teal-50 px-4 py-2 rounded-lg shadow-sm border border-teal-200">
            Current Room:&nbsp;
            {roomChangeHistory.length > 0 && roomChangeHistory[roomChangeHistory.length - 1].toRoom
              ? roomChangeHistory[roomChangeHistory.length - 1].toRoom
              : 'No room assigned'}
          </span>
        </div>
      </div>
      {/* Search */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by room or admin..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table or No History Message */}
      <div className="overflow-x-auto">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Room Change History</h3>
            <p className="text-gray-500">
              {searchTerm
                ? 'No room changes match your search criteria.'
                : 'This tenant has not moved rooms yet.'}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start of Rent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End of Rent
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.map((record, index) => (
                <tr key={record._id || record.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      {formatDateTime(record.changeDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs">
                      <div className="font-medium text-red-600">{record.fromRoom}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs">
                      <div className="font-medium text-green-600">{record.toRoom}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.moveInDate ? new Date(record.moveInDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.moveOutDate ? new Date(record.moveOutDate).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {filteredHistory.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredHistory.length}</span> of{' '}
              <span className="font-medium">{movementHistory.length}</span> records
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileHistory = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RoomChangeHistory />
      </div>
    </div>
  );
};

export default ProfileHistory;