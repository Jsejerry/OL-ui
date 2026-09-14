import { createContext, useContext } from 'react';
export const DeliveryLocationContext = createContext<{ location: string; edit: () => void; setLocation: (value: string) => void }>({ location: 'Latur, Maharashtra', edit: () => {}, setLocation: () => {} });
export const useDeliveryLocation = () => useContext(DeliveryLocationContext);