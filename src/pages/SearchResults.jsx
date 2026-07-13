import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { hotelsAPI } from '../utils/api';
import './SearchResults.css';

const travelPurposes = ['Business', 'Family', 'Couple', 'Honeymoon', 'Solo Travel', 'Friends Trip'];
const eventFilters = ['Day Events', 'Night Events', 'Pool Parties', 'Live Music', 'Conferences', 'Wedding Events'];

function HotelCard({ hotel }) {
  return (
    <div className="sr-hotel-card">
      <div className="sr-hotel-card-image">
        <img src={hotel.image} alt={hotel.name} />
        <div className="sr-rating-badge">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="white">
            <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78L10 1z" />
          </svg>
          <span>{hotel.rating}</span>
        </div>
        <div className="sr-card-location">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.33">
            <path d="M8 1.33c-2.21 0-4 1.79-4 4 0 3 4 7.34 4 7.34s4-4.34 4-7.34c0-2.21-1.79-4-4-4z" />
            <circle cx="8" cy="5.33" r="1.33" fill="white" />
          </svg>
          <span>{hotel.location}</span>
        </div>
      </div>
      <div className="sr-hotel-card-body">
        <h3 className="sr-hotel-name">{hotel.name}</h3>
        <p className="sr-hotel-desc">{hotel.desc}</p>
        <div className="sr-hotel-tags">
          {hotel.tags.map(tag => (
            <span key={tag} className="sr-tag">{tag}</span>
          ))}
          <span className="sr-tag sr-tag-more">+2 more</span>
        </div>
        <div className="sr-hotel-divider" />
        <div className="sr-hotel-footer">
          <span className="sr-reviews">{hotel.reviews} reviews</span>
          <div className="sr-price">
            <span className="sr-price-from">From</span>
            <span className="sr-price-amount">${hotel.price}<span className="sr-price-night">/night</span></span>
          </div>
        </div>
        <Link to={`/hotel/${hotel.id}`} className="sr-view-btn">View Details</Link>
      </div>
    </div>
  );
}

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const buildParams = () => {
    const p = {};
    const locationVal = searchParams.get('location');
    const checkInVal = searchParams.get('check_in');
    const checkOutVal = searchParams.get('check_out');
    const ratingVal = searchParams.get('rating');
    const purposeVal = searchParams.get('travel_purpose');
    const eventVal = searchParams.get('event');
    if (locationVal) p.location = locationVal;
    if (checkInVal) p.check_in = checkInVal;
    if (checkOutVal) p.check_out = checkOutVal;
    if (ratingVal) p.rating = ratingVal;
    if (purposeVal) p.travel_purpose = purposeVal;
    if (eventVal) p.event = eventVal;
    return p;
  };

  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [checkIn, setCheckIn] = useState(searchParams.get('check_in') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('check_out') || '');
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 2);
  const [rooms, setRooms] = useState(Number(searchParams.get('rooms')) || 1);
  const [selectedRating, setSelectedRating] = useState(searchParams.get('rating') ? Number(searchParams.get('rating')) : null);
  const [selectedPurpose, setSelectedPurpose] = useState(searchParams.get('travel_purpose') || null);
  const [selectedEvent, setSelectedEvent] = useState(searchParams.get('event') || null);

  const queryParams = buildParams();
  const hasParams = Object.keys(queryParams).length > 0;

  const { data: rawHotels = [], isLoading: loading } = useQuery({
    queryKey: hasParams ? ['hotels', 'search', queryParams] : ['hotels', 'list'],
    queryFn: () => (hasParams ? hotelsAPI.search(queryParams) : hotelsAPI.list()).then(r => r.data.hotels || []),
  });

  const displayHotels = rawHotels.map(h => ({
    id: h.id,
    name: h.name,
    location: h.location || h.city || '',
    desc: h.description || '',
    price: h.min_room_price || 0,
    rating: h.rating || 0,
    reviews: h.total_reviews || 0,
    image: h.image || '',
    tags: h.amenities ? h.amenities.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3) : [],
  }));

  const handleSidebarSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (checkIn) params.set('check_in', checkIn);
    if (checkOut) params.set('check_out', checkOut);
    if (guests) params.set('guests', guests);
    if (rooms) params.set('rooms', rooms);
    if (selectedRating) params.set('rating', selectedRating);
    if (selectedPurpose) params.set('travel_purpose', selectedPurpose);
    if (selectedEvent) params.set('event', selectedEvent);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="sr-page">
      <div className="sr-layout">
        {/* ===== RESULTS ===== */}
        <main className="sr-main">
          {loading ? (
            <div className="loading-screen">
              <div className="spinner spinner-lg" />
              <p>Searching hotels...</p>
            </div>
          ) : (
            <>
              <div className="sr-main-header">
                <div>
                  <h1 className="sr-main-title">Curated Luxury Hotels</h1>
                  <p className="sr-main-subtitle">{displayHotels.length} premium {displayHotels.length === 1 ? 'property' : 'properties'} match your preferences</p>
                </div>
                <div className="sr-sort-btn">
                  <span>Sort by: Filtered</span>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="#1A2B49" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              {displayHotels.length === 0 ? (
                <div className="empty-state">
                  <h3>No hotels found</h3>
                  <p>Try adjusting your search filters or explore different destinations.</p>
                </div>
              ) : (
                <div className="sr-hotels-grid">
                  {displayHotels.map(hotel => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
