import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

// Types matching the requested JSON shape
export type PatrolPoint = {
  name: string;
  desc?: string;
  lat: number | "";
  lng: number | "";
  userId?: string;
  pictureDesc?: string;
  picture?: string;
};

export type PatrolPosition = {
  name: string;
  desc?: string;
  lat: number | "";
  lng: number | "";
  points: PatrolPoint[];
};

const toNumber = (v: string): number | "" => {
  if (v === "") return "";
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : "";
};

const emptyPoint = (): PatrolPoint => ({ name: "", desc: "", lat: "", lng: "", userId: "", pictureDesc: "", picture: "" });
const emptyPosition = (): PatrolPosition => ({ name: "", desc: "", lat: "", lng: "", points: [] });

const PatrolDesigner = () => {
  const [positions, setPositions] = useState<PatrolPosition[]>([emptyPosition()]);

  const exportJson = useMemo(() => {
    const cleaned = positions.map((p) => ({
      name: p.name,
      desc: p.desc,
      lat: typeof p.lat === "number" ? p.lat : undefined,
      lng: typeof p.lng === "number" ? p.lng : undefined,
      points: p.points.map((pt) => ({
        name: pt.name,
        desc: pt.desc,
        lat: typeof pt.lat === "number" ? pt.lat : undefined,
        lng: typeof pt.lng === "number" ? pt.lng : undefined,
        userId: pt.userId,
        pictureDesc: pt.pictureDesc,
        picture: pt.picture,
      })),
    }));
    return JSON.stringify({ positions: cleaned }, null, 2);
  }, [positions]);

  const addPosition = () => setPositions((prev) => [...prev, emptyPosition()]);
  const removePosition = (index: number) =>
    setPositions((prev) => prev.filter((_, i) => i !== index));
  const updatePosition = (index: number, field: keyof PatrolPosition, value: any) => {
    setPositions((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const addPoint = (posIndex: number) =>
    setPositions((prev) =>
      prev.map((p, i) => (i === posIndex ? { ...p, points: [...p.points, emptyPoint()] } : p))
    );
  const removePoint = (posIndex: number, pointIndex: number) =>
    setPositions((prev) =>
      prev.map((p, i) =>
        i === posIndex ? { ...p, points: p.points.filter((_, pi) => pi !== pointIndex) } : p
      )
    );
  const updatePoint = (
    posIndex: number,
    pointIndex: number,
    field: keyof PatrolPoint,
    value: any
  ) => {
    setPositions((prev) =>
      prev.map((p, i) =>
        i === posIndex
          ? {
              ...p,
              points: p.points.map((pt, pi) => (pi === pointIndex ? { ...pt, [field]: value } : pt)),
            }
          : p
      )
    );
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
      toast({ description: "JSON амжилттай хууллаа." });
    } catch (e) {
      toast({ description: "Хуулах үед алдаа гарлаа.", });
    }
  };

  const downloadJson = () => {
    const blob = new Blob([exportJson], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patrol-positions.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Эргүүл цэг төлөвлөгөө үүсгэгч</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Систем дотор ашиглах Patrol positions болон дэд цэгүүд (points)-ээ үүсгээд JSON-оор экспортлоно.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="space-y-4">
          {positions.map((pos, idx) => (
            <Card key={idx} className="">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-base">Байрлал (position) #{idx + 1}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => addPoint(idx)}>
                    Дэд цэг нэмэх
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => removePosition(idx)}>
                    Устгах
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Нэр</Label>
                    <Input
                      placeholder="Ж: North Gate / А байр"
                      value={pos.name}
                      onChange={(e) => updatePosition(idx, "name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Тайлбар</Label>
                    <Input
                      placeholder="Ж: Main vehicle entrance / 1-р орц"
                      value={pos.desc ?? ""}
                      onChange={(e) => updatePosition(idx, "desc", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Өргөрөг (lat)</Label>
                    <Input
                      inputMode="decimal"
                      placeholder="Ж: 47.918412"
                      value={pos.lat}
                      onChange={(e) => updatePosition(idx, "lat", toNumber(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Уртраг (lng)</Label>
                    <Input
                      inputMode="decimal"
                      placeholder="Ж: 106.917271"
                      value={pos.lng}
                      onChange={(e) => updatePosition(idx, "lng", toNumber(e.target.value))}
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="font-medium">Дэд цэгүүд (points)</h3>
                  {pos.points.length === 0 && (
                    <p className="text-sm text-muted-foreground">Одоогоор дэд цэг алга. "Дэд цэг нэмэх" дарна уу.</p>
                  )}
                  {pos.points.map((pt, pi) => (
                    <Card key={pi} className="border-dashed">
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Нэр</Label>
                            <Input
                              placeholder="Ж: Camera-01 / 2-р орц"
                              value={pt.name}
                              onChange={(e) => updatePoint(idx, pi, "name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Тайлбар</Label>
                            <Input
                              placeholder="Ж: PTZ cam pole / Граж"
                              value={pt.desc ?? ""}
                              onChange={(e) => updatePoint(idx, pi, "desc", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Өргөрөг (lat)</Label>
                            <Input
                              inputMode="decimal"
                              placeholder="Ж: 47.918500"
                              value={pt.lat}
                              onChange={(e) => updatePoint(idx, pi, "lat", toNumber(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Уртраг (lng)</Label>
                            <Input
                              inputMode="decimal"
                              placeholder="Ж: 106.917350"
                              value={pt.lng}
                              onChange={(e) => updatePoint(idx, pi, "lng", toNumber(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Хэрэглэгч ID (userId)</Label>
                            <Input
                              placeholder="Ж: 66b9c93be2f4a2c4f3a1d222"
                              value={pt.userId ?? ""}
                              onChange={(e) => updatePoint(idx, pi, "userId", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Зургийн тайлбар (pictureDesc)</Label>
                            <Input
                              placeholder="Ж: Rust on mount / Window crack"
                              value={pt.pictureDesc ?? ""}
                              onChange={(e) => updatePoint(idx, pi, "pictureDesc", e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <Label>Зургийн холбоос (picture URL)</Label>
                            <Input
                              placeholder="https://cdn.example.com/patrol/cam01.jpg"
                              value={pt.picture ?? ""}
                              onChange={(e) => updatePoint(idx, pi, "picture", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button variant="destructive" size="sm" onClick={() => removePoint(idx, pi)}>
                            Дэд цэг устгах
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex items-center gap-3">
            <Button onClick={addPosition}>Байрлал нэмэх</Button>
            <Button variant="outline" onClick={() => setPositions([emptyPosition()])}>Шинэ эхлэх</Button>
          </div>
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">JSON урьдчилсан харагдац</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={exportJson} readOnly className="min-h-[520px] font-mono text-xs" />
              <div className="flex gap-2 mt-4">
                <Button onClick={copyJson}>JSON хуулж авах</Button>
                <Button variant="secondary" onClick={downloadJson}>JSON татах</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Жишээ бүтэц</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ж: "А байр" дотор "1-р орц", "2-р орц", "Граж" гэх мэт дэд цэгүүдийг нэмнэ.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
};

export default PatrolDesigner;
