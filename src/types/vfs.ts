export interface FSNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FSNode[];
  metadata: {
    size: number;
    createdAt: string;
    updatedAt: string;
    executable: boolean;
    permissions: string;
    mimeType: string;
    tags?: string[];
  };
}

export interface SearchResult {
  path: string;
  node: FSNode;
  matchLine?: string;
}

export type NavigationResult =
  | { success: true; node: FSNode; path: string }
  | { success: false; error: string };
