import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCases } from "@/hooks/useCases";
import { Case } from "@shared/types";
import { FileText, Loader2 } from "lucide-react";
import { useMemo } from "react";
type ScrapedCase = Omit<Case, "id" | "userId" | "notes">;
interface UyapImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  casesToImport: ScrapedCase[];
}
export function UyapImportDialog({ isOpen, onClose, casesToImport }: UyapImportDialogProps) {
  const { addMultipleCases, isBatchAdding, cases: existingCases } = useCases();
  const existingFileNumbers = useMemo(() => new Set(existingCases.map(c => c.fileNumber)), [existingCases]);
  const newCasesToImport = useMemo(() => {
    return casesToImport.filter(c => !existingFileNumbers.has(c.fileNumber));
  }, [casesToImport, existingFileNumbers]);
  const handleImport = async () => {
    await addMultipleCases(newCasesToImport);
    onClose();
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>UYAP'tan Davaları İçe Aktar</DialogTitle>
          <DialogDescription>
            {newCasesToImport.length > 0
              ? `${newCasesToImport.length} yeni dava bulundu. İçe aktarmak için onayla.`
              : "Tüm davalar zaten mevcut. İçe aktarılacak yeni dava bulunamadı."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-64 my-4 pr-4">
          <div className="space-y-2">
            {casesToImport.map((caseItem, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-2 rounded-md ${
                  existingFileNumbers.has(caseItem.fileNumber)
                    ? "bg-muted/50 text-muted-foreground"
                    : "bg-accent/50"
                }`}
              >
                <FileText className="h-5 w-5 mt-1 flex-shrink-0" />
                <div className="flex-grow">
                  <p className="text-sm font-medium">{caseItem.fileNumber}</p>
                  <p className="text-xs text-muted-foreground">{caseItem.courtName}</p>
                </div>
                {existingFileNumbers.has(caseItem.fileNumber) && (
                  <span className="text-xs text-green-600 font-medium self-center">Mevcut</span>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={isBatchAdding || newCasesToImport.length === 0}
          >
            {isBatchAdding ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isBatchAdding ? "Aktarılıyor..." : `${newCasesToImport.length} Davayı Aktar`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}