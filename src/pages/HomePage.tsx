import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { CaseActions } from "@/components/CaseActions";
import { CaseDataTable, SortDescriptor } from "@/components/CaseDataTable";
import { CaseFormDialog } from "@/components/CaseFormDialog";
import { useCases } from "@/hooks/useCases";
import { Case } from "@shared/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Inbox, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllNotesView } from "@/components/AllNotesView";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UyapImportDialog } from "@/components/UyapImportDialog";
const chrome =
typeof window !== "undefined" && window.chrome ?
window.chrome :
{
  _stub: true,
  runtime: {
    onMessage: {
      addListener: () => {},
      removeListener: () => {}
    },
    sendMessage: () => {}
  },
  tabs: {
    query: () => Promise.resolve([])
  },
  scripting: {
    executeScript: () => Promise.resolve()
  }
} as any;
type ScrapedCase = Omit<Case, "id" | "userId" | "notes">;
export function HomePage() {
  const fetchCases = useCases((s) => s.fetchCases);
  const cases = useCases((s) => s.cases);
  const isLoading = useCases((s) => s.isLoading);
  const error = useCases((s) => s.error);
  const clearCases = useCases((s) => s.clearCases);
  const logout = useAuth((s) => s.logout);
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | null>({
    column: "courtName",
    direction: "asc"
  });
  const [scrapedCasesForImport, setScrapedCasesForImport] = useState<ScrapedCase[]>([]);
  useEffect(() => {
    fetchCases();
  }, [fetchCases]);
  useEffect(() => {
    const messageListener = (message: {action: string;data: ScrapedCase[];}) => {
      if (message.action === "displayData" && message.data) {
        toast.success(`${message.data.length} dava UYAP sayfasından okundu.`, {
          description: "İçe aktarmak için listeyi kontrol edebilirsiniz."
        });
        setScrapedCasesForImport(message.data);
        setIsImportDialogOpen(true);
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);
  const handleLogout = () => {
    logout();
    clearCases();
    navigate('/login');
  };
  const handleAddCase = () => {
    setSelectedCase(null);
    setIsFormDialogOpen(true);
  };
  const handleViewDetails = (caseData: Case) => {
    setSelectedCase(caseData);
    setIsFormDialogOpen(true);
  };
  const handleCloseFormDialog = () => {
    setIsFormDialogOpen(false);
    setSelectedCase(null);
  };
  const handleSortChange = useCallback((column: keyof Case) => {
    setSortDescriptor((prev) => {
      if (prev?.column === column) {
        return { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { column, direction: 'asc' };
    });
  }, []);
  const handleScrapeData = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        if (tab.url && tab.url.includes("avukat.uyap.gov.tr")) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
        } else {
          toast.error("Bu özellik sadece UYAP Avukat Portalında çalışır.", {
            description: "Lütfen UYAP Dava Dosyası Sorgulama sayfasını açın."
          });
        }
      }
    } catch (e) {
      console.error("Scraping failed:", e);
      toast.error("Veri çekme işlemi başlatılamadı.");
    }
  };
  const processedCases = useMemo(() => {
    let filtered = cases;
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = cases.filter(
        (c) =>
        c.fileNumber.toLowerCase().includes(lowercasedQuery) ||
        c.parties.toLowerCase().includes(lowercasedQuery) ||
        c.tarafAdi.toLowerCase().includes(lowercasedQuery)
      );
    }
    if (sortDescriptor) {
      return [...filtered].sort((a, b) => {
        const aVal = a[sortDescriptor.column] || '';
        const bVal = b[sortDescriptor.column] || '';
        if (aVal < bVal) return sortDescriptor.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDescriptor.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [cases, searchQuery, sortDescriptor]);
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>);
    }
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>);
    }
    if (cases.length === 0) {
      return (
        <div className="text-center py-16">
          <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Henüz Dava Eklenmemiş</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Başlamak için ilk davanızı ekleyin veya UYAP'tan veri çekin.
          </p>
        </div>);
    }
    return (
      <CaseDataTable
        cases={processedCases}
        onViewDetails={handleViewDetails}
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange} />);
  };
  return (
    <div className="min-h-screen bg-muted/40">
      <Header onLogout={handleLogout} userEmail={user?.email} />
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Dava Yönetim Paneli</CardTitle>
                    <CardDescription>
                      Davalarınızı yönetin, notlar alın ve tüm bilgilere tek bir yerden ulaşın.
                    </CardDescription>
                  </div>
                  <Button onClick={handleScrapeData} variant="outline" className="mt-4 sm:mt-0">
                    <Download className="mr-2 h-4 w-4" />
                    UYAP'tan Veri Çek
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="cases" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="cases">Davalar</TabsTrigger>
                    <TabsTrigger value="notes">Tüm Notlar</TabsTrigger>
                  </TabsList>
                  <TabsContent value="cases" className="space-y-4">
                    <CaseActions
                      onAddCase={handleAddCase}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery} />
                    {renderContent()}
                  </TabsContent>
                  <TabsContent value="notes">
                    <AllNotesView />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <CaseFormDialog
        isOpen={isFormDialogOpen}
        onClose={handleCloseFormDialog}
        caseData={selectedCase} />
      <UyapImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        casesToImport={scrapedCasesForImport} />
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Built with ❤️ at Cloudflare</p>
      </footer>
    </div>);
}