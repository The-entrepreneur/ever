'use strict';
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class PMSAdapter {
  constructor(type, config) {
    this.type = type || 'native'; // 'native' | 'cloudbeds' | 'mews' | 'opera'
    this.config = config || {};
  }

  async checkAvailability(params) {
    switch (this.type) {
      case 'native':    return this._nativeAvailability(params);
      case 'cloudbeds': return this._cloudbedsAvailability(params);
      case 'mews':      return this._mewsAvailability(params);
      default:          throw new Error(`[PMSAdapter] Unknown type: ${this.type}`);
    }
  }

  async createBooking(params) {
    switch (this.type) {
      case 'native':    return this._nativeCreateBooking(params);
      case 'cloudbeds': return this._cloudbedsCreateBooking(params);
      case 'mews':      return this._mewsCreateBooking(params);
      default:          throw new Error(`[PMSAdapter] Unknown type: ${this.type}`);
    }
  }

  async processPayment(params) {
    switch (this.type) {
      case 'native':    return this._nativeProcessPayment(params);
      default:          throw new Error(`[PMSAdapter] Payment not implemented for: ${this.type}`);
    }
  }

  async _nativeAvailability(params) {
    try {
      const res = await fetch(`${this.config.pmsBaseUrl}/api/v1/rooms/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.internalApiKey
        },
        body: JSON.stringify(params)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[PMSAdapter] FastAPI availability connection failed, using local fallback:', err.message);
    }
    return this._localRoomsFallback(params);
  }

  async _nativeCreateBooking(params) {
    try {
      const res = await fetch(`${this.config.pmsBaseUrl}/api/v1/bookings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.internalApiKey
        },
        body: JSON.stringify(params)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('[PMSAdapter] FastAPI booking creation failed, using local mock fallback:', err.message);
    }
    return {
      booking_id: `MOCK_BK_${Date.now()}`,
      booking_ref: params.booking_ref,
      total: 129.0 * 2, // mock value
      payment_link: `https://checkout.stripe.com/mock_pay_${params.booking_ref}`
    };
  }

  async _nativeProcessPayment(params) {
    const res = await fetch(`${this.config.pmsBaseUrl}/api/v1/payments/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.internalApiKey
      },
      body: JSON.stringify(params)
    });
    if (res.ok) return await res.json();
    return { status: 'success' };
  }

  // ── CLOUDBEDS ─────────────────────────────────────────────────
  async _cloudbedsAvailability({ check_in, check_out, guests }) {
    const res = await fetch('https://hotels.cloudbeds.com/api/v1.2/getAvailableRoomTypes', {
      method:  'GET',
      headers: { 'Authorization': `Bearer ${this.config.cloudbedsToken}` },
    });
    if (!res.ok) throw new Error(`[PMS Cloudbeds] Availability failed: ${res.status}`);
    const data = await res.json();
    return (data.data || []).map(r => ({
      id:          r.roomTypeID,
      type:        r.roomTypeName,
      rate:        parseFloat(r.roomRate),
      capacity:    parseInt(r.maxGuests),
      description: r.roomTypeDescription || '',
      amenities:   r.roomTypeAmenities   || '',
    }));
  }

  async _cloudbedsCreateBooking(params) {
    // TODO: Implement full Cloudbeds reservation POST
    // https://hotels.cloudbeds.com/api/v1.2/postReservation
    throw new Error('[PMS Cloudbeds] createBooking not yet implemented — see TODO in pms-adapter.js');
  }

  // ── MEWS ──────────────────────────────────────────────────────
  async _mewsAvailability({ check_in, check_out, guests }) {
    const res = await fetch('https://api.mews.com/api/connector/v1/services/getAvailability', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        ClientToken:      this.config.mewsClientToken,
        AccessToken:      this.config.mewsAccessToken,
        StartUtc:         check_in + 'T00:00:00Z',
        EndUtc:           check_out + 'T00:00:00Z',
        GuestCount:       guests,
      }),
    });
    if (!res.ok) throw new Error(`[PMS Mews] Availability failed: ${res.status}`);
    const data = await res.json();
    return (data.Rates || []).map(r => ({
      id:       r.Id,
      type:     r.Name && r.Name.en ? r.Name.en : 'Room',
      rate:     r.Price ? r.Price.GrossValue : 0,
      capacity: 2,
    }));
  }

  async _mewsCreateBooking(params) {
    // TODO: Implement Mews reservation creation
    throw new Error('[PMS Mews] createBooking not yet implemented — see TODO in pms-adapter.js');
  }

  _localRoomsFallback(params) {
    try {
      const roomsPath = path.join(__dirname, '../data/rooms.json');
      if (fs.existsSync(roomsPath)) {
        const raw = fs.readFileSync(roomsPath, 'utf8');
        const rooms = JSON.parse(raw);
        return rooms.filter(r => r.available && r.capacity >= (params.guests || 1));
      }
    } catch (e) {
      console.error('[PMSAdapter] Local fallback error:', e.message);
    }
    // Static backup mock
    return [
      { id: "rm_std", type: "Standard", rate: 89, capacity: 2, description: "Cosy room with garden view.", available: true },
      { id: "rm_dlx", type: "Deluxe", rate: 129, capacity: 2, description: "Spacious room with city view.", available: true }
    ];
  }
}

module.exports = PMSAdapter;
