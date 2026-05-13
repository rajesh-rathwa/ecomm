import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/utills/mongoose";

export const runtime = "nodejs";

type GridFsFileDocument = {
  contentType?: string;
  metadata?: {
    contentType?: string;
  };
};

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ REQUIRED in Next 15

    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: "DB not connected" }, { status: 500 });
    }

    const fileId = new mongoose.Types.ObjectId(id);
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "uploads",
    });

    const files = await bucket.find({ _id: fileId }).toArray();
    const file = files?.[0];

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const downloadStream = bucket.openDownloadStream(fileId);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        downloadStream.on("data", (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        downloadStream.on("end", () => {
          controller.close();
        });
        downloadStream.on("error", (error) => {
          controller.error(error);
        });
      },
      cancel() {
        downloadStream.destroy();
      },
    });
    const typedFile = file as GridFsFileDocument;

    const contentType =
      typedFile.contentType ||
      typedFile.metadata?.contentType ||
      "application/octet-stream";

    return new NextResponse(stream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load file" }, { status: 500 });
  }
}
