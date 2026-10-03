import { NextResponse } from "next/server";
import { z } from "zod";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";
import { generateHash } from "@/lib/hash";

const donationSchema = z.object({
  name: z.string().min(1),
  amount: z.coerce.number().positive(),
  organization: z.string().min(1),
  purpose: z.string().min(1),
  date: z.string().min(1),
  issuer_id: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = donationSchema.parse(body);

    const recordData = {
      name: data.name,
      amount: data.amount,
      organization: data.organization,
      purpose: data.purpose,
      date: data.date,
    };

    const hash = generateHash(recordData);

    const { data: record, error } = await supabase
      .from("records")
      .insert({
        type: "donation",
        issuer_id: data.issuer_id ?? null,
        name: data.name,
        amount: data.amount,
        organization: data.organization,
        purpose: data.purpose,
        date: data.date,
        record_data: recordData,
        hash,
      })
      .select("record_id, hash")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    await supabase.from("audit_logs").insert({
      record_id: record.record_id,
      action: "DONATION_CREATED",
      new_hash: hash,
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const verificationUrl = `${baseUrl}/verify/${record.record_id}`;
    const qrCode = await QRCode.toDataURL(verificationUrl);

    return NextResponse.json({
      success: true,
      record_id: record.record_id,
      hash,
      verification_url: verificationUrl,
      qr_code: qrCode,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid donation data",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create donation" },
      { status: 500 }
    );
  }
}