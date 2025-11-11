#!/usr/bin/env node

/**
 * GTM + GA4 Configuration Setup Guide
 * 
 * This script provides the complete configuration for Google Tag Manager
 * to work with GA4 and smart event tracking.
 */

const GTM_CONFIGURATION = {
  containerId: 'GTM-W7L94JHW',
  ga4MeasurementId: 'G-QJXSCJ0L43',
  
  tags: [
    {
      name: 'GA4 Configuration',
      type: 'Google Analytics: GA4 Configuration',
      measurementId: 'G-QJXSCJ0L43',
      trigger: 'All Pages',
      settings: {
        'send_page_view': true,
        'enhanced_measurement': true,
        'cookie_domain': 'auto',
        'cookie_expires': 63072000, // 2 years
        'anonymize_ip': false
      }
    },
    {
      name: 'GA4 Event - Scroll Depth',
      type: 'Google Analytics: GA4 Event',
      eventName: 'scroll_depth',
      trigger: 'Custom Event - scroll_depth',
      parameters: {
        'scroll_depth': '{{DLV - scroll_depth}}',
        'page_location': '{{Page URL}}',
        'page_title': '{{Page Title}}'
      }
    },
    {
      name: 'GA4 Event - Outbound Click',
      type: 'Google Analytics: GA4 Event',
      eventName: 'outbound_click',
      trigger: 'Custom Event - outbound_click',
      parameters: {
        'link_url': '{{DLV - link_url}}',
        'link_text': '{{DLV - link_text}}',
        'page_location': '{{Page URL}}'
      }
    },
    {
      name: 'GA4 Event - Form Submission',
      type: 'Google Analytics: GA4 Event',
      eventName: 'form_submission',
      trigger: 'Custom Event - form_submission',
      parameters: {
        'form_id': '{{DLV - form_id}}',
        'form_class': '{{DLV - form_class}}',
        'page_location': '{{Page URL}}',
        'page_title': '{{Page Title}}'
      }
    },
    {
      name: 'GA4 Event - Engaged Session',
      type: 'Google Analytics: GA4 Event',
      eventName: 'engaged_session',
      trigger: 'Custom Event - engaged_session',
      parameters: {
        'engagement_time': '{{DLV - engagement_time}}',
        'page_location': '{{Page URL}}',
        'page_title': '{{Page Title}}'
      }
    }
  ],
  
  triggers: [
    {
      name: 'All Pages',
      type: 'Page View',
      conditions: 'All Pages'
    },
    {
      name: 'Custom Event - scroll_depth',
      type: 'Custom Event',
      eventName: 'scroll_depth'
    },
    {
      name: 'Custom Event - outbound_click',
      type: 'Custom Event',
      eventName: 'outbound_click'
    },
    {
      name: 'Custom Event - form_submission',
      type: 'Custom Event',
      eventName: 'form_submission'
    },
    {
      name: 'Custom Event - engaged_session',
      type: 'Custom Event',
      eventName: 'engaged_session'
    }
  ],
  
  variables: [
    {
      name: 'DLV - scroll_depth',
      type: 'Data Layer Variable',
      dataLayerVariableName: 'scroll_depth'
    },
    {
      name: 'DLV - link_url',
      type: 'Data Layer Variable',
      dataLayerVariableName: 'link_url'
    },
    {
      name: 'DLV - link_text',
      type: 'Data Layer Variable',
      dataLayerVariableName: 'link_text'
    },
    {
      name: 'DLV - form_id',
      type: 'Data Layer Variable',
      dataLayerVariableName: 'form_id'
    },
    {
      name: 'DLV - form_class',
      type: 'Data Layer Variable',
      dataLayerVariableName: 'form_class'
    },
    {
      name: 'DLV - engagement_time',
      type: 'Data Layer Variable',
      dataLayerVariableName: 'engagement_time'
    }
  ]
};

const GA4_CONVERSIONS = [
  {
    eventName: 'form_submission',
    purpose: 'Lead form completions',
    description: 'Tracks when users submit contact forms'
  },
  {
    eventName: 'outbound_click',
    purpose: 'External partner clicks',
    description: 'Tracks clicks to external websites and contact links'
  },
  {
    eventName: 'scroll_depth',
    purpose: 'Content engagement',
    description: 'Optional engagement metric for content consumption'
  },
  {
    eventName: 'engaged_session',
    purpose: 'Quality engagement',
    description: 'Users who spend 30+ seconds actively viewing content'
  }
];

function displayConfiguration() {
  console.log('🏷️  GTM + GA4 Configuration Guide');
  console.log('=====================================\n');
  
  console.log(`📋 Container Details:`);
  console.log(`   GTM Container ID: ${GTM_CONFIGURATION.containerId}`);
  console.log(`   GA4 Measurement ID: ${GTM_CONFIGURATION.ga4MeasurementId}\n`);
  
  console.log('🔧 Manual GTM Setup Steps:');
  console.log('1. Go to https://tagmanager.google.com/');
  console.log(`2. Open container ${GTM_CONFIGURATION.containerId}`);
  console.log('3. Create the following tags, triggers, and variables:\n');
  
  console.log('📊 Variables to Create:');
  GTM_CONFIGURATION.variables.forEach((variable, index) => {
    console.log(`   ${index + 1}. ${variable.name}`);
    console.log(`      Type: ${variable.type}`);
    console.log(`      Data Layer Variable Name: ${variable.dataLayerVariableName}\n`);
  });
  
  console.log('🎯 Triggers to Create:');
  GTM_CONFIGURATION.triggers.forEach((trigger, index) => {
    console.log(`   ${index + 1}. ${trigger.name}`);
    console.log(`      Type: ${trigger.type}`);
    if (trigger.eventName) {
      console.log(`      Event Name: ${trigger.eventName}`);
    }
    console.log(`      Conditions: ${trigger.conditions || 'Default'}\n`);
  });
  
  console.log('🏷️  Tags to Create:');
  GTM_CONFIGURATION.tags.forEach((tag, index) => {
    console.log(`   ${index + 1}. ${tag.name}`);
    console.log(`      Type: ${tag.type}`);
    if (tag.measurementId) {
      console.log(`      Measurement ID: ${tag.measurementId}`);
    }
    if (tag.eventName) {
      console.log(`      Event Name: ${tag.eventName}`);
    }
    console.log(`      Trigger: ${tag.trigger}\n`);
  });
  
  console.log('🎯 GA4 Conversion Events:');
  console.log('After publishing GTM container, mark these events as conversions in GA4:\n');
  GA4_CONVERSIONS.forEach((conversion, index) => {
    console.log(`   ${index + 1}. ${conversion.eventName}`);
    console.log(`      Purpose: ${conversion.purpose}`);
    console.log(`      Description: ${conversion.description}\n`);
  });
  
  console.log('✅ Deployment Checklist:');
  console.log('1. ✅ GTM snippets added to layout.tsx');
  console.log('2. ⏳ Create GTM tags/triggers/variables (manual step)');
  console.log('3. ⏳ Publish GTM container');
  console.log('4. ⏳ Mark events as conversions in GA4');
  console.log('5. ⏳ Deploy website changes');
  console.log('6. ⏳ Test with Google Tag Assistant');
  console.log('7. ⏳ Verify in GA4 Realtime reports\n');
}

function generateGTMImportJSON() {
  const importData = {
    exportFormatVersion: 2,
    exportTime: new Date().toISOString(),
    containerVersion: {
      accountId: "ACCOUNT_ID",
      containerId: GTM_CONFIGURATION.containerId,
      containerVersionId: "1",
      name: "Vivid Media Cheshire - Smart Events",
      description: "Complete GTM setup with GA4 and smart event tracking",
      tag: GTM_CONFIGURATION.tags.map((tag, index) => ({
        accountId: "ACCOUNT_ID",
        containerId: GTM_CONFIGURATION.containerId,
        tagId: (index + 1).toString(),
        name: tag.name,
        type: tag.type.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        parameter: Object.entries(tag.parameters || {}).map(([key, value]) => ({
          type: "TEMPLATE",
          key: key,
          value: value
        }))
      })),
      trigger: GTM_CONFIGURATION.triggers.map((trigger, index) => ({
        accountId: "ACCOUNT_ID",
        containerId: GTM_CONFIGURATION.containerId,
        triggerId: (index + 1).toString(),
        name: trigger.name,
        type: trigger.type.toLowerCase().replace(/[^a-z0-9]/g, '_')
      })),
      variable: GTM_CONFIGURATION.variables.map((variable, index) => ({
        accountId: "ACCOUNT_ID",
        containerId: GTM_CONFIGURATION.containerId,
        variableId: (index + 1).toString(),
        name: variable.name,
        type: variable.type.toLowerCase().replace(/[^a-z0-9]/g, '_')
      }))
    }
  };
  
  return JSON.stringify(importData, null, 2);
}

if (require.main === module) {
  displayConfiguration();
  
  // Optionally save configuration to file
  const fs = require('fs');
  const configPath = 'gtm-configuration.json';
  
  try {
    fs.writeFileSync(configPath, JSON.stringify(GTM_CONFIGURATION, null, 2));
    console.log(`📄 Configuration saved to ${configPath}`);
  } catch (error) {
    console.log('⚠️  Could not save configuration file');
  }
}

module.exports = { GTM_CONFIGURATION, GA4_CONVERSIONS };