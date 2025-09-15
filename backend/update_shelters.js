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

const chennaiiShelters = [
  {
    id: 1,
    name: 'Rajiv Gandhi Memorial Relief Center',
    address: 'Anna Salai, Mount Road, Chennai',
    lat: 13.0627,
    lng: 80.2707,
    phone: '+91 94444 12345'
  },
  {
    id: 2,
    name: 'Dr. APJ Abdul Kalam Community Center',
    address: 'OMR, Sholinganallur, Chennai',
    lat: 12.9010,
    lng: 80.2279,
    phone: '+91 98765 43210'
  },
  {
    id: 4,
    name: 'St. Thomas Cathedral Community Hall',
    address: 'Cathedral Road, Gopalapuram, Chennai',
    lat: 13.0569,
    lng: 80.2486,
    phone: '+91 91234 56789'
  },
  {
    id: 5,
    name: 'Marina Beach Community Center',
    address: 'Marina Beach Road, Triplicane, Chennai',
    lat: 13.0524,
    lng: 80.2824,
    phone: '+91 76543 21098'
  },
  {
    id: 6,
    name: 'IIT Madras Emergency Shelter',
    address: 'IIT Campus, Adyar, Chennai',
    lat: 12.9916,
    lng: 80.2336,
    phone: '+91 87654 32109'
  },
  {
    id: 7,
    name: 'Nehru Stadium Sports Complex',
    address: 'Park Town, Chennai',
    lat: 13.0878,
    lng: 80.2785,
    phone: '+91 65432 10987'
  },
  {
    id: 8,
    name: 'Apollo Hospital Emergency Shelter',
    address: 'Greams Lane, Thousand Lights, Chennai',
    lat: 13.0610,
    lng: 80.2590,
    phone: '+91 95555 12345'
  },
  {
    id: 9,
    name: 'TIDEL Park Tech Shelter',
    address: 'TIDEL Park, Taramani, Chennai',
    lat: 12.9950,
    lng: 80.2450,
    phone: '+91 93333 67890'
  },
  {
    id: 10,
    name: 'Kalakshetra Family Care Center',
    address: 'Thiruvanmiyur, Chennai',
    lat: 12.9820,
    lng: 80.2580,
    phone: '+91 91111 23456'
  }
];

async function updateShelters() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Updating shelters with Chennai locations and Indian names...');
    
    for (const shelter of chennaiiShelters) {
      const query = `
        UPDATE shelters 
        SET name = ?, address = ?, lat = ?, lng = ?, phone = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      const [result] = await connection.execute(query, [
        shelter.name,
        shelter.address,
        shelter.lat.toString(),
        shelter.lng.toString(),
        shelter.phone,
        shelter.id
      ]);
      
      console.log(`Updated shelter ID ${shelter.id}: ${shelter.name}`);
    }
    
    console.log('✅ All shelters updated successfully!');
    
    // Display updated shelters
    const [shelters] = await connection.execute('SELECT id, name, address, lat, lng, phone FROM shelters ORDER BY id');
    console.log('\n📍 Updated shelter locations:');
    shelters.forEach(shelter => {
      console.log(`${shelter.id}. ${shelter.name} - ${shelter.address} (${shelter.lat}, ${shelter.lng}) - ${shelter.phone}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating shelters:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateShelters();
