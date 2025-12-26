
import {
  NewEmailReceivedAction,
  newEmailReceivedSchema,
  NewEmailReceivedConfig,
  NewEmailReceivedOutput
} from './newEmailReceived';

import {
  EmailWithAttachmentAction,
  emailWithAttachmentSchema,
  EmailWithAttachmentConfig,
  EmailWithAttachmentOutput
} from './emailWithAttachment';

import {
  EmailFromSenderAction,
  emailFromSenderSchema,
  EmailFromSenderConfig,
  EmailFromSenderOutput
} from './emailFromSender';

import {
  NewDriveFileAction,
  newDriveFileSchema,
  NewDriveFileConfig,
  NewDriveFileOutput
} from './newDriveFile';

export {
  NewEmailReceivedAction,
  newEmailReceivedSchema,
  NewEmailReceivedConfig,
  NewEmailReceivedOutput,
  EmailWithAttachmentAction,
  emailWithAttachmentSchema,
  EmailWithAttachmentConfig,
  EmailWithAttachmentOutput,
  EmailFromSenderAction,
  emailFromSenderSchema,
  EmailFromSenderConfig,
  EmailFromSenderOutput,
  NewDriveFileAction,
  newDriveFileSchema,
  NewDriveFileConfig,
  NewDriveFileOutput
};

export const GOOGLE_ACTIONS = {
  google_new_email_received: NewEmailReceivedAction,
  google_email_with_attachment: EmailWithAttachmentAction,
  google_email_from_sender: EmailFromSenderAction,
  google_new_drive_file: NewDriveFileAction
};

export function getAllActionMetadata() {
  return [
    NewEmailReceivedAction.getMetadata(),
    EmailWithAttachmentAction.getMetadata(),
    EmailFromSenderAction.getMetadata(),
    NewDriveFileAction.getMetadata()
  ];
}

export function getActionById(actionId: string) {
  return GOOGLE_ACTIONS[actionId as keyof typeof GOOGLE_ACTIONS];
}

export function validateActionConfig(actionId: string, config: any): boolean {
  const ActionClass = getActionById(actionId);

  if (!ActionClass) {
    throw new Error(`Unknown action: ${actionId}`);
  }

  const action = new (ActionClass as any)(null);

  if (typeof action.validateConfig === 'function') {
    return action.validateConfig(config);
  }

  return true;
}

export const GOOGLE_ACTIONS_SUMMARY = {
  service: 'google',
  name: 'Google',
  description: 'Triggers for Gmail and Google Drive',
  totalActions: Object.keys(GOOGLE_ACTIONS).length,
  categories: {
    gmail: [
      'google_new_email_received',
      'google_email_with_attachment',
      'google_email_from_sender'
    ],
    drive: [
      'google_new_drive_file'
    ]
  },
  actions: getAllActionMetadata(),
  requiredScopes: {
    gmail: [
      'https:
      'https:
      'https:
    ],
    drive: [
      'https:
      'https:
    ]
  }
};

export function getActionsByCategory(category: 'gmail' | 'drive') {
  const categoryActions = GOOGLE_ACTIONS_SUMMARY.categories[category];
  return categoryActions.map(id => ({
    id,
    metadata: getAllActionMetadata().find(m => m.id === id)
  }));
}

export function searchActions(keyword: string) {
  const lowerKeyword = keyword.toLowerCase();
  return getAllActionMetadata().filter(action =>
    action.name.toLowerCase().includes(lowerKeyword) ||
    action.description.toLowerCase().includes(lowerKeyword)
  );
}
