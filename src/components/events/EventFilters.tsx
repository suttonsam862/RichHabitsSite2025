import { useState } from "react";
import { motion } from "framer-motion";

type FilterProps = {
  onFilterChange: (filters: FilterState) => void;
  totalEvents: number;
  filteredEvents: number;
}

type FilterState = {
  location: string;
  month: string;
  priceRange: [number, number];
}

const locations = ["All Locations", "Birmingham, AL", "Las Vegas, NV", "Arlington, TX", "Various locations"];
const months = ["All Months", "May", "June", "July", "August"];
const priceRanges = [
  { label: "All Prices", value: [0, 500] },
  { label: "Under $100", value: [0, 100] },
  { label: "$100 - $250", value: [100, 250] },
  { label: "$250 - $350", value: [250, 350] },
  { label: "$350+", value: [350, 500] }
];

export default function EventFilters({ onFilterChange, totalEvents, filteredEvents }: FilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    location: "All Locations",
    month: "All Months", 
    priceRange: [0, 500]
  });
  
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-100 p-8 mb-16"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h3 className="text-2xl mb-4 md:mb-0 title-font">Filter Events</h3>
        <div className="text-gray-600 subtitle-font">
          Showing {filteredEvents} of {totalEvents} events
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Location Filter */}
        <div>
          <label className="block mb-3 text-sm subtitle-font">Location</label>
          <select 
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            className="w-full p-3 border border-gray-300 bg-white subtitle-font"
          >
            {locations.map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>
        
        {/* Month Filter */}
        <div>
          <label className="block mb-3 text-sm subtitle-font">Month</label>
          <select 
            value={filters.month}
            onChange={(e) => handleFilterChange("month", e.target.value)}
            className="w-full p-3 border border-gray-300 bg-white subtitle-font"
          >
            {months.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        
        {/* Price Range Filter */}
        <div>
          <label className="block mb-3 text-sm subtitle-font">Price Range</label>
          <select 
            value={JSON.stringify(filters.priceRange)}
            onChange={(e) => handleFilterChange("priceRange", JSON.parse(e.target.value))}
            className="w-full p-3 border border-gray-300 bg-white subtitle-font"
          >
            {priceRanges.map((range) => (
              <option key={range.label} value={JSON.stringify(range.value)}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  );
}