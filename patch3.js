const fs = require('fs');
let c = fs.readFileSync('frontend/src/features/dreams/DreamDetailView.tsx', 'utf8');

c = c.replace(
  'import { AiDreamIntelligence } from "../../types/ai";',
  'import { AiDreamIntelligence } from "../../types/ai";\nimport { FiImage } from "react-icons/fi";\nimport { ImageUploader } from "../../components/ImageUploader";\nimport { getImages } from "../../libs/uploadImage";\nimport { useEffect } from "react";'
);

c = c.replace(
`          <TabButton
            id="knowledge"
            label="Knowledge"
            icon={FiBook}
            active={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="intelligence"
            label="Intelligence"
            icon={FiCpu}
            active={activeTab}
            onClick={setActiveTab}
          />`,
`          <TabButton
            id="knowledge"
            label="Knowledge"
            icon={FiBook}
            active={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="gallery"
            label="Gallery"
            icon={FiImage}
            active={activeTab}
            onClick={setActiveTab}
          />
          <TabButton
            id="intelligence"
            label="Intelligence"
            icon={FiCpu}
            active={activeTab}
            onClick={setActiveTab}
          />`
);

c = c.replace(
`              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <PromptModal
        isOpen={showTaskPrompt}`,
`              </div>
            )}
            
            {activeTab === "gallery" && (
              <ImageGallery parentType="dream" parentId={dream.id} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <PromptModal
        isOpen={showTaskPrompt}`
);

const imgGalleryComponent = `

// ----- IMAGE GALLERY COMPONENT -----
function ImageGallery({ parentType, parentId }: { parentType: "dream" | "task" | "idea" | "note", parentId: string }) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, [parentId]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await getImages(parentType, parentId);
      setImages(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (image: any) => {
    setImages((prev) => [image, ...prev]);
  };

  if (loading) {
    return <div className="text-text-muted text-sm italic py-20 text-center glass rounded-[2.5rem] border border-dashed border-white/10 p-4">Loading visual data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xl font-bold text-text-main">
          Visual Inspiration & References
        </h3>
        <ImageUploader parentType={parentType} parentId={parentId} onUploadComplete={handleUploadComplete} />
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <div key={img.id} className="group relative rounded-3xl overflow-hidden border border-white/5 bg-white/5 aspect-video flex-shrink-0 hover:border-brand-primary/30 transition-all">
              <img src={img.url} alt="Gallery item" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass rounded-[2.5rem] border border-dashed border-white/10">
          <p className="text-text-muted text-sm italic">
            No visual assets connected to this node. Add images above to build a moodboard.
          </p>
        </div>
      )}
    </div>
  );
}`;

c = c.replace('  );\n}\n\ninterface TabButtonProps', '  );\n}' + imgGalleryComponent + '\n\ninterface TabButtonProps');

fs.writeFileSync('frontend/src/features/dreams/DreamDetailView.tsx', c);
