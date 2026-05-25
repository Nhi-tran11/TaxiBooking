/*
 * Student Information:
 * Name: Xuan Nhi thi Tran
 * Student ID: 23196149
 *
 * File: fare.js
 * Description: API routes for fare calculation
 * Endpoints:
 * - POST /api/fare/calculate: Calculate fare estimate
 * - GET /api/fare/suburbs: Get available suburbs with distances
 */

const express = require('express');
const router = express.Router();

// Suburb distance data (km from city center)
const suburbData = {
  'Auckland CBD': { distance: 0, zone: 1 },
  'Parnell': { distance: 2, zone: 1 },
  'Newmarket': { distance: 3, zone: 1 },
  'Ponsonby': { distance: 2.5, zone: 1 },
  'Mount Eden': { distance: 4, zone: 1 },
  'Remuera': { distance: 5, zone: 2 },
  'Epsom': { distance: 6, zone: 2 },
  'Mount Albert': { distance: 7, zone: 2 },
  'Onehunga': { distance: 8, zone: 2 },
  'Greenlane': { distance: 5.5, zone: 2 },
  'Ellerslie': { distance: 9, zone: 2 },
  'Panmure': { distance: 11, zone: 3 },
  'Glen Innes': { distance: 10, zone: 3 },
  'Howick': { distance: 20, zone: 3 },
  'Manukau': { distance: 22, zone: 3 },
  'Albany': { distance: 18, zone: 3 },
  'Takapuna': { distance: 10, zone: 2 },
  'Devonport': { distance: 12, zone: 3 },
  'Airport': { distance: 21, zone: 3 }
};

// Pricing structure
const pricing = {
  baseFare: 5.00,
  perKm: 2.50,
  peakMultiplier: 1.5,  // Applied during peak hours
  nightMultiplier: 1.3, // Applied 10pm-6am
  zoneMultiplier: {
    1: 1.0,
    2: 1.1,
    3: 1.2
  }
};

/**
 * POST /api/fare/calculate
 * Calculates fare based on pickup, destination, and time
 * Body: { pickupSuburb, destinationSuburb, pickupTime, pickupDate }
 */
router.post('/calculate', (req, res) => {
  try {
    const { pickupSuburb, destinationSuburb, pickupTime, pickupDate } = req.body;

    if (!pickupSuburb || !destinationSuburb) {
      return res.json({
        success: false,
        message: 'Both pickup and destination suburbs are required'
      });
    }

    // Get suburb data
    const pickup = suburbData[pickupSuburb];
    const destination = suburbData[destinationSuburb];

    if (!pickup) {
      return res.json({
        success: false,
        message: `Pickup suburb "${pickupSuburb}" not found`
      });
    }

    if (!destination) {
      return res.json({
        success: false,
        message: `Destination suburb "${destinationSuburb}" not found`
      });
    }

    // Calculate distance
    const distance = Math.abs(destination.distance - pickup.distance);
    const estimatedTime = Math.ceil(distance * 3); // Rough estimate: 3 minutes per km

    // Base calculation
    let fare = pricing.baseFare + (distance * pricing.perKm);

    // Apply zone multiplier (use higher zone)
    const zone = Math.max(pickup.zone, destination.zone);
    fare *= pricing.zoneMultiplier[zone];

    // Apply time-based multipliers
    let multiplierInfo = [];
    if (pickupTime && pickupDate) {
      const pickupDateTime = new Date(`${pickupDate}T${pickupTime}`);
      const hour = pickupDateTime.getHours();
      const dayOfWeek = pickupDateTime.getDay();

      // Peak hours: Weekdays 7-9am and 5-7pm
      const isPeakHour = (dayOfWeek >= 1 && dayOfWeek <= 5) && 
                         ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 19));
      
      // Night hours: 10pm - 6am
      const isNightTime = hour >= 22 || hour < 6;

      if (isPeakHour) {
        fare *= pricing.peakMultiplier;
        multiplierInfo.push({ type: 'Peak Hour', multiplier: pricing.peakMultiplier });
      }
      
      if (isNightTime) {
        fare *= pricing.nightMultiplier;
        multiplierInfo.push({ type: 'Night Time', multiplier: pricing.nightMultiplier });
      }
    }

    // Round to 2 decimal places
    fare = Math.round(fare * 100) / 100;

    return res.json({
      success: true,
      fare: {
        total: fare,
        currency: 'NZD',
        breakdown: {
          baseFare: pricing.baseFare,
          distanceFare: Math.round(distance * pricing.perKm * 100) / 100,
          distance: distance,
          zone: zone,
          zoneMultiplier: pricing.zoneMultiplier[zone],
          multipliers: multiplierInfo
        },
        route: {
          from: pickupSuburb,
          to: destinationSuburb,
          distance: `${distance} km`,
          estimatedTime: `${estimatedTime} minutes`
        }
      }
    });

  } catch (error) {
    console.error('Error calculating fare:', error);
    return res.json({
      success: false,
      message: `An error occurred: ${error.message}`
    });
  }
});

/**
 * GET /api/fare/suburbs
 * Returns list of available suburbs
 */
router.get('/suburbs', (req, res) => {
  try {
    const suburbs = Object.keys(suburbData).sort().map(name => ({
      name: name,
      distance: suburbData[name].distance,
      zone: suburbData[name].zone
    }));

    return res.json({
      success: true,
      suburbs: suburbs
    });

  } catch (error) {
    console.error('Error fetching suburbs:', error);
    return res.json({
      success: false,
      message: `An error occurred: ${error.message}`
    });
  }
});

module.exports = router;
