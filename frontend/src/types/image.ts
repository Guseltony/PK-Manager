export interface Image {
  id: string;
  url: string;
  publicId?: string;
  parentType: string;
  parentId: string | null;
  createdAt?: string;
  updatedAt?: string;
}
