const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/dashboard/ProfileMenu.tsx',
  'src/components/users/UsersTable.tsx',
  'src/pages/leads/components/LeadsTable.tsx',
  'src/pages/leads/components/LeadViewDrawer.tsx',
  'src/pages/leads/components/LeadFormDrawer.tsx',
  'src/components/calendar/FollowUpActionModal.tsx'
];

filesToFix.forEach(relPath => {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Ensure import exists
  if (!content.includes('getImageUrl')) {
    // figure out depth
    const depth = relPath.split('/').length - 2;
    const dots = '../'.repeat(depth) || './';
    const importStatement = `import { getImageUrl } from '${dots}utils/getImageUrl';\n`;
    
    // insert after last import
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLine = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, endOfLine + 1) + importStatement + content.slice(endOfLine + 1);
    } else {
      content = importStatement + content;
    }
    changed = true;
  }

  // Replace src={user.profileImageUrl} or similar with getImageUrl(...)
  // regex for <img src={...profileImageUrl} />
  const regex = /src=\{([a-zA-Z0-9_?.]+profileImageUrl)\}/g;
  if (regex.test(content)) {
    content = content.replace(regex, 'src={getImageUrl($1)}');
    changed = true;
  }
  
  // Replace LeadViewDrawer imageUrl assignment
  if (content.includes('imageUrl={resolvedLead?.profileImageThumbnail || resolvedLead?.profileImageUrl}')) {
     content = content.replace('imageUrl={resolvedLead?.profileImageThumbnail || resolvedLead?.profileImageUrl}', 'imageUrl={getImageUrl(resolvedLead?.profileImageThumbnail || resolvedLead?.profileImageUrl)}');
     changed = true;
  }
  
  if (content.includes('imageUrl={hydratedLead?.profileImageUrl || hydratedLead?.profileImageThumbnail}')) {
     content = content.replace('imageUrl={hydratedLead?.profileImageUrl || hydratedLead?.profileImageThumbnail}', 'imageUrl={getImageUrl(hydratedLead?.profileImageUrl || hydratedLead?.profileImageThumbnail)}');
     changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', relPath);
  }
});
