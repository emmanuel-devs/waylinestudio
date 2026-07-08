import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mediaUrl } from "@/lib/content";
import { Button } from "@/components/ui/button";

type Props = {
  value: string | null;
  onChange: (path: string | null) => void;
  folder?: string;
  label?: string;
};

export function ImageUpload({ value, onChange, folder = "uploads", label = "Image" }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    setUploading(false);
    if (error) {
      alert("Upload failed: " + error.message);
      return;
    }
    onChange(path);
  }

  const url = mediaUrl(value);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {url ? (
        <div className="relative w-full max-w-md">
          <img src={url} alt="" className="w-full h-48 object-cover rounded border border-hairline" />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => onChange(null)}
          >
            Remove
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-hairline rounded p-8 text-center text-sm text-muted-foreground">
          No image
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
        className="block text-sm"
      />
      {uploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
    </div>
  );
}

type MultiProps = {
  values: string[];
  onChange: (paths: string[]) => void;
  folder?: string;
  label?: string;
};

export function MultiImageUpload({ values, onChange, folder = "uploads", label = "Gallery" }: MultiProps) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList) {
    setUploading(true);
    const newPaths: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (error) {
        alert("Upload failed: " + error.message);
        continue;
      }
      newPaths.push(path);
    }
    setUploading(false);
    onChange([...values, ...newPaths]);
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {values.map((p, i) => {
          const url = mediaUrl(p);
          return (
            <div key={p} className="relative">
              {url && <img src={url} alt="" className="w-full h-28 object-cover rounded border border-hairline" />}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-1 right-1"
                onClick={() => onChange(values.filter((_, j) => j !== i))}
              >
                ×
              </Button>
            </div>
          );
        })}
      </div>
      <input
        type="file"
        accept="image/*"
        multiple
        disabled={uploading}
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="block text-sm"
      />
      {uploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
    </div>
  );
}
