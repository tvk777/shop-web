import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function App() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Shop</CardTitle>
          <CardDescription>Coming soon.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input id="search" placeholder="Find an item" />
          </div>
          <Button>Search</Button>
        </CardContent>
      </Card>
    </main>
  )
}

export default App
