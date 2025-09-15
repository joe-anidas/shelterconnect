import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 4000,
  ssl: {
    rejectUnauthorized: true
  }
};

const chennaiRequests = [
  {
    id: 1,
    name: 'Raghavan Family',
    phone: '+91 98765 12345',
    needs: 'temporary shelter, food assistance',
    lat: 13.0418,
    lng: 80.2341
  },
  {
    id: 2,
    name: 'Kumar Family',
    phone: '+91 87654 32109',
    needs: 'emergency shelter, medical care',
    lat: 13.0067,
    lng: 80.2206
  },
  {
    id: 3,
    name: 'Sharma Family',
    phone: '+91 76543 21098',
    needs: 'family accommodation, child care',
    lat: 12.9810,
    lng: 80.2207
  },
  {
    id: 4,
    name: 'Iyer Family',
    phone: '+91 65432 10987',
    needs: 'temporary housing, elderly care',
    lat: 13.0850,
    lng: 80.2101
  },
  {
    id: 5,
    name: 'Patel Family',
    phone: '+91 94444 56789',
    needs: 'emergency shelter, food',
    lat: 13.0339,
    lng: 80.2619
  }
];

async function updateRequests() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Updating requests with Chennai locations and Indian names...');
    
    for (const request of chennaiRequests) {
      const query = `
        UPDATE requests 
        SET name = ?, phone = ?, needs = ?, lat = ?, lng = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      const [result] = await connection.execute(query, [
        request.name,
        request.phone,
        request.needs,
        request.lat.toString(),
        request.lng.toString(),
        request.id
      ]);
      
      console.log(`Updated request ID ${request.id}: ${request.name}`);
    }
    
    console.log('✅ All requests updated successfully!');
    
    // Display updated requests
    const [requests] = await connection.execute('SELECT id, name, phone, needs FROM requests ORDER BY id');
    console.log('\n📍 Updated request families:');
    requests.forEach(request => {
      console.log(`${request.id}. ${request.name} - ${request.phone} - ${request.needs}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating requests:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateRequests();
