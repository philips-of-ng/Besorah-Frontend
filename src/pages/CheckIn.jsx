import React, { useState, useEffect } from "react";
import axios from "axios";

function CheckIn() {
  // Form Fields State
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [serviceInstance, setServiceInstance] = useState(""); // First, Second, Third, Regular
  const [profession, setProfession] = useState("");
  const [birthday, setBirthday] = useState(""); // DD/MM format

  // URL Metadata State
  const [churchId, setChurchId] = useState("6a31bbdc4de6e5b089e7a046");
  const [serviceName, setServiceName] = useState("Sunday Service");

  // App Execution State
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   setChurchId(params.get("churchId") || "6a31bbdc4de6e5b089e7a046");
  //   setServiceName(params.get("serviceName") || "Our Service");
  // }, []);

  // Simple validation for DD/MM format before sending to backend
  const validateBirthday = (dateStr) => {
    if (!dateStr) return true; // Optional field
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/;
    return regex.test(dateStr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateBirthday(birthday)) {
      setError(
        "Please enter your birthday in the correct DD/MM format (e.g., 27/06).",
      );
      setLoading(false);
      return;
    }

    if (!churchId) {
      setError("Invalid check-in link. Missing Church Identifier.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Resolve today's specific event instance
      const eventResponse = await axios.post(
        "http://localhost:5000/api/church/event/active",
        {
          churchId,
          serviceName,
        },
      );

      const { eventId } = eventResponse.data;

      // Step 2: Push the full profile payload to the attendance engine
      const checkInResponse = await axios.post(
        "http://localhost:5000/api/attendance/check-in",
        {
          churchId,
          eventId,
          fullName,
          phoneNumber,
          email,
          serviceInstance, // Sent to backend
          profession, // Sent to backend
          birthday, // Sent to backend
        },
      );

      setMessage(checkInResponse.data.message || "Check-in successful!");
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.error || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f0ebf8] px-3 py-6 flex flex-col items-center font-sans">
        <div className="w-full max-w-2xl bg-white rounded-lg border border-[#dadce0] overflow-hidden shadow-sm">
          <div className="h-2.5 bg-[#673ab7] w-full"></div>
          <div className="p-6">
            <h1 className="text-3xl text-[#202124] tracking-tight mb-3">
              {serviceName}
            </h1>
            <p className="text-sm text-[#202124] mb-6">{message}</p>
            <hr className="border-t border-[#dadce0] my-5" />
            <button
              onClick={() => {
                setSubmitted(false);
                setFullName("");
                setPhoneNumber("");
                setEmail("");
                setServiceInstance("");
                setProfession("");
                setBirthday("");
              }}
              className="text-sm text-[#1a73e8] underline cursor-pointer hover:text-blue-800 transition"
            >
              Submit another response
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0ebf8] px-3 py-6 flex flex-col items-center font-sans">
      {/* Header Panel Card */}
      <div className="w-full max-w-2xl bg-white rounded-lg border border-[#dadce0] overflow-hidden mb-3 shadow-sm">
        <div className="h-2.5 bg-[#673ab7] w-full"></div>
        <div className="p-6">
          <h1 className="text-3xl text-[#202124] tracking-tight mb-2">
            {serviceName} Check-In
          </h1>
          <p className="text-sm text-[#202124] mb-4 leading-relaxed">
            Welcome! Please fill out this form to register your attendance for
            today's service.
          </p>
          <span className="text-sm text-[#d93025]">
            * Indicates required question
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        {/* Input Block: Full Name */}
        <div className="w-full bg-white rounded-lg border border-[#dadce0] p-6 mb-3 shadow-sm">
          <label className="block text-base font-medium text-[#202124] mb-4">
            Full Name <span className="text-[#d93025]">*</span>
          </label>
          <input
            type="text"
            placeholder="Your answer"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full max-w-md border-b border-[#70757a] py-2 text-sm text-gray-900 bg-transparent outline-none focus:border-[#673ab7] focus:border-b-2 transition-all duration-150"
          />
        </div>

        {/* Input Block: Phone Number */}
        <div className="w-full bg-white rounded-lg border border-[#dadce0] p-6 mb-3 shadow-sm">
          <label className="block text-base font-medium text-[#202124] mb-4">
            Phone Number <span className="text-[#d93025]">*</span>
          </label>
          <input
            type="tel"
            placeholder="Your answer"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            className="w-full max-w-md border-b border-[#70757a] py-2 text-sm text-gray-900 bg-transparent outline-none focus:border-[#673ab7] focus:border-b-2 transition-all duration-150"
          />
        </div>

        {/* Input Block: Attendance Status (Radio Buttons) */}
        <div className="w-full bg-white rounded-lg border border-[#dadce0] p-6 mb-3 shadow-sm">
          <label className="block text-base font-medium text-[#202124] mb-4">
            Attendance Status <span className="text-[#d93025]">*</span>
          </label>
          <div className="space-y-3">
            {[
              { label: "This is my first time here", value: "First Timer" },
              {
                label: "This is my second or third time visiting",
                value: "Returning Visitor",
              },
              { label: "I am a regular member", value: "Regular Member" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center text-sm text-[#202124] cursor-pointer group"
              >
                <input
                  type="radio"
                  name="serviceInstance" // Keeps consistency with your backend variable
                  value={option.value}
                  checked={serviceInstance === option.value}
                  onChange={(e) => setServiceInstance(e.target.value)}
                  required
                  className="w-5 h-5 accent-[#673ab7] mr-3 cursor-pointer"
                />
                <span className="group-hover:text-black transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Input Block: Profession */}
        <div className="w-full bg-white rounded-lg border border-[#dadce0] p-6 mb-3 shadow-sm">
          <label className="block text-base font-medium text-[#202124] mb-4">
            Profession / Occupation{" "}
            <span className="text-[#70757a] text-sm font-normal">
              (Optional)
            </span>
          </label>
          <input
            type="text"
            placeholder="Your answer"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="w-full max-w-md border-b border-[#70757a] py-2 text-sm text-gray-900 bg-transparent outline-none focus:border-[#673ab7] focus:border-b-2 transition-all duration-150"
          />
        </div>

        {/* Input Block: Birthday */}
        <div className="w-full bg-white rounded-lg border border-[#dadce0] p-6 mb-3 shadow-sm">
          <label className="block text-base font-medium text-[#202124] mb-4">
            Birthday{" "}
            <span className="text-[#70757a] text-sm font-normal">
              (Optional)
            </span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Please use the format Day/Month (e.g., 27/06)
          </p>
          <input
            type="text"
            placeholder="DD/MM"
            maxLength="5"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full max-w-[120px] text-center border-b border-[#70757a] py-2 text-sm text-gray-900 bg-transparent outline-none focus:border-[#673ab7] focus:border-b-2 transition-all duration-150"
          />
        </div>

        {/* Input Block: Email */}
        <div className="w-full bg-white rounded-lg border border-[#dadce0] p-6 mb-3 shadow-sm">
          <label className="block text-base font-medium text-[#202124] mb-4">
            Email Address{" "}
            <span className="text-[#70757a] text-sm font-normal">
              (Optional)
            </span>
          </label>
          <input
            type="email"
            placeholder="Your answer"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full max-w-md border-b border-[#70757a] py-2 text-sm text-gray-900 bg-transparent outline-none focus:border-[#673ab7] focus:border-b-2 transition-all duration-150"
          />
        </div>

        {error && (
          <div className="w-full bg-[#fce8e6] border border-[#f28b82] rounded-lg p-4 mb-3 text-sm text-[#c5221f]">
            {error}
          </div>
        )}

        {/* Action Row */}
        <div className="w-full flex justify-between items-center py-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#673ab7] text-white px-6 py-2 rounded shadow-sm text-sm font-medium hover:bg-[#5e35b1] focus:outline-none transition active:shadow-md disabled:bg-purple-300 cursor-pointer"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
          <button
            type="button"
            onClick={() => {
              setFullName("");
              setPhoneNumber("");
              setEmail("");
              setServiceInstance("");
              setProfession("");
              setBirthday("");
            }}
            className="text-sm text-[#673ab7] font-medium hover:bg-purple-50 px-3 py-1.5 rounded transition cursor-pointer"
          >
            Clear form
          </button>
        </div>
      </form>
    </div>
  );
}

export default CheckIn;
