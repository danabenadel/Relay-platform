const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log(' Seeding database...');
  
  await prisma.executionLog.deleteMany({});
  await prisma.area.deleteMany({});
  await prisma.userService.deleteMany({});
  await prisma.action.deleteMany({});
  await prisma.reaction.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.user.deleteMany({});

  console.log(' Données existantes supprimées');

  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      username: 'testuser',
      password: hashedPassword,
      isConfirmed: true
    }
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@area.com',
      username: 'admin',
      password: hashedPassword,
      isConfirmed: true
    }
  });

  console.log(` Utilisateurs créés: ${testUser.email}, ${adminUser.email}`);

  const gmailService = await prisma.service.create({
    data: {
      name: 'gmail',
      description: 'Gmail service for email automation',
      authType: 'oauth2',
      isActive: true,
      configSchema: {
        required: ['client_id', 'client_secret'],
        properties: {
          client_id: { type: 'string' },
          client_secret: { type: 'string' }
        }
      }
    }
  });

  const slackService = await prisma.service.create({
    data: {
      name: 'slack',
      description: 'Slack service for team communication',
      authType: 'oauth2',
      isActive: true,
      configSchema: {
        required: ['bot_token'],
        properties: {
          bot_token: { type: 'string' },
          signing_secret: { type: 'string' }
        }
      }
    }
  });

  console.log(` Services créés: ${gmailService.name}, ${slackService.name}`);

  const newEmailAction = await prisma.action.create({
    data: {
      serviceId: gmailService.id,
      name: 'new_email_received',
      description: 'Triggered when a new email is received',
      triggerType: 'webhook',
      configSchema: {
        properties: {
          sender_filter: { type: 'string' },
          subject_filter: { type: 'string' }
        }
      }
    }
  });

  const sendSlackMessage = await prisma.reaction.create({
    data: {
      serviceId: slackService.id,
      name: 'send_message',
      description: 'Send a message to a Slack channel',
      configSchema: {
        required: ['channel', 'message'],
        properties: {
          channel: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  });

  console.log(` Action créée: ${newEmailAction.name}`);
  console.log(` Réaction créée: ${sendSlackMessage.name}`);

  const testArea = await prisma.area.create({
    data: {
      userId: testUser.id,
      name: 'Gmail to Slack',
      description: 'Send Slack notification when important email arrives',
      actionId: newEmailAction.id,
      actionConfig: {
        sender_filter: '@important-client.com',
        subject_filter: 'URGENT'
      },
      reactionId: sendSlackMessage.id,
      reactionConfig: {
        channel: '#alerts',
        message: 'Important email received from {{sender}}: {{subject}}'
      },
      isActive: true
    }
  });

  console.log(` AREA créée: ${testArea.name}`);

  console.log(' Seeding completed successfully!');
  
  console.log('\n Résumé:');
  console.log(`- ${await prisma.user.count()} utilisateurs`);
  console.log(`- ${await prisma.service.count()} services`);
  console.log(`- ${await prisma.action.count()} actions`);
  console.log(`- ${await prisma.reaction.count()} réactions`);
  console.log(`- ${await prisma.area.count()} AREA`);
}

main()
  .catch((e) => {
    console.error(' Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
