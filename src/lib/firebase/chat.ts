
import { Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
    id: string;
    author: {
        id: string;
        name: string;
        avatar: string;
    };
    text: string;
    timestamp: Timestamp;
    mediaUrl?: string;
    mediaType?: string;
}

interface SendMessagePayload {
    groupId: string;
    author: Message['author'];
    text: string;
    file: File | null;
    onProgress: (progress: number) => void;
}

// --- LocalStorage Chat Implementation ---

// Helper to get messages for a specific group from localStorage
const getStoredMessages = (groupId: string): Message[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`chat_${groupId}`);
    return stored ? JSON.parse(stored).map((m: any) => ({...m, timestamp: new Timestamp(m.timestamp.seconds, m.timestamp.nanoseconds)})) : [];
};

// Helper to save messages for a specific group to localStorage
const setStoredMessages = (groupId: string, messages: Message[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`chat_${groupId}`, JSON.stringify(messages));
    // Dispatch a storage event to notify other tabs/components of the change
    window.dispatchEvent(new Event('storage'));
};

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Sends a message to a group chat using localStorage, handling file uploads if necessary.
 */
export const sendMessage = async ({ groupId, author, text, file, onProgress }: SendMessagePayload): Promise<void> => {
    let mediaUrl: string | undefined = undefined;
    let mediaType: string | undefined = undefined;

    // 1. If there's a file, convert it to a data URI
    if (file) {
        onProgress(50); // Simulate progress
        mediaUrl = await fileToDataUri(file);
        mediaType = file.type;
        onProgress(100);
    }

    if (!text && !mediaUrl) {
      throw new Error("Cannot send an empty message.");
    }
    
    // 2. Add the message to localStorage
    const messages = getStoredMessages(groupId);
    const newMessage: Message = {
        id: uuidv4(),
        author,
        text,
        timestamp: Timestamp.now(),
        ...(mediaUrl && { mediaUrl }),
        ...(mediaType && { mediaType }),
    };

    const updatedMessages = [...messages, newMessage];
    setStoredMessages(groupId, updatedMessages);
};


/**
 * Listens for real-time updates to messages in a group using localStorage.
 * This simulates onSnapshot by listening to 'storage' events.
 * @returns An unsubscribe function.
 */
export const listenToMessages = (groupId: string, callback: (messages: Message[]) => void) => {
    
    // Initial call
    callback(getStoredMessages(groupId).sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis()));

    const handleStorageChange = (event: StorageEvent | Event) => {
        // The custom event won't have a key, so we check both
        const storageEvent = event as StorageEvent;
        if (storageEvent.key === null || storageEvent.key === `chat_${groupId}` || storageEvent.key === 'groups') {
             callback(getStoredMessages(groupId).sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis()));
        }
    };
    
    window.addEventListener('storage', handleStorageChange);

    // Cleanup subscription on unmount
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
};
