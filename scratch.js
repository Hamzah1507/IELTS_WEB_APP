const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/admin/Desktop/IELTS-WEB_APP/IELTS Mock Test 001 - 90 Minutes';

// --- READING ---
const readingFile = path.join(dir, 'reading.json');
let readingData = JSON.parse(fs.readFileSync(readingFile, 'utf8'));

const passage1 = `The Accidental Discovery of Penicillin

In 1928, the world of medicine was changed forever by a Scottish researcher named Alexander Fleming. His discovery of the world's first widely effective antibiotic, penicillin, was not the result of a meticulously planned experiment, but rather a stroke of incredible luck. Upon returning from a vacation, Fleming noticed that a petri dish containing staphylococcus bacteria had been left uncovered. A rare strain of mold had grown on the dish, and surrounding the mold was a clear ring where the bacteria had been completely destroyed. This chance observation led to the identification of the mold's antibacterial properties.

Despite his groundbreaking discovery, Fleming struggled to isolate the active substance and produce it in large quantities. The main challenge in the early days of penicillin was stabilizing the drug so it could be mass-produced for medical use. It wasn't until a decade later that two scientists at Oxford University, Howard Florey and Ernst Chain, managed to purify penicillin. Their work successfully stabilized the drug for mass production, fundamentally transforming modern medicine.

The timing of this breakthrough was historically significant. The mass production of penicillin was crucial during the Second World War, saving countless soldiers from dying of infected wounds. Because of its incredible ability to combat bacterial infections, penicillin belongs to a group of drugs known as antibiotics. In recognition of their monumental contributions, Fleming, Florey, and Chain jointly received the Nobel Prize in Medicine in 1945, many years after the initial discovery.`;

const passage2 = `Mysteries of the Deep: Hydrothermal Vents

A. For decades, scientists believed that all life on Earth ultimately depended on the sun. However, this paradigm shifted dramatically in 1977 when researchers exploring the ocean floor discovered hydrothermal vents. These deep-sea geysers are primarily found near tectonic plate boundaries, such as mid-ocean ridges, where tectonic plates diverge. Here, seawater seeps into the Earth's crust, becomes superheated by magma, and is expelled back into the ocean laden with dissolved minerals. The extreme pressure at the ocean floor requires specialized submersibles to safely transport human researchers to these depths.

B. The environments surrounding these vents are completely devoid of sunlight, yet they are teeming with life. The organisms living near vents rely on a process called chemosynthesis. Unlike surface life, these organisms do not require sunlight. Instead, bacteria convert toxic chemicals into energy, serving as the base of the food web. For example, the towering vent structures known as 'black smokers' constantly spew dark, mineral-rich fluid. The primary chemical expelled by the black smokers is hydrogen sulfide, which the specialized bacteria metabolize to survive and feed larger creatures like giant tube worms and blind shrimp.

C. The discovery of these ecosystems has profound implications for evolutionary biology. Because these organisms thrive in such extreme conditions, some researchers believe that life on Earth may have originated near hydrothermal vents. Furthermore, this opens up the possibility that similar chemosynthetic life could exist in the subsurface oceans of icy moons like Jupiter's Europa or Saturn's Enceladus, fundamentally expanding our search for extraterrestrial life.`;

readingData = readingData.map(q => {
  if (q.passage_id === 'P1') q.passage_text = passage1;
  if (q.passage_id === 'P2') q.passage_text = passage2;
  return q;
});

fs.writeFileSync(readingFile, JSON.stringify(readingData, null, 2), 'utf8');


// --- LISTENING ---
const listeningFile = path.join(dir, 'listening.json');
let listeningData = JSON.parse(fs.readFileSync(listeningFile, 'utf8'));

const transcript = `[PART 1]
Sarah: Good morning, Paradise Travels. My name is Sarah Thompson, and I will be your booking agent today. How can I help you?
Mark: Hi Sarah, my name is Mark. I'm looking to book a trip for my wife and me. 
Sarah: Excellent. So, just to confirm for my records, the name of the booking agent assisting you is Sarah Thompson. And could I get a contact number from you, Mark?
Mark: Yes, my contact number is 077-843-9210.
Sarah: Thank you. What date are you planning to arrive at the resort?
Mark: We are hoping to arrive on the 15th of August.
Sarah: Perfect. Now, regarding accommodation, we have standard rooms, private cabins, and ocean view suites. What accommodation did you decide to choose?
Mark: Well, I wanted a standard room, but my wife really wanted something special, so we're going to choose the Ocean View Suite.
Sarah: Wonderful choice! And is there a main reason for this trip? Business or pleasure?
Mark: Definitely pleasure. It's actually our Anniversary, so we wanted to celebrate in style.

[PART 2]
Manager: Welcome to the Grand Resort, ladies and gentlemen. I'd like to briefly introduce you to our facilities so you know where everything is located. We have three main areas: the North Wing, the South Wing, and the Main Building. First, for those looking to take a dip, the Swimming Pool is located over in the South Wing. If you prefer to lift weights, our Gymnasium is situated right here in the Main Building. And for relaxation, the Spa Center can be found in the North Wing. 
Regarding dining, our breakfast buffet is highly recommended. It opens bright and early at 6 AM and it closes exactly at 10 AM, so don't be late! Also, please be aware that we maintain a dress code for evening meals. Guests must wear smart casual clothing in the dining hall. 

[PART 3]
Professor Smith: John, come in. Let's discuss your recent research assignment. It seems you struggled with it. 
John: Yes, Professor Smith. I thought I understood the prompt, and I definitely had enough resources. My main problem was simply the time constraints. I didn't have enough weeks to pull everything together properly.
Professor Smith: I see. Well, your draft has potential. I don't think you need to change your topic entirely. However, I strongly suggest that you rewrite the introduction so your thesis is clearer.
John: Okay, I can do that. As for the data, the primary focus of the research is on marine ecosystems, and we collected our data over a period of eighteen months.
Professor Smith: Yes, and the data itself is excellent. The findings are significant because they actually contradict previous theories regarding migration patterns. You should highlight that contradiction more strongly in your conclusion.

[PART 4]
Lecturer: Good afternoon, class. Today's lecture focuses on the evolution of structural engineering, specifically in bridge construction. Historically, early bridges were constructed primarily from wood and stone. However, the 19th century brought massive changes. The introduction of steel revolutionized structural engineering, allowing for much longer and stronger spans. 
When building these massive structures, especially in coastal areas, engineers had to carefully account for strong winds, which could create dangerous vibrations. Over the years, maintenance was a huge financial burden, but eventually, maintenance costs were reduced by applying a special coating that prevented rust. Looking ahead, the lecture concludes that future bridges will heavily rely on smart sensors to constantly monitor the health and stress levels of the structure in real-time.`;

listeningData = listeningData.map(q => {
  q.script = transcript;
  q.audio_asset = 'listening.mp3';
  return q;
});

fs.writeFileSync(listeningFile, JSON.stringify(listeningData, null, 2), 'utf8');

console.log('Successfully generated complete original IELTS datasets.');
