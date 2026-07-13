import { useQuery } from '@tanstack/react-query';
import { hotelsAPI } from '../utils/api';

export function useHotels(params) {
  return useQuery({
    queryKey: ['hotels', params],
    queryFn: () => hotelsAPI.list().then(r => r.data.hotels || []),
    enabled: !params,
  });
}

export function useHotelSearch(params) {
  return useQuery({
    queryKey: ['hotels', 'search', params],
    queryFn: () => hotelsAPI.search(params).then(r => r.data.hotels || []),
    enabled: !!params && Object.keys(params).length > 0,
  });
}

export function useHotel(id) {
  return useQuery({
    queryKey: ['hotel', id],
    queryFn: () => hotelsAPI.get(id).then(r => r.data.hotel),
    enabled: !!id,
  });
}
