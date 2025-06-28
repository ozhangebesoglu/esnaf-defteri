"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Truck } from "lucide-react"

export default function Suppliers() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Truck /> Tedarikçiler</CardTitle>
        <CardDescription>Tedarikçilerinizi ve tedarikçi faturalarını buradan yönetebilirsiniz.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-48 border-2 border-dashed rounded-lg">
            <p className="text-lg font-medium">Çok Yakında</p>
            <p>Bu özellik geliştirme aşamasındadır.</p>
        </div>
      </CardContent>
    </Card>
  )
}
