import { useState, useEffect } from 'react';

type Listener = (isOpen: boolean) => void;
let listeners: Listener[] = [];
let isOpen = false;

export const subscriptionModal = {
    open: () => { isOpen = true; listeners.forEach(l => l(isOpen)); },
    close: () => { isOpen = false; listeners.forEach(l => l(isOpen)); }
};

export function useSubscriptionModalStore() {
    const [open, setOpen] = useState(isOpen);
    
    useEffect(() => {
        listeners.push(setOpen);
        return () => { listeners = listeners.filter(l => l !== setOpen) };
    }, []);
    
    return { isOpen: open, ...subscriptionModal };
}
