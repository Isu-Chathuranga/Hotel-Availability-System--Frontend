import { useQuery } from '@tanstack/react-query';
import { roomsAPI } from '../utils/api';

export function useRooms(hotelId) {
  return useQuery({
    queryKey: ['rooms', hotelId],
    queryFn: () => roomsAPI.list(hotelId).then(r => r.data.rooms || []),
    enabled: !!hotelId,
  });
}
