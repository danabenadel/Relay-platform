import fs from 'fs';
import path from 'path';

interface SaveResultParams {
  userId: string;
  reactionType: string;
  config: any;
  result: any;
  areaId?: string;
}

export function saveResultToFile(params: SaveResultParams): string {
  const { userId, reactionType, config, result, areaId } = params;

  const outputDir = path.join(__dirname, 'outputs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const userShort = userId.slice(-8);
  const filename = `${timestamp}_${reactionType}_${userShort}.txt`;
  const filepath = path.join(outputDir, filename);

  let content = '';
  content += '='.repeat(60) + '\n';
  content += `OpenAI Result - ${reactionType}\n`;
  content += '='.repeat(60) + '\n';
  content += `Date: ${new Date().toLocaleString('fr-FR')}\n`;
  content += `User: ${userId}\n`;
  if (areaId) content += `AREA: ${areaId}\n`;
  content += `Model: ${result.model || config.model || 'N/A'}\n`;
  if (result.usage) {
    content += `Tokens: ${result.usage.total_tokens || 'N/A'}\n`;
  }
  content += '\n';

  if (config.prompt) {
    content += '-'.repeat(60) + '\n';
    content += 'PROMPT:\n';
    content += '-'.repeat(60) + '\n';
    content += config.prompt + '\n\n';
  }

  if (config.text) {
    content += '-'.repeat(60) + '\n';
    content += 'INPUT TEXT:\n';
    content += '-'.repeat(60) + '\n';
    content += config.text.substring(0, 500) + (config.text.length > 500 ? '...' : '') + '\n\n';
  }

  if (config.question) {
    content += '-'.repeat(60) + '\n';
    content += 'QUESTION:\n';
    content += '-'.repeat(60) + '\n';
    content += config.question + '\n\n';
  }

  content += '-'.repeat(60) + '\n';
  content += 'RESULT:\n';
  content += '-'.repeat(60) + '\n';

  if (result.text) {
    content += result.text + '\n';
  } else if (result.summary) {
    content += result.summary + '\n';
  } else if (result.answer) {
    content += result.answer + '\n';
  } else if (result.review) {
    content += result.review + '\n';
  } else if (result.translation) {
    content += result.translation + '\n';
  } else if (result.content) {
    content += result.content + '\n';
  } else if (result.explanation) {
    content += result.explanation + '\n';
  } else if (result.ideas) {
    content += result.ideas + '\n';
  } else {
    content += JSON.stringify(result, null, 2) + '\n';
  }

  content += '\n';
  content += '='.repeat(60) + '\n';
  content += `Saved at: ${new Date().toISOString()}\n`;
  content += '='.repeat(60) + '\n';

  fs.writeFileSync(filepath, content, 'utf-8');

  return filepath;
}