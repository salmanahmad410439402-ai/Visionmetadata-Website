import type { AssetMetadata, QualityReport } from "@/contexts/AssetsContext";

export interface SampleDemoPayload {
  file: File;
  thumbnailUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  metadata: AssetMetadata;
  qualityReport: QualityReport;
}

/**
 * Generates a real client-side JPEG sample stock asset and pre-computed
 * review-ready metadata so visitors can evaluate the editor, confidence
 * breakdown, bulk tools, and 6-marketplace CSV/ZIP exports without an API key.
 */
export async function createSampleDemoAsset(): Promise<SampleDemoPayload> {
  const width = 1280;
  const height = 800;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  let ctx: CanvasRenderingContext2D | null = null;
  try {
    ctx = canvas.getContext("2d");
  } catch {
    ctx = null;
  }

  if (ctx) {
    // Golden-hour sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, height * 0.65);
    sky.addColorStop(0, "#1e293b");
    sky.addColorStop(0.45, "#4f46e5");
    sky.addColorStop(0.8, "#f59e0b");
    sky.addColorStop(1, "#fde68a");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // Warm sun glow (left-third composition leaving copy space on right)
    const sun = ctx.createRadialGradient(310, 290, 20, 310, 290, 260);
    sun.addColorStop(0, "rgba(255, 251, 235, 0.95)");
    sun.addColorStop(0.35, "rgba(251, 191, 36, 0.55)");
    sun.addColorStop(1, "rgba(251, 191, 36, 0)");
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, width, height);

    // Distant mountain ridge
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.lineTo(220, 390);
    ctx.lineTo(470, 465);
    ctx.lineTo(760, 360);
    ctx.lineTo(1040, 445);
    ctx.lineTo(width, 395);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Foreground commercial roof surface
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.moveTo(0, 560);
    ctx.lineTo(width, 500);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Photovoltaic solar panel array perspective grid
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 4; col++) {
        const x = 110 + col * 270 - row * 35;
        const y = 555 + row * 105;
        const w = 230;
        const h = 82;

        ctx.fillStyle = "#1d4ed8";
        ctx.strokeStyle = "#93c5fd";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 6);
        ctx.fill();
        ctx.stroke();

        // Solar cell grid lines
        ctx.strokeStyle = "rgba(191, 219, 254, 0.35)";
        ctx.lineWidth = 1;
        for (let gx = 1; gx < 6; gx++) {
          ctx.beginPath();
          ctx.moveTo(x + (w / 6) * gx, y);
          ctx.lineTo(x + (w / 6) * gx, y + h);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(x, y + h / 2);
        ctx.lineTo(x + w, y + h / 2);
        ctx.stroke();
      }
    }
  }

  let blob: Blob = new Blob([], { type: "image/jpeg" });
  if (ctx && typeof canvas.toBlob === "function") {
    blob = await new Promise((resolve) => {
      canvas.toBlob(
        (b) => resolve(b || new Blob([], { type: "image/jpeg" })),
        "image/jpeg",
        0.9
      );
    });
  }

  const file = new File([blob], "rooftop-solar-array-golden-hour-demo.jpg", {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
  const thumbnailUrl =
    typeof URL !== "undefined" && typeof URL.createObjectURL === "function"
      ? URL.createObjectURL(blob)
      : "data:image/jpeg;base64,";

  const confidenceBreakdown = {
    subjectClarity: 96,
    differentiatorStrength: 92,
    keywordPrecision: 94,
    complianceSafety: 98,
  };

  const riskAnalysis = {
    flags: [],
    severity: "NONE" as const,
    reviewerReasoning: [
      "No brand logos, proprietary building signage, or recognizable people detected.",
      "Opening 5 words state the literal subject ('Commercial rooftop solar panel array') without comma stuffing.",
      "Title length (182 characters) fits within Adobe Stock (200 chars) and Shutterstock limits; shorten if targeting Freepik's 100-char cap.",
    ],
  };

  const platformReadiness = {
    adobeStock: "READY" as const,
    freepik: "READY" as const,
    shutterstock: "READY" as const,
  };

  const metadata: AssetMetadata = {
    title:
      "Commercial rooftop solar panel array at golden hour with mountain horizon and copy space for clean energy infrastructure and sustainable power generation",
    description:
      "Wide-angle view of photovoltaic solar panels installed on a modern commercial rooftop against a warm sunset sky and distant mountains, illustrating renewable electricity and net-zero infrastructure.",
    keywords: [
      "solar panel",
      "photovoltaic array",
      "rooftop solar",
      "renewable energy",
      "clean electricity",
      "golden hour",
      "commercial rooftop",
      "mountain horizon",
      "solar installation",
      "sustainable power",
      "green infrastructure",
      "energy transition",
      "net zero",
      "carbon reduction",
      "solar cell",
      "power generation",
      "clean technology",
      "sunset sky",
      "wide angle",
      "copy space",
      "environmental engineering",
      "industrial roof",
      "utility scale",
      "climate solution",
      "alternative energy",
      "grid modernization",
      "energy efficiency",
      "sunlight reflection",
      "modern architecture",
      "sustainability",
      "landscape",
      "outdoors",
      "horizontal",
      "no people",
    ],
    confidence: 95,
    confidenceBreakdown,
    riskAnalysis,
    platformReadiness,
    modelUsed: "Sample Demo (No API Key)",
    isAIGenerated: false,
    noPeopleDetected: true,
    searchIntent: "commercial",
  };

  const qualityReport: QualityReport = {
    confidence: 95,
    confidenceBreakdown,
    riskAnalysis,
    platformReadiness,
    editorialFlag: false,
    editorialReason: null,
    qualityCheckedAt: new Date().toISOString(),
    modelUsed: "Sample Demo (No API Key)",
  };

  return {
    file,
    thumbnailUrl,
    width,
    height,
    aspectRatio: width / height,
    metadata,
    qualityReport,
  };
}
