"use client";

import { useLayerStore } from "@/lib/layer-store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function ExportAsset({ resource }: { resource: string }) {
  const activeLayer = useLayerStore((state) => state.activeLayer);
  const [selected, setSelected] = useState("original");
  const [isClient, setIsClient] = useState(false);

  // Ensure component is client-side before running download logic
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDownload = async () => {
    if (!isClient || !activeLayer?.publicId) return;

    try {
      const res = await fetch(
        `/api/download?publicId=${activeLayer.publicId}&quality=${selected}&resource_type=${activeLayer.resourceType}&format=${activeLayer.format}&url=${activeLayer.url}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch image URL");
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Handle download logic without document
      console.log("Download URL:", data.url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger disabled={!activeLayer?.url} asChild>
        <Button variant="outline" className="py-8">
          <span className="flex gap-1 items-center justify-center flex-col text-xs font-medium">
            Export
            <Download size={18} />
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div>
          <h3 className="text-center text-2xl font-medium pb-4">Export</h3>
          <div className="flex flex-col gap-4">
            {["original", "large", "medium", "small"].map((size, index) => (
              <Card
                key={index}
                onClick={() => setSelected(size)}
                className={cn(
                  selected === size ? "border-primary" : null,
                  "p-4 cursor-pointer"
                )}
              >
                <CardContent className="p-0">
                  <CardTitle className="text-md capitalize">{size}</CardTitle>
                  <CardDescription>
                    {size === "original"
                      ? `${activeLayer.width}X${activeLayer.height}`
                      : `${(activeLayer.width! * (size === "large" ? 0.7 : size === "medium" ? 0.5 : 0.3)).toFixed(0)}X${(activeLayer.height! * (size === "large" ? 0.7 : size === "medium" ? 0.5 : 0.3)).toFixed(0)}`}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Button onClick={handleDownload} disabled={!isClient}>
          Download {selected} {resource}
        </Button>
      </DialogContent>
    </Dialog>
  );
}