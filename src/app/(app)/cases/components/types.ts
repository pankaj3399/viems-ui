export interface DocumentItem {
  id: string;
  name: string;
  subtitle: string;
  folderId: string;
  folderName: string;
  status: "uploaded" | "not_uploaded" | "required_asap" | "under_review";
  date?: string;
  dateWarning?: string;
  isAlert?: boolean;
  fileUrl?: string;
  isMockFixture?: boolean;
}
