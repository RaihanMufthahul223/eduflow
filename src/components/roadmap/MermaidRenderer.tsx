"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidRendererProps {
  chart: string;
  className?: string;
  onNodeClick?: (nodeId: string) => void;
}

export default function MermaidRenderer({
  chart,
  className = "",
  onNodeClick,
}: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        primaryColor: "#6366f1",
        primaryTextColor: "#fff",
        primaryBorderColor: "#818cf8",
        lineColor: "#475569",
        secondaryColor: "#1e1b4b",
        tertiaryColor: "#1e293b",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
      },
      flowchart: {
        htmlLabels: true,
        curve: "basis",
        padding: 15,
      },
    });
  }, []);

  useEffect(() => {
    const renderChart = async () => {
      if (!chart) return;
      try {
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError("Gagal merender diagram. Periksa syntax mermaid code.");
      }
    };
    renderChart();
  }, [chart]);

  useEffect(() => {
    if (!containerRef.current || !onNodeClick) return;

    const nodes = containerRef.current.querySelectorAll(".node");
    const handleClick = (e: Event) => {
      const node = (e.currentTarget as HTMLElement).id;
      if (node) {
        // Extract the node id from the mermaid-generated id
        const nodeId = node.replace(/^flowchart-/, "").replace(/-\d+$/, "");
        onNodeClick(nodeId);
      }
    };

    nodes.forEach((node) => {
      (node as HTMLElement).style.cursor = "pointer";
      node.addEventListener("click", handleClick);
    });

    return () => {
      nodes.forEach((node) => {
        node.removeEventListener("click", handleClick);
      });
    };
  }, [svg, onNodeClick]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`mermaid-container overflow-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
