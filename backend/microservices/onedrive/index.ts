import express, { Request, Response } from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 5010;
const BACKEND_API = process.env.BACKEND_API || 'http://server:8080';

app.use(express.json());

console.log('[ONEDRIVE] Service starting on port', PORT);
console.log('[ONEDRIVE] Backend API:', BACKEND_API);

const activeChecks = new Map<string, any>();

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'onedrive-service',
    port: PORT,
    activeChecks: activeChecks.size
  });
});

// ==================== START AUTO CHECK ====================

app.post('/start', async (req: Request, res: Response) => {
  try {
    const { userId, areaId, actionType, config, accessToken } = req.body;
    const checkId = `${userId}-${areaId}`;

    console.log('[ONEDRIVE START] User:', userId, 'Area:', areaId, 'Action:', actionType);

    if (!userId || !areaId || !actionType || !accessToken) {
      console.log('[ONEDRIVE START] ERROR - Missing fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (activeChecks.has(checkId)) {
      clearInterval(activeChecks.get(checkId).timer);
      activeChecks.delete(checkId);
      console.log('[ONEDRIVE START] Stopped existing check for', checkId);
    }

    const initialFiles = await getFiles(actionType, config, accessToken);
    console.log('[ONEDRIVE START] Initial state:', initialFiles.length, 'files');

    const timer = setInterval(async () => {
      await checkForNewFiles(checkId, userId, areaId, actionType, config, accessToken);
    }, 30000);

    activeChecks.set(checkId, {
      timer,
      config,
      lastState: initialFiles,
      accessToken,
      actionType
    });

    console.log('[ONEDRIVE START] Success - checking every 30s. Total active:', activeChecks.size);

    res.json({ success: true, message: 'Auto-check started', interval: 30 });
  } catch (error: any) {
    console.log('[ONEDRIVE START] ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==================== STOP AUTO CHECK ====================

app.post('/stop', (req: Request, res: Response) => {
  const { userId, areaId } = req.body;
  const checkId = `${userId}-${areaId}`;

  console.log('[ONEDRIVE STOP]', checkId);

  if (activeChecks.has(checkId)) {
    clearInterval(activeChecks.get(checkId).timer);
    activeChecks.delete(checkId);
    console.log('[ONEDRIVE STOP] Success. Remaining:', activeChecks.size);
    res.json({ success: true });
  } else {
    console.log('[ONEDRIVE STOP] Not found');
    res.status(404).json({ error: 'Check not found' });
  }
});

// ==================== CHECK FOR NEW FILES ====================

async function checkForNewFiles(checkId: string, userId: string, areaId: string, actionType: string, config: any, accessToken: string) {
  try {
    console.log('[ONEDRIVE CHECK]', checkId);

    const check = activeChecks.get(checkId);
    if (!check) return;

    const currentFiles = await getFiles(actionType, config, accessToken);
    const previousFiles = check.lastState;

    console.log('[ONEDRIVE CHECK] Current:', currentFiles.length, '| Previous:', previousFiles.length);

    const newFiles = currentFiles.filter((current: any) =>
      !previousFiles.some((prev: any) => prev.id === current.id)
    );

    if (newFiles.length > 0) {
      console.log('[ONEDRIVE CHECK] NEW FILES DETECTED:', newFiles.length);

      for (const file of newFiles) {
        console.log('[ONEDRIVE CHECK] New file:', file.name);
        await triggerReaction(userId, areaId, file);
      }

      check.lastState = currentFiles;
      console.log('[ONEDRIVE CHECK] State updated');
    } else {
      console.log('[ONEDRIVE CHECK] No new files');
    }
  } catch (error: any) {
    console.log('[ONEDRIVE CHECK] ERROR:', error.message);
  }
}

// ==================== GET FILES ====================

async function getFiles(actionType: string, config: any, accessToken: string): Promise<any[]> {
  const { folder_path, regex, tag } = config;

  let folderPath: string;
  if (!folder_path || folder_path === 'root' || folder_path === '/') {
    folderPath = '/me/drive/root/children';
  } else {
    const cleanPath = folder_path.startsWith('/') ? folder_path.substring(1) : folder_path;
    folderPath = `/me/drive/root:/${cleanPath}:/children`;
  }

  console.log('[ONEDRIVE] Fetching files from:', folder_path || 'root', '| API path:', folderPath);

  try {
    const response = await axios.get(`https://graph.microsoft.com/v1.0${folderPath}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        $top: 50,
        $select: 'id,name,file,createdDateTime,lastModifiedDateTime'
      }
    });

    let files = response.data.value.filter((item: any) => item.file);

    if (actionType === 'new_photo_in_folder') {
      const photoExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.heic'];
      files = files.filter((f: any) => photoExts.some(ext => f.name.toLowerCase().endsWith(ext)));
    }

    if (actionType === 'new_file_matching_regex' && regex) {
      const pattern = new RegExp(regex);
      files = files.filter((f: any) => pattern.test(f.name));
    }

    if (actionType === 'new_tagged_photo_in_folder' && tag) {
      files = files.filter((f: any) => f.name.toLowerCase().includes(tag.toLowerCase()));
    }

    return files.map((f: any) => ({
      id: f.id,
      name: f.name,
      createdDateTime: f.createdDateTime
    }));
  } catch (error: any) {
    console.log('[ONEDRIVE] ERROR fetching files');
    console.log('[ONEDRIVE] Status:', error.response?.status);
    console.log('[ONEDRIVE] Microsoft Error:', JSON.stringify(error.response?.data, null, 2));
    console.log('[ONEDRIVE] Path tried:', folderPath);
    throw error;
  }
}

// ==================== TRIGGER REACTION ====================

async function triggerReaction(userId: string, areaId: string, file: any) {
  console.log('[ONEDRIVE TRIGGER] Executing reaction for area', areaId, '- file:', file.name);

  try {
    const response = await axios.post(`${BACKEND_API}/api/areas/triggers/execute`, {
      userId,
      areaId,
      data: {
        filename: file.name,
        fileId: file.id,
        createdDateTime: file.createdDateTime,
        timestamp: new Date().toISOString()
      }
    }, { timeout: 15000 });

    console.log('[ONEDRIVE TRIGGER] Success:', response.data);
  } catch (error: any) {
    console.log('[ONEDRIVE TRIGGER] ERROR - Status:', error.response?.status);
    console.log('[ONEDRIVE TRIGGER] ERROR - Data:', error.response?.data || error.message);
    console.log('[ONEDRIVE TRIGGER] ERROR - URL tried:', `${BACKEND_API}/areas/triggers/execute`);
  }
}

// ==================== REACTIONS ====================

app.post('/reactions/create_text_file', async (req: Request, res: Response) => {
  try {
    const { accessToken, file_path, content } = req.body;

    console.log('[ONEDRIVE REACTION] create_text_file:', file_path);

    if (!accessToken || !file_path || !content) {
      console.log('[ONEDRIVE REACTION] ERROR - Missing fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cleanPath = file_path.startsWith('/') ? file_path.substring(1) : file_path;
    const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${cleanPath}:/content`;
    console.log('[ONEDRIVE REACTION] Calling Microsoft Graph API');
    console.log('[ONEDRIVE REACTION] URL:', url);
    console.log('[ONEDRIVE REACTION] Content length:', content.length);

    const response = await axios.put(url, content, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'text/plain'
      }
    });

    console.log('[ONEDRIVE REACTION] File created successfully');
    console.log('[ONEDRIVE REACTION] File ID:', response.data.id);

    res.json({ success: true, file: response.data });
  } catch (error: any) {
    console.log('[ONEDRIVE REACTION] ERROR:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create file', details: error.response?.data || error.message });
  }
});

app.post('/reactions/append_to_text_file', async (req: Request, res: Response) => {
  try {
    const { accessToken, file_path, content } = req.body;

    console.log('[ONEDRIVE REACTION] append_to_text_file:', file_path);

    if (!accessToken || !file_path || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cleanPath = file_path.startsWith('/') ? file_path.substring(1) : file_path;

    const fileResponse = await axios.get(
      `https://graph.microsoft.com/v1.0/me/drive/root:/${cleanPath}:/content`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: 'text'
      }
    );

    const existingContent = fileResponse.data;
    const newContent = existingContent + '\n' + content;

    const updateResponse = await axios.put(
      `https://graph.microsoft.com/v1.0/me/drive/root:/${cleanPath}:/content`,
      newContent,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'text/plain'
        }
      }
    );

    console.log('[ONEDRIVE REACTION] Content appended successfully');

    res.json({ success: true, file: updateResponse.data });
  } catch (error: any) {
    console.log('[ONEDRIVE REACTION] ERROR:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to append to file', details: error.response?.data || error.message });
  }
});

app.post('/reactions/add_file_from_url', async (req: Request, res: Response) => {
  try {
    const { accessToken, url, file_path } = req.body;

    console.log('[ONEDRIVE REACTION] add_file_from_url');
    console.log('[ONEDRIVE REACTION] URL:', url);
    console.log('[ONEDRIVE REACTION] Destination:', file_path);

    if (!accessToken || !url || !file_path) {
      console.log('[ONEDRIVE REACTION] ERROR - Missing fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('[ONEDRIVE REACTION] Downloading file from URL...');
    const fileResponse = await axios.get(url, {
      responseType: 'arraybuffer',
      maxContentLength: 30 * 1024 * 1024,
      timeout: 60000
    });

    const fileBuffer = Buffer.from(fileResponse.data);
    console.log('[ONEDRIVE REACTION] Downloaded', fileBuffer.length, 'bytes');

    const cleanPath = file_path.startsWith('/') ? file_path.substring(1) : file_path;
    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${cleanPath}:/content`;

    console.log('[ONEDRIVE REACTION] Uploading to OneDrive:', uploadUrl);

    const uploadResponse = await axios.put(uploadUrl, fileBuffer, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': fileResponse.headers['content-type'] || 'application/octet-stream'
      }
    });

    console.log('[ONEDRIVE REACTION] File uploaded successfully');
    console.log('[ONEDRIVE REACTION] File ID:', uploadResponse.data.id);

    res.json({ success: true, file: uploadResponse.data });
  } catch (error: any) {
    console.log('[ONEDRIVE REACTION] ERROR:', error.response?.data || error.message);
    if (error.code === 'ECONNABORTED') {
      res.status(408).json({ error: 'Download timeout (60s limit exceeded)' });
    } else if (error.message.includes('maxContentLength')) {
      res.status(413).json({ error: 'File too large (30 MB limit)' });
    } else {
      res.status(500).json({ error: 'Failed to download/upload file', details: error.response?.data || error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log('[ONEDRIVE] Service ready on port', PORT);
  console.log('[ONEDRIVE] Endpoints:');
  console.log('[ONEDRIVE]   POST /start - Start auto-check');
  console.log('[ONEDRIVE]   POST /stop - Stop auto-check');
  console.log('[ONEDRIVE]   POST /reactions/create_text_file');
  console.log('[ONEDRIVE]   POST /reactions/append_to_text_file');
  console.log('[ONEDRIVE]   POST /reactions/add_file_from_url');
  console.log('[ONEDRIVE]   GET /health');
});
