import React from "react";
import "./Plans.css";
import Navbar from "../Home/Navbar";

export default function Plans() {

  const handlePayment = async (amount, planName) => {
    try {
      const res = await fetch(
        "https://doubtify-0q6d.onrender.com/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount }),
        }
      );

      const order = await res.json();

      const options = {
        key: "rzp_test_YOUR_KEY_HERE",

        amount: order.amount,
        currency: order.currency,
        order_id: order.id,

        name: "Doubtify",

        description: `${planName} Subscription`,

        handler: async function (response) {
          alert("Payment Successful ✅");

          console.log("Payment Response:", response);

          try {
            await fetch(
              "https://doubtify-0q6d.onrender.com/payment-success",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  plan: planName,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                }),
              }
            );
          } catch (err) {
            console.log(err);
          }
        },

        theme: {
          color: "#3399cc",
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.open();
    } catch (err) {
      console.error(err);
      alert("Payment Failed ❌");
    }
  };

  return (
    <div className="plans-page">
      <Navbar />

      <h1 className="plans-title">
        Choose Your Plan 🚀
      </h1>

      <div className="plans-container">

        <div className="plan-card">
          <h2>Free</h2>

          <h3>₹0</h3>

          <p>Basic features to get started</p>

          <ul>
            <li>✔ Limited Doubts</li>
            <li>✔ Basic Notes</li>
            <li>❌ No AI Priority</li>
          </ul>

          <button className="plan-btn">
            Start Free
          </button>
        </div>

        {/* MONTHLY PLAN */}
        <div className="plan-card popular">
          <h2>Monthly</h2>

          <h3>₹199/month</h3>

          <p>Best for regular learners</p>

          <ul>
            <li>✔ Unlimited Doubts</li>
            <li>✔ Smart Notes</li>
            <li>✔ AI Assistant</li>
          </ul>

          <button
            className="plan-btn"
            onClick={() => handlePayment(199, "Monthly")}
          >
            Buy Monthly
          </button>
        </div>

        {/* YEARLY PLAN */}
        <div className="plan-card">
          <h2>Yearly</h2>

          <h3>₹999/year</h3>

          <p>Save more with yearly plan</p>

          <ul>
            <li>✔ Everything in Monthly</li>
            <li>✔ Priority Support</li>
            <li>✔ Extra Features</li>
          </ul>

          <button
            className="plan-btn"
            onClick={() => handlePayment(999, "Yearly")}
          >
            Buy Yearly
          </button>
        </div>

      </div>
    </div>
  );
}