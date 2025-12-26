import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const TIMEZONE = process.env.TIMEZONE || 'UTC';
process.env.TZ = TIMEZONE;

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5001;
const BACKEND_API = process.env.BACKEND_API || "http://server:8080";

interface TimerConfig {
  userId: string;
  areaId: string;
  interval: number;
  type: 'date' | 'time' | 'countdown';
  config: {
    targetDate?: string;
    targetTime?: string;
    daysUntil?: number;
    targetDay?: string;
  };
}

const activeTimers = new Map<string, NodeJS.Timeout>();
const lastTriggered = new Map<string, number>();

app.post("/start", async (req, res) => {
  const timerConfig: TimerConfig = req.body;
  const { userId, areaId, interval, type, config } = timerConfig;

  if (!userId || !areaId || !interval) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing required fields" 
    });
  }

  const timerId = `${userId}-${areaId}`;

  if (activeTimers.has(timerId)) {
    clearInterval(activeTimers.get(timerId)!);
  }

  console.log(`Starting timer ${timerId} - Type: ${type} - Config:`, config);

  const timer = setInterval(async () => {
    try {
      const shouldTrigger = await checkTimerCondition(type, config, timerId);
      
      if (shouldTrigger) {
        await axios.post(`${BACKEND_API}/api/areas/triggers/execute`, {
          userId,
          areaId,
          actionType: 'timer',
          data: {
            type,
            timestamp: new Date().toISOString()
          }
        });
        
        console.log(`Timer triggered for AREA ${areaId}`);
      }
    } catch (error: any) {
      console.error(`Error checking timer ${timerId}:`, error.message);
    }
  }, interval * 1000);

  activeTimers.set(timerId, timer);

  res.json({ 
    success: true, 
    message: `Timer started for AREA ${areaId}`,
    timerId 
  });
});

app.post("/stop", (req, res) => {
  const { userId, areaId } = req.body;
  const timerId = `${userId}-${areaId}`;

  if (activeTimers.has(timerId)) {
    clearInterval(activeTimers.get(timerId)!);
    activeTimers.delete(timerId);
    lastTriggered.delete(timerId);
    res.json({ success: true, message: "Timer stopped" });
  } else {
    res.status(404).json({ success: false, error: "Timer not found" });
  }
});

app.get("/status", (req, res) => {
  res.json({
    success: true,
    activeTimers: activeTimers.size,
    timers: Array.from(activeTimers.keys())
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "timer" });
});

async function checkTimerCondition(
  type: string,
  config: TimerConfig['config'],
  timerId: string
): Promise<boolean> {
  const now = new Date();

  const parisFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris',
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    hour12: false
  });

  const parts = parisFormatter.formatToParts(now);
  const parisHours = parseInt(parts.find(p => p.type === 'hour')?.value || '0') % 24;
  const parisMinutes = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  const parisDay = parseInt(parts.find(p => p.type === 'day')?.value || '1');
  const parisMonth = parseInt(parts.find(p => p.type === 'month')?.value || '1');

  switch (type) {
    case 'date':
      if (config.targetDate) {
        const [day, month] = config.targetDate.split('/');
        const isMatch = parisDay === parseInt(day) && parisMonth === parseInt(month);

        if (isMatch) {
          const lastTime = lastTriggered.get(timerId) || 0;
          const timeSinceLastTrigger = Date.now() - lastTime;

          if (timeSinceLastTrigger > 86400000 || lastTime === 0) {
            lastTriggered.set(timerId, Date.now());
            return true;
          }
        }
        return false;
      }
      break;

    case 'time':
      if (config.targetTime) {
        const [hours, minutes] = config.targetTime.split(':');
        const targetMinutes = parseInt(hours) * 60 + parseInt(minutes);
        const currentMinutes = parisHours * 60 + parisMinutes;
        const diff = Math.abs(currentMinutes - targetMinutes);

        console.log(`[${timerId}] Check: Current=${parisHours}:${parisMinutes}, Target=${hours}:${minutes}, Diff=${diff}`);

        if (diff <= 1 && currentMinutes >= targetMinutes) {
          const lastTime = lastTriggered.get(timerId) || 0;
          const timeSinceLastTrigger = Date.now() - lastTime;

          if (timeSinceLastTrigger > 120000 || lastTime === 0) {
            lastTriggered.set(timerId, Date.now());
            return true;
          }
          return false;
        }
        return false;
      }
      break;

    case 'countdown':
      if (config.daysUntil !== undefined && config.targetDay) {
        const parisDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
        const futureDate = new Date(parisDate);
        futureDate.setDate(parisDate.getDate() + config.daysUntil);

        const daysOfWeek = [
          'Sunday', 'Monday', 'Tuesday', 'Wednesday',
          'Thursday', 'Friday', 'Saturday'
        ];

        const isMatch = daysOfWeek[futureDate.getDay()].toLowerCase() ===
               config.targetDay.toLowerCase();

        if (isMatch) {
          const lastTime = lastTriggered.get(timerId) || 0;
          const timeSinceLastTrigger = Date.now() - lastTime;

          if (timeSinceLastTrigger > 86400000 || lastTime === 0) {
            lastTriggered.set(timerId, Date.now());
            return true;
          }
        }
        return false;
      }
      break;
  }

  return false;
}

process.on('SIGTERM', () => {
  console.log('Stopping all timers...');
  activeTimers.forEach(timer => clearInterval(timer));
  activeTimers.clear();
  lastTriggered.clear();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Timer microservice running on port ${PORT}`);
  console.log(`Backend API: ${BACKEND_API}`);
  console.log(`Timezone: ${process.env.TZ}`);
});