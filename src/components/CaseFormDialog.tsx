import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
"@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage } from
"@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Case, Note } from "@shared/types";
import { useCases } from "@/hooks/useCases";
import { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { format } from "date-fns";
const caseFormSchema = z.object({
  courtName: z.string().min(1, "Mahkeme adı gereklidir."),
  parties: z.string().min(1, "Taraflar gereklidir."),
  fileNumber: z.string().min(1, "Dosya numarası gereklidir."),
  caseStatus: z.string().min(1, "Dosya durumu gereklidir."),
  tarafAdi: z.string().min(1, "Taraf adı gereklidir.")
});
type CaseFormValues = z.infer<typeof caseFormSchema>;
interface CaseFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: Case | null;
}
export function CaseFormDialog({ isOpen, onClose, caseData }: CaseFormDialogProps) {
  const { addCase, updateCase, isAdding, isUpdating } = useCases();
  const [noteContent, setNoteContent] = useState("");
  const isEditMode = !!caseData;
  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      courtName: "",
      parties: "",
      fileNumber: "",
      caseStatus: "",
      tarafAdi: ""
    }
  });
  useEffect(() => {
    if (caseData) {
      form.reset({
        courtName: caseData.courtName,
        parties: caseData.parties,
        fileNumber: caseData.fileNumber,
        caseStatus: caseData.caseStatus,
        tarafAdi: caseData.tarafAdi
      });
    } else {
      form.reset({
        courtName: "",
        parties: "",
        fileNumber: "",
        caseStatus: "",
        tarafAdi: ""
      });
    }
  }, [caseData, form]);
  const onSubmit = async (values: CaseFormValues) => {
    if (isEditMode && caseData) {
      await updateCase(caseData.id, values);
    } else {
      await addCase(values);
    }
    onClose();
  };
  const handleAddNote = async () => {
    if (!caseData || !noteContent.trim()) return;
    const newNote: Note = {
      id: crypto.randomUUID(),
      content: noteContent.trim(),
      createdAt: new Date().toISOString()
    };
    const updatedNotes = [...(caseData.notes || []), newNote];
    await updateCase(caseData.id, { notes: updatedNotes });
    setNoteContent("");
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Dava Detayları" : "Yeni Dava Ekle"}</DialogTitle>
          <DialogDescription>
            {isEditMode ?
            "Dava bilgilerini görüntüleyin ve not ekleyin." :
            "Yeni bir dava oluşturmak için bilgileri girin."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="courtName"
                render={({ field }) =>
                <FormItem>
                    <FormLabel>Mahkeme Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Ankara 1. Asliye Hukuk" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                } />
              <FormField
                control={form.control}
                name="fileNumber"
                render={({ field }) =>
                <FormItem>
                    <FormLabel>Dosya Numarası</FormLabel>
                    <FormControl>
                      <Input placeholder="2023/123 E." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                } />
              <FormField
                control={form.control}
                name="parties"
                render={({ field }) =>
                <FormItem>
                    <FormLabel>Taraflar</FormLabel>
                    <FormControl>
                      <Input placeholder="Ahmet Yılmaz / Mehmet Kaya" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                } />
              <FormField
                control={form.control}
                name="tarafAdi"
                render={({ field }) =>
                <FormItem>
                    <FormLabel>Taraf Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Davacı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                } />
              <FormField
                control={form.control}
                name="caseStatus"
                render={({ field }) =>
                <FormItem className="md:col-span-2">
                    <FormLabel>Dosya Durumu</FormLabel>
                    <FormControl>
                      <Input placeholder="Duruşma Günü Bekliyor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                } />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
              <Button type="submit" disabled={isAdding || isUpdating}>
                {isAdding || isUpdating ?
                "Kaydediliyor..." :
                isEditMode ?
                "Güncelle" :
                "Kaydet"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        {isEditMode && caseData &&
        <div className="space-y-4 pt-4">
            <Separator />
            <h3 className="text-lg font-semibold">Notlar</h3>
            <div className="space-y-2">
              <Textarea
              placeholder="Yeni bir not ekleyin..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)} />
              <Button onClick={handleAddNote} disabled={isUpdating || !noteContent.trim()}>
                {isUpdating ? "Ekleniyor..." : "Not Ekle"}
              </Button>
            </div>
            <ScrollArea className="h-40 w-full rounded-md border p-4">
              {caseData.notes && caseData.notes.length > 0 ?
            <div className="space-y-4">
                  {caseData.notes.slice().reverse().map((note) =>
              <div key={note.id} className="text-sm">
                      <p className="text-muted-foreground">
                        {format(new Date(note.createdAt), "dd/MM/yyyy HH:mm")}
                      </p>
                      <p className="whitespace-pre-wrap">{note.content}</p>
                    </div>
              )}
                </div> :
            <p className="text-sm text-muted-foreground">Henüz not eklenmemiş.</p>
            }
            </ScrollArea>
          </div>
        }
      </DialogContent>
    </Dialog>);
}