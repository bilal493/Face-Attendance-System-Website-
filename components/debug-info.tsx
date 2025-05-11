"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bug } from "lucide-react"

interface DebugInfoProps {
  data: any
  title?: string
}

export function DebugInfo({ data, title = "Debug Information" }: DebugInfoProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="my-4">
      <Button variant="outline" size="sm" onClick={() => setIsVisible(!isVisible)} className="mb-2 text-xs">
        <Bug className="mr-1 h-3 w-3" />
        {isVisible ? "Hide Debug Info" : "Show Debug Info"}
      </Button>

      {isVisible && (
        <Card className="bg-slate-50 dark:bg-slate-900 border-dashed">
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <pre className="text-xs overflow-auto max-h-[300px] p-2 bg-slate-100 dark:bg-slate-800 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
