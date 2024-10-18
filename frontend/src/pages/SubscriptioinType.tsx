import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "contexts/AuthContext";
import { useLoading } from "contexts/LoadingContext";
import { useAlertQueue } from "hooks/alerts";
import { useTheme } from "hooks/theme";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_API_KEY || "");
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error_message, setError] = useState<string | undefined>("");
  const [name, setName] = useState<string>(""); // Cardholder Name
  const [email, setEmail] = useState<string>(""); // Email Address
  const { auth, setAuth, client } = useAuth();
  const { theme } = useTheme();
  const { addAlert } = useAlertQueue();
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();
  useEffect(() => {
    if (auth?.email) setEmail(auth.email);
  }, [auth?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (elements == null || stripe == null) return;
    const cardElement = elements.getElement(CardElement);
    try {
      // Create a payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement!,
        billing_details: { name, email },
      });

      if (error) {
        setError(error.message);
        return;
      }
      startLoading();
      // Send payment method to the backend for subscription creation
      const { data, error: err } = await client.POST("/create_subscription", {
        body: { payment_method_id: paymentMethod.id, email, name },
      });
      stopLoading();
      if (err?.detail) addAlert(err.detail.toString(), "error");
      if (data?.success) {
        // Handle successful subscription (e.g., redirect or show success message)
        if (auth) setAuth({ ...auth, is_subscription: true });
        addAlert("You have been subscribed successfully!", "success");
        navigate("/collections");
      } else {
        setError(data?.error);
      } /* eslint-disable */
    } catch (error: any) {
      /* eslint-enable */
      setError(
        error.response?.data?.message ||
          "Subscription failed. Please try again.",
      );
    }
  };

  const cardStyle = {
    base: {
      fontSize: "16px",
      color: theme === "dark" ? "#ffffff" : "#32325d",
      "::placeholder": { color: theme === "dark" ? "#aab7c4" : "#bfbfbf" },
    },
    invalid: { color: "#fa755a" },
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-8 p-8 w-full max-w-md mx-auto rounded-lg bg-gray-12"
    >
      <h1 className="text-xl font-bold mb-4">Subscribe</h1>

      <div className="w-full">
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Credit Card Information
        </label>
        <div className="w-full border rounded p-2">
          <CardElement options={{ style: cardStyle }} />
        </div>
      </div>

      <div className="w-full">
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Cardholder Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="John Doe"
          required
        />
      </div>

      <div className="w-full">
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          disabled
          className="w-full p-2 border rounded"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="w-full border-t border-gray-300 mt-4"></div>

      <div className="w-full">
        <span className="block text-sm font-medium mb-1 text-right">
          Monthly: $29.99
        </span>
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 w-full mt-4"
        disabled={!stripe}
      >
        Subscribe
      </button>

      {error_message && (
        <div className="text-red-500 mt-2">{error_message}</div>
      )}
    </form>
  );
};

const SubscriptionPage = () => {
  return (
    <div className="flex flex-col rounded-md h-full items-center justify-center bg-gray-3 p-24 gap-12">
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
};

export default SubscriptionPage;
