import { useState, useEffect } from 'react';

function App() {
  const [trainerName, setTrainerName] = useState('');
  const [trainerPhone, setTrainerPhone] = useState('');
  const [trainer, setTrainer] = useState(null);
  
  const [roster, setRoster] = useState([]);

  // Fetch the roster automatically when the trainer logs in
  useEffect(() => {
    if (!trainer) return;

    fetch(`https://pokedex-api-production-a7ea.up.railway.app/api/trainers/${trainer.id}/pokemon`, {
      headers: { 'Accept': 'application/json' }
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch roster');
      })
      .then(data => {
        setRoster(data);
      })
      .catch(err => console.error("Roster fetch error:", err));
  }, [trainer]);

  async function createTrainer(e) {
    e.preventDefault();
    
    try {
      const res = await fetch('https://pokedex-api-production-a7ea.up.railway.app/api/trainers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name: trainerName, phone_number: trainerPhone })
      });
      
      if (res.ok) {
        const data = await res.json();
        setTrainer(data);
      } else {
        const errorData = await res.json();
        console.error("Backend Error:", errorData);
        alert(`Failed to create: ${errorData.message || 'Check the console.'}`);
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Could not connect to the server.");
    }
  }

  async function catchPokemon() {
    const randomPokemonId = Math.floor(Math.random() * 1025) + 1;

    const prefixes = ['Shadow', 'Brave', 'Cursed', 'Shiny', 'Phantom', 'Iron', 'Crimson', 'Astral'];
    const suffixes = ['Paladin', 'Rogue', 'Warlock', 'Goblin', 'Hero', 'Knight', 'Ronin', 'Mage'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const generatedNickname = `${randomPrefix} ${randomSuffix}`;

    try {
      const res = await fetch(`https://pokedex-api-production-a7ea.up.railway.app/api/trainers/${trainer.id}/pokemon`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          },
          body: JSON.stringify({
              pokemon_id: randomPokemonId,
              nickname: generatedNickname,
              level: Math.floor(Math.random() * 50) + 1 
          })
      });
      
      if (res.ok) {
        const data = await res.json();
        setRoster(prev => [...prev, data]);
      } else {
        console.error("Failed to catch Pokémon. Status:", res.status);
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Pokédex</h1>
        {trainer && <p style={{ margin: 0, fontWeight: 'bold' }}>Trainer: {trainer.name}</p>}
      </header>

      {!trainer ? (
        <form onSubmit={createTrainer} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', gap: '10px' }}>
          <input
            type="text"
            placeholder="Trainer Name"
            value={trainerName}
            onChange={(e) => setTrainerName(e.target.value)}
            required
            style={{ padding: '8px' }}
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={trainerPhone}
            onChange={(e) => setTrainerPhone(e.target.value)}
            required
            style={{ padding: '8px' }}
          />
          <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Create Trainer</button>
        </form>
      ) : (
        <div>
          <button 
            onClick={catchPokemon} 
            style={{ padding: '15px 30px', fontSize: '1.2rem', backgroundColor: '#ef5350', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '30px' }}
          >
            Catch a Random Pokémon! 🐾
          </button>

          {/* THE ROSTER GRID */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '20px' 
          }}>
            {roster.map((entry) => (
              <div key={entry.caught.id} style={{ 
                border: '1px solid #ddd', 
                borderRadius: '12px', 
                padding: '15px', 
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                backgroundColor: '#f8f9fa'
              }}>
                <img 
                  src={entry.species?.sprite} 
                  alt={entry.species?.name} 
                  style={{ width: '120px', height: '120px', imageRendering: 'pixelated' }} 
                />
                <h3 style={{ margin: '10px 0 5px 0' }}>{entry.caught?.nickname}</h3>
                <p style={{ margin: '0 0 10px 0', color: '#666', textTransform: 'capitalize' }}>
                  {entry.species?.name} (Lv. {entry.caught?.level})
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                  {entry.species?.types?.map((type, tIndex) => (
                    <span key={tIndex} style={{ 
                      backgroundColor: '#e0e0e0', 
                      padding: '3px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem',
                      textTransform: 'capitalize'
                    }}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {roster.length === 0 && (
            <p style={{ textAlign: 'center', color: '#888', fontStyle: 'italic', marginTop: '50px' }}>
              Your roster is empty. Go catch some Pokémon!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;