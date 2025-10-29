import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
interface CaseActionsProps {
  onAddCase: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}
export function CaseActions({ onAddCase, searchQuery, onSearchChange }: CaseActionsProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Dosya no veya taraf adına göre ara..."
          className="pl-9 w-full"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button onClick={onAddCase} className="w-full md:w-auto">
        <PlusCircle className="mr-2 h-4 w-4" />
        Yeni Dava Ekle
      </Button>
    </div>
  );
}