import { useMemo, useState } from "react";
import { useCases } from "@/hooks/useCases";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Search, Inbox } from "lucide-react";
export function AllNotesView() {
  const cases = useCases((s) => s.cases);
  const [searchQuery, setSearchQuery] = useState("");
  const allNotes = useMemo(() => {
    return cases
      .flatMap((c) =>
        (c.notes || []).map((note) => ({
          ...note,
          caseId: c.id,
          caseFileNumber: c.fileNumber,
          caseCourtName: c.courtName,
        }))
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [cases]);
  const filteredNotes = useMemo(() => {
    if (!searchQuery) return allNotes;
    const lowercasedQuery = searchQuery.toLowerCase();
    return allNotes.filter(
      (note) =>
        note.content.toLowerCase().includes(lowercasedQuery) ||
        note.caseFileNumber.toLowerCase().includes(lowercasedQuery)
    );
  }, [allNotes, searchQuery]);
  return (
    <div className="space-y-4">
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Not içeriği veya dosya no ile ara..."
          className="pl-9 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <ScrollArea className="h-[500px] w-full pr-4">
        <div className="space-y-4">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <Card key={note.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex justify-between items-center">
                    <span>Dosya: {note.caseFileNumber}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {format(new Date(note.createdAt), "dd/MM/yyyy HH:mm")}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">{note.caseCourtName}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-16">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Not Bulunamadı</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {allNotes.length > 0 ? "Arama kriterlerinize uygun not bulunamadı." : "Henüz hiç not eklenmemiş."}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}