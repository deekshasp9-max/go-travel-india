// ============ TOURISM ITINERARIES ============
export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  places: { name: string; type: string; time: string; description: string }[];
}

export interface Itinerary {
  id: string;
  city: string;
  state: string;
  title: string;
  duration: string;
  image: string;
  rating: number;
  days: ItineraryDay[];
  bestSeason: string;
  budget: string;
}

export const itineraries: Itinerary[] = [
  {
    id: "manali-3d",
    city: "Manali",
    state: "Himachal Pradesh",
    title: "3 Days in Manali - The Himalayan Escape",
    duration: "3 Days / 2 Nights",
    image: "/destinations/manali.png",
    rating: 4.8,
    bestSeason: "October - June",
    budget: "₹8,000 - ₹15,000",
    days: [
      {
        day: 1,
        title: "Arrival & Local Sightseeing",
        description: "Arrive in Manali, check into your hotel, and explore the local attractions.",
        places: [
          { name: "Hadimba Temple", type: "Temple", time: "9:00 AM", description: "Ancient cave temple surrounded by cedar forests, dedicated to Goddess Hadimba." },
          { name: "Museum of Himachal Culture", type: "Museum", time: "11:00 AM", description: "Showcases the rich cultural heritage of Himachal Pradesh." },
          { name: "Mall Road", type: "Market", time: "1:00 PM", description: "Main shopping street with restaurants, cafes, and souvenir shops." },
          { name: "Van Vihar National Park", type: "Nature", time: "3:30 PM", description: "Beautiful park with deodar trees and a serene lake." },
          { name: "Tibetan Monastery", type: "Monastery", time: "5:00 PM", description: "Peaceful monastery with colorful frescoes and a handicraft center." },
        ],
      },
      {
        day: 2,
        title: "Adventure & Rohtang Pass",
        description: "A day full of adventure activities and scenic mountain passes.",
        places: [
          { name: "Solang Valley", type: "Adventure", time: "7:00 AM", description: "Paragliding, zorbing, skiing (in winter), and rope-way rides." },
          { name: "Rohtang Pass", type: "Mountain Pass", time: "10:00 AM", description: "Stunning snow-capped mountains at 13,050 ft. Snow activities available." },
          { name: "Rahala Waterfalls", type: "Waterfall", time: "2:00 PM", description: "Picturesque waterfall at 2,501m altitude on the way to Rohtang." },
          { name: "Old Manali", type: "Village", time: "5:00 PM", description: "Charming village with hippie cafes, backpacker hostels, and artisan shops." },
        ],
      },
      {
        day: 3,
        title: "Naggar Castle & Departure",
        description: "Explore heritage sites and enjoy the last moments in the mountains.",
        places: [
          { name: "Naggar Castle", type: "Heritage", time: "9:00 AM", description: "16th-century castle converted into a heritage hotel with stunning views." },
          { name: "Art Gallery (Nicholas Roerich)", type: "Art Gallery", time: "11:00 AM", description: "Houses paintings by the famous Russian artist Nicholas Roerich." },
          { name: "Jogini Waterfall", type: "Waterfall", time: "1:00 PM", description: "A hidden gem requiring a short trek through apple orchards." },
          { name: "Vashisht Hot Springs", type: "Hot Springs", time: "3:30 PM", description: "Natural sulfur hot springs believed to have medicinal properties." },
        ],
      },
    ],
  },
  {
    id: "jaipur-3d",
    city: "Jaipur",
    state: "Rajasthan",
    title: "3 Days in Jaipur - The Pink City Royal Tour",
    duration: "3 Days / 2 Nights",
    image: "/destinations/jaipur.png",
    rating: 4.7,
    bestSeason: "October - March",
    budget: "₹6,000 - ₹12,000",
    days: [
      {
        day: 1,
        title: "The Royal Heritage Circuit",
        description: "Explore the iconic forts and palaces of Jaipur.",
        places: [
          { name: "Amber Fort", type: "Fort", time: "8:00 AM", description: "Magnificent hilltop fort with Sheesh Mahal (Mirror Palace) and elephant rides." },
          { name: "Panna Meena Ka Kund", type: "Stepwell", time: "11:00 AM", description: "Beautiful geometric stepwell perfect for photography." },
          { name: "Jal Mahal", type: "Palace", time: "12:30 PM", description: "The 'Water Palace' floating in the middle of Man Sagar Lake." },
          { name: "City Palace", type: "Palace", time: "2:30 PM", description: "Royal residence with museums, courtyards, and Chandra Mahal." },
          { name: "Jantar Mantar", type: "Observatory", time: "4:30 PM", description: "UNESCO World Heritage astronomical observation site." },
          { name: "Hawa Mahal", type: "Palace", time: "5:30 PM", description: "Iconic 'Palace of Winds' with 953 small windows." },
        ],
      },
      {
        day: 2,
        title: "Temples & Markets",
        description: "Spiritual sites and vibrant shopping experiences.",
        places: [
          { name: "Govind Dev Ji Temple", type: "Temple", time: "7:00 AM", description: "Famous Vaishnavite temple dedicated to Lord Krishna." },
          { name: "Birla Mandir", type: "Temple", time: "9:00 AM", description: "Stunning white marble temple with intricate carvings." },
          { name: "Johri Bazaar", type: "Market", time: "11:00 AM", description: "Famous for jewelry, textiles, and traditional Rajasthani items." },
          { name: "Nahargarh Fort", type: "Fort", time: "3:00 PM", description: "Hilltop fort offering panoramic views of Jaipur city." },
          { name: "Chokhi Dhani", type: "Cultural", time: "6:00 PM", description: "Ethnic village resort with Rajasthani food, dance, and cultural programs." },
        ],
      },
      {
        day: 3,
        title: "Day Trips & Hidden Gems",
        description: "Explore nearby attractions before departure.",
        places: [
          { name: "Albert Hall Museum", type: "Museum", time: "9:00 AM", description: "Oldest museum in Rajasthan with Indo-Saracenic architecture." },
          { name: "Patrika Gate", type: "Monument", time: "10:30 AM", description: "Colorful, newly built gate with stunning pink city aesthetics." },
          { name: "Sisodia Rani Garden", type: "Garden", time: "12:00 PM", description: "Terraced garden with fountains, murals, and pavilions." },
          { name: "Masala Chowk", type: "Food", time: "1:30 PM", description: "Open-air food court serving authentic Rajasthani street food." },
        ],
      },
    ],
  },
  {
    id: "goa-4d",
    city: "Goa",
    state: "Goa",
    title: "4 Days in Goa - Beaches & Beyond",
    duration: "4 Days / 3 Nights",
    image: "/destinations/goa.png",
    rating: 4.6,
    bestSeason: "November - February",
    budget: "₹10,000 - ₹20,000",
    days: [
      {
        day: 1,
        title: "North Goa Beaches",
        description: "Explore the famous beaches and nightlife of North Goa.",
        places: [
          { name: "Calangute Beach", type: "Beach", time: "8:00 AM", description: "The 'Queen of Beaches' - perfect for water sports and sunbathing." },
          { name: "Baga Beach", type: "Beach", time: "11:00 AM", description: "Vibrant beach with beach shacks, water sports, and nightlife." },
          { name: "Fort Aguada", type: "Fort", time: "2:00 PM", description: "17th-century Portuguese fort with a lighthouse and Arabian Sea views." },
          { name: "Candolim Beach", type: "Beach", time: "4:00 PM", description: "Quieter beach ideal for relaxation and parasailing." },
          { name: "Tito's Lane", type: "Nightlife", time: "8:00 PM", description: "Famous party strip with clubs, bars, and live music." },
        ],
      },
      {
        day: 2,
        title: "Old Goa Heritage",
        description: "Explore the Portuguese heritage and colonial architecture.",
        places: [
          { name: "Basilica of Bom Jesus", type: "Church", time: "9:00 AM", description: "UNESCO World Heritage site housing St. Francis Xavier's remains." },
          { name: "Se Cathedral", type: "Church", time: "10:30 AM", description: "Largest church in Asia with Portuguese-Gothic architecture." },
          { name: "Fontainhas (Latin Quarter)", type: "Heritage", time: "12:00 PM", description: "Colorful Portuguese quarter with art galleries and cafes." },
          { name: "Panjim Market", type: "Market", time: "2:00 PM", description: "Bustling market for spices, cashew nuts, and local handicrafts." },
          { name: "Dona Paula", type: "Viewpoint", time: "4:00 PM", description: "Scenic viewpoint where two rivers meet the Arabian Sea." },
        ],
      },
      {
        day: 3,
        title: "South Goa & Adventure",
        description: "Pristine beaches and adventure activities.",
        places: [
          { name: "Palolem Beach", type: "Beach", time: "7:00 AM", description: "Crescent-shaped beach perfect for kayaking and dolphin spotting." },
          { name: "Butterfly Beach", type: "Beach", time: "10:00 AM", description: "Hidden beach accessible only by boat or trek." },
          { name: "Dudhsagar Falls", type: "Waterfall", time: "12:00 PM", description: "Tiered waterfall on the Mandovi river - a must-visit in monsoon." },
          { name: "Colva Beach", type: "Beach", time: "4:00 PM", description: "One of the longest beaches in Goa with white sand." },
          { name: "Martin's Corner", type: "Restaurant", time: "7:00 PM", description: "Legendary Goan restaurant serving authentic seafood." },
        ],
      },
      {
        day: 4,
        title: "Spice Plantation & Casino",
        description: "Relaxing final day with spice gardens and entertainment.",
        places: [
          { name: "Sahakari Spice Farm", type: "Plantation", time: "9:00 AM", description: "Guided tour through spice plantations with traditional lunch." },
          { name: "Divar Island", type: "Island", time: "12:00 PM", description: "Serene island accessible by ferry, with Portuguese-era houses." },
          { name: "Majorda Beach", type: "Beach", time: "3:00 PM", description: "Quiet beach known for its bakeries and toddy tapping." },
          { name: "Deltin Royale Casino", type: "Entertainment", time: "7:00 PM", description: "India's largest offshore casino with gaming, dining, and entertainment." },
        ],
      },
    ],
  },
  {
    id: "varanasi-2d",
    city: "Varanasi",
    state: "Uttar Pradesh",
    title: "2 Days in Varanasi - The Spiritual Capital",
    duration: "2 Days / 1 Night",
    image: "/destinations/varanasi.png",
    rating: 4.9,
    bestSeason: "October - March",
    budget: "₹4,000 - ₹8,000",
    days: [
      {
        day: 1,
        title: "Ghats & Temples",
        description: "Experience the spiritual essence of the oldest living city.",
        places: [
          { name: "Dashashwamedh Ghat", type: "Ghat", time: "5:30 AM", description: "Main ghat - witness the morning Subah-e-Benaras ceremony." },
          { name: "Kashi Vishwanath Temple", type: "Temple", time: "8:00 AM", description: "One of the 12 Jyotirlingas, dedicated to Lord Shiva." },
          { name: "Assi Ghat", type: "Ghat", time: "10:00 AM", description: "Peaceful ghat popular for morning yoga and evening aarti." },
          { name: "Sarnath", type: "Heritage", time: "2:00 PM", description: "Where Buddha gave his first sermon. Has Dhamek Stupa and museum." },
          { name: "Ganga Aarti (Dashashwamedh)", type: "Ceremony", time: "6:30 PM", description: "Spectacular evening prayer ceremony with fire and chanting." },
        ],
      },
      {
        day: 2,
        title: "Culture & Crafts",
        description: "Explore the cultural and artisanal side of Varanasi.",
        places: [
          { name: "Boat Ride on Ganges", type: "Experience", time: "5:30 AM", description: "Sunrise boat ride past 88 ghats - the quintessential Varanasi experience." },
          { name: "Banarasi Silk Weaving", type: "Handicraft", time: "9:00 AM", description: "Visit silk weaving workshops - Varanasi is famous for Banarasi sarees." },
          { name: "Manikarnika Ghat", type: "Ghat", time: "11:00 AM", description: "The main cremation ghat - a powerful, humbling experience." },
          { name: "Godowlia Market", type: "Market", time: "2:00 PM", description: "Bustling market for sweets, paan, silk, and brassware." },
          { name: "Ramnagar Fort", type: "Fort", time: "4:00 PM", description: "Mughal-style fort across the Ganges with a vintage museum." },
        ],
      },
    ],
  },
  {
    id: "kerala-5d",
    city: "Kerala",
    state: "Kerala",
    title: "5 Days in Kerala - God's Own Country",
    duration: "5 Days / 4 Nights",
    image: "/destinations/kerala.png",
    rating: 4.9,
    bestSeason: "September - March",
    budget: "₹15,000 - ₹30,000",
    days: [
      {
        day: 1,
        title: "Arrival in Kochi",
        description: "Begin your Kerala journey in the historic port city.",
        places: [
          { name: "Fort Kochi", type: "Heritage", time: "9:00 AM", description: "Colonial town with Chinese fishing nets, Portuguese churches, and Dutch palaces." },
          { name: "Jew Town & Synagogue", type: "Heritage", time: "11:00 AM", description: "Historic Jewish quarter with Paradesi Synagogue (1568)." },
          { name: "Kathakali Performance", type: "Culture", time: "5:00 PM", description: "Traditional Kerala dance-drama with elaborate costumes and makeup." },
        ],
      },
      {
        day: 2,
        title: "Munnar - Tea Gardens",
        description: "Drive to Munnar, the tea capital of South India.",
        places: [
          { name: "Tea Museum (Tata Tea)", type: "Museum", time: "10:00 AM", description: "Learn about tea processing with a working factory demonstration." },
          { name: "Eravikulam National Park", type: "Wildlife", time: "1:00 PM", description: "Home to the endangered Nilgiri Tahr. Stunning mountain scenery." },
          { name: "Mattupetty Dam", type: "Viewpoint", time: "3:30 PM", description: "Scenic dam with boating and views of tea-covered hills." },
        ],
      },
      {
        day: 3,
        title: "Thekkady - Periyar Wildlife",
        description: "Experience wildlife and spice plantations.",
        places: [
          { name: "Periyar Tiger Reserve", type: "Wildlife", time: "6:00 AM", description: "Boat safari on Periyar Lake to spot elephants, tigers, and birds." },
          { name: "Spice Plantation Tour", type: "Plantation", time: "11:00 AM", description: "Walk through cardamom, pepper, cinnamon, and clove plantations." },
          { name: "Kalaripayattu Show", type: "Culture", time: "5:00 PM", description: "Traditional martial art performance - one of the oldest in the world." },
        ],
      },
      {
        day: 4,
        title: "Alleppey - Backwater Cruise",
        description: "Cruise through Kerala's famous backwaters on a houseboat.",
        places: [
          { name: "Houseboat Cruise", type: "Experience", time: "11:00 AM", description: "Full-day houseboat cruise through serene backwaters with onboard meals." },
          { name: "Kuttanad Backwaters", type: "Nature", time: "Ongoing", description: "Known as the 'Rice Bowl of Kerala' - stunning green paddy fields." },
          { name: "Vembanad Lake", type: "Lake", time: "Ongoing", description: "Longest lake in India at 96.5 km." },
        ],
      },
      {
        day: 5,
        title: "Kovalam Beach & Departure",
        description: "Relax at the beach before departure.",
        places: [
          { name: "Kovalam Beach", type: "Beach", time: "8:00 AM", description: "Crescent-shaped beach with lighthouse and Ayurvedic massage centers." },
          { name: "Padmanabhaswamy Temple", type: "Temple", time: "11:00 AM", description: "Richest temple in the world with stunning Dravidian architecture." },
          { name: "Napier Museum & Zoo", type: "Museum", time: "2:00 PM", description: "19th-century museum with rare artifacts and a botanical garden zoo." },
        ],
      },
    ],
  },
  {
    id: "rishikesh-2d",
    city: "Rishikesh",
    state: "Uttarakhand",
    title: "2 Days in Rishikesh - Adventure & Spirituality",
    duration: "2 Days / 1 Night",
    image: "/destinations/rishikesh.png",
    rating: 4.7,
    bestSeason: "September - November, Feb - May",
    budget: "₹5,000 - ₹10,000",
    days: [
      {
        day: 1,
        title: "Spiritual Rishikesh",
        description: "Explore temples, ashrams, and the iconic Laxman Jhula.",
        places: [
          { name: "Triveni Ghat", type: "Ghat", time: "6:00 AM", description: "Sacred confluence of Ganga, Yamuna, and Saraswati rivers. Morning aarti." },
          { name: "Laxman Jhula", type: "Bridge", time: "8:30 AM", description: "Iconic suspension bridge across the Ganges. Shops and temples nearby." },
          { name: "Ram Jhula", type: "Bridge", time: "10:00 AM", description: "Another beautiful suspension bridge near Sivananda Ashram." },
          { name: "Beatles Ashram (Chaurasi Kutia)", type: "Heritage", time: "11:30 AM", description: "Abandoned ashram where the Beatles stayed in 1968. Graffiti art." },
          { name: "Parmarth Niketan Ganga Aarti", type: "Ceremony", time: "6:00 PM", description: "The most famous Ganga aarti in Rishikesh with thousands of devotees." },
        ],
      },
      {
        day: 2,
        title: "Adventure Rishikesh",
        description: "Thrilling water sports and adventure activities.",
        places: [
          { name: "White Water Rafting", type: "Adventure", time: "7:00 AM", description: "16 km rafting stretch with Grade III & IV rapids (Shivpuri to Rishikesh)." },
          { name: "Bungee Jumping", type: "Adventure", time: "11:00 AM", description: "83m high bungee jumping at Jumpin Heights - India's highest fixed platform." },
          { name: "Flying Fox", type: "Adventure", time: "1:00 PM", description: "Zip-lining adventure over the Ganges at 120 km/h." },
          { name: "Neer Garh Waterfall Trek", type: "Trekking", time: "3:00 PM", description: "A scenic 1 km trek to a beautiful hidden waterfall." },
        ],
      },
    ],
  },
  // ============ NEW ITINERARIES ============
  {
    id: "agra-2d",
    city: "Agra",
    state: "Uttar Pradesh",
    title: "2 Days in Agra - The City of Taj",
    duration: "2 Days / 1 Night",
    image: "/destinations/agra.png",
    rating: 4.8,
    bestSeason: "October - March",
    budget: "₹3,500 - ₹7,000",
    days: [
      {
        day: 1,
        title: "The Iconic Taj & Mughal Heritage",
        description: "Witness the world's most beautiful monument and explore Agra's Mughal legacy.",
        places: [
          { name: "Taj Mahal", type: "Monument", time: "6:00 AM", description: "UNESCO World Heritage Site and one of the Seven Wonders of the World. Best viewed at sunrise." },
          { name: "Agra Fort", type: "Fort", time: "10:00 AM", description: "Massive red sandstone fort and UNESCO site. Features Diwan-i-Am, Diwan-i-Khas, and Musamman Burj." },
          { name: "Mehtab Bagh", type: "Garden", time: "3:30 PM", description: "Persian-style garden across the Yamuna River offering breathtaking sunset views of the Taj Mahal." },
          { name: "Kinari Bazaar", type: "Market", time: "5:30 PM", description: "Vibrant old market famous for marble crafts, leather goods, sweets, and Zardozi embroidery." },
        ],
      },
      {
        day: 2,
        title: "Fatehpur Sikri & Hidden Gems",
        description: "Explore the ghost city of Fatehpur Sikri and lesser-known Mughal treasures.",
        places: [
          { name: "Fatehpur Sikri", type: "Heritage", time: "7:00 AM", description: "Abandoned Mughal city with stunning Buland Darwaza, Jama Masjid, and Panch Mahal." },
          { name: "Tomb of Itimad-ud-Daulah", type: "Monument", time: "1:00 PM", description: "Often called the 'Baby Taj' — a delicate marble tomb that inspired the Taj Mahal's design." },
          { name: "Sikandra (Akbar's Tomb)", type: "Monument", time: "3:30 PM", description: "Grand red sandstone and marble tomb of Emperor Akbar, blending Hindu and Islamic architecture." },
        ],
      },
    ],
  },
  {
    id: "udaipur-3d",
    city: "Udaipur",
    state: "Rajasthan",
    title: "3 Days in Udaipur - The City of Lakes",
    duration: "3 Days / 2 Nights",
    image: "/destinations/udaipur.png",
    rating: 4.8,
    bestSeason: "September - March",
    budget: "₹8,000 - ₹15,000",
    days: [
      {
        day: 1,
        title: "Royal Palaces & Lake Pichola",
        description: "Explore the grand palaces and serene lakes that define Udaipur's charm.",
        places: [
          { name: "City Palace", type: "Palace", time: "9:00 AM", description: "Largest palace complex in Rajasthan with museums, terraces, and stunning views of Lake Pichola." },
          { name: "Lake Pichola", type: "Lake", time: "11:30 AM", description: "Take a boat ride on the iconic lake surrounded by palaces, ghats, and temples." },
          { name: "Jag Mandir", type: "Palace", time: "1:00 PM", description: "Lake palace with beautiful marble pavilions and gardens. A peaceful island retreat." },
          { name: "Bagore ki Haveli", type: "Heritage", time: "5:00 PM", description: "18th-century haveli with over 100 rooms, now a museum hosting evening puppet shows." },
        ],
      },
      {
        day: 2,
        title: "Gardens, Lakes & Sunset Point",
        description: "Discover Udaipur's beautiful gardens and the spectacular Monsoon Palace.",
        places: [
          { name: "Saheliyon-ki-Bari", type: "Garden", time: "8:30 AM", description: "Enchanting 'Garden of the Maidens' with fountains, lotus pools, and marble elephants." },
          { name: "Fateh Sagar Lake", type: "Lake", time: "10:30 AM", description: "Scenic artificial lake with Nehru Island Park. Perfect for a relaxed boat ride." },
          { name: "Monsoon Palace", type: "Palace", time: "4:00 PM", description: "Hilltop palace offering panoramic sunset views over Udaipur and its surrounding lakes." },
          { name: "Shilpgram", type: "Cultural", time: "6:00 PM", description: "Rural arts and crafts complex showcasing tribal culture, pottery, and traditional performances." },
        ],
      },
      {
        day: 3,
        title: "Day Trip to Kumbhalgarh & Ranakpur",
        description: "Visit the mighty Kumbhalgarh Fort and the exquisite Jain temples of Ranakpur.",
        places: [
          { name: "Kumbhalgarh Fort", type: "Fort", time: "8:00 AM", description: "UNESCO World Heritage Fort with the second-longest wall in the world after the Great Wall of China." },
          { name: "Eklingji Temple", type: "Temple", time: "12:00 PM", description: "Ancient Hindu temple complex dedicated to Lord Shiva, featuring 108 small shrines." },
          { name: "Ranakpur Jain Temple", type: "Temple", time: "2:30 PM", description: "Breathtaking marble temple with 1,444 uniquely carved pillars — no two are alike." },
        ],
      },
    ],
  },
  {
    id: "ladakh-5d",
    city: "Ladakh",
    state: "Ladakh",
    title: "5 Days in Ladakh - The Land of High Passes",
    duration: "5 Days / 4 Nights",
    image: "/destinations/ladakh.png",
    rating: 4.9,
    bestSeason: "June - September",
    budget: "₹20,000 - ₹40,000",
    days: [
      {
        day: 1,
        title: "Arrival in Leh & Local Exploration",
        description: "Acclimatize to the altitude and explore Leh's cultural landmarks.",
        places: [
          { name: "Leh Palace", type: "Palace", time: "9:00 AM", description: "17th-century royal palace perched on a hilltop with panoramic views of Leh town and Stok Kangri." },
          { name: "Shanti Stupa", type: "Monastery", time: "11:00 AM", description: "Peaceful white-domed Buddhist stupa built by Japanese monks, offering stunning sunrise and sunset views." },
          { name: "Hall of Fame", type: "Museum", time: "1:00 PM", description: "Military museum honoring the heroes of the Kargil War with weapons, photographs, and war artifacts." },
          { name: "Leh Market", type: "Market", time: "3:30 PM", description: "Bustling main market with Tibetan handicrafts, pashmina shawls, apricot products, and cozy cafes." },
        ],
      },
      {
        day: 2,
        title: "Magnetic Hill & Indus Valley",
        description: "Experience optical illusions and ancient monasteries along the Indus River.",
        places: [
          { name: "Magnetic Hill", type: "Nature", time: "7:30 AM", description: "Optical illusion where vehicles appear to roll uphill. A popular stop on the Leh-Kargil highway." },
          { name: "Gurudwara Pathar Sahib", type: "Temple", time: "9:00 AM", description: "Sacred Sikh shrine built in memory of Guru Nanak, set against a stunning mountain backdrop." },
          { name: "Confluence of Indus & Zanskar", type: "Nature", time: "11:00 AM", description: "Dramatic meeting point of the blue Indus and muddy Zanskar rivers — a photographer's paradise." },
          { name: "Alchi Monastery", type: "Monastery", time: "1:30 PM", description: "11th-century monastery famous for its ancient wall paintings and Kashmiri-style Buddhist art." },
        ],
      },
      {
        day: 3,
        title: "Khardung La & Nubra Valley",
        description: "Cross the world's highest motorable pass and explore the surreal Nubra Valley.",
        places: [
          { name: "Khardung La Pass", type: "Mountain Pass", time: "6:00 AM", description: "One of the highest motorable passes in the world at 17,982 ft. Breathtaking views and snow." },
          { name: "Nubra Valley", type: "Nature", time: "11:00 AM", description: "High-altitude cold desert valley with dramatic landscapes, Bactrian camels, and ancient villages." },
          { name: "Diskit Monastery", type: "Monastery", time: "1:00 PM", description: "14th-century monastery with a towering 32m Maitreya Buddha statue and panoramic valley views." },
          { name: "Hunder Sand Dunes", type: "Nature", time: "3:30 PM", description: "White sand dunes where you can ride double-humped Bactrian camels — surreal landscape at 10,000 ft." },
        ],
      },
      {
        day: 4,
        title: "Pangong Lake & Chang La",
        description: "Visit the iconic blue lake that stretches across the India-China border.",
        places: [
          { name: "Chang La Pass", type: "Mountain Pass", time: "7:00 AM", description: "Third-highest motorable pass at 17,590 ft. Snow-covered peaks and a small temple at the top." },
          { name: "Pangong Lake", type: "Lake", time: "11:00 AM", description: "Iconic endorheic lake at 14,270 ft that changes colors from azure blue to green to red. Stretches 134 km into Tibet." },
          { name: "Spangmik", type: "Village", time: "2:00 PM", description: "Last civilian village on the lake shore. Offers the closest views and lakeside camping spots." },
        ],
      },
      {
        day: 5,
        title: "Monasteries & Departure",
        description: "Visit the most important monasteries before departing from Leh.",
        places: [
          { name: "Thiksey Monastery", type: "Monastery", time: "8:00 AM", description: "Impressive 12-story monastery often called 'Mini Potala Palace' with a 15m Maitreya Buddha statue." },
          { name: "Hemis Monastery", type: "Monastery", time: "10:30 AM", description: "Largest and wealthiest monastery in Ladakh, famous for the annual Hemis Festival and ancient thangkas." },
          { name: "Stok Palace Museum", type: "Museum", time: "1:30 PM", description: "Royal residence of the Namgyal dynasty with a museum displaying royal artifacts, crowns, and costumes." },
        ],
      },
    ],
  },
  {
    id: "darjeeling-3d",
    city: "Darjeeling",
    state: "West Bengal",
    title: "3 Days in Darjeeling - Queen of the Hills",
    duration: "3 Days / 2 Nights",
    budget: "₹6,000 - ₹12,000",
    rating: 4.7,
    bestSeason: "March - May, Oct - Dec",
    image: "/destinations/darjeeling.png",
    days: [
      {
        day: 1,
        title: "Sunrise & Toy Train",
        description: "Witness a magical sunrise over the Himalayas and ride the famous toy train.",
        places: [
          { name: "Tiger Hill Sunrise", type: "Viewpoint", time: "4:00 AM", description: "Iconic viewpoint at 8,482 ft offering breathtaking sunrise views over Kanchenjunga and Mount Everest." },
          { name: "Batasia Loop", type: "Heritage", time: "6:30 AM", description: "Spiral railway loop where the toy train makes a figure-eight turn, with a war memorial and garden." },
          { name: "Peace Pagoda", type: "Temple", time: "9:00 AM", description: "Japanese-built Buddhist stupa with four avatars of Buddha. Offers serene views and golden spires." },
          { name: "Japanese Garden", type: "Garden", time: "10:30 AM", description: "Beautifully landscaped garden maintained by Japanese monks with peaceful walking paths." },
          { name: "Toy Train Ride", type: "Experience", time: "2:00 PM", description: "UNESCO World Heritage narrow-gauge railway ride from Darjeeling to Ghoom through tea gardens." },
        ],
      },
      {
        day: 2,
        title: "Wildlife, Chowrasta & Tea Gardens",
        description: "Explore wildlife conservation, the town center, and famous tea estates.",
        places: [
          { name: "Padmaja Naidu Zoo", type: "Wildlife", time: "8:30 AM", description: "High-altitude zoo specializing in Himalayan fauna — snow leopards, red pandas, and Tibetan wolves." },
          { name: "Himalayan Mountaineering Institute", type: "Museum", time: "10:30 AM", description: "Premier mountaineering institute founded by Tenzing Norgay. Museum with climbing gear and artifacts." },
          { name: "Chowrasta", type: "Market", time: "12:30 PM", description: "Heart of Darjeeling — a flat promenade lined with cafes, shops, and horse-riding activities." },
          { name: "Mall Road", type: "Market", time: "2:00 PM", description: "Vibrant pedestrian street for shopping Tibetan artifacts, woolens, tea, and local handicrafts." },
          { name: "Tea Garden Visit", type: "Plantation", time: "4:00 PM", description: "Walk through lush green tea estates. Learn about the tea-making process and sample fresh Darjeeling tea." },
        ],
      },
      {
        day: 3,
        title: "Mirik Lake & Ropeway",
        description: "A peaceful day trip to the serene lake and surrounding hills.",
        places: [
          { name: "Mirik Lake", type: "Lake", time: "8:00 AM", description: "Horseshoe-shaped lake at 5,800 ft with boating facilities. Surrounded by orange orchards and cardamom plantations." },
          { name: "Singalila National Park", type: "Wildlife", time: "11:00 AM", description: "High-altitude national park on the Singalila Ridge — a trekker's paradise with rare red pandas and rhododendrons." },
          { name: "Ropeway", type: "Adventure", time: "3:00 PM", description: "Cable car ride from Darjeeling to Singamari offering stunning views of tea gardens and the valley below." },
        ],
      },
    ],
  },
  {
    id: "amritsar-2d",
    city: "Amritsar",
    state: "Punjab",
    title: "2 Days in Amritsar - The Holy City",
    duration: "2 Days / 1 Night",
    image: "/destinations/amritsar.png",
    rating: 4.8,
    bestSeason: "October - March",
    budget: "₹3,000 - ₹6,000",
    days: [
      {
        day: 1,
        title: "The Golden Temple & Wagah Border",
        description: "Experience the spiritual heart of Sikhism and the patriotic Wagah Border ceremony.",
        places: [
          { name: "Golden Temple", type: "Temple", time: "5:00 AM", description: "The holiest shrine of Sikhism, covered in gold leaf. The Guru Ka Langar serves free meals to 100,000 people daily." },
          { name: "Jallianwala Bagh", type: "Monument", time: "9:00 AM", description: "Memorial garden marking the 1919 massacre. Bullet holes in the walls and the Martyrs' Well are preserved." },
          { name: "Partition Museum", type: "Museum", time: "11:00 AM", description: "The world's first museum dedicated to the 1947 India-Pakistan Partition with personal stories and artifacts." },
          { name: "Wagah Border Ceremony", type: "Ceremony", time: "3:30 PM", description: "Electrifying daily border closing ceremony with synchronized marching by Indian and Pakistani border guards." },
        ],
      },
      {
        day: 2,
        title: "Temples, Forts & Street Food",
        description: "Explore more of Amritsar's heritage and indulge in legendary Punjabi cuisine.",
        places: [
          { name: "Durgiana Temple", type: "Temple", time: "8:00 AM", description: "Hindu temple with a striking resemblance to the Golden Temple, dedicated to Goddess Durga." },
          { name: "Gobindgarh Fort", type: "Fort", time: "10:00 AM", description: "Historic fort recently restored as a cultural museum with live performances, a coin museum, and a light show." },
          { name: "Hall Bazaar", type: "Market", time: "12:30 PM", description: "Lively market for traditional juttis, phulkari dupattas, dry fruits, and electronics." },
          { name: "Amritsari Kulcha at Kulcha Land", type: "Food", time: "1:30 PM", description: "Taste the iconic Amritsari stuffed kulcha — crispy, buttery, and served with chole and lassi. A must-try!" },
        ],
      },
    ],
  },
  {
    id: "munnar-3d",
    city: "Munnar",
    state: "Kerala",
    title: "3 Days in Munnar - Tea Garden Paradise",
    duration: "3 Days / 2 Nights",
    image: "/destinations/munnar.png",
    rating: 4.7,
    bestSeason: "September - May",
    budget: "₹5,000 - ₹10,000",
    days: [
      {
        day: 1,
        title: "Wildlife & Tea Trails",
        description: "Explore Munnar's most famous national park and learn about its tea heritage.",
        places: [
          { name: "Eravikulam National Park", type: "Wildlife", time: "7:00 AM", description: "Home to the endangered Nilgiri Tahr. Rolling grasslands and the highest peak in South India, Anamudi." },
          { name: "Tea Museum (Tata Tea)", type: "Museum", time: "11:00 AM", description: "Interactive museum showcasing the history of tea plantations with live demonstrations of tea processing." },
          { name: "Mattupetty Dam", type: "Nature", time: "1:30 PM", description: "Scenic concrete dam surrounded by tea gardens. Enjoy boating and views of the Kundala mountain range." },
          { name: "Echo Point", type: "Viewpoint", time: "3:30 PM", description: "Scenic spot on the banks of Kundala Lake where your voice echoes off the surrounding hills." },
        ],
      },
      {
        day: 2,
        title: "Top Station & Tea Estates",
        description: "Visit the highest viewpoint and walk through vast tea plantations.",
        places: [
          { name: "Top Station", type: "Viewpoint", time: "6:30 AM", description: "Highest point in Munnar at 1,700m. Offers panoramic views of the Western Ghats and the Neelakurinji bloom." },
          { name: "Kannan Devan Tea Plantation", type: "Plantation", time: "9:30 AM", description: "Vast tea estate stretching across rolling hills. Take a guided walk and learn about tea plucking and processing." },
          { name: "Lakkom Waterfalls", type: "Waterfall", time: "1:00 PM", description: "Tributary of the Pambar River, this picturesque waterfall is perfect for a refreshing dip." },
          { name: "Kundala Lake", type: "Lake", time: "3:30 PM", description: "Serene artificial lake surrounded by hills. Pedal boating is available and cherry blossoms bloom here in season." },
        ],
      },
      {
        day: 3,
        title: "Waterfalls, Spice Gardens & Departure",
        description: "Chase waterfalls and explore aromatic spice gardens before heading home.",
        places: [
          { name: "Attukal Waterfalls", type: "Waterfall", time: "8:00 AM", description: "Stunning cascade between hills and jungles. A 2 km trek from the main road leads to this hidden gem." },
          { name: "Chinnakanal", type: "Village", time: "10:30 AM", description: "Picturesque village with panoramic views of tea estates, waterfalls, and the Anayirangal Dam." },
          { name: "Spice Garden Tour", type: "Plantation", time: "1:00 PM", description: "Guided walk through cardamom, pepper, cinnamon, and nutmeg plantations. Learn about organic spice farming." },
        ],
      },
    ],
  },
];

// ============ FLIGHTS DATA ============
export interface Flight {
  id: string;
  airline: string;
  airlineLogo: string;
  flightNo: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  stops: number;
  class: string;
}

export const flights: Flight[] = [
  { id: "fl1", airline: "Air India", airlineLogo: "✈️", flightNo: "AI-501", from: "Delhi (DEL)", to: "Mumbai (BOM)", departure: "06:00", arrival: "08:15", duration: "2h 15m", price: 4250, stops: 0, class: "Economy" },
  { id: "fl2", airline: "IndiGo", airlineLogo: "✈️", flightNo: "6E-234", from: "Delhi (DEL)", to: "Mumbai (BOM)", departure: "08:30", arrival: "10:50", duration: "2h 20m", price: 3199, stops: 0, class: "Economy" },
  { id: "fl3", airline: "SpiceJet", airlineLogo: "✈️", flightNo: "SG-812", from: "Delhi (DEL)", to: "Mumbai (BOM)", departure: "10:00", arrival: "12:20", duration: "2h 20m", price: 2899, stops: 0, class: "Economy" },
  { id: "fl4", airline: "Vistara", airlineLogo: "✈️", flightNo: "UK-950", from: "Delhi (DEL)", to: "Mumbai (BOM)", departure: "14:00", arrival: "16:10", duration: "2h 10m", price: 5450, stops: 0, class: "Premium Economy" },
  { id: "fl5", airline: "Air India", airlineLogo: "✈️", flightNo: "AI-602", from: "Delhi (DEL)", to: "Bengaluru (BLR)", departure: "05:45", arrival: "08:30", duration: "2h 45m", price: 5100, stops: 0, class: "Economy" },
  { id: "fl6", airline: "IndiGo", airlineLogo: "✈️", flightNo: "6E-445", from: "Delhi (DEL)", to: "Bengaluru (BLR)", departure: "09:15", arrival: "12:00", duration: "2h 45m", price: 3699, stops: 0, class: "Economy" },
  { id: "fl7", airline: "IndiGo", airlineLogo: "✈️", flightNo: "6E-112", from: "Delhi (DEL)", to: "Bengaluru (BLR)", departure: "15:00", arrival: "18:30", duration: "3h 30m", price: 2999, stops: 1, class: "Economy" },
  { id: "fl8", airline: "Vistara", airlineLogo: "✈️", flightNo: "UK-801", from: "Mumbai (BOM)", to: "Goa (GOI)", departure: "07:00", arrival: "08:10", duration: "1h 10m", price: 2199, stops: 0, class: "Economy" },
  { id: "fl9", airline: "SpiceJet", airlineLogo: "✈️", flightNo: "SG-321", from: "Mumbai (BOM)", to: "Goa (GOI)", departure: "12:00", arrival: "13:15", duration: "1h 15m", price: 1899, stops: 0, class: "Economy" },
  { id: "fl10", airline: "Air India", airlineLogo: "✈️", flightNo: "AI-889", from: "Delhi (DEL)", to: "Kochi (COK)", departure: "06:30", arrival: "09:45", duration: "3h 15m", price: 6200, stops: 0, class: "Economy" },
  { id: "fl11", airline: "IndiGo", airlineLogo: "✈️", flightNo: "6E-667", from: "Delhi (DEL)", to: "Goa (GOI)", departure: "11:00", arrival: "13:30", duration: "2h 30m", price: 3999, stops: 0, class: "Economy" },
  { id: "fl12", airline: "Vistara", airlineLogo: "✈️", flightNo: "UK-455", from: "Bengaluru (BLR)", to: "Goa (GOI)", departure: "16:00", arrival: "17:15", duration: "1h 15m", price: 2499, stops: 0, class: "Economy" },
];

// ============ TRAINS DATA ============
export interface Train {
  id: string;
  trainNo: string;
  trainName: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  priceSL: number;
  price3A: number;
  price2A: number;
  days: string[];
  type: string;
}

export const trains: Train[] = [
  { id: "tr1", trainNo: "12952", trainName: "Rajdhani Express", from: "New Delhi (NDLS)", to: "Mumbai Central (BCT)", departure: "16:55", arrival: "08:35", duration: "15h 40m", price: 735, priceSL: 735, price3A: 1910, price2A: 2720, days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], type: "Rajdhani" },
  { id: "tr2", trainNo: "12138", trainName: "Punjab Mail", from: "New Delhi (NDLS)", to: "Mumbai CST (CSMT)", departure: "21:25", arrival: "17:00", duration: "19h 35m", price: 560, priceSL: 560, price3A: 1480, price2A: 2110, days: ["Mon","Wed","Sat"], type: "Superfast" },
  { id: "tr3", trainNo: "12622", trainName: "Tamil Nadu Express", from: "New Delhi (NDLS)", to: "Chennai Central (MAS)", departure: "22:30", arrival: "07:10", duration: "32h 40m", price: 780, priceSL: 780, price3A: 2010, price2A: 2940, days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], type: "Superfast" },
  { id: "tr4", trainNo: "12628", trainName: "Karnataka Express", from: "New Delhi (NDLS)", to: "Bengaluru (SBC)", departure: "20:15", arrival: "05:40", duration: "33h 25m", price: 810, priceSL: 810, price3A: 2140, price2A: 3080, days: ["Mon","Wed","Sat"], type: "Superfast" },
  { id: "tr5", trainNo: "22691", trainName: "Rajdhani Express", from: "Bangalore (SBC)", to: "Delhi (NDLS)", departure: "20:50", arrival: "05:40", duration: "32h 50m", price: 2600, priceSL: 0, price3A: 2600, price2A: 3720, days: ["Mon","Wed","Fri"], type: "Rajdhani" },
  { id: "tr6", trainNo: "16309", trainName: "Mangala Lakshadweep", from: "Delhi (NDLS)", to: "Kochi (ERS)", departure: "05:40", arrival: "09:55", duration: "52h 15m", price: 610, priceSL: 610, price3A: 1610, price2A: 2350, days: ["Mon","Wed","Sat"], type: "Express" },
  { id: "tr7", trainNo: "12954", trainName: "August Kranti Express", from: "Mumbai Central (BCT)", to: "New Delhi (NDLS)", departure: "17:40", arrival: "10:15", duration: "16h 35m", price: 735, priceSL: 735, price3A: 1910, price2A: 2720, days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], type: "Superfast" },
  { id: "tr8", trainNo: "12002", trainName: "Shatabdi Express", from: "New Delhi (NDLS)", to: "Jaipur (JP)", departure: "06:10", arrival: "10:35", duration: "4h 25m", price: 1120, priceSL: 0, price3A: 0, price2A: 1120, days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], type: "Shatabdi" },
  { id: "tr9", trainNo: "12035", trainName: "Shatabdi Express", from: "New Delhi (NDLS)", to: "Kalka (KLK)", departure: "07:40", arrival: "11:45", duration: "4h 05m", price: 985, priceSL: 0, price3A: 0, price2A: 985, days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], type: "Shatabdi" },
];

// ============ BUSES DATA ============
export interface Bus {
  id: string;
  operator: string;
  type: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  rating: number;
  seatsAvailable: number;
  amenities: string[];
}

export const buses: Bus[] = [
  { id: "b1", operator: "VRL Travels", type: "Volvo Multi-Axle A/C Sleeper", from: "Delhi", to: "Manali", departure: "18:00", arrival: "08:00", duration: "14h", price: 1499, rating: 4.2, seatsAvailable: 12, amenities: ["WiFi", "Charging", "Blanket", "Water"] },
  { id: "b2", operator: "RedBus", type: "Volvo A/C Semi-Sleeper", from: "Delhi", to: "Manali", departure: "20:00", arrival: "10:00", duration: "14h", price: 1299, rating: 3.9, seatsAvailable: 8, amenities: ["WiFi", "Charging"] },
  { id: "b3", operator: "Zingbus", type: "A/C Sleeper", from: "Delhi", to: "Manali", departure: "21:30", arrival: "11:30", duration: "14h", price: 1199, rating: 4.0, seatsAvailable: 15, amenities: ["WiFi", "Charging", "Water"] },
  { id: "b4", operator: "IntrCity SmartBus", type: "Volvo A/C Sleeper", from: "Mumbai", to: "Goa", departure: "20:00", arrival: "06:30", duration: "10h 30m", price: 999, rating: 4.3, seatsAvailable: 20, amenities: ["WiFi", "Charging", "Blanket", "Water", "CCTV"] },
  { id: "b5", operator: "Neeta Travels", type: "Volvo Multi-Axle A/C", from: "Mumbai", to: "Goa", departure: "22:00", arrival: "08:00", duration: "10h", price: 899, rating: 3.8, seatsAvailable: 5, amenities: ["WiFi", "Charging"] },
  { id: "b6", operator: "Paulo Travels", type: "Mercedes A/C Sleeper", from: "Goa", to: "Pune", departure: "17:00", arrival: "01:00", duration: "8h", price: 750, rating: 4.1, seatsAvailable: 18, amenities: ["WiFi", "Charging", "Water"] },
  { id: "b7", operator: "KPN Travels", type: "Volvo A/C Sleeper", from: "Bangalore", to: "Munnar", departure: "21:00", arrival: "06:00", duration: "9h", price: 850, rating: 4.0, seatsAvailable: 10, amenities: ["WiFi", "Charging", "Water"] },
  { id: "b8", operator: "Orange Travels", type: "A/C Semi-Sleeper", from: "Delhi", to: "Jaipur", departure: "22:00", arrival: "05:30", duration: "7h 30m", price: 599, rating: 3.7, seatsAvailable: 25, amenities: ["WiFi", "Charging"] },
  { id: "b9", operator: "RSRTC", type: "Volvo A/C", from: "Jaipur", to: "Delhi", departure: "06:00", arrival: "13:30", duration: "7h 30m", price: 550, rating: 3.5, seatsAvailable: 30, amenities: ["Charging"] },
  { id: "b10", operator: "VRL Travels", type: "Volvo A/C Sleeper", from: "Bangalore", to: "Goa", departure: "20:00", arrival: "06:00", duration: "10h", price: 1100, rating: 4.2, seatsAvailable: 14, amenities: ["WiFi", "Charging", "Blanket", "Water"] },
];

// ============ RENTAL VEHICLES ============
export interface RentalVehicle {
  id: string;
  name: string;
  type: string; // car, bike, scooter
  image: string;
  location: string;
  pricePerDay: number;
  pricePerHour: number;
  rating: number;
  fuelType: string;
  transmission: string;
  seats: number;
  available: boolean;
}

export const rentalVehicles: RentalVehicle[] = [
  { id: "rv1", name: "Royal Enfield Classic 350", type: "bike", image: "🏍️", location: "Goa", pricePerDay: 800, pricePerHour: 100, rating: 4.7, fuelType: "Petrol", transmission: "Manual", seats: 2, available: true },
  { id: "rv2", name: "Honda Activa 6G", type: "scooter", image: "🛵", location: "Goa", pricePerDay: 400, pricePerHour: 60, rating: 4.5, fuelType: "Petrol", transmission: "Automatic", seats: 2, available: true },
  { id: "rv3", name: "Bajaj Pulsar 150", type: "bike", image: "🏍️", location: "Goa", pricePerDay: 600, pricePerHour: 80, rating: 4.3, fuelType: "Petrol", transmission: "Manual", seats: 2, available: true },
  { id: "rv4", name: "Maruti Swift", type: "car", image: "🚗", location: "Manali", pricePerDay: 2200, pricePerHour: 250, rating: 4.6, fuelType: "Petrol", transmission: "Manual", seats: 5, available: true },
  { id: "rv5", name: "Mahindra Thar", type: "car", image: "🚙", location: "Manali", pricePerDay: 4500, pricePerHour: 500, rating: 4.8, fuelType: "Diesel", transmission: "Manual", seats: 4, available: true },
  { id: "rv6", name: "Royal Enfield Himalayan", type: "bike", image: "🏍️", location: "Ladakh", pricePerDay: 1500, pricePerHour: 180, rating: 4.9, fuelType: "Petrol", transmission: "Manual", seats: 2, available: false },
  { id: "rv7", name: "Toyota Innova", type: "car", image: "🚐", location: "Jaipur", pricePerDay: 3500, pricePerHour: 400, rating: 4.5, fuelType: "Diesel", transmission: "Automatic", seats: 7, available: true },
  { id: "rv8", name: "Honda Dio", type: "scooter", image: "🛵", location: "Jaipur", pricePerDay: 350, pricePerHour: 50, rating: 4.2, fuelType: "Petrol", transmission: "Automatic", seats: 2, available: true },
  { id: "rv9", name: "KTM Duke 200", type: "bike", image: "🏍️", location: "Rishikesh", pricePerDay: 900, pricePerHour: 120, rating: 4.6, fuelType: "Petrol", transmission: "Manual", seats: 2, available: true },
  { id: "rv10", name: "Hyundai Creta", type: "car", image: "🚗", location: "Kerala", pricePerDay: 2800, pricePerHour: 300, rating: 4.4, fuelType: "Diesel", transmission: "Automatic", seats: 5, available: true },
  { id: "rv11", name: "Royal Enfield Meteor 350", type: "bike", image: "🏍️", location: "Kerala", pricePerDay: 850, pricePerHour: 110, rating: 4.5, fuelType: "Petrol", transmission: "Manual", seats: 2, available: true },
  { id: "rv12", name: "TVS Jupiter", type: "scooter", image: "🛵", location: "Varanasi", pricePerDay: 300, pricePerHour: 45, rating: 4.0, fuelType: "Petrol", transmission: "Automatic", seats: 2, available: true },
];

// ============ RIDE FARE RATES ============
export const rideRates = {
  bike: { baseFare: 30, perKm: 10, name: "Bike", icon: "🏍️", eta: "3-5 min" },
  auto: { baseFare: 50, perKm: 18, name: "Auto", icon: "🛺", eta: "5-8 min" },
  car: { baseFare: 100, perKm: 22, name: "Car", icon: "🚗", eta: "5-10 min" },
  carPremium: { baseFare: 150, perKm: 28, name: "Car Premium", icon: "✨", eta: "3-7 min" },
};

// ============ INDIAN CITIES FOR SEARCH ============
export const indianCities = [
  "Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Hyderabad",
  "Pune", "Jaipur", "Lucknow", "Ahmedabad", "Chandigarh", "Kochi",
  "Goa", "Manali", "Shimla", "Rishikesh", "Varanasi", "Agra",
  "Udaipur", "Munnar", "Ooty", "Darjeeling", "Amritsar", "Leh",
  "Dharamshala", "Haridwar", "Pushkar", "Jodhpur", "Mysore", "Coorg"
];
