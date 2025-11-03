// models/Audit.js
const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema(
  {
    // Meta
    lang: { type: String, enum: ['en', 'fr', 'es'], default: 'en' },

    // Org Info
    orgName: { type: String, default: '' },
    siteAddresses: { type: String, default: '' }, // multiline blob; store as string
    reportStart: { type: Date },
    reportEnd: { type: Date },
    contactName: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },

    // Inputs (raw)
    fuelFactor: { type: Number, default: 0 }, // kg per unit
    fuelVol: { type: Number, default: 0 },
    gridFactor: { type: Number, default: 0 }, // kg per kWh
    kwh: { type: Number, default: 0 },
    mileage: { type: Number, default: 0 },
    waste: { type: Number, default: 0 },
    employees: { type: Number, default: 0 },

    // Calculated (server authoritative)
    fuelKg: { type: Number, default: 0 },
    elecKg: { type: Number, default: 0 },
    transKg: { type: Number, default: 0 },
    wasteKg: { type: Number, default: 0 },

    scope1Tonnes: { type: Number, default: 0 },
    scope2Tonnes: { type: Number, default: 0 },
    scope3Tonnes: { type: Number, default: 0 },
    totalTonnes: { type: Number, default: 0 },
    perEmployeeTonnes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Audit', AuditSchema);
