"use client"

import { useState } from "react"
import { PlusCircle, Pencil, Trash2, MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import type { Product } from "@/lib/types"
import { ProductIcon } from "./product-icons"
import { ProductForm } from "./product-form"
import { useIsMobile } from "@/hooks/use-mobile"


interface ProductsProps {
    products: Product[];
    onAddProduct: (data: Omit<Product, 'id' | 'stock'>) => void;
    onUpdateProduct: (data: Product) => void;
    onDeleteProduct: (id: string) => void;
}

export default function Products({ products, onAddProduct, onUpdateProduct, onDeleteProduct }: ProductsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const isMobile = useIsMobile();

  const handleOpenDialog = (product?: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  }

  const getProductTypeName = (type: Product['type']) => {
    switch (type) {
        case 'beef': return 'Kırmızı Et';
        case 'processed': return 'Şarküteri';
        case 'chicken': return 'Beyaz Et';
        case 'dairy': return 'Süt Ürünleri';
        default: return 'Bilinmeyen';
    }
  }

  const handleSave = (data: any) => {
      if(selectedProduct) {
          onUpdateProduct(data);
      } else {
          onAddProduct(data);
      }
  }

  const handleDelete = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete.id);
      setProductToDelete(null);
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
          <TableHead className="w-[80px]">İkon</TableHead>
          <TableHead>Ürün Adı</TableHead>
          <TableHead>Tipi</TableHead>
          <TableHead className="text-right">Satış Fiyatı</TableHead>
          <TableHead className="text-right">Stok</TableHead>
          <TableHead className="w-[100px] text-right">İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length > 0 ? products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <ProductIcon type={product.type} />
            </TableCell>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{getProductTypeName(product.type)}</TableCell>
            <TableCell className="text-right font-mono">
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.price)}
            </TableCell>
             <TableCell className="text-right font-mono">{product.stock}</TableCell>
            <TableCell className="text-right space-x-1">
              <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setProductToDelete(product)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        )) : (
           <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">Kayıtlı ürün bulunamadı.</TableCell>
           </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const renderMobileView = () => (
    <div className="space-y-3">
        {products.length > 0 ? products.map((product) => (
            <Card key={product.id}>
                <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4 flex-1">
                        <ProductIcon type={product.type} />
                        <div className="flex-1 space-y-1">
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{getProductTypeName(product.type)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-mono font-semibold">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(product.price)}</p>
                            <p className="text-sm text-muted-foreground">Stok: {product.stock}</p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={(e) => e.stopPropagation()}>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={() => handleOpenDialog(product)}>Düzenle</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setProductToDelete(product)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                    Sil
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
        )) : (
            <div className="h-24 text-center flex items-center justify-center">
                <p className="text-muted-foreground">Kayıtlı ürün bulunamadı.</p>
            </div>
        )}
    </div>
  );


  return (
    <>
    <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. {productToDelete?.name} adlı ürün kalıcı olarak silinecektir.
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
            <CardTitle>Ürünler</CardTitle>
            <CardDescription>İşletmenizdeki ürünleri, fiyatlarını ve stok bilgilerini yönetin.</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(isOpen) => { if(!isOpen) setSelectedProduct(undefined); setDialogOpen(isOpen);}}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Ürün Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{selectedProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</DialogTitle>
                <DialogDescription>
                  {selectedProduct ? `${selectedProduct.name} ürününün detaylarını güncelle.` : 'Kayıtlarınıza yeni bir ürün ekleyin.'}
                </DialogDescription>
              </DialogHeader>
              <ProductForm product={selectedProduct} setOpen={setDialogOpen} onSave={handleSave} />
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
