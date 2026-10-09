import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

function formatPrivateKey(key?: string) {
  if (!key) return key;
  let formatted = key.trim().replace(/^["']|["']$/g, '');
  formatted = formatted.replace(/\\n/g, '\n');
  if (!formatted.includes('\n')) {
    const b = formatted.match(/-----BEGIN [A-Z ]+-----/);
    const e = formatted.match(/-----END [A-Z ]+-----/);
    if (b && e) {
      const bStr = b[0];
      const eStr = e[0];
      let body = formatted.substring(formatted.indexOf(bStr) + bStr.length, formatted.indexOf(eStr));
      body = body.replace(/\s+/g, '\n');
      formatted = `${bStr}\n${body.trim()}\n${eStr}\n`;
    }
  }
  return formatted;
}

const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim().replace(/^["']|["']$/g, '');
const privateKey = formatPrivateKey(process.env.GOOGLE_PRIVATE_KEY);

if (!clientEmail || !privateKey) {
  console.warn("Google Drive credentials not found in environment variables.");
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

export const drive = google.drive({ version: 'v3', auth });

/**
 * Searches for a file or folder by name inside a specific parent folder.
 */
export async function getFileIdByName(fileName: string, parentFolderId: string): Promise<string | null> {
  try {
    const res = await drive.files.list({
      q: `'${parentFolderId}' in parents and name = '${fileName}' and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });
    const files = res.data.files;
    if (files && files.length > 0) {
      return files[0].id || null;
    }
    return null;
  } catch (error: any) {
    console.error(`Error finding ${fileName}: Status=${error.status || error.code}, Message=${error.message}`);
    return null;
  }
}

/**
 * Downloads and parses a JSON file from Drive.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function downloadJsonFile(fileId: string): Promise<any> {
  try {
    const res = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'text' }
    );
    // Google API returns string for text response
    if (typeof res.data === 'string') {
        return JSON.parse(res.data);
    }
    return res.data;
  } catch (error) {
    console.error(`Error downloading file ${fileId}:`, error);
    return null;
  }
}

/**
 * Returns the public test content (questions only).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getMockTestContent(testId: string) {
  if (process.env.NODE_ENV === 'development') {
    const folderName = testId === 'TEST001' ? 'IELTS Mock Test 001 - 90 Minutes' : testId;
    const folderPath = path.join(process.cwd(), folderName);
    
    const readJson = (file: string) => {
      const filePath = path.join(folderPath, file);
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      return null;
    };

    return {
      test: readJson('test.json'),
      listening: readJson('listening.json'),
      reading: readJson('reading.json'),
      writing: readJson('writing.json'),
      speaking: readJson('speaking.json'),
    };
  }

  // Currently assuming TEST001 maps to the folder ID in env.
  // In a real multi-test system, this would lookup the folder ID from Supabase based on testId.
  const folderId = process.env.GOOGLE_DRIVE_TEST001_FOLDER_ID?.trim().replace(/^"|"$/g, '');
  if (!folderId) throw new Error("Google Drive Folder ID not configured.");

  const [testIdStr, listeningId, readingId, writingId, speakingId] = await Promise.all([
    getFileIdByName('test.json', folderId),
    getFileIdByName('listening.json', folderId),
    getFileIdByName('reading.json', folderId),
    getFileIdByName('writing.json', folderId),
    getFileIdByName('speaking.json', folderId),
  ]);

  const [test, listening, reading, writing, speaking] = await Promise.all([
    testIdStr ? downloadJsonFile(testIdStr) : null,
    listeningId ? downloadJsonFile(listeningId) : null,
    readingId ? downloadJsonFile(readingId) : null,
    writingId ? downloadJsonFile(writingId) : null,
    speakingId ? downloadJsonFile(speakingId) : null,
  ]);

  if (!test) {
    let safeErrorCode = 'TEST_FILE_NOT_FOUND';
    try {
      // 1. Try to get the folder itself
      const folderRes = await drive.files.get({
        fileId: folderId,
        fields: 'id, name',
      });
      
      // 2. If folder get succeeds, try listing contents
      const listRes = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name)',
        spaces: 'drive',
      });
      const files = listRes.data.files || [];
      const fileNames = files.map((f: any) => f.name).join(', ');
      
      console.error(`[Drive Diagnostics] Folder '${folderRes.data.name}' accessed successfully.`);
      console.error(`[Drive Diagnostics] Files found in folder: [${fileNames}].`);
      console.error(`[Drive Diagnostics] 'test.json' was not found among these files.`);
    } catch (error: any) {
      const statusCode = error.code || error.status;
      if (statusCode === 401 || statusCode === 400) {
        safeErrorCode = 'AUTH_ERROR';
        console.error(`[Drive Diagnostics] Auth failed (${statusCode}). Message: ${error.message}`);
      } else if (statusCode === 403) {
        safeErrorCode = 'PERMISSION_DENIED';
        console.error(`[Drive Diagnostics] Permission denied (403). Service account lacks viewer access to the folder.`);
      } else if (statusCode === 404) {
        safeErrorCode = 'FOLDER_NOT_FOUND';
        console.error(`[Drive Diagnostics] Folder not found (404). Folder ID may be incorrect or unshared.`);
      } else {
        safeErrorCode = 'API_ERROR';
        console.error(`[Drive Diagnostics] API Error (${statusCode}): ${error.message}`);
      }
    }

    return { 
      test: null, 
      listening: null, 
      reading: null, 
      writing: null, 
      speaking: null, 
      _diagnostic_code: safeErrorCode 
    };
  }

  return { test, listening, reading, writing, speaking };
}

/**
 * Returns ONLY the private Answer Keys (kept server-side).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getPrivateAnswerKeys(testId: string) {
  if (process.env.NODE_ENV === 'development') {
    const folderName = testId === 'TEST001' ? 'IELTS Mock Test 001 - 90 Minutes' : testId;
    const answerKeysPath = path.join(process.cwd(), folderName, 'Answer Keys');
    
    const readJson = (file: string) => {
      const filePath = path.join(answerKeysPath, file);
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      return null;
    };

    return {
      listening_answers: readJson('listening_answers.json'),
      reading_answers: readJson('reading_answers.json'),
    };
  }

  const rootFolderId = process.env.GOOGLE_DRIVE_TEST001_FOLDER_ID?.trim().replace(/^"|"$/g, '');
  if (!rootFolderId) throw new Error("Google Drive Folder ID not configured.");

  const answerKeysFolderId = await getFileIdByName('Answer Keys', rootFolderId);
  if (!answerKeysFolderId) {
      throw new Error("Answer Keys folder not found in Drive.");
  }

  const [listeningAnswersId, readingAnswersId] = await Promise.all([
    getFileIdByName('listening_answers.json', answerKeysFolderId),
    getFileIdByName('reading_answers.json', answerKeysFolderId),
  ]);

  const [listening_answers, reading_answers] = await Promise.all([
    listeningAnswersId ? downloadJsonFile(listeningAnswersId) : null,
    readingAnswersId ? downloadJsonFile(readingAnswersId) : null,
  ]);

  return { listening_answers, reading_answers };
}
