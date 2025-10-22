// app/api/search-companions-duffel/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/libs/supabaseClient";

export async function POST(req) {
  try {    
    const body = await req.json();
    const { flight_number, date, airline } = body;

    // Validate required fields
    if (!date) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing date parameter',
          details: 'Date is required for companion search'
        },
        { status: 400 }
      );
    }
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          details: 'Valid authentication token required'
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    let companions = [];
    let edgeFunctionUsed = false;

    try {      
      // Call Supabase Edge Function
      const edgeFunctionResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/search-companions-duffel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            flight_number: flight_number || 'Unknown', 
            date,
            airline: airline || 'Unknown'
          }),
        }
      );

     

      if (edgeFunctionResponse.ok) {
        const edgeResult = await edgeFunctionResponse.json();
        companions = edgeResult.companions || edgeResult || [];
        edgeFunctionUsed = true;
        console.log(`✅ Edge function found ${companions.length} companions`);
      } else {
        const errorText = await edgeFunctionResponse.text();
        console.error('❌ Edge function failed:', edgeFunctionResponse.status, errorText);
        throw new Error(`Edge function failed: ${edgeFunctionResponse.status}`);
      }

    } catch (edgeError) {
      console.log('🔄 Edge function failed, falling back to direct database query...', edgeError.message);
      // Fallback: Query database directly
      companions = await queryCompanionsDirectly(flight_number, date, airline);
    }

    // 🚨 DEBUG: Add detailed logging to see what's happening
    console.log('📊 Raw companions data before processing:', companions);
    console.log('🔍 Checking companion properties:');
    companions.forEach((comp, index) => {
      console.log(`Companion ${index}:`, {
        id: comp.id,
        full_name: comp.full_name,
        current_seat: comp.current_seat || comp.bookings?.seat_number,
        has_bookings: !!comp.bookings,
        raw_data: comp
      });
    });

    // If no companions found, return empty array
    if (!companions || companions.length === 0) {
      console.log('❌ No companions found in search');
      return NextResponse.json({ 
        success: true,
        companions: [],
        total_count: 0,
        message: 'No companions found for this flight',
        source: edgeFunctionUsed ? 'edge_function' : 'direct_query'
      });
    }

    // Enhance companions with additional data
    const enhancedCompanions = companions.map(companion => {
      const enhanced = {
        ...companion,
        id: companion.id || `comp-${Math.random().toString(36).substr(2, 9)}`,
        full_name: companion.full_name || companion.name || 'Travel Companion',
        current_seat: companion.current_seat || companion.bookings?.seat_number, // Ensure seat is set
        has_adjacent_vacant: checkAdjacentVacant(companion, companions),
        match_score: calculateMatchScore(companion),
        seatAvailability: {
          adjacent: checkAdjacentVacant(companion, companions),
          sameRow: checkSameRowVacant(companion, companions),
          seats: getAvailableAdjacentSeats(companion, companions),
          note: generateSeatNote(companion, companions)
        }
      };

      console.log('✅ Enhanced companion:', {
        id: enhanced.id,
        full_name: enhanced.full_name,
        current_seat: enhanced.current_seat,
        seatAvailability: enhanced.seatAvailability
      });

      return enhanced;
    });

    // Sort by match score (highest first)
    enhancedCompanions.sort((a, b) => b.match_score - a.match_score)

    return NextResponse.json({ 
      success: true,
      companions: enhancedCompanions,
      total_count: enhancedCompanions.length,
      search_criteria: { flight_number, date, airline },
      source: edgeFunctionUsed ? 'edge_function' : 'direct_query',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Companion search API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Enhanced Fallback function to query companions directly
async function queryCompanionsDirectly(flight_number, date, airline) {
  try {
    console.log(`🔍 Direct database query: ${flight_number}, ${date}, ${airline}`);
    
    // 🚨 DEBUG: First, let's see what's actually in the database
    const { data: allBookings, error: allError } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'confirmed')
      .limit(10);

    console.log('📋 All confirmed bookings in database:', allBookings);

    let query = supabase
      .from('bookings')
      .select(`
        *,
        profiles:traveler_id (
          id,
          full_name,
          age,
          interests,
          bio,
          languages,
          skills
        )
      `)
      .eq('departure_date', date)
      .eq('status', 'confirmed');

    if (flight_number && flight_number !== 'Unknown') {
      query = query.eq('flight_number', flight_number);
    }

    if (airline && airline !== 'Unknown') {
      query = query.eq('airline_name', airline);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('❌ Direct query error:', error);
      return [];
    }

    console.log(`✅ Direct query found ${bookings?.length || 0} bookings`);

    // Transform bookings to companions format
    const companions = (bookings || []).map(booking => {
      console.log('📝 Transforming booking to companion:', {
        booking_id: booking.id,
        traveler_id: booking.traveler_id,
        flight_number: booking.flight_number,
        seat_number: booking.seat_number,
        profile: booking.profiles
      });

      return {
        id: booking.profiles?.id || booking.traveler_id,
        full_name: booking.profiles?.full_name || 'Travel Companion',
        age: booking.profiles?.age,
        interests: booking.profiles?.interests || [],
        bio: booking.profiles?.bio,
        languages: booking.profiles?.languages || [],
        skills: booking.profiles?.skills || [],
        current_seat: booking.seat_number, // Make sure seat is set here
        bookings: {
          flight_number: booking.flight_number,
          departure_date: booking.departure_date,
          seat_number: booking.seat_number,
          airline_name: booking.airline_name
        }
      };
    });

    console.log(`👥 Transformed ${companions.length} companions from bookings`);

    return companions;

  } catch (error) {
    console.error('❌ Direct query failed:', error);
    return [];
  }
}

// Enhanced seat checking with better debugging
function checkAdjacentVacant(companion, allCompanions) {
  try {
    const companionSeat = companion.current_seat || companion.bookings?.seat_number;
    console.log(`🔍 Checking adjacent vacant for ${companion.full_name}, seat: ${companionSeat}`);
    
    if (!companionSeat || companionSeat === 'TBD') {
      console.log('❌ No valid seat assigned');
      return false;
    }

    const seatMatch = companionSeat.match(/(\d+)([A-Z])/);
    if (!seatMatch) {
      console.log('❌ Invalid seat format:', companionSeat);
      return false;
    }

    const seatRow = parseInt(seatMatch[1]);
    const seatLetter = seatMatch[2];
    
    const adjacentLetters = getAdjacentLetters(seatLetter);
    console.log(`📊 Seat ${companionSeat}, row: ${seatRow}, letter: ${seatLetter}, adjacent: ${adjacentLetters}`);
    
    // Check if any adjacent seat is vacant
    const hasAdjacentVacant = adjacentLetters.some(adjLetter => {
      const adjSeat = `${seatRow}${adjLetter}`;
      const isOccupied = allCompanions.some(c => {
        const cSeat = c.current_seat || c.bookings?.seat_number;
        return cSeat === adjSeat && c.id !== companion.id;
      });
      
      console.log(`   Seat ${adjSeat}: ${isOccupied ? 'occupied' : 'vacant'}`);
      return !isOccupied;
    });

    console.log(`✅ Adjacent vacant result for ${companionSeat}: ${hasAdjacentVacant}`);
    return hasAdjacentVacant;
  } catch (error) {
    console.error('Error checking adjacent vacant:', error);
    return false;
  }
}

// Enhanced same row checking
function checkSameRowVacant(companion, allCompanions) {
  try {
    const companionSeat = companion.current_seat || companion.bookings?.seat_number;
    if (!companionSeat || companionSeat === 'TBD') return false;

    const seatMatch = companionSeat.match(/(\d+)([A-Z])/);
    if (!seatMatch) return false;

    const seatRow = parseInt(seatMatch[1]);
    const currentLetter = seatMatch[2];
    
    const allLetters = ['A','B','C','D','E','F'];
    
    // Check if any seat in same row is vacant
    return allLetters.some(letter => {
      if (letter === currentLetter) return false; // Skip current seat
      
      const testSeat = `${seatRow}${letter}`;
      const isOccupied = allCompanions.some(c => {
        const cSeat = c.current_seat || c.bookings?.seat_number;
        return cSeat === testSeat;
      });
      
      return !isOccupied;
    });
  } catch (error) {
    console.error('Error checking same row vacant:', error);
    return false;
  }
}

// Get available adjacent seats
function getAvailableAdjacentSeats(companion, allCompanions) {
  try {
    const companionSeat = companion.current_seat || companion.bookings?.seat_number;
    if (!companionSeat || companionSeat === 'TBD') return [];

    const seatMatch = companionSeat.match(/(\d+)([A-Z])/);
    if (!seatMatch) return [];

    const seatRow = parseInt(seatMatch[1]);
    const seatLetter = seatMatch[2];
    
    const adjacentLetters = getAdjacentLetters(seatLetter);
    const availableSeats = [];

    adjacentLetters.forEach(adjLetter => {
      const adjSeat = `${seatRow}${adjLetter}`;
      const isOccupied = allCompanions.some(c => {
        const cSeat = c.current_seat || c.bookings?.seat_number;
        return cSeat === adjSeat && c.id !== companion.id;
      });
      
      if (!isOccupied) {
        availableSeats.push(adjSeat);
      }
    });

    return availableSeats.slice(0, 3); // Return max 3 seats
  } catch (error) {
    console.error('Error getting adjacent seats:', error);
    return [];
  }
}

// Generate seat availability note
function generateSeatNote(companion, allCompanions) {
  const adjacent = checkAdjacentVacant(companion, allCompanions);
  const sameRow = checkSameRowVacant(companion, allCompanions);
  const availableSeats = getAvailableAdjacentSeats(companion, allCompanions);

  if (adjacent && availableSeats.length > 0) {
    return `${availableSeats.length} adjacent seat${availableSeats.length > 1 ? 's' : ''} available`;
  } else if (sameRow) {
    return 'Seats available in same row';
  } else {
    return 'Limited seat availability';
  }
}

// Calculate match score for sorting
function calculateMatchScore(companion) {
  let score = 0;
  
  // Seat availability score
  if (companion.has_adjacent_vacant) score += 30;
  else if (companion.seatAvailability?.sameRow) score += 15;
  
  // Profile completeness score
  if (companion.bio) score += 10;
  if (companion.interests?.length) score += companion.interests.length * 2;
  if (companion.languages?.length) score += companion.languages.length * 3;
  if (companion.skills?.length) score += companion.skills.length * 2;
  
  return score;
}

// Get adjacent seat letters
function getAdjacentLetters(letter) {
  const letters = ['A','B','C','D','E','F'];
  const index = letters.indexOf(letter);
  const adjacent = [];
  
  if (index > 0) adjacent.push(letters[index - 1]);
  if (index < letters.length - 1) adjacent.push(letters[index + 1]);
  
  return adjacent;
}