import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Search } from 'lucide-react';

interface AddressInputProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

interface OSMResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export default function AddressInput({ onLocationSelect }: AddressInputProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OSMResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounced Search using OpenStreetMap Nominatim API
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await axios.get<OSMResult[]>(
          'https://nominatim.openstreetmap.org/search',
          {
            params: {
              q: query,
              format: 'json',
              addressdetails: 1,
              limit: 5,
            },
          }
        );
        setResults(response.data);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error fetching address data:', error);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce to respect OpenStreetMap limits

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (place: OSMResult) => {
    setQuery(place.display_name);
    setShowDropdown(false);
    
    // Pass raw coordinates up to parent (converted to numbers)
    onLocationSelect(parseFloat(place.lat), parseFloat(place.lon), place.display_name);
  };

  return (
    <div className="relative w-full text-left font-body">
      <div className="relative flex items-center">
        <MapPin size={18} className="absolute left-3 text-secondary-accent" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          placeholder="Enter service address..."
          className="w-full bg-black/20 border border-white/10 rounded-md py-3 pl-10 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-secondary-accent focus:ring-2 focus:ring-primary-accent/20 transition-all"
        />
        {loading && (
          <Search size={16} className="absolute right-4 text-gray-400 animate-pulse" />
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 bg-gray-800/90 backdrop-blur-md border border-white/10 rounded-md shadow-2xl overflow-hidden">
          {results.map((place) => (
            <li
              key={place.place_id}
              onClick={() => handleSelect(place)}
              className="px-4 py-3 cursor-pointer hover:bg-primary-accent/20 border-b border-white/5 last:border-0 text-sm text-gray-200 transition-colors"
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
