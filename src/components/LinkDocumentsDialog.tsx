import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Folder,
  Calendar,
  User
} from 'lucide-react';
import { useI18n } from '../utils/i18n/context';

interface Document {
  id: string;
  title: string;
  documentStatus: string;
  assignedTo: {
    id: string;
    name: string;
    avatar: string;
  };
  folderName: string;
  modifiedTime: string;
  fileName: string;
  documentType: 'Public' | 'Private' | 'Restricted';
}

interface LinkDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinkDocuments: (documentIds: string[]) => void;
}

// Mock documents data
const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    title: 'giarnoc-hoaototop',
    documentStatus: 'Wager',
    assignedTo: {
      id: 'user-1',
      name: 'tr ng',
      avatar: 'T'
    },
    folderName: 'Default',
    modifiedTime: '2020-10-18 8:59 AM',
    fileName: 'giarnoc-hoaototop',
    documentType: 'Public'
  },
  {
    id: 'doc-2',
    title: 'Project Requirements',
    documentStatus: 'Draft',
    assignedTo: {
      id: 'user-2',
      name: 'Nguyễn Văn A',
      avatar: 'N'
    },
    folderName: 'Projects',
    modifiedTime: '2025-10-15 10:30 AM',
    fileName: 'requirements-v2',
    documentType: 'Private'
  },
  {
    id: 'doc-3',
    title: 'Design Specifications',
    documentStatus: 'Final',
    assignedTo: {
      id: 'user-3',
      name: 'Trần Thị B',
      avatar: 'T'
    },
    folderName: 'Design',
    modifiedTime: '2025-10-16 2:15 PM',
    fileName: 'design-specs',
    documentType: 'Public'
  },
  {
    id: 'doc-4',
    title: 'API Documentation',
    documentStatus: 'Review',
    assignedTo: {
      id: 'user-1',
      name: 'tr ng',
      avatar: 'T'
    },
    folderName: 'Technical',
    modifiedTime: '2025-10-17 9:45 AM',
    fileName: 'api-docs-v1',
    documentType: 'Restricted'
  },
  {
    id: 'doc-5',
    title: 'User Guide',
    documentStatus: 'Published',
    assignedTo: {
      id: 'user-2',
      name: 'Nguyễn Văn A',
      avatar: 'N'
    },
    folderName: 'Documentation',
    modifiedTime: '2025-10-18 11:20 AM',
    fileName: 'user-guide-final',
    documentType: 'Public'
  }
];

export function LinkDocumentsDialog({
  open,
  onOpenChange,
  onLinkDocuments
}: LinkDocumentsDialogProps) {
  const { t } = useI18n();
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination
  const totalPages = Math.ceil(mockDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocuments = mockDocuments.slice(startIndex, endIndex);
  const displayStart = startIndex + 1;
  const displayEnd = Math.min(endIndex, mockDocuments.length);

  const handleSelectDocument = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === currentDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(currentDocuments.map(doc => doc.id));
    }
  };

  const handleLinkSelected = () => {
    onLinkDocuments(selectedDocuments);
    setSelectedDocuments([]);
    onOpenChange(false);
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'Public':
        return 'bg-[#51cf66] text-white';
      case 'Private':
        return 'bg-[#ff6b6b] text-white';
      case 'Restricted':
        return 'bg-[#ffd43b] text-[#181c28]';
      default:
        return 'bg-[#838a9c] text-white';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl bg-[#292d39] border-[#3d4457] text-white max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-[#3d4457] pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl text-white">
              {t('Link Documents')}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Select documents from the list to link to your task
            </DialogDescription>
            
            {/* Pagination */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#838a9c]">
                {displayStart} to {displayEnd}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-7 w-7 p-0 hover:bg-[#3d4457] disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-7 w-7 p-0 hover:bg-[#3d4457] disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Table */}
        <div className="flex-1 overflow-auto taskflow-scrollbar">
          <table className="w-full">
            <thead className="bg-[#1f232d] sticky top-0 z-10">
              <tr>
                <th className="text-left p-3 text-xs text-[#838a9c] font-medium w-12">
                  <Checkbox
                    checked={selectedDocuments.length === currentDocuments.length && currentDocuments.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="border-[#3d4457]"
                  />
                </th>
                <th className="text-left p-3 text-xs text-[#838a9c] font-medium">
                  TITLE
                </th>
                <th className="text-left p-3 text-xs text-[#838a9c] font-medium">
                  DOCUMENT STATUS
                </th>
                <th className="text-left p-3 text-xs text-[#838a9c] font-medium">
                  ASSIGNED TO
                </th>
                <th className="text-left p-3 text-xs text-[#838a9c] font-medium">
                  FOLDER NAME
                </th>
                <th className="text-left p-3 text-xs text-[#838a9c] font-medium">
                  MODIFIED TIME
                </th>
                <th className="text-left p-3 text-xs text-[#838a9c] font-medium">
                  FILE NAME
                </th>
                <th className="text-left p-3 text-xs text-[#838a9c] font-medium">
                  DOCUMENT TYPE
                </th>
              </tr>
            </thead>
            <tbody>
              {currentDocuments.map((doc) => (
                <tr 
                  key={doc.id}
                  className="border-b border-[#3d4457] hover:bg-[#1f232d] transition-colors"
                >
                  <td className="p-3">
                    <Checkbox
                      checked={selectedDocuments.includes(doc.id)}
                      onCheckedChange={() => handleSelectDocument(doc.id)}
                      className="border-[#3d4457]"
                    />
                  </td>
                  <td className="p-3">
                    <button className="text-[#0394ff] hover:underline text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {doc.title}
                    </button>
                  </td>
                  <td className="p-3">
                    <Badge 
                      variant="outline" 
                      className="bg-transparent border-[#838a9c] text-[#838a9c] text-xs"
                    >
                      {doc.documentStatus}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 bg-[#0394ff] text-white text-xs">
                        {doc.assignedTo.avatar}
                      </Avatar>
                      <span className="text-sm text-white">{doc.assignedTo.name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-sm text-[#838a9c]">
                      <Folder className="w-4 h-4" />
                      {doc.folderName}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-sm text-[#838a9c]">
                      <Calendar className="w-3 h-3" />
                      {doc.modifiedTime}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-white">{doc.fileName}</span>
                  </td>
                  <td className="p-3">
                    <Badge className={`text-xs ${getDocumentTypeColor(doc.documentType)}`}>
                      {doc.documentType}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#3d4457] pt-4 flex items-center justify-between">
          <div className="text-sm text-[#838a9c]">
            {selectedDocuments.length > 0 ? (
              <span>{selectedDocuments.length} document(s) selected</span>
            ) : (
              <span>Select documents to link</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-[#3d4457] text-white hover:bg-[#3d4457]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLinkSelected}
              disabled={selectedDocuments.length === 0}
              className="bg-[#0394ff] hover:bg-[#0570cd] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Link {selectedDocuments.length > 0 ? `(${selectedDocuments.length})` : ''} Documents
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
