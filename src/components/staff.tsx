"use client"

import { useState } from "react"
import { PlusCircle, Pencil, Trash2, Users, MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Staff } from "@/lib/types"
import { StaffForm } from "./staff-form"


interface StaffProps {
    staff: Staff[];
    onAddStaff: (data: Omit<Staff, 'id'>) => void;
    onUpdateStaff: (data: Staff) => void;
    onDeleteStaff: (id: string) => void;
}

export default function Staff({ staff, onAddStaff, onUpdateStaff, onDeleteStaff }: StaffProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | undefined>(undefined);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const isMobile = useIsMobile();

  const handleOpenDialog = (staffMember?: Staff) => {
    setSelectedStaff(staffMember);
    setDialogOpen(true);
  }
  
  const closeDialog = () => {
      setSelectedStaff(undefined);
      setDialogOpen(false);
  }
  
  const handleSave = (data: any) => {
    if (selectedStaff) {
      onUpdateStaff(data);
    } else {
      onAddStaff(data);
    }
  }

  const handleDelete = () => {
    if (staffToDelete) {
      onDeleteStaff(staffToDelete.id);
      setStaffToDelete(null);
    }
  }

  const renderLoadingSkeleton = () => (
    <div className="space-y-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
    </div>
  );

  const renderDesktopView = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ad Soyad</TableHead>
          <TableHead>Pozisyon</TableHead>
          <TableHead>Telefon</TableHead>
          <TableHead className="text-right">Maaş</TableHead>
          <TableHead className="w-[100px] text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {staff.length > 0 ? staff.map((staffMember) => (
          <TableRow key={staffMember.id}>
            <TableCell className="font-medium">{staffMember.name}</TableCell>
            <TableCell>{staffMember.position}</TableCell>
            <TableCell>{staffMember.phone || '–'}</TableCell>
            <TableCell className="text-right font-mono">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(staffMember.salary)}
            </TableCell>
            <TableCell className="text-right space-x-1">
              <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(staffMember)}>
                <Pencil className="h-4 w-4" />
              </Button>
               <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setStaffToDelete(staffMember)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        )) : (
           <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">Kayıtlı personel bulunamadı.</TableCell>
           </TableRow>
        )}
      </TableBody>
    </Table>
  );
  
  const renderMobileView = () => (
    <div className="space-y-3">
        {staff.length > 0 ? staff.map((staffMember) => (
            <Card key={staffMember.id}>
                <CardContent className="p-4 flex justify-between items-start">
                    <div className="flex-1 space-y-1 pr-2">
                        <p className="font-semibold">{staffMember.name}</p>
                        <p className="text-sm text-muted-foreground">{staffMember.position}</p>
                        <p className="text-xs text-muted-foreground pt-1">{staffMember.phone || 'Telefon yok'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <p className="font-mono font-semibold text-base whitespace-nowrap">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(staffMember.salary)}
                        </p>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={(e) => e.stopPropagation()}>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={() => handleOpenDialog(staffMember)}>Düzenle</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setStaffToDelete(staffMember)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    Sil
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
        )) : (
            <div className="h-24 text-center flex items-center justify-center">
                <p className="text-muted-foreground">Kayıtlı personel bulunamadı.</p>
            </div>
        )}
    </div>
  );

  return (
    <>
      <AlertDialog open={!!staffToDelete} onOpenChange={() => setStaffToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. {staffToDelete?.name} adlı personel kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Users /> Personel</CardTitle>
            <CardDescription>Personel bilgilerini ve maaş ödemelerini yönetin.</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Personel Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => { e.preventDefault(); }} onEscapeKeyDown={closeDialog}>
              <DialogHeader>
                <DialogTitle>{selectedStaff ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}</DialogTitle>
                <DialogDescription>
                  {selectedStaff ? `Detayları ${selectedStaff.name} için güncelle.` : 'Kayıtlarınıza yeni bir personel ekleyin.'}
                </DialogDescription>
              </DialogHeader>
              <StaffForm staff={selectedStaff} setOpen={setDialogOpen} onSave={handleSave} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isMobile === undefined ? renderLoadingSkeleton() : (isMobile ? renderMobileView() : renderDesktopView())}
        </CardContent>
      </Card>
    </>
  )
}
