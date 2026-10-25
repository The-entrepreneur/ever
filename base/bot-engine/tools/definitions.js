'use strict';

/**
 * tools/definitions.js — Canonical Hospitality Tool / Function Calling Schemas
 * 
 * Standard JSON Schema specifications formatted for OpenAI / Groq / Anthropic
 * function calling interfaces. Replaces fragile plaintext regex parsing ([LEAD:...],
 * [ORDER_INTENT:...]) with deterministic, type-safe execution.
 */

const HOSPITALITY_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'lookup_guest_360',
      description: 'Retrieve longitudinal guest stay history, VIP tier, known room and dietary preferences, and notes using their phone number or email.',
      parameters: {
        type: 'object',
        properties: {
          identifier: {
            type: 'string',
            description: 'The guest phone number (in E.164 format e.g. +2348012345678) or email address.'
          }
        },
        required: ['identifier']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_knowledge_base',
      description: 'Perform semantic RAG retrieval across the hotel knowledge base, policies, FAQs, and facility operational rules.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The natural language question or topic (e.g. "pet policy", "pool hours", "breakfast inclusions").'
          }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'check_room_availability',
      description: 'Check live property room inventory and rates for specified arrival and departure dates.',
      parameters: {
        type: 'object',
        properties: {
          check_in: {
            type: 'string',
            description: 'Arrival date in YYYY-MM-DD format.'
          },
          check_out: {
            type: 'string',
            description: 'Departure date in YYYY-MM-DD format.'
          },
          guests: {
            type: 'integer',
            description: 'Number of adult guests (default: 1).'
          },
          room_type: {
            type: 'string',
            description: 'Optional specific room category filter (e.g. "Deluxe Suite", "Executive King").'
          }
        },
        required: ['check_in', 'check_out']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_room_hold',
      description: 'Place a 15-minute soft lock on a selected room type in Redis to avoid inventory race conditions during payment.',
      parameters: {
        type: 'object',
        properties: {
          room_id: {
            type: 'string',
            description: 'The room category identifier.'
          },
          check_in: {
            type: 'string',
            description: 'Arrival date (YYYY-MM-DD).'
          },
          check_out: {
            type: 'string',
            description: 'Departure date (YYYY-MM-DD).'
          }
        },
        required: ['room_id', 'check_in', 'check_out']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'create_reservation',
      description: 'Create a confirmed room reservation and generate an authenticated direct booking reference & payment link.',
      parameters: {
        type: 'object',
        properties: {
          guest_name: { type: 'string', description: 'Full legal name of the primary guest.' },
          email: { type: 'string', description: 'Guest email address for confirmation receipt.' },
          phone: { type: 'string', description: 'Guest contact phone number.' },
          room_type: { type: 'string', description: 'Selected room category.' },
          check_in: { type: 'string', description: 'Check-in date (YYYY-MM-DD).' },
          check_out: { type: 'string', description: 'Check-out date (YYYY-MM-DD).' },
          guests: { type: 'integer', description: 'Total guest count.' },
          special_requests: { type: 'string', description: 'Special guest requests (e.g. quiet room, late arrival).' }
        },
        required: ['guest_name', 'email', 'room_type', 'check_in', 'check_out']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_reservation_status',
      description: 'Look up an existing booking details, room assignment, and payment status using a confirmation reference code or guest phone.',
      parameters: {
        type: 'object',
        properties: {
          booking_reference: {
            type: 'string',
            description: 'The booking confirmation code (e.g. GH-AB12CD).'
          },
          guest_phone: {
            type: 'string',
            description: 'Guest contact phone number.'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_folio_balance',
      description: 'Inquire the current accumulated room folio charge balance for an in-house guest.',
      parameters: {
        type: 'object',
        properties: {
          room_number: { type: 'string', description: 'The room number.' },
          guest_last_name: { type: 'string', description: 'Guest surname for security verification.' }
        },
        required: ['room_number', 'guest_last_name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'request_late_checkout',
      description: 'Submit an in-stay late check-out request, validating property availability threshold and calculating associated fees.',
      parameters: {
        type: 'object',
        properties: {
          room_number: { type: 'string', description: 'Room number of the requesting guest.' },
          requested_time: { type: 'string', description: 'Desired check-out time (e.g. "14:00" or "2:00 PM").' }
        },
        required: ['room_number', 'requested_time']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'request_room_amenity',
      description: 'Dispatch a specific housekeeping amenity delivery (towels, feather-free pillows, dental kit, iron) directly to an occupied room.',
      parameters: {
        type: 'object',
        properties: {
          room_number: { type: 'string', description: 'Occupied room number.' },
          item: { type: 'string', description: 'Requested amenity item.' },
          quantity: { type: 'integer', description: 'Quantity needed (default: 1).' },
          notes: { type: 'string', description: 'Special delivery instructions.' }
        },
        required: ['room_number', 'item']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'submit_maintenance_ticket',
      description: 'Create an urgent maintenance alert for property engineering (e.g. AC failure, plumbing, Wi-Fi outage).',
      parameters: {
        type: 'object',
        properties: {
          room_number: { type: 'string', description: 'Room or physical area location.' },
          category: {
            type: 'string',
            enum: ['air_conditioning', 'plumbing', 'electrical', 'wifi', 'tv_entertainment', 'lock_door', 'other'],
            description: 'Issue category.'
          },
          urgency: {
            type: 'string',
            enum: ['urgent', 'normal', 'low'],
            description: 'Priority level.'
          },
          description: { type: 'string', description: 'Detailed problem description.' }
        },
        required: ['room_number', 'category', 'description']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'place_dining_order',
      description: 'Place an in-room dining or beverage order, dispatching kitchen tickets and posting room folio charges.',
      parameters: {
        type: 'object',
        properties: {
          room_number: { type: 'string', description: 'Delivering room number.' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                item_name: { type: 'string', description: 'Name of the menu item.' },
                quantity: { type: 'integer', description: 'Quantity ordered.' },
                notes: { type: 'string', description: 'Preparation notes (e.g. "no dairy", "dressing on side").' }
              },
              required: ['item_name', 'quantity']
            },
            description: 'List of ordered items.'
          },
          delivery_notes: { type: 'string', description: 'Optional delivery notes.' }
        },
        required: ['room_number', 'items']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'post_folio_charge',
      description: 'Post an authenticated incidental, amenity, or service fee directly to an occupied guest room folio in the hotel PMS.',
      parameters: {
        type: 'object',
        properties: {
          room_number: { type: 'string', description: 'Occupied room number to charge.' },
          amount: { type: 'number', description: 'Total charge amount in property local currency.' },
          description: { type: 'string', description: 'Itemized description of the charge (e.g. "Laundry Wash & Press", "Minibar Restock").' },
          category: {
            type: 'string',
            enum: ['dining', 'spa', 'laundry', 'minibar', 'late_checkout', 'transport', 'miscellaneous'],
            description: 'Departmental revenue category.'
          }
        },
        required: ['room_number', 'amount', 'description']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'reserve_restaurant_table',
      description: 'Book a table reservation for an in-house or walk-in guest at the hotel restaurant.',
      parameters: {
        type: 'object',
        properties: {
          room_number: { type: 'string', description: 'Room number if in-house guest.' },
          guest_name: { type: 'string', description: 'Primary contact name for the table reservation.' },
          party_size: { type: 'integer', description: 'Number of dining guests.' },
          reservation_date: { type: 'string', description: 'Date of reservation in YYYY-MM-DD format.' },
          reservation_time: { type: 'string', description: 'Reservation time (e.g. "19:30" or "7:30 PM").' },
          special_requests: { type: 'string', description: 'Dietary preferences, anniversary/birthday notes, or seating requests.' }
        },
        required: ['party_size', 'reservation_date', 'reservation_time']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'request_laundry_service',
      description: 'Schedule a laundry or dry-cleaning pickup request from a guest room with specified turnaround tier.',
      parameters: {
        type: 'object',
        properties: {
          room_number: { type: 'string', description: 'Guest room number.' },
          service_tier: {
            type: 'string',
            enum: ['standard_next_day', 'same_day_express', 'dry_clean_only', 'press_only'],
            description: 'Turnaround speed and treatment type.'
          },
          items_description: { type: 'string', description: 'Description or quantity of garments (e.g. "2 suits, 4 dress shirts").' },
          pickup_time: { type: 'string', description: 'Preferred pickup time.' }
        },
        required: ['room_number', 'service_tier']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'escalate_to_staff',
      description: 'Trigger a human handoff alert, notifying the on-duty manager or receptionist via WhatsApp and Email.',
      parameters: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'Summary of why the guest needs staff intervention.'
          },
          urgency: {
            type: 'string',
            enum: ['critical', 'high', 'normal'],
            description: 'Escalation severity.'
          }
        },
        required: ['reason']
      }
    }
  }
];

module.exports = {
  HOSPITALITY_TOOLS
};
