
import { db, storage } from '@/lib/firebase';
import {
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    query,
    orderBy,
    doc,
    getDoc,
    Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import type { Group } from './groups';


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

/**
 * Sends a message to a group chat, handling file uploads if necessary.
 */
export const sendMessage = async ({ groupId, author, text, file, onProgress }: SendMessagePayload): Promise<void> => {
    let mediaUrl: string | undefined = undefined;
    let mediaType: string | undefined = undefined;

    // 1. If there's a file, upload it first
    if (file) {
        const fileId = uuidv4();
        const storageRef = ref(storage, `group-chats/${groupId}/${fileId}-${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise<void>((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress(progress);
                },
                (error) => {
                    console.error("Upload failed:", error);
                    reject(error);
                },
                async () => {
                    try {
                        mediaUrl = await getDownloadURL(uploadTask.snapshot.ref);
                        mediaType = file.type;
                        resolve();
                    } catch (error) {
                        console.error("Failed to get download URL:", error);
                        reject(error);
                    }
                }
            );
        });
    }

    // 2. Add the message to Firestore
    if (!text && !mediaUrl) {
      throw new Error("Cannot send an empty message.");
    }
    
    await addDoc(collection(db, `groups/${groupId}/messages`), {
        author,
        text,
        timestamp: serverTimestamp(),
        ...(mediaUrl && { mediaUrl }),
        ...(mediaType && { mediaType }),
    });
};


/**
 * Listens for real-time updates to messages in a group.
 * @returns An unsubscribe function.
 */
export const listenToMessages = (groupId: string, callback: (messages: Message[]) => void) => {
    const q = query(collection(db, `groups/${groupId}/messages`), orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as Message));
        callback(messages);
    });

    return unsubscribe;
};

/**
 * Fetches the details of a single group.
 */
export const getGroup = async (groupId: string): Promise<Group | null> => {
    const docRef = doc(db, 'groups', groupId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Group;
    } else {
        return null;
    }
}
