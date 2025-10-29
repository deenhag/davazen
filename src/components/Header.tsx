import { ThemeToggle } from '@/components/ThemeToggle';
import { BookText, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
interface HeaderProps {
  onLogout: () => void;
  userEmail?: string;
}
export function Header({ onLogout, userEmail }: HeaderProps) {
  return (
    <header className="py-4 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookText className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground font-display">
            DavaZen
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {userEmail && <span className="text-sm text-muted-foreground hidden sm:inline">{userEmail}</span>}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Çıkış Yap</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Çıkış Yapmak Üzere misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Oturumu sonlandırmak istediğinizden emin misiniz?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={onLogout}>Çıkış Yap</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <ThemeToggle className="relative top-0 right-0" />
        </div>
      </div>
    </header>
  );
}