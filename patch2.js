const fs = require('fs');
let c = fs.readFileSync('frontend/src/features/notes/NoteEditor.tsx', 'utf8');

c = c.replace(
  '    setIsAddingTag(false);\r\n  };\r\n\r\n  return (',
  '    setIsAddingTag(false);\r\n  };\r\n\r\n  const handleUploadComplete = (image: any) => {\r\n    setContent((prev) => prev + `\\n\\n![Uploaded Image](${image.url})\\n`);\r\n  };\r\n\r\n  return ('
);
c = c.replace(
  '    setIsAddingTag(false);\n  };\n\n  return (',
  '    setIsAddingTag(false);\n  };\n\n  const handleUploadComplete = (image: any) => {\n    setContent((prev) => prev + `\\n\\n![Uploaded Image](${image.url})\\n`);\n  };\n\n  return ('
);

fs.writeFileSync('frontend/src/features/notes/NoteEditor.tsx', c);
