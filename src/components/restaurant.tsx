"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Order } from "@/lib/types"

export default function Restaurant({ cashSales }: { cashSales: Order[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Restoran / Tezgah Satışları</CardTitle>
        <CardDescription>Gün içinde yapılan ve bir müşteriye bağlanmayan peşin satışlar.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>İşlem No</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cashSales.length > 0 ? cashSales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium">{sale.id}</TableCell>
                <TableCell>{new Date(sale.date).toLocaleString('tr-TR')}</TableCell>
                <TableCell>{sale.description}</TableCell>
                <TableCell className="text-right font-mono">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(sale.total)}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Bugün peşin satış yapılmadı.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
