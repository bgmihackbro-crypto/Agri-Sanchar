
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
    window.dispatchEvent(new CustomEvent('new-message', { detail: { groupId } }));
};

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// --- Bot Simulation ---

export const BOT_USER = {
    id: 'bot-farmer-1',
    name: 'Gurpreet Singh',
    avatar: 'https://picsum.photos/seed/gurpreet/40/40'
};

export const EXPERT_BOT_USER = {
    id: 'bot-expert-1',
    name: 'Dr. Anjali Verma',
    avatar: 'https://picsum.photos/seed/expert-1/40/40'
};

const BOT_REPLIES = [
    "That's interesting. I had a similar problem last year with my crops.",
    "Thanks for sharing this with the group!",
    "Looks good! My crop is also doing well this season.",
    "I'm not sure about that, has anyone else seen this before?",
    "Good advice. I will try this.",
    "Can you share more details?",
];

const maybeTriggerBotReply = (groupId: string, messageAuthorId: string, isDirectMessage: boolean) => {
    // Don't let bots reply to themselves
    if (messageAuthorId === BOT_USER.id || messageAuthorId === EXPERT_BOT_USER.id) {
        return;
    }

    const shouldReply = Math.random() > 0.4;
    if (!shouldReply) return;
    
    const delay = Math.random() * 2000 + 1000; // 1-3 second delay

    setTimeout(() => {
        let botMessage: Message;
        if (isDirectMessage) {
            botMessage = {
                id: uuidv4(),
                author: EXPERT_BOT_USER,
                text: "Thanks for reaching out. How can I help you today?",
                timestamp: Timestamp.now(),
            };
        } else {
             botMessage = {
                id: uuidv4(),
                author: BOT_USER,
                text: BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)],
                timestamp: Timestamp.now(),
            };
        }
        
        const messages = getStoredMessages(groupId);
        const updatedMessages = [...messages, botMessage];
        setStoredMessages(groupId, updatedMessages);
        window.dispatchEvent(new CustomEvent('new-message', { detail: { groupId } }));

    }, delay);
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
    
    // 3. Trigger the bot simulation
    // We can crudely check if it's a DM by the group name format
    const isDirectMessage = groupId.startsWith('dm-');
    maybeTriggerBotReply(groupId, author.id, isDirectMessage);
};


/**
 * Listens for real-time updates to messages in a group using localStorage.
 * This simulates onSnapshot by listening to 'storage' and custom 'new-message' events.
 * @returns An unsubscribe function.
 */
export const listenToMessages = (groupId: string, callback: (messages: Message[]) => void) => {
    
    // Initial call
    callback(getStoredMessages(groupId).sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis()));

    const handleUpdate = (event: Event) => {
        const customEvent = event as CustomEvent;
        // Check for storage events from other tabs OR custom events from this tab
        const storageEvent = event as StorageEvent;
        if ( (event.type === 'storage' && (storageEvent.key === null || storageEvent.key === `chat_${groupId}` || storageEvent.key === 'groups')) ||
             (event.type === 'new-message' && customEvent.detail.groupId === groupId) )
        {
             callback(getStoredMessages(groupId).sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis()));
        }
    };
    
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('new-message', handleUpdate);

    // Cleanup subscription on unmount
    return () => {
        window.removeEventListener('storage', handleUpdate);
        window.removeEventListener('new-message', handleUpdate);
    };
};

/**
 * Deletes all messages for a specific group chat from localStorage.
 */
export const clearChat = (groupId: string): void => {
    if (typeof window === 'undefined') return;
    
    // Remove the chat messages for the group
    localStorage.removeItem(`chat_${groupId}`);
    
    // Dispatch an event to notify the UI to update
    window.dispatchEvent(new CustomEvent('new-message', { detail: { groupId } }));
};
