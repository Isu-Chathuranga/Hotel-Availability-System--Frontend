import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOwnerBookings } from '../hooks/useBookings';
import { useOwnerHotels, useAddHotelImage, useDeleteHotelImage } from '../hooks/useHotels';
import { useEvents, useCreateEvent, useDeleteEvent } from '../hooks/useEvents';
import { usePlaces, useCreatePlace, useDeletePlace } from '../hooks/usePlaces';
import { useRooms, useCreateRoom, useDeleteRoom } from '../hooks/useRooms';
import './HotelOwnerDashboard.css';

const statusColors = {
  pending: '#F59E0B',
  confirmed: '#1976D2',
  cancelled: '#D32F2F',
};

const statusLabels = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  cancelled: 'CANCELLED',
};

const statusTextColors = {
  pending: 'white',
  confirmed: 'white',
  cancelled: 'white',
};

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
});

const placeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  distance: z.string().min(1, 'Distance is required'),
});

const roomSchema = z.object({
  room_type: z.string().min(1, 'Room type is required'),
  price: z.string().min(1, 'Price is required'),
  capacity: z.string().min(1, 'Capacity is required'),
  description: z.string().optional(),
});

const imageSchema = z.object({
  image_url: z.string().optional(),
});

export default function HotelOwnerDashboard() {
  const navigate = useNavigate();
  const { data: bookings = [], isLoading: loading } = useOwnerBookings();
  const { data: hotels = [] } = useOwnerHotels();
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const selectedHotel = hotels.find(h => h.id === selectedHotelId) || null;

  const { data: events = [], isLoading: eventsLoading } = useEvents(selectedHotelId);
  const { data: places = [], isLoading: placesLoading } = usePlaces(selectedHotelId);
  const { data: rooms = [], isLoading: roomsLoading } = useRooms(selectedHotelId);
  const addHotelImage = useAddHotelImage();
  const deleteHotelImage = useDeleteHotelImage();
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();
  const createPlace = useCreatePlace();
  const deletePlace = useDeletePlace();
  const createRoom = useCreateRoom();
  const deleteRoom = useDeleteRoom();

  const [tab, setTab] = useState('bookings');
  const [uploadMode, setUploadMode] = useState('file');
  const [selectedFile, setSelectedFile] = useState(null);

  const { register: regEvent, handleSubmit: handleEventSubmit, formState: { errors: eventErrors }, reset: resetEvent } = useForm({
    resolver: zodResolver(eventSchema),
  });
  const { register: regPlace, handleSubmit: handlePlaceSubmit, formState: { errors: placeErrors }, reset: resetPlace } = useForm({
    resolver: zodResolver(placeSchema),
  });
  const { register: regImage, handleSubmit: handleImageSubmit, formState: { errors: imageErrors }, reset: resetImage } = useForm({
    resolver: zodResolver(imageSchema),
  });
  const { register: regRoom, handleSubmit: handleRoomSubmit, formState: { errors: roomErrors }, reset: resetRoom } = useForm({
    resolver: zodResolver(roomSchema),
  });

  const stats = {
    total: bookings.length,
    avgRating: selectedHotel?.rating || 4.0,
    totalReviews: 0,
  };

  const onEventSubmit = async (data) => {
    await createEvent.mutateAsync({ ...data, hotel_id: selectedHotelId });
    resetEvent();
  };

  const onPlaceSubmit = async (data) => {
    await createPlace.mutateAsync({ ...data, hotel_id: selectedHotelId });
    resetPlace();
  };

  const onImageSubmit = async (data) => {
    if (uploadMode === 'file') {
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append('hotel_id', selectedHotelId);
      formData.append('image', selectedFile);
      await addHotelImage.mutateAsync(formData);
    } else {
      if (!data.image_url) return;
      await addHotelImage.mutateAsync({ hotel_id: selectedHotelId, image_url: data.image_url });
    }
    resetImage();
    setSelectedFile(null);
  };

  const onRoomSubmit = async (data) => {
    await createRoom.mutateAsync({ ...data, hotel_id: selectedHotelId, price: Number(data.price), capacity: Number(data.capacity) });
    resetRoom();
  };

  const renderBookingList = () => (
    <div className="hod-booking-list">
      {loading ? (
        <div className="loading-screen"><div className="spinner spinner-lg" /></div>
      ) : bookings.length === 0 ? (
        <p className="hod-empty">No bookings yet</p>
      ) : (
        bookings.map((b) => {
          const guestName = b.guest_name || b.user_name || 'Guest';
          const initial = guestName.charAt(0).toUpperCase();
          const status = b.status || 'pending';
          return (
            <div
              key={b.id}
              className="hod-booking-card"
              onClick={() => navigate(`/hotel-owner-booking/${b.booking_code}`)}
            >
              <div className="hod-booking-top">
                <div className="hod-booking-user">
                  <div className="hod-avatar">{initial}</div>
                  <div>
                    <div className="hod-guest-name">{guestName}</div>
                    <div className="hod-booking-id">Booking ID: {b.booking_code}</div>
                  </div>
                </div>
                <div className="hod-status-badge" style={{ background: statusColors[status] || '#1976D2' }}>
                  <span style={{ color: statusTextColors[status] || 'white' }}>{statusLabels[status] || status.toUpperCase()}</span>
                </div>
              </div>
              <div className="hod-booking-details">
                <div className="hod-bd-item">
                  <span className="hod-bd-label">Room</span>
                  <span className="hod-bd-value">{b.room_type}</span>
                </div>
                <div className="hod-bd-item">
                  <span className="hod-bd-label">Hotel</span>
                  <span className="hod-bd-value">{b.hotel_name}</span>
                </div>
                <div className="hod-bd-item">
                  <span className="hod-bd-label">Check-in</span>
                  <span className="hod-bd-value">{b.check_in}</span>
                </div>
                <div className="hod-bd-item">
                  <span className="hod-bd-label">Check-out</span>
                  <span className="hod-bd-value">{b.check_out}</span>
                </div>
                <div className="hod-bd-item">
                  <span className="hod-bd-label">Total</span>
                  <span className="hod-bd-value">${b.total_price || 0}</span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderEvents = () => (
    <div>
      <div className="hod-mgmt-form">
        <h3 className="hod-mgmt-title">Add Event</h3>
        <form onSubmit={handleEventSubmit(onEventSubmit)}>
          <div className="hod-mgmt-row">
            <input className="hod-input" placeholder="Event title" {...regEvent('title')} />
            {eventErrors.title && <span className="hod-error">{eventErrors.title.message}</span>}
          </div>
          <div className="hod-mgmt-row">
            <textarea className="hod-textarea" placeholder="Description" {...regEvent('description')} />
            {eventErrors.description && <span className="hod-error">{eventErrors.description.message}</span>}
          </div>
          <div className="hod-mgmt-row">
            <input className="hod-input" type="date" {...regEvent('date')} />
            {eventErrors.date && <span className="hod-error">{eventErrors.date.message}</span>}
          </div>
          <button className="hod-mgmt-btn" type="submit" disabled={createEvent.isPending}>
            {createEvent.isPending ? 'Adding...' : 'Add Event'}
          </button>
        </form>
      </div>
      <div className="hod-mgmt-list">
        {eventsLoading ? (
          <div className="loading-screen"><div className="spinner spinner-lg" /></div>
        ) : events.length === 0 ? (
          <p className="hod-empty">No events yet</p>
        ) : (
          events.map(ev => (
            <div key={ev.id} className="hod-mgmt-item">
              <div className="hod-mgmt-item-info">
                <strong>{ev.title}</strong> — {ev.date}
                <p className="hod-mgmt-item-desc">{ev.description}</p>
              </div>
              <button className="hod-mgmt-del" onClick={() => deleteEvent.mutate(ev.id)} disabled={deleteEvent.isPending}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderPlaces = () => (
    <div>
      <div className="hod-mgmt-form">
        <h3 className="hod-mgmt-title">Add Destination</h3>
        <form onSubmit={handlePlaceSubmit(onPlaceSubmit)}>
          <div className="hod-mgmt-row">
            <input className="hod-input" placeholder="Place name" {...regPlace('name')} />
            {placeErrors.name && <span className="hod-error">{placeErrors.name.message}</span>}
          </div>
          <div className="hod-mgmt-row">
            <textarea className="hod-textarea" placeholder="Description" {...regPlace('description')} />
            {placeErrors.description && <span className="hod-error">{placeErrors.description.message}</span>}
          </div>
          <div className="hod-mgmt-row">
            <input className="hod-input" placeholder="Distance (e.g. 2.5 km)" {...regPlace('distance')} />
            {placeErrors.distance && <span className="hod-error">{placeErrors.distance.message}</span>}
          </div>
          <button className="hod-mgmt-btn" type="submit" disabled={createPlace.isPending}>
            {createPlace.isPending ? 'Adding...' : 'Add Destination'}
          </button>
        </form>
      </div>
      <div className="hod-mgmt-list">
        {placesLoading ? (
          <div className="loading-screen"><div className="spinner spinner-lg" /></div>
        ) : places.length === 0 ? (
          <p className="hod-empty">No destinations yet</p>
        ) : (
          places.map(p => (
            <div key={p.id} className="hod-mgmt-item">
              <div className="hod-mgmt-item-info">
                <strong>{p.name}</strong> — {p.distance}
                <p className="hod-mgmt-item-desc">{p.description}</p>
              </div>
              <button className="hod-mgmt-del" onClick={() => deletePlace.mutate(p.id)} disabled={deletePlace.isPending}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderRooms = () => (
    <div>
      <div className="hod-mgmt-form">
        <h3 className="hod-mgmt-title">Add Room</h3>
        <form onSubmit={handleRoomSubmit(onRoomSubmit)}>
          <div className="hod-mgmt-row">
            <input className="hod-input" placeholder="Room type (e.g. Deluxe Suite)" {...regRoom('room_type')} />
            {roomErrors.room_type && <span className="hod-error">{roomErrors.room_type.message}</span>}
          </div>
          <div className="hod-mgmt-row">
            <input className="hod-input" type="number" step="0.01" placeholder="Price per night" {...regRoom('price')} />
            {roomErrors.price && <span className="hod-error">{roomErrors.price.message}</span>}
          </div>
          <div className="hod-mgmt-row">
            <input className="hod-input" type="number" placeholder="Max guests" {...regRoom('capacity')} />
            {roomErrors.capacity && <span className="hod-error">{roomErrors.capacity.message}</span>}
          </div>
          <div className="hod-mgmt-row">
            <textarea className="hod-textarea" placeholder="Description (optional)" {...regRoom('description')} />
          </div>
          <button className="hod-mgmt-btn" type="submit" disabled={createRoom.isPending}>
            {createRoom.isPending ? 'Adding...' : 'Add Room'}
          </button>
        </form>
      </div>
      <div className="hod-mgmt-list">
        {roomsLoading ? (
          <div className="loading-screen"><div className="spinner spinner-lg" /></div>
        ) : rooms.length === 0 ? (
          <p className="hod-empty">No rooms yet</p>
        ) : (
          rooms.map(r => (
            <div key={r.id} className="hod-mgmt-item">
              <div className="hod-mgmt-item-info">
                <strong>{r.room_type}</strong> — ${r.price}/night, {r.capacity} guests
                {r.description && <p className="hod-mgmt-item-desc">{r.description}</p>}
              </div>
              <button className="hod-mgmt-del" onClick={() => deleteRoom.mutate(r.id)} disabled={deleteRoom.isPending}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderImages = () => (
    <div>
      <div className="hod-mgmt-form">
        <h3 className="hod-mgmt-title">Add Image</h3>
        <form onSubmit={handleImageSubmit(onImageSubmit)}>
          <div className="hod-upload-toggle">
            <button type="button" className={`hod-toggle-btn ${uploadMode === 'file' ? 'active' : ''}`} onClick={() => setUploadMode('file')}>Upload File</button>
            <button type="button" className={`hod-toggle-btn ${uploadMode === 'url' ? 'active' : ''}`} onClick={() => setUploadMode('url')}>Image URL</button>
          </div>
          {uploadMode === 'file' ? (
            <div className="hod-mgmt-row">
              <input type="file" className="hod-file-input" accept="image/jpeg,image/png,image/gif,image/webp" onChange={e => setSelectedFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="hod-mgmt-row">
              <input className="hod-input" placeholder="https://example.com/image.jpg" {...regImage('image_url')} />
              {imageErrors.image_url && <span className="hod-error">{imageErrors.image_url.message}</span>}
            </div>
          )}
          <button className="hod-mgmt-btn" type="submit" disabled={addHotelImage.isPending}>
            {addHotelImage.isPending ? 'Adding...' : 'Add Image'}
          </button>
        </form>
      </div>
      <div className="hod-mgmt-list hod-images-grid">
        {(selectedHotel?.images || []).length === 0 ? (
          <p className="hod-empty">No images yet</p>
        ) : (
          (selectedHotel?.images || []).map((img, idx) => (
            <div key={idx} className="hod-mgmt-item hod-image-item">
              <img src={img.image_url || img} alt={`Hotel ${idx + 1}`} className="hod-image-preview" />
              <button className="hod-mgmt-del" onClick={() => deleteHotelImage.mutate(img.id)} disabled={deleteHotelImage.isPending}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="hod-page">
      <header className="hod-topbar">
        <div className="hod-topbar-inner">
          <div className="hod-topbar-left">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="15" width="6" height="1" rx="0.5" stroke="white" strokeWidth="2"/>
              <rect x="4" y="2" width="16" height="20" rx="1" stroke="white" strokeWidth="2"/>
            </svg>
            <span className="hod-topbar-title">Hotel Manager Dashboard</span>
          </div>
          <div className="hod-topbar-right">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2.5" y="1.67" width="15" height="12.5" rx="1.67" stroke="white" strokeWidth="1.67"/>
              <rect x="10" y="17.5" width="2.89" height="0.83" rx="0.42" stroke="white" strokeWidth="1.67"/>
            </svg>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2.5" y="2.5" width="5" height="15" rx="1.67" stroke="white" strokeWidth="1.67"/>
              <rect x="13.33" y="5.83" width="4.17" height="8.33" rx="1.67" stroke="white" strokeWidth="1.67"/>
            </svg>
          </div>
        </div>
      </header>

      <div className="hod-content">
        <div className="hod-content-inner">
          <h1 className="hod-welcome">Welcome back!</h1>
          <p className="hod-sub">Here's what's happening with your hotel today</p>

          {/* HOTEL SELECTOR */}
          {(hotels.length > 0) && (
            <div className="hod-selector">
              <label className="hod-selector-label">Select Hotel:</label>
              <select
                className="hod-select"
                value={selectedHotelId || ''}
                onChange={e => setSelectedHotelId(Number(e.target.value))}
              >
                <option value="" disabled>-- Choose a hotel --</option>
                {hotels.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* STATS */}
          <div className="hod-stats">
            <div className="hod-stat-card">
              <div>
                <div className="hod-stat-label">Total Bookings</div>
                <div className="hod-stat-value">{stats.total}</div>
              </div>
              <div className="hod-stat-icon hod-stat-icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="#155DFC" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            <div className="hod-stat-card">
              <div>
                <div className="hod-stat-label">Average Rating</div>
                <div className="hod-stat-value">{stats.avgRating}</div>
              </div>
              <div className="hod-stat-icon hod-stat-icon-yellow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="19.07" rx="2" stroke="#D08700" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            <div className="hod-stat-card">
              <div>
                <div className="hod-stat-label">Total Reviews</div>
                <div className="hod-stat-value">{stats.totalReviews}</div>
              </div>
              <div className="hod-stat-icon hod-stat-icon-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#00A63E" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="hod-tabs">
            <button className={`hod-tab ${tab === 'bookings' ? 'hod-tab-active' : ''}`} onClick={() => setTab('bookings')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2.67" width="12" height="12" rx="1.33" stroke="currentColor" strokeWidth="1.33"/>
              </svg>
              Bookings
            </button>
            <button className={`hod-tab ${tab === 'events' ? 'hod-tab-active' : ''}`} onClick={() => setTab('events')} disabled={!selectedHotelId}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1.33" y="2" width="13.33" height="12" rx="1.33" stroke="currentColor" strokeWidth="1.33"/>
              </svg>
              Events
            </button>
            <button className={`hod-tab ${tab === 'places' ? 'hod-tab-active' : ''}`} onClick={() => setTab('places')} disabled={!selectedHotelId}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1.33" y="1.33" width="13.33" height="13.33" rx="1.33" stroke="currentColor" strokeWidth="1.33"/>
              </svg>
              Destinations
            </button>
            <button className={`hod-tab ${tab === 'rooms' ? 'hod-tab-active' : ''}`} onClick={() => setTab('rooms')} disabled={!selectedHotelId}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="1.33" width="12" height="13.33" rx="1.33" stroke="currentColor" strokeWidth="1.33"/>
              </svg>
              Rooms
            </button>
            <button className={`hod-tab ${tab === 'images' ? 'hod-tab-active' : ''}`} onClick={() => setTab('images')} disabled={!selectedHotelId}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1.33" y="1.33" width="13.33" height="13.33" rx="1.33" stroke="currentColor" strokeWidth="1.33"/>
              </svg>
              Images
            </button>
          </div>

          {tab === 'bookings' && renderBookingList()}
          {tab === 'events' && selectedHotelId && renderEvents()}
          {tab === 'places' && selectedHotelId && renderPlaces()}
          {tab === 'rooms' && selectedHotelId && renderRooms()}
          {tab === 'images' && selectedHotelId && renderImages()}
        </div>
      </div>
    </div>
  );
}
