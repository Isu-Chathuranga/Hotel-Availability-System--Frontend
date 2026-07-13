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
import { useAddAmenity, useDeleteAmenity } from '../hooks/useAmenities';
import { placesAPI } from '../utils/api';
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
  name: z.string().optional(),
  description: z.string().optional(),
  location_url: z.string().min(1, 'Google Maps link is required'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  distance: z.string().optional(),
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
  const addAmenity = useAddAmenity();
  const deleteAmenity = useDeleteAmenity();

  const [tab, setTab] = useState('bookings');
  const [uploadMode, setUploadMode] = useState('file');
  const [selectedFile, setSelectedFile] = useState(null);
  const [newAmenity, setNewAmenity] = useState('');

  const { register: regEvent, handleSubmit: handleEventSubmit, formState: { errors: eventErrors }, reset: resetEvent } = useForm({
    resolver: zodResolver(eventSchema),
  });
  const { register: regPlace, handleSubmit: handlePlaceSubmit, formState: { errors: placeErrors }, reset: resetPlace, setValue: setPlaceValue } = useForm({
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
    await createPlace.mutateAsync({
      ...data,
      hotel_id: selectedHotelId,
      name: data.name || 'Unknown Place',
      latitude: data.latitude ? Number(data.latitude) : null,
      longitude: data.longitude ? Number(data.longitude) : null,
    });
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
    <div className="hod-mgmt-section">
      <div className="hod-mgmt-form">
        <h3 className="hod-mgmt-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#2563EB" strokeWidth="2"/><path d="M16 2V6" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/><path d="M8 2V6" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/><path d="M3 10H21" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/></svg>
          Add Event
        </h3>
        <form onSubmit={handleEventSubmit(onEventSubmit)}>
          <div className="hod-mgmt-form-grid">
            <div className="hod-mgmt-row">
              <input className="hod-input" placeholder="Event title" {...regEvent('title')} />
              {eventErrors.title && <span className="hod-error">{eventErrors.title.message}</span>}
            </div>
            <div className="hod-mgmt-row">
              <input className="hod-input" type="date" {...regEvent('date')} />
              {eventErrors.date && <span className="hod-error">{eventErrors.date.message}</span>}
            </div>
            <div className="hod-mgmt-row hod-mgmt-row-full">
              <textarea className="hod-textarea" placeholder="Event description" {...regEvent('description')} />
              {eventErrors.description && <span className="hod-error">{eventErrors.description.message}</span>}
            </div>
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
          <div className="hod-empty">
            <div className="hod-empty-icon">📅</div>
            <p>No events scheduled yet</p>
          </div>
        ) : (
          events.map(ev => (
            <div key={ev.id} className="hod-mgmt-item">
              <div className="hod-mgmt-item-info">
                <strong>{ev.title}</strong>
                <p className="hod-mgmt-item-desc">{ev.date} — {ev.description}</p>
              </div>
              <button className="hod-mgmt-del" onClick={() => deleteEvent.mutate(ev.id)} disabled={deleteEvent.isPending}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderPlaces = () => (
    <div className="hod-mgmt-section">
      <div className="hod-mgmt-form">
        <h3 className="hod-mgmt-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Add Destination
        </h3>
        <form onSubmit={handlePlaceSubmit(onPlaceSubmit)}>
          <div className="hod-mgmt-row">
            <input className="hod-input" placeholder="Paste Google Maps link here" {...regPlace('location_url')} onBlur={async (e) => {
              regPlace('location_url').onBlur(e);
              const url = e.target.value.trim();
              if (!url) return;

              try {
                const res = await placesAPI.extract(url);
                const data = res.data;
                if (data) {
                  if (data.name) setPlaceValue('name', data.name);
                  if (data.latitude) setPlaceValue('latitude', String(data.latitude));
                  if (data.longitude) setPlaceValue('longitude', String(data.longitude));
                  if (data.display_name) setPlaceValue('description', data.display_name);
                }
              } catch (_) {}
            }} />
            {placeErrors.location_url && <span className="hod-error">{placeErrors.location_url.message}</span>}
          </div>
          <div className="hod-mgmt-form-grid">
            <div className="hod-mgmt-row">
              <input className="hod-input" placeholder="Place name (auto-detected)" {...regPlace('name')} />
            </div>
            <div className="hod-mgmt-row">
              <input className="hod-input" placeholder="Distance (e.g. 2.5 km)" {...regPlace('distance')} />
            </div>
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
          <div className="hod-empty">
            <div className="hod-empty-icon">📍</div>
            <p>No destinations added yet</p>
          </div>
        ) : (
          places.map(p => (
            <div key={p.id} className="hod-mgmt-item">
              <div className="hod-mgmt-item-info">
                <strong>{p.name}</strong>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                  {p.distance && <span className="hod-mgmt-item-dist">{p.distance}</span>}
                  {p.location_url && <span className="hod-mgmt-item-url"><a href={p.location_url} target="_blank" rel="noopener noreferrer">View on Maps</a></span>}
                  {(p.latitude && p.longitude) && <span className="hod-mgmt-item-coords">{Number(p.latitude).toFixed(4)}, {Number(p.longitude).toFixed(4)}</span>}
                </div>
                {p.description && <p className="hod-mgmt-item-desc">{p.description}</p>}
              </div>
              <button className="hod-mgmt-del" onClick={() => deletePlace.mutate(p.id)} disabled={deletePlace.isPending}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderRooms = () => (
    <div className="hod-mgmt-section">
      <div className="hod-mgmt-form">
        <h3 className="hod-mgmt-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 7V21H21V7" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7" stroke="#2563EB" strokeWidth="2"/><path d="M12 5V3" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/><rect x="7" y="10" width="4" height="4" rx="1" stroke="#2563EB" strokeWidth="2"/><rect x="13" y="10" width="4" height="4" rx="1" stroke="#2563EB" strokeWidth="2"/></svg>
          Add Room
        </h3>
        <form onSubmit={handleRoomSubmit(onRoomSubmit)}>
          <div className="hod-mgmt-form-grid">
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
              <input className="hod-input" placeholder="Room description (optional)" {...regRoom('description')} />
            </div>
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
          <div className="hod-empty">
            <div className="hod-empty-icon">🛏️</div>
            <p>No rooms added yet</p>
          </div>
        ) : (
          rooms.map(r => (
            <div key={r.id} className="hod-mgmt-item">
              <div className="hod-mgmt-item-info">
                <strong>{r.room_type}</strong> — <span style={{ color: '#059669', fontWeight: 600 }}>${r.price}</span>/night &middot; {r.capacity} guests
                {r.description && <p className="hod-mgmt-item-desc">{r.description}</p>}
              </div>
              <button className="hod-mgmt-del" onClick={() => deleteRoom.mutate(r.id)} disabled={deleteRoom.isPending}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const amenityList = typeof selectedHotel?.amenities === 'string'
    ? selectedHotel.amenities.split(',').map(a => a.trim()).filter(Boolean)
    : [];

  const handleAddAmenity = async () => {
    if (!newAmenity.trim()) return;
    await addAmenity.mutateAsync({ hotel_id: selectedHotelId, amenity: newAmenity.trim() });
    setNewAmenity('');
  };

  const renderAmenities = () => (
    <div className="hod-mgmt-section">
      <div className="hod-mgmt-form">
        <h3 className="hod-mgmt-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4.318 6.318C4.318 4.971 5.41 3.879 6.757 3.879C7.79 3.879 8.675 4.47 9.101 5.322C9.527 4.47 10.412 3.879 11.445 3.879C12.792 3.879 13.884 4.971 13.884 6.318C13.884 9.876 9.101 12.879 9.101 12.879C9.101 12.879 4.318 9.876 4.318 6.318Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 21C20 17.134 16.418 14 12 14C7.582 14 4 17.134 4 21" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Amenities
        </h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="hod-input"
            style={{ flex: 1 }}
            placeholder="Enter amenity name"
            value={newAmenity}
            onChange={e => setNewAmenity(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddAmenity(); } }}
          />
          <button className="hod-mgmt-btn" onClick={handleAddAmenity} disabled={addAmenity.isPending || !newAmenity.trim()}>
            {addAmenity.isPending ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
      {amenityList.length === 0 ? (
        <div className="hod-empty">
          <div className="hod-empty-icon">⭐</div>
          <p>No amenities added yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {amenityList.map((amenity, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#EFF6FF', border: '1px solid #BFDBFE',
              borderRadius: 8, padding: '6px 12px',
            }}>
              <span style={{ color: '#1E40AF', fontSize: 14, fontWeight: 500 }}>{amenity}</span>
              <button
                onClick={() => deleteAmenity.mutate({ hotel_id: selectedHotelId, amenity })}
                disabled={deleteAmenity.isPending}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 2, color: '#EF4444', display: 'flex',
                  fontSize: 16, lineHeight: 1, opacity: deleteAmenity.isPending ? 0.5 : 1,
                }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderImages = () => (
    <div className="hod-mgmt-section">
      <div className="hod-mgmt-form">
        <h3 className="hod-mgmt-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="2" stroke="#2563EB" strokeWidth="2"/><path d="M10 10.5C10.8284 10.5 11.5 9.82843 11.5 9C11.5 8.17157 10.8284 7.5 10 7.5C9.17157 7.5 8.5 8.17157 8.5 9C8.5 9.82843 9.17157 10.5 10 10.5Z" stroke="#2563EB" strokeWidth="2"/><path d="M21 15L16 10L5 21" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Add Image
        </h3>
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
          <div className="hod-empty" style={{ gridColumn: '1 / -1', padding: '56px 24px' }}>
            <div className="hod-empty-icon">🖼️</div>
            <p>No images added yet</p>
          </div>
        ) : (
          (selectedHotel?.images || []).map((img, idx) => (
            <div key={idx} className="hod-mgmt-item hod-image-item">
              <img src={img.image_url || img} alt={`Hotel ${idx + 1}`} className="hod-image-preview" />
              <button className="hod-mgmt-del" onClick={() => deleteHotelImage.mutate(img.id)} disabled={deleteHotelImage.isPending}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Delete
              </button>
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
            <div className="hod-topbar-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="hod-topbar-title">Hotel Manager Dashboard</span>
          </div>
          <div className="hod-topbar-right">
            <div className="hod-notif-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21C13.5542 21.3031 13.3018 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="hod-notif-badge">3</div>
            </div>
          </div>
        </div>
      </header>

      <div className="hod-content">
        <div className="hod-welcome-header">
          <div>
            <h1 className="hod-welcome">Welcome back!</h1>
            <p className="hod-sub">Here's what's happening with your hotel today</p>
          </div>
          <div className="hod-welcome-actions">
            <button className="hod-welcome-btn hod-welcome-btn-primary" onClick={() => navigate('/hotel-registration')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              New Hotel
            </button>
          </div>
        </div>

        {/* HOTEL SELECTOR */}
        {(hotels.length > 0) && (
          <div className="hod-selector-wrap">
            <div className="hod-selector-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <label className="hod-selector-label">Select Hotel:</label>
            <select
              className="hod-select"
              value={selectedHotelId || ''}
              onChange={e => setSelectedHotelId(Number(e.target.value))}
            >
              <option value="" disabled>Choose a hotel</option>
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
                <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12H15" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 16H15" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.947 20.885 8.91568 21 11V11.5Z" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="hod-tabs">
          <button className={`hod-tab ${tab === 'bookings' ? 'hod-tab-active' : ''}`} onClick={() => setTab('bookings')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Bookings
          </button>
            <button className={`hod-tab ${tab === 'events' ? 'hod-tab-active' : ''}`} onClick={() => setTab('events')} disabled={!selectedHotelId}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Events
            </button>
            <button className={`hod-tab ${tab === 'amenities' ? 'hod-tab-active' : ''}`} onClick={() => setTab('amenities')} disabled={!selectedHotelId}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4.318 6.318C4.318 4.971 5.41 3.879 6.757 3.879C7.79 3.879 8.675 4.47 9.101 5.322C9.527 4.47 10.412 3.879 11.445 3.879C12.792 3.879 13.884 4.971 13.884 6.318C13.884 9.876 9.101 12.879 9.101 12.879C9.101 12.879 4.318 9.876 4.318 6.318Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 21C20 17.134 16.418 14 12 14C7.582 14 4 17.134 4 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Amenities
            </button>
            <button className={`hod-tab ${tab === 'places' ? 'hod-tab-active' : ''}`} onClick={() => setTab('places')} disabled={!selectedHotelId}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Destinations
          </button>
          <button className={`hod-tab ${tab === 'rooms' ? 'hod-tab-active' : ''}`} onClick={() => setTab('rooms')} disabled={!selectedHotelId}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 7V21H21V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <rect x="7" y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
              <rect x="13" y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Rooms
          </button>
          <button className={`hod-tab ${tab === 'images' ? 'hod-tab-active' : ''}`} onClick={() => setTab('images')} disabled={!selectedHotelId}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 10.5C10.8284 10.5 11.5 9.82843 11.5 9C11.5 8.17157 10.8284 7.5 10 7.5C9.17157 7.5 8.5 8.17157 8.5 9C8.5 9.82843 9.17157 10.5 10 10.5Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Images
          </button>
        </div>

        {tab === 'bookings' && renderBookingList()}
        {tab === 'events' && selectedHotelId && renderEvents()}
        {tab === 'amenities' && selectedHotelId && renderAmenities()}
        {tab === 'places' && selectedHotelId && renderPlaces()}
        {tab === 'rooms' && selectedHotelId && renderRooms()}
        {tab === 'images' && selectedHotelId && renderImages()}
      </div>
    </div>
  );
}
