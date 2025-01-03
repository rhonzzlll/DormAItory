import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  MapPin, Bed, Bath, Wifi, Wind,
  Search, SortAsc, SortDesc,
  ChevronLeft, ChevronRight,
  Filter
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../../components/layouts/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/layouts/ui/Select';
import { Input } from '../../components/layouts/ui/Input';
import Button from '../../components/layouts/ui/Button';
import { Alert, AlertDescription } from '../../components/layouts/ui/alert';

const RoomCard = ({ room }) => (
  <Link
    to={`/tenant/room-view/${room._id}`}
    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
  >
    <img
      src={room.images[0] || '/placeholder-room.jpg'}
      alt={`Room ${room.roomNumber}`}
      className="w-full h-48 object-cover"
    />
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-2">Room {room.roomNumber}</h2>
      <div className="flex items-center text-gray-600 mb-2">
        <MapPin size={16} className="mr-2 text-blue-500" />
        <span className="text-sm">916 R. Hidalgo Street Quiapo</span>
      </div>
      <p className="text-sm text-gray-700 mb-3 line-clamp-2">{room.description}</p>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xl font-bold text-blue-600">₱{room.price}/month</span>
        <div className={`px-2 py-1 rounded-full text-xs ${!room.occupied ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {!room.occupied ? 'Available' : 'Occupied'}
        </div>
      </div>
      <div className="flex items-center text-gray-600 text-xs space-x-3">
        <div className="flex items-center">
          <Bed size={14} className="mr-1" />
          <span>{room.capacity} Beds</span>
        </div>
        <div className="flex items-center">
          <Bath size={14} className="mr-1" />
          <span>{room.amenities.bathroom ? 'Private' : 'Shared'} Bath</span>
        </div>
        {room.amenities.wifi && (
          <div className="flex items-center">
            <Wifi size={14} className="mr-1" />
            <span>WiFi</span>
          </div>
        )}
        {room.amenities.aircon && (
          <div className="flex items-center">
            <Wind size={14} className="mr-1" />
            <span>A/C</span>
          </div>
        )}
      </div>
    </div>
  </Link>
);

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'roomNumber', direction: 'asc' });
  const [filterConfig, setFilterConfig] = useState({
    minPrice: '',
    maxPrice: '',
    availability: 'all',
    amenities: []
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 6;

  const API_BASE_URL = 'http://localhost:8080/api/dorms';

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_BASE_URL);
        if (response.data && Array.isArray(response.data.dorms)) {
          const sortedRooms = response.data.dorms.sort((a, b) =>
            a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
          );
          setRooms(sortedRooms);
          setFilteredRooms(sortedRooms);
        } else {
          setRooms([]);
          setError('Unexpected response format.');
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Failed to load rooms. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Search Function
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);

    const filtered = rooms.filter(room =>
      room.roomNumber.toString().includes(term.toLowerCase()) ||
      room.description.toLowerCase().includes(term.toLowerCase())
    );

    setFilteredRooms(applyFilters(filtered));
  };

  // Sorting Function
  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';

    const sortedRooms = [...filteredRooms].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setSortConfig({ key, direction });
    setFilteredRooms(sortedRooms);
  };

  // Filtering Function
  const applyFilters = (roomsToFilter) => {
    return roomsToFilter.filter(room => {
      const priceMatch =
        (!filterConfig.minPrice || room.price >= parseFloat(filterConfig.minPrice)) &&
        (!filterConfig.maxPrice || room.price <= parseFloat(filterConfig.maxPrice));

      const availabilityMatch =
        filterConfig.availability === 'all' ||
        (filterConfig.availability === 'available' && !room.occupied) ||
        (filterConfig.availability === 'occupied' && room.occupied);

      const amenitiesMatch =
        filterConfig.amenities.length === 0 ||
        filterConfig.amenities.every(amenity => room.amenities[amenity]);

      return priceMatch && availabilityMatch && amenitiesMatch;
    });
  };

  const handleFilter = (config) => {
    setFilterConfig(config);
    setCurrentPage(1);
    const filtered = applyFilters(rooms);
    setFilteredRooms(filtered);
  };

  // Pagination
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <Alert variant="destructive" className="my-4">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div className="relative w-full md:w-1/3">
          <Input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 w-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => handleSort('price')}
            className="flex items-center text-white"
          >
            {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />)}
            Price
          </Button>

          <FilterDialog onFilter={handleFilter} />
        </div>
      </div>

      {filteredRooms.length === 0 ? (
        <div className="text-center text-gray-600 py-10">
          No rooms found matching your search and filters.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentRooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="text-white"
                >
                  <ChevronLeft size={16} />
                </Button>
                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index + 1 ? 'default' : 'outline'}
                    onClick={() => paginate(index + 1)}
                    className="text-white"
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="text-white"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Filter Dialog Component
const FilterDialog = ({ onFilter }) => {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availability, setAvailability] = useState('all');
  const [amenities, setAmenities] = useState([]);

  const handleApplyFilter = () => {
    onFilter({
      minPrice,
      maxPrice,
      availability,
      amenities
    });
  };

  const toggleAmenity = (amenity) => {
    setAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center text-white">
          <Filter size={16} className="mr-2" /> Filters
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter Rooms</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
            <Select value={availability} onValueChange={setAvailability}>
              <SelectTrigger>
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                <SelectItem value="available">Available Rooms</SelectItem>
                <SelectItem value="occupied">Occupied Rooms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
            <div className="flex space-x-2">
              {['wifi', 'aircon', 'bathroom'].map(amenity => (
                <Button
                  key={amenity}
                  variant={amenities.includes(amenity) ? 'default' : 'outline'}
                  onClick={() => toggleAmenity(amenity)}
                >
                  {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={handleApplyFilter} className="w-full">Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomList;