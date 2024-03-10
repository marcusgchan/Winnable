import { Card, CardContent, CardHeader, CardTitle } from "@/lib/ui/card";

export function HomePage() {
  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>Lobby</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>Lobby 1</span>
              <span>3/10</span>
            </li>
            <li className="flex justify-between">
              <span>Lobby 1</span>
              <span>3/10</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
