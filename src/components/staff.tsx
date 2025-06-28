"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users } from "lucide-react"

export default function Staff() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users /> Personel</CardTitle>
        <CardDescription>Personel bilgilerini ve maaş ödemelerini buradan yönetebilirsiniz.</CardDescription>
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
