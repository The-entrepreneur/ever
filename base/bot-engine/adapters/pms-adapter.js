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
    if (this.type === 'native') {
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
    // Stub for cloudbeds/mews
    return [];
  }

  async createBooking(params) {
    if (this.type === 'native') {
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
    return {};
  }

  async processPayment(params) {
    if (this.type === 'native') {
      const res = await fetch(`${this.config.pmsBaseUrl}/api/v1/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.internalApiKey
        },
        body: JSON.stringify(params)
      });
      return await res.json();
    }
    return { status: 'success' };
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
