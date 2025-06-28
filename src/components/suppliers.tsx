"use client"

import { useState } from "react"
import { PlusCircle, Pencil, Trash2, Truck } from "lucide-react"

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

import type { Supplier } from "@/lib/types"
import { SupplierForm } from "./supplier-form"

interface SuppliersProps {
    suppliers: Supplier[];
    onAddSupplier: (data: Omit<Supplier, 'id'>) => void;
    onUpdateSupplier: (data: Supplier) => void;
    onDeleteSupplier: (id: string) => void;
}

export default function Suppliers({ suppliers, onAddSupplier, onUpdateSupplier, onDeleteSupplier }: SuppliersProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>(undefined);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

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
                <TableRow key={supplier.id} className="cursor-pointer">
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contactPerson || '–'}</TableCell>
                  <TableCell>{supplier.phone || '–'}</TableCell>
                  <TableCell>{supplier.email || '–'}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenDialog(supplier); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                     <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); setSupplierToDelete(supplier); }}>
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
        </CardContent>
      </Card>
    </>
  )
}
