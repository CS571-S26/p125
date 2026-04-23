import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function HelloWorld() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Hello from vui</CardTitle>
        <CardDescription>
          Your registry is working correctly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full">Get Started</Button>
      </CardContent>
    </Card>
  )
}
