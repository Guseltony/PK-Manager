const fs = require('fs');
let c = fs.readFileSync('frontend/src/features/notes/NoteEditor.tsx', 'utf8');

// For NoteEditorContent hook insertion
c = c.replace(
  '    });\r\n  };\r\n\r\n  return (',
  '    });\r\n  };\r\n\r\n  const handleUploadComplete = (image: any) => {\r\n    setContent((prev) => prev + `\\n\\n![Uploaded Image](${image.url})\\n`);\r\n  };\r\n\r\n  return ('
);
c = c.replace(
  '    });\n  };\n\n  return (',
  '    });\n  };\n\n  const handleUploadComplete = (image: any) => {\n    setContent((prev) => prev + `\\n\\n![Uploaded Image](${image.url})\\n`);\n  };\n\n  return ('
);

// For NewNoteForm layout insertion
c = c.replace(
  '      </div>\r\n\r\n      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex flex-col gap-4">',
  '      </div>\r\n\r\n      <div className="px-4 sm:px-6 lg:px-8 mt-2">\r\n        <ImageUploader parentType="note" onUploadComplete={handleUploadComplete} />\r\n      </div>\r\n\r\n      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex flex-col gap-4">'
);
c = c.replace(
  '      </div>\n\n      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex flex-col gap-4">',
  '      </div>\n\n      <div className="px-4 sm:px-6 lg:px-8 mt-2">\n        <ImageUploader parentType="note" onUploadComplete={handleUploadComplete} />\n      </div>\n\n      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 flex flex-col gap-4">'
);

// For NoteEditorContent layout insertion
c = c.replace(
  '          </div>\r\n\r\n          <button\r\n            onClick={async () => {',
  '          </div>\r\n\r\n          <div className="mr-2 border-r border-white/5 pr-2">\r\n             <ImageUploader parentType="note" parentId={note.id} onUploadComplete={handleUploadComplete} />\r\n          </div>\r\n\r\n          <button\r\n            onClick={async () => {'
);
c = c.replace(
  '          </div>\n\n          <button\n            onClick={async () => {',
  '          </div>\n\n          <div className="mr-2 border-r border-white/5 pr-2">\n             <ImageUploader parentType="note" parentId={note.id} onUploadComplete={handleUploadComplete} />\n          </div>\n\n          <button\n            onClick={async () => {'
);

fs.writeFileSync('frontend/src/features/notes/NoteEditor.tsx', c);
