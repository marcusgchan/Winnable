import { Button } from "@/lib/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/lib/ui/card";

export function DraftMembersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-center text-2xl font-bold ">
        Welcome to Lobby Name!
      </h1>
      <div className="grid gap-2 [grid-template-areas:'btns''team1''team2'] md:grid-cols-[1fr_min-content_1fr] md:[grid-template-areas:'team1_btns_team2']">
        <Card className="flex min-h-96 flex-col [grid-area:team1]">
          <CardHeader>
            <CardTitle>Team 1</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberList
              members={[
                { name: "bob", id: "123" },
                { id: "321", name: "joe" },
                { id: "0", name: "joe" },
                { id: "1", name: "joe" },
                { id: "2", name: "joe" },
                { id: "3", name: "joe" },
                { id: "4", name: "joe" },
                { id: "5", name: "joe" },
                { id: "6", name: "joe" },
                { id: "7", name: "joe" },
                { id: "8", name: "joe" },
                { id: "9", name: "joe" },
                { id: "10", name: "joe" },
                { id: "11", name: "joe" },
                { id: "12", name: "joe" },
                { id: "13", name: "joe" },
              ]}
            />
          </CardContent>
          <CardFooter className="mt-auto self-center">
            <Button>Join Team</Button>
          </CardFooter>
        </Card>
        <div className="flex flex-row items-center gap-2 [grid-area:btns] md:flex-col md:items-start">
          <Button>Randomize</Button>
          <Button>Start Game</Button>
        </div>
        <Card className="flex min-h-96 flex-col [grid-area:team2]">
          <CardHeader>
            <CardTitle>Team 2</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberList members={[{ name: "bob", id: "123" }]} />
          </CardContent>
          <CardFooter className="mt-auto self-center">
            <Button>Join Team</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

/** @param {{ members: {id: string, name: string}[] }} */
function MemberList({ members }) {
  return (
    <ul className="max-h-80 space-y-2 overflow-y-auto">
      {members.map(({ id, name }) => (
        <li key={id}>
          <Member name={name} />
        </li>
      ))}
    </ul>
  );
}

/** @param {{ name: string }} */
function Member({ name }) {
  return <div className="">{name}</div>;
}
