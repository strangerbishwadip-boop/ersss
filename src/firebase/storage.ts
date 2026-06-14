/**
 * Firebase Storage — File uploads for photos/videos
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseEnabled } from './config';

export async function uploadFile(path: string, file: File): Promise<string | null> {
  if (!isFirebaseEnabled() || !storage) return null;
  try {
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (e) {
    console.error('uploadFile error:', e);
    return null;
  }
}

export async function uploadMultipleFiles(path: string, files: File[]): Promise<string[]> {
  if (!isFirebaseEnabled() || !storage) return [];
  const urls: string[] = [];
  for (const file of files) {
    const url = await uploadFile(path, file);
    if (url) urls.push(url);
  }
  return urls;
}
