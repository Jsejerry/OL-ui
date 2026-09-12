import { createContext, useContext } from 'react';
export const DeliveryLocationContext = createContext({ location: 'Latur, Maharashtra', edit: () => {} });
export const useDeliveryLocation = () => useContext(DeliveryLocationContext);