import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateHash } from "@/lib/hash";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: record, error } = await supabase
      .from("records")
      .select("*")
      .eq("record_id", id)
      .single();

    if (error || !record) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    const recalculatedHash = generateHash(record.record_data);
    const isVerified = recalculatedHash === record.hash;

    await supabase.from("audit_logs").insert({
      record_id: record.record_id,
      action: isVerified ? "VERIFIED" : "INTEGRITY_CHECK_FAILED",
      old_hash: record.hash,
      new_hash: recalculatedHash,
    });

    return NextResponse.json({
      success: true,
      status: isVerified ? "VERIFIED" : "TAMPERED",
      record: {
        record_id: record.record_id,
        type: record.type,
        name: record.name,
        amount: record.amount,
        course: record.course,
        organization: record.organization,
        purpose: record.purpose,
        date: record.date,
      },
      stored_hash: record.hash,
      recalculated_hash: recalculatedHash,
    });
  } catch {
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}