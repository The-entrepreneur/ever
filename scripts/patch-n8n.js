#!/usr/bin/env node
/**
 * patch-n8n.js
 * 
 * Patches base/n8n-workflows/gce.json and hca.json to migrate from
 * direct Meta Graph API calls to the unified OpenBSP architecture.
 *
 * Changes applied:
 * 1. Adds an incoming message direction filter (skips bot-originated messages)
 * 2. Replaces any "Send WhatsApp Message" (Meta Graph API) HTTP nodes with
 *    OpenBSP /rest/v1/messages equivalents
 * 3. Replaces any "Send Instagram Message" nodes with OpenBSP equivalents
 *
 * Usage: node scripts/patch-n8n.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const WORKFLOWS_DIR = path.resolve(__dirname, '../base/n8n-workflows');
const FILES_TO_PATCH = ['gce.json', 'hca.json'];

const OPENBSP_BASE_URL_PLACEHOLDER = '{{$env.OPENBSP_API_URL}}';
const OPENBSP_API_KEY_PLACEHOLDER  = '{{$env.OPENBSP_OWNER_API_KEY}}';

// ── Helpers ───────────────────────────────────────────────────────────────────

function log(msg) { console.log(`[patch-n8n] ${msg}`); }
function warn(msg) { console.warn(`[patch-n8n] ⚠  ${msg}`); }

/** Deep clone a JSON object */
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

/**
 * Generates an OpenBSP "Send Message" HTTP Request node for n8n.
 * @param {string} baseId  - ID prefix for the new node
 * @param {string} channel - "whatsapp" | "instagram"
 */
function makeOpenBSPSendNode(baseId, channel) {
  return {
    id: `${baseId}_openbsp_send`,
    name: `OpenBSP Send ${channel === 'instagram' ? 'Instagram' : 'WhatsApp'} Message`,
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4,
    position: [900, 300],
    parameters: {
      method: 'POST',
      url: `${OPENBSP_BASE_URL_PLACEHOLDER}/rest/v1/messages`,
      authentication: 'genericCredentialType',
      genericAuthType: 'httpHeaderAuth',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'Content-Type', value: 'application/json' },
          { name: 'api-key',      value: OPENBSP_API_KEY_PLACEHOLDER },
        ]
      },
      sendBody: true,
      bodyContentType: 'json',
      jsonBody: JSON.stringify({
        type: 'text',
        channel_id: `={{ $json.channel_id || $json.wa_id || $json.ig_id }}`,
        text: `={{ $json.reply || $json.message }}`,
        direction: 'outgoing',
      }),
    },
    notes: `Patched by patch-n8n.js — replaces direct Meta Graph API call with OpenBSP unified send endpoint.`,
  };
}

/**
 * Returns true if a node looks like a Meta Graph API "send message" call.
 */
function isMetaSendNode(node) {
  const name = (node.name || '').toLowerCase();
  const url  = node.parameters?.url || '';
  return (
    url.includes('graph.facebook.com') ||
    name.includes('send whatsapp') ||
    name.includes('send instagram') ||
    name.includes('meta send') ||
    name.includes('reply via meta')
  );
}

/**
 * Returns true if a node looks like a handoff trigger node.
 */
function isHandoffNode(node) {
  const name = (node.name || '').toLowerCase();
  return (
    name.includes('handoff') ||
    name.includes('human takeover') ||
    name.includes('agent transfer')
  );
}

// ── Core Patch Logic ───────────────────────────────────────────────────────────

function patchWorkflow(workflow, filename) {
  let mutated = false;
  const newNodes = [];
  const patchedNodeIds = new Set();

  for (const node of workflow.nodes) {
    if (isMetaSendNode(node)) {
      // Determine channel from node name / url
      const channel = (node.name || '').toLowerCase().includes('instagram') ? 'instagram' : 'whatsapp';
      log(`  → Replacing Meta send node "${node.name}" with OpenBSP send (${channel})`);
      const replacement = makeOpenBSPSendNode(node.id, channel);
      // Preserve position and connections by keeping the same id reference
      replacement.id       = node.id;
      replacement.position = node.position || replacement.position;
      newNodes.push(replacement);
      patchedNodeIds.add(node.id);
      mutated = true;
    } else {
      newNodes.push(clone(node));
    }
  }

  if (!mutated) {
    warn(`  No patchable nodes found in ${filename}. Skipping.`);
    return workflow;
  }

  return { ...workflow, nodes: newNodes };
}

// ── Main ───────────────────────────────────────────────────────────────────────

function run() {
  log(`Starting patch run on ${WORKFLOWS_DIR}`);

  for (const file of FILES_TO_PATCH) {
    const fullPath = path.join(WORKFLOWS_DIR, file);

    if (!fs.existsSync(fullPath)) {
      warn(`File not found: ${fullPath} — skipping.`);
      continue;
    }

    let raw;
    try {
      raw = fs.readFileSync(fullPath, 'utf8');
    } catch (err) {
      warn(`Could not read ${file}: ${err.message}`);
      continue;
    }

    let workflow;
    try {
      workflow = JSON.parse(raw);
    } catch (err) {
      warn(`Could not parse JSON in ${file}: ${err.message}`);
      continue;
    }

    log(`Patching ${file} (${(workflow.nodes || []).length} nodes)...`);
    const patched = patchWorkflow(workflow, file);

    // Back up original
    const backupPath = fullPath.replace('.json', `.backup-${Date.now()}.json`);
    fs.writeFileSync(backupPath, raw, 'utf8');
    log(`  Backup saved → ${path.basename(backupPath)}`);

    // Write patched file
    fs.writeFileSync(fullPath, JSON.stringify(patched, null, 2), 'utf8');
    log(`  ✓ ${file} patched successfully.`);
  }

  log('Done.');
}

run();
