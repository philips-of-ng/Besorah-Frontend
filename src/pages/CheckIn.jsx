import React, { useState, useEffect } from "react";
import axios from "axios";

function CheckIn() {
  //base url
  const baseAPIUrl = 'https://besorah-backend.vercel.app'

  // Form Fields State
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [profession, setProfession] = useState("");
  const [birthday, setBirthday] = useState("");

  // URL Target Parameters Metadata State
  const [churchId, setChurchId] = useState("");
  const [churchName, setChurchName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [loc, setLoc] = useState("");

  // App Execution State
  const [loading, setLoading] = useState(false);
  const [initialBrandingLoading, setInitialBrandingLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [cachedMemberName, setCachedMemberName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Grab parameters and resolve church branding strictly from the URL context
  useEffect(() => {
    const fetchChurchBranding = async () => {
      const params = new URLSearchParams(window.location.search);

      // 🌟 DYNAMIC FALLBACKS: Try to grab either naming convention from the URL string
      const urlChurchId = params.get("churchId") || params.get("id");
      const urlLoc = params.get("loc") || params.get("eventId") || params.get("event") || "";
      const urlServiceName = params.get("serviceName") || params.get("service") || "Today's Service";

      setLoc(urlLoc);
      setServiceName(urlServiceName);

      // Debugging Check: Let's see what is actually extracted in your browser console
      console.log("Extracted URL Metadata Framework:", { urlChurchId, urlLoc, urlServiceName });

      if (!urlChurchId || !urlLoc) {
        setError(`Invalid Access Link: Missing core routing context parameters. (Found Church ID: ${urlChurchId ? "Yes" : "No"}, Found Service ID: ${urlLoc ? "Yes" : "No"})`);
        setInitialBrandingLoading(false);
        return;
      }

      setChurchId(urlChurchId);

      try {
        const res = await axios.get(`${baseAPIUrl}/api/church/public-profile?churchId=${urlChurchId}`);
        if (res.data && res.data.success) {
          setChurchName(res.data.churchName);
        }
      } catch (err) {
        console.error("Failed to load custom tenant context header branding alignment:", err);
        setError("Branding Sync Error: Unable to resolve configuration details for this church registry.");
      } finally {
        setInitialBrandingLoading(false);
      }

      // Scan local cache for fast-lane returning visitors
      const savedVisitorId = localStorage.getItem("besorah_visitor_id");
      const savedName = localStorage.getItem("besorah_visitor_name");
      if (savedVisitorId && savedName) {
        setIsReturningUser(true);
        setCachedMemberName(savedName);
      }
    };

    fetchChurchBranding();
  }, []);

  const validateBirthday = (dateStr) => {
    if (!dateStr) return true;
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/;
    return regex.test(dateStr);
  };

  const handleFastCheckIn = async () => {
    setLoading(true);
    setError("");
    const visitorId = localStorage.getItem("besorah_visitor_id");

    try {
      const res = await axios.post(`${baseAPIUrl}/api/attendance/fast-checkin`, {
        churchId,
        loc,
        visitorId
      });

      setMessage(res.data.message || `Welcome back, ${cachedMemberName}! Attendance recorded successfully.`);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Fast check-in session expired. Resetting to manual form entry...");
      setIsReturningUser(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateBirthday(birthday)) {
      setError("Please enter your birthday in the correct DD/MM format (e.g., 27/06).");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${baseAPIUrl}/api/attendance/check-in`, {
        churchId,
        loc,
        fullName,
        phoneNumber,
        email,
        profession,
        birthday,
      });

      if (res.data && res.data.member) {
        localStorage.setItem("besorah_visitor_id", res.data.member.id);
        localStorage.setItem("besorah_visitor_name", res.data.member.fullName);
      }

      setMessage(res.data.message || "Attendance submission registered cleanly!");
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Check-in pipeline encountered an unexpected validation drop.");
    } finally {
      setLoading(false);
    }
  };

  // 1. INITIAL LOAD SKELETON RENDER SCREEN
  if (initialBrandingLoading) {
    return (
      <div className="min-h-screen bg-[#f0ebf8] px-3 py-6 flex flex-col items-center justify-center font-sans">
        <div className="w-full max-w-2xl bg-white rounded-lg border border-[#dadce0] p-8 shadow-sm flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#673ab7] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-bold tracking-wide animate-pulse">Syncing Secure Church Core Gateway Configurations...</p>
        </div>
      </div>
    );
  }

  // 2. BLOCKED ACCESS ERROR SCREEN
  if (error && !churchName && !submitted) {
    return (
      <div className="min-h-screen bg-[#f0ebf8] px-3 py-6 flex flex-col items-center font-sans">
        <div className="w-full max-w-2xl bg-white rounded-lg border border-[#dadce0] overflow-hidden shadow-sm">
          <div className="h-2.5 bg-rose-600 w-full"></div>
          <div className="p-6 space-y-4">
            <h1 className="text-2xl font-black text-rose-600">Access Framework Error</h1>
            <p className="text-sm text-gray-700 leading-relaxed font-semibold">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // 3. SUCCESS SUBMISSION SCREEN
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f0ebf8] px-3 py-6 flex flex-col items-center font-sans">
        <div className="w-full max-w-2xl bg-white rounded-lg border border-[#dadce0] overflow-hidden shadow-sm">
          <div className="h-2.5 bg-[#673ab7] w-full"></div>
          <div className="p-6">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">{churchName}</p>
            <h1 className="text-3xl text-[#202124] font-black tracking-tight mb-3">{serviceName}</h1>
            <p className="text-sm font-bold text-emerald-600 mb-6">{message}</p>
            <hr className="border-t border-[#dadce0] my-5" />
            <button
              onClick={() => {
                setSubmitted(false);
                setFullName("");
                setPhoneNumber("");
                setEmail("");
                setProfession("");
                setBirthday("");
              }}
              className="text-sm text-[#1a73e8] underline font-bold cursor-pointer hover:text-blue-800 transition"
            >
              Submit another response
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. RETURNING MEMBER INSTANT CHECK-IN CHANNEL
  if (isReturningUser) {
    return (
      <div className="min-h-screen bg-[#f0ebf8] px-3 py-6 flex flex-col items-center font-sans">
        <div className="w-full max-w-2xl bg-white rounded-lg border border-[#dadce0] overflow-hidden shadow-sm">
          <div className="h-2.5 bg-[#673ab7] w-full"></div>
          <div className="p-6 text-center space-y-4">
            <span className="text-xs uppercase font-black text-gray-400 tracking-widest">{churchName}</span>
            <h1 className="text-2xl font-black text-[#202124]">Welcome Back, {cachedMemberName}!</h1>
            <p className="text-sm text-gray-500 font-medium">Ready to confirm your attendance profile registration check-in for {serviceName}?</p>

            {error && <div className="text-xs text-rose-600 font-bold bg-rose-50 p-3 rounded-xl border border-rose-100">{error}</div>}

            <button
              onClick={handleFastCheckIn}
              disabled={loading}
              className="w-full max-w-sm bg-[#673ab7] text-white py-3.5 rounded-xl font-bold text-sm shadow-sm hover:bg-[#5e35b1] transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Confirming Gateway Presence..." : "⚡ Tap to Instant Check-In"}
            </button>

            <div>
              <button onClick={() => setIsReturningUser(false)} className="text-xs text-[#673ab7] font-bold hover:underline cursor-pointer">
                Not you? Register a separate profile card
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. STANDARD REGISTRATION Form
  return (
    <div className="min-h-screen bg-[#f0ebf8] px-3 py-6 flex flex-col items-center font-sans">

      {/* HEADER PANEL CARD */}
      <div className="w-full max-w-2xl bg-white rounded-lg border border-[#dadce0] overflow-hidden mb-3 shadow-sm">
        <div className="h-2.5 bg-[#673ab7] w-full"></div>
        <div className="p-6">
          {/* 1. Church Name (Bold but not too big) */}
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">
            {churchName}
          </p>

          {/* 2. Service Name (Bigger focal point) */}
          <h1 className="text-3xl text-[#202124] font-black tracking-tight mb-3">
            {serviceName}
          </h1>

          {/* 3. Welcoming Description */}
          <p className="text-sm text-gray-600 font-medium mb-4 leading-relaxed">
            Welcome to church! We are incredibly glad to have you fellowship with us today. Please take a moment to check in and register your attendance.
          </p>

          <span className="text-sm text-[#d93025] font-semibold">* Indicates required question</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        {/* Email Block */}
        <div className="w-full bg-white rounded-lg border border-[#dadce0] p-6 mb-3 shadow-sm">
          <label className="block text-base font-semibold text-[#202124] mb-4">
            Email Address <span className="text-[#d93025]">*</span>
          </label>
          <input
            type="email"
            required
            placeholder="Your answer"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full max-w-md border-b border-[#70757a] py-2 text-sm text-gray-900 bg-transparent outline-none focus:border-[#673ab7] focus:border-b-2 transition-all duration-150"
          />
        </div>

        {/* Full Name Block */}
        <div className="w-full bg-white rounded-lg border border-[#dadce0] p-6 mb-3 shadow-sm">
          <label className="block text-base font-semibold text-[#202124] mb-4">
            Full Name <span className="text-[#d93025]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Your answer"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full max-w-md border-b border-[#70757a] py-2 text-sm text-gray-900 bg-transparent outline-none focus:border-[#673ab7] focus:border-b-2 transition-all duration-150"
          />
        </div>

        {/* Phone Number Block */}
        <div className="w-full bg-white rounded-lg border border-[#dadce0] p-6 mb-3 shadow-sm">
          <label className="block text-base font-semibold text-[#202124] mb-4">
            Phone Number <span className="text-[#d93025]">*</span>
          </label>
          <input
            type="tel"
            required
            placeholder="Your answer"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full max-w-md border-b border-[#70757a] py-2 text-sm text-gray-900 bg-transparent outline-none focus:border-[#673ab7] focus:border-b-2 transition-all duration-150"
          />
        </div>

        {/* Profession Block */}
        <div className="w-full bg-white rounded-lg border border-[#dadce0] p-6 mb-3 shadow-sm">
          <label className="block text-base font-semibold text-[#202124] mb-4">
            Profession / Occupation <span className="text-[#70757a] text-sm font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="Your answer"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="w-full max-w-md border-b border-[#70757a] py-2 text-sm text-gray-900 bg-transparent outline-none focus:border-[#673ab7] focus:border-b-2 transition-all duration-150"
          />
        </div>

        {/* Birthday Block */}
        <div className="w-full bg-white rounded-lg border border-[#dadce0] p-6 mb-3 shadow-sm">
          <label className="block text-base font-semibold text-[#202124] mb-4">
            Birthday <span className="text-[#70757a] text-sm font-normal">(Optional)</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">Please use the format Day/Month (e.g., 27/06)</p>
          <input
            type="text"
            placeholder="DD/MM"
            maxLength="5"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full max-w-[120px] text-center border-b border-[#70757a] py-2 text-sm text-gray-900 bg-transparent outline-none focus:border-[#673ab7] focus:border-b-2 transition-all duration-150"
          />
        </div>

        {error && (
          <div className="w-full bg-[#fce8e6] border border-[#f28b82] rounded-lg p-4 mb-3 text-sm text-[#c5221f] font-semibold">
            {error}
          </div>
        )}

        {/* Actions Row Controls */}
        <div className="w-full flex justify-between items-center py-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#673ab7] text-white px-6 py-2 rounded shadow-sm text-sm font-semibold hover:bg-[#5e35b1] focus:outline-none transition active:shadow-md disabled:bg-purple-300 cursor-pointer"
          >
            {loading ? "Registering Presence..." : "Submit Registration"}
          </button>
          <button
            type="button"
            onClick={() => {
              setFullName("");
              setPhoneNumber("");
              setEmail("");
              setProfession("");
              setBirthday("");
            }}
            className="text-sm text-[#673ab7] font-bold hover:bg-purple-50 px-3 py-1.5 rounded transition cursor-pointer"
          >
            Clear form fields
          </button>
        </div>
      </form>
    </div>
  );
}

export default CheckIn;