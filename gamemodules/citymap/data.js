/* CoderWarz City Map — Data Layer (districts, travel, missions, bonuses) */
window.CityMap = window.CityMap || {};

(function() {
  var CM = window.CityMap;

  // === TRAVEL TIME CALCULATOR ===
  // Travel is node-based. Time = Manhattan distance * base multiplier
  // Modified by traffic density in source/destination districts
  var TRAVEL_BASE_MINUTES = 2; // per grid unit

  function calcTravelTime(fromNode, toNode, districts) {
    if(!fromNode || !toNode) return 0;
    var manhattan = Math.abs(fromNode.x - toNode.x) + Math.abs(fromNode.y - toNode.y);
    var base = manhattan * TRAVEL_BASE_MINUTES;

    // Traffic modifier: high traffic = slower
    var fromDist = districts[fromNode.district] || {};
    var toDist = districts[toNode.district] || {};
    var trafficMod = 1 + ((fromDist.traffic || 0.5) + (toDist.traffic || 0.5)) / 4;

    return Math.round(base * trafficMod);
  }

  // === DISTRICT BONUSES ===
  // Affect business performance when your branch is in that district
  var DISTRICT_BONUSES = {
    commercial: {
      customerFlow: 1.2,   // 20% more customers
      priceMultiplier: 1.0, // normal prices
      crimeRisk: 0.05,
      desc: 'High foot traffic, moderate prices.',
    },
    residential: {
      customerFlow: 0.7,
      priceMultiplier: 0.85, // lower prices tolerated
      crimeRisk: 0.02,
      desc: 'Steady local clientele, budget-conscious.',
    },
    nightlife: {
      customerFlow: 1.4,   // late night rush
      priceMultiplier: 1.15, // premium prices tolerated
      crimeRisk: 0.25,
      desc: 'Late-night crowds, higher prices, more crime.',
    },
    industrial: {
      customerFlow: 0.5,
      priceMultiplier: 0.9,
      crimeRisk: 0.15,
      desc: 'Low traffic, cheap supplies nearby.',
    },
    downtown: {
      customerFlow: 1.5,
      priceMultiplier: 1.3, // premium prices
      crimeRisk: 0.1,
      desc: 'Prime location, maximum customers, premium pricing.',
    },
    suburbs: {
      customerFlow: 0.6,
      priceMultiplier: 0.8,
      crimeRisk: 0.03,
      desc: 'Quiet area, family clientele, low crime.',
    },
  };

  // === LOCATION TYPES & EFFECTS ===
  var LOCATION_EFFECTS = {
    bank: {
      canDeposit: true,
      canWithdraw: true,
      canLoan: true,
      loanRate: 0.05,
      depositRate: 0.02,
    },
    restaurant: {
      canOrder: true,
      canRob: true,
      canSabotage: true,
      customerDensity: 'high',
    },
    supplier: {
      canBuyIngredients: true,
      bulkDiscount: 0.15,
      freshnessBonus: 1.2,
    },
    syndicate: {
      canLaunder: true,
      canHireCriminals: true,
      canBuyWeapons: true,
      missionsAvailable: ['robbery', 'sabotage', 'intimidation', 'hitman'],
    },
    rival: {
      canAttack: true,
      canSpy: true,
      canSteal: true,
      defenseLevel: 3,
    },
    warehouse: {
      canStore: true,
      canLaunder: true,
      capacity: 50,
    },
    player: {
      isOwned: true,
      canManage: true,
      canUpgrade: true,
    },
  };

  // === MISSION SYSTEM ===
  var MISSION_TYPES = {
    robbery: {
      name: 'Robbery',
      baseReward: 15000,
      baseRisk: 0.35,
      travelTimeMultiplier: 1.5,
      requiresCriminal: true,
      criminalSkill: 'combat',
      targets: ['bank', 'restaurant', 'warehouse'],
      effects: {
        dirtyCash: true,
        reputationHit: -10,
        policeHeat: +5,
      },
    },
    sabotage: {
      name: 'Sabotage',
      baseReward: 8000,
      baseRisk: 0.2,
      travelTimeMultiplier: 1.2,
      requiresCriminal: true,
      criminalSkill: 'technical',
      targets: ['rival', 'restaurant'],
      effects: {
        rivalDamage: true,
        reputationHit: -5,
        policeHeat: +2,
      },
    },
    intimidation: {
      name: 'Intimidation',
      baseReward: 10000,
      baseRisk: 0.25,
      travelTimeMultiplier: 1.0,
      requiresCriminal: true,
      criminalSkill: 'presence',
      targets: ['restaurant', 'rival'],
      effects: {
        rivalFear: +20,
        reputationHit: -8,
        policeHeat: +3,
      },
    },
    hitman: {
      name: 'Hitman',
      baseReward: 25000,
      baseRisk: 0.5,
      travelTimeMultiplier: 2.0,
      requiresCriminal: true,
      criminalSkill: 'combat',
      targets: ['rival'],
      effects: {
        rivalManagerRemoved: true,
        reputationHit: -20,
        policeHeat: +10,
      },
    },
    supplyRun: {
      name: 'Supply Run',
      baseReward: 2000,
      baseRisk: 0.05,
      travelTimeMultiplier: 0.8,
      requiresCriminal: false,
      targets: ['supplier'],
      effects: {
        ingredients: true,
        freshness: 1.0,
      },
    },
    launder: {
      name: 'Launder Money',
      baseReward: 0,
      baseRisk: 0.1,
      travelTimeMultiplier: 1.0,
      requiresCriminal: false,
      targets: ['warehouse', 'syndicate'],
      effects: {
        cleanCash: true,
        fee: 0.15,
      },
    },
  };

  // === CRIME HEAT SYSTEM ===
  // Heat increases when committing crimes. Higher heat = more police, harder missions.
  var heatDecay = 0.5; // per in-game hour
  var maxHeat = 100;

  function calcHeatPenalty(heat) {
    if(heat < 20) return 1.0;
    if(heat < 50) return 0.85;
    if(heat < 80) return 0.7;
    return 0.5; // very high heat = mission success halved
  }

  function calcPoliceResponse(heat) {
    if(heat < 30) return 'none';
    if(heat < 60) return 'patrol';
    if(heat < 80) return 'investigation';
    return 'raid';
  }

  // === CUSTOMER FLOW MODEL ===
  function calcCustomerFlow(district, hourOfDay, weatherMod) {
    var base = DISTRICT_BONUSES[district] ? DISTRICT_BONUSES[district].customerFlow : 0.5;

    // Time of day modifier
    var timeMod = 1.0;
    if(hourOfDay >= 7 && hourOfDay <= 9) timeMod = 1.3;   // morning rush
    if(hourOfDay >= 11 && hourOfDay <= 14) timeMod = 1.5;  // lunch
    if(hourOfDay >= 18 && hourOfDay <= 21) timeMod = 1.4;  // dinner
    if(hourOfDay >= 22 || hourOfDay <= 5) timeMod = 0.3;   // late night

    // Nightlife district: inverted hours
    if(district === 'nightlife') {
      if(hourOfDay >= 20 || hourOfDay <= 3) timeMod = 1.8;
      else if(hourOfDay >= 10 && hourOfDay <= 17) timeMod = 0.4;
    }

    return Math.round(base * timeMod * (weatherMod || 1.0) * 100);
  }

  // === BRANCH LOCATION SCORING ===
  function scoreLocation(districtType, playerStats) {
    var d = DISTRICT_BONUSES[districtType];
    if(!d) return 0;

    var score = 0;
    score += d.customerFlow * 30;
    score += d.priceMultiplier * 20;
    score -= d.crimeRisk * 50;

    // Player bonuses
    if(playerStats) {
      if(playerStats.reputation > 50) score += 10;
      if(playerStats.crewSize > 3) score -= d.crimeRisk * 20; // crew reduces crime impact
      if(playerStats.cash > 100000) score += 5; // can afford premium locations
    }

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  // === PUBLIC API ===
  CM.Data = {
    calcTravelTime: calcTravelTime,
    DISTRICT_BONUSES: DISTRICT_BONUSES,
    LOCATION_EFFECTS: LOCATION_EFFECTS,
    MISSION_TYPES: MISSION_TYPES,
    calcHeatPenalty: calcHeatPenalty,
    calcPoliceResponse: calcPoliceResponse,
    calcCustomerFlow: calcCustomerFlow,
    scoreLocation: scoreLocation,
    TRAVEL_BASE_MINUTES: TRAVEL_BASE_MINUTES,
  };

})();
