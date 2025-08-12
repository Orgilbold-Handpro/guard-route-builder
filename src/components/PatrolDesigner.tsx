import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import MapPicker from "@/components/MapPicker";

// Types matching the requested JSON shape
export type PatrolPoint = {
  name: string;
  desc?: string;
  lat: number | "";
  lng: number | "";
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

const emptyPoint = (): PatrolPoint => ({ name: "", desc: "", lat: "", lng: "" });
const emptyPosition = (): PatrolPosition => ({ name: "", desc: "", lat: "", lng: "", points: [] });

const PatrolDesigner = () => {
  const [positions, setPositions] = useState<PatrolPosition[]>([emptyPosition()]);


  // Mapbox token (temporary input) and map picker state
  const [mapboxToken, setMapboxToken] = useState("");
  useEffect(() => {
    const saved = localStorage.getItem("mapbox_token") || "";
    setMapboxToken(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("mapbox_token", mapboxToken || "");
  }, [mapboxToken]);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{
    type: "position" | "point";
    posIndex: number;
    pointIndex?: number;
  } | null>(null);

  const openPickForPosition = (posIndex: number) => {
    setPickerTarget({ type: "position", posIndex });
    setPickerOpen(true);
  };
  const openPickForPoint = (posIndex: number, pointIndex: number) => {
    setPickerTarget({ type: "point", posIndex, pointIndex });
    setPickerOpen(true);
  };

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



  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Эргүүл цэг төлөвлөгөө үүсгэгч</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Систем доторх менежерийн хэсэгт ашиглах байрлал, дэд цэгүүдээ үүсгээд баруун талд урьдчилсан харагдацыг шалгаарай.
        </p>
      </div>

      <div className="rounded-md border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2 space-y-2">
            <Label>Mapbox public token</Label>
            <Input
              placeholder="pk.***"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground md:col-span-1">
            Token оруулснаар газрын зураг идэвхжинэ. Mapbox → Tokens хэсгээс public token авна.
          </p>
        </div>
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
                  <div className="md:col-span-2">
                    <Label>Координат</Label>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <div className="text-sm text-muted-foreground">
                        {typeof pos.lat === "number" && typeof pos.lng === "number"
                          ? `lat: ${pos.lat}, lng: ${pos.lng}`
                          : "Сонгоогүй"}
                      </div>
                      <Button size="sm" onClick={() => openPickForPosition(idx)} disabled={!mapboxToken}>
                        Газрын зураг дээр сонгох
                      </Button>
                      {(pos.lat !== "" || pos.lng !== "") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updatePosition(idx, "lat", "");
                            updatePosition(idx, "lng", "");
                          }}
                        >
                          Цэвэрлэх
                        </Button>
                      )}
                    </div>
                    {!mapboxToken && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Газрын зураг ажиллуулахын тулд Mapbox token оруулна уу.
                      </p>
                    )}
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
                          <div className="md:col-span-2">
                            <Label>Координат</Label>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                              <div className="text-sm text-muted-foreground">
                                {typeof pt.lat === "number" && typeof pt.lng === "number"
                                  ? `lat: ${pt.lat}, lng: ${pt.lng}`
                                  : "Сонгоогүй"}
                              </div>
                              <Button size="sm" onClick={() => openPickForPoint(idx, pi)} disabled={!mapboxToken}>
                                Газрын зураг дээр сонгох
                              </Button>
                              {(pt.lat !== "" || pt.lng !== "") && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    updatePoint(idx, pi, "lat", "");
                                    updatePoint(idx, pi, "lng", "");
                                  }}
                                >
                                  Цэвэрлэх
                                </Button>
                              )}
                            </div>
                            {!mapboxToken && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Газрын зураг ажиллуулахын тулд Mapbox token оруулна уу.
                              </p>
                            )}
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
              <CardTitle className="text-base">Урьдчилсан харагдац</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[560px] pr-4">
                {positions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Одоогоор байрлал алга.</p>
                ) : (
                  <div className="space-y-4">
                    {positions.map((p, i) => (
                      <div key={i} className="rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{p.name || `Байрлал #${i + 1}`}</div>
                            <div className="text-xs text-muted-foreground">{p.desc}</div>
                          </div>
                          <Badge variant="secondary">{p.points.length} цэг</Badge>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {(typeof p.lat === "number" && typeof p.lng === "number") ? (
                            <span>Коорд: {p.lat}, {p.lng}</span>
                          ) : (
                            <span>Коорд оруулаагүй</span>
                          )}
                        </div>
                        {p.points.length > 0 && (
                          <div className="mt-3 space-y-3">
                            {p.points.map((pt, pi) => (
                              <div key={pi} className="rounded border bg-card p-3">
                                <div className="text-sm font-medium">{pt.name || `Цэг #${pi + 1}`}</div>
                                <div className="text-xs text-muted-foreground">{pt.desc}</div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {(typeof pt.lat === "number" && typeof pt.lng === "number") ? (
                                    <span>Коорд: {pt.lat}, {pt.lng}</span>
                                  ) : (
                                    <span>Коорд оруулаагүй</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Жишээ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ж: “А байр” дотор “1-р орц”, “2-р орц”, “Граж” гэх мэт дэд цэгүүдийг нэмнэ.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Координат сонгох</DialogTitle>
          </DialogHeader>

          {!mapboxToken ? (
            <p className="text-sm text-destructive">Mapbox token оруулна уу.</p>
          ) : (
            <MapPicker
              token={mapboxToken}
              value={
                pickerTarget
                  ? pickerTarget.type === "position"
                    ? (typeof positions[pickerTarget.posIndex]?.lat === "number" &&
                       typeof positions[pickerTarget.posIndex]?.lng === "number"
                      ? { lat: positions[pickerTarget.posIndex].lat as number, lng: positions[pickerTarget.posIndex].lng as number }
                      : undefined)
                    : (typeof positions[pickerTarget.posIndex]?.points[pickerTarget.pointIndex!]?.lat === "number" &&
                       typeof positions[pickerTarget.posIndex]?.points[pickerTarget.pointIndex!]?.lng === "number"
                      ? { lat: positions[pickerTarget.posIndex].points[pickerTarget.pointIndex!].lat as number, lng: positions[pickerTarget.posIndex].points[pickerTarget.pointIndex!].lng as number }
                      : undefined)
                  : undefined
              }
              onChange={(c) => {
                if (!pickerTarget) return;
                if (pickerTarget.type === "position") {
                  updatePosition(pickerTarget.posIndex, "lat", c.lat);
                  updatePosition(pickerTarget.posIndex, "lng", c.lng);
                } else {
                  updatePoint(pickerTarget.posIndex, pickerTarget.pointIndex!, "lat", c.lat);
                  updatePoint(pickerTarget.posIndex, pickerTarget.pointIndex!, "lng", c.lng);
                }
              }}
            />
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setPickerOpen(false)}>Хаах</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default PatrolDesigner;
