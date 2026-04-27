// Mercado Pago IPN/Webhook handler - Supabase Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MP_ACCESS_TOKEN = "APP_USR-3532237601321528-042611-f0abe2e43caac1aa14f47687a2e7bb19-742790793";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    };

    serve(async (req: Request) => {
      if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

        try {
            const url = new URL(req.url);
                let paymentId: string | null =
                      url.searchParams.get("id") ||
                            url.searchParams.get("data.id");

                                if (req.method === "POST") {
                                      try {
                                              const body = await req.json();
                                                      console.log("Webhook body:", JSON.stringify(body));
                                                              if (body.data?.id) paymentId = String(body.data.id);
                                                                    } catch (_) {}
                                                                        }

                                                                            console.log("MP Webhook - paymentId:", paymentId);

                                                                                if (!paymentId) {
                                                                                      return new Response(JSON.stringify({ error: "No payment id" }), {
                                                                                              status: 400, headers: { ...cors, "Content-Type": "application/json" },
                                                                                                    });
                                                                                                        }

                                                                                                            const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                                                                                                                  headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
                                                                                                                      });

                                                                                                                          if (!mpRes.ok) {
                                                                                                                                const err = await mpRes.text();
                                                                                                                                      console.error("MP API error:", err);
                                                                                                                                            return new Response(JSON.stringify({ error: "MP API error" }), {
                                                                                                                                                    status: 200, headers: { ...cors, "Content-Type": "application/json" },
                                                                                                                                                          });
                                                                                                                                                              }

                                                                                                                                                                  const payment = await mpRes.json();
                                                                                                                                                                      console.log("Payment:", payment.id, "status:", payment.status, "email:", payment.payer?.email);

                                                                                                                                                                          if (payment.status !== "approved") {
                                                                                                                                                                                return new Response(JSON.stringify({ ok: true, status: payment.status }), {
                                                                                                                                                                                        status: 200, headers: { ...cors, "Content-Type": "application/json" },
                                                                                                                                                                                              });
                                                                                                                                                                                                  }

                                                                                                                                                                                                      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
                                                                                                                                                                                                          const payerEmail = payment.payer?.email;
                                                                                                                                                                                                              const externalRef = payment.external_reference;
                                                                                                                                                                                                                  let updated = false;

                                                                                                                                                                                                                      if (externalRef && externalRef !== "anonymous") {
                                                                                                                                                                                                                            const { error } = await supabase
                                                                                                                                                                                                                                    .from("usuarios").update({ is_premium: true }).eq("id", externalRef);
                                                                                                                                                                                                                                          if (!error) { updated = true; console.log("Updated by userId:", externalRef); }
                                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                                  if (!updated && payerEmail) {
                                                                                                                                                                                                                                                        const { error } = await supabase
                                                                                                                                                                                                                                                                .from("usuarios").update({ is_premium: true }).eq("email", payerEmail);
                                                                                                                                                                                                                                                                      if (!error) { updated = true; console.log("Updated by email:", payerEmail); }
                                                                                                                                                                                                                                                                            else console.error("Supabase error:", error);
                                                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                                                    return new Response(
                                                                                                                                                                                                                                                                                          JSON.stringify({ ok: true, updated, paymentId, status: payment.status }),
                                                                                                                                                                                                                                                                                                { status: 200, headers: { ...cors, "Content-Type": "application/json" } }
                                                                                                                                                                                                                                                                                                    );
                                                                                                                                                                                                                                                                                                      } catch (err) {
                                                                                                                                                                                                                                                                                                          console.error("Webhook error:", err);
                                                                                                                                                                                                                                                                                                              return new Response(JSON.stringify({ error: String(err) }), {
                                                                                                                                                                                                                                                                                                                    status: 200, headers: { ...cors, "Content-Type": "application/json" },
                                                                                                                                                                                                                                                                                                                        });
                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                          });
                                                                                                                                                                                                                                                                                                                          