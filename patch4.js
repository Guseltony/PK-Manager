const fs = require('fs');
let c = fs.readFileSync('frontend/src/features/tasks/TaskDetailView.tsx', 'utf8');

if (!c.includes('import { ImageGallery }')) {
  c = c.replace(
    'import { useNotesStore } from "../../store/notesStore";',
    'import { useNotesStore } from "../../store/notesStore";\nimport { ImageGallery } from "../../components/ImageGallery";'
  );
}

if (!c.includes('<ImageGallery parentType="task"')) {
  c = c.replace(
    '        {/* Execution History (Activity Timeline) */}',
    '        {/* Component: Visual Inspiration (ImageGallery) */}\n        <div className="mb-10">\n          <ImageGallery parentType="task" parentId={task.id} />\n        </div>\n\n        {/* Execution History (Activity Timeline) */}'
  );
}

fs.writeFileSync('frontend/src/features/tasks/TaskDetailView.tsx', c);
