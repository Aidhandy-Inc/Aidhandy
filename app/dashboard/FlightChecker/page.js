"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/libs/supabaseClient";
import PathSelector from "@/components/Flight/PathSelector";
import RouteForm from "@/components/Flight/RouteForm";
import FlightList from "@/components/Flight/FlightList";
import ConfirmModal from "@/components/Flight/ConfirmModal";
import DuffelFlightList from "@/components/Flight/DuffelFlightList";
import SeatMapModalDuffel from "@/components/Seat/SeatMapModalDuffel";
import BackButton from "@/components/common/BackButton";
import Loader from "@/components/common/Loader";
import SearchByFlightNo from "@/components/Flight/BookedFlightInfo";
import AuthLogin from "@/components/common/AuthModal";
import CompanionProfileModal from "@/components/Seat/PublicProfileCompanion";
import { useUser } from "@/context/ClientProvider";

// IMPORTANT: Remove any Sentry imports, they break prerendering

export default function FlightChecker() {
  // Safe defaults. Nothing breaks if these are null during pre-render.
  const { user = null, profile = null } = useUser() ?? {};

  const [selectedPath, setSelectedPath] = useState(null);
  const [flightData, setFlightData] = useState({
    departure_airport: "",
    destination_airport: "",
    preferred_date: "",
  });

  const [response, setResponse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userFlight, setUserFlight] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [pairingId, setPairingId] = useState(null);
  const [companions, setCompanions] = useState([]);
  const [selectedCompanion, setSelectedCompanion] = useState(null);

  const [seatmapData, setSeatmapData] = useState(null);
  const [loadingSeatmap, setLoadingSeatmap] = useState(false);
  const [showSeatmap, setShowSeatmap] = useState(false);

  const [showCompanionAuthModal, setShowCompanionAuthModal] = useState(false);
  const [companionDataAuth, setCompanionDataAuth] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // ---------- HANDLER: SEARCH ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const supabaseToken =
        session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const searchData = {
        data: {
          slices: [
            {
              origin: flightData.departure_airport,
              destination: flightData.destination_airport,
              departure_date: flightData.preferred_date,
            },
          ],
          passengers: [{ type: "adult" }],
          cabin_class: "economy",
        },
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/duffel-flights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseToken}`,
          },
          body: JSON.stringify(searchData),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setResponse(data.data || null);
      } else {
        setResponse({
          success: false,
          message:
            data?.error?.message ||
            data?.error ||
            data?.errors?.[0]?.message ||
            "Duffel API error",
        });
      }
    } catch (err) {
      console.error(err);
      setResponse({
        success: false,
        message: "Error fetching flights",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- HANDLER: SELECT FLIGHT ----------
  const handleSelectFlight = async (flight) => {
    setSubmitting(true);
    setSelectedFlight(flight);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const supabaseToken =
        session?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      setLoadingSeatmap(true);

      const seatmapRes = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/duffel-seatmaps`,
        {
          method: "POST",
