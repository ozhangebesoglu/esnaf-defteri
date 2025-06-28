"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertTriangle, Info, ShieldX } from "lucide-react"
import { alerts } from "@/lib/data"
import type { MonitoringAlert } from "@/lib/types"

const alertIcons = {
  low: <Info className="h-4 w-4" />,
  medium: <AlertTriangle className="h-4 w-4" />,
  high: <ShieldX className="h-4 w-4" />,
}

const alertVariants: { [key in MonitoringAlert['severity']]: "default" | "destructive" } = {
  low: "default",
  medium: "default",
  high: "destructive",
}

export default function Monitoring() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uyarılar</CardTitle>
        <CardDescription>Potansiyel veri bütünlüğü ve uyumluluk sorunları için gerçek zamanlı uyarılar.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map(alert => (
            <Alert key={alert.id} variant={alertVariants[alert.severity]}>
              {alertIcons[alert.severity]}
              <AlertTitle className="font-headline">{alert.title}</AlertTitle>
              <AlertDescription>
                <p>{alert.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
              </AlertDescription>
            </Alert>
          ))}
          {alerts.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Şu anda uyarı yok. Her şey yolunda görünüyor!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
