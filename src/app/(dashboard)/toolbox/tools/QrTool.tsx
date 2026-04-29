"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { QrCode, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export function QrTool({ onBack }: { onBack: () => void }) {
  const [text, setText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const generateQR = async () => {
    if (!text.trim()) return;
    setGenerating(true);
    try {
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: { dark: "#6366f1", light: "#ffffff" },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error("QR generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "qrcode-eduflow.png";
    link.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack}>← Kembali</Button>
        <h2 className="text-xl font-bold">QR Code Generator</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Teks atau URL</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Masukkan URL atau teks yang ingin dijadikan QR Code..."
                className="min-h-[120px]"
              />
            </div>
            <Button onClick={generateQR} disabled={generating || !text.trim()}>
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
              Generate QR Code
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
            {qrDataUrl ? (
              <div className="text-center space-y-4">
                <div className="inline-block p-4 bg-white rounded-2xl shadow-lg">
                  <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
                </div>
                <Button onClick={downloadQR} variant="outline">
                  <Download className="mr-2 h-4 w-4" />Download PNG
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <QrCode className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>QR Code akan muncul di sini</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
