import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
"@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle } from
"@/components/ui/alert-dialog";
import { Case } from "@shared/types";
import { useState } from "react";
import { useCases } from "@/hooks/useCases";
import { cn } from "@/lib/utils";
export type SortDescriptor = {
  column: keyof Case;
  direction: "asc" | "desc";
};
interface CaseDataTableProps {
  cases: Case[];
  onViewDetails: (caseData: Case) => void;
  sortDescriptor: SortDescriptor | null;
  onSortChange: (column: keyof Case) => void;
}
export function CaseDataTable({ cases, onViewDetails, sortDescriptor, onSortChange }: CaseDataTableProps) {
  const { deleteCase, isDeleting } = useCases();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<Case | null>(null);
  const handleDeleteClick = (caseData: Case) => {
    setCaseToDelete(caseData);
    setIsAlertOpen(true);
  };
  const confirmDelete = async () => {
    if (caseToDelete) {
      await deleteCase(caseToDelete.id);
      setIsAlertOpen(false);
      setCaseToDelete(null);
    }
  };
  const renderSortIcon = (column: keyof Case) => {
    if (sortDescriptor?.column !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortDescriptor.direction === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };
  const SortableHeader = ({ column, children, className }: {column: keyof Case;children: React.ReactNode;className?: string;}) =>
  <TableHead className={className}>
      <Button variant="ghost" onClick={() => onSortChange(column)} className="-ml-4">
        {children}
        {renderSortIcon(column)}
      </Button>
    </TableHead>;
  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader column="courtName">Mahkeme Adı</SortableHeader>
              <SortableHeader column="fileNumber">Dosya Numarası</SortableHeader>
              <SortableHeader column="parties">Taraflar</SortableHeader>
              <SortableHeader column="tarafAdi">Taraf Adı</SortableHeader>
              <SortableHeader column="caseStatus">Dosya Durumu</SortableHeader>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.length > 0 ?
            cases.map((caseItem) =>
            <TableRow
              key={caseItem.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onViewDetails(caseItem)}>
                  <TableCell className="font-medium">{caseItem.courtName}</TableCell>
                  <TableCell>{caseItem.fileNumber}</TableCell>
                  <TableCell>{caseItem.parties}</TableCell>
                  <TableCell>{caseItem.tarafAdi}</TableCell>
                  <TableCell>{caseItem.caseStatus}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}>
                          <span className="sr-only">Menüyü aç</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                    align="end"
                    onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => onViewDetails(caseItem)}>
                          Detayları Görüntüle / Not Ekle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDeleteClick(caseItem)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
            ) :
            <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Gösterilecek dava bulunamadı.
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu davayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCaseToDelete(null)}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>);
}