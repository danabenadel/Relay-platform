import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedOneDrive() {
  console.log('Starting OneDrive seed...');

  const onedriveService = await prisma.service.findFirst({
    where: { name: 'onedrive' }
  });

  if (!onedriveService) {
    console.error('OneDrive service not found! Run main seed first.');
    return;
  }

  console.log('Found OneDrive service:', onedriveService);

  await prisma.action.deleteMany({
    where: { serviceId: onedriveService.id }
  });
  await prisma.reaction.deleteMany({
    where: { serviceId: onedriveService.id }
  });

  // ==================== ONEDRIVE ACTIONS (TRIGGERS) ====================

  const onedriveActionNewFileInFolder = await prisma.action.create({
    data: {
      name: 'new_file_in_folder',
      description: 'Triggers every time a new file is created in the folder you specify',
      serviceId: onedriveService.id,
      params: [{
        name: 'folder_path',
        description: 'Chemin du dossier à surveiller (ex: /Documents, /Photos). Utilisez "root" pour surveiller la racine de votre OneDrive',
        type: 'string',
        required: true
      }]
    }
  });

  const onedriveActionNewPhotoInFolder = await prisma.action.create({
    data: {
      name: 'new_photo_in_folder',
      description: 'Triggers every time a new photo is created in the folder you specify',
      serviceId: onedriveService.id,
      params: [{
        name: 'folder_path',
        description: 'Chemin du dossier contenant vos photos (ex: /Pictures, /Photos). Les formats détectés: .jpg, .jpeg, .png, .gif, .bmp, .webp, .heic',
        type: 'string',
        required: true
      }]
    }
  });

  const onedriveActionNewTaggedPhotoInFolder = await prisma.action.create({
    data: {
      name: 'new_tagged_photo_in_folder',
      description: 'Triggers every time a new photo with the tag you specify is created',
      serviceId: onedriveService.id,
      params: [
        { name: 'folder_path', description: 'Chemin du dossier à surveiller (ex: /Pictures)', type: 'string', required: true },
        { name: 'tag', description: 'Tag ou mot-clé à rechercher dans le nom du fichier (ex: "vacances", "famille", "2024")', type: 'string', required: true }
      ]
    }
  });

  const onedriveActionNewFileMatchingRegex = await prisma.action.create({
    data: {
      name: 'new_file_matching_regex',
      description: 'Triggers every time a new file whose filename matches the regular expression you specify is added',
      serviceId: onedriveService.id,
      params: [
        { name: 'folder_path', description: 'Chemin du dossier à surveiller (ex: /Documents)', type: 'string', required: true },
        { name: 'regex', description: 'Expression régulière pour filtrer les noms de fichiers (ex: "rapport_.*\\.pdf" pour tous les rapports PDF)', type: 'string', required: true }
      ]
    }
  });

  const onedriveActionNewFileMatchingSearch = await prisma.action.create({
    data: {
      name: 'new_file_matching_search',
      description: 'Triggers every time a new file whose filename or file contents contains the words you specify',
      serviceId: onedriveService.id,
      params: [
        { name: 'folder_path', description: 'Chemin du dossier à surveiller (ex: /Documents), ou "root" pour tous les dossiers', type: 'string', required: true },
        { name: 'keywords', description: 'Mots-clés à rechercher dans le nom ou contenu du fichier (ex: "facture", "contrat", "projet")', type: 'string', required: true }
      ]
    }
  });

  const onedriveActionNewSharedFile = await prisma.action.create({
    data: {
      name: 'new_shared_file',
      description: 'Triggers every time a new file or folder is shared with you',
      serviceId: onedriveService.id,
      params: []
    }
  });

  // QUERIES
  await prisma.action.create({
    data: {
      name: 'history_files_in_folder',
      description: 'Returns a list of recent files',
      serviceId: onedriveService.id,
      params: [{
        name: 'folder_path',
        type: 'string',
        description: 'Chemin du dossier (ex: /Documents, /Downloads). Utilisez "root" pour la racine',
        required: true
      }]
    }
  });

  await prisma.action.create({
    data: {
      name: 'history_file_matching_search',
      description: 'Returns files matching keywords',
      serviceId: onedriveService.id,
      params: [
        { name: 'folder_path', type: 'string', description: 'Chemin du dossier à rechercher (ex: /Documents)', required: true },
        { name: 'keywords', type: 'string', description: 'Mots-clés à rechercher (ex: "budget 2024", "présentation")', required: true }
      ]
    }
  });

  await prisma.action.create({
    data: {
      name: 'history_shared_files',
      description: 'Returns shared files',
      serviceId: onedriveService.id,
      params: []
    }
  });

  await prisma.action.create({
    data: {
      name: 'history_photos_in_folder',
      description: 'Returns recent photos',
      serviceId: onedriveService.id,
      params: [{
        name: 'folder_path',
        type: 'string',
        description: 'Chemin du dossier contenant vos photos (ex: /Pictures, /Camera Roll)',
        required: true
      }]
    }
  });

  await prisma.action.create({
    data: {
      name: 'history_photos_with_tag',
      description: 'Returns photos with tag',
      serviceId: onedriveService.id,
      params: [
        { name: 'folder_path', type: 'string', description: 'Chemin du dossier (ex: /Pictures)', required: true },
        { name: 'tag', type: 'string', description: 'Tag dans le nom du fichier (ex: "vacances", "2024")', required: true }
      ]
    }
  });

  await prisma.action.create({
    data: {
      name: 'history_file_matching_regex',
      description: 'Returns files matching regex',
      serviceId: onedriveService.id,
      params: [
        { name: 'folder_path', type: 'string', description: 'Chemin du dossier (ex: /Documents)', required: true },
        { name: 'regex', type: 'string', description: 'Expression régulière (ex: "^rapport.*\\.pdf$")', required: true }
      ]
    }
  });

  // REACTIONS
  await prisma.reaction.create({
    data: {
      name: 'create_text_file',
      description: 'Create a new text file',
      serviceId: onedriveService.id,
      params: [
        { name: 'file_path', type: 'string', description: 'Chemin complet du fichier à créer (ex: /Documents/notes.txt, /Logs/log.txt)', required: true },
        { name: 'content', type: 'string', description: 'Contenu texte à écrire dans le fichier', required: true }
      ]
    }
  });

  await prisma.reaction.create({
    data: {
      name: 'append_to_text_file',
      description: 'Append to text file',
      serviceId: onedriveService.id,
      params: [
        { name: 'file_path', type: 'string', description: 'Chemin du fichier existant (ex: /Documents/journal.txt)', required: true },
        { name: 'content', type: 'string', description: 'Contenu à ajouter à la fin du fichier (une nouvelle ligne sera ajoutée automatiquement)', required: true }
      ]
    }
  });

  await prisma.reaction.create({
    data: {
      name: 'add_file_from_url',
      description: 'Download file from URL (30 MB limit)',
      serviceId: onedriveService.id,
      params: [
        { name: 'url', type: 'url', description: 'URL complète du fichier à télécharger (limite: 30 MB)', required: true },
        { name: 'file_path', type: 'string', description: 'Destination dans OneDrive (ex: /Downloads/image.jpg, /Documents/document.pdf)', required: true }
      ]
    }
  });

  console.log('OneDrive seed completed - 15 actions/reactions created!');
}

seedOneDrive()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
