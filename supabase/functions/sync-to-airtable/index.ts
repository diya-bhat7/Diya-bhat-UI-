// @ts-nocheck

import { createClient } from "supabase"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const AIRTABLE_PAT = Deno.env.get("AIRTABLE_PAT");
const AIRTABLE_BASE_ID = Deno.env.get("AIRTABLE_BASE_ID");
const AIRTABLE_TABLE_NAME = Deno.env.get("AIRTABLE_TABLE_NAME") ?? "Contacts";

interface SubmissionPayload {
  id: string;
  name: string;
  email: string;
  airtable_id?: string;
  source?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
      console.error("Missing Airtable configuration. Check AIRTABLE_PAT and AIRTABLE_BASE_ID env vars.");
      return new Response(
        JSON.stringify({
          error: "Airtable is not configured. Please set AIRTABLE_PAT and AIRTABLE_BASE_ID.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { id, name, email, airtable_id, source }: SubmissionPayload = await req.json();

    // LOOP PREVENTION: Skip if this change came from Airtable
    if (source === "airtable") {
      console.log(`Skipping sync for ${name} - source is Airtable (preventing loop)`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "source is airtable" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Syncing submission to Airtable: ${name} (${email})`);

    let airtableRecordId = airtable_id;
    let action: "created" | "updated";

    if (airtable_id) {
      // UPDATE existing Airtable record (PATCH)
      console.log(`Updating existing Airtable record: ${airtable_id}`);

      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${airtable_id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${AIRTABLE_PAT}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields: {
              Name: name,
              Email: email,
            },
          }),
        }
      );

      if (!airtableResponse.ok) {
        const errorText = await airtableResponse.text();
        console.error("Airtable PATCH error:", errorText);

        // If record not found, try creating instead
        if (airtableResponse.status === 404) {
          console.log("Airtable record not found, will create new one");
          airtableRecordId = null;
        } else {
          throw new Error(`Airtable API error: ${airtableResponse.status}`);
        }
      } else {
        action = "updated";
        console.log(`Updated Airtable record: ${airtable_id}`);
      }
    }

    if (!airtableRecordId) {
      // CREATE new Airtable record (POST)
      const airtableResponse = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AIRTABLE_PAT}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            records: [
              {
                fields: {
                  Name: name,
                  Email: email,
                  "Postgres ID": id,
                },
              },
            ],
          }),
        }
      );

      if (!airtableResponse.ok) {
        const errorText = await airtableResponse.text();
        console.error("Airtable POST error:", errorText);
        throw new Error(`Airtable API error: ${airtableResponse.status}`);
      }

      const airtableData = await airtableResponse.json();
      airtableRecordId = airtableData.records[0].id;
      action = "created";
      console.log(`Created Airtable record: ${airtableRecordId}`);
    }

    // Update Supabase record with Airtable ID and sync status
    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        airtable_id: airtableRecordId,
        sync_status: "synced",
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      throw updateError;
    }

    console.log(`✅ Successfully ${action}: ${name}`);

    return new Response(
      JSON.stringify({ success: true, action, airtable_id: airtableRecordId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Sync error:", message);

    // Try to update sync_status to error
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      const body = await req.clone().json();
      if (body.id) {
        await supabase
          .from("submissions")
          .update({ sync_status: "error" })
          .eq("id", body.id);
      }
    } catch (e) {
      console.error("Failed to update sync_status:", e);
    }

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
