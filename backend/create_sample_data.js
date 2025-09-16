// Create sample data for testing the TiDB Vector Search workflow
import db from './config/database.js';

async function createSampleData() {
  try {
    console.log('🚀 Creating sample data for TiDB Vector Search demo...');

    // Create sample requests
    const sampleRequests = [
      {
        name: 'Ravi Kumar Family',
        people_count: 4,
        needs: 'Family of software engineers with laptops and medical equipment needs. Elderly grandmother requires wheelchair access and medication storage. Need power for medical devices.',
        features_required: 'medical,wheelchair,power,elderly-care',
        lat: 13.08500000,
        lng: 80.27200000,
        phone: '+91 98888 11111',
        urgency: 'high'
      },
      {
        name: 'Priya Sharma Family',
        people_count: 6,
        needs: 'Family with diabetic child requiring refrigerated medication and clean medical environment. Pet dog needs accommodation. Mother is pregnant.',
        features_required: 'medical,pediatric,pet-friendly,pharmacy,prenatal',
        lat: 13.06500000,
        lng: 80.29200000,
        phone: '+91 97777 22222',
        urgency: 'high'
      },
      {
        name: 'Venkatesh Extended Family',
        people_count: 12,
        needs: 'Multi-generational family including 3 elderly members with mobility issues, 4 children ages 2-10, and service animal. Need childcare and elder care facilities.',
        features_required: 'wheelchair,elderly-care,child-friendly,childcare,pet-friendly',
        lat: 13.10500000,
        lng: 80.25200000,
        phone: '+91 96666 33333',
        urgency: 'medium'
      },
      {
        name: 'Tech Startup Team',
        people_count: 8,
        needs: 'Group of young professionals with laptops and technical equipment. Need reliable power and internet for remote work coordination.',
        features_required: 'power,wifi,laptop-charging,tech-support',
        lat: 12.99500000,
        lng: 80.24500000,
        phone: '+91 95555 44444',
        urgency: 'low'
      }
    ];

    // Insert requests
    for (let i = 0; i < sampleRequests.length; i++) {
      const req = sampleRequests[i];
      const [result] = await db.execute(
        `INSERT INTO requests (name, people_count, needs, features_required, lat, lng, phone, urgency, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [req.name, req.people_count, req.needs, req.features_required, req.lat, req.lng, req.phone, req.urgency]
      );
      console.log(`✅ Created request ${result.insertId}: ${req.name}`);
    }

    // Check created requests
    const [requests] = await db.execute('SELECT id, name, status FROM requests');
    console.log(`\n📊 Total requests created: ${requests.length}`);
    requests.forEach(r => console.log(`  ID: ${r.id}, Name: ${r.name}, Status: ${r.status}`));

    console.log('\n🎯 Sample data creation completed! Ready for TiDB Vector Search demo.');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
  } finally {
    process.exit(0);
  }
}

createSampleData();