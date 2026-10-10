"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [status, setStatus] = useState<"PENDING" | "SUCCESS" | "FAILED" | "NOT_FOUND">("PENDING");

  useEffect(() => {
    if (!orderId) return;

    let attempts = 0;
    const maxAttempts = 15; // 30 seconds max polling

    const interval = setInterval(() => {
       fetch(`/api/checkout/status?order_id=${orderId}`)
         .then(res => res.json())
         .then(data => {
            attempts++;
            if (data.status === "SUCCESS" || data.status === "FAILED") {
               setStatus(data.status);
               clearInterval(interval);
            } else if (attempts >= maxAttempts) {
               setStatus("FAILED");
               clearInterval(interval);
            }
         })
         .catch(err => {
            console.error(err);
            if (attempts >= maxAttempts) {
               setStatus("FAILED");
               clearInterval(interval);
            }
         });
    }, 2000);

    return () => clearInterval(interval);
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="text-center">
         <h1 className="text-3xl font-bold mb-4 text-red-600">Invalid Request</h1>
         <p className="text-secondary-500 mb-8">No order ID found.</p>
         <Link href="/book" className="text-primary-600 underline">Return to Booking</Link>
      </div>
    );
  }

  return (
    <div className="text-center">
       {status === "SUCCESS" ? (
         <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-green-500 mx-auto mb-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <h1 className="text-3xl font-bold mb-4 text-green-700">Payment Successful!</h1>
            <p className="text-secondary-600 mb-8">Your appointment is confirmed. Check your email for the meeting link.</p>
         </>
       ) : status === "FAILED" ? (
         <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-red-500 mx-auto mb-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <h1 className="text-3xl font-bold mb-4 text-red-700">Payment Failed</h1>
            <p className="text-secondary-600 mb-8">There was an issue processing your payment. Please try again.</p>
         </>
       ) : (
         <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-primary-500 mx-auto mb-6 animate-spin">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <h1 className="text-3xl font-bold mb-4 text-primary-700">Confirming Payment...</h1>
            <p className="text-secondary-600 mb-8">We are waiting for confirmation from the bank. Please do not close this page.</p>
         </>
       )}
       
       <div className="mt-6 flex flex-col gap-3">
           <Link href="/" className="px-6 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-500 transition-colors inline-block">
             Return to Home
           </Link>
           {status !== "SUCCESS" && (
             <Link href="/book" className="px-6 py-3 rounded-xl text-primary-600 font-bold hover:bg-primary-50 transition-colors inline-block">
               Try Booking Again
             </Link>
           )}
       </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 bg-secondary-50">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-secondary-500/10 max-w-lg w-full">
         <Suspense fallback={<div className="text-center text-primary-600 animate-pulse">Loading status...</div>}>
            <PaymentStatusContent />
         </Suspense>
      </div>
    </div>
  );
}
