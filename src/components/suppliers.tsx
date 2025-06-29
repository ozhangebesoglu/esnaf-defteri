"use client"

import { useState } from "react"
import { PlusCircle, Pencil, Trash2, Truck, MoreVertical } from "lucide-react"

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
import type { Supplier } from "@/lib/types"
import { SupplierForm } from "./supplier-form"

interface SuppliersProps {
    suppliers: Supplier[];
    onAddSupplier: (data: Omit<Supplier, 'id'|'userId'>) => void;
    onUpdateSupplier: (data: Supplier) => void;
    onDeleteSupplier: (id: string) => void;
}

export default function Suppliers({ suppliers, onAddSupplier, onUpdateSupplier, onDeleteSupplier }: SuppliersProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>(undefined);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const isMobile = useIsMobile();

  const handleOpenDialog = (supplier?: Supplier) => {
    setSelectedSupplier(supplier);
    setDialogOpen(true);
  }
  
  const closeDialog = () => {
      setSelectedSupplier(undefined);
      setDialogOpen(false);
  }
  
  const handleSave = (data: any) => {
    if (selectedSupplier) {
      onUpdateSupplier(data);
    } else {
      onAddSupplier(data);
    }
  }

  const handleDelete = () => {
    if (supplierToDelete) {
      onDeleteSupplier(supplierToDelete.id);
      setSupplierToDelete(null);
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
          <TableHead>Firma Adı</TableHead>
          <TableHead>Yetkili Kişi</TableHead>
          <TableHead>Telefon</TableHead>
          <TableHead>E-posta</TableHead>
          <TableHead className="w-[100px] text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suppliers.length > 0 ? suppliers.map((supplier) => (
          <TableRow key={supplier.id}>
            <TableCell className="font-medium">{supplier.name}</TableCell>
            <TableCell>{supplier.contactPerson || '–'}</TableCell>
            <TableCell>{supplier.phone || '–'}</TableCell>
            <TableCell>{supplier.email || '–'}</TableCell>
            <TableCell className="text-right space-x-1">
              <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(supplier)}>
                <Pencil className="h-4 w-4" />
              </Button>
               <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setSupplierToDelete(supplier)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        )) : (
           <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">Kayıtlı tedarikçi bulunamadı.</TableCell>
           </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const renderMobileView = () => (
    <div className="space-y-3">
        {suppliers.length > 0 ? suppliers.map((supplier) => (
            <Card key={supplier.id}>
                <CardContent className="p-4 flex justify-between items-start">
                    <div className="flex-1 space-y-1 pr-2">
                        <p className="font-semibold">{supplier.name}</p>
                        <p className="text-sm text-muted-foreground">{supplier.contactPerson || 'Yetkili belirtilmemiş'}</p>
                        <p className="text-xs text-muted-foreground pt-1">{supplier.phone || 'Telefon yok'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={(e) => e.stopPropagation()}>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={() => handleOpenDialog(supplier)}>Düzenle</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSupplierToDelete(supplier)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    Sil
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
        )) : (
            <div className="h-24 text-center flex items-center justify-center">
                <p className="text-muted-foreground">Kayıtlı tedarikçi bulunamadı.</p>
            </div>
        )}
    </div>
  );

  return (
    <>
      <AlertDialog open={!!supplierToDelete} onOpenChange={() => setSupplierToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. {supplierToDelete?.name} adlı tedarikçi kalıcı olarak silinecektir.
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
            <CardTitle className="flex items-center gap-2"><Truck /> Tedarikçiler</CardTitle>
            <CardDescription>Mal ve hizmet aldığınız firmaları yönetin.</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tedarikçi Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => { e.preventDefault(); }} onEscapeKeyDown={closeDialog}>
              <DialogHeader>
                <DialogTitle>{selectedSupplier ? 'Tedarikçiyi Düzenle' : 'Yeni Tedarikçi Ekle'}</DialogTitle>
                <DialogDescription>
                  {selectedSupplier ? `Detayları ${selectedSupplier.name} için güncelle.` : 'Kayıtlarınıza yeni bir tedarikçi ekleyin.'}
                </DialogDescription>
              </DialogHeader>
              <SupplierForm supplier={selectedSupplier} setOpen={setDialogOpen} onSave={handleSave} />
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
